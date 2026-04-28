<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Send, ClipboardList, Users, Inbox, CheckCircle2 } from 'lucide-vue-next'
import { useHrServiceStore, type Ticket, type TicketStatus, type TicketPriority, type TicketCategory } from '~/stores/hr-service'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('serviceConsole')
useHead({ title: () => title.value })

const hrStore = useHrServiceStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const statusFilter = ref<string>('all')
const priorityFilter = ref<string>('all')
const categoryFilter = ref<string>('all')

const showDetail = ref(false)
const detailId = ref<string | null>(null)
const newComment = ref('')

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  ...(Object.keys(hrStore.statusLabels) as TicketStatus[]).map((k) => ({ value: k, label: hrStore.statusLabels[k] })),
]
const priorityOptions = [
  { value: 'all', label: 'Semua Prioritas' },
  ...(Object.keys(hrStore.priorityLabels) as TicketPriority[]).map((k) => ({ value: k, label: hrStore.priorityLabels[k] })),
]
const categoryOptions = [
  { value: 'all', label: 'Semua Kategori' },
  ...(Object.keys(hrStore.categoryLabels) as TicketCategory[]).map((k) => ({ value: k, label: hrStore.categoryLabels[k] })),
]
const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: e.name })),
)

const filtered = computed(() =>
  hrStore.tickets.filter((t) => {
    if (statusFilter.value !== 'all' && t.status !== statusFilter.value) return false
    if (priorityFilter.value !== 'all' && t.priority !== priorityFilter.value) return false
    if (categoryFilter.value !== 'all' && t.category !== categoryFilter.value) return false
    return true
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)

const pagination = usePagination(filtered, { pageSize: 10 })

const stats = computed(() => ({
  open: hrStore.tickets.filter((t) => t.status === 'open').length,
  inProgress: hrStore.tickets.filter((t) => t.status === 'in_progress').length,
  resolved: hrStore.tickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length,
  total: hrStore.tickets.length,
}))

function statusTone(s: TicketStatus): 'good' | 'primary' | 'average' | 'muted' {
  if (s === 'resolved' || s === 'closed') return 'good'
  if (s === 'in_progress') return 'primary'
  if (s === 'open' || s === 'waiting_user') return 'average'
  return 'muted'
}
function priorityTone(p: TicketPriority): 'low' | 'warning' | 'average' | 'good' {
  if (p === 'urgent') return 'low'
  if (p === 'high') return 'warning'
  if (p === 'medium') return 'average'
  return 'good'
}

function viewDetail(id: string) {
  detailId.value = id
  showDetail.value = true
}
const detail = computed(() => (detailId.value ? hrStore.getTicketById(detailId.value) : null))

function changeStatus(id: string, status: TicketStatus) {
  hrStore.updateTicket(id, { status })
}
function assignTicket(id: string, assigneeId: string) {
  const emp = employeesStore.getEmployeeById(assigneeId)
  hrStore.updateTicket(id, { assigneeId, assigneeName: emp?.name })
}
function sendComment() {
  if (!detail.value || !newComment.value.trim()) return
  hrStore.addComment(detail.value.id, {
    authorId: authStore.user?.id ?? 'hr',
    authorName: authStore.user?.name ?? 'HR Admin',
    body: newComment.value,
  })
  newComment.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola seluruh tiket HR: assign, ubah status, dan respond karyawan." />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Tiket" :value="stats.total" :icon="ClipboardList" />
      <UiStatCard label="Open" :value="stats.open" tone="average" :icon="Inbox" />
      <UiStatCard label="In Progress" :value="stats.inProgress" tone="primary" :icon="Users" />
      <UiStatCard label="Selesai" :value="stats.resolved" tone="good" :icon="CheckCircle2" />
    </div>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <UiSelect v-model="statusFilter" :options="statusOptions" />
      <UiSelect v-model="priorityFilter" :options="priorityOptions" />
      <UiSelect v-model="categoryFilter" :options="categoryOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">No.</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Pengaju</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kategori</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Prioritas</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Assignee</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in pagination.pagedItems.value" :key="t.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm font-mono">{{ t.ticketNumber }}</td>
              <td class="px-4 py-3 text-sm font-medium text-foreground max-w-xs truncate">{{ t.subject }}</td>
              <td class="px-4 py-3 text-sm">{{ t.requesterName }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ hrStore.categoryLabels[t.category] }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="hrStore.priorityLabels[t.priority]" :tone="priorityTone(t.priority)" /></td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ t.assigneeName ?? '-' }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="hrStore.statusLabels[t.status]" :tone="statusTone(t.status)" /></td>
              <td class="px-4 py-3">
                <div class="flex justify-end">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="viewDetail(t.id)">
                    <Eye class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        :icon="Inbox"
        title="Tidak ada tiket"
        description="Tidak ada tiket yang sesuai filter."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="tiket"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showDetail"
      :title="detail?.subject ?? 'Detail Tiket'"
      :description="`${detail?.ticketNumber} • Diajukan oleh ${detail?.requesterName}`"
      size="lg"
      @update:open="showDetail = $event"
    >
      <div v-if="detail" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Status">
            <UiSelect :model-value="detail.status" :options="statusOptions.filter((o) => o.value !== 'all')" @update:model-value="(v) => changeStatus(detail.id, v as TicketStatus)" />
          </UiFormField>
          <UiFormField label="Assignee">
            <UiSelect :model-value="detail.assigneeId ?? ''" :options="[{ value: '', label: '— Belum di-assign —' }, ...employeeOptions]" @update:model-value="(v) => assignTicket(detail.id, v)" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi">
          <p class="text-sm text-foreground whitespace-pre-line bg-muted/30 rounded-lg p-3">{{ detail.description }}</p>
        </UiFormField>
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Komunikasi</h4>
          <div v-if="detail.comments.length === 0" class="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            Belum ada komentar.
          </div>
          <div v-for="c in detail.comments" :key="c.id" class="rounded-xl bg-muted/30 p-3">
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-medium text-foreground">{{ c.authorName }}</span>
              <span>{{ formatDate(c.createdAt) }}</span>
            </div>
            <p class="text-sm mt-1">{{ c.body }}</p>
          </div>
          <div class="flex gap-2">
            <UiInput v-model="newComment" placeholder="Tulis balasan..." />
            <UiButton variant="gradient" :disabled="!newComment.trim()" @click="sendComment">
              <Send class="w-4 h-4" />
              Kirim
            </UiButton>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showDetail = false">Tutup</UiButton>
      </template>
    </UiModal>
  </div>
</template>
