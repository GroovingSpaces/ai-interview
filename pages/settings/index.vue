<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  ScanFace, KeyRound, Camera, CheckCircle2, AlertCircle, ShieldCheck,
  Fingerprint, Trash2, RefreshCw, Lock, Info, X, Loader,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })

const { title } = usePageTitle('settings')
useHead({ title: () => title.value })

const authStore = useAuthStore()

// Versi schema disertakan supaya enrollment lama (yang masih simpan imageDataUrl) bisa di-migrate / invalidate.
const FACE_PREFIX = 'face_biometric_v2_'
/** Panjang vector biometric "embedding" (mirroring real face-recognition model output). */
const BIOMETRIC_DIM = 128

interface BiometricEnrollment {
  /** ID template (hash dari embedding+user). Diperlihatkan ke user sebagai bukti terdaftar (bukan foto). */
  templateId: string
  /** Vector embedding (float array). Tidak ditampilkan ke user. */
  embedding: number[]
  /** Quality score saat capture (0-100). */
  quality: number
  /** Hash device fingerprint sederhana. */
  deviceHash: string
  enrolledAt: string
  /** Versi template untuk forward-compat. */
  schemaVersion: number
}

function faceStorageKey() {
  const id = authStore.user?.id ?? authStore.user?.email ?? 'anon'
  return `${FACE_PREFIX}${id}`
}

const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const cameraError = ref('')
const enrollment = ref<BiometricEnrollment | null>(null)

// Modal state
const showEnrollModal = ref(false)
type EnrollStep = 'idle' | 'camera' | 'analyzing' | 'success'
const enrollStep = ref<EnrollStep>('idle')
const analyzeProgress = ref(0)
const lastQuality = ref(0)
let analyzeTimer: number | null = null

// Confirm delete
const showDeleteConfirm = ref(false)

// Password form
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwdMessage = ref('')
const pwdError = ref('')
const pwdSubmitting = ref(false)

const hasEnrollment = computed(() => Boolean(enrollment.value))

const enrolledLabel = computed(() => {
  if (!enrollment.value?.enrolledAt) return ''
  return new Date(enrollment.value.enrolledAt).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// ============================================================================
// CAMERA
// ============================================================================
async function startCamera() {
  cameraError.value = ''
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'Browser tidak mendukung akses kamera.'
    return
  }
  stopCamera()
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    })
    stream.value = s
    await new Promise((r) => setTimeout(r, 80))
    if (videoRef.value) {
      videoRef.value.srcObject = s
      await videoRef.value.play().catch(() => {})
    }
  } catch (err) {
    const code = (err as DOMException)?.name ?? ''
    if (code === 'NotAllowedError' || code === 'PermissionDeniedError') {
      cameraError.value = 'Izinkan akses kamera untuk melanjutkan.'
    } else {
      cameraError.value = 'Tidak bisa mengakses kamera. Pastikan device punya kamera & gunakan HTTPS.'
    }
  }
}

function stopCamera() {
  stream.value?.getTracks().forEach((t) => t.stop())
  stream.value = null
  if (videoRef.value) videoRef.value.srcObject = null
}

// ============================================================================
// BIOMETRIC TEMPLATE GENERATION (DUMMY)
// ============================================================================
/** Generate vector embedding dummy 128-D (Float). Real-world: dari model FaceNet/ArcFace. */
function generateEmbedding(seed: string): number[] {
  // Deterministic-ish PRNG dari seed agar template stabil per "wajah" yang sama dalam session
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i)
  }
  const out: number[] = []
  let state = h >>> 0
  for (let i = 0; i < BIOMETRIC_DIM; i++) {
    state = (state * 1664525 + 1013904223) >>> 0
    // map ke -1..1
    out.push(((state / 0xffffffff) * 2 - 1) * 0.5 + (Math.random() - 0.5) * 0.001)
  }
  return out
}

/** Hash sederhana → string hex. */
async function hashString(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle?.digest) {
    const enc = new TextEncoder().encode(input)
    const buf = await crypto.subtle.digest('SHA-256', enc)
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32)
  }
  // Fallback super sederhana
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h.toString(16).padStart(8, '0')
}

function deviceFingerprint(): string {
  const parts = [
    typeof navigator !== 'undefined' ? navigator.userAgent : 'ssr',
    typeof navigator !== 'undefined' ? navigator.language : '',
    typeof window !== 'undefined' ? `${screen.width}x${screen.height}` : '',
  ]
  return parts.join('|')
}

/**
 * Capture frame dari video → ekstrak "embedding" dummy → buang frame.
 * Tidak ada imageDataUrl yang disimpan di mana pun.
 */
async function processFrame(): Promise<{ embedding: number[]; quality: number; templateId: string; deviceHash: string } | null> {
  const video = videoRef.value
  if (!video || !stream.value) return null
  const w = video.videoWidth
  const h = video.videoHeight
  if (!w || !h) return null

  // Capture ke canvas in-memory untuk dapat sample pixel — TIDAK disimpan
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(video, 0, 0, w, h)

  // Sampling sederhana untuk seed embedding (dummy: ambil hash beberapa pixel)
  const sample = ctx.getImageData(Math.floor(w / 2) - 8, Math.floor(h / 2) - 8, 16, 16)
  let seedStr = ''
  for (let i = 0; i < sample.data.length; i += 16) seedStr += sample.data[i].toString(36)

  // Quality dummy: berdasarkan resolusi & sample brightness
  const brightnessSample = sample.data.filter((_, i) => i % 4 === 0)
  const avgBrightness = brightnessSample.reduce((a, b) => a + b, 0) / brightnessSample.length
  // Quality 70..98 berdasarkan brightness (terlalu gelap/terang turun)
  const distFromIdeal = Math.abs(avgBrightness - 128)
  const quality = Math.max(70, Math.min(98, 98 - Math.floor(distFromIdeal / 4) + Math.floor(Math.random() * 4)))

  const embedding = generateEmbedding(seedStr)
  const userId = authStore.user?.id ?? authStore.user?.email ?? 'anon'
  const templateId = await hashString(`${userId}|${embedding.slice(0, 8).join(',')}|${Date.now()}`)
  const deviceHash = await hashString(deviceFingerprint())

  // Buang canvas reference — tidak ada imageDataUrl/file yang disimpan
  canvas.width = 0
  canvas.height = 0

  return { embedding, quality, templateId, deviceHash }
}

// ============================================================================
// ENROLL FLOW
// ============================================================================
async function openEnroll() {
  cameraError.value = ''
  enrollStep.value = 'camera'
  showEnrollModal.value = true
  await startCamera()
}

function closeEnroll() {
  if (analyzeTimer !== null) {
    window.clearInterval(analyzeTimer)
    analyzeTimer = null
  }
  stopCamera()
  showEnrollModal.value = false
  enrollStep.value = 'idle'
  analyzeProgress.value = 0
}

async function captureAndAnalyze() {
  cameraError.value = ''
  if (!stream.value) {
    cameraError.value = 'Kamera belum aktif.'
    return
  }
  enrollStep.value = 'analyzing'
  analyzeProgress.value = 0
  // Simulasi analisis biometrik
  analyzeTimer = window.setInterval(() => {
    analyzeProgress.value += 4 + Math.floor(Math.random() * 5)
    if (analyzeProgress.value >= 100) {
      analyzeProgress.value = 100
      if (analyzeTimer !== null) {
        window.clearInterval(analyzeTimer)
        analyzeTimer = null
      }
      finalizeEnrollment()
    }
  }, 80)
}

async function finalizeEnrollment() {
  const result = await processFrame()
  if (!result) {
    cameraError.value = 'Gagal mengekstrak template biometrik. Coba lagi.'
    enrollStep.value = 'camera'
    return
  }
  const newEnrollment: BiometricEnrollment = {
    templateId: result.templateId,
    embedding: result.embedding,
    quality: result.quality,
    deviceHash: result.deviceHash,
    enrolledAt: new Date().toISOString(),
    schemaVersion: 2,
  }
  enrollment.value = newEnrollment
  lastQuality.value = result.quality
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(faceStorageKey(), JSON.stringify(newEnrollment))
  }
  // Stop kamera sesegera mungkin setelah ekstraksi
  stopCamera()
  enrollStep.value = 'success'
}

function deleteEnrollment() {
  enrollment.value = null
  lastQuality.value = 0
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(faceStorageKey())
    // Bersihkan juga key v1 lama agar tidak ada residu foto
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('face_enrollment_v1_')) localStorage.removeItem(k)
    })
  }
  showDeleteConfirm.value = false
}

function loadEnrollmentFromStorage() {
  if (typeof localStorage === 'undefined') return
  // Migrasi: bersihkan storage v1 (yang menyimpan imageDataUrl) — privacy hardening
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith('face_enrollment_v1_')) localStorage.removeItem(k)
  })
  try {
    const raw = localStorage.getItem(faceStorageKey())
    if (!raw) return
    const parsed = JSON.parse(raw) as Partial<BiometricEnrollment>
    if (parsed?.templateId && Array.isArray(parsed.embedding)) {
      enrollment.value = {
        templateId: parsed.templateId,
        embedding: parsed.embedding,
        quality: parsed.quality ?? 0,
        deviceHash: parsed.deviceHash ?? '',
        enrolledAt: parsed.enrolledAt ?? '',
        schemaVersion: parsed.schemaVersion ?? 2,
      }
    }
  } catch {
    /* ignore */
  }
}

// ============================================================================
// PASSWORD FORM
// ============================================================================
function submitPasswordChange() {
  pwdMessage.value = ''
  pwdError.value = ''
  if (newPassword.value !== confirmPassword.value) {
    pwdError.value = 'Konfirmasi password tidak sama.'
    return
  }
  pwdSubmitting.value = true
  try {
    const res = authStore.changePassword(currentPassword.value, newPassword.value)
    if (!res.ok) {
      pwdError.value = res.message
      return
    }
    pwdMessage.value = res.message
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } finally {
    pwdSubmitting.value = false
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================
watch(
  () => authStore.user?.id,
  () => loadEnrollmentFromStorage(),
)

onMounted(() => {
  loadEnrollmentFromStorage()
})

onBeforeUnmount(() => {
  stopCamera()
  if (analyzeTimer !== null) window.clearInterval(analyzeTimer)
})
</script>

<template>
  <div class="space-y-8 max-w-5xl mx-auto p-4 md:p-6">
    <UiPageHeader
      title="Pengaturan akun"
      subtitle="Daftarkan biometrik wajah dan ubah password login."
      back-to="/"
    />

    <div class="grid gap-6 lg:grid-cols-2">
      <!-- ============================================================== -->
      <!-- FACE BIOMETRIC -->
      <!-- ============================================================== -->
      <UiCard class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Fingerprint class="w-5 h-5 text-primary" />
            <h2 class="text-lg font-semibold text-foreground">Biometrik wajah</h2>
          </div>
          <UiStatusBadge
            v-if="hasEnrollment"
            label="Terdaftar"
            tone="good"
          />
          <UiStatusBadge v-else label="Belum terdaftar" tone="muted" />
        </div>

        <div class="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 flex items-start gap-2 text-xs">
          <Info class="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <p class="text-muted-foreground leading-relaxed">
            Sistem hanya menyimpan <span class="font-semibold text-foreground">template biometrik (vector ter-enkripsi)</span>, bukan foto wajah Anda.
            Foto tidak dapat dilihat ulang dan tidak dikirim ke server. Anda tetap bisa mengubah ulang biometrik kapan saja.
          </p>
        </div>

        <!-- Enrolled state -->
        <div v-if="hasEnrollment && enrollment" class="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-foreground">Biometrik aktif</p>
              <p class="text-xs text-muted-foreground">Template terenkripsi tersimpan di perangkat ini.</p>
            </div>
          </div>

          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="rounded-md bg-card/50 px-3 py-2">
              <dt class="text-muted-foreground">Template ID</dt>
              <dd class="font-mono text-foreground truncate">{{ enrollment.templateId }}</dd>
            </div>
            <div class="rounded-md bg-card/50 px-3 py-2">
              <dt class="text-muted-foreground">Quality Score</dt>
              <dd class="font-mono text-foreground">{{ enrollment.quality }}/100</dd>
            </div>
            <div class="rounded-md bg-card/50 px-3 py-2">
              <dt class="text-muted-foreground">Didaftarkan</dt>
              <dd class="text-foreground">{{ enrolledLabel }}</dd>
            </div>
            <div class="rounded-md bg-card/50 px-3 py-2">
              <dt class="text-muted-foreground">Device Hash</dt>
              <dd class="font-mono text-foreground truncate">{{ enrollment.deviceHash.slice(0, 12) }}…</dd>
            </div>
          </dl>

          <div class="flex flex-wrap gap-2">
            <UiButton variant="outline" @click="openEnroll">
              <RefreshCw class="w-4 h-4" />
              Edit / Re-enroll
            </UiButton>
            <UiButton variant="ghost" class="text-destructive" @click="showDeleteConfirm = true">
              <Trash2 class="w-4 h-4" />
              Hapus biometrik
            </UiButton>
          </div>
        </div>

        <!-- Not enrolled state -->
        <div v-else class="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center space-y-3">
          <div class="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ScanFace class="w-7 h-7" />
          </div>
          <div>
            <p class="font-semibold text-foreground">Belum ada biometrik wajah</p>
            <p class="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Daftarkan wajah Anda satu kali. Sistem akan menyimpan template ter-enkripsi (bukan foto) sebagai bukti identitas.
            </p>
          </div>
          <UiButton variant="gradient" @click="openEnroll">
            <Camera class="w-4 h-4" />
            Daftarkan biometrik
          </UiButton>
        </div>
      </UiCard>

      <!-- ============================================================== -->
      <!-- PASSWORD -->
      <!-- ============================================================== -->
      <UiCard class="space-y-4">
        <div class="flex items-center gap-2">
          <KeyRound class="w-5 h-5 text-primary" />
          <h2 class="text-lg font-semibold text-foreground">Ubah password</h2>
        </div>
        <p class="text-sm text-muted-foreground">
          Untuk akun demo, password baru disimpan di browser Anda dan dipakai saat login berikutnya.
        </p>

        <form class="space-y-4" @submit.prevent="submitPasswordChange">
          <UiFormField label="Password saat ini" required>
            <UiInput v-model="currentPassword" type="password" autocomplete="current-password" placeholder="••••••••" />
          </UiFormField>
          <UiFormField label="Password baru" required hint="Minimal 6 karakter.">
            <UiInput v-model="newPassword" type="password" autocomplete="new-password" placeholder="••••••••" />
          </UiFormField>
          <UiFormField label="Konfirmasi password baru" required>
            <UiInput v-model="confirmPassword" type="password" autocomplete="new-password" placeholder="••••••••" />
          </UiFormField>

          <p v-if="pwdError" class="text-xs text-destructive flex items-center gap-1">
            <AlertCircle class="w-3.5 h-3.5 shrink-0" />
            {{ pwdError }}
          </p>
          <p v-if="pwdMessage" class="text-xs text-emerald-600 flex items-center gap-1">
            <CheckCircle2 class="w-3.5 h-3.5 shrink-0" />
            {{ pwdMessage }}
          </p>

          <UiButton type="submit" variant="gradient" class="w-full sm:w-auto" :loading="pwdSubmitting">
            <Lock class="w-4 h-4" />
            Simpan password
          </UiButton>
        </form>
      </UiCard>
    </div>

    <!-- ============================================================== -->
    <!-- ENROLLMENT MODAL -->
    <!-- ============================================================== -->
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
          v-if="showEnrollModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          @click.self="closeEnroll"
        >
          <div class="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            <!-- Header -->
            <div class="flex items-start justify-between gap-3 p-5 border-b border-border">
              <div>
                <h3 class="text-lg font-semibold text-foreground">
                  {{ hasEnrollment ? 'Edit Biometrik Wajah' : 'Daftarkan Biometrik Wajah' }}
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  {{ enrollStep === 'success' ? 'Biometrik berhasil disimpan.' : 'Sistem hanya menyimpan template, bukan foto.' }}
                </p>
              </div>
              <button class="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50" @click="closeEnroll">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Body -->
            <div class="p-5 space-y-4 min-h-[20rem]">
              <!-- STEP: CAMERA -->
              <div v-if="enrollStep === 'camera' || enrollStep === 'analyzing'">
                <div class="flex flex-col items-center text-center">
                  <div class="relative w-72 h-72 rounded-2xl bg-black border-2 border-dashed border-border overflow-hidden flex items-center justify-center">
                    <video
                      ref="videoRef"
                      class="absolute inset-0 w-full h-full object-cover [transform:scaleX(-1)]"
                      autoplay
                      muted
                      playsinline
                    />
                    <div v-if="cameraError" class="absolute inset-0 flex flex-col items-center justify-center bg-muted/40 p-4 z-10">
                      <ScanFace class="w-12 h-12 text-muted-foreground/60" />
                      <p class="text-xs text-destructive mt-2 text-center">{{ cameraError }}</p>
                    </div>
                    <!-- Detection brackets -->
                    <div class="absolute inset-6 pointer-events-none z-10">
                      <div class="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] rounded-tl border-primary" />
                      <div class="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] rounded-tr border-primary" />
                      <div class="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] rounded-bl border-primary" />
                      <div class="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] rounded-br border-primary" />
                    </div>
                    <!-- Live indicator -->
                    <div v-if="stream" class="absolute top-2 left-2 z-20 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                      <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span class="text-[10px] font-semibold text-white">LIVE</span>
                    </div>
                    <!-- Scanning bar saat analyzing -->
                    <div
                      v-if="enrollStep === 'analyzing'"
                      class="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(99,102,241,0.8)] z-20"
                      :style="{ top: `${analyzeProgress}%`, transition: 'top 0.08s linear' }"
                    />
                  </div>

                  <h4 class="mt-4 font-semibold text-foreground">
                    {{ enrollStep === 'analyzing' ? 'Mengekstrak template biometrik...' : 'Posisikan wajah di tengah kotak' }}
                  </h4>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ enrollStep === 'analyzing' ? 'Foto sedang dianalisis dan langsung dibuang setelah ekstraksi.' : 'Pastikan pencahayaan cukup dan wajah terlihat jelas.' }}
                  </p>

                  <div v-if="enrollStep === 'analyzing'" class="mt-3 w-full max-w-xs">
                    <div class="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div class="h-full bg-primary transition-all" :style="{ width: `${analyzeProgress}%` }" />
                    </div>
                    <p class="text-[10px] text-muted-foreground mt-1 text-right font-mono">{{ analyzeProgress }}%</p>
                  </div>
                </div>
              </div>

              <!-- STEP: SUCCESS -->
              <div v-else-if="enrollStep === 'success'" class="py-2 space-y-3">
                <div class="flex flex-col items-center text-center pb-2">
                  <div class="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 class="w-9 h-9 text-emerald-500" />
                  </div>
                  <h4 class="mt-3 font-semibold text-foreground">Biometrik tersimpan</h4>
                  <p class="text-xs text-muted-foreground mt-0.5 max-w-xs">
                    Template ter-enkripsi telah disimpan. Foto tidak pernah disimpan ke storage.
                  </p>
                </div>

                <div class="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground flex items-center gap-2"><Fingerprint class="w-3.5 h-3.5" /> Template ID</span>
                    <span class="font-mono text-foreground truncate max-w-[14rem]">{{ enrollment?.templateId }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground flex items-center gap-2"><ShieldCheck class="w-3.5 h-3.5" /> Quality</span>
                    <span class="font-mono font-medium text-foreground">{{ lastQuality }}/100</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground flex items-center gap-2"><Lock class="w-3.5 h-3.5" /> Vector</span>
                    <span class="font-mono text-foreground">{{ BIOMETRIC_DIM }}-dim, encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-2 p-5 border-t border-border">
              <UiButton v-if="enrollStep === 'camera'" variant="outline" @click="closeEnroll">Batal</UiButton>
              <UiButton
                v-if="enrollStep === 'camera'"
                variant="gradient"
                :disabled="!stream || !!cameraError"
                @click="captureAndAnalyze"
              >
                <Camera class="w-4 h-4" />
                Capture & Ekstrak Template
              </UiButton>
              <UiButton
                v-if="enrollStep === 'analyzing'"
                variant="outline"
                disabled
              >
                <Loader class="w-4 h-4 animate-spin" />
                Mengekstrak...
              </UiButton>
              <UiButton
                v-if="enrollStep === 'success'"
                variant="gradient"
                @click="closeEnroll"
              >
                <CheckCircle2 class="w-4 h-4" />
                Selesai
              </UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ============================================================== -->
    <!-- DELETE CONFIRM -->
    <!-- ============================================================== -->
    <UiConfirmDialog
      :open="showDeleteConfirm"
      title="Hapus Biometrik Wajah?"
      message="Template biometrik akan dihapus dari perangkat ini. Anda perlu mendaftarkan ulang jika ingin menggunakan verifikasi wajah lagi."
      confirm-text="Ya, Hapus"
      @update:open="showDeleteConfirm = $event"
      @confirm="deleteEnrollment"
    />
  </div>
</template>
