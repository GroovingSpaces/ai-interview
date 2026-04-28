<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus, Search, Pencil, Trash2, Check, XCircle, FileText, CalendarDays, ClipboardList,
} from 'lucide-vue-next'
import { useLeaveStore, type LeaveRequest, type LeaveType, type LeaveStatus } from '~/stores/leave'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('leaveRequest')
useHead({ title: () => title.value })

const leaveStore = useLeaveStore()
const filteredLeave = computed(() => leaveStore.filteredRequests)
const pagination = usePagination(filteredLeave, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const showRejectNote = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)
const rejectNote = ref('')

interface FormState {
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}
const empty = (): FormState => ({ employeeId: '', type: 'annual', startDate: '', endDate: '', reason: '' })
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [
  { value: '', label: 'Semua Karyawan' },
  ...employeeOptions.value,
])
const typeOptions = leaveStore.typeOptions
const formTypeOptions = typeOptions.filter((o) => o.value !== 'all')
const statusOptions = leaveStore.statusOptions

const isEdit = computed(() => editingId.value !== null)

const days = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0
  const s = new Date(form.value.startDate).getTime()
  const e = new Date(form.value.endDate).getTime()
  if (e < s) return 0
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
})

const isValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.startDate !== '' &&
    form.value.endDate !== '' &&
    days.value > 0 &&
    form.value.reason.trim() !== '',
)

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function typeLabel(t: LeaveType) {
  return formTypeOptions.find((o) => o.value === t)?.label ?? t
}
function statusTone(s: LeaveStatus): 'good' | 'low' | 'average' {
  if (s === 'approved') return 'good'
  if (s === 'rejected') return 'low'
  return 'average'
}
function statusLabel(s: LeaveStatus) {
  return s === 'approved' ? 'Disetujui' : s === 'rejected' ? 'Ditolak' : 'Pending'
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(r: LeaveRequest) {
  editingId.value = r.id
  form.value = {
    employeeId: r.employeeId,
    type: r.type,
    startDate: r.startDate,
    endDate: r.endDate,
    reason: r.reason,
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  if (isEdit.value && editingId.value) {
    leaveStore.updateRequest(editingId.value, { ...form.value, days: days.value })
  } else {
    leaveStore.addRequest({ ...form.value, days: days.value, status: 'pending' })
  }
  showForm.value = false
}

function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) leaveStore.deleteRequest(targetId.value)
  showDelete.value = false
  targetId.value = null
}

function approve(id: string) {
  leaveStore.approveRequest(id, '99')
}
function askReject(id: string) {
  targetId.value = id
  rejectNote.value = ''
  showRejectNote.value = true
}
function confirmReject() {
  if (targetId.value) leaveStore.rejectRequest(targetId.value, rejectNote.value || undefined)
  showRejectNote.value = false
  targetId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Kelola pengajuan cuti karyawan: tinjau, setujui, atau tolak."
    >
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Pengajuan Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Pengajuan" :value="leaveStore.stats.total" :icon="ClipboardList" />
      <UiStatCard label="Pending" :value="leaveStore.stats.pending" :icon="FileText" tone="average" />
      <UiStatCard label="Disetujui" :value="leaveStore.stats.approved" :icon="Check" tone="good" />
      <UiStatCard label="Ditolak" :value="leaveStore.stats.rejected" :icon="XCircle" tone="low" />
    </div>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <UiSelect v-model="leaveStore.employeeFilter" :options="employeeFilterOptions" placeholder="Filter karyawan" />
      <UiSelect v-model="leaveStore.typeFilter" :options="typeOptions" />
      <UiSelect v-model="leaveStore.statusFilter" :options="statusOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipe</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hari</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alasan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagination.pagedItems.value" :key="r.id" class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3 text-sm text-foreground">{{ employeeName(r.employeeId) }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ typeLabel(r.type) }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ formatDate(r.startDate) }} – {{ formatDate(r.endDate) }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ r.days }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate" :title="r.reason">{{ r.reason }}</td>
              <td class="px-4 py-3">
                <UiStatusBadge :label="statusLabel(r.status)" :tone="statusTone(r.status)" />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="r.status === 'pending'" class="p-2 rounded-lg text-muted-foreground hover:text-score-good hover:bg-score-good/10" title="Setujui" @click="approve(r.id)">
                    <Check class="w-4 h-4" />
                  </button>
                  <button v-if="r.status === 'pending'" class="p-2 rounded-lg text-muted-foreground hover:text-score-low hover:bg-score-low/10" title="Tolak" @click="askReject(r.id)">
                    <XCircle class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Edit" @click="openEdit(r)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="askDelete(r.id)">
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
        :icon="CalendarDays"
        title="Belum ada pengajuan cuti"
        description="Buat pengajuan baru atau ubah filter."
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
      :title="isEdit ? 'Edit Pengajuan Cuti' : 'Pengajuan Cuti Baru'"
      description="Lengkapi data pengajuan cuti."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Karyawan" required>
          <UiSelect v-model="form.employeeId" :options="employeeOptions" placeholder="Pilih karyawan" />
        </UiFormField>
        <UiFormField label="Tipe Cuti" required>
          <UiSelect v-model="form.type" :options="formTypeOptions" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tanggal Mulai" required>
            <UiInput v-model="form.startDate" type="date" />
          </UiFormField>
          <UiFormField label="Tanggal Selesai" required>
            <UiInput v-model="form.endDate" type="date" />
          </UiFormField>
        </div>
        <div v-if="days > 0" class="text-sm text-muted-foreground">
          Total: <span class="font-semibold text-foreground">{{ days }} hari</span>
        </div>
        <UiFormField label="Alasan" required>
          <UiTextarea v-model="form.reason" rows="3" placeholder="Jelaskan alasan cuti" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Ajukan' }}
        </UiButton>
      </template>
    </UiModal>

    <UiModal
      :open="showRejectNote"
      title="Tolak Pengajuan Cuti"
      description="Tambahkan alasan penolakan agar karyawan paham."
      @update:open="showRejectNote = $event"
    >
      <UiFormField label="Catatan Penolakan">
        <UiTextarea v-model="rejectNote" rows="3" placeholder="e.g. Periode high-season, harap reschedule." />
      </UiFormField>
      <template #footer>
        <UiButton variant="outline" @click="showRejectNote = false">Batal</UiButton>
        <UiButton variant="destructive" @click="confirmReject">
          <XCircle class="w-4 h-4" />
          Tolak
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Pengajuan?"
      message="Pengajuan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
