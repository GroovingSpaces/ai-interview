<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, ArrowRightLeft } from 'lucide-vue-next'
import { useMutationsStore, type Mutation } from '~/stores/mutations'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('performanceMutation')
useHead({ title: () => title.value })

const mutationsStore = useMutationsStore()
const filteredMutations = computed(() => mutationsStore.filteredRecords)
const pagination = usePagination(filteredMutations, { pageSize: 10 })
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  fromDepartment: string
  toDepartment: string
  fromDivision: string
  toDivision: string
  fromPosition: string
  toPosition: string
  mutationDate: string
  reason: string
}
const empty = (): FormState => ({
  employeeId: '',
  fromDepartment: '',
  toDepartment: '',
  fromDivision: '',
  toDivision: '',
  fromPosition: '',
  toPosition: '',
  mutationDate: new Date().toISOString().slice(0, 10),
  reason: '',
})
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [{ value: '', label: 'Semua Karyawan' }, ...employeeOptions.value])
const divisionOptions = computed(() => [
  { value: '', label: '— Tidak ada —' },
  ...companyStore.divisions.map((d) => ({ value: d.name, label: d.name })),
])
const departmentOptions = computed(() =>
  companyStore.departments.map((d) => ({ value: d.name, label: d.name })),
)

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.fromDepartment.trim() !== '' &&
    form.value.toDepartment.trim() !== '' &&
    form.value.fromPosition.trim() !== '' &&
    form.value.toPosition.trim() !== '' &&
    form.value.mutationDate !== '',
)

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openAddForEmployee(empId: string) {
  const emp = employeesStore.getEmployeeById(empId)
  editingId.value = null
  form.value = {
    ...empty(),
    employeeId: empId,
    fromDepartment: emp?.department ?? '',
    fromPosition: emp?.position ?? '',
    fromDivision: emp?.divisionId ? companyStore.getDivisionById(emp.divisionId)?.name ?? '' : '',
  }
  showForm.value = true
}
function openEdit(m: Mutation) {
  editingId.value = m.id
  form.value = {
    employeeId: m.employeeId,
    fromDepartment: m.fromDepartment,
    toDepartment: m.toDepartment,
    fromDivision: m.fromDivision ?? '',
    toDivision: m.toDivision ?? '',
    fromPosition: m.fromPosition,
    toPosition: m.toPosition,
    mutationDate: m.mutationDate,
    reason: m.reason ?? '',
  }
  showForm.value = true
}

// When employee picked in form, auto-fill "from" fields
function onEmployeePicked(id: string) {
  form.value.employeeId = id
  if (!isEdit.value) {
    const emp = employeesStore.getEmployeeById(id)
    if (emp) {
      form.value.fromDepartment = emp.department
      form.value.fromPosition = emp.position
      form.value.fromDivision = emp.divisionId ? companyStore.getDivisionById(emp.divisionId)?.name ?? '' : ''
    }
  }
}

function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    fromDepartment: form.value.fromDepartment,
    toDepartment: form.value.toDepartment,
    fromDivision: form.value.fromDivision || undefined,
    toDivision: form.value.toDivision || undefined,
    fromPosition: form.value.fromPosition,
    toPosition: form.value.toPosition,
    mutationDate: form.value.mutationDate,
    reason: form.value.reason || undefined,
  }
  if (isEdit.value && editingId.value) {
    mutationsStore.updateMutation(editingId.value, payload)
  } else {
    mutationsStore.addMutation(payload)
  }
  // Apply mutation to employee record
  employeesStore.updateEmployee(form.value.employeeId, {
    department: form.value.toDepartment,
    position: form.value.toPosition,
  })
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) mutationsStore.deleteMutation(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Catat mutasi karyawan: dari unit/posisi lama ke baru.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Mutasi Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <UiInput v-model="mutationsStore.dateFilter" type="date" />
      <UiSelect v-model="mutationsStore.employeeFilter" :options="employeeFilterOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Asal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tujuan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alasan</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in pagination.pagedItems.value" :key="m.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm">{{ formatDate(m.mutationDate) }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ employeeName(m.employeeId) }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                <p>{{ m.fromDepartment }}</p>
                <p class="text-xs">{{ m.fromPosition }}</p>
              </td>
              <td class="px-4 py-3 text-sm">
                <p class="text-foreground">{{ m.toDepartment }}</p>
                <p class="text-xs text-muted-foreground">{{ m.toPosition }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ m.reason ?? '-' }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Edit" @click="openEdit(m)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="askDelete(m.id)">
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
        :icon="ArrowRightLeft"
        title="Belum ada mutasi"
        description="Catat mutasi karyawan untuk update otomatis departemen & posisinya."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="mutasi"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Mutasi' : 'Mutasi Baru'"
      description="Isi unit & posisi asal, lalu unit & posisi tujuan. Data karyawan akan diperbarui otomatis."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Karyawan" required>
          <UiSelect :model-value="form.employeeId" :options="employeeOptions" placeholder="Pilih karyawan" @update:model-value="onEmployeePicked" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tanggal Efektif" required>
            <UiInput v-model="form.mutationDate" type="date" />
          </UiFormField>
        </div>

        <div class="rounded-xl border border-border p-4 space-y-3">
          <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Asal</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UiFormField label="Departemen Asal" required>
              <UiSelect v-model="form.fromDepartment" :options="departmentOptions" placeholder="Pilih departemen" />
            </UiFormField>
            <UiFormField label="Divisi Asal">
              <UiSelect v-model="form.fromDivision" :options="divisionOptions" />
            </UiFormField>
            <UiFormField label="Posisi Asal" required>
              <UiInput v-model="form.fromPosition" placeholder="e.g. Software Engineer" />
            </UiFormField>
          </div>
        </div>

        <div class="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <h4 class="text-sm font-semibold text-primary uppercase tracking-wider">Tujuan</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UiFormField label="Departemen Tujuan" required>
              <UiSelect v-model="form.toDepartment" :options="departmentOptions" placeholder="Pilih departemen" />
            </UiFormField>
            <UiFormField label="Divisi Tujuan">
              <UiSelect v-model="form.toDivision" :options="divisionOptions" />
            </UiFormField>
            <UiFormField label="Posisi Tujuan" required>
              <UiInput v-model="form.toPosition" placeholder="e.g. Product Engineer" />
            </UiFormField>
          </div>
        </div>

        <UiFormField label="Alasan / Catatan">
          <UiTextarea v-model="form.reason" rows="2" placeholder="Latar belakang mutasi (opsional)" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Catat Mutasi' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Mutasi?"
      message="Catatan mutasi akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
