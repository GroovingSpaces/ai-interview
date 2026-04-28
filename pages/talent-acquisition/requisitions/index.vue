<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, ClipboardList, Check, XCircle } from 'lucide-vue-next'
import { useRequisitionsStore, type Requisition, type RequisitionStatus, type EmploymentType, type WorkArrangement } from '~/stores/requisitions'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('requisitions')
useHead({ title: () => title.value })

const reqStore = useRequisitionsStore()
const filteredReqs = computed(() => reqStore.filteredRequisitions)
const pagination = usePagination(filteredReqs, { pageSize: 10 })
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  title: string
  department: string
  positionLevel: string
  numberOfPositions: number
  employmentType: EmploymentType
  workArrangement: WorkArrangement
  location: string
  reasonOfHiring: 'replacement' | 'expansion' | 'project'
  budgetMin: number | undefined
  budgetMax: number | undefined
  jobDescription: string
  responsibilities: string[]
  qualifications: string[]
  niceToHave: string[]
  hiringManagerId: string
  targetCloseDate: string
  status: RequisitionStatus
}
const empty = (): FormState => ({
  title: '',
  department: '',
  positionLevel: '',
  numberOfPositions: 1,
  employmentType: 'full_time',
  workArrangement: 'onsite',
  location: '',
  reasonOfHiring: 'expansion',
  budgetMin: undefined,
  budgetMax: undefined,
  jobDescription: '',
  responsibilities: [],
  qualifications: [],
  niceToHave: [],
  hiringManagerId: '',
  targetCloseDate: '',
  status: 'draft',
})
const form = ref<FormState>(empty())

const employmentOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Kontrak' },
  { value: 'internship', label: 'Magang' },
]
const arrangementOptions = [
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]
const reasonOptions = [
  { value: 'replacement', label: 'Replacement' },
  { value: 'expansion', label: 'Expansion' },
  { value: 'project', label: 'Project-based' },
]
const statusOptions: { value: RequisitionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'closed', label: 'Closed' },
]
const formStatusOptions = statusOptions.filter((o) => o.value !== 'all')

const departmentOptions = computed(() => companyStore.departments.map((d) => ({ value: d.name, label: d.name })))
const departmentFilterOptions = computed(() => [{ value: 'all', label: 'Semua Departemen' }, ...departmentOptions.value])
const positionLevelOptions = computed(() => companyStore.positionLevels.map((p) => ({ value: p.name, label: p.name })))
const employeeOptions = computed(() => employeesStore.employees.map((e) => ({ value: e.id, label: e.name })))

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () =>
    form.value.title.trim() !== '' &&
    form.value.department.trim() !== '' &&
    form.value.location.trim() !== '' &&
    form.value.jobDescription.trim() !== '',
)

function statusTone(s: RequisitionStatus): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (s === 'approved') return 'good'
  if (s === 'rejected') return 'low'
  if (s === 'submitted') return 'primary'
  if (s === 'closed') return 'muted'
  return 'average'
}
function statusLabel(s: RequisitionStatus) {
  return statusOptions.find((o) => o.value === s)?.label ?? s
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(r: Requisition) {
  editingId.value = r.id
  form.value = {
    title: r.title,
    department: r.department,
    positionLevel: r.positionLevel ?? '',
    numberOfPositions: r.numberOfPositions,
    employmentType: r.employmentType,
    workArrangement: r.workArrangement,
    location: r.location,
    reasonOfHiring: r.reasonOfHiring,
    budgetMin: r.budgetMin,
    budgetMax: r.budgetMax,
    jobDescription: r.jobDescription,
    responsibilities: [...r.responsibilities],
    qualifications: [...r.qualifications],
    niceToHave: [...r.niceToHave],
    hiringManagerId: r.hiringManagerId ?? '',
    targetCloseDate: r.targetCloseDate ?? '',
    status: r.status,
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    title: form.value.title,
    department: form.value.department,
    positionLevel: form.value.positionLevel || undefined,
    numberOfPositions: Number(form.value.numberOfPositions) || 1,
    employmentType: form.value.employmentType,
    workArrangement: form.value.workArrangement,
    location: form.value.location,
    reasonOfHiring: form.value.reasonOfHiring,
    budgetMin: Number(form.value.budgetMin) || 0,
    budgetMax: Number(form.value.budgetMax) || 0,
    jobDescription: form.value.jobDescription,
    responsibilities: form.value.responsibilities.filter((r) => r.trim() !== ''),
    qualifications: form.value.qualifications.filter((r) => r.trim() !== ''),
    niceToHave: form.value.niceToHave.filter((r) => r.trim() !== ''),
    hiringManagerId: form.value.hiringManagerId || undefined,
    targetCloseDate: form.value.targetCloseDate || undefined,
    status: form.value.status,
  }
  if (isEdit.value && editingId.value) {
    reqStore.updateRequisition(editingId.value, payload)
  } else {
    reqStore.addRequisition(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) reqStore.deleteRequisition(targetId.value)
  showDelete.value = false
}
function approve(id: string) {
  reqStore.updateRequisition(id, { status: 'approved' })
}
function reject(id: string) {
  reqStore.updateRequisition(id, { status: 'rejected' })
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola requisition (permintaan rekrut). Approve untuk publish job opening.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Requisition Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <UiSelect v-model="reqStore.reqStatusFilter" :options="statusOptions" />
      <UiSelect v-model="reqStore.reqDeptFilter" :options="departmentFilterOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Posisi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Departemen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Slot</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lokasi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Budget</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Target Close</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagination.pagedItems.value" :key="r.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm font-semibold text-foreground">{{ r.title }}</td>
              <td class="px-4 py-3 text-sm">{{ r.department }}</td>
              <td class="px-4 py-3 text-sm">{{ r.numberOfPositions }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ r.location }}</td>
              <td class="px-4 py-3 text-sm font-mono">Rp {{ r.budgetMin.toLocaleString('id-ID') }} – {{ r.budgetMax.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ r.targetCloseDate ? formatDate(r.targetCloseDate) : '-' }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="statusLabel(r.status)" :tone="statusTone(r.status)" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="r.status === 'submitted'" class="p-2 rounded-lg text-muted-foreground hover:text-score-good hover:bg-score-good/10" title="Setujui" @click="approve(r.id)">
                    <Check class="w-4 h-4" />
                  </button>
                  <button v-if="r.status === 'submitted'" class="p-2 rounded-lg text-muted-foreground hover:text-score-low hover:bg-score-low/10" title="Tolak" @click="reject(r.id)">
                    <XCircle class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(r)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(r.id)">
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
        :icon="ClipboardList"
        title="Belum ada requisition"
        description="Buat requisition untuk mengajukan permintaan rekrut posisi baru."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="requisition"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Requisition' : 'Requisition Baru'"
      description="Lengkapi informasi posisi yang dibutuhkan."
      size="xl"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Nama Posisi" required>
            <UiInput v-model="form.title" placeholder="e.g. Senior Backend Engineer" />
          </UiFormField>
          <UiFormField label="Departemen" required>
            <UiSelect v-model="form.department" :options="departmentOptions" placeholder="Pilih departemen" />
          </UiFormField>
          <UiFormField label="Jenjang Jabatan">
            <UiSelect v-model="form.positionLevel" :options="positionLevelOptions" placeholder="Pilih jenjang" />
          </UiFormField>
          <UiFormField label="Jumlah Slot" required>
            <UiInput v-model.number="form.numberOfPositions" type="number" />
          </UiFormField>
          <UiFormField label="Tipe Pekerjaan" required>
            <UiSelect v-model="form.employmentType" :options="employmentOptions" />
          </UiFormField>
          <UiFormField label="Skema Kerja" required>
            <UiSelect v-model="form.workArrangement" :options="arrangementOptions" />
          </UiFormField>
          <UiFormField label="Lokasi" required>
            <UiInput v-model="form.location" placeholder="e.g. Jakarta" />
          </UiFormField>
          <UiFormField label="Alasan Hiring" required>
            <UiSelect v-model="form.reasonOfHiring" :options="reasonOptions" />
          </UiFormField>
          <UiFormField label="Budget Min (Rp)">
            <UiInput v-model.number="form.budgetMin" type="number" />
          </UiFormField>
          <UiFormField label="Budget Max (Rp)">
            <UiInput v-model.number="form.budgetMax" type="number" />
          </UiFormField>
          <UiFormField label="Hiring Manager">
            <UiSelect v-model="form.hiringManagerId" :options="employeeOptions" placeholder="Pilih hiring manager" />
          </UiFormField>
          <UiFormField label="Target Tanggal Close">
            <UiInput v-model="form.targetCloseDate" type="date" />
          </UiFormField>
          <UiFormField label="Status">
            <UiSelect v-model="form.status" :options="formStatusOptions" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi Pekerjaan" required>
          <UiTextarea v-model="form.jobDescription" rows="3" placeholder="Ringkasan peran" />
        </UiFormField>
        <UiFormField label="Tanggung Jawab Utama">
          <EmployeesStringListField v-model="form.responsibilities" placeholder="e.g. Design backend services" />
        </UiFormField>
        <UiFormField label="Kualifikasi Wajib">
          <EmployeesStringListField v-model="form.qualifications" placeholder="e.g. 5+ tahun pengalaman" />
        </UiFormField>
        <UiFormField label="Nice to Have">
          <EmployeesStringListField v-model="form.niceToHave" placeholder="e.g. Pengalaman dengan Kafka" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Buat Requisition' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Requisition?"
      message="Catatan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
