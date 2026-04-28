<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, TrendingUp, Check, XCircle } from 'lucide-vue-next'
import { usePromotionsStore, type Promotion, type PromotionStatus } from '~/stores/promotions'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('performancePromotion')
useHead({ title: () => title.value })

const promotionsStore = usePromotionsStore()
const filteredPromotions = computed(() => promotionsStore.filteredRecords)
const pagination = usePagination(filteredPromotions, { pageSize: 10 })
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  fromPosition: string
  toPosition: string
  fromDepartment: string
  toDepartment: string
  fromDivision: string
  toDivision: string
  requestedAt: string
  promotionDate: string
  notes: string
  status: PromotionStatus
}
const empty = (): FormState => ({
  employeeId: '',
  fromPosition: '',
  toPosition: '',
  fromDepartment: '',
  toDepartment: '',
  fromDivision: '',
  toDivision: '',
  requestedAt: new Date().toISOString().slice(0, 10),
  promotionDate: '',
  notes: '',
  status: 'draft',
})
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [{ value: '', label: 'Semua Karyawan' }, ...employeeOptions.value])
const departmentOptions = computed(() => companyStore.departments.map((d) => ({ value: d.name, label: d.name })))
const divisionOptions = computed(() => [{ value: '', label: '— Tidak ada —' }, ...companyStore.divisions.map((d) => ({ value: d.name, label: d.name }))])

const statusOptions: { value: PromotionStatus | ''; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'under_assessment', label: 'Assessment' },
  { value: 'passed', label: 'Lulus' },
  { value: 'failed', label: 'Tidak Lulus' },
]
const formStatusOptions = statusOptions.filter((o) => o.value !== '')

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.fromPosition.trim() !== '' &&
    form.value.toPosition.trim() !== '' &&
    form.value.requestedAt !== '',
)

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function statusTone(s: PromotionStatus): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (s === 'passed') return 'good'
  if (s === 'failed') return 'low'
  if (s === 'under_assessment') return 'average'
  if (s === 'submitted') return 'primary'
  return 'muted'
}
function statusLabel(s: PromotionStatus) {
  return statusOptions.find((o) => o.value === s)?.label ?? s
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(p: Promotion) {
  editingId.value = p.id
  form.value = {
    employeeId: p.employeeId,
    fromPosition: p.fromPosition,
    toPosition: p.toPosition,
    fromDepartment: p.fromDepartment ?? '',
    toDepartment: p.toDepartment ?? '',
    fromDivision: p.fromDivision ?? '',
    toDivision: p.toDivision ?? '',
    requestedAt: p.requestedAt,
    promotionDate: p.promotionDate ?? '',
    notes: p.notes ?? '',
    status: p.status,
  }
  showForm.value = true
}
function onEmployeePicked(id: string) {
  form.value.employeeId = id
  if (!isEdit.value) {
    const emp = employeesStore.getEmployeeById(id)
    if (emp) {
      form.value.fromPosition = emp.position
      form.value.fromDepartment = emp.department
      form.value.fromDivision = emp.divisionId ? companyStore.getDivisionById(emp.divisionId)?.name ?? '' : ''
    }
  }
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    fromPosition: form.value.fromPosition,
    toPosition: form.value.toPosition,
    fromDepartment: form.value.fromDepartment || undefined,
    toDepartment: form.value.toDepartment || undefined,
    fromDivision: form.value.fromDivision || undefined,
    toDivision: form.value.toDivision || undefined,
    requestedAt: form.value.requestedAt,
    promotionDate: form.value.promotionDate || undefined,
    notes: form.value.notes || undefined,
    status: form.value.status,
  }
  if (isEdit.value && editingId.value) {
    promotionsStore.updatePromotion(editingId.value, payload)
  } else {
    promotionsStore.addPromotion(payload)
  }
  if (form.value.status === 'passed') {
    employeesStore.updateEmployee(form.value.employeeId, {
      position: form.value.toPosition,
      department: form.value.toDepartment || undefined,
    })
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) promotionsStore.deletePromotion(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola pengajuan promosi: dari posisi lama ke posisi baru.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Pengajuan Promosi
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <UiInput v-model="promotionsStore.dateFilter" type="date" />
      <UiSelect v-model="promotionsStore.employeeFilter" :options="employeeFilterOptions" />
      <UiSelect v-model="promotionsStore.statusFilter" :options="statusOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Diajukan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Dari</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Ke</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tgl Efektif</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in pagination.pagedItems.value" :key="p.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm">{{ formatDate(p.requestedAt) }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ employeeName(p.employeeId) }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ p.fromPosition }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ p.toPosition }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ p.promotionDate ? formatDate(p.promotionDate) : '-' }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="statusLabel(p.status)" :tone="statusTone(p.status)" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Edit" @click="openEdit(p)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="askDelete(p.id)">
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
        :icon="TrendingUp"
        title="Belum ada promosi"
        description="Buat pengajuan promosi untuk mengelola jenjang karir karyawan."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="promosi"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Pengajuan Promosi' : 'Pengajuan Promosi Baru'"
      description="Tentukan posisi asal dan tujuan promosi."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Karyawan" required>
          <UiSelect :model-value="form.employeeId" :options="employeeOptions" @update:model-value="onEmployeePicked" placeholder="Pilih karyawan" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tanggal Pengajuan" required>
            <UiInput v-model="form.requestedAt" type="date" />
          </UiFormField>
          <UiFormField label="Tanggal Efektif Promosi" hint="Diisi saat status 'Lulus'.">
            <UiInput v-model="form.promotionDate" type="date" />
          </UiFormField>
        </div>

        <div class="rounded-xl border border-border p-4 space-y-3">
          <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Posisi Asal</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UiFormField label="Posisi" required>
              <UiInput v-model="form.fromPosition" />
            </UiFormField>
            <UiFormField label="Departemen">
              <UiSelect v-model="form.fromDepartment" :options="departmentOptions" placeholder="Pilih" />
            </UiFormField>
            <UiFormField label="Divisi">
              <UiSelect v-model="form.fromDivision" :options="divisionOptions" />
            </UiFormField>
          </div>
        </div>

        <div class="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <h4 class="text-sm font-semibold text-primary uppercase tracking-wider">Posisi Tujuan</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UiFormField label="Posisi" required>
              <UiInput v-model="form.toPosition" placeholder="e.g. Senior Software Engineer" />
            </UiFormField>
            <UiFormField label="Departemen">
              <UiSelect v-model="form.toDepartment" :options="departmentOptions" />
            </UiFormField>
            <UiFormField label="Divisi">
              <UiSelect v-model="form.toDivision" :options="divisionOptions" />
            </UiFormField>
          </div>
        </div>

        <UiFormField label="Status">
          <UiSelect v-model="form.status" :options="formStatusOptions" />
        </UiFormField>
        <UiFormField label="Catatan">
          <UiTextarea v-model="form.notes" rows="2" placeholder="Catatan tambahan (opsional)" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Ajukan' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Pengajuan Promosi?"
      message="Catatan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
