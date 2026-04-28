<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus, Search, Pencil, Trash2, Sparkles, Mail, Star, Rows3, KanbanSquare,
  Calendar, Send, Video, MapPin, Phone, Clock, X, Copy, CheckCircle2, PencilLine,
} from 'lucide-vue-next'
import { useCandidatesStore, type Candidate } from '~/stores/candidates'
import { useEmployeesStore } from '~/stores/employees'
import { useInterviewScheduleStore, type InterviewMode } from '~/stores/interview-schedule'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('talentCandidates')
useHead({ title: () => title.value })

const candidatesStore = useCandidatesStore()
const filteredCandidates = computed(() => candidatesStore.filteredCandidates)
const pagination = usePagination(filteredCandidates, { pageSize: 10 })
const employeesStore = useEmployeesStore()
const scheduleStore = useInterviewScheduleStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)
const viewMode = ref<'table' | 'kanban'>('table')

interface FormState {
  name: string
  email: string
  phone: string
  position: string
  department: string
  stage: string
  aiScore: number | undefined
  skills: string
  experience: number | undefined
}
const empty = (): FormState => ({
  name: '',
  email: '',
  phone: '',
  position: '',
  department: '',
  stage: 'applied',
  aiScore: undefined,
  skills: '',
  experience: undefined,
})
const form = ref<FormState>(empty())

const stageOptions = computed(() => [
  { value: 'all', label: 'Semua Tahap' },
  ...candidatesStore.recruitmentStages.map((s) => ({ value: s.key, label: s.label })),
])
const formStageOptions = computed(() =>
  candidatesStore.recruitmentStages.map((s) => ({ value: s.key, label: s.label })),
)
const kanbanStages = computed(() => {
  const sorted = [...candidatesStore.recruitmentStages].sort((a, b) => a.order - b.order)
  if (candidatesStore.stageFilter === 'all') return sorted
  return sorted.filter((stage) => stage.key === candidatesStore.stageFilter)
})

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () =>
    form.value.name.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.position.trim() !== '',
)

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(c: Candidate) {
  editingId.value = c.id
  form.value = {
    name: c.name,
    email: c.email,
    phone: c.phone,
    position: c.position,
    department: c.department,
    stage: c.stage,
    aiScore: c.aiScore,
    skills: c.skills.join(', '),
    experience: c.experience,
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    name: form.value.name,
    email: form.value.email,
    phone: form.value.phone,
    position: form.value.position,
    department: form.value.department,
    stage: form.value.stage,
    aiScore: Number(form.value.aiScore) || 0,
    skills: form.value.skills.split(',').map((s) => s.trim()).filter(Boolean),
    experience: Number(form.value.experience) || 0,
    appliedAt: new Date().toISOString().slice(0, 10),
    lastActivity: new Date().toISOString().slice(0, 10),
  }
  if (isEdit.value && editingId.value) {
    candidatesStore.updateCandidate?.(editingId.value, payload)
  } else {
    candidatesStore.addCandidate(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) candidatesStore.deleteCandidate?.(targetId.value)
  showDelete.value = false
}
function changeStage(id: string, stage: string) {
  candidatesStore.updateCandidateStage(id, stage)
}

function stageBadgeTone(stage: string): 'good' | 'low' | 'primary' | 'average' | 'muted' {
  if (stage === 'hired') return 'good'
  if (stage === 'rejected') return 'low'
  if (stage === 'offer' || stage === 'assessment') return 'primary'
  if (stage === 'interview') return 'average'
  return 'muted'
}
function stageLabel(stage: string) {
  return candidatesStore.recruitmentStages.find((s) => s.key === stage)?.label ?? stage
}
function candidatesByStage(stage: string) {
  return candidatesStore.filteredCandidates.filter((candidate) => candidate.stage === stage)
}

// ============================================================================
// DRAG & DROP (kanban)
// ============================================================================
const dragId = ref<string | null>(null)
const dragOverStage = ref<string | null>(null)

function onDragStart(id: string, ev: DragEvent) {
  dragId.value = id
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move'
    ev.dataTransfer.setData('text/plain', id)
  }
}
function onDragEnd() {
  dragId.value = null
  dragOverStage.value = null
}
function onDragEnterColumn(stage: string) {
  dragOverStage.value = stage
}
function onDragLeaveColumn(stage: string) {
  if (dragOverStage.value === stage) dragOverStage.value = null
}
function onDropToStage(stage: string) {
  if (dragId.value) {
    candidatesStore.updateCandidateStage(dragId.value, stage)
    dragId.value = null
  }
  dragOverStage.value = null
}

// ============================================================================
// INTERVIEW SCHEDULER
// ============================================================================
const showSchedule = ref(false)
const showEmailPreview = ref(false)
const scheduleCandidateId = ref<string | null>(null)
const scheduleEditingId = ref<string | null>(null)
const lastScheduledId = ref<string | null>(null)

interface ScheduleFormState {
  date: string
  startTime: string
  durationMinutes: number
  mode: InterviewMode
  meetingLink: string
  location: string
  interviewerIds: string[]
  round: string
  notes: string
}
const emptySchedule = (): ScheduleFormState => ({
  date: '',
  startTime: '10:00',
  durationMinutes: 60,
  mode: 'online',
  meetingLink: '',
  location: '',
  interviewerIds: [],
  round: 'Interview HR',
  notes: '',
})
const scheduleForm = ref<ScheduleFormState>(emptySchedule())

const interviewerOptions = computed(() =>
  employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} — ${e.position}` })),
)
const modeOptions: { value: InterviewMode; label: string }[] = [
  { value: 'online', label: 'Online (Video Conference)' },
  { value: 'onsite', label: 'On-site' },
  { value: 'phone', label: 'Telepon' },
]
const durationOptions = [
  { value: '30', label: '30 menit' },
  { value: '45', label: '45 menit' },
  { value: '60', label: '1 jam' },
  { value: '90', label: '1.5 jam' },
  { value: '120', label: '2 jam' },
]
const roundOptions = [
  { value: 'Screening', label: 'Screening' },
  { value: 'Interview HR', label: 'Interview HR' },
  { value: 'Interview User', label: 'Interview User / Hiring Manager' },
  { value: 'Technical Test', label: 'Technical Test' },
  { value: 'Interview Final', label: 'Interview Final / Direksi' },
  { value: 'Cultural Fit', label: 'Cultural Fit' },
]

const candidateForSchedule = computed(() =>
  scheduleCandidateId.value ? candidatesStore.candidates.find((c) => c.id === scheduleCandidateId.value) ?? null : null,
)
const existingSchedule = computed(() =>
  scheduleCandidateId.value ? scheduleStore.getActiveByCandidate(scheduleCandidateId.value) : null,
)

const isScheduleValid = computed(() => {
  const f = scheduleForm.value
  return (
    f.date !== '' &&
    f.startTime !== '' &&
    f.durationMinutes > 0 &&
    f.interviewerIds.length > 0 &&
    (f.mode !== 'online' || f.meetingLink.trim() !== '') &&
    (f.mode !== 'onsite' || f.location.trim() !== '')
  )
})

function openSchedule(id: string) {
  scheduleCandidateId.value = id
  const existing = scheduleStore.getActiveByCandidate(id)
  if (existing) {
    scheduleEditingId.value = existing.id
    scheduleForm.value = {
      date: existing.date,
      startTime: existing.startTime,
      durationMinutes: existing.durationMinutes,
      mode: existing.mode,
      meetingLink: existing.meetingLink ?? '',
      location: existing.location ?? '',
      interviewerIds: [...existing.interviewerIds],
      round: existing.round,
      notes: existing.notes ?? '',
    }
  } else {
    scheduleEditingId.value = null
    scheduleForm.value = emptySchedule()
    // Set default date H+2 hari kerja
    const d = new Date()
    d.setDate(d.getDate() + 2)
    scheduleForm.value.date = d.toISOString().slice(0, 10)
  }
  showSchedule.value = true
}

function toggleInterviewer(id: string) {
  const i = scheduleForm.value.interviewerIds.indexOf(id)
  if (i === -1) scheduleForm.value.interviewerIds.push(id)
  else scheduleForm.value.interviewerIds.splice(i, 1)
}

function saveScheduleAndPreview() {
  if (!isScheduleValid.value || !candidateForSchedule.value) return
  const c = candidateForSchedule.value
  const interviewerNames = scheduleForm.value.interviewerIds
    .map((id) => employeesStore.getEmployeeById(id)?.name ?? id)
  const payload = {
    candidateId: c.id,
    candidateName: c.name,
    candidateEmail: c.email,
    position: c.position,
    date: scheduleForm.value.date,
    startTime: scheduleForm.value.startTime,
    durationMinutes: Number(scheduleForm.value.durationMinutes),
    mode: scheduleForm.value.mode,
    meetingLink: scheduleForm.value.meetingLink || undefined,
    location: scheduleForm.value.location || undefined,
    interviewerIds: scheduleForm.value.interviewerIds,
    interviewerNames,
    round: scheduleForm.value.round,
    notes: scheduleForm.value.notes || undefined,
    status: 'scheduled' as const,
  }
  let id: string
  if (scheduleEditingId.value) {
    scheduleStore.updateSchedule(scheduleEditingId.value, payload)
    id = scheduleEditingId.value
  } else {
    id = scheduleStore.addSchedule(payload)
  }
  lastScheduledId.value = id
  showSchedule.value = false
  showEmailPreview.value = true
}

const previewSchedule = computed(() =>
  lastScheduledId.value ? scheduleStore.schedules.find((s) => s.id === lastScheduledId.value) ?? null : null,
)
const previewEmail = computed(() =>
  previewSchedule.value ? scheduleStore.buildInvitationEmail(previewSchedule.value) : null,
)

const sendingEmail = ref(false)
const emailSentMessage = ref('')

async function sendInvitation() {
  if (!previewSchedule.value) return
  sendingEmail.value = true
  emailSentMessage.value = ''
  // Simulasi: real-world akan POST ke email service
  await new Promise((r) => setTimeout(r, 900))
  scheduleStore.markEmailSent(previewSchedule.value.id)
  emailSentMessage.value = `Undangan terkirim ke ${previewSchedule.value.candidateEmail}.`
  sendingEmail.value = false
}

function copyEmailBody() {
  if (!previewEmail.value) return
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(previewEmail.value.body).catch(() => {})
  }
}

function formatScheduleLabel(s: { date: string; startTime: string }) {
  const date = new Date(s.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
  return `${date}, ${s.startTime}`
}

function activeScheduleFor(id: string) {
  return scheduleStore.getActiveByCandidate(id)
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola kandidat dan tahap rekrutmen mereka.">
      <template #actions>
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-lg border border-border p-1 bg-card/60">
            <button
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors',
                viewMode === 'table' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
              ]"
              @click="viewMode = 'table'"
            >
              <Rows3 class="w-3.5 h-3.5" />
              Table
            </button>
            <button
              type="button"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors',
                viewMode === 'kanban' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
              ]"
              @click="viewMode = 'kanban'"
            >
              <KanbanSquare class="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>
          <UiButton variant="gradient" @click="openAdd">
            <Plus class="w-4 h-4" />
            Kandidat Baru
          </UiButton>
        </div>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput v-model="candidatesStore.searchQuery" placeholder="Cari nama, email, posisi..." class="pl-9" />
      </div>
      <UiSelect v-model="candidatesStore.stageFilter" :options="stageOptions" />
    </div>

    <div v-if="viewMode === 'table'" class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kandidat</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Posisi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Skor AI</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Skills</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Stage</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Diapply</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in pagination.pagedItems.value" :key="c.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3">
                <p class="font-medium text-foreground">{{ c.name }}</p>
                <p class="text-xs text-muted-foreground flex items-center gap-1"><Mail class="w-3 h-3" />{{ c.email }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-foreground">{{ c.position }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  <Sparkles class="w-3 h-3" />
                  {{ c.aiScore }}%
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span v-for="s in c.skills.slice(0, 3)" :key="s" class="px-2 py-0.5 rounded-md bg-muted/50 text-xs">{{ s }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <UiSelect :model-value="c.stage" :options="formStageOptions" @update:model-value="(v) => changeStage(c.id, v)" />
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ formatDate(c.appliedAt) }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    v-if="c.stage === 'interview'"
                    class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                    :title="activeScheduleFor(c.id) ? `Jadwal: ${formatScheduleLabel(activeScheduleFor(c.id)!)}` : 'Set Schedule'"
                    @click="openSchedule(c.id)"
                  >
                    <Calendar class="w-4 h-4" :class="activeScheduleFor(c.id) ? 'text-primary' : ''" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(c)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(c.id)">
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
        :icon="Star"
        title="Tidak ada kandidat"
        description="Coba ubah pencarian atau tambahkan kandidat baru."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="kandidat"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <div v-else class="space-y-4">
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <p>Kanban view per stage — drag &amp; drop kartu untuk pindah stage</p>
        <p>{{ candidatesStore.filteredCandidates.length }} kandidat</p>
      </div>
      <div v-if="candidatesStore.filteredCandidates.length > 0" class="overflow-x-auto pb-1">
        <div class="grid grid-flow-col auto-cols-[320px] gap-4">
          <div
            v-for="stage in kanbanStages"
            :key="stage.key"
            :class="[
              'rounded-xl border bg-card/50 min-h-[420px] flex flex-col transition-colors',
              dragOverStage === stage.key
                ? 'border-primary border-2 bg-primary/5'
                : 'border-border',
            ]"
            @dragover.prevent
            @dragenter.prevent="onDragEnterColumn(stage.key)"
            @dragleave="onDragLeaveColumn(stage.key)"
            @drop="onDropToStage(stage.key)"
          >
            <div class="p-3 border-b border-border bg-muted/20">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: stage.color }" />
                  <p class="text-sm font-semibold text-foreground">{{ stage.label }}</p>
                </div>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {{ candidatesByStage(stage.key).length }}
                </span>
              </div>
            </div>
            <div class="p-3 space-y-3 flex-1">
              <div
                v-for="c in candidatesByStage(stage.key)"
                :key="c.id"
                draggable="true"
                :class="[
                  'rounded-lg border border-border bg-card p-3 space-y-2 cursor-grab active:cursor-grabbing transition-all',
                  dragId === c.id ? 'opacity-50 ring-2 ring-primary scale-95' : 'hover:border-primary/40 hover:shadow-md',
                ]"
                @dragstart="onDragStart(c.id, $event)"
                @dragend="onDragEnd"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ c.name }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ c.position }}</p>
                  </div>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold shrink-0">
                    <Sparkles class="w-3 h-3" />
                    {{ c.aiScore }}%
                  </span>
                </div>
                <p class="text-xs text-muted-foreground flex items-center gap-1 truncate"><Mail class="w-3 h-3 shrink-0" />{{ c.email }}</p>
                <div class="flex flex-wrap gap-1">
                  <span v-for="s in c.skills.slice(0, 3)" :key="s" class="px-2 py-0.5 rounded-md bg-muted/50 text-xs">{{ s }}</span>
                </div>

                <!-- Set Schedule button — hanya tampil saat stage = 'interview' -->
                <div v-if="c.stage === 'interview'" class="pt-1">
                  <div v-if="activeScheduleFor(c.id)" class="rounded-lg border border-primary/30 bg-primary/5 p-2 space-y-1">
                    <div class="flex items-center justify-between gap-2 text-xs">
                      <span class="font-medium text-primary flex items-center gap-1">
                        <Calendar class="w-3 h-3" />
                        {{ formatScheduleLabel(activeScheduleFor(c.id)!) }}
                      </span>
                      <span v-if="activeScheduleFor(c.id)!.emailSent" class="inline-flex items-center gap-0.5 text-[10px] text-emerald-500" title="Email terkirim">
                        <CheckCircle2 class="w-3 h-3" />
                        Sent
                      </span>
                    </div>
                    <p class="text-[10px] text-muted-foreground truncate">{{ activeScheduleFor(c.id)!.round }} • {{ activeScheduleFor(c.id)!.mode }}</p>
                    <button
                      type="button"
                      class="w-full inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border border-primary/30 text-primary hover:bg-primary/10"
                      @click.stop="openSchedule(c.id)"
                    >
                      <PencilLine class="w-3 h-3" />
                      Edit Jadwal
                    </button>
                  </div>
                  <button
                    v-else
                    type="button"
                    class="w-full inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition"
                    @click.stop="openSchedule(c.id)"
                  >
                    <Calendar class="w-3.5 h-3.5" />
                    Set Schedule
                  </button>
                </div>

                <div class="flex items-center justify-end gap-1 pt-1 border-t border-border/50">
                  <button class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50" title="Edit" @click="openEdit(c)">
                    <Pencil class="w-3.5 h-3.5" />
                  </button>
                  <button class="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="askDelete(c.id)">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div
                v-if="candidatesByStage(stage.key).length === 0"
                :class="[
                  'rounded-lg border border-dashed p-4 text-center text-xs transition-colors',
                  dragOverStage === stage.key
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-border bg-muted/10 text-muted-foreground',
                ]"
              >
                {{ dragOverStage === stage.key ? 'Lepas di sini untuk pindah ke stage ini' : 'Tidak ada kandidat pada stage ini.' }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <UiEmptyState
        v-else
        :icon="Star"
        title="Tidak ada kandidat"
        description="Coba ubah pencarian atau tambahkan kandidat baru."
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Kandidat' : 'Tambah Kandidat'"
      description="Isi profil kandidat untuk dimasukkan ke pipeline rekrutmen."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Nama Lengkap" required>
            <UiInput v-model="form.name" />
          </UiFormField>
          <UiFormField label="Email" required>
            <UiInput v-model="form.email" type="email" />
          </UiFormField>
          <UiFormField label="No. Telepon">
            <UiInput v-model="form.phone" placeholder="+62..." />
          </UiFormField>
          <UiFormField label="Pengalaman (tahun)">
            <UiInput v-model.number="form.experience" type="number" />
          </UiFormField>
          <UiFormField label="Posisi Dilamar" required>
            <UiInput v-model="form.position" />
          </UiFormField>
          <UiFormField label="Departemen">
            <UiInput v-model="form.department" />
          </UiFormField>
          <UiFormField label="Stage">
            <UiSelect v-model="form.stage" :options="formStageOptions" />
          </UiFormField>
          <UiFormField label="Skor AI (0-100)">
            <UiInput v-model.number="form.aiScore" type="number" min="0" max="100" />
          </UiFormField>
        </div>
        <UiFormField label="Skills (pisahkan dengan koma)">
          <UiInput v-model="form.skills" placeholder="e.g. JavaScript, React, Node.js" />
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
      title="Hapus Kandidat?"
      message="Data kandidat akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />

    <!-- ============================================================ -->
    <!-- SET SCHEDULE MODAL -->
    <!-- ============================================================ -->
    <UiModal
      :open="showSchedule"
      :title="scheduleEditingId ? 'Edit Jadwal Interview' : 'Set Jadwal Interview'"
      :description="candidateForSchedule ? `${candidateForSchedule.name} • ${candidateForSchedule.position}` : ''"
      size="lg"
      @update:open="showSchedule = $event"
    >
      <div v-if="candidateForSchedule" class="space-y-4">
        <!-- Candidate info -->
        <div class="rounded-xl border border-border bg-muted/20 p-3 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {{ candidateForSchedule.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-foreground truncate">{{ candidateForSchedule.name }}</p>
            <p class="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail class="w-3 h-3" />
              {{ candidateForSchedule.email }}
            </p>
          </div>
          <UiStatusBadge :label="candidateForSchedule.position" tone="primary" />
        </div>

        <!-- Existing schedule notice -->
        <div v-if="existingSchedule && !scheduleEditingId" class="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs">
          <p class="font-semibold text-amber-500">Sudah ada jadwal aktif</p>
          <p class="text-muted-foreground mt-0.5">
            {{ formatScheduleLabel(existingSchedule) }} — {{ existingSchedule.round }}.
            Anda akan mengubah jadwal ini.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tahap Interview" required>
            <UiSelect v-model="scheduleForm.round" :options="roundOptions" />
          </UiFormField>
          <UiFormField label="Mode" required>
            <UiSelect v-model="scheduleForm.mode" :options="modeOptions" />
          </UiFormField>
          <UiFormField label="Tanggal" required>
            <UiInput v-model="scheduleForm.date" type="date" />
          </UiFormField>
          <UiFormField label="Jam Mulai" required>
            <UiInput v-model="scheduleForm.startTime" type="time" />
          </UiFormField>
          <UiFormField label="Durasi" required>
            <UiSelect
              :model-value="String(scheduleForm.durationMinutes)"
              :options="durationOptions"
              @update:model-value="(v) => (scheduleForm.durationMinutes = Number(v))"
            />
          </UiFormField>
          <UiFormField
            v-if="scheduleForm.mode === 'online'"
            label="Link Meeting"
            required
            hint="Zoom / Google Meet / Teams"
          >
            <UiInput v-model="scheduleForm.meetingLink" placeholder="https://meet.google.com/xxx-xxxx-xxx" />
          </UiFormField>
          <UiFormField
            v-if="scheduleForm.mode === 'onsite'"
            label="Lokasi"
            required
            hint="Alamat kantor / ruang interview"
          >
            <UiInput v-model="scheduleForm.location" placeholder="e.g. Telkomsel HQ Lt. 8 Ruang Garuda" />
          </UiFormField>
          <UiFormField
            v-if="scheduleForm.mode === 'phone'"
            label="No. Telepon (opsional)"
          >
            <UiInput v-model="scheduleForm.location" placeholder="Nomor yang akan dihubungi" />
          </UiFormField>
        </div>

        <UiFormField label="Interviewer" required hint="Pilih satu atau lebih interviewer dari karyawan aktif">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border border-border p-2">
            <label
              v-for="opt in interviewerOptions"
              :key="opt.value"
              :class="[
                'flex items-center gap-2 text-sm p-1.5 rounded-md cursor-pointer transition-colors',
                scheduleForm.interviewerIds.includes(opt.value) ? 'bg-primary/10 text-primary' : 'hover:bg-muted/30',
              ]"
            >
              <input
                type="checkbox"
                :checked="scheduleForm.interviewerIds.includes(opt.value)"
                class="accent-primary"
                @change="toggleInterviewer(opt.value)"
              >
              <span class="truncate">{{ opt.label }}</span>
            </label>
          </div>
          <p v-if="scheduleForm.interviewerIds.length > 0" class="text-xs text-muted-foreground mt-1">
            {{ scheduleForm.interviewerIds.length }} interviewer dipilih.
          </p>
        </UiFormField>

        <UiFormField label="Catatan untuk Kandidat (opsional)" hint="Akan dimasukkan ke email undangan">
          <UiTextarea v-model="scheduleForm.notes" rows="3" placeholder="e.g. Mohon siapkan portofolio dan dress code business casual." />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showSchedule = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isScheduleValid" @click="saveScheduleAndPreview">
          <Send class="w-4 h-4" />
          Simpan & Lihat Undangan
        </UiButton>
      </template>
    </UiModal>

    <!-- ============================================================ -->
    <!-- EMAIL PREVIEW MODAL -->
    <!-- ============================================================ -->
    <UiModal
      :open="showEmailPreview"
      title="Preview Email Undangan"
      description="Tinjau email sebelum dikirim ke kandidat."
      size="lg"
      @update:open="showEmailPreview = $event"
    >
      <div v-if="previewSchedule && previewEmail" class="space-y-4">
        <!-- Schedule summary chips -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div class="rounded-lg bg-muted/30 p-2.5">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><Calendar class="w-3 h-3" /> Tanggal</p>
            <p class="text-xs font-semibold text-foreground mt-0.5">{{ formatDate(previewSchedule.date) }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-2.5">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1"><Clock class="w-3 h-3" /> Waktu</p>
            <p class="text-xs font-semibold text-foreground mt-0.5">{{ previewSchedule.startTime }} ({{ previewSchedule.durationMinutes }}m)</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-2.5">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1">
              <component :is="previewSchedule.mode === 'online' ? Video : previewSchedule.mode === 'onsite' ? MapPin : Phone" class="w-3 h-3" />
              Mode
            </p>
            <p class="text-xs font-semibold text-foreground mt-0.5 capitalize">{{ previewSchedule.mode }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-2.5">
            <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Tahap</p>
            <p class="text-xs font-semibold text-foreground mt-0.5 truncate">{{ previewSchedule.round }}</p>
          </div>
        </div>

        <!-- Email envelope -->
        <div class="rounded-xl border border-border overflow-hidden">
          <div class="bg-muted/40 px-4 py-3 border-b border-border space-y-1">
            <div class="flex items-center gap-2 text-xs">
              <span class="text-muted-foreground w-16 shrink-0">From:</span>
              <span class="font-mono text-foreground">talent@telkomsel.com</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-muted-foreground w-16 shrink-0">To:</span>
              <span class="font-mono text-foreground">{{ previewEmail.to }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-muted-foreground w-16 shrink-0">Subject:</span>
              <span class="font-semibold text-foreground truncate">{{ previewEmail.subject }}</span>
            </div>
          </div>
          <pre class="p-4 text-xs text-foreground whitespace-pre-wrap font-sans bg-card">{{ previewEmail.body }}</pre>
        </div>

        <!-- Sent confirmation -->
        <div v-if="emailSentMessage" class="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-500 flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4" />
          {{ emailSentMessage }}
        </div>
        <div v-else-if="previewSchedule.emailSent" class="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-500 flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4" />
          Email sudah pernah dikirim sebelumnya. Anda dapat mengirim ulang.
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="copyEmailBody">
          <Copy class="w-4 h-4" />
          Salin Body
        </UiButton>
        <UiButton variant="outline" @click="showEmailPreview = false">Tutup</UiButton>
        <UiButton
          variant="gradient"
          :loading="sendingEmail"
          :disabled="sendingEmail || !!emailSentMessage"
          @click="sendInvitation"
        >
          <Send class="w-4 h-4" />
          {{ emailSentMessage ? 'Terkirim' : (previewSchedule?.emailSent ? 'Kirim Ulang' : 'Kirim Undangan') }}
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>
