<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, ClipboardList, MessageCircle, Send } from 'lucide-vue-next'
import { useHrServiceStore, type Ticket, type TicketStatus } from '~/stores/hr-service'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('myTickets')
useHead({ title: () => title.value })

const hrStore = useHrServiceStore()
const authStore = useAuthStore()

const meId = computed(() => authStore.user?.id ?? '1')
const showDetail = ref(false)
const detailId = ref<string | null>(null)
const newComment = ref('')

const myTickets = computed(() =>
  hrStore.tickets.filter((t) => t.requesterId === meId.value).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
)
const pagination = usePagination(myTickets, { pageSize: 10 })

function statusTone(s: TicketStatus): 'good' | 'primary' | 'average' | 'muted' | 'low' {
  if (s === 'resolved') return 'good'
  if (s === 'in_progress') return 'primary'
  if (s === 'open' || s === 'waiting_user') return 'average'
  return 'muted'
}
function viewDetail(id: string) {
  detailId.value = id
  showDetail.value = true
}
const detail = computed(() => (detailId.value ? hrStore.getTicketById(detailId.value) : null))

function sendComment() {
  if (!detail.value || !newComment.value.trim()) return
  hrStore.addComment(detail.value.id, {
    authorId: meId.value,
    authorName: authStore.user?.name ?? 'Saya',
    body: newComment.value,
  })
  newComment.value = ''
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Pantau status tiket yang sudah Anda ajukan ke HR." />

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">No. Tiket</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Subject</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kategori</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Diajukan</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in pagination.pagedItems.value" :key="t.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm font-mono">{{ t.ticketNumber }}</td>
              <td class="px-4 py-3 text-sm font-medium text-foreground">{{ t.subject }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ hrStore.categoryLabels[t.category] }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="hrStore.statusLabels[t.status]" :tone="statusTone(t.status)" /></td>
              <td class="px-4 py-3 text-sm">{{ formatDate(t.createdAt) }}</td>
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
        :icon="ClipboardList"
        title="Belum ada tiket"
        description="Buat permintaan baru di menu 'Submit Request'."
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
      :description="detail?.ticketNumber"
      size="lg"
      @update:open="showDetail = $event"
    >
      <div v-if="detail" class="space-y-4">
        <div class="flex items-center gap-2 flex-wrap">
          <UiStatusBadge :label="hrStore.statusLabels[detail.status]" :tone="statusTone(detail.status)" />
          <UiStatusBadge :label="hrStore.categoryLabels[detail.category]" tone="primary" />
          <UiStatusBadge :label="`Priority: ${hrStore.priorityLabels[detail.priority]}`" tone="muted" />
        </div>
        <p class="text-sm text-foreground whitespace-pre-line">{{ detail.description }}</p>

        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <MessageCircle class="w-4 h-4" />
            Komunikasi
          </h4>
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
            <UiInput v-model="newComment" placeholder="Tulis komentar..." />
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
