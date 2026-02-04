<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOvertimeStore } from '~/stores/overtime'
import { useEmployeesStore } from '~/stores/employees'
import type { Overtime, OvertimeStatus } from '~/stores/overtime'
import { Plus, Edit, Trash2, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('overtime')
const tCommon = useModuleT('common')
const tDash = useModuleT('dashboard')
const { title } = usePageTitle('overtime')
useHead({ title: () => title.value })

const overtimeStore = useOvertimeStore()
const employeesStore = useEmployeesStore()
const { canApproveSubmission } = useApprovalPermission()
const showDeleteModal = ref(false)
const selected = ref<Overtime | null>(null)

const employeeOptions = computed(() =>
  employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` }))
)

const statusFilterOptions = computed(() => [
  { value: 'all', label: t('allStatus') },
  { value: 'pending', label: t('pending') },
  { value: 'approved', label: t('approved') },
  { value: 'rejected', label: t('rejected') },
])

function getEmployeeName(employeeId: string) {
  return employeesStore.getEmployeeById(employeeId)?.name ?? employeeId
}

function statusLabel(s: OvertimeStatus) {
  const m: Record<OvertimeStatus, string> = {
    pending: t('pending'),
    approved: t('approved'),
    rejected: t('rejected'),
  }
  return m[s] ?? s
}

function statusClass(s: OvertimeStatus) {
  const classes: Record<OvertimeStatus, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    approved: 'bg-score-excellent/10 text-score-excellent border-score-excellent/30',
    rejected: 'bg-score-low/10 text-score-low border-score-low/30',
  }
  return classes[s] ?? ''
}

function openDelete(item: Overtime) {
  selected.value = item
  showDeleteModal.value = true
}
function closeModals() {
  showDeleteModal.value = false
  selected.value = null
}
function handleDelete() {
  if (!selected.value) return
  overtimeStore.deleteOvertime(selected.value.id)
  closeModals()
}
function handleApproveOvertime(item: Overtime) {
  overtimeStore.updateOvertime(item.id, { status: 'approved' })
}
function handleRejectOvertime(item: Overtime) {
  overtimeStore.updateOvertime(item.id, { status: 'rejected' })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-muted-foreground">{{ t('subtitle') }}</p>
      </div>
      <NuxtLink to="/overtime/add">
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          {{ t('addOvertime') }}
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-foreground">{{ overtimeStore.stats.total }}</p>
        <p class="text-xs text-muted-foreground">{{ tDash('total') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-amber-600">{{ overtimeStore.stats.pending }}</p>
        <p class="text-xs text-muted-foreground">{{ t('pending') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-score-excellent">{{ overtimeStore.stats.approved }}</p>
        <p class="text-xs text-muted-foreground">{{ t('approved') }}</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-score-low">{{ overtimeStore.stats.rejected }}</p>
        <p class="text-xs text-muted-foreground">{{ t('rejected') }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <UiInput v-model="overtimeStore.dateFilter" type="date" :placeholder="t('date')" class="w-40" />
      <UiSelect
        v-model="overtimeStore.employeeFilter"
        :options="[{ value: '', label: t('allEmployees') }, ...employeeOptions]"
        class="w-52"
      />
      <UiSelect v-model="overtimeStore.statusFilter" :options="statusFilterOptions" class="w-40" />
    </div>

    <div v-if="overtimeStore.filteredRecords.length === 0" class="glass-card p-12 text-center">
      <Clock class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">{{ t('noData') }}</h3>
      <p class="text-muted-foreground mb-4">{{ t('addFirst') }}</p>
      <NuxtLink to="/overtime/add">
        <UiButton variant="gradient"><Plus class="w-4 h-4" /> {{ t('addOvertime') }}</UiButton>
      </NuxtLink>
    </div>

    <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50">
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{{ tCommon('actions') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('employee') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('date') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('startTime') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('endTime') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('hours') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('reason') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in overtimeStore.filteredRecords"
              :key="item.id"
              class="border-b border-border last:border-0 hover:bg-muted/30"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <template v-if="item.status === 'pending' && canApproveSubmission(item.employeeId)">
                  <button class="p-2 rounded-lg hover:bg-score-excellent/10 text-score-excellent" :title="t('approved')" @click="handleApproveOvertime(item)">
                    <CheckCircle class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" :title="t('rejected')" @click="handleRejectOvertime(item)">
                    <XCircle class="w-4 h-4" />
                  </button>
                </template>
                <NuxtLink :to="`/overtime/${item.id}/edit`">
                  <button class="p-2 rounded-lg hover:bg-muted/50" :title="tCommon('edit')" type="button"><Edit class="w-4 h-4" /></button>
                </NuxtLink>
                <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" :title="tCommon('delete')" @click="openDelete(item)"><Trash2 class="w-4 h-4" /></button>
              </td>
              <td class="px-4 py-3 font-medium">{{ getEmployeeName(item.employeeId) }}</td>
              <td class="px-4 py-3 text-sm">{{ item.date }}</td>
              <td class="px-4 py-3 text-sm">{{ item.startTime }}</td>
              <td class="px-4 py-3 text-sm">{{ item.endTime }}</td>
              <td class="px-4 py-3 text-sm">{{ item.hours ?? '-' }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ item.reason ?? '-' }}</td>
              <td class="px-4 py-3">
                <span :class="['px-2 py-1 rounded-full text-xs font-medium border', statusClass(item.status)]">
                  {{ statusLabel(item.status) }}
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
            <h2 class="text-lg font-bold mb-2">{{ t('deleteOvertime') }}</h2>
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
