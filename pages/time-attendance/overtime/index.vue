<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Check, XCircle, Clock, ClipboardList, Timer } from 'lucide-vue-next'
import { useOvertimeStore, type Overtime, type OvertimeStatus } from '~/stores/overtime'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('taOvertime')
useHead({ title: () => title.value })

const overtimeStore = useOvertimeStore()
const filteredOvertime = computed(() => overtimeStore.filteredRecords)
const pagination = usePagination(filteredOvertime, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  date: string
  startTime: string
  endTime: string
  reason: string
  status: OvertimeStatus
}
const empty = (): FormState => ({ employeeId: '', date: '', startTime: '17:30', endTime: '20:00', reason: '', status: 'pending' })
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [{ value: '', label: 'Semua Karyawan' }, ...employeeOptions.value])
const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
]
const formStatusOptions = statusOptions.filter((o) => o.value !== 'all')

const isEdit = computed(() => editingId.value !== null)
const computedHours = computed(() =>
  form.value.startTime && form.value.endTime ? overtimeStore.computeHours(form.value.startTime, form.value.endTime) : 0,
)
const isValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.date !== '' &&
    form.value.startTime !== '' &&
    form.value.endTime !== '' &&
    computedHours.value > 0,
)

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function statusTone(s: OvertimeStatus): 'good' | 'low' | 'average' {
  if (s === 'approved') return 'good'
  if (s === 'rejected') return 'low'
  return 'average'
}
function statusLabel(s: OvertimeStatus) {
  return statusOptions.find((o) => o.value === s)?.label ?? s
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(o: Overtime) {
  editingId.value = o.id
  form.value = {
    employeeId: o.employeeId,
    date: o.date,
    startTime: o.startTime,
    endTime: o.endTime,
    reason: o.reason ?? '',
    status: o.status,
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    date: form.value.date,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    reason: form.value.reason || undefined,
    status: form.value.status,
  }
  if (isEdit.value && editingId.value) {
    overtimeStore.updateOvertime(editingId.value, payload)
  } else {
    overtimeStore.addOvertime(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) overtimeStore.deleteOvertime(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Kelola pengajuan dan persetujuan lembur karyawan."
    >
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Pengajuan Lembur
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Pengajuan" :value="overtimeStore.stats.total" :icon="ClipboardList" />
      <UiStatCard label="Pending" :value="overtimeStore.stats.pending" tone="average" :icon="Clock" />
      <UiStatCard label="Disetujui" :value="overtimeStore.stats.approved" tone="good" :icon="Check" />
      <UiStatCard label="Ditolak" :value="overtimeStore.stats.rejected" tone="low" :icon="XCircle" />
    </div>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <UiInput v-model="overtimeStore.dateFilter" type="date" />
      <UiSelect v-model="overtimeStore.employeeFilter" :options="employeeFilterOptions" />
      <UiSelect v-model="overtimeStore.statusFilter" :options="statusOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Jam</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alasan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in pagination.pagedItems.value" :key="o.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm">{{ formatDate(o.date) }}</td>
              <td class="px-4 py-3 text-sm">{{ employeeName(o.employeeId) }}</td>
              <td class="px-4 py-3 text-sm font-mono">{{ o.startTime }} – {{ o.endTime }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-foreground">{{ o.hours }}j</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ o.reason ?? '-' }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="statusLabel(o.status)" :tone="statusTone(o.status)" /></td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="o.status === 'pending'" class="p-2 rounded-lg text-muted-foreground hover:text-score-good hover:bg-score-good/10" title="Setujui" @click="overtimeStore.updateOvertime(o.id, { status: 'approved' })">
                    <Check class="w-4 h-4" />
                  </button>
                  <button v-if="o.status === 'pending'" class="p-2 rounded-lg text-muted-foreground hover:text-score-low hover:bg-score-low/10" title="Tolak" @click="overtimeStore.updateOvertime(o.id, { status: 'rejected' })">
                    <XCircle class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Edit" @click="openEdit(o)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="askDelete(o.id)">
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
        :icon="Timer"
        title="Belum ada pengajuan lembur"
        description="Buat pengajuan baru untuk mendokumentasikan jam lembur."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="pengajuan"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Pengajuan Lembur' : 'Pengajuan Lembur Baru'"
      description="Catat jam mulai dan selesai untuk hitung otomatis durasi lembur."
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Karyawan" required>
          <UiSelect v-model="form.employeeId" :options="employeeOptions" placeholder="Pilih karyawan" />
        </UiFormField>
        <UiFormField label="Tanggal" required>
          <UiInput v-model="form.date" type="date" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Jam Mulai" required>
            <UiInput v-model="form.startTime" type="time" />
          </UiFormField>
          <UiFormField label="Jam Selesai" required>
            <UiInput v-model="form.endTime" type="time" />
          </UiFormField>
        </div>
        <div v-if="computedHours > 0" class="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-sm text-primary">
          Durasi: <span class="font-semibold">{{ computedHours }} jam</span>
        </div>
        <UiFormField label="Alasan">
          <UiTextarea v-model="form.reason" rows="2" placeholder="e.g. Project deadline, deployment system" />
        </UiFormField>
        <UiFormField label="Status">
          <UiSelect v-model="form.status" :options="formStatusOptions" />
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
      title="Hapus Pengajuan Lembur?"
      message="Pengajuan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
