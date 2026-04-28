<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, CalendarDays, Clock, Check, XCircle } from 'lucide-vue-next'
import { useLeaveStore, type LeaveType, type LeaveStatus } from '~/stores/leave'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('myLeave')
useHead({ title: () => title.value })

const leaveStore = useLeaveStore()
const authStore = useAuthStore()

// Default to first employee's id when user is not employee-mapped
const meId = computed(() => authStore.user?.id ?? '1')

const showForm = ref(false)

interface FormState {
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}
const empty = (): FormState => ({ type: 'annual', startDate: '', endDate: '', reason: '' })
const form = ref<FormState>(empty())

const formTypeOptions = leaveStore.typeOptions.filter((o) => o.value !== 'all')

const myRequests = computed(() =>
  leaveStore.requests
    .filter((r) => r.employeeId === meId.value)
    .sort((a, b) => b.startDate.localeCompare(a.startDate)),
)
const pagination = usePagination(myRequests, { pageSize: 10 })

const balance = computed(() => leaveStore.getAnnualBalance(meId.value, String(new Date().getFullYear())))

const days = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0
  const s = new Date(form.value.startDate).getTime()
  const e = new Date(form.value.endDate).getTime()
  if (e < s) return 0
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
})

const isValid = computed(
  () => form.value.startDate !== '' && form.value.endDate !== '' && days.value > 0 && form.value.reason.trim() !== '',
)

function statusTone(s: LeaveStatus): 'good' | 'low' | 'average' {
  if (s === 'approved') return 'good'
  if (s === 'rejected') return 'low'
  return 'average'
}
function statusLabel(s: LeaveStatus) {
  return s === 'approved' ? 'Disetujui' : s === 'rejected' ? 'Ditolak' : 'Pending'
}
function typeLabel(t: LeaveType) {
  return formTypeOptions.find((o) => o.value === t)?.label ?? t
}

function openAdd() {
  form.value = empty()
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  leaveStore.addRequest({ ...form.value, employeeId: meId.value, days: days.value, status: 'pending' })
  showForm.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Lihat saldo cuti, riwayat, dan ajukan cuti baru."
    >
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Ajukan Cuti
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Kuota Tahunan" :value="`${balance.quota} hari`" :icon="CalendarDays" />
      <UiStatCard label="Sudah Terpakai" :value="`${balance.used} hari`" :icon="Clock" tone="average" />
      <UiStatCard label="Sisa Cuti" :value="`${balance.remaining} hari`" :icon="Check" tone="good" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border">
        <h3 class="font-semibold text-foreground">Riwayat Pengajuan</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipe</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hari</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Alasan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagination.pagedItems.value" :key="r.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm text-foreground">{{ typeLabel(r.type) }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ formatDate(r.startDate) }} – {{ formatDate(r.endDate) }}</td>
              <td class="px-4 py-3 text-sm">{{ r.days }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-md truncate">{{ r.reason }}</td>
              <td class="px-4 py-3">
                <UiStatusBadge :label="statusLabel(r.status)" :tone="statusTone(r.status)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        :icon="CalendarDays"
        title="Belum ada pengajuan cuti"
        description="Klik 'Ajukan Cuti' untuk membuat pengajuan baru."
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
      title="Ajukan Cuti"
      description="Sisa kuota cuti tahunan akan otomatis dipotong setelah disetujui."
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
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
        <div v-if="days > 0" class="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-sm text-primary">
          Total: <span class="font-semibold">{{ days }} hari</span>
          <span v-if="form.type === 'annual'" class="ml-2 text-muted-foreground">
            (sisa kuota setelah pengajuan: {{ Math.max(0, balance.remaining - days) }} hari)
          </span>
        </div>
        <UiFormField label="Alasan" required>
          <UiTextarea v-model="form.reason" rows="3" placeholder="Jelaskan alasan cuti" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">Ajukan</UiButton>
      </template>
    </UiModal>
  </div>
</template>
