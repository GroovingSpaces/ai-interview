<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Camera, MapPin, Clock3, LogIn, LogOut, RefreshCcw, X } from 'lucide-vue-next'
import { useAttendanceStore } from '~/stores/attendance'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const attendanceStore = useAttendanceStore()
const { currentUserEmployeeId } = useApprovalPermission()
const { t } = useI18n()

const videoRef = ref<HTMLVideoElement | null>(null)
const streamRef = ref<MediaStream | null>(null)
const capturedPhoto = ref<string | null>(null)
const geoPoint = ref<{ lat: number; lng: number; accuracy?: number; capturedAt: string } | null>(null)
const isCameraLoading = ref(false)
const isGeoLoading = ref(false)
const errorMessage = ref('')
const geoInfoMessage = ref('')
const LAST_GEO_KEY = 'attendance_last_geo'

const today = computed(() => new Date().toISOString().split('T')[0])
const currentTime = computed(() => {
  const date = new Date()
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
})

const todayRecord = computed(() => {
  const employeeId = currentUserEmployeeId.value
  if (!employeeId) return undefined
  return attendanceStore.getTodayRecordByEmployee(employeeId, today.value)
})

const canClockIn = computed(() => !!currentUserEmployeeId.value && !todayRecord.value?.checkIn)
const canClockOut = computed(() => !!currentUserEmployeeId.value && !!todayRecord.value?.checkIn && !todayRecord.value?.checkOut)
const todayStatusText = computed(() => {
  const checkInText = todayRecord.value?.checkIn
    ? t('attendance.live.statusIn', { time: todayRecord.value.checkIn })
    : t('attendance.live.notClockedIn')
  const checkOutText = todayRecord.value?.checkOut
    ? t('attendance.live.statusOut', { time: todayRecord.value.checkOut })
    : t('attendance.live.notClockedOut')
  return `${checkInText} | ${checkOutText}`
})

async function initCamera() {
  errorMessage.value = ''
  isCameraLoading.value = true
  try {
    stopCamera()
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
    streamRef.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
  } catch {
    errorMessage.value = t('attendance.live.errorCameraAccess')
  } finally {
    isCameraLoading.value = false
  }
}

function stopCamera() {
  if (!streamRef.value) return
  streamRef.value.getTracks().forEach((track) => track.stop())
  streamRef.value = null
}

function mapGeoError(err: GeolocationPositionError | null): string {
  if (!err) return t('attendance.live.errorGeoUnavailable')
  if (err.code === err.PERMISSION_DENIED) return t('attendance.live.errorGeoDenied')
  if (err.code === err.POSITION_UNAVAILABLE) return t('attendance.live.errorGeoPositionUnavailable')
  if (err.code === err.TIMEOUT) return t('attendance.live.errorGeoTimeout')
  return t('attendance.live.errorGeoUnavailable')
}

function getCurrentPositionOnce(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}

function watchPositionOnce(options: PositionOptions, timeoutMs = 12000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    let resolved = false
    const watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        if (resolved) return
        resolved = true
        navigator.geolocation.clearWatch(watcherId)
        resolve(pos)
      },
      (err) => {
        if (resolved) return
        resolved = true
        navigator.geolocation.clearWatch(watcherId)
        reject(err)
      },
      options
    )

    setTimeout(() => {
      if (resolved) return
      resolved = true
      navigator.geolocation.clearWatch(watcherId)
      reject(new Error('watch_timeout'))
    }, timeoutMs)
  })
}

function saveLastGeo(point: { lat: number; lng: number; accuracy?: number; capturedAt: string }) {
  try {
    localStorage.setItem(LAST_GEO_KEY, JSON.stringify(point))
  } catch {
    // ignore storage issues
  }
}

function loadLastGeo(): { lat: number; lng: number; accuracy?: number; capturedAt: string } | null {
  try {
    const raw = localStorage.getItem(LAST_GEO_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.lat !== 'number' || typeof parsed?.lng !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

async function fetchLocation() {
  errorMessage.value = ''
  geoInfoMessage.value = ''
  if (!navigator.geolocation) {
    errorMessage.value = t('attendance.live.errorGeoNotSupported')
    return
  }

  isGeoLoading.value = true
  try {
    // Best-effort preflight permission check (not supported in all browsers)
    if (navigator.permissions?.query) {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      if (status.state === 'denied') {
        errorMessage.value = t('attendance.live.errorGeoBlocked')
        return
      }
    }

    // Multi-attempt strategy: strict GPS -> balanced -> cached fallback
    // Try watchPosition first (usually more reliable on some devices),
    // then fallback to getCurrentPosition with multiple option profiles.
    const attempts: PositionOptions[] = [
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: Infinity },
    ]

    let pos: GeolocationPosition | null = null
    let lastErr: GeolocationPositionError | null = null

    try {
      pos = await watchPositionOnce({ enableHighAccuracy: true, maximumAge: 0 }, 12000)
    } catch (err) {
      if ((err as GeolocationPositionError)?.code) {
        lastErr = err as GeolocationPositionError
      }
    }

    for (const options of attempts) {
      if (pos) break
      try {
        pos = await getCurrentPositionOnce(options)
        break
      } catch (err) {
        lastErr = err as GeolocationPositionError
        // If permission denied, no need to retry other strategies
        if (lastErr?.code === lastErr.PERMISSION_DENIED) break
      }
    }

    // iOS/macOS CoreLocation can transiently return "location unknown" (mapped to POSITION_UNAVAILABLE).
    // Retry a few times with small backoff before treating it as a real failure.
    if (!pos && lastErr?.code === lastErr.POSITION_UNAVAILABLE) {
      const retryDelays = [800, 1500, 2500]
      for (const delay of retryDelays) {
        await new Promise(resolve => setTimeout(resolve, delay))
        try {
          pos = await getCurrentPositionOnce({ enableHighAccuracy: false, timeout: 15000, maximumAge: 120000 })
          if (pos) break
        } catch (retryErr) {
          const ge = retryErr as GeolocationPositionError
          lastErr = ge?.code ? ge : lastErr
        }
      }
    }

    if (!pos) throw lastErr

    geoPoint.value = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      capturedAt: new Date().toISOString(),
    }
    saveLastGeo(geoPoint.value)
  } catch (err) {
    const cached = loadLastGeo()
    if (cached) {
      geoPoint.value = {
        lat: cached.lat,
        lng: cached.lng,
        accuracy: cached.accuracy,
        capturedAt: new Date().toISOString(),
      }
      geoInfoMessage.value = t('attendance.live.infoGeoFallback')
    } else {
      errorMessage.value = mapGeoError(err as GeolocationPositionError)
    }
  } finally {
    isGeoLoading.value = false
  }
}

function captureFace() {
  errorMessage.value = ''
  const video = videoRef.value
  if (!video || !video.videoWidth || !video.videoHeight) {
    errorMessage.value = t('attendance.live.errorCameraNotReady')
    return
  }
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.85)
}

function refreshEvidence() {
  capturedPhoto.value = null
  geoPoint.value = null
  fetchLocation()
}

function validateEvidence() {
  if (!capturedPhoto.value) {
    errorMessage.value = t('attendance.live.errorFaceRequired')
    return false
  }
  if (!geoPoint.value) {
    errorMessage.value = t('attendance.live.errorGeoEvidenceRequired')
    return false
  }
  return true
}

function clockIn() {
  errorMessage.value = ''
  const employeeId = currentUserEmployeeId.value
  if (!employeeId) {
    errorMessage.value = t('attendance.live.errorEmployeeNotFound')
    return
  }
  if (!validateEvidence()) return
  const result = attendanceStore.clockInLive({
    employeeId,
    date: today.value,
    time: currentTime.value,
    photo: capturedPhoto.value!,
    geo: geoPoint.value!,
  })
  if (!result.ok) {
    errorMessage.value = result.reason === 'already_clocked_in'
      ? t('attendance.live.errorAlreadyClockedIn')
      : t('attendance.live.errorClockInFailed')
    return
  }
  emit('close')
}

function clockOut() {
  errorMessage.value = ''
  const employeeId = currentUserEmployeeId.value
  if (!employeeId) {
    errorMessage.value = t('attendance.live.errorEmployeeNotFound')
    return
  }
  if (!validateEvidence()) return
  const result = attendanceStore.clockOutLive({
    employeeId,
    date: today.value,
    time: currentTime.value,
    photo: capturedPhoto.value!,
    geo: geoPoint.value!,
  })
  if (!result.ok) {
    if (result.reason === 'clock_in_required') errorMessage.value = t('attendance.live.errorClockInRequired')
    else if (result.reason === 'already_clocked_out') errorMessage.value = t('attendance.live.errorAlreadyClockedOut')
    else errorMessage.value = t('attendance.live.errorClockOutFailed')
    return
  }
  emit('close')
}

function closeModal() {
  emit('close')
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      errorMessage.value = ''
      capturedPhoto.value = null
      geoPoint.value = null
      initCamera()
      fetchLocation() // automatic; no user adjustment UI
    } else {
      stopCamera()
    }
  }
)

onBeforeUnmount(() => {
  stopCamera()
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal" />
        <div class="relative w-full max-w-3xl bg-card border border-border rounded-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-bold text-foreground">{{ t('attendance.live.title') }}</h2>
              <p class="text-sm text-muted-foreground">{{ t('attendance.live.subtitle') }}</p>
            </div>
            <button type="button" class="p-2 rounded-lg hover:bg-muted/50" @click="closeModal">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="rounded-xl border border-border p-3">
              <p class="text-xs text-muted-foreground">{{ t('attendance.live.date') }}</p>
              <p class="text-sm font-semibold text-foreground">{{ today }}</p>
            </div>
            <div class="rounded-xl border border-border p-3">
              <p class="text-xs text-muted-foreground">{{ t('attendance.live.time') }}</p>
              <p class="text-sm font-semibold text-foreground">{{ currentTime }}</p>
            </div>
            <div class="rounded-xl border border-border p-3">
              <p class="text-xs text-muted-foreground">{{ t('attendance.live.todayStatus') }}</p>
              <p class="text-sm text-foreground">{{ todayStatusText }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-semibold text-foreground">{{ t('attendance.live.facePhoto') }}</h3>
                <UiButton variant="outline" size="sm" :disabled="isCameraLoading" @click="initCamera">
                  <RefreshCcw class="w-4 h-4" />
                  {{ t('attendance.live.refresh') }}
                </UiButton>
              </div>
              <div class="rounded-xl border border-border overflow-hidden bg-black/70">
                <video ref="videoRef" autoplay playsinline muted class="w-full aspect-video object-cover" />
              </div>
              <UiButton variant="outline" @click="captureFace">
                <Camera class="w-4 h-4" />
                {{ t('attendance.live.captureFace') }}
              </UiButton>
              <img v-if="capturedPhoto" :src="capturedPhoto" :alt="t('attendance.live.faceCaptureAlt')" class="w-44 h-28 rounded-lg object-cover border border-border" />
            </div>

            <div class="space-y-3">
              <h3 class="font-semibold text-foreground">{{ t('attendance.live.geoAuto') }}</h3>
              <div class="rounded-xl border border-border p-4 bg-muted/20">
                <p class="text-xs text-muted-foreground mb-2">{{ t('attendance.live.coordinates') }}</p>
                <template v-if="geoPoint">
                  <p class="text-sm text-foreground">Lat: {{ geoPoint.lat.toFixed(6) }}</p>
                  <p class="text-sm text-foreground">Lng: {{ geoPoint.lng.toFixed(6) }}</p>
                  <p class="text-xs text-muted-foreground mt-1">{{ t('attendance.live.accuracy', { value: Math.round(geoPoint.accuracy || 0) }) }}</p>
                </template>
                <p v-else class="text-sm text-muted-foreground">
                  <MapPin class="inline w-3.5 h-3.5 mr-1" />
                  {{ isGeoLoading ? t('attendance.live.detectingLocation') : t('attendance.live.locationUnavailable') }}
                </p>
              </div>
              <UiButton variant="outline" @click="refreshEvidence">
                <RefreshCcw class="w-4 h-4" />
                {{ t('attendance.live.refreshEvidence') }}
              </UiButton>
            </div>
          </div>

          <div v-if="errorMessage" class="rounded-lg border border-score-low/30 bg-score-low/10 text-score-low text-sm p-3">
            {{ errorMessage }}
          </div>
          <div v-if="geoInfoMessage" class="rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 text-sm p-3">
            {{ geoInfoMessage }}
          </div>

          <div class="flex flex-wrap gap-2 pt-1">
            <UiButton variant="gradient" :disabled="!canClockIn" @click="clockIn">
              <LogIn class="w-4 h-4" />
              {{ t('attendance.checkIn') }}
            </UiButton>
            <UiButton variant="gradient" :disabled="!canClockOut" @click="clockOut">
              <LogOut class="w-4 h-4" />
              {{ t('attendance.checkOut') }}
            </UiButton>
            <p class="text-xs text-muted-foreground self-center">
              <Clock3 class="inline w-3.5 h-3.5 mr-1" />
              {{ t('attendance.live.geoAutoNote') }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
