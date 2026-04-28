<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Plane, Trash, MapPin, Check, XCircle, ClipboardList } from 'lucide-vue-next'
import { useBusinessTripStore, type BusinessTrip, type BusinessTripStatus, type BusinessTripExpense } from '~/stores/business-trip'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('businessTrip')
useHead({ title: () => title.value })

const tripStore = useBusinessTripStore()
const filteredTrips = computed(() => tripStore.filtered)
const pagination = usePagination(filteredTrips, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  destination: string
  purpose: string
  startDate: string
  endDate: string
  transportMode: string
  accommodation: string
  estimatedBudget: number | undefined
  expenses: BusinessTripExpense[]
  notes: string
  status: BusinessTripStatus
}
const empty = (): FormState => ({
  employeeId: '',
  destination: '',
  purpose: '',
  startDate: '',
  endDate: '',
  transportMode: '',
  accommodation: '',
  estimatedBudget: undefined,
  expenses: [],
  notes: '',
  status: 'draft',
})
const form = ref<FormState>(empty())

const transportOptions = [
  { value: 'Pesawat', label: 'Pesawat' },
  { value: 'Kereta Api', label: 'Kereta Api' },
  { value: 'Mobil dinas', label: 'Mobil Dinas' },
  { value: 'Mobil rental', label: 'Mobil Rental' },
  { value: 'Kapal laut', label: 'Kapal Laut' },
  { value: 'Lainnya', label: 'Lainnya' },
]
const expenseCategoryOptions = [
  { value: 'Transport', label: 'Transport' },
  { value: 'Akomodasi', label: 'Akomodasi' },
  { value: 'Konsumsi', label: 'Konsumsi' },
  { value: 'Komunikasi', label: 'Komunikasi' },
  { value: 'Operasional', label: 'Operasional' },
  { value: 'Lainnya', label: 'Lainnya' },
]
const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Diajukan' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'completed', label: 'Selesai' },
]
const formStatusOptions = statusOptions.filter((o) => o.value !== 'all')

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [
  { value: '', label: 'Semua Karyawan' },
  ...employeeOptions.value,
])

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.destination.trim() !== '' &&
    form.value.purpose.trim() !== '' &&
    form.value.startDate !== '' &&
    form.value.endDate !== '',
)

const totalExpenses = computed(() =>
  form.value.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
)

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function statusTone(s: BusinessTripStatus): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (s === 'approved' || s === 'completed') return 'good'
  if (s === 'rejected') return 'low'
  if (s === 'submitted') return 'average'
  return 'muted'
}
function statusLabel(s: BusinessTripStatus) {
  return statusOptions.find((o) => o.value === s)?.label ?? s
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(t: BusinessTrip) {
  editingId.value = t.id
  form.value = {
    employeeId: t.employeeId,
    destination: t.destination,
    purpose: t.purpose,
    startDate: t.startDate,
    endDate: t.endDate,
    transportMode: t.transportMode ?? '',
    accommodation: t.accommodation ?? '',
    estimatedBudget: t.estimatedBudget,
    expenses: JSON.parse(JSON.stringify(t.expenses ?? [])),
    notes: t.notes ?? '',
    status: t.status,
  }
  showForm.value = true
}
function addExpense() {
  form.value.expenses.push({ category: 'Transport', amount: 0, description: '' })
}
function removeExpense(i: number) {
  form.value.expenses.splice(i, 1)
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    destination: form.value.destination,
    purpose: form.value.purpose,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    transportMode: form.value.transportMode || undefined,
    accommodation: form.value.accommodation || undefined,
    estimatedBudget: Number(form.value.estimatedBudget) || 0,
    expenses: form.value.expenses,
    notes: form.value.notes || undefined,
    status: form.value.status,
  }
  if (isEdit.value && editingId.value) {
    tripStore.updateTrip(editingId.value, payload)
  } else {
    tripStore.addTrip(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) tripStore.deleteTrip(targetId.value)
  showDelete.value = false
  targetId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Kelola pengajuan perjalanan dinas: tujuan, transport, akomodasi, dan estimasi biaya."
    >
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Pengajuan Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Trip" :value="tripStore.stats.total" :icon="Plane" />
      <UiStatCard label="Diajukan" :value="tripStore.stats.submitted" tone="average" :icon="ClipboardList" />
      <UiStatCard label="Disetujui" :value="tripStore.stats.approved" tone="good" :icon="Check" />
      <UiStatCard label="Total Anggaran" :value="`Rp ${tripStore.stats.totalBudget.toLocaleString('id-ID')}`" tone="primary" :icon="MapPin" />
    </div>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <UiSelect v-model="tripStore.employeeFilter" :options="employeeFilterOptions" placeholder="Filter karyawan" />
      <UiSelect v-model="tripStore.statusFilter" :options="statusOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tujuan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Anggaran</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in pagination.pagedItems.value" :key="t.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm text-foreground">{{ employeeName(t.employeeId) }}</td>
              <td class="px-4 py-3">
                <p class="text-sm text-foreground">{{ t.destination }}</p>
                <p class="text-xs text-muted-foreground truncate max-w-xs">{{ t.purpose }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ formatDate(t.startDate) }} – {{ formatDate(t.endDate) }}</td>
              <td class="px-4 py-3 text-sm font-mono text-foreground">Rp {{ t.estimatedBudget.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3">
                <UiStatusBadge :label="statusLabel(t.status)" :tone="statusTone(t.status)" />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="t.status === 'submitted'" class="p-2 rounded-lg text-muted-foreground hover:text-score-good hover:bg-score-good/10" title="Setujui" @click="tripStore.approve(t.id, '99')">
                    <Check class="w-4 h-4" />
                  </button>
                  <button v-if="t.status === 'submitted'" class="p-2 rounded-lg text-muted-foreground hover:text-score-low hover:bg-score-low/10" title="Tolak" @click="tripStore.reject(t.id)">
                    <XCircle class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Edit" @click="openEdit(t)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="askDelete(t.id)">
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
        :icon="Plane"
        title="Belum ada perjalanan dinas"
        description="Klik tombol di atas untuk membuat pengajuan baru."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="perjalanan"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Perjalanan Dinas' : 'Pengajuan Perjalanan Dinas'"
      description="Lengkapi tujuan, periode, dan estimasi biaya."
      size="xl"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Karyawan" required>
            <UiSelect v-model="form.employeeId" :options="employeeOptions" placeholder="Pilih karyawan" />
          </UiFormField>
          <UiFormField label="Status" required>
            <UiSelect v-model="form.status" :options="formStatusOptions" />
          </UiFormField>
          <UiFormField label="Tujuan" required hint="Kota/lokasi tujuan">
            <UiInput v-model="form.destination" placeholder="e.g. Surabaya" />
          </UiFormField>
          <UiFormField label="Tujuan Perjalanan" required>
            <UiInput v-model="form.purpose" placeholder="e.g. Site visit & client meeting" />
          </UiFormField>
          <UiFormField label="Tanggal Berangkat" required>
            <UiInput v-model="form.startDate" type="date" />
          </UiFormField>
          <UiFormField label="Tanggal Pulang" required>
            <UiInput v-model="form.endDate" type="date" />
          </UiFormField>
          <UiFormField label="Moda Transportasi">
            <UiSelect v-model="form.transportMode" :options="transportOptions" placeholder="Pilih moda" />
          </UiFormField>
          <UiFormField label="Akomodasi">
            <UiInput v-model="form.accommodation" placeholder="e.g. Hotel Bintang 4" />
          </UiFormField>
          <UiFormField label="Estimasi Anggaran (Rp)" required>
            <UiInput v-model.number="form.estimatedBudget" type="number" placeholder="0" />
          </UiFormField>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-foreground">Rincian Biaya (opsional)</h4>
            <UiButton type="button" variant="outline" size="sm" @click="addExpense">
              <Plus class="w-3.5 h-3.5" />
              Tambah Item
            </UiButton>
          </div>
          <div v-if="form.expenses.length === 0" class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Belum ada rincian biaya.
          </div>
          <div v-for="(exp, idx) in form.expenses" :key="idx" class="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
            <div class="md:col-span-3">
              <UiSelect v-model="exp.category" :options="expenseCategoryOptions" />
            </div>
            <div class="md:col-span-3">
              <UiInput v-model.number="exp.amount" type="number" placeholder="Jumlah (Rp)" />
            </div>
            <div class="md:col-span-5">
              <UiInput v-model="exp.description" placeholder="Keterangan (opsional)" />
            </div>
            <div class="md:col-span-1 flex justify-end">
              <button type="button" class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="removeExpense(idx)">
                <Trash class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div v-if="form.expenses.length > 0" class="text-sm text-right text-foreground">
            Total Rincian: <span class="font-semibold">Rp {{ totalExpenses.toLocaleString('id-ID') }}</span>
          </div>
        </div>

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
      title="Hapus Perjalanan Dinas?"
      message="Data pengajuan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
