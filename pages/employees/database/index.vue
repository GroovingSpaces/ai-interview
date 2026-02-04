<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import type {
  Employee,
  CreateEmployeePayload,
  WorkHistoryItem,
  EducationItem,
  CertificationItem,
} from '~/stores/employees'
import {
  getProvinceOptions,
  getCityOptions,
  getKecamatanOptions,
  getKelurahanOptions,
} from '~/data/indonesia-regions'
import {
  Search,
  Plus,
  UsersRound,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Building2,
  Power,
  Briefcase,
  GraduationCap,
  Award,
  Eye,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin',
})

const { title } = usePageTitle('employee')
const tForm = useModuleT('employeeForm')
useHead({ title: () => title.value })

const route = useRoute()
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedEmployee = ref<Employee | null>(null)

function emptyWorkHistory(): WorkHistoryItem {
  return { company: '', position: '', startDate: '', endDate: '', description: '' }
}
function emptyEducation(): EducationItem {
  return { institution: '', degree: '', fieldOfStudy: '', startYear: '', endYear: '' }
}
function emptyCertification(): CertificationItem {
  return { name: '', issuer: '', date: '', expiryDate: '' }
}

const formData = ref({
  name: '',
  email: '',
  employeeId: '',
  department: '',
  departmentId: '',
  divisionId: '',
  positionLevelId: '',
  locationId: '',
  organizationId: '',
  position: '',
  joinDate: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  religion: '',
  marriageStatus: '',
  address: '',
  provinsi: '',
  kota: '',
  kecamatan: '',
  kelurahan: '',
  postalCode: '',
  directSupervisorId: '',
  employeeStatus: '',
  workHistory: [] as WorkHistoryItem[],
  education: [] as EducationItem[],
  certifications: [] as CertificationItem[],
})

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const departmentOptions = computed(() => [
  { value: 'all', label: 'All Departments' },
  ...employeesStore.departments.map((d) => ({ value: d, label: d })),
])

// Company module options for Add/Edit form
const formDepartmentOptions = computed(() => [
  { value: '', label: 'Select department' },
  ...companyStore.departments.map((d) => ({ value: d.id, label: d.name })),
])
const formDivisionOptions = computed(() => [
  { value: '', label: 'Select division' },
  ...companyStore.divisions.map((d) => ({ value: d.id, label: d.name })),
])
const formPositionLevelOptions = computed(() => [
  { value: '', label: 'Select position level' },
  ...companyStore.positionLevels.map((p) => ({ value: p.id, label: p.name })),
])
const formLocationOptions = computed(() => [
  { value: '', label: 'Select location' },
  ...companyStore.locations.map((l) => ({ value: l.id, label: l.name })),
])
const formOrganizationOptions = computed(() => [
  { value: '', label: 'Select organization' },
  ...companyStore.organizations.map((o) => ({ value: o.id, label: o.name })),
])

// Atasan langsung: semua karyawan kecuali diri sendiri saat edit
const directSupervisorOptions = computed(() => {
  const list = employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` }))
  const excludeId = selectedEmployee.value?.id
  const filtered = excludeId ? list.filter((o) => o.value !== excludeId) : list
  return [{ value: '', label: tForm('selectSupervisor') }, ...filtered]
})

// Employee status: PKWTT, PKWT, INTERNSHIP, DAILY_WORKER, FREELANCE
const employeeStatusOptions = computed(() => [
  { value: '', label: tForm('selectEmployeeStatus') },
  { value: 'PKWTT', label: tForm('statusPkwtt') },
  { value: 'PKWT', label: tForm('statusPkwt') },
  { value: 'INTERNSHIP', label: tForm('statusInternship') },
  { value: 'DAILY_WORKER', label: tForm('statusDailyWorker') },
  { value: 'FREELANCE', label: tForm('statusFreelance') },
])

const genderOptions = computed(() => [
  { value: '', label: tForm('selectGender') },
  { value: 'MALE', label: tForm('male') },
  { value: 'FEMALE', label: tForm('female') },
])
const religionOptions = computed(() => [
  { value: '', label: tForm('selectReligion') },
  { value: 'ISLAM', label: tForm('islam') },
  { value: 'CHRISTIAN', label: tForm('christian') },
  { value: 'CATHOLIC', label: tForm('catholic') },
  { value: 'HINDU', label: tForm('hindu') },
  { value: 'BUDDHIST', label: tForm('buddhist') },
  { value: 'CONFUCIANISM', label: tForm('confucianism') },
])
const marriageStatusOptions = computed(() => [
  { value: '', label: tForm('selectMarriageStatus') },
  { value: 'SINGLE', label: tForm('single') },
  { value: 'MARRIED', label: tForm('married') },
  { value: 'DIVORCED', label: tForm('divorced') },
  { value: 'WIDOWED', label: tForm('widowed') },
])

const provinceOptions = computed(() => getProvinceOptions(tForm('selectProvince')))
const cityOptions = computed(() => getCityOptions(tForm('selectCity')))
const kecamatanOptions = computed(() => getKecamatanOptions(tForm('selectSubDistrict')))
const kelurahanOptions = computed(() => getKelurahanOptions(tForm('selectVillage')))

function resetForm() {
  formData.value = {
    name: '',
    email: '',
    employeeId: '',
    department: '',
    departmentId: '',
    divisionId: '',
    positionLevelId: '',
    locationId: '',
    organizationId: '',
    position: '',
    joinDate: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    religion: '',
    marriageStatus: '',
    address: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    postalCode: '',
    directSupervisorId: '',
    employeeStatus: '',
    workHistory: [],
    education: [],
    certifications: [],
  }
}

function addWorkHistory() {
  formData.value.workHistory.push(emptyWorkHistory())
}
function removeWorkHistory(index: number) {
  formData.value.workHistory.splice(index, 1)
}

function addEducation() {
  formData.value.education.push(emptyEducation())
}
function removeEducation(index: number) {
  formData.value.education.splice(index, 1)
}

function addCertification() {
  formData.value.certifications.push(emptyCertification())
}
function removeCertification(index: number) {
  formData.value.certifications.splice(index, 1)
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(emp: Employee) {
  selectedEmployee.value = emp
  const deptId = emp.departmentId ?? companyStore.departments.find((d) => d.name === emp.department)?.id ?? ''
  formData.value = {
    name: emp.name,
    email: emp.email,
    employeeId: emp.employeeId,
    department: emp.department,
    departmentId: deptId,
    divisionId: emp.divisionId ?? '',
    positionLevelId: emp.positionLevelId ?? '',
    locationId: emp.locationId ?? '',
    organizationId: emp.organizationId ?? '',
    position: emp.position,
    joinDate: emp.joinDate,
    phone: emp.phone || '',
    dateOfBirth: emp.dateOfBirth || '',
    gender: emp.gender ?? '',
    religion: emp.religion ?? '',
    marriageStatus: emp.marriageStatus ?? '',
    address: emp.address || '',
    provinsi: emp.provinsi ?? '',
    kota: emp.kota ?? '',
    kecamatan: emp.kecamatan ?? '',
    kelurahan: emp.kelurahan ?? '',
    postalCode: emp.postalCode ?? '',
    directSupervisorId: emp.directSupervisorId ?? '',
    employeeStatus: emp.employeeStatus ?? '',
    workHistory: emp.workHistory?.length
      ? emp.workHistory.map((w) => ({ ...w, description: w.description ?? '' }))
      : [],
    education: emp.education?.length ? [...emp.education] : [],
    certifications: emp.certifications?.length ? [...emp.certifications] : [],
  }
  showEditModal.value = true
}

function openDeleteModal(emp: Employee) {
  selectedEmployee.value = emp
  showDeleteModal.value = true
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedEmployee.value = null
  resetForm()
}

function sanitizeWorkHistory(): WorkHistoryItem[] {
  return formData.value.workHistory
    .filter((w) => w.company.trim() || w.position.trim())
    .map((w) => ({
      company: w.company.trim(),
      position: w.position.trim(),
      startDate: w.startDate,
      endDate: w.endDate,
      description: w.description?.trim() || undefined,
    }))
}
function sanitizeEducation(): EducationItem[] {
  return formData.value.education
    .filter((e) => e.institution.trim() || e.degree.trim())
    .map((e) => ({
      institution: e.institution.trim(),
      degree: e.degree.trim(),
      fieldOfStudy: e.fieldOfStudy.trim(),
      startYear: e.startYear.trim(),
      endYear: e.endYear.trim(),
    }))
}
function sanitizeCertifications(): CertificationItem[] {
  return formData.value.certifications
    .filter((c) => c.name.trim() || c.issuer.trim())
    .map((c) => ({
      name: c.name.trim(),
      issuer: c.issuer.trim(),
      date: c.date,
      expiryDate: c.expiryDate || undefined,
    }))
}

function handleCreate() {
  const departmentName = formData.value.departmentId
    ? companyStore.getDepartmentById(formData.value.departmentId)?.name ?? ''
    : formData.value.department.trim()
  const payload: CreateEmployeePayload = {
    name: formData.value.name.trim(),
    email: formData.value.email.trim(),
    employeeId: formData.value.employeeId.trim(),
    department: departmentName,
    position: formData.value.position.trim(),
    joinDate: formData.value.joinDate,
    phone: formData.value.phone.trim() || undefined,
    dateOfBirth: formData.value.dateOfBirth.trim() || undefined,
    gender: formData.value.gender || undefined,
    religion: formData.value.religion || undefined,
    marriageStatus: formData.value.marriageStatus || undefined,
    address: formData.value.address.trim() || undefined,
    provinsi: formData.value.provinsi || undefined,
    kota: formData.value.kota || undefined,
    kecamatan: formData.value.kecamatan || undefined,
    kelurahan: formData.value.kelurahan || undefined,
    postalCode: formData.value.postalCode.trim() || undefined,
    departmentId: formData.value.departmentId || undefined,
    divisionId: formData.value.divisionId || undefined,
    positionLevelId: formData.value.positionLevelId || undefined,
    locationId: formData.value.locationId || undefined,
    organizationId: formData.value.organizationId || undefined,
    workHistory: sanitizeWorkHistory(),
    education: sanitizeEducation(),
    certifications: sanitizeCertifications(),
    directSupervisorId: formData.value.directSupervisorId || undefined,
    employeeStatus: formData.value.employeeStatus || undefined,
  }
  employeesStore.addEmployee(payload)
  closeModals()
}

function handleUpdate() {
  if (!selectedEmployee.value) return
  const departmentName = formData.value.departmentId
    ? companyStore.getDepartmentById(formData.value.departmentId)?.name ?? ''
    : formData.value.department.trim()
  employeesStore.updateEmployee(selectedEmployee.value.id, {
    name: formData.value.name.trim(),
    email: formData.value.email.trim(),
    employeeId: formData.value.employeeId.trim(),
    department: departmentName,
    position: formData.value.position.trim(),
    joinDate: formData.value.joinDate,
    phone: formData.value.phone.trim() || undefined,
    dateOfBirth: formData.value.dateOfBirth.trim() || undefined,
    gender: formData.value.gender || undefined,
    religion: formData.value.religion || undefined,
    marriageStatus: formData.value.marriageStatus || undefined,
    address: formData.value.address.trim() || undefined,
    provinsi: formData.value.provinsi || undefined,
    kota: formData.value.kota || undefined,
    kecamatan: formData.value.kecamatan || undefined,
    kelurahan: formData.value.kelurahan || undefined,
    postalCode: formData.value.postalCode.trim() || undefined,
    departmentId: formData.value.departmentId || undefined,
    divisionId: formData.value.divisionId || undefined,
    positionLevelId: formData.value.positionLevelId || undefined,
    locationId: formData.value.locationId || undefined,
    organizationId: formData.value.organizationId || undefined,
    workHistory: sanitizeWorkHistory(),
    education: sanitizeEducation(),
    certifications: sanitizeCertifications(),
    directSupervisorId: formData.value.directSupervisorId || undefined,
    employeeStatus: formData.value.employeeStatus || undefined,
  })
  closeModals()
}

function handleDelete() {
  if (!selectedEmployee.value) return
  employeesStore.deleteEmployee(selectedEmployee.value.id)
  closeModals()
}

function handleToggleStatus(emp: Employee) {
  employeesStore.toggleEmployeeStatus(emp.id)
}

function goToDetail(emp: Employee) {
  navigateTo(`/employees/${emp.id}`)
}

onMounted(() => {
  const editId = route.query.edit as string | undefined
  if (editId) {
    const emp = employeesStore.getEmployeeById(editId)
    if (emp) openEditModal(emp)
  }
})

const isFormValid = computed(() => {
  return (
    formData.value.name.trim() !== '' &&
    formData.value.email.trim() !== '' &&
    formData.value.employeeId.trim() !== '' &&
    formData.value.departmentId !== '' &&
    formData.value.position.trim() !== '' &&
    formData.value.joinDate !== ''
  )
})

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-muted-foreground">Manage employees and organizational structure</p>
      </div>
      <UiButton variant="gradient" @click="openCreateModal">
        <Plus class="w-4 h-4" />
        Add Employee
      </UiButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary/10">
            <UsersRound class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ employeesStore.employeeStats.total }}</p>
            <p class="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-score-excellent/10">
            <UserCheck class="w-5 h-5 text-score-excellent" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ employeesStore.employeeStats.active }}</p>
            <p class="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-score-low/10">
            <UserX class="w-5 h-5 text-score-low" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ employeesStore.employeeStats.inactive }}</p>
            <p class="text-xs text-muted-foreground">Inactive</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-ai-red/10">
            <Building2 class="w-5 h-5 text-ai-red" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ employeesStore.departments.length }}</p>
            <p class="text-xs text-muted-foreground">Departments</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput
          v-model="employeesStore.searchQuery"
          placeholder="Search by name, email, employee ID, department..."
          class="pl-11"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <UiSelect
          v-model="employeesStore.departmentFilter"
          :options="departmentOptions"
          class="w-44"
        />
        <UiSelect
          v-model="employeesStore.statusFilter"
          :options="statusOptions"
          class="w-36"
        />
      </div>
    </div>

    <!-- Employees List -->
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Showing {{ employeesStore.filteredEmployees.length }} employee(s)
      </p>

      <div v-if="employeesStore.filteredEmployees.length === 0" class="glass-card p-12 text-center">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <UsersRound class="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">No Employees Found</h3>
        <p class="text-muted-foreground mb-4">Try adjusting your search or filter, or add a new employee.</p>
        <UiButton variant="gradient" @click="openCreateModal">
          <Plus class="w-4 h-4" />
          Add Employee
        </UiButton>
      </div>

      <!-- Table -->
      <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-max">
            <thead>
              <tr class="border-b border-border bg-muted/30">
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Employee</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Position</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Join Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="emp in employeesStore.filteredEmployees"
                :key="emp.id"
                class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      title="View Detail"
                      @click="goToDetail(emp)"
                    >
                      <Eye class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      title="Toggle Status"
                      @click="handleToggleStatus(emp)"
                    >
                      <Power :class="['w-4 h-4', emp.isActive ? 'text-score-excellent' : 'text-score-low']" />
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      title="Edit Employee"
                      @click="openEditModal(emp)"
                    >
                      <Edit class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-score-low/10 transition-colors"
                      title="Delete Employee"
                      @click="openDeleteModal(emp)"
                    >
                      <Trash2 class="w-4 h-4 text-score-low" />
                    </button>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :alt="emp.name" size="md" />
                    <div>
                      <button
                        type="button"
                        class="font-medium text-foreground hover:text-ai-red hover:underline transition-colors text-left"
                        @click="goToDetail(emp)"
                      >
                        {{ emp.name }}
                      </button>
                      <p class="text-sm text-muted-foreground">{{ emp.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm font-mono text-muted-foreground">{{ emp.employeeId }}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{ emp.department }}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{ emp.position }}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{ formatDate(emp.joinDate) }}</span>
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      emp.isActive
                        ? 'bg-score-excellent/10 text-score-excellent border-score-excellent/30'
                        : 'bg-score-low/10 text-score-low border-score-low/30',
                    ]"
                  >
                    {{ emp.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal (Advanced Form) -->
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
          v-if="showCreateModal || showEditModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />

          <div class="relative w-full max-w-4xl bg-card border border-border rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div class="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-foreground">
                  {{ showCreateModal ? 'Add New Employee' : 'Edit Employee' }}
                </h2>
                <button class="p-2 rounded-lg hover:bg-muted/50 transition-colors" @click="closeModals">
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <div class="p-6 space-y-8 overflow-y-auto flex-1">
              <!-- Section: Data Pribadi & Pekerjaan -->
              <div class="space-y-4">
                <h3 class="text-sm font-semibold text-foreground border-b border-border pb-2">Data Pribadi & Pekerjaan</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <UiInput v-model="formData.name" placeholder="Enter full name" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <UiInput v-model="formData.email" type="email" placeholder="Enter email address" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Employee ID *</label>
                    <UiInput v-model="formData.employeeId" placeholder="e.g. EMP001" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
                    <UiInput v-model="formData.dateOfBirth" type="date" placeholder="YYYY-MM-DD" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <UiInput v-model="formData.phone" type="tel" placeholder="e.g. +62 812-3456-7890" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('gender') }}</label>
                    <UiSelect
                      v-model="formData.gender"
                      :options="genderOptions"
                      :placeholder="tForm('selectGender')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('religion') }}</label>
                    <UiSelect
                      v-model="formData.religion"
                      :options="religionOptions"
                      :placeholder="tForm('selectReligion')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('marriageStatus') }}</label>
                    <UiSelect
                      v-model="formData.marriageStatus"
                      :options="marriageStatusOptions"
                      :placeholder="tForm('selectMarriageStatus')"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-foreground mb-2">Address</label>
                    <UiInput v-model="formData.address" placeholder="Full address" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('province') }}</label>
                    <UiSelect
                      v-model="formData.provinsi"
                      :options="provinceOptions"
                      :placeholder="tForm('selectProvince')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('city') }}</label>
                    <UiSelect
                      v-model="formData.kota"
                      :options="cityOptions"
                      :placeholder="tForm('selectCity')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('subDistrict') }}</label>
                    <UiSelect
                      v-model="formData.kecamatan"
                      :options="kecamatanOptions"
                      :placeholder="tForm('selectSubDistrict')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('village') }}</label>
                    <UiSelect
                      v-model="formData.kelurahan"
                      :options="kelurahanOptions"
                      :placeholder="tForm('selectVillage')"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('postalCode') }}</label>
                    <UiInput v-model="formData.postalCode" placeholder="e.g. 12345" maxlength="10" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Organization</label>
                    <UiSelect
                      v-model="formData.organizationId"
                      :options="formOrganizationOptions"
                      placeholder="Select organization"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Department *</label>
                    <UiSelect
                      v-model="formData.departmentId"
                      :options="formDepartmentOptions"
                      placeholder="Select department"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Division</label>
                    <UiSelect
                      v-model="formData.divisionId"
                      :options="formDivisionOptions"
                      placeholder="Select division"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Position *</label>
                    <UiInput v-model="formData.position" placeholder="e.g. Software Engineer" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Position Level</label>
                    <UiSelect
                      v-model="formData.positionLevelId"
                      :options="formPositionLevelOptions"
                      placeholder="Select position level"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Location</label>
                    <UiSelect
                      v-model="formData.locationId"
                      :options="formLocationOptions"
                      placeholder="Select location"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Join Date *</label>
                    <UiInput v-model="formData.joinDate" type="date" placeholder="YYYY-MM-DD" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('employeeStatus') }}</label>
                    <UiSelect
                      v-model="formData.employeeStatus"
                      :options="employeeStatusOptions"
                      :placeholder="tForm('selectEmployeeStatus')"
                    />
                  </div>
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-foreground mb-2">{{ tForm('directSupervisorLabel') }}</label>
                    <UiSelect
                      v-model="formData.directSupervisorId"
                      :options="directSupervisorOptions"
                      :placeholder="tForm('selectSupervisorPlaceholder')"
                    />
                  </div>
                </div>
              </div>

              <!-- Section: Riwayat Pekerjaan (Repeater) -->
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-border pb-2">
                  <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Briefcase class="w-4 h-4" />
                    Riwayat Pekerjaan
                  </h3>
                  <UiButton type="button" variant="outline" size="sm" @click="addWorkHistory">
                    <Plus class="w-4 h-4" />
                    Tambah
                  </UiButton>
                </div>
                <div v-if="formData.workHistory.length === 0" class="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
                  Belum ada riwayat pekerjaan. Klik "Tambah" untuk menambah.
                </div>
                <div v-else class="space-y-4">
                  <div
                    v-for="(item, index) in formData.workHistory"
                    :key="'wh-' + index"
                    class="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                  >
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-muted-foreground">Pekerjaan #{{ index + 1 }}</span>
                      <button
                        type="button"
                        class="p-1.5 rounded-lg hover:bg-score-low/10 text-score-low transition-colors"
                        title="Hapus"
                        @click="removeWorkHistory(index)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Perusahaan</label>
                        <UiInput v-model="item.company" placeholder="Nama perusahaan" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Jabatan</label>
                        <UiInput v-model="item.position" placeholder="Jabatan" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Mulai</label>
                        <UiInput v-model="item.startDate" type="date" placeholder="YYYY-MM-DD" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Selesai</label>
                        <UiInput v-model="item.endDate" type="date" placeholder="YYYY-MM-DD" />
                      </div>
                      <div class="sm:col-span-2">
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Deskripsi</label>
                        <UiInput v-model="item.description" placeholder="Deskripsi singkat (opsional)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Riwayat Pendidikan (Repeater) -->
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-border pb-2">
                  <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
                    <GraduationCap class="w-4 h-4" />
                    Riwayat Pendidikan
                  </h3>
                  <UiButton type="button" variant="outline" size="sm" @click="addEducation">
                    <Plus class="w-4 h-4" />
                    Tambah
                  </UiButton>
                </div>
                <div v-if="formData.education.length === 0" class="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
                  Belum ada riwayat pendidikan. Klik "Tambah" untuk menambah.
                </div>
                <div v-else class="space-y-4">
                  <div
                    v-for="(item, index) in formData.education"
                    :key="'edu-' + index"
                    class="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                  >
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-muted-foreground">Pendidikan #{{ index + 1 }}</span>
                      <button
                        type="button"
                        class="p-1.5 rounded-lg hover:bg-score-low/10 text-score-low transition-colors"
                        title="Hapus"
                        @click="removeEducation(index)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Institusi</label>
                        <UiInput v-model="item.institution" placeholder="Nama sekolah/universitas" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Gelar / Jenjang</label>
                        <UiInput v-model="item.degree" placeholder="e.g. S1, S2, SMA" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Bidang Studi</label>
                        <UiInput v-model="item.fieldOfStudy" placeholder="e.g. Computer Science" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Tahun Mulai</label>
                        <UiInput v-model="item.startYear" placeholder="e.g. 2015" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Tahun Selesai</label>
                        <UiInput v-model="item.endYear" placeholder="e.g. 2019" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Section: Sertifikasi (Repeater) -->
              <div class="space-y-4">
                <div class="flex items-center justify-between border-b border-border pb-2">
                  <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Award class="w-4 h-4" />
                    Sertifikasi
                  </h3>
                  <UiButton type="button" variant="outline" size="sm" @click="addCertification">
                    <Plus class="w-4 h-4" />
                    Tambah
                  </UiButton>
                </div>
                <div v-if="formData.certifications.length === 0" class="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground text-sm">
                  Belum ada sertifikasi. Klik "Tambah" untuk menambah.
                </div>
                <div v-else class="space-y-4">
                  <div
                    v-for="(item, index) in formData.certifications"
                    :key="'cert-' + index"
                    class="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                  >
                    <div class="flex justify-between items-center">
                      <span class="text-xs font-medium text-muted-foreground">Sertifikasi #{{ index + 1 }}</span>
                      <button
                        type="button"
                        class="p-1.5 rounded-lg hover:bg-score-low/10 text-score-low transition-colors"
                        title="Hapus"
                        @click="removeCertification(index)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </button>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Nama Sertifikasi</label>
                        <UiInput v-model="item.name" placeholder="e.g. AWS Solutions Architect" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Penerbit</label>
                        <UiInput v-model="item.issuer" placeholder="e.g. Amazon Web Services" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Terbit</label>
                        <UiInput v-model="item.date" type="date" placeholder="YYYY-MM-DD" />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Kadaluarsa (opsional)</label>
                        <UiInput v-model="item.expiryDate" type="date" placeholder="YYYY-MM-DD" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-6 z-10">
              <div class="flex justify-end gap-3">
                <UiButton variant="outline" @click="closeModals">Cancel</UiButton>
                <UiButton
                  variant="gradient"
                  :disabled="!isFormValid"
                  @click="showCreateModal ? handleCreate() : handleUpdate()"
                >
                  <Check class="w-4 h-4" />
                  {{ showCreateModal ? 'Add Employee' : 'Save Changes' }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />

          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-full bg-score-low/10 flex items-center justify-center mb-4">
                <AlertTriangle class="w-8 h-8 text-score-low" />
              </div>
              <h2 class="text-xl font-bold text-foreground mb-2">Delete Employee</h2>
              <p class="text-muted-foreground mb-6">
                Are you sure you want to delete "{{ selectedEmployee?.name }}" ({{ selectedEmployee?.employeeId }})? This action cannot be undone.
              </p>
              <div class="flex justify-center gap-3">
                <UiButton variant="outline" @click="closeModals">Cancel</UiButton>
                <UiButton
                  variant="outline"
                  class="text-score-low border-score-low/30 hover:bg-score-low/10"
                  @click="handleDelete"
                >
                  <Trash2 class="w-4 h-4" />
                  Delete
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
