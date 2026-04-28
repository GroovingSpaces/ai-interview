<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, XCircle, ClipboardCheck, Download, Eye, MessageCircle } from 'lucide-vue-next'
import { useTasksStore } from '~/stores/tasks'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('evidenceReview')
useHead({ title: () => title.value })

const tasksStore = useTasksStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const showReject = ref(false)
const targetId = ref<string | null>(null)
const rejectionNote = ref('')
const showDetail = ref(false)
const detailId = ref<string | null>(null)

const submitted = computed(() =>
  tasksStore.tasks
    .filter((t) => t.status === 'submitted' || t.status === 'in_review')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
)

const stats = computed(() => ({
  pending: tasksStore.tasks.filter((t) => t.status === 'submitted' || t.status === 'in_review').length,
  approved: tasksStore.tasks.filter((t) => t.status === 'approved').length,
  rejected: tasksStore.tasks.filter((t) => t.status === 'rejected').length,
}))

function assigneeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}

function approve(id: string) {
  tasksStore.setStatus(id, 'approved')
  tasksStore.addComment(id, {
    authorId: authStore.user?.id ?? 'reviewer',
    authorName: authStore.user?.name ?? 'Reviewer',
    body: '✓ Disetujui.',
  })
}
function askReject(id: string) {
  targetId.value = id
  rejectionNote.value = ''
  showReject.value = true
}
function confirmReject() {
  if (!targetId.value) return
  tasksStore.setStatus(targetId.value, 'rejected')
  tasksStore.addComment(targetId.value, {
    authorId: authStore.user?.id ?? 'reviewer',
    authorName: authStore.user?.name ?? 'Reviewer',
    body: `✗ Ditolak. ${rejectionNote.value || 'Mohon revisi.'}`,
  })
  showReject.value = false
}
function downloadFile(name: string | undefined, data: string | undefined) {
  if (!data) return
  const a = document.createElement('a')
  a.href = data
  a.download = name || 'evidence'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
function openDetail(id: string) {
  detailId.value = id
  showDetail.value = true
}
function deleteTaskFromDrawer(id: string) {
  tasksStore.deleteTask(id)
  showDetail.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Tinjau evidence yang disubmit anggota tim sebelum di-approve." />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Menunggu Review" :value="stats.pending" tone="average" :icon="ClipboardCheck" />
      <UiStatCard label="Approved" :value="stats.approved" tone="good" :icon="Check" />
      <UiStatCard label="Rejected" :value="stats.rejected" tone="low" :icon="XCircle" />
    </div>

    <UiEmptyState
      v-if="submitted.length === 0"
      :icon="ClipboardCheck"
      title="Tidak ada submission"
      description="Tidak ada tugas yang menunggu review."
    />

    <div v-else class="space-y-3">
      <div v-for="t in submitted" :key="t.id" class="glass-card p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-foreground">{{ t.title }}</h3>
              <UiStatusBadge :label="t.priority.toUpperCase()" tone="primary" />
              <span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle class="w-3 h-3" />
                {{ t.comments.length }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground line-clamp-2 mt-1">{{ t.description }}</p>
            <div class="flex items-center gap-3 text-xs text-muted-foreground mt-2">
              <span>Pengaju: {{ assigneeName(t.assigneeId) }}</span>
              <span>Deadline: {{ formatDate(t.dueDate) }}</span>
              <span>Disubmit: {{ formatDate(t.updatedAt) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <UiButton variant="outline" size="sm" @click="openDetail(t.id)">
              <Eye class="w-4 h-4" />
              Detail
            </UiButton>
            <UiButton variant="outline" size="sm" @click="askReject(t.id)">
              <XCircle class="w-4 h-4" />
              Tolak
            </UiButton>
            <UiButton variant="gradient" size="sm" @click="approve(t.id)">
              <Check class="w-4 h-4" />
              Setujui
            </UiButton>
          </div>
        </div>

        <div v-if="t.evidence.length" class="mt-4 space-y-2">
          <p class="text-xs font-semibold text-muted-foreground uppercase">Evidence</p>
          <div v-for="e in t.evidence" :key="e.id" class="rounded-xl bg-muted/30 p-3">
            <div class="flex items-center justify-between text-xs text-muted-foreground">
              <span class="font-mono text-foreground">{{ e.fileName ?? '(catatan)' }}</span>
              <div class="flex items-center gap-2">
                <span>{{ formatDate(e.uploadedAt) }}</span>
                <button v-if="e.fileData" class="p-1 rounded-md text-muted-foreground hover:text-primary" @click="downloadFile(e.fileName, e.fileData)">
                  <Download class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p v-if="e.note" class="text-sm text-foreground mt-1">{{ e.note }}</p>
          </div>
        </div>
      </div>
    </div>

    <UiModal
      :open="showReject"
      title="Tolak Evidence"
      description="Berikan catatan revisi agar PIC paham yang perlu diperbaiki."
      @update:open="showReject = $event"
    >
      <UiFormField label="Catatan Revisi">
        <UiTextarea v-model="rejectionNote" rows="3" placeholder="Jelaskan apa yang perlu direvisi" />
      </UiFormField>
      <template #footer>
        <UiButton variant="outline" @click="showReject = false">Batal</UiButton>
        <UiButton variant="destructive" @click="confirmReject">
          <XCircle class="w-4 h-4" />
          Tolak
        </UiButton>
      </template>
    </UiModal>

    <TasksTaskDetailDrawer :open="showDetail" :task-id="detailId" @update:open="showDetail = $event" @delete="deleteTaskFromDrawer" />
  </div>
</template>
