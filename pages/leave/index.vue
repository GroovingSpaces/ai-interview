<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLeaveStore } from '~/stores/leave'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'
import type { LeaveRequest, LeaveType, LeaveStatus } from '~/stores/leave'
import { Plus, Edit, Trash2, X, AlertTriangle, CalendarOff, CheckCircle, XCircle } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('leave')
const { title } = usePageTitle('leave')
useHead({ title: () => title.value })

const leaveStore = useLeaveStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()
const { canApproveSubmission, currentUserEmployeeId } = useApprovalPermission()
const showDeleteModal = ref(false)
const showRejectModal = ref(false)
const selected = ref<LeaveRequest | null>(null)
const rejectNotes = ref('')

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` }))
)

function getEmployeeName(employeeId: string) {
  return employeesStore.getEmployeeById(employeeId)?.name ?? employeeId
}

function typeLabel(leaveType: LeaveType) {
  const m: Record<LeaveType, string> = {
    annual: 'Cuti Tahunan',
    sick: 'Sakit',
    personal: 'Izin',
    unpaid: 'Tanpa Bayar',
    other: 'Lainnya',
  }
  return m[leaveType] ?? leaveType
}

function statusLabel(s: LeaveStatus) {
  const m: Record<LeaveStatus, string> = { pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak' }
  return m[s] ?? s
}

function statusClass(s: LeaveStatus) {
  const classes: Record<LeaveStatus, string> = {
    pending: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    approved: 'bg-score-excellent/10 text-score-excellent border-score-excellent/30',
    rejected: 'bg-score-low/10 text-score-low border-score-low/30',
  }
  return classes[s] ?? ''
}

function openDelete(item: LeaveRequest) {
  selected.value = item
  showDeleteModal.value = true
}
function openReject(item: LeaveRequest) {
  selected.value = item
  rejectNotes.value = ''
  showRejectModal.value = true
}
function closeModals() {
  showDeleteModal.value = false
  showRejectModal.value = false
  selected.value = null
  rejectNotes.value = ''
}
function handleDelete() {
  if (!selected.value) return
  leaveStore.deleteRequest(selected.value.id)
  closeModals()
}
function handleApprove(item: LeaveRequest) {
  leaveStore.approveRequest(item.id, currentUserEmployeeId.value ?? authStore.user?.id ?? '')
}
function handleReject() {
  if (!selected.value) return
  leaveStore.rejectRequest(selected.value.id, rejectNotes.value.trim() || undefined)
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
      <NuxtLink to="/leave/add">
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          Ajukan Cuti
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-foreground">{{ leaveStore.stats.total }}</p>
        <p class="text-xs text-muted-foreground">Total</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-amber-600">{{ leaveStore.stats.pending }}</p>
        <p class="text-xs text-muted-foreground">Pending</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-score-excellent">{{ leaveStore.stats.approved }}</p>
        <p class="text-xs text-muted-foreground">Disetujui</p>
      </div>
      <div class="glass-card p-4">
        <p class="text-2xl font-bold text-score-low">{{ leaveStore.stats.rejected }}</p>
        <p class="text-xs text-muted-foreground">Ditolak</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3">
      <UiSelect
        v-model="leaveStore.employeeFilter"
        :options="[{ value: '', label: 'Semua Karyawan' }, ...employeeOptions]"
        class="w-52"
      />
      <UiSelect v-model="leaveStore.typeFilter" :options="leaveStore.typeOptions" class="w-40" />
      <UiSelect v-model="leaveStore.statusFilter" :options="leaveStore.statusOptions" class="w-40" />
    </div>

    <div v-if="leaveStore.filteredRequests.length === 0" class="glass-card p-12 text-center">
      <CalendarOff class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">Tidak Ada Pengajuan Cuti</h3>
      <p class="text-muted-foreground mb-4">Ajukan cuti pertama.</p>
      <NuxtLink to="/leave/add">
        <UiButton variant="gradient"><Plus class="w-4 h-4" /> Ajukan Cuti</UiButton>
      </NuxtLink>
    </div>

    <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50">
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">Aksi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipe</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hari</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alasan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in leaveStore.filteredRequests"
              :key="item.id"
              class="border-b border-border last:border-0 hover:bg-muted/30"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <template v-if="item.status === 'pending'">
                  <template v-if="canApproveSubmission(item.employeeId)">
                    <button class="p-2 rounded-lg hover:bg-score-excellent/10 text-score-excellent" title="Setujui" @click="handleApprove(item)">
                      <CheckCircle class="w-4 h-4" />
                    </button>
                    <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" title="Tolak" @click="openReject(item)">
                      <XCircle class="w-4 h-4" />
                    </button>
                  </template>
                  <NuxtLink :to="`/leave/${item.id}/edit`">
                    <button class="p-2 rounded-lg hover:bg-muted/50" title="Edit" type="button"><Edit class="w-4 h-4" /></button>
                  </NuxtLink>
                </template>
                <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" title="Hapus" @click="openDelete(item)"><Trash2 class="w-4 h-4" /></button>
              </td>
              <td class="px-4 py-3 font-medium">{{ getEmployeeName(item.employeeId) }}</td>
              <td class="px-4 py-3 text-sm">{{ typeLabel(item.type) }}</td>
              <td class="px-4 py-3 text-sm">{{ item.startDate }} s/d {{ item.endDate }}</td>
              <td class="px-4 py-3 text-sm">{{ item.days }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ item.reason }}</td>
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
            <h2 class="text-lg font-bold mb-2">Hapus Pengajuan Cuti</h2>
            <p class="text-muted-foreground mb-6">Hapus pengajuan cuti {{ selected ? getEmployeeName(selected.employeeId) : '' }}?</p>
            <div class="flex justify-center gap-3">
              <UiButton variant="outline" @click="closeModals">Batal</UiButton>
              <UiButton variant="outline" class="text-score-low border-score-low/30 hover:bg-score-low/10" @click="handleDelete"><Trash2 class="w-4 h-4" /> Hapus</UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reject Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold">Tolak Pengajuan Cuti</h2>
              <button class="p-2 rounded-lg hover:bg-muted/50" @click="closeModals"><X class="w-5 h-5" /></button>
            </div>
            <p class="text-sm text-muted-foreground mb-4">Alasan penolakan (opsional):</p>
            <UiInput v-model="rejectNotes" placeholder="Catatan penolakan" class="mb-4" />
            <div class="flex justify-end gap-3">
              <UiButton variant="outline" @click="closeModals">Batal</UiButton>
              <UiButton variant="outline" class="text-score-low border-score-low/30 hover:bg-score-low/10" @click="handleReject">
                <XCircle class="w-4 h-4" /> Tolak
              </UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
