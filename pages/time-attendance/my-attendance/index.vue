<script setup lang="ts">
import { ref, computed, onBeforeUnmount, watch } from 'vue'
import {
  Clock, LogIn, LogOut, MapPin, CalendarCheck, Smartphone, Camera, ShieldCheck,
  Loader, Check, X, ScanFace, Crosshair, CheckCircle2, FileText, AlertCircle,
} from 'lucide-vue-next'
import { useAttendanceStore } from '~/stores/attendance'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('myAttendance')
useHead({ title: () => title.value })

const attendanceStore = useAttendanceStore()
const authStore = useAuthStore()

const meId = computed(() => authStore.user?.id ?? '1')
const today = new Date().toISOString().slice(0, 10)
const nowTime = ref(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
const timeIntervalRef = ref<number | null>(null)

if (typeof window !== 'undefined' && timeIntervalRef.value === null) {
  timeIntervalRef.value = window.setInterval(() => {
    nowTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }, 30_000)
}

const todayRecord = computed(() => attendanceStore.getTodayRecordByEmployee(meId.value, today))
const myRecords = computed(() =>
  attendanceStore.records
    .filter((r) => r.employeeId === meId.value)
    .sort((a, b) => b.date.localeCompare(a.date)),
)
const pagination = usePagination(myRecords, { pageSize: 10 })

const myStats = computed(() => {
  const ms = myRecords.value.filter((r) => r.date.slice(0, 7) === today.slice(0, 7))
  return {
    present: ms.filter((r) => r.status === 'present').length,
    late: ms.filter((r) => r.status === 'late').length,
    absent: ms.filter((r) => r.status === 'absent').length,
    wfh: ms.filter((r) => r.status === 'wfh').length,
  }
})

function statusTone(s: string): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (s === 'present') return 'good'
  if (s === 'late') return 'average'
  if (s === 'absent') return 'low'
  if (s === 'wfh') return 'primary'
  return 'muted'
}
function statusLabel(s: string) {
  return attendanceStore.statusOptions.find((o) => o.value === s)?.label ?? s
}

// ============================================================================
// VERIFICATION POPUP STATE (DUMMY GPS + FACE RECOGNITION)
// ============================================================================
type VerifyMode = 'in' | 'out'
type StepStatus = 'idle' | 'running' | 'success' | 'failed'
type Step = 'gps' | 'face' | 'done'

const showVerify = ref(false)
const verifyMode = ref<VerifyMode>('in')
const currentStep = ref<Step>('gps')
const gpsStatus = ref<StepStatus>('idle')
const faceStatus = ref<StepStatus>('idle')

// Simulated values (untuk tampilan natural)
const gpsLat = ref<string>('')
const gpsLng = ref<string>('')
const gpsAccuracy = ref<number>(0)
const gpsDistance = ref<number>(0)
const officeLabel = 'Jakarta HQ'
const faceConfidence = ref<number>(0)
const scanProgress = ref<number>(0)

// Camera stream untuk live preview wajah
const videoRef = ref<HTMLVideoElement | null>(null)
const streamRef = ref<MediaStream | null>(null)
const cameraError = ref<string>('')

const FAKE_OFFICE = { lat: -6.2088, lng: 106.8456 }

let scanTimer: number | null = null

async function startCamera() {
  cameraError.value = ''
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Browser tidak mendukung akses kamera.'
    return
  }
  try {
    if (streamRef.value) return
    streamRef.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    })
    // Wait next tick for video element to mount, then attach
    await new Promise((r) => setTimeout(r, 80))
    if (videoRef.value && streamRef.value) {
      videoRef.value.srcObject = streamRef.value
      await videoRef.value.play().catch(() => {})
    }
  } catch (err) {
    const code = (err as DOMException)?.name ?? ''
    if (code === 'NotAllowedError' || code === 'PermissionDeniedError') {
      cameraError.value = 'Akses kamera ditolak. Izinkan kamera untuk verifikasi wajah.'
    } else if (code === 'NotFoundError') {
      cameraError.value = 'Kamera tidak ditemukan.'
    } else {
      cameraError.value = 'Gagal mengakses kamera.'
    }
  }
}

function stopCamera() {
  streamRef.value?.getTracks().forEach((t) => t.stop())
  streamRef.value = null
  if (videoRef.value) videoRef.value.srcObject = null
}

function resetVerifyState() {
  currentStep.value = 'gps'
  gpsStatus.value = 'idle'
  faceStatus.value = 'idle'
  gpsLat.value = ''
  gpsLng.value = ''
  gpsAccuracy.value = 0
  gpsDistance.value = 0
  faceConfidence.value = 0
  scanProgress.value = 0
  cameraError.value = ''
}

function openVerify(mode: VerifyMode) {
  verifyMode.value = mode
  resetVerifyState()
  showVerify.value = true
  // Auto-start GPS check
  setTimeout(() => runGpsCheck(), 300)
}
function closeVerify() {
  showVerify.value = false
  if (scanTimer !== null) {
    window.clearInterval(scanTimer)
    scanTimer = null
  }
  stopCamera()
}

// Step 1: GPS check (dummy)
async function runGpsCheck() {
  gpsStatus.value = 'running'
  // Simulasi proses GPS: 1.6s, generate angka acak yang masuk akal
  await new Promise((r) => setTimeout(r, 1600))
  // Sedikit jitter dari titik kantor
  const jitterLat = (Math.random() - 0.5) * 0.001
  const jitterLng = (Math.random() - 0.5) * 0.001
  gpsLat.value = (FAKE_OFFICE.lat + jitterLat).toFixed(6)
  gpsLng.value = (FAKE_OFFICE.lng + jitterLng).toFixed(6)
  gpsAccuracy.value = 8 + Math.floor(Math.random() * 12) // 8-20m
  gpsDistance.value = Math.floor(Math.random() * 80) // 0-80m dari kantor
  gpsStatus.value = 'success'
  // Lanjut ke face setelah jeda — request kamera dulu agar user lihat dirinya
  setTimeout(async () => {
    currentStep.value = 'face'
    await startCamera()
    // Mulai scan setelah kamera aktif (atau langsung kalau gagal)
    setTimeout(() => runFaceCheck(), 400)
  }, 600)
}

// Step 2: Face recognition (dummy)
async function runFaceCheck() {
  faceStatus.value = 'running'
  scanProgress.value = 0
  // Simulasi scanning bar 2.4s
  return new Promise<void>((resolve) => {
    scanTimer = window.setInterval(() => {
      scanProgress.value += 4 + Math.floor(Math.random() * 4) // 4-7%
      if (scanProgress.value >= 100) {
        scanProgress.value = 100
        if (scanTimer !== null) {
          window.clearInterval(scanTimer)
          scanTimer = null
        }
        faceConfidence.value = 92 + Math.floor(Math.random() * 7) // 92-98%
        faceStatus.value = 'success'
        currentStep.value = 'done'
        resolve()
      }
    }, 80)
  })
}

function retryGps() {
  gpsStatus.value = 'idle'
  setTimeout(() => runGpsCheck(), 200)
}
async function retryFace() {
  faceStatus.value = 'idle'
  scanProgress.value = 0
  if (!streamRef.value) await startCamera()
  setTimeout(() => runFaceCheck(), 200)
}

// Final commit
function confirmAttendance() {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  const geoPayload = {
    lat: Number(gpsLat.value),
    lng: Number(gpsLng.value),
    accuracy: gpsAccuracy.value,
    capturedAt: new Date().toISOString(),
  }
  if (verifyMode.value === 'in') {
    attendanceStore.clockInLive({ employeeId: meId.value, date: today, time, photo: '', geo: geoPayload })
  } else {
    attendanceStore.clockOutLive({ employeeId: meId.value, date: today, time, photo: '', geo: geoPayload })
  }
  closeVerify()
}

onBeforeUnmount(() => {
  if (timeIntervalRef.value !== null) window.clearInterval(timeIntervalRef.value)
  if (scanTimer !== null) window.clearInterval(scanTimer)
  stopCamera()
})

const allDone = computed(() => gpsStatus.value === 'success' && faceStatus.value === 'success')

// ============================================================================
// REQUEST ATTENDANCE (fallback jika clock in/out gagal / tidak bisa)
// ============================================================================
type RequestKind = 'clock_in' | 'clock_out' | 'correction'

const showRequestModal = ref(false)
const requestKind = ref<RequestKind>('clock_in')
const requestCheckIn = ref('')
const requestCheckOut = ref('')
const requestReason = ref('')
const requestSubmitting = ref(false)
const requestMessage = ref('')

const pendingAttendanceRequest = computed(() =>
  attendanceStore.records.find(
    (r) =>
      r.employeeId === meId.value &&
      r.date === today &&
      r.approved === false &&
      (r.notes?.includes('[REQUEST_ATTENDANCE]') ?? false),
  ),
)

function resetRequestFieldsForKind(kind: RequestKind) {
  if (kind === 'clock_in') {
    requestCheckIn.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    requestCheckOut.value = ''
  } else if (kind === 'clock_out') {
    requestCheckIn.value = todayRecord.value?.checkIn ?? ''
    requestCheckOut.value = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  } else {
    requestCheckIn.value = todayRecord.value?.checkIn ?? ''
    requestCheckOut.value = todayRecord.value?.checkOut ?? ''
  }
}

function openRequestModal(kind: RequestKind) {
  requestKind.value = kind
  requestReason.value = ''
  requestMessage.value = ''
  resetRequestFieldsForKind(kind)
  showRequestModal.value = true
}

watch(requestKind, (kind) => {
  if (!showRequestModal.value) return
  resetRequestFieldsForKind(kind)
})

function closeRequestModal() {
  showRequestModal.value = false
  requestSubmitting.value = false
}

const requestValid = computed(() => {
  if (!requestReason.value.trim()) return false
  if (requestKind.value === 'clock_in' && !requestCheckIn.value.trim()) return false
  if (requestKind.value === 'clock_out') {
    if (!todayRecord.value?.checkIn) return false
    if (!requestCheckOut.value.trim()) return false
  }
  if (requestKind.value === 'correction') {
    if (!requestCheckIn.value.trim() && !requestCheckOut.value.trim()) return false
  }
  return true
})

function submitAttendanceRequest() {
  if (!requestValid.value || pendingAttendanceRequest.value) return
  requestSubmitting.value = true

  const kindLabel =
    requestKind.value === 'clock_in' ? 'clock_in' : requestKind.value === 'clock_out' ? 'clock_out' : 'correction'
  const note = `[REQUEST_ATTENDANCE] kind=${kindLabel}; reason=${requestReason.value.trim()}`

  const checkInVal =
    requestKind.value === 'clock_out'
      ? todayRecord.value?.checkIn
      : requestCheckIn.value.trim() || undefined
  const checkOutVal =
    requestKind.value === 'clock_in'
      ? undefined
      : requestCheckOut.value.trim() || undefined

  attendanceStore.addRecord({
    employeeId: meId.value,
    date: today,
    checkIn: checkInVal,
    checkOut: checkOutVal,
    status: 'present',
    notes: note,
    approved: false,
  })

  requestSubmitting.value = false
  requestMessage.value = 'Pengajuan attendance terkirim dan menunggu persetujuan atasan/HR.'
  showRequestModal.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Lakukan clock-in/clock-out dengan verifikasi GPS & wajah." />

    <!-- HERO CARD -->
    <div class="glass-card p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p class="text-sm text-muted-foreground">{{ formatDate(today) }}</p>
          <p class="text-4xl font-bold text-foreground">{{ nowTime }}</p>
          <div class="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
            <MapPin class="w-4 h-4" />
            <span>{{ officeLabel }} — verifikasi otomatis saat clock in/out</span>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <UiButton
            variant="gradient"
            size="lg"
            :disabled="!!todayRecord?.checkIn"
            @click="openVerify('in')"
          >
            <LogIn class="w-5 h-5" />
            <div class="text-left">
              <div class="text-xs opacity-90">Clock In</div>
              <div class="font-semibold">{{ todayRecord?.checkIn ?? 'Belum' }}</div>
            </div>
          </UiButton>
          <UiButton
            variant="outline"
            size="lg"
            :disabled="!todayRecord?.checkIn || !!todayRecord?.checkOut"
            @click="openVerify('out')"
          >
            <LogOut class="w-5 h-5" />
            <div class="text-left">
              <div class="text-xs opacity-90">Clock Out</div>
              <div class="font-semibold">{{ todayRecord?.checkOut ?? 'Belum' }}</div>
            </div>
          </UiButton>
        </div>
      </div>
    </div>

    <!-- REQUEST ATTENDANCE (fallback) -->
    <div class="rounded-xl border border-border bg-card/50 p-4 md:p-5 space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div class="flex gap-3">
          <div class="shrink-0 w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <FileText class="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 class="font-semibold text-foreground">Request attendance</h3>
            <p class="text-sm text-muted-foreground mt-0.5">
              Gunakan jika verifikasi clock in/out gagal (GPS/kamera), atau perlu koreksi waktu. Pengajuan akan masuk status
              <span class="font-medium text-foreground">pending approval</span>.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 shrink-0">
          <UiButton variant="outline" size="sm" :disabled="!!pendingAttendanceRequest || !!todayRecord?.checkIn" @click="openRequestModal('clock_in')">
            Ajukan clock in
          </UiButton>
          <UiButton variant="outline" size="sm" :disabled="!!pendingAttendanceRequest || !todayRecord?.checkIn || !!todayRecord?.checkOut" @click="openRequestModal('clock_out')">
            Ajukan clock out
          </UiButton>
          <UiButton variant="outline" size="sm" :disabled="!!pendingAttendanceRequest" @click="openRequestModal('correction')">
            Koreksi waktu
          </UiButton>
        </div>
      </div>
      <div
        v-if="pendingAttendanceRequest"
        class="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100"
      >
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5" />
        <span>Ada pengajuan untuk hari ini yang masih menunggu persetujuan. Tim akan mereview catatan di riwayat absensi.</span>
      </div>
      <div
        v-if="requestMessage"
        class="flex items-start gap-2 rounded-lg border border-score-good/30 bg-score-good/10 px-3 py-2 text-sm text-score-good"
      >
        <CheckCircle2 class="w-4 h-4 shrink-0 mt-0.5" />
        <span>{{ requestMessage }}</span>
      </div>
    </div>

    <!-- STATS -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Hadir bulan ini" :value="myStats.present" tone="good" :icon="CalendarCheck" />
      <UiStatCard label="Terlambat" :value="myStats.late" tone="average" :icon="Clock" />
      <UiStatCard label="Tidak hadir" :value="myStats.absent" tone="low" :icon="Camera" />
      <UiStatCard label="WFH" :value="myStats.wfh" tone="primary" :icon="Smartphone" />
    </div>

    <!-- HISTORY -->
    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border">
        <h3 class="font-semibold text-foreground">Riwayat Absensi</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Clock In</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Clock Out</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Catatan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagination.pagedItems.value" :key="r.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm text-foreground">{{ formatDate(r.date) }}</td>
              <td class="px-4 py-3 text-sm font-mono">{{ r.checkIn ?? '-' }}</td>
              <td class="px-4 py-3 text-sm font-mono">{{ r.checkOut ?? '-' }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="statusLabel(r.status)" :tone="statusTone(r.status)" /></td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ r.notes ?? '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        :icon="CalendarCheck"
        title="Belum ada riwayat absensi"
        description="Lakukan clock-in pertama untuk membuat catatan kehadiran."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="catatan"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <!-- VERIFICATION POPUP -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showVerify"
          class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          @click.self="closeVerify"
        >
          <div class="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-start justify-between gap-3 p-5 border-b border-border">
              <div>
                <h3 class="text-lg font-semibold text-foreground">
                  {{ verifyMode === 'in' ? 'Verifikasi Clock In' : 'Verifikasi Clock Out' }}
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">{{ formatDate(today) }} • {{ nowTime }}</p>
              </div>
              <button class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50" @click="closeVerify">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Stepper -->
            <div class="flex items-center gap-2 px-5 pt-4">
              <div :class="['flex items-center gap-2 text-xs font-medium', currentStep === 'gps' ? 'text-primary' : gpsStatus === 'success' ? 'text-score-good' : 'text-muted-foreground']">
                <span :class="['w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]', currentStep === 'gps' ? 'bg-primary text-primary-foreground' : gpsStatus === 'success' ? 'bg-score-good text-white' : 'bg-muted']">
                  <Check v-if="gpsStatus === 'success'" class="w-3 h-3" />
                  <span v-else>1</span>
                </span>
                Lokasi GPS
              </div>
              <div class="flex-1 h-px bg-border" />
              <div :class="['flex items-center gap-2 text-xs font-medium', currentStep === 'face' ? 'text-primary' : faceStatus === 'success' ? 'text-score-good' : 'text-muted-foreground']">
                <span :class="['w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]', currentStep === 'face' ? 'bg-primary text-primary-foreground' : faceStatus === 'success' ? 'bg-score-good text-white' : 'bg-muted']">
                  <Check v-if="faceStatus === 'success'" class="w-3 h-3" />
                  <span v-else>2</span>
                </span>
                Wajah
              </div>
              <div class="flex-1 h-px bg-border" />
              <div :class="['flex items-center gap-2 text-xs font-medium', currentStep === 'done' ? 'text-primary' : 'text-muted-foreground']">
                <span :class="['w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]', currentStep === 'done' ? 'bg-primary text-primary-foreground' : 'bg-muted']">3</span>
                Konfirmasi
              </div>
            </div>

            <!-- Body -->
            <div class="p-5 space-y-4 min-h-[20rem]">
              <!-- STEP 1: GPS -->
              <div v-show="currentStep === 'gps'">
                <div class="flex flex-col items-center text-center py-4">
                  <div class="relative w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crosshair v-if="gpsStatus !== 'running'" class="w-14 h-14 text-primary" />
                    <Loader v-else class="w-14 h-14 text-primary animate-spin" />
                    <div v-if="gpsStatus === 'running'" class="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-20" />
                  </div>
                  <h4 class="mt-4 font-semibold text-foreground">
                    {{ gpsStatus === 'running' ? 'Mendeteksi lokasi Anda...' : gpsStatus === 'success' ? 'Lokasi terverifikasi' : 'Memulai...' }}
                  </h4>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ gpsStatus === 'running' ? 'Memastikan Anda berada di area kantor.' : 'Sistem akan memvalidasi posisi GPS Anda.' }}
                  </p>
                </div>

                <div v-if="gpsStatus === 'success'" class="rounded-xl border border-score-good/40 bg-score-good/10 p-3 space-y-2">
                  <div class="flex items-center gap-2 text-sm font-semibold text-score-good">
                    <CheckCircle2 class="w-4 h-4" />
                    Anda berada di {{ officeLabel }}
                  </div>
                  <dl class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt class="text-muted-foreground">Latitude</dt>
                      <dd class="font-mono text-foreground">{{ gpsLat }}</dd>
                    </div>
                    <div>
                      <dt class="text-muted-foreground">Longitude</dt>
                      <dd class="font-mono text-foreground">{{ gpsLng }}</dd>
                    </div>
                    <div>
                      <dt class="text-muted-foreground">Akurasi</dt>
                      <dd class="font-mono text-foreground">±{{ gpsAccuracy }} m</dd>
                    </div>
                    <div>
                      <dt class="text-muted-foreground">Jarak ke kantor</dt>
                      <dd class="font-mono text-foreground">{{ gpsDistance }} m</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <!-- STEP 2: FACE -->
              <div v-show="currentStep === 'face'">
                <div class="flex flex-col items-center text-center py-2">
                  <!-- Camera frame with live video -->
                  <div class="relative w-64 h-64 rounded-2xl bg-black border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
                    <!-- Live camera feed (mirrored) -->
                    <video
                      ref="videoRef"
                      class="absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)]"
                      autoplay
                      muted
                      playsinline
                    />
                    <!-- Fallback when camera not available -->
                    <div v-if="cameraError && !streamRef" class="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 p-4">
                      <ScanFace class="w-14 h-14 text-muted-foreground/60" />
                      <p class="text-[10px] text-destructive mt-2 text-center">{{ cameraError }}</p>
                    </div>
                    <!-- Scanning line animation -->
                    <div
                      v-if="faceStatus === 'running'"
                      class="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-20"
                      :style="{ top: `${scanProgress}%`, transition: 'top 0.08s linear' }"
                    />
                    <!-- Face detection brackets -->
                    <div class="absolute inset-6 pointer-events-none z-10">
                      <div class="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] rounded-tl" :class="faceStatus === 'success' ? 'border-score-good' : 'border-primary'" />
                      <div class="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] rounded-tr" :class="faceStatus === 'success' ? 'border-score-good' : 'border-primary'" />
                      <div class="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] rounded-bl" :class="faceStatus === 'success' ? 'border-score-good' : 'border-primary'" />
                      <div class="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] rounded-br" :class="faceStatus === 'success' ? 'border-score-good' : 'border-primary'" />
                    </div>
                    <!-- Success overlay -->
                    <div v-if="faceStatus === 'success'" class="absolute inset-0 bg-score-good/30 backdrop-blur-[2px] flex items-center justify-center z-30">
                      <div class="w-16 h-16 rounded-full bg-score-good flex items-center justify-center shadow-lg">
                        <Check class="w-9 h-9 text-white" />
                      </div>
                    </div>
                    <!-- Live indicator -->
                    <div v-if="streamRef && faceStatus !== 'success'" class="absolute top-2 left-2 z-20 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span class="text-[10px] font-semibold text-white">LIVE</span>
                    </div>
                  </div>
                  <h4 class="mt-4 font-semibold text-foreground">
                    {{ faceStatus === 'running' ? 'Memindai wajah Anda...' : faceStatus === 'success' ? 'Wajah terverifikasi' : 'Mengaktifkan kamera...' }}
                  </h4>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ faceStatus === 'running' ? 'Posisikan wajah di tengah kotak dan tahan sebentar.' : faceStatus === 'success' ? 'Sistem berhasil mencocokkan wajah dengan profil Anda.' : 'Mohon izinkan akses kamera saat diminta browser.' }}
                  </p>

                  <!-- Progress bar -->
                  <div v-if="faceStatus === 'running'" class="mt-4 w-full max-w-xs">
                    <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div class="h-full bg-primary transition-all" :style="{ width: `${scanProgress}%` }" />
                    </div>
                    <p class="text-[10px] text-muted-foreground mt-1 text-right font-mono">{{ scanProgress }}%</p>
                  </div>
                </div>

                <div v-if="faceStatus === 'success'" class="rounded-xl border border-score-good/40 bg-score-good/10 p-3 space-y-1">
                  <div class="flex items-center gap-2 text-sm font-semibold text-score-good">
                    <CheckCircle2 class="w-4 h-4" />
                    Wajah cocok dengan profil
                  </div>
                  <p class="text-xs text-muted-foreground">Confidence: <span class="font-mono font-semibold text-foreground">{{ faceConfidence }}%</span></p>
                </div>
              </div>

              <!-- STEP 3: CONFIRM -->
              <div v-show="currentStep === 'done'" class="py-2 space-y-3">
                <div class="flex flex-col items-center text-center pb-2">
                  <div class="w-16 h-16 rounded-full bg-score-good/20 flex items-center justify-center">
                    <CheckCircle2 class="w-9 h-9 text-score-good" />
                  </div>
                  <h4 class="mt-3 font-semibold text-foreground">Verifikasi berhasil</h4>
                  <p class="text-xs text-muted-foreground mt-0.5">Tinjau ringkasan dan tekan tombol untuk menyelesaikan.</p>
                </div>

                <div class="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground flex items-center gap-2"><MapPin class="w-3.5 h-3.5" /> Lokasi</span>
                    <span class="font-medium text-foreground">{{ officeLabel }} ({{ gpsDistance }}m)</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground flex items-center gap-2"><ScanFace class="w-3.5 h-3.5" /> Wajah</span>
                    <span class="font-medium text-foreground">Cocok ({{ faceConfidence }}%)</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground flex items-center gap-2"><Clock class="w-3.5 h-3.5" /> Waktu</span>
                    <span class="font-mono font-medium text-foreground">{{ nowTime }}</span>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground flex items-center gap-2"><ShieldCheck class="w-3.5 h-3.5" /> Mode</span>
                    <span class="font-medium text-foreground">{{ verifyMode === 'in' ? 'Clock In' : 'Clock Out' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-2 p-5 border-t border-border">
              <div class="flex items-center gap-2">
                <UiButton v-if="currentStep === 'gps' && gpsStatus === 'failed'" variant="outline" size="sm" @click="retryGps">Retry GPS</UiButton>
                <UiButton v-if="currentStep === 'face' && faceStatus === 'failed'" variant="outline" size="sm" @click="retryFace">Retry Wajah</UiButton>
              </div>
              <div class="flex items-center gap-2 ml-auto">
                <UiButton variant="outline" @click="closeVerify">Batal</UiButton>
                <UiButton variant="gradient" :disabled="!allDone" @click="confirmAttendance">
                  <CheckCircle2 class="w-4 h-4" />
                  {{ verifyMode === 'in' ? 'Konfirmasi Clock In' : 'Konfirmasi Clock Out' }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <UiModal
      :open="showRequestModal"
      title="Request attendance"
      description="Isi data yang diajukan. Setelah disetujui atasan/HR, catatan akan diperbarui."
      size="lg"
      @update:open="showRequestModal = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Jenis pengajuan">
          <UiSelect
            v-model="requestKind"
            :options="[
              { value: 'clock_in', label: 'Clock in (manual)' },
              { value: 'clock_out', label: 'Clock out (manual)' },
              { value: 'correction', label: 'Koreksi waktu' },
            ]"
          />
        </UiFormField>

        <div v-if="requestKind === 'clock_in'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Jam clock in (diajukan)" required>
            <UiInput v-model="requestCheckIn" type="time" />
          </UiFormField>
        </div>

        <div v-else-if="requestKind === 'clock_out'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Clock in (referensi)">
            <UiInput :model-value="todayRecord?.checkIn ?? ''" disabled />
          </UiFormField>
          <UiFormField label="Jam clock out (diajukan)" required>
            <UiInput v-model="requestCheckOut" type="time" />
          </UiFormField>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Jam clock in (koreksi)">
            <UiInput v-model="requestCheckIn" type="time" />
          </UiFormField>
          <UiFormField label="Jam clock out (koreksi)">
            <UiInput v-model="requestCheckOut" type="time" />
          </UiFormField>
        </div>

        <UiFormField label="Alasan / kronologi" required>
          <UiTextarea v-model="requestReason" rows="3" placeholder="Contoh: GPS error, kamera tidak terbaca, atau lupa clock out." />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="closeRequestModal">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!requestValid || !!pendingAttendanceRequest || requestSubmitting" @click="submitAttendanceRequest">
          Kirim pengajuan
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>
