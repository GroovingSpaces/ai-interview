<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  FileText,
  Building2,
  Layers,
  Contact,
  CreditCard,
  Heart,
  AlertCircle,
  Download,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  User,
} from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import { formatDate } from '~/lib/utils'
import {
  DOCUMENT_TYPE_OPTIONS,
  RELATIONSHIP_OPTIONS,
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  MARRIAGE_STATUS_OPTIONS,
  EMPLOYEE_STATUS_OPTIONS,
  CONTRACT_DURATION_OPTIONS,
  labelOf,
} from '~/composables/useEmployeeOptions'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('employeeDatabase')

const route = useRoute()
const router = useRouter()
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const employeeId = computed(() => String(route.params.id))
const employee = computed(() => employeesStore.getEmployeeById(employeeId.value))

useHead({ title: () => `${employee.value?.name ?? 'Detail'} | ${title.value}` })

const activeTab = ref<'overview' | 'family' | 'work' | 'education' | 'certifications' | 'documents'>('overview')

const tabs = [
  { id: 'overview' as const, label: 'Ringkasan', icon: User },
  { id: 'family' as const, label: 'Keluarga', icon: Users },
  { id: 'work' as const, label: 'Riwayat Kerja', icon: Briefcase },
  { id: 'education' as const, label: 'Pendidikan', icon: GraduationCap },
  { id: 'certifications' as const, label: 'Sertifikasi', icon: Award },
  { id: 'documents' as const, label: 'Dokumen', icon: FileText },
]

const confirmDelete = ref(false)

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function divisionName(id?: string): string {
  if (!id) return '-'
  return companyStore.getDivisionById(id)?.name ?? '-'
}
function departmentName(id?: string): string {
  if (!id) return '-'
  return companyStore.getDepartmentById(id)?.name ?? '-'
}
function positionLevelName(id?: string): string {
  if (!id) return '-'
  return companyStore.getPositionLevelById(id)?.name ?? '-'
}
function locationName(id?: string): string {
  if (!id) return '-'
  return companyStore.getLocationById(id)?.name ?? '-'
}
function organizationName(id?: string): string {
  if (!id) return '-'
  return companyStore.getOrganizationById(id)?.name ?? '-'
}
function supervisorName(id?: string): string {
  if (!id) return '-'
  return employeesStore.getEmployeeById(id)?.name ?? '-'
}

function fullAddress(): string {
  if (!employee.value) return '-'
  const parts = [
    employee.value.address,
    employee.value.kelurahan,
    employee.value.kecamatan,
    employee.value.kota,
    employee.value.provinsi,
    employee.value.postalCode,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : '-'
}

function goEdit() {
  router.push(`/employees/database/${employeeId.value}/edit`)
}
function goBack() {
  router.push('/employees/database')
}
function askDelete() {
  confirmDelete.value = true
}
function doDelete() {
  employeesStore.deleteEmployee(employeeId.value)
  router.push('/employees/database')
}
function toggleStatus() {
  employeesStore.toggleEmployeeStatus(employeeId.value)
}

function downloadDocument(fileData?: string, fileName?: string) {
  if (!fileData) return
  const a = document.createElement('a')
  a.href = fileData
  a.download = fileName || 'document'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const documentsByType = computed(() => {
  const docs = employee.value?.documents ?? []
  const map = new Map<string, typeof docs>()
  for (const d of docs) {
    const key = String(d.type)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(d)
  }
  return map
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="!employee" class="glass-card p-8 text-center">
      <AlertCircle class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <h2 class="text-lg font-semibold text-foreground">Karyawan tidak ditemukan</h2>
      <UiButton variant="outline" class="mt-4" @click="goBack">
        <ArrowLeft class="w-4 h-4" />
        Kembali ke Daftar
      </UiButton>
    </div>

    <template v-else>
      <!-- Header bar -->
      <div class="flex items-center gap-4">
        <button type="button" class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground" @click="goBack">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-foreground truncate">Detail Karyawan</h1>
          <p class="text-sm text-muted-foreground">{{ title }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UiButton variant="outline" @click="toggleStatus">
            <component :is="employee.isActive ? XCircle : CheckCircle2" class="w-4 h-4" />
            {{ employee.isActive ? 'Nonaktifkan' : 'Aktifkan' }}
          </UiButton>
          <UiButton variant="outline" @click="goEdit">
            <Pencil class="w-4 h-4" />
            Edit
          </UiButton>
          <UiButton variant="destructive" @click="askDelete">
            <Trash2 class="w-4 h-4" />
            Hapus
          </UiButton>
        </div>
      </div>

      <!-- Hero card -->
      <div class="glass-card p-6">
        <div class="flex flex-col md:flex-row md:items-center gap-6">
          <div class="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-white text-2xl font-bold shrink-0">
            <img v-if="employee.photoUrl" :src="employee.photoUrl" :alt="employee.name" class="w-full h-full object-cover" >
            <span v-else>{{ getInitials(employee.name) }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-2xl font-bold text-foreground">{{ employee.name }}</h2>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                  employee.isActive
                    ? 'bg-score-good/10 text-score-good border-score-good/30'
                    : 'bg-score-low/10 text-score-low border-score-low/30',
                ]"
              >
                {{ employee.isActive ? 'Aktif' : 'Tidak Aktif' }}
              </span>
              <span v-if="employee.employeeStatus" class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {{ labelOf(EMPLOYEE_STATUS_OPTIONS, employee.employeeStatus) }}
              </span>
            </div>
            <p class="text-base text-muted-foreground mt-1">{{ employee.position }} — {{ employee.department }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div class="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <Contact class="w-4 h-4 shrink-0" />
                <span class="font-mono truncate">{{ employee.employeeId }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <Mail class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ employee.email }}</span>
              </div>
              <div v-if="employee.phone" class="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <Phone class="w-4 h-4 shrink-0" />
                <span class="truncate">{{ employee.phone }}</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                <Calendar class="w-4 h-4 shrink-0" />
                <span class="truncate">Bergabung {{ formatDate(employee.joinDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="overflow-x-auto">
        <div class="inline-flex gap-1 p-1 rounded-xl bg-muted/30 border border-border">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            :class="[
              'inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Overview -->
      <section v-show="activeTab === 'overview'" class="space-y-4">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- Personal -->
          <div class="glass-card p-6 space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <User class="w-4 h-4" />
              Data Pribadi
            </h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs text-muted-foreground">Tempat / Tgl Lahir</dt>
                <dd class="text-foreground">{{ employee.placeOfBirth || '-' }}, {{ employee.dateOfBirth ? formatDate(employee.dateOfBirth) : '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Jenis Kelamin</dt>
                <dd class="text-foreground">{{ labelOf(GENDER_OPTIONS, employee.gender) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Agama</dt>
                <dd class="text-foreground">{{ labelOf(RELIGION_OPTIONS, employee.religion) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Status Pernikahan</dt>
                <dd class="text-foreground">{{ labelOf(MARRIAGE_STATUS_OPTIONS, employee.marriageStatus) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Golongan Darah</dt>
                <dd class="text-foreground">{{ employee.bloodType || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Kewarganegaraan</dt>
                <dd class="text-foreground">{{ employee.nationality || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Email Pribadi</dt>
                <dd class="text-foreground truncate">{{ employee.personalEmail || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Tanggungan</dt>
                <dd class="text-foreground">{{ employee.dependents ?? '-' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Identitas Resmi -->
          <div class="glass-card p-6 space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck class="w-4 h-4" />
              Identitas Resmi
            </h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs text-muted-foreground">No. KTP (NIK)</dt>
                <dd class="text-foreground font-mono">{{ employee.nationalId || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">No. NPWP</dt>
                <dd class="text-foreground font-mono">{{ employee.taxId || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">BPJS Kesehatan</dt>
                <dd class="text-foreground font-mono">{{ employee.bpjsKesehatan || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">BPJS Ketenagakerjaan</dt>
                <dd class="text-foreground font-mono">{{ employee.bpjsKetenagakerjaan || '-' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Address -->
          <div class="glass-card p-6 space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin class="w-4 h-4" />
              Alamat
            </h3>
            <p class="text-sm text-foreground">{{ fullAddress() }}</p>
          </div>

          <!-- Bank -->
          <div class="glass-card p-6 space-y-3">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CreditCard class="w-4 h-4" />
              Rekening Bank
            </h3>
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt class="text-xs text-muted-foreground">Bank</dt>
                <dd class="text-foreground">{{ employee.bankName || '-' }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Nama Pemilik</dt>
                <dd class="text-foreground">{{ employee.bankAccountName || '-' }}</dd>
              </div>
              <div class="sm:col-span-2">
                <dt class="text-xs text-muted-foreground">No. Rekening</dt>
                <dd class="text-foreground font-mono">{{ employee.bankAccountNumber || '-' }}</dd>
              </div>
            </dl>
          </div>

          <!-- Employment -->
          <div class="glass-card p-6 space-y-3 lg:col-span-2">
            <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Building2 class="w-4 h-4" />
              Data Kepegawaian
            </h3>
            <dl class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <dt class="text-xs text-muted-foreground">Departemen (master)</dt>
                <dd class="text-foreground">{{ departmentName(employee.departmentId) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Divisi</dt>
                <dd class="text-foreground">{{ divisionName(employee.divisionId) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Jenjang Jabatan</dt>
                <dd class="text-foreground">{{ positionLevelName(employee.positionLevelId) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Lokasi Kerja</dt>
                <dd class="text-foreground">{{ locationName(employee.locationId) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Organisasi</dt>
                <dd class="text-foreground">{{ organizationName(employee.organizationId) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Atasan Langsung</dt>
                <dd class="text-foreground">{{ supervisorName(employee.directSupervisorId) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Status Karyawan</dt>
                <dd class="text-foreground">{{ labelOf(EMPLOYEE_STATUS_OPTIONS, employee.employeeStatus) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Durasi Kontrak</dt>
                <dd class="text-foreground">{{ labelOf(CONTRACT_DURATION_OPTIONS, employee.contractDurationType) }}</dd>
              </div>
              <div>
                <dt class="text-xs text-muted-foreground">Periode Kontrak</dt>
                <dd class="text-foreground">
                  {{ employee.contractStartDate ? formatDate(employee.contractStartDate) : '-' }}
                  <span v-if="employee.contractEndDate"> – {{ formatDate(employee.contractEndDate) }}</span>
                </dd>
              </div>
              <div v-if="employee.baseSalary !== undefined">
                <dt class="text-xs text-muted-foreground">Gaji Pokok</dt>
                <dd class="text-foreground font-mono">Rp {{ Number(employee.baseSalary).toLocaleString('id-ID') }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- Family -->
      <section v-show="activeTab === 'family'" class="space-y-4">
        <div v-if="!employee.family?.length" class="glass-card p-8 text-center">
          <Heart class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">Belum ada data keluarga.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(member, idx) in employee.family"
            :key="idx"
            class="glass-card p-4 space-y-2"
          >
            <div class="flex items-center justify-between">
              <h4 class="font-medium text-foreground">{{ member.name }}</h4>
              <span class="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                {{ labelOf(RELATIONSHIP_OPTIONS, member.relationship) }}
              </span>
            </div>
            <dl class="grid grid-cols-2 gap-2 text-xs">
              <div v-if="member.gender">
                <dt class="text-muted-foreground">Jenis Kelamin</dt>
                <dd class="text-foreground">{{ labelOf(GENDER_OPTIONS, member.gender) }}</dd>
              </div>
              <div v-if="member.dateOfBirth">
                <dt class="text-muted-foreground">Tgl Lahir</dt>
                <dd class="text-foreground">{{ formatDate(member.dateOfBirth) }}</dd>
              </div>
              <div v-if="member.occupation">
                <dt class="text-muted-foreground">Pekerjaan</dt>
                <dd class="text-foreground">{{ member.occupation }}</dd>
              </div>
              <div v-if="member.phone">
                <dt class="text-muted-foreground">Telepon</dt>
                <dd class="text-foreground">{{ member.phone }}</dd>
              </div>
              <div v-if="member.address" class="col-span-2">
                <dt class="text-muted-foreground">Alamat</dt>
                <dd class="text-foreground">{{ member.address }}</dd>
              </div>
              <div v-if="member.notes" class="col-span-2">
                <dt class="text-muted-foreground">Catatan</dt>
                <dd class="text-foreground">{{ member.notes }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- Work history -->
      <section v-show="activeTab === 'work'" class="space-y-4">
        <div v-if="!employee.workHistory?.length" class="glass-card p-8 text-center">
          <Briefcase class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">Belum ada riwayat pekerjaan.</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(item, idx) in employee.workHistory"
            :key="idx"
            class="glass-card p-4 flex gap-4"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-foreground">{{ item.position }}</h4>
              <p class="text-sm text-muted-foreground">{{ item.company }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ item.startDate ? formatDate(item.startDate) : '-' }}
                <span v-if="item.endDate"> – {{ formatDate(item.endDate) }}</span>
                <span v-else> – Sekarang</span>
              </p>
              <p v-if="item.description" class="text-sm text-foreground mt-2">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section v-show="activeTab === 'education'" class="space-y-4">
        <div v-if="!employee.education?.length" class="glass-card p-8 text-center">
          <GraduationCap class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">Belum ada riwayat pendidikan.</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(item, idx) in employee.education"
            :key="idx"
            class="glass-card p-4 flex gap-4"
          >
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <GraduationCap class="w-5 h-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-medium text-foreground">{{ item.institution }}</h4>
                <span class="px-2 py-0.5 rounded-full text-xs bg-muted/50 text-muted-foreground border border-border">
                  {{ item.degree }}
                </span>
              </div>
              <p class="text-sm text-muted-foreground">{{ item.fieldOfStudy || '-' }}</p>
              <p class="text-xs text-muted-foreground mt-1">{{ item.startYear || '-' }} – {{ item.endYear || '-' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Certifications -->
      <section v-show="activeTab === 'certifications'" class="space-y-4">
        <div v-if="!employee.certifications?.length" class="glass-card p-8 text-center">
          <Award class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">Belum ada sertifikasi.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="(item, idx) in employee.certifications"
            :key="idx"
            class="glass-card p-4"
          >
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Award class="w-5 h-5 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium text-foreground">{{ item.name }}</h4>
                <p class="text-sm text-muted-foreground">{{ item.issuer }}</p>
                <div class="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div v-if="item.date">
                    <dt class="text-muted-foreground">Terbit</dt>
                    <dd class="text-foreground">{{ formatDate(item.date) }}</dd>
                  </div>
                  <div v-if="item.expiryDate">
                    <dt class="text-muted-foreground">Kadaluarsa</dt>
                    <dd class="text-foreground">{{ formatDate(item.expiryDate) }}</dd>
                  </div>
                  <div v-if="item.credentialId" class="col-span-2">
                    <dt class="text-muted-foreground">No. Kredensial</dt>
                    <dd class="text-foreground font-mono">{{ item.credentialId }}</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Documents -->
      <section v-show="activeTab === 'documents'" class="space-y-4">
        <div v-if="!employee.documents?.length" class="glass-card p-8 text-center">
          <FileText class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">Belum ada dokumen yang dilampirkan.</p>
          <UiButton variant="outline" class="mt-4" @click="goEdit">
            <Pencil class="w-4 h-4" />
            Tambah Dokumen
          </UiButton>
        </div>

        <template v-else>
          <div
            v-for="opt in DOCUMENT_TYPE_OPTIONS"
            :key="opt.value"
            class="space-y-2"
          >
            <template v-if="documentsByType.get(opt.value)?.length">
              <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers class="w-4 h-4" />
                {{ opt.label }}
                <span class="text-xs font-normal">({{ documentsByType.get(opt.value)?.length }})</span>
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div
                  v-for="doc in documentsByType.get(opt.value)"
                  :key="doc.id"
                  class="glass-card p-4 flex items-start gap-3"
                >
                  <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText class="w-5 h-5 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-foreground truncate">{{ doc.name }}</h4>
                    <p v-if="doc.documentNumber" class="text-xs font-mono text-muted-foreground truncate">{{ doc.documentNumber }}</p>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span v-if="doc.issuedDate">Terbit: {{ formatDate(doc.issuedDate) }}</span>
                      <span v-if="doc.expiryDate">Kadaluarsa: {{ formatDate(doc.expiryDate) }}</span>
                      <span>Diunggah: {{ formatDate(doc.uploadedAt) }}</span>
                    </div>
                    <p v-if="doc.description" class="text-xs text-muted-foreground mt-1">{{ doc.description }}</p>
                  </div>
                  <button
                    v-if="doc.fileData"
                    type="button"
                    class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors shrink-0"
                    title="Unduh"
                    @click="downloadDocument(doc.fileData, doc.fileName || doc.name)"
                  >
                    <Download class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </template>
      </section>

      <!-- Delete confirm modal -->
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
            v-if="confirmDelete"
            class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
            @click.self="confirmDelete = false"
          >
            <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <h3 class="text-lg font-semibold text-foreground">Hapus {{ employee.name }}?</h3>
              <p class="text-sm text-muted-foreground mt-1">Data karyawan beserta seluruh dokumen, riwayat keluarga, kerja, pendidikan, dan sertifikasi akan dihapus.</p>
              <div class="flex justify-end gap-2 mt-5">
                <UiButton variant="outline" @click="confirmDelete = false">Batal</UiButton>
                <UiButton variant="destructive" @click="doDelete">
                  <Trash2 class="w-4 h-4" />
                  Hapus
                </UiButton>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>
