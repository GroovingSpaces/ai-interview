<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Gift, Sparkles } from 'lucide-vue-next'
import { useCompensationStore, type BonusIncentive, type BonusType, type BonusStatus } from '~/stores/compensation'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('bonusIncentive')
useHead({ title: () => title.value })

const compStore = useCompensationStore()
const bonuses = computed(() => compStore.bonuses)
const pagination = usePagination(bonuses, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  type: BonusType
  amount: number | undefined
  period: string
  reason: string
  status: BonusStatus
}
const empty = (): FormState => ({
  employeeId: '',
  type: 'kpi_bonus',
  amount: undefined,
  period: new Date().toISOString().slice(0, 7),
  reason: '',
  status: 'draft',
})
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const typeOptions = [
  { value: 'kpi_bonus', label: 'KPI Bonus' },
  { value: 'project', label: 'Project Bonus' },
  { value: 'thr', label: 'THR' },
  { value: 'incentive', label: 'Incentive' },
  { value: 'spot', label: 'Spot Bonus' },
  { value: 'lainnya', label: 'Lainnya' },
]
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
]

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(() => form.value.employeeId !== '' && (form.value.amount ?? 0) > 0 && form.value.period.trim() !== '')

const totalAmount = computed(() => compStore.bonuses.reduce((s, b) => s + b.amount, 0))

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function statusTone(s: BonusStatus): 'good' | 'primary' | 'average' | 'muted' {
  if (s === 'paid') return 'good'
  if (s === 'approved') return 'primary'
  if (s === 'submitted') return 'average'
  return 'muted'
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(b: BonusIncentive) {
  editingId.value = b.id
  form.value = {
    employeeId: b.employeeId,
    type: b.type,
    amount: b.amount,
    period: b.period,
    reason: b.reason ?? '',
    status: b.status,
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    type: form.value.type,
    amount: Number(form.value.amount) || 0,
    period: form.value.period,
    reason: form.value.reason || undefined,
    status: form.value.status,
  }
  if (isEdit.value && editingId.value) {
    compStore.updateBonus(editingId.value, payload)
  } else {
    compStore.addBonus(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) compStore.deleteBonus(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola bonus dan insentif karyawan: KPI bonus, THR, project, dll.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Bonus Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Total Pengajuan" :value="compStore.bonuses.length" :icon="Sparkles" />
      <UiStatCard label="Total Nilai" :value="`Rp ${totalAmount.toLocaleString('id-ID')}`" tone="primary" :icon="Gift" />
      <UiStatCard label="Sudah Dibayar" :value="compStore.bonuses.filter((b) => b.status === 'paid').length" tone="good" :icon="Sparkles" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipe</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nilai</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alasan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="b in pagination.pagedItems.value" :key="b.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm text-foreground">{{ employeeName(b.employeeId) }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ typeOptions.find((o) => o.value === b.type)?.label ?? b.type }}</td>
              <td class="px-4 py-3 text-sm">{{ b.period }}</td>
              <td class="px-4 py-3 text-sm font-mono font-semibold">Rp {{ b.amount.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ b.reason ?? '-' }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="statusOptions.find((o) => o.value === b.status)?.label ?? b.status" :tone="statusTone(b.status)" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(b)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(b.id)">
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
        :icon="Gift"
        title="Belum ada bonus"
        description="Buat pengajuan bonus baru untuk karyawan."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="bonus"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Bonus' : 'Pengajuan Bonus / Insentif'"
      description="Isi tipe, nominal, dan alasan pemberian bonus."
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Karyawan" required>
          <UiSelect v-model="form.employeeId" :options="employeeOptions" placeholder="Pilih karyawan" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tipe Bonus" required>
            <UiSelect v-model="form.type" :options="typeOptions" />
          </UiFormField>
          <UiFormField label="Periode" required hint="Format YYYY-MM atau YYYY-Qx">
            <UiInput v-model="form.period" placeholder="2026-04 atau 2026-Q2" />
          </UiFormField>
          <UiFormField label="Nominal (Rp)" required>
            <UiInput v-model.number="form.amount" type="number" placeholder="0" />
          </UiFormField>
          <UiFormField label="Status">
            <UiSelect v-model="form.status" :options="statusOptions" />
          </UiFormField>
        </div>
        <UiFormField label="Alasan">
          <UiTextarea v-model="form.reason" rows="2" placeholder="e.g. KPI achievement >100%, project sukses on-time" />
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
      title="Hapus Bonus?"
      message="Bonus akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
