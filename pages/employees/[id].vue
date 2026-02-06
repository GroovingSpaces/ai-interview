<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEmployeesStore } from '~/stores/employees'
import { usePromotionsStore } from '~/stores/promotions'
import type { Employee, WorkHistoryItem, EducationItem, CertificationItem, EmployeeDocument } from '~/stores/employees'
import type { Promotion } from '~/stores/promotions'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  GraduationCap,
  Award,
  Edit,
  Trash2,
  Power,
  Plus,
  FileText,
  X,
  Check,
  ExternalLink,
  Users,
  LogIn,
  TrendingUp,
  Layers,
  Building,
  UserX,
} from 'lucide-vue-next'

export type CareerEventType = 'join' | 'promotion' | 'transferDept' | 'transferDivision' | 'retired'

export interface CareerTimelineItem {
  type: CareerEventType
  date: string
  sortKey: string
  labelKey: string
  fromPosition?: string
  toPosition?: string
  fromDepartment?: string
  toDepartment?: string
  fromDivision?: string
  toDivision?: string
  notes?: string
  promotedByLabel?: string
  documentsCount?: number
}

definePageMeta({
  middleware: 'admin',
})

const route = useRoute()
const router = useRouter()
const employeesStore = useEmployeesStore()
const promotionsStore = usePromotionsStore()

const employeeId = computed(() => route.params.id as string)
const employee = computed<Employee | undefined>(() => employeesStore.getEmployeeById(employeeId.value))
const tHistory = useModuleT('employeeHistory')
const tDoc = useModuleT('employeeDocument')
const tForm = useModuleT('employeeForm')
const tCommon = useModuleT('common')

const activeTab = ref<'overview' | 'history'>('overview')

const promotionsForEmployee = computed(() =>
  employeeId.value ? promotionsStore.getPromotionsByEmployeeId(employeeId.value) : []
)

const careerTimeline = computed<CareerTimelineItem[]>(() => {
  const emp = employee.value
  if (!emp) return []
  const items: CareerTimelineItem[] = []
  items.push({
    type: 'join',
    date: emp.joinDate,
    sortKey: emp.joinDate,
    labelKey: 'join',
  })
  for (const p of promotionsForEmployee.value as Promotion[]) {
    const fromDept = p.fromDepartment ?? ''
    const toDept = p.toDepartment ?? ''
    const fromDiv = p.fromDivision ?? ''
    const toDiv = p.toDivision ?? ''
    const promotedByLabel = p.promotedById ? employeesStore.getEmployeeById(p.promotedById)?.name : undefined
    const documentsCount = p.documents?.length ?? 0
    if (fromDiv && toDiv && fromDiv !== toDiv) {
      items.push({
        type: 'transferDivision',
        date: p.promotionDate,
        sortKey: p.promotionDate,
        labelKey: 'transferDivision',
        fromPosition: p.fromPosition,
        toPosition: p.toPosition,
        fromDepartment: fromDept,
        toDepartment: toDept,
        fromDivision: fromDiv,
        toDivision: toDiv,
        notes: p.notes,
        promotedByLabel,
        documentsCount,
      })
    } else if (fromDept && toDept && fromDept !== toDept) {
      items.push({
        type: 'transferDept',
        date: p.promotionDate,
        sortKey: p.promotionDate,
        labelKey: 'transferDept',
        fromPosition: p.fromPosition,
        toPosition: p.toPosition,
        fromDepartment: fromDept,
        toDepartment: toDept,
        fromDivision: fromDiv || undefined,
        toDivision: toDiv || undefined,
        notes: p.notes,
        promotedByLabel,
        documentsCount,
      })
    } else {
      items.push({
        type: 'promotion',
        date: p.promotionDate,
        sortKey: p.promotionDate,
        labelKey: 'promotion',
        fromPosition: p.fromPosition,
        toPosition: p.toPosition,
        fromDepartment: fromDept || undefined,
        toDepartment: toDept || undefined,
        notes: p.notes,
        promotedByLabel,
        documentsCount,
      })
    }
  }
  if (!emp.isActive) {
    items.push({
      type: 'retired',
      date: '',
      sortKey: 'zzzz',
      labelKey: 'retired',
    })
  }
  return items.sort((a, b) => a.sortKey.localeCompare(b.sortKey))
})

const showDocModal = ref(false)
const showDocDeleteModal = ref(false)
const editingDoc = ref<EmployeeDocument | null>(null)
const docForm = ref({
  name: '',
  type: 'Other',
  description: '',
  file: null as File | null,
})
const docToDelete = ref<EmployeeDocument | null>(null)
const docFileInputRef = ref<HTMLInputElement | null>(null)
const isSavingDoc = ref(false)

const documentTypes = [
  { value: 'CV', label: 'CV' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Certificate', label: 'Certificate' },
  { value: 'ID', label: 'ID / KTP' },
  { value: 'Other', label: 'Other' },
]

const employeeDocuments = computed(() => employee.value?.documents ?? [])

function openAddDoc() {
  editingDoc.value = null
  docForm.value = { name: '', type: 'Other', description: '', file: null }
  if (docFileInputRef.value) docFileInputRef.value.value = ''
  showDocModal.value = true
}

function openEditDoc(doc: EmployeeDocument) {
  editingDoc.value = doc
  docForm.value = {
    name: doc.name,
    type: doc.type,
    description: doc.description ?? '',
    file: null,
  }
  if (docFileInputRef.value) docFileInputRef.value.value = ''
  showDocModal.value = true
}

function openDeleteDoc(doc: EmployeeDocument) {
  docToDelete.value = doc
  showDocDeleteModal.value = true
}

function closeDocModals() {
  showDocModal.value = false
  showDocDeleteModal.value = false
  editingDoc.value = null
  docToDelete.value = null
  docForm.value = { name: '', type: 'Other', description: '', file: null }
  if (docFileInputRef.value) docFileInputRef.value.value = ''
  isSavingDoc.value = false
}

function onDocFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input?.files?.[0]
  if (file) {
    docForm.value.file = file
    if (!docForm.value.name.trim()) docForm.value.name = file.name
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function saveDocument() {
  if (!employee.value) return
  const { name, type, description, file } = docForm.value
  const nameTrim = name.trim()
  if (!nameTrim) return
  if (editingDoc.value) {
    const updates: Partial<EmployeeDocument> = { name: nameTrim, type, description: description.trim() || undefined }
    if (file) {
      updates.fileData = await fileToBase64(file)
      updates.fileName = file.name
      updates.url = undefined
    }
    employeesStore.updateEmployeeDocument(employee.value.id, editingDoc.value.id, updates)
  } else {
    if (!file) return
    isSavingDoc.value = true
    try {
      const fileData = await fileToBase64(file)
      employeesStore.addEmployeeDocument(employee.value.id, {
        name: nameTrim,
        type,
        description: description.trim() || undefined,
        fileName: file.name,
        fileData,
      })
    } finally {
      isSavingDoc.value = false
    }
  }
  closeDocModals()
}

function confirmDeleteDoc() {
  if (!employee.value || !docToDelete.value) return
  employeesStore.deleteEmployeeDocument(employee.value.id, docToDelete.value.id)
  closeDocModals()
}

function getDocumentHref(doc: EmployeeDocument): string {
  if (doc.fileData) return doc.fileData
  if (doc.url) return doc.url
  return '#'
}

function getDocumentDisplayName(doc: EmployeeDocument): string {
  return doc.fileName || doc.name
}

const isDocFormValid = computed(() => {
  const { name, file } = docForm.value
  if (!name.trim()) return false
  if (editingDoc.value) return true
  return !!file
})

useHead({
  title: () => (employee.value ? `${employee.value.name} - Employee Detail` : 'Employee Detail'),
})

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function formatContractPeriod(start?: string, end?: string, durationType?: string): string {
  if (!start && !end) return '-'
  const permanentLabel = tForm('contractDurationPermanent') || 'Karyawan tetap'
  if (durationType === 'PERMANENT' || !end) return start ? `${formatDate(start)} – ${permanentLabel}` : '-'
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`
  if (start) return formatDate(start)
  return end ? formatDate(end) : '-'
}

function formatContractDurationLabel(type?: string): string {
  if (!type) return '-'
  if (type === '3_MONTHS') return tForm('contractDuration3Months') || '3 bulan'
  if (type === '6_MONTHS') return tForm('contractDuration6Months') || '6 bulan'
  if (type === '1_YEAR') return tForm('contractDuration1Year') || '1 tahun'
  if (type === 'PERMANENT') return tForm('contractDurationPermanent') || 'Karyawan tetap'
  return '-'
}

function formatContractDuration(emp: { contractDurationType?: string; contractStartDate?: string; contractEndDate?: string }): string {
  if (emp.contractDurationType) return formatContractDurationLabel(emp.contractDurationType)
  if (!emp.contractStartDate || !emp.contractEndDate) return '-'
  const d1 = new Date(emp.contractStartDate)
  const d2 = new Date(emp.contractEndDate)
  if (d2 <= d1) return '-'
  const months = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
  const years = Math.floor(months / 12)
  const remainderMonths = months % 12
  if (years === 0) return `${months} ${months === 1 ? (tForm('month') || 'bulan') : (tForm('months') || 'bulan')}`
  if (remainderMonths === 0) return `${years} ${years === 1 ? (tForm('year') || 'tahun') : (tForm('years') || 'tahun')}`
  const y = `${years} ${years === 1 ? (tForm('year') || 'tahun') : (tForm('years') || 'tahun')}`
  const m = `${remainderMonths} ${remainderMonths === 1 ? (tForm('month') || 'bulan') : (tForm('months') || 'bulan')}`
  return `${y} ${m}`
}

function goBack() {
  router.push('/employees/database')
}

function openEdit() {
  if (employee.value) {
    router.push(`/employees/database?edit=${employee.value.id}`)
  }
}

function handleToggleStatus() {
  if (employee.value) {
    employeesStore.toggleEmployeeStatus(employee.value.id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back & actions -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <button
        type="button"
        class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        @click="goBack"
      >
        <ArrowLeft class="w-4 h-4" />
        <span class="text-sm font-medium">Back to Employees</span>
      </button>
      <div v-if="employee" class="flex items-center gap-2">
        <UiButton variant="outline" size="sm" @click="handleToggleStatus">
          <Power :class="['w-4 h-4', employee.isActive ? 'text-score-excellent' : 'text-score-low']" />
          {{ employee.isActive ? 'Deactivate' : 'Activate' }}
        </UiButton>
        <UiButton variant="outline" size="sm" @click="openEdit">
          <Edit class="w-4 h-4" />
          Edit
        </UiButton>
      </div>
    </div>

    <!-- Not found -->
    <div v-if="!employee" class="glass-card p-12 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Building2 class="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 class="text-xl font-bold text-foreground mb-2">Employee Not Found</h2>
      <p class="text-muted-foreground mb-4">The employee you're looking for doesn't exist or was removed.</p>
      <UiButton variant="gradient" @click="goBack">
        <ArrowLeft class="w-4 h-4" />
        Back to Employees
      </UiButton>
    </div>

    <!-- Detail content -->
    <template v-else>
      <!-- Header card -->
      <div class="glass-card p-6">
        <div class="flex flex-col sm:flex-row sm:items-center gap-6">
          <UiAvatar :alt="employee.name" size="xl" class="flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-3 mb-2">
              <h1 class="text-2xl font-bold text-foreground">{{ employee.name }}</h1>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-medium border',
                  employee.isActive
                    ? 'bg-score-excellent/10 text-score-excellent border-score-excellent/30'
                    : 'bg-score-low/10 text-score-low border-score-low/30',
                ]"
              >
                {{ employee.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <p class="text-muted-foreground font-mono text-sm mb-1">{{ employee.employeeId }}</p>
            <p class="text-foreground font-medium">{{ employee.position }}</p>
            <p class="text-sm text-muted-foreground">{{ employee.department }}</p>
          </div>
        </div>
      </div>

      <!-- Tabs: Overview | Employee History -->
      <UiTabs v-model="activeTab" default-value="overview" class="w-full">
        <UiTabsList class="w-full sm:w-auto">
          <UiTabsTrigger value="overview">{{ tHistory('tabOverview') }}</UiTabsTrigger>
          <UiTabsTrigger value="history">{{ tHistory('tabHistory') }}</UiTabsTrigger>
        </UiTabsList>

        <!-- Overview tab content: visibility by activeTab so content always shows when tab is selected -->
        <div v-show="activeTab === 'overview'" class="mt-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left: Contact & basic info -->
        <div class="lg:col-span-1 space-y-6">
          <div class="glass-card p-5">
            <h3 class="text-sm font-semibold text-foreground border-b border-border pb-2 mb-4">Contact & Info</h3>
            <ul class="space-y-3 text-sm">
              <li class="flex items-start gap-3">
                <Mail class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <a :href="`mailto:${employee.email}`" class="text-foreground hover:text-ai-red break-all">{{ employee.email }}</a>
              </li>
              <li v-if="employee.phone" class="flex items-start gap-3">
                <Phone class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <a :href="`tel:${employee.phone}`" class="text-foreground hover:text-ai-red">{{ employee.phone }}</a>
              </li>
              <li v-if="employee.address" class="flex items-start gap-3">
                <MapPin class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">{{ employee.address }}</span>
              </li>
              <li v-if="employee.kelurahan || employee.kecamatan || employee.kota || employee.provinsi" class="flex items-start gap-3">
                <MapPin class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">
                  {{ [employee.kelurahan, employee.kecamatan, employee.kota, employee.provinsi].filter(Boolean).join(', ') }}{{ employee.postalCode ? ` ${tForm('postalCode')}: ${employee.postalCode}` : '' }}
                </span>
              </li>
              <li v-else-if="employee.postalCode" class="flex items-start gap-3">
                <MapPin class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">{{ tForm('postalCode') }}: {{ employee.postalCode }}</span>
              </li>
              <li class="flex items-start gap-3">
                <Calendar class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">Join date: {{ formatDate(employee.joinDate) }}</span>
              </li>
              <li v-if="employee.contractStartDate || employee.contractEndDate || employee.contractDurationType" class="flex items-start gap-3">
                <Calendar class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">{{ tForm('contractPeriod') || 'Masa Kontrak' }}: {{ formatContractPeriod(employee.contractStartDate, employee.contractEndDate, employee.contractDurationType) }}</span>
              </li>
              <li v-if="employee.contractDurationType || (employee.contractStartDate && employee.contractEndDate)" class="flex items-start gap-3">
                <Calendar class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">{{ tForm('contractDuration') || 'Durasi Kontrak' }}: {{ formatContractDuration(employee) }}</span>
              </li>
              <li v-if="employee.directSupervisorId" class="flex items-start gap-3">
                <Users class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">
                  {{ tForm('directSupervisorLabel') }}:
                  <NuxtLink
                    :to="`/employees/${employee.directSupervisorId}`"
                    class="text-ai-red hover:underline"
                  >
                    {{ employeesStore.getEmployeeById(employee.directSupervisorId)?.name ?? employee.directSupervisorId }}
                  </NuxtLink>
                </span>
              </li>
              <li v-if="employee.dateOfBirth" class="flex items-start gap-3">
                <Calendar class="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span class="text-foreground">DOB: {{ formatDate(employee.dateOfBirth) }}</span>
              </li>
              <li v-if="employee.gender" class="flex items-start gap-3">
                <span class="text-foreground">{{ tForm('gender') }}: {{ tForm(employee.gender.toLowerCase()) }}</span>
              </li>
              <li v-if="employee.religion" class="flex items-start gap-3">
                <span class="text-foreground">{{ tForm('religion') }}: {{ tForm(employee.religion.toLowerCase()) }}</span>
              </li>
              <li v-if="employee.marriageStatus" class="flex items-start gap-3">
                <span class="text-foreground">{{ tForm('marriageStatus') }}: {{ tForm(employee.marriageStatus.toLowerCase()) }}</span>
              </li>
              <li v-if="employee.baseSalary != null && employee.baseSalary > 0" class="flex items-start gap-3">
                <span class="text-foreground">{{ tForm('salary') || 'Salary' }}: {{ formatCurrency(employee.baseSalary) }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: Work history, Education, Certifications -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Work History -->
          <div class="glass-card p-5">
            <h3 class="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2 mb-4">
              <Briefcase class="w-4 h-4" />
              Riwayat Pekerjaan
            </h3>
            <div v-if="!employee.workHistory?.length" class="text-sm text-muted-foreground py-4">
              No work history recorded.
            </div>
            <ul v-else class="space-y-4">
              <li
                v-for="(item, index) in (employee.workHistory as WorkHistoryItem[])"
                :key="index"
                class="border border-border rounded-xl p-4 bg-muted/10"
              >
                <p class="font-medium text-foreground">{{ item.position }}</p>
                <p class="text-sm text-muted-foreground">{{ item.company }}</p>
                <p class="text-xs text-muted-foreground mt-1">
                  {{ formatDate(item.startDate) }} – {{ item.endDate ? formatDate(item.endDate) : 'Present' }}
                </p>
                <p v-if="item.description" class="text-sm text-foreground mt-2">{{ item.description }}</p>
              </li>
            </ul>
          </div>

          <!-- Education -->
          <div class="glass-card p-5">
            <h3 class="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2 mb-4">
              <GraduationCap class="w-4 h-4" />
              Riwayat Pendidikan
            </h3>
            <div v-if="!employee.education?.length" class="text-sm text-muted-foreground py-4">
              No education recorded.
            </div>
            <ul v-else class="space-y-4">
              <li
                v-for="(item, index) in (employee.education as EducationItem[])"
                :key="index"
                class="border border-border rounded-xl p-4 bg-muted/10"
              >
                <p class="font-medium text-foreground">{{ item.degree }} – {{ item.fieldOfStudy }}</p>
                <p class="text-sm text-muted-foreground">{{ item.institution }}</p>
                <p class="text-xs text-muted-foreground mt-1">{{ item.startYear }} – {{ item.endYear }}</p>
              </li>
            </ul>
          </div>

          <!-- Certifications -->
          <div class="glass-card p-5">
            <h3 class="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2 mb-4">
              <Award class="w-4 h-4" />
              Sertifikasi
            </h3>
            <div v-if="!employee.certifications?.length" class="text-sm text-muted-foreground py-4">
              No certifications recorded.
            </div>
            <ul v-else class="space-y-3">
              <li
                v-for="(item, index) in (employee.certifications as CertificationItem[])"
                :key="index"
                class="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-muted/10"
              >
                <div>
                  <p class="font-medium text-foreground">{{ item.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ item.issuer }} · {{ formatDate(item.date) }}</p>
                </div>
                <span v-if="item.expiryDate" class="text-xs text-muted-foreground">
                  Expires {{ formatDate(item.expiryDate) }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Documents -->
          <div class="glass-card p-5">
            <div class="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText class="w-4 h-4" />
                Documents
              </h3>
              <UiButton variant="outline" size="sm" @click="openAddDoc">
                <Plus class="w-4 h-4" />
                Add Document
              </UiButton>
            </div>
            <div v-if="!employeeDocuments.length" class="text-sm text-muted-foreground py-4">
              No documents uploaded.
            </div>
            <ul v-else class="space-y-3">
              <li
                v-for="doc in employeeDocuments"
                :key="doc.id"
                class="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-muted/10"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-foreground">{{ getDocumentDisplayName(doc) }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ tDoc('category') }}: {{ doc.type }}
                    <span v-if="doc.description"> · {{ doc.description }}</span>
                    · {{ formatDate(doc.uploadedAt) }}
                  </p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <a
                    v-if="doc.fileData || doc.url"
                    :href="getDocumentHref(doc)"
                    :download="doc.fileName || doc.name"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    :title="tDoc('download')"
                  >
                    <ExternalLink class="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    title="Edit"
                    @click="openEditDoc(doc)"
                  >
                    <Edit class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="p-2 rounded-lg hover:bg-score-low/10 text-score-low"
                    title="Delete"
                    @click="openDeleteDoc(doc)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
        </div>

        <!-- History tab content -->
        <div v-show="activeTab === 'history'" class="mt-6">
          <div class="glass-card p-6">
            <h3 class="text-sm font-semibold text-foreground flex items-center gap-2 border-b border-border pb-2 mb-6">
              <Briefcase class="w-4 h-4" />
              {{ tHistory('heading') }}
            </h3>
            <div v-if="!careerTimeline.length" class="text-sm text-muted-foreground py-8 text-center">
              {{ tHistory('noHistory') }}
            </div>
            <div v-else class="relative">
              <!-- Vertical timeline line -->
              <div
                class="absolute left-5 top-0 bottom-0 w-0.5 bg-border"
                aria-hidden="true"
              />
              <ul class="space-y-0">
                <li
                  v-for="(item, index) in careerTimeline"
                  :key="index"
                  class="relative flex gap-6 pb-8 last:pb-0"
                >
                  <div
                    :class="[
                      'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background',
                      item.type === 'join' && 'bg-score-excellent/20 text-score-excellent',
                      item.type === 'promotion' && 'bg-ai-orange/20 text-ai-orange',
                      (item.type === 'transferDept' || item.type === 'transferDivision') && 'bg-ai-red/20 text-ai-red',
                      item.type === 'retired' && 'bg-score-low/20 text-score-low',
                    ]"
                  >
                    <LogIn v-if="item.type === 'join'" class="w-5 h-5" />
                    <TrendingUp v-else-if="item.type === 'promotion'" class="w-5 h-5" />
                    <Layers v-else-if="item.type === 'transferDivision'" class="w-5 h-5" />
                    <Building v-else-if="item.type === 'transferDept'" class="w-5 h-5" />
                    <UserX v-else class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0 pt-0.5">
                    <p class="text-xs font-medium text-muted-foreground">
                      {{ item.date ? formatDate(item.date) : tHistory('inactive') }}
                    </p>
                    <p class="font-medium text-foreground mt-0.5">{{ tHistory(item.labelKey) }}</p>
                    <template v-if="item.type === 'join'">
                      <p class="text-sm text-muted-foreground mt-1">
                        {{ tHistory('joinDesc') }}
                      </p>
                    </template>
                    <template v-else-if="item.type === 'promotion' && (item.fromPosition || item.toPosition)">
                      <p class="text-sm text-muted-foreground mt-1">
                        {{ item.fromPosition }} → {{ item.toPosition }}
                      </p>
                      <p v-if="item.promotedByLabel" class="text-xs text-muted-foreground mt-1">{{ tHistory('promotedBy') }}: {{ item.promotedByLabel }}</p>
                      <p v-if="item.documentsCount && item.documentsCount > 0" class="text-xs text-muted-foreground mt-0.5">{{ item.documentsCount }} {{ tHistory('documents') }}</p>
                      <p v-if="item.notes" class="text-xs text-muted-foreground mt-1">{{ item.notes }}</p>
                    </template>
                    <template v-else-if="(item.type === 'transferDept' || item.type === 'transferDivision') && (item.fromDepartment || item.toDepartment)">
                      <p class="text-sm text-muted-foreground mt-1">
                        {{ item.fromPosition }} ({{ item.fromDepartment }}{{ item.fromDivision ? ` · ${item.fromDivision}` : '' }}) → {{ item.toPosition }} ({{ item.toDepartment }}{{ item.toDivision ? ` · ${item.toDivision}` : '' }})
                      </p>
                      <p v-if="item.notes" class="text-xs text-muted-foreground mt-1">{{ item.notes }}</p>
                    </template>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </UiTabs>

      <!-- Add/Edit Document Modal -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="showDocModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDocModals" />
            <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
              <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg font-bold text-foreground">
                  {{ editingDoc ? tDoc('editTitle') : tDoc('addTitle') }}
                </h2>
                <button type="button" class="p-2 rounded-lg hover:bg-muted/50" @click="closeDocModals">
                  <X class="w-5 h-5" />
                </button>
              </div>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">{{ tDoc('file') }} {{ editingDoc ? '' : '*' }}</label>
                  <input
                    ref="docFileInputRef"
                    type="file"
                    class="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-muted file:text-foreground file:font-medium hover:file:bg-muted/80 file:cursor-pointer cursor-pointer border border-border rounded-xl bg-background px-3 py-2"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    @change="onDocFileChange"
                  >
                  <p v-if="docForm.file" class="text-xs text-muted-foreground mt-1">{{ docForm.file.name }}</p>
                  <p v-else-if="editingDoc?.fileName" class="text-xs text-muted-foreground mt-1">{{ tDoc('currentFile') }}: {{ editingDoc.fileName }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">{{ tDoc('name') }} *</label>
                  <UiInput v-model="docForm.name" :placeholder="tDoc('namePlaceholder')" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">{{ tDoc('category') }}</label>
                  <UiSelect
                    v-model="docForm.type"
                    :options="documentTypes"
                    :placeholder="tDoc('categoryPlaceholder')"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">{{ tDoc('description') }}</label>
                  <UiInput v-model="docForm.description" :placeholder="tDoc('descriptionPlaceholder')" />
                </div>
              </div>
              <div class="flex justify-end gap-3 mt-6">
                <UiButton variant="outline" @click="closeDocModals">{{ tCommon('cancel') }}</UiButton>
                <UiButton variant="gradient" :disabled="!isDocFormValid" :loading="isSavingDoc" @click="saveDocument">
                  <Check class="w-4 h-4" />
                  {{ editingDoc ? tCommon('save') : tDoc('upload') }}
                </UiButton>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Delete Document Modal -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition duration-150"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="showDocDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDocModals" />
            <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 text-center">
              <div class="w-12 h-12 mx-auto rounded-full bg-score-low/10 flex items-center justify-center mb-4">
                <Trash2 class="w-6 h-6 text-score-low" />
              </div>
              <h2 class="text-lg font-bold text-foreground mb-2">Delete Document</h2>
              <p class="text-muted-foreground mb-6">
                Remove "{{ docToDelete?.name }}"? This cannot be undone.
              </p>
              <div class="flex justify-center gap-3">
                <UiButton variant="outline" @click="closeDocModals">Cancel</UiButton>
                <UiButton
                  variant="outline"
                  class="text-score-low border-score-low/30 hover:bg-score-low/10"
                  @click="confirmDeleteDoc"
                >
                  <Trash2 class="w-4 h-4" />
                  Delete
                </UiButton>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>
