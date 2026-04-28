<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Upload, X, User, Check, ArrowLeft, ArrowRight,
  Briefcase, UsersRound, GraduationCap, Award, FileText, Contact,
} from 'lucide-vue-next'
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  MARRIAGE_STATUS_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  CONTRACT_DURATION_OPTIONS,
} from '~/composables/useEmployeeOptions'
import { useEmployeesStore, type Employee } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'

interface FormState {
  name: string
  email: string
  employeeId: string
  department: string
  position: string
  joinDate: string
  phone: string
  dateOfBirth: string
  placeOfBirth: string
  gender: string
  bloodType: string
  religion: string
  marriageStatus: string
  nationality: string
  nationalId: string
  taxId: string
  personalEmail: string
  dependents: number | undefined
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bpjsKesehatan: string
  bpjsKetenagakerjaan: string
  address: string
  provinsi: string
  kota: string
  kecamatan: string
  kelurahan: string
  postalCode: string
  photoUrl: string
  departmentId: string
  divisionId: string
  positionLevelId: string
  locationId: string
  organizationId: string
  directSupervisorId: string
  employeeStatus: string
  contractStartDate: string
  contractEndDate: string
  contractDurationType: '3_MONTHS' | '6_MONTHS' | '1_YEAR' | 'PERMANENT' | ''
  baseSalary: number | undefined
  family: Employee['family']
  workHistory: Employee['workHistory']
  education: Employee['education']
  certifications: Employee['certifications']
  documents: Employee['documents']
}

const props = withDefaults(
  defineProps<{
    modelValue: FormState
    mode?: 'tabs' | 'wizard'
    /** Hanya berlaku saat mode='wizard'. Apakah form sedang valid untuk submit final. */
    canSubmit?: boolean
    /** Label tombol submit di step terakhir wizard */
    submitLabel?: string
  }>(),
  {
    mode: 'tabs',
    canSubmit: true,
    submitLabel: 'Simpan',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: FormState]
  /** Emit saat user klik Submit di step terakhir wizard. */
  submit: []
  /** Emit saat user klik Cancel di wizard. */
  cancel: []
}>()

const form = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

type TabId = 'personal' | 'employment' | 'family' | 'work' | 'education' | 'certifications' | 'documents'
const activeTab = ref<TabId>('personal')

const tabs = [
  { id: 'personal' as TabId, label: 'Data Pribadi', icon: User, hint: 'Identitas, alamat, bank' },
  { id: 'employment' as TabId, label: 'Kepegawaian', icon: Briefcase, hint: 'Posisi & kontrak' },
  { id: 'family' as TabId, label: 'Keluarga', icon: UsersRound, hint: 'Anggota & kontak darurat' },
  { id: 'work' as TabId, label: 'Riwayat Kerja', icon: Contact, hint: 'Pengalaman sebelumnya' },
  { id: 'education' as TabId, label: 'Pendidikan', icon: GraduationCap, hint: 'Riwayat pendidikan' },
  { id: 'certifications' as TabId, label: 'Sertifikasi', icon: Award, hint: 'Sertifikat profesional' },
  { id: 'documents' as TabId, label: 'Dokumen', icon: FileText, hint: 'KTP, NPWP, ijazah, dll' },
]

// Wizard navigation helpers
const currentStepIndex = computed(() => tabs.findIndex((t) => t.id === activeTab.value))
const isFirstStep = computed(() => currentStepIndex.value === 0)
const isLastStep = computed(() => currentStepIndex.value === tabs.length - 1)

function goNext() {
  const next = tabs[currentStepIndex.value + 1]
  if (next) activeTab.value = next.id
  scrollTop()
}
function goPrev() {
  const prev = tabs[currentStepIndex.value - 1]
  if (prev) activeTab.value = prev.id
  scrollTop()
}
function jumpTo(id: TabId) {
  activeTab.value = id
  scrollTop()
}
function scrollTop() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

defineExpose({ activeTab, jumpTo, goNext, goPrev, currentStepIndex, isFirstStep, isLastStep })

const genderOptions = GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const religionOptions = RELIGION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const marriageOptions = MARRIAGE_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const bloodTypeOptions = BLOOD_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const employeeStatusOptions = EMPLOYEE_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const contractDurationOptions = CONTRACT_DURATION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

const departmentOptions = computed(() =>
  companyStore.departments.map((d) => ({ value: d.id, label: d.name }))
)
const divisionOptions = computed(() =>
  companyStore.divisions.map((d) => ({ value: d.id, label: d.name }))
)
const positionLevelOptions = computed(() =>
  companyStore.positionLevels.map((p) => ({ value: p.id, label: p.name }))
)
const locationOptions = computed(() =>
  companyStore.locations.map((l) => ({ value: l.id, label: l.name }))
)
const organizationOptions = computed(() =>
  companyStore.organizations.map((o) => ({ value: o.id, label: o.name }))
)
const supervisorOptions = computed(() => [
  { value: '', label: 'Tidak ada' },
  ...employeesStore.employees
    .filter((e) => e.id !== form.value.employeeId)
    .map((e) => ({ value: e.id, label: `${e.name} — ${e.position}` })),
])

async function onPhotoChange(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value = { ...form.value, photoUrl: reader.result as string }
  }
  reader.readAsDataURL(file)
}
function clearPhoto() {
  form.value = { ...form.value, photoUrl: '' }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'
}
</script>

<template>
  <div class="space-y-6">
    <!-- Tabs (mode='tabs') -->
    <div v-if="mode === 'tabs'" class="overflow-x-auto">
      <div class="inline-flex gap-1 p-1 rounded-xl bg-muted/30 border border-border">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="[
            'px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors',
            activeTab === tab.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Stepper (mode='wizard') -->
    <div v-else class="glass-card p-4 md:p-5">
      <!-- Visual stepper -->
      <div class="flex items-start gap-1 md:gap-2 overflow-x-auto pb-1">
        <template v-for="(tab, idx) in tabs" :key="tab.id">
          <button
            type="button"
            :class="[
              'flex flex-col items-center gap-1.5 min-w-[72px] md:min-w-[96px] py-1 px-1 rounded-lg transition-colors',
              idx === currentStepIndex ? 'cursor-default' : 'hover:bg-muted/30 cursor-pointer',
            ]"
            @click="jumpTo(tab.id)"
          >
            <div
              :class="[
                'w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all shrink-0',
                idx < currentStepIndex ? 'bg-emerald-500 text-white' :
                idx === currentStepIndex ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' :
                'bg-muted text-muted-foreground',
              ]"
            >
              <Check v-if="idx < currentStepIndex" class="w-4 h-4" />
              <component v-else :is="tab.icon" class="w-4 h-4" />
            </div>
            <p
              :class="[
                'text-[10px] md:text-xs font-medium text-center leading-tight',
                idx === currentStepIndex ? 'text-foreground' : idx < currentStepIndex ? 'text-foreground/80' : 'text-muted-foreground',
              ]"
            >
              {{ tab.label }}
            </p>
          </button>
          <div
            v-if="idx < tabs.length - 1"
            :class="[
              'flex-1 h-px mt-5 transition-colors min-w-[8px]',
              idx < currentStepIndex ? 'bg-emerald-500' : 'bg-border',
            ]"
          />
        </template>
      </div>

      <!-- Current step header -->
      <div class="flex items-center gap-3 mt-4 pt-4 border-t border-border">
        <div class="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <component :is="tabs[currentStepIndex].icon" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs text-muted-foreground">Langkah {{ currentStepIndex + 1 }} dari {{ tabs.length }}</p>
          <h3 class="font-semibold text-foreground">{{ tabs[currentStepIndex].label }}</h3>
        </div>
        <p class="text-xs text-muted-foreground hidden md:block">{{ tabs[currentStepIndex].hint }}</p>
      </div>
    </div>

    <!-- Personal -->
    <section v-show="activeTab === 'personal'" class="space-y-4">
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Foto Profil</h3>
        <div class="flex items-center gap-4">
          <div class="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-white text-xl font-bold">
            <img v-if="form.photoUrl" :src="form.photoUrl" alt="photo" class="w-full h-full object-cover" >
            <span v-else>{{ getInitials(form.name || 'NN') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-input bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 cursor-pointer transition-colors">
              <Upload class="w-4 h-4" />
              {{ form.photoUrl ? 'Ganti Foto' : 'Upload Foto' }}
              <input type="file" class="hidden" accept="image/*" @change="onPhotoChange" >
            </label>
            <button v-if="form.photoUrl" type="button" class="inline-flex items-center gap-1 h-10 px-3 rounded-xl border border-input text-muted-foreground hover:text-destructive transition-colors" @click="clearPhoto">
              <X class="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Identitas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nama Lengkap *</label>
            <UiInput v-model="form.name" placeholder="Nama lengkap" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Email Kantor *</label>
            <UiInput v-model="form.email" type="email" placeholder="nama@perusahaan.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Email Pribadi</label>
            <UiInput v-model="form.personalEmail" type="email" placeholder="email@personal.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">No. Telepon</label>
            <UiInput v-model="form.phone" placeholder="+62..." />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Tempat Lahir</label>
            <UiInput v-model="form.placeOfBirth" placeholder="e.g. Jakarta" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Tanggal Lahir</label>
            <UiInput v-model="form.dateOfBirth" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Jenis Kelamin</label>
            <UiSelect v-model="form.gender" :options="genderOptions" placeholder="Pilih jenis kelamin" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Golongan Darah</label>
            <UiSelect v-model="form.bloodType" :options="bloodTypeOptions" placeholder="Pilih golongan darah" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Agama</label>
            <UiSelect v-model="form.religion" :options="religionOptions" placeholder="Pilih agama" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Status Pernikahan</label>
            <UiSelect v-model="form.marriageStatus" :options="marriageOptions" placeholder="Pilih status" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Kewarganegaraan</label>
            <UiInput v-model="form.nationality" placeholder="e.g. Indonesia" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Jumlah Tanggungan</label>
            <UiInput v-model.number="form.dependents" type="number" placeholder="0" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Identitas Resmi</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">No. KTP (NIK)</label>
            <UiInput v-model="form.nationalId" placeholder="16 digit" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">No. NPWP</label>
            <UiInput v-model="form.taxId" placeholder="xx.xxx.xxx.x-xxx.xxx" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">No. BPJS Kesehatan</label>
            <UiInput v-model="form.bpjsKesehatan" placeholder="Nomor BPJS" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">No. BPJS Ketenagakerjaan</label>
            <UiInput v-model="form.bpjsKetenagakerjaan" placeholder="Nomor BPJS TK" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Alamat</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-foreground mb-2">Alamat Lengkap</label>
            <UiInput v-model="form.address" placeholder="Jalan, RT/RW, no. rumah" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Provinsi</label>
            <UiInput v-model="form.provinsi" placeholder="Provinsi" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Kota / Kabupaten</label>
            <UiInput v-model="form.kota" placeholder="Kota / kabupaten" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Kecamatan</label>
            <UiInput v-model="form.kecamatan" placeholder="Kecamatan" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Kelurahan</label>
            <UiInput v-model="form.kelurahan" placeholder="Kelurahan" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Kode Pos</label>
            <UiInput v-model="form.postalCode" placeholder="Kode pos" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Rekening Bank</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nama Bank</label>
            <UiInput v-model="form.bankName" placeholder="e.g. BCA, Mandiri" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Nama Pemilik Rekening</label>
            <UiInput v-model="form.bankAccountName" placeholder="Sesuai buku tabungan" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">No. Rekening</label>
            <UiInput v-model="form.bankAccountNumber" placeholder="Nomor rekening" />
          </div>
        </div>
      </div>
    </section>

    <!-- Employment -->
    <section v-show="activeTab === 'employment'" class="space-y-4">
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Data Kepegawaian</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">NIK Karyawan *</label>
            <UiInput v-model="form.employeeId" placeholder="e.g. EMP001" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Tanggal Bergabung *</label>
            <UiInput v-model="form.joinDate" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Departemen *</label>
            <UiInput v-model="form.department" placeholder="e.g. Engineering" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Posisi / Jabatan *</label>
            <UiInput v-model="form.position" placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Departemen (master)</label>
            <UiSelect v-model="form.departmentId" :options="departmentOptions" placeholder="Pilih departemen" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Divisi</label>
            <UiSelect v-model="form.divisionId" :options="divisionOptions" placeholder="Pilih divisi" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Jenjang Jabatan</label>
            <UiSelect v-model="form.positionLevelId" :options="positionLevelOptions" placeholder="Pilih jenjang" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Lokasi Kerja</label>
            <UiSelect v-model="form.locationId" :options="locationOptions" placeholder="Pilih lokasi" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Organisasi</label>
            <UiSelect v-model="form.organizationId" :options="organizationOptions" placeholder="Pilih organisasi" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Atasan Langsung</label>
            <UiSelect v-model="form.directSupervisorId" :options="supervisorOptions" placeholder="Pilih atasan" />
          </div>
        </div>
      </div>

      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Status & Kontrak</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Status Karyawan</label>
            <UiSelect v-model="form.employeeStatus" :options="employeeStatusOptions" placeholder="Pilih status" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Durasi Kontrak</label>
            <UiSelect v-model="form.contractDurationType" :options="contractDurationOptions" placeholder="Pilih durasi" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Mulai Kontrak</label>
            <UiInput v-model="form.contractStartDate" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Akhir Kontrak</label>
            <UiInput v-model="form.contractEndDate" type="date" :disabled="form.contractDurationType === 'PERMANENT'" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Gaji Pokok (Rp)</label>
            <UiInput v-model.number="form.baseSalary" type="number" placeholder="0" />
          </div>
        </div>
      </div>
    </section>

    <!-- Family -->
    <section v-show="activeTab === 'family'" class="space-y-4">
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Informasi Keluarga & Kontak Darurat</h3>
        <p class="text-sm text-muted-foreground">Tambahkan suami/istri, anak, orang tua, atau kontak darurat.</p>
        <EmployeesFamilyRepeater v-model="form.family" />
      </div>
    </section>

    <!-- Work history -->
    <section v-show="activeTab === 'work'" class="space-y-4">
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Riwayat Pekerjaan</h3>
        <p class="text-sm text-muted-foreground">Daftar pengalaman kerja sebelumnya.</p>
        <EmployeesWorkHistoryRepeater v-model="form.workHistory" />
      </div>
    </section>

    <!-- Education -->
    <section v-show="activeTab === 'education'" class="space-y-4">
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Riwayat Pendidikan</h3>
        <p class="text-sm text-muted-foreground">Pendidikan formal dari SD hingga jenjang tertinggi.</p>
        <EmployeesEducationRepeater v-model="form.education" />
      </div>
    </section>

    <!-- Certifications -->
    <section v-show="activeTab === 'certifications'" class="space-y-4">
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Sertifikasi</h3>
        <p class="text-sm text-muted-foreground">Sertifikasi profesional yang relevan.</p>
        <EmployeesCertificationRepeater v-model="form.certifications" />
      </div>
    </section>

    <!-- Documents -->
    <section v-show="activeTab === 'documents'" class="space-y-4">
      <div class="glass-card p-6 space-y-4">
        <h3 class="text-base font-semibold text-foreground">Dokumen Karyawan</h3>
        <p class="text-sm text-muted-foreground">KTP, KK, NPWP, BPJS, ijazah, kontrak, dan dokumen penting lainnya.</p>
        <EmployeesDocumentRepeater v-model="form.documents" />
      </div>
    </section>

    <!-- Wizard footer (mode='wizard' only) -->
    <div v-if="mode === 'wizard'" class="sticky bottom-0 -mx-4 px-4 py-3 bg-background/85 backdrop-blur-md border-t border-border flex flex-wrap items-center justify-between gap-3">
      <p class="text-xs text-muted-foreground">
        Langkah <span class="font-mono text-foreground">{{ currentStepIndex + 1 }}/{{ tabs.length }}</span> — {{ tabs[currentStepIndex].label }}
      </p>
      <div class="flex flex-wrap items-center gap-2 ml-auto">
        <UiButton type="button" variant="outline" @click="emit('cancel')">
          Batal
        </UiButton>
        <UiButton type="button" variant="outline" :disabled="isFirstStep" @click="goPrev">
          <ArrowLeft class="w-4 h-4" />
          Sebelumnya
        </UiButton>
        <UiButton v-if="!isLastStep" type="button" variant="gradient" @click="goNext">
          Lanjut
          <ArrowRight class="w-4 h-4" />
        </UiButton>
        <UiButton v-else type="button" variant="gradient" :disabled="!canSubmit" @click="emit('submit')">
          <Check class="w-4 h-4" />
          {{ submitLabel }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
