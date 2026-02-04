<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAttendanceStore } from '~/stores/attendance'
import { useEmployeesStore } from '~/stores/employees'
import type { Attendance, AttendanceStatus } from '~/stores/attendance'
import { Plus, Edit, Trash2, AlertTriangle, CalendarCheck, CheckCircle } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('attendance')
const tCommon = useModuleT('common')
const tDash = useModuleT('dashboard')
const { title } = usePageTitle('attendance')
useHead({ title: () => title.value })

const attendanceStore = useAttendanceStore()
const employeesStore = useEmployeesStore()
const { canApproveSubmission, currentUserEmployeeId } = useApprovalPermission()
const showDeleteModal = ref(false)
const selected = ref<Attendance | null>(null)

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` }))
)

const statusFilterOptions = computed(() => [
  { value: 'all', label: t('allStatus') },
  { value: 'present', label: t('present') },
  { value: 'late', label: t('late') },
  { value: 'absent', label: t('absent') },
  { value: 'leave', label: t('leave') },
  { value: 'wfh', label: t('wfh') },
])

function getEmployeeName(employeeId: string) {
  return employeesStore.getEmployeeById(employeeId)?.name ?? employeeId
}

function statusLabel(s: AttendanceStatus) {
  const m: Record<AttendanceStatus, string> = {
    present: t('present'),
    late: t('late'),
    absent: t('absent'),
    leave: t('leave'),
    wfh: t('wfh'),
  }
  return m[s] ?? s
}

function statusClass(s: AttendanceStatus) {
  const classes: Record<AttendanceStatus, string> = {
    present: 'bg-score-excellent/10 text-score-excellent border-score-excellent/30',
    late: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    absent: 'bg-score-low/10 text-score-low border-score-low/30',
    leave: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    wfh: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  }
  return classes[s] ?? ''
}

function openDelete(item: Attendance) {
  selected.value = item
  showDeleteModal.value = true
}
function closeModals() {
  showDeleteModal.value = false
  selected.value = null
}
function handleApproveAttendance(item: Attendance) {
  attendanceStore.updateRecord(item.id, { approved: true, approvedBy: currentUserEmployeeId.value })
}
function handleDelete() {
  if (!selected.value) return
  attendanceStore.deleteRecord(selected.value.id)
  closeModals()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-muted-foreground">{{ t('subtitle') }}</p>
      </div>
      <NuxtLink to="/attendance/add">
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          {{ t('addAttendance') }}
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-6 gap-4">
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-foreground">{{ attendanceStore.stats.total }}</p>
        <p class="text-xs text-muted-foreground">{{ tDash('total') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-score-excellent">{{ attendanceStore.stats.present }}</p>
        <p class="text-xs text-muted-foreground">{{ t('present') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-amber-600">{{ attendanceStore.stats.late }}</p>
        <p class="text-xs text-muted-foreground">{{ t('late') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-score-low">{{ attendanceStore.stats.absent }}</p>
        <p class="text-xs text-muted-foreground">{{ t('absent') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-blue-600">{{ attendanceStore.stats.leave }}</p>
        <p class="text-xs text-muted-foreground">{{ t('leave') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-purple-600">{{ attendanceStore.stats.wfh }}</p>
        <p class="text-xs text-muted-foreground">{{ t('wfh') }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <UiInput v-model="attendanceStore.dateFilter" type="date" :placeholder="t('date')" class="w-40" />
      <UiSelect
        v-model="attendanceStore.employeeFilter"
        :options="[{ value: '', label: t('allEmployees') }, ...employeeOptions]"
        class="w-52"
      />
      <UiSelect v-model="attendanceStore.statusFilter" :options="statusFilterOptions" class="w-40" />
    </div>

    <div v-if="attendanceStore.filteredRecords.length === 0" class="glass-card p-12 text-center">
      <CalendarCheck class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">{{ t('noData') }}</h3>
      <p class="text-muted-foreground mb-4">{{ t('addFirst') }}</p>
      <NuxtLink to="/attendance/add">
        <UiButton variant="gradient"><Plus class="w-4 h-4" /> {{ t('addAttendance') }}</UiButton>
      </NuxtLink>
    </div>

    <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50">
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{{ tCommon('actions') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('date') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('employee') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('checkIn') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('checkOut') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ tCommon('status') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('notes') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('approval') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in attendanceStore.filteredRecords"
              :key="item.id"
              class="border-b border-border last:border-0 hover:bg-muted/30"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <template v-if="!item.approved && canApproveSubmission(item.employeeId)">
                  <button class="p-2 rounded-lg hover:bg-score-excellent/10 text-score-excellent" :title="t('approve')" @click="handleApproveAttendance(item)">
                    <CheckCircle class="w-4 h-4" />
                  </button>
                </template>
                <NuxtLink :to="`/attendance/${item.id}/edit`">
                  <button class="p-2 rounded-lg hover:bg-muted/50" :title="tCommon('edit')" type="button"><Edit class="w-4 h-4" /></button>
                </NuxtLink>
                <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" :title="tCommon('delete')" @click="openDelete(item)"><Trash2 class="w-4 h-4" /></button>
              </td>
              <td class="px-4 py-3 text-sm">{{ item.date }}</td>
              <td class="px-4 py-3 font-medium">{{ getEmployeeName(item.employeeId) }}</td>
              <td class="px-4 py-3 text-sm">{{ item.checkIn ?? '-' }}</td>
              <td class="px-4 py-3 text-sm">{{ item.checkOut ?? '-' }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium border', statusClass(item.status)]">
                  {{ statusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ item.notes ?? '-' }}</td>
              <td class="px-4 py-3">
                <span
                  v-if="item.approved !== false"
                  class="px-2 py-1 rounded-full text-xs font-medium border bg-score-excellent/10 text-score-excellent border-score-excellent/30"
                >
                  {{ t('approved') }}
                </span>
                <span
                  v-else
                  class="px-2 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-600 border-amber-500/30"
                >
                  {{ t('pendingApproval') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 text-center">
            <AlertTriangle class="w-12 h-12 mx-auto text-score-low mb-4" />
            <h2 class="text-lg font-bold mb-2">{{ t('deleteAttendance') }}</h2>
            <p class="text-muted-foreground mb-6">{{ t('deleteConfirm', { name: selected ? getEmployeeName(selected.employeeId) : '', date: selected?.date ?? '' }) }}</p>
            <div class="flex justify-center gap-3">
              <UiButton variant="outline" @click="closeModals">{{ tCommon('cancel') }}</UiButton>
              <UiButton variant="outline" class="text-score-low border-score-low/30 hover:bg-score-low/10" @click="handleDelete"><Trash2 class="w-4 h-4" /> {{ tCommon('delete') }}</UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
