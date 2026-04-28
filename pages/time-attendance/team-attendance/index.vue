<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, Pencil, Trash2, CalendarCheck, UserCheck, UserX, Clock } from 'lucide-vue-next'
import { useAttendanceStore, type Attendance, type AttendanceStatus } from '~/stores/attendance'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('teamAttendance')
useHead({ title: () => title.value })

const attendanceStore = useAttendanceStore()
const filteredRecords = computed(() => attendanceStore.filteredRecords)
const pagination = usePagination(filteredRecords, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  date: string
  checkIn: string
  checkOut: string
  status: AttendanceStatus
  notes: string
}
const empty = (): FormState => ({ employeeId: '', date: '', checkIn: '', checkOut: '', status: 'present', notes: '' })
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [{ value: '', label: 'Semua Karyawan' }, ...employeeOptions.value])
const statusOptions = attendanceStore.statusOptions
const formStatusOptions = statusOptions.filter((o) => o.value !== 'all')

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(() => form.value.employeeId !== '' && form.value.date !== '')

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function statusTone(s: AttendanceStatus): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (s === 'present') return 'good'
  if (s === 'late') return 'average'
  if (s === 'absent') return 'low'
  if (s === 'wfh') return 'primary'
  if (s === 'leave') return 'muted'
  return 'muted'
}
function statusLabel(s: AttendanceStatus) {
  return statusOptions.find((o) => o.value === s)?.label ?? s
}

function openAdd() {
  editingId.value = null
  form.value = { ...empty(), date: new Date().toISOString().slice(0, 10) }
  showForm.value = true
}
function openEdit(a: Attendance) {
  editingId.value = a.id
  form.value = {
    employeeId: a.employeeId,
    date: a.date,
    checkIn: a.checkIn ?? '',
    checkOut: a.checkOut ?? '',
    status: a.status,
    notes: a.notes ?? '',
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    date: form.value.date,
    checkIn: form.value.checkIn || undefined,
    checkOut: form.value.checkOut || undefined,
    status: form.value.status,
    notes: form.value.notes || undefined,
    approved: false,
  }
  if (isEdit.value && editingId.value) {
    attendanceStore.updateRecord(editingId.value, payload)
  } else {
    attendanceStore.addRecord(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) attendanceStore.deleteRecord(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Pantau dan kelola absensi seluruh tim. Manual input dan approve juga di sini."
    >
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Input Manual
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <UiStatCard label="Total Catatan" :value="attendanceStore.stats.total" :icon="CalendarCheck" />
      <UiStatCard label="Hadir" :value="attendanceStore.stats.present" tone="good" :icon="UserCheck" />
      <UiStatCard label="Terlambat" :value="attendanceStore.stats.late" tone="average" :icon="Clock" />
      <UiStatCard label="Tidak Hadir" :value="attendanceStore.stats.absent" tone="low" :icon="UserX" />
      <UiStatCard label="WFH" :value="attendanceStore.stats.wfh" tone="primary" :icon="UserCheck" />
    </div>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <UiInput v-model="attendanceStore.dateFilter" type="date" placeholder="Filter tanggal" />
      <UiSelect v-model="attendanceStore.employeeFilter" :options="employeeFilterOptions" />
      <UiSelect v-model="attendanceStore.statusFilter" :options="statusOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tanggal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">In / Out</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Approval</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagination.pagedItems.value" :key="r.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm text-foreground">{{ formatDate(r.date) }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ employeeName(r.employeeId) }}</td>
              <td class="px-4 py-3 text-sm font-mono text-muted-foreground">{{ r.checkIn ?? '-' }} / {{ r.checkOut ?? '-' }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="statusLabel(r.status)" :tone="statusTone(r.status)" /></td>
              <td class="px-4 py-3">
                <UiStatusBadge :label="r.approved ? 'Approved' : 'Pending'" :tone="r.approved ? 'good' : 'average'" />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button v-if="!r.approved" class="p-2 rounded-lg text-muted-foreground hover:text-score-good hover:bg-score-good/10" title="Approve" @click="attendanceStore.updateRecord(r.id, { approved: true, approvedBy: '99' })">
                    <UserCheck class="w-4 h-4" />
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
        :icon="CalendarCheck"
        title="Tidak ada data absensi"
        description="Tambah catatan manual atau ubah filter."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="catatan"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Catatan Absensi' : 'Input Manual Absensi'"
      description="Untuk koreksi atau pencatatan WFH/cuti."
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
          <UiFormField label="Clock In" hint="Format HH:MM">
            <UiInput v-model="form.checkIn" type="time" />
          </UiFormField>
          <UiFormField label="Clock Out">
            <UiInput v-model="form.checkOut" type="time" />
          </UiFormField>
        </div>
        <UiFormField label="Status" required>
          <UiSelect v-model="form.status" :options="formStatusOptions" />
        </UiFormField>
        <UiFormField label="Catatan">
          <UiTextarea v-model="form.notes" rows="2" placeholder="Alasan WFH / koreksi / dll" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Tambah' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Catatan Absensi?"
      message="Catatan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
