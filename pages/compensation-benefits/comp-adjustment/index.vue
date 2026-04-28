<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, TrendingUp, ArrowUp, ArrowDown } from 'lucide-vue-next'
import { useCompensationStore, type CompAdjustment, type AdjustmentReason } from '~/stores/compensation'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('compAdjustment')
useHead({ title: () => title.value })

const compStore = useCompensationStore()
const adjustments = computed(() => compStore.adjustments)
const pagination = usePagination(adjustments, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  effectiveDate: string
  oldSalary: number | undefined
  newSalary: number | undefined
  reason: AdjustmentReason
  notes: string
}
const empty = (): FormState => ({
  employeeId: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  oldSalary: undefined,
  newSalary: undefined,
  reason: 'merit',
  notes: '',
})
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)

const reasonOptions = [
  { value: 'merit', label: 'Merit Increase' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'market_adjust', label: 'Market Adjustment' },
  { value: 'cost_of_living', label: 'Cost of Living' },
  { value: 'lainnya', label: 'Lainnya' },
]

const isEdit = computed(() => editingId.value !== null)
const diff = computed(() => (Number(form.value.newSalary) || 0) - (Number(form.value.oldSalary) || 0))
const diffPct = computed(() => {
  const old = Number(form.value.oldSalary) || 0
  if (old === 0) return 0
  return Math.round((diff.value / old) * 100)
})
const isValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.effectiveDate !== '' &&
    (form.value.oldSalary ?? 0) > 0 &&
    (form.value.newSalary ?? 0) > 0,
)

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function reasonLabel(r: string) {
  return reasonOptions.find((o) => o.value === r)?.label ?? r
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(a: CompAdjustment) {
  editingId.value = a.id
  form.value = {
    employeeId: a.employeeId,
    effectiveDate: a.effectiveDate,
    oldSalary: a.oldSalary,
    newSalary: a.newSalary,
    reason: a.reason,
    notes: a.notes ?? '',
  }
  showForm.value = true
}
function onEmployeePicked(id: string) {
  form.value.employeeId = id
  if (!isEdit.value) {
    const emp = employeesStore.getEmployeeById(id)
    if (emp) form.value.oldSalary = emp.baseSalary ?? 0
  }
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    effectiveDate: form.value.effectiveDate,
    oldSalary: Number(form.value.oldSalary) || 0,
    newSalary: Number(form.value.newSalary) || 0,
    reason: form.value.reason,
    notes: form.value.notes || undefined,
    approvedBy: '99',
  }
  if (isEdit.value && editingId.value) {
    compStore.updateAdjustment(editingId.value, payload)
  } else {
    compStore.addAdjustment(payload)
  }
  // Update employee base salary
  employeesStore.updateEmployee(form.value.employeeId, { baseSalary: payload.newSalary })
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) compStore.deleteAdjustment(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Penyesuaian gaji: merit, promosi, market adjust. Otomatis update gaji pokok karyawan.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Adjustment Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tgl Efektif</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Gaji Lama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Gaji Baru</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Selisih</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alasan</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in pagination.pagedItems.value" :key="a.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm">{{ formatDate(a.effectiveDate) }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ employeeName(a.employeeId) }}</td>
              <td class="px-4 py-3 text-sm font-mono">Rp {{ a.oldSalary.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3 text-sm font-mono text-foreground font-semibold">Rp {{ a.newSalary.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3 text-sm">
                <span :class="a.newSalary - a.oldSalary >= 0 ? 'text-score-good' : 'text-destructive'" class="flex items-center gap-1">
                  <component :is="a.newSalary - a.oldSalary >= 0 ? ArrowUp : ArrowDown" class="w-3 h-3" />
                  Rp {{ Math.abs(a.newSalary - a.oldSalary).toLocaleString('id-ID') }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ reasonLabel(a.reason) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(a)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(a.id)">
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
        title="Belum ada penyesuaian gaji"
        description="Catat penyesuaian gaji karyawan."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="adjustment"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Adjustment' : 'Penyesuaian Gaji Baru'"
      description="Tetapkan gaji baru dan tanggal efektif. Gaji karyawan akan diperbarui."
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Karyawan" required>
          <UiSelect :model-value="form.employeeId" :options="employeeOptions" @update:model-value="onEmployeePicked" placeholder="Pilih karyawan" />
        </UiFormField>
        <UiFormField label="Tanggal Efektif" required>
          <UiInput v-model="form.effectiveDate" type="date" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Gaji Pokok Saat Ini (Rp)" required>
            <UiInput v-model.number="form.oldSalary" type="number" placeholder="0" />
          </UiFormField>
          <UiFormField label="Gaji Pokok Baru (Rp)" required>
            <UiInput v-model.number="form.newSalary" type="number" placeholder="0" />
          </UiFormField>
        </div>
        <div v-if="diff !== 0" class="rounded-lg px-3 py-2 text-sm" :class="diff >= 0 ? 'bg-score-good/10 text-score-good border border-score-good/30' : 'bg-destructive/10 text-destructive border border-destructive/30'">
          Selisih: <span class="font-semibold">Rp {{ Math.abs(diff).toLocaleString('id-ID') }} ({{ diffPct }}%)</span>
        </div>
        <UiFormField label="Alasan" required>
          <UiSelect v-model="form.reason" :options="reasonOptions" />
        </UiFormField>
        <UiFormField label="Catatan">
          <UiTextarea v-model="form.notes" rows="2" placeholder="Detail tambahan (opsional)" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Terapkan' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Adjustment?"
      message="Catatan penyesuaian akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
