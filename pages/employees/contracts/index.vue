<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus, Search, FileText, AlertTriangle, Eye, Pencil, Trash2,
  XCircle, RefreshCcw, Award, History, Crown, Clock, Calendar,
} from 'lucide-vue-next'
import {
  useContractsStore,
  type EmployeeContract,
  type ContractType,
  type ContractDuration,
} from '~/stores/contracts'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/lib/utils'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('employeeContracts')
useHead({ title: () => title.value })

const contractsStore = useContractsStore()
const employeesStore = useEmployeesStore()
const filteredContracts = computed(() => contractsStore.filtered)
const pagination = usePagination(filteredContracts, { pageSize: 10 })
const authStore = useAuthStore()

const meId = computed(() => authStore.user?.id ?? '99')

// Modal states
const showForm = ref(false)
const showDelete = ref(false)
const showDetail = ref(false)
const showTerminate = ref(false)
const showExtend = ref(false)
const showConvert = ref(false)

const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)
const detailId = ref<string | null>(null)

// Create / edit form
interface FormState {
  employeeId: string
  type: ContractType
  duration: ContractDuration
  startDate: string
  endDate: string
  baseSalary: number | undefined
  positionAtContract: string
  departmentAtContract: string
  notes: string
}
const emptyForm = (): FormState => ({
  employeeId: '',
  type: 'PKWT',
  duration: '1_YEAR',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  baseSalary: undefined,
  positionAtContract: '',
  departmentAtContract: '',
  notes: '',
})
const form = ref<FormState>(emptyForm())

// Terminate form
const terminateForm = ref({
  terminationDate: new Date().toISOString().slice(0, 10),
  reason: '',
  severance: undefined as number | undefined,
  notes: '',
})

// Extend form
const extendForm = ref({
  newDuration: '1_YEAR' as ContractDuration,
  newStartDate: '',
  newBaseSalary: undefined as number | undefined,
  newPosition: '',
  newDepartment: '',
  reason: '',
  notes: '',
})

// Convert form
const convertForm = ref({
  effectiveDate: new Date().toISOString().slice(0, 10),
  newBaseSalary: undefined as number | undefined,
  newPosition: '',
  newDepartment: '',
  reason: 'Konversi ke karyawan tetap setelah evaluasi performa.',
  notes: '',
})

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [{ value: '', label: 'Semua Karyawan' }, ...employeeOptions.value])

const typeOptions = (Object.keys(contractsStore.typeLabels) as ContractType[]).map((k) => ({
  value: k,
  label: contractsStore.typeLabels[k],
}))
const typeFilterOptions = [{ value: 'all', label: 'Semua Tipe' }, ...typeOptions]

const durationOptions = (Object.keys(contractsStore.durationLabels) as ContractDuration[]).map((k) => ({
  value: k,
  label: contractsStore.durationLabels[k],
}))
const extendDurationOptions = durationOptions.filter((o) => o.value !== 'PERMANENT')

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'expired', label: 'Kadaluarsa' },
  { value: 'terminated', label: 'Diterminasi' },
  { value: 'extended', label: 'Diperpanjang' },
  { value: 'converted', label: 'Dikonversi' },
]

const isEdit = computed(() => editingId.value !== null)
const isFormValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.startDate !== '' &&
    (form.value.baseSalary ?? 0) > 0,
)

// Computed end date based on selected duration in form
const computedEndDate = computed(() => {
  if (!form.value.startDate || form.value.duration === 'PERMANENT') return ''
  return contractsStore.endDateFromDuration(form.value.startDate, form.value.duration) ?? ''
})

const detail = computed(() => (detailId.value ? contractsStore.getContractById(detailId.value) : null))
const target = computed(() => (targetId.value ? contractsStore.getContractById(targetId.value) : null))

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}

function statusTone(status: string): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (status === 'active') return 'good'
  if (status === 'terminated') return 'low'
  if (status === 'expired') return 'low'
  if (status === 'extended') return 'primary'
  if (status === 'converted') return 'good'
  return 'muted'
}

function isExpiringSoon(c: EmployeeContract): boolean {
  if (c.status !== 'active' || !c.endDate) return false
  const days = (new Date(c.endDate).getTime() - Date.now()) / 86400000
  return days >= 0 && days <= 60
}

function daysToEnd(c: EmployeeContract): number | null {
  if (!c.endDate) return null
  return Math.ceil((new Date(c.endDate).getTime() - Date.now()) / 86400000)
}

// Actions
function openAdd() {
  editingId.value = null
  form.value = emptyForm()
  showForm.value = true
}
function onEmployeePicked(empId: string) {
  form.value.employeeId = empId
  const e = employeesStore.getEmployeeById(empId)
  if (e) {
    form.value.positionAtContract = e.position
    form.value.departmentAtContract = e.department
    if (e.baseSalary) form.value.baseSalary = e.baseSalary
  }
}
function openEdit(c: EmployeeContract) {
  editingId.value = c.id
  form.value = {
    employeeId: c.employeeId,
    type: c.type,
    duration: c.duration,
    startDate: c.startDate,
    endDate: c.endDate ?? '',
    baseSalary: c.baseSalary,
    positionAtContract: c.positionAtContract ?? '',
    departmentAtContract: c.departmentAtContract ?? '',
    notes: c.notes ?? '',
  }
  showForm.value = true
}
function handleSave() {
  if (!isFormValid.value) return
  const f = form.value
  if (isEdit.value && editingId.value) {
    contractsStore.updateContract(editingId.value, {
      type: f.type,
      duration: f.duration,
      startDate: f.startDate,
      endDate: f.endDate || (f.duration === 'PERMANENT' ? undefined : computedEndDate.value),
      baseSalary: Number(f.baseSalary) || 0,
      positionAtContract: f.positionAtContract || undefined,
      departmentAtContract: f.departmentAtContract || undefined,
      notes: f.notes || undefined,
    })
  } else {
    contractsStore.addContract({
      employeeId: f.employeeId,
      type: f.type,
      duration: f.duration,
      startDate: f.startDate,
      endDate: f.endDate || undefined,
      baseSalary: Number(f.baseSalary) || 0,
      positionAtContract: f.positionAtContract || undefined,
      departmentAtContract: f.departmentAtContract || undefined,
      notes: f.notes || undefined,
      performedBy: meId.value,
      reason: 'Pembuatan kontrak baru',
    })
  }
  showForm.value = false
}

function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) contractsStore.deleteContract(targetId.value)
  showDelete.value = false
}

function openDetail(id: string) {
  detailId.value = id
  showDetail.value = true
}

// Terminate
function openTerminate(id: string) {
  targetId.value = id
  terminateForm.value = {
    terminationDate: new Date().toISOString().slice(0, 10),
    reason: '',
    severance: undefined,
    notes: '',
  }
  showTerminate.value = true
}
const isTerminateValid = computed(() => terminateForm.value.terminationDate !== '' && terminateForm.value.reason.trim() !== '')
function confirmTerminate() {
  if (!targetId.value || !isTerminateValid.value) return
  contractsStore.terminateContract(targetId.value, {
    terminationDate: terminateForm.value.terminationDate,
    reason: terminateForm.value.reason,
    severance: terminateForm.value.severance,
    notes: terminateForm.value.notes,
    performedBy: meId.value,
  })
  // Sync employee active status
  const c = contractsStore.getContractById(targetId.value)
  if (c) employeesStore.updateEmployee(c.employeeId, { isActive: false })
  showTerminate.value = false
}

// Extend
function openExtend(id: string) {
  targetId.value = id
  const c = contractsStore.getContractById(id)
  // Default new start = day after current end
  const baseEnd = c?.endDate
  const nextStart = baseEnd
    ? new Date(new Date(baseEnd).getTime() + 86400000).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  extendForm.value = {
    newDuration: '1_YEAR',
    newStartDate: nextStart,
    newBaseSalary: c?.baseSalary,
    newPosition: c?.positionAtContract ?? '',
    newDepartment: c?.departmentAtContract ?? '',
    reason: 'Perpanjangan kontrak setelah evaluasi.',
    notes: '',
  }
  showExtend.value = true
}
const isExtendValid = computed(
  () =>
    extendForm.value.newStartDate !== '' && (extendForm.value.newBaseSalary ?? 0) > 0,
)
const extendNewEndDate = computed(() => {
  if (!extendForm.value.newStartDate) return ''
  return contractsStore.endDateFromDuration(extendForm.value.newStartDate, extendForm.value.newDuration) ?? ''
})
function confirmExtend() {
  if (!targetId.value || !isExtendValid.value) return
  const newId = contractsStore.extendContract(targetId.value, {
    newDuration: extendForm.value.newDuration,
    newStartDate: extendForm.value.newStartDate,
    newBaseSalary: Number(extendForm.value.newBaseSalary) || 0,
    newPosition: extendForm.value.newPosition || undefined,
    newDepartment: extendForm.value.newDepartment || undefined,
    reason: extendForm.value.reason,
    notes: extendForm.value.notes,
    performedBy: meId.value,
  })
  if (newId) {
    const c = contractsStore.getContractById(newId)
    if (c) {
      employeesStore.updateEmployee(c.employeeId, {
        baseSalary: c.baseSalary,
        contractStartDate: c.startDate,
        contractEndDate: c.endDate,
        contractDurationType: c.duration === 'PERMANENT' ? 'PERMANENT' : (c.duration as '3_MONTHS' | '6_MONTHS' | '1_YEAR'),
      })
    }
  }
  showExtend.value = false
}

// Convert to permanent
function openConvert(id: string) {
  targetId.value = id
  const c = contractsStore.getContractById(id)
  convertForm.value = {
    effectiveDate: new Date().toISOString().slice(0, 10),
    newBaseSalary: c?.baseSalary,
    newPosition: c?.positionAtContract ?? '',
    newDepartment: c?.departmentAtContract ?? '',
    reason: 'Konversi ke karyawan tetap setelah evaluasi performa.',
    notes: '',
  }
  showConvert.value = true
}
const isConvertValid = computed(
  () => convertForm.value.effectiveDate !== '' && (convertForm.value.newBaseSalary ?? 0) > 0,
)
function confirmConvert() {
  if (!targetId.value || !isConvertValid.value) return
  const newId = contractsStore.convertToPermanent(targetId.value, {
    effectiveDate: convertForm.value.effectiveDate,
    newBaseSalary: Number(convertForm.value.newBaseSalary) || 0,
    newPosition: convertForm.value.newPosition || undefined,
    newDepartment: convertForm.value.newDepartment || undefined,
    reason: convertForm.value.reason,
    notes: convertForm.value.notes,
    performedBy: meId.value,
  })
  if (newId) {
    const c = contractsStore.getContractById(newId)
    if (c) {
      employeesStore.updateEmployee(c.employeeId, {
        baseSalary: c.baseSalary,
        employeeStatus: 'PKWTT',
        contractStartDate: c.startDate,
        contractEndDate: undefined,
        contractDurationType: 'PERMANENT',
      })
    }
  }
  showConvert.value = false
}

const targetEmployeeName = computed(() => (target.value ? employeeName(target.value.employeeId) : ''))
const detailHistory = computed(() => (detail.value ? [...detail.value.history].sort((a, b) => b.performedAt.localeCompare(a.performedAt)) : []))
const detailEmployeeContracts = computed(() => (detail.value ? contractsStore.getContractsByEmployee(detail.value.employeeId) : []))

function actionTypeLabel(type: string): string {
  if (type === 'created') return 'Kontrak Dibuat'
  if (type === 'extended') return 'Diperpanjang'
  if (type === 'terminated') return 'Diterminasi'
  if (type === 'converted') return 'Dikonversi ke Tetap'
  return type
}
function actionTypeColor(type: string): string {
  if (type === 'created') return 'text-primary'
  if (type === 'extended') return 'text-score-good'
  if (type === 'terminated') return 'text-destructive'
  if (type === 'converted') return 'text-score-good'
  return 'text-muted-foreground'
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Kelola kontrak per karyawan: terminate, perpanjang, atau konversi ke karyawan tetap."
    >
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Kontrak Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <UiStatCard label="Total Kontrak" :value="contractsStore.stats.total" :icon="FileText" />
      <UiStatCard label="Aktif" :value="contractsStore.stats.active" tone="good" :icon="FileText" />
      <UiStatCard label="Akan Berakhir (60 hari)" :value="contractsStore.stats.expiringSoon" tone="average" :icon="AlertTriangle" />
      <UiStatCard label="Permanen (PKWTT)" :value="contractsStore.stats.permanent" tone="primary" :icon="Crown" />
      <UiStatCard label="Kadaluarsa" :value="contractsStore.stats.expired" tone="muted" :icon="Clock" />
      <UiStatCard label="Terminated" :value="contractsStore.stats.terminated" tone="low" :icon="XCircle" />
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <UiSelect v-model="contractsStore.employeeFilter" :options="employeeFilterOptions" placeholder="Filter karyawan" />
      <UiSelect v-model="contractsStore.typeFilter" :options="typeFilterOptions" />
      <UiSelect v-model="contractsStore.statusFilter" :options="statusOptions" />
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">No. Kontrak</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipe</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Durasi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Gaji Pokok</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="c in pagination.pagedItems.value"
              :key="c.id"
              class="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
              @click="openDetail(c.id)"
            >
              <td class="px-4 py-3 text-sm font-mono">{{ c.contractNumber }}</td>
              <td class="px-4 py-3 text-sm">
                <p class="font-medium text-foreground">{{ employeeName(c.employeeId) }}</p>
                <p class="text-xs text-muted-foreground">{{ c.positionAtContract ?? '-' }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ contractsStore.typeLabels[c.type] }}</td>
              <td class="px-4 py-3 text-sm">{{ contractsStore.durationLabels[c.duration] }}</td>
              <td class="px-4 py-3 text-sm">
                <div class="text-foreground">{{ formatDate(c.startDate) }}</div>
                <div v-if="c.endDate" class="text-xs text-muted-foreground">s.d. {{ formatDate(c.endDate) }}</div>
                <div v-else class="text-xs text-score-good">— Permanen —</div>
                <div v-if="isExpiringSoon(c)" class="text-[10px] text-ai-orange font-semibold mt-0.5">
                  Berakhir {{ daysToEnd(c) }} hari lagi
                </div>
              </td>
              <td class="px-4 py-3 text-sm font-mono">Rp {{ c.baseSalary.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3">
                <UiStatusBadge :label="contractsStore.statusLabels[c.status]" :tone="statusTone(c.status)" />
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="c.status === 'active' && c.type !== 'PKWTT'"
                    class="p-2 rounded-lg text-muted-foreground hover:text-score-good hover:bg-score-good/10 transition-colors"
                    title="Perpanjang"
                    @click="openExtend(c.id)"
                  >
                    <RefreshCcw class="w-4 h-4" />
                  </button>
                  <button
                    v-if="c.status === 'active' && c.type !== 'PKWTT'"
                    class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Konversi ke Karyawan Tetap"
                    @click="openConvert(c.id)"
                  >
                    <Crown class="w-4 h-4" />
                  </button>
                  <button
                    v-if="c.status === 'active'"
                    class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Terminate"
                    @click="openTerminate(c.id)"
                  >
                    <XCircle class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    title="Detail"
                    @click="openDetail(c.id)"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50"
                    title="Edit"
                    @click="openEdit(c)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Hapus"
                    @click="askDelete(c.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        :icon="FileText"
        title="Belum ada kontrak"
        description="Buat kontrak baru atau ubah filter."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="kontrak"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <!-- CREATE / EDIT MODAL -->
    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Kontrak' : 'Kontrak Baru'"
      description="Lengkapi informasi kontrak karyawan."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Karyawan" required>
          <UiSelect
            :model-value="form.employeeId"
            :options="employeeOptions"
            placeholder="Pilih karyawan"
            :disabled="isEdit"
            @update:model-value="onEmployeePicked"
          />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tipe Kontrak" required>
            <UiSelect v-model="form.type" :options="typeOptions" />
          </UiFormField>
          <UiFormField label="Durasi" required>
            <UiSelect v-model="form.duration" :options="durationOptions" />
          </UiFormField>
          <UiFormField label="Tanggal Mulai" required>
            <UiInput v-model="form.startDate" type="date" />
          </UiFormField>
          <UiFormField label="Tanggal Akhir" :hint="form.duration === 'PERMANENT' ? 'Tidak ada tanggal akhir' : `Otomatis: ${computedEndDate || '-'}`">
            <UiInput v-model="form.endDate" type="date" :disabled="form.duration === 'PERMANENT'" />
          </UiFormField>
          <UiFormField label="Gaji Pokok (Rp)" required>
            <UiInput v-model.number="form.baseSalary" type="number" placeholder="0" />
          </UiFormField>
          <UiFormField label="Posisi pada Kontrak">
            <UiInput v-model="form.positionAtContract" placeholder="e.g. Software Engineer" />
          </UiFormField>
          <UiFormField label="Departemen pada Kontrak">
            <UiInput v-model="form.departmentAtContract" placeholder="e.g. Engineering" />
          </UiFormField>
        </div>
        <UiFormField label="Catatan">
          <UiTextarea v-model="form.notes" rows="2" placeholder="Catatan tambahan (opsional)" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isFormValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Buat Kontrak' }}
        </UiButton>
      </template>
    </UiModal>

    <!-- DETAIL DRAWER (modal xl) -->
    <UiModal
      :open="showDetail"
      :title="detail ? `Detail Kontrak — ${detail.contractNumber}` : 'Detail Kontrak'"
      :description="detail ? `${employeeName(detail.employeeId)} • ${contractsStore.typeLabels[detail.type]}` : ''"
      size="xl"
      @update:open="showDetail = $event"
    >
      <div v-if="detail" class="space-y-5">
        <!-- Properties grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Status</p>
            <UiStatusBadge class="mt-1" :label="contractsStore.statusLabels[detail.status]" :tone="statusTone(detail.status)" />
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Tipe</p>
            <p class="text-sm font-semibold text-foreground mt-1">{{ contractsStore.typeLabels[detail.type] }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Durasi</p>
            <p class="text-sm font-semibold text-foreground mt-1">{{ contractsStore.durationLabels[detail.duration] }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Gaji Pokok</p>
            <p class="text-sm font-semibold text-foreground mt-1 font-mono">Rp {{ detail.baseSalary.toLocaleString('id-ID') }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Mulai</p>
            <p class="text-sm font-semibold text-foreground mt-1">{{ formatDate(detail.startDate) }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Berakhir</p>
            <p class="text-sm font-semibold text-foreground mt-1">{{ detail.endDate ? formatDate(detail.endDate) : '— Permanen —' }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Posisi</p>
            <p class="text-sm font-semibold text-foreground mt-1">{{ detail.positionAtContract ?? '-' }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground">Departemen</p>
            <p class="text-sm font-semibold text-foreground mt-1">{{ detail.departmentAtContract ?? '-' }}</p>
          </div>
        </div>

        <!-- Termination info if applicable -->
        <div v-if="detail.status === 'terminated'" class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <div class="flex items-center gap-2">
            <XCircle class="w-4 h-4 text-destructive" />
            <h4 class="font-semibold text-destructive">Kontrak Diterminasi</h4>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-xs text-muted-foreground">Tanggal Terminasi</p>
              <p class="text-foreground">{{ detail.terminationDate ? formatDate(detail.terminationDate) : '-' }}</p>
            </div>
            <div v-if="detail.severance">
              <p class="text-xs text-muted-foreground">Pesangon</p>
              <p class="text-foreground font-mono">Rp {{ detail.severance.toLocaleString('id-ID') }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-xs text-muted-foreground">Alasan</p>
              <p class="text-foreground">{{ detail.terminationReason ?? '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div v-if="detail.status === 'active'" class="flex flex-wrap items-center gap-2">
          <UiButton v-if="detail.type !== 'PKWTT'" variant="outline" @click="openExtend(detail.id); showDetail = false">
            <RefreshCcw class="w-4 h-4" />
            Perpanjang Kontrak
          </UiButton>
          <UiButton v-if="detail.type !== 'PKWTT'" variant="outline" @click="openConvert(detail.id); showDetail = false">
            <Crown class="w-4 h-4" />
            Konversi ke Tetap
          </UiButton>
          <UiButton variant="destructive" @click="openTerminate(detail.id); showDetail = false">
            <XCircle class="w-4 h-4" />
            Terminate
          </UiButton>
        </div>

        <!-- History timeline -->
        <div>
          <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
            <History class="w-4 h-4" />
            Riwayat Aksi
          </h4>
          <div class="space-y-3">
            <div v-for="h in detailHistory" :key="h.id" class="flex gap-3">
              <div class="flex flex-col items-center shrink-0">
                <div class="w-2.5 h-2.5 rounded-full mt-1.5" :class="`bg-${actionTypeColor(h.type).replace('text-', '')}`" :style="{ backgroundColor: 'currentColor' }" />
                <div class="flex-1 w-px bg-border my-1" />
              </div>
              <div class="flex-1 pb-3">
                <p class="text-sm font-medium" :class="actionTypeColor(h.type)">{{ actionTypeLabel(h.type) }}</p>
                <p class="text-xs text-muted-foreground">{{ formatDate(h.performedAt) }} • oleh {{ employeeName(h.performedBy ?? '') }}</p>
                <p v-if="h.reason" class="text-sm text-foreground mt-1">{{ h.reason }}</p>
                <p v-if="h.notes" class="text-xs text-muted-foreground mt-1 italic">{{ h.notes }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- All contracts of this employee -->
        <div v-if="detailEmployeeContracts.length > 1">
          <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Riwayat Kontrak Karyawan</h4>
          <div class="rounded-xl border border-border overflow-hidden">
            <div class="divide-y divide-border">
              <div
                v-for="c in detailEmployeeContracts"
                :key="c.id"
                class="p-3 flex items-center justify-between gap-2 cursor-pointer"
                :class="c.id === detail.id ? 'bg-primary/10' : 'hover:bg-muted/30'"
                @click="openDetail(c.id)"
              >
                <div class="min-w-0">
                  <p class="text-sm font-mono text-foreground">{{ c.contractNumber }}</p>
                  <p class="text-xs text-muted-foreground">
                    {{ contractsStore.typeLabels[c.type] }} • {{ formatDate(c.startDate) }}{{ c.endDate ? ` – ${formatDate(c.endDate)}` : ' – ∞' }}
                  </p>
                </div>
                <UiStatusBadge :label="contractsStore.statusLabels[c.status]" :tone="statusTone(c.status)" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showDetail = false">Tutup</UiButton>
      </template>
    </UiModal>

    <!-- TERMINATE MODAL -->
    <UiModal
      :open="showTerminate"
      title="Terminate Kontrak"
      :description="target ? `${target.contractNumber} • ${targetEmployeeName}` : ''"
      @update:open="showTerminate = $event"
    >
      <div class="space-y-4">
        <div class="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
          <p class="font-semibold">Perhatian:</p>
          <p class="text-xs mt-1">Aksi ini akan menutup kontrak dan menonaktifkan karyawan. Pastikan sesuai dengan ketentuan ketenagakerjaan.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tanggal Terminasi" required>
            <UiInput v-model="terminateForm.terminationDate" type="date" />
          </UiFormField>
          <UiFormField label="Pesangon (Rp)" hint="Sesuai ketentuan UU & masa kerja">
            <UiInput v-model.number="terminateForm.severance" type="number" placeholder="0" />
          </UiFormField>
        </div>
        <UiFormField label="Alasan Terminasi" required>
          <UiTextarea v-model="terminateForm.reason" rows="3" placeholder="e.g. Pengunduran diri, restrukturisasi, performa di bawah ekspektasi..." />
        </UiFormField>
        <UiFormField label="Catatan Internal">
          <UiTextarea v-model="terminateForm.notes" rows="2" placeholder="Catatan untuk HR (opsional)" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showTerminate = false">Batal</UiButton>
        <UiButton variant="destructive" :disabled="!isTerminateValid" @click="confirmTerminate">
          <XCircle class="w-4 h-4" />
          Terminate Kontrak
        </UiButton>
      </template>
    </UiModal>

    <!-- EXTEND MODAL -->
    <UiModal
      :open="showExtend"
      title="Perpanjang Kontrak"
      :description="target ? `${target.contractNumber} • ${targetEmployeeName}` : ''"
      size="lg"
      @update:open="showExtend = $event"
    >
      <div class="space-y-4">
        <div class="rounded-lg bg-primary/10 border border-primary/30 p-3 text-sm">
          <p class="font-semibold text-primary">Kontrak baru akan dibuat</p>
          <p class="text-xs text-muted-foreground mt-1">Kontrak lama akan ditandai sebagai 'extended'. Karyawan tetap aktif dengan kontrak baru.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Durasi Baru" required>
            <UiSelect v-model="extendForm.newDuration" :options="extendDurationOptions" />
          </UiFormField>
          <UiFormField label="Tanggal Mulai" required>
            <UiInput v-model="extendForm.newStartDate" type="date" />
          </UiFormField>
          <UiFormField label="Tanggal Berakhir Otomatis" :hint="extendNewEndDate ? `Otomatis ${formatDate(extendNewEndDate)}` : ''">
            <UiInput :model-value="extendNewEndDate" disabled />
          </UiFormField>
          <UiFormField label="Gaji Pokok Baru (Rp)" required>
            <UiInput v-model.number="extendForm.newBaseSalary" type="number" placeholder="0" />
          </UiFormField>
          <UiFormField label="Posisi (jika berubah)">
            <UiInput v-model="extendForm.newPosition" />
          </UiFormField>
          <UiFormField label="Departemen (jika berubah)">
            <UiInput v-model="extendForm.newDepartment" />
          </UiFormField>
        </div>
        <UiFormField label="Alasan Perpanjangan">
          <UiTextarea v-model="extendForm.reason" rows="2" />
        </UiFormField>
        <UiFormField label="Catatan">
          <UiTextarea v-model="extendForm.notes" rows="2" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showExtend = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isExtendValid" @click="confirmExtend">
          <RefreshCcw class="w-4 h-4" />
          Perpanjang
        </UiButton>
      </template>
    </UiModal>

    <!-- CONVERT TO PERMANENT MODAL -->
    <UiModal
      :open="showConvert"
      title="Konversi ke Karyawan Tetap (PKWTT)"
      :description="target ? `${target.contractNumber} • ${targetEmployeeName}` : ''"
      size="lg"
      @update:open="showConvert = $event"
    >
      <div class="space-y-4">
        <div class="rounded-lg bg-score-good/10 border border-score-good/30 p-3 text-sm">
          <div class="flex items-center gap-2">
            <Crown class="w-4 h-4 text-score-good" />
            <p class="font-semibold text-score-good">Konversi ke PKWTT (Permanen)</p>
          </div>
          <p class="text-xs text-muted-foreground mt-1">Kontrak baru permanen akan dibuat. Kontrak kontrak lama ditandai 'converted'. Status karyawan diupdate ke PKWTT.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tanggal Efektif" required>
            <UiInput v-model="convertForm.effectiveDate" type="date" />
          </UiFormField>
          <UiFormField label="Gaji Pokok Baru (Rp)" required>
            <UiInput v-model.number="convertForm.newBaseSalary" type="number" placeholder="0" />
          </UiFormField>
          <UiFormField label="Posisi (jika berubah)">
            <UiInput v-model="convertForm.newPosition" />
          </UiFormField>
          <UiFormField label="Departemen (jika berubah)">
            <UiInput v-model="convertForm.newDepartment" />
          </UiFormField>
        </div>
        <UiFormField label="Alasan / Justifikasi" required>
          <UiTextarea v-model="convertForm.reason" rows="3" />
        </UiFormField>
        <UiFormField label="Catatan">
          <UiTextarea v-model="convertForm.notes" rows="2" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showConvert = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isConvertValid" @click="confirmConvert">
          <Crown class="w-4 h-4" />
          Konversi ke Tetap
        </UiButton>
      </template>
    </UiModal>

    <!-- DELETE CONFIRM -->
    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Kontrak?"
      message="Catatan kontrak akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
