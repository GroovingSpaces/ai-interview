<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  X, Calendar, Flag, Tag, User, Clock, Eye, Send, Paperclip, MessageCircle, ListChecks,
  Plus, Trash2, Upload, Copy, CheckCircle2,
} from 'lucide-vue-next'
import { useTasksStore, TASK_STATUSES, TASK_PRIORITIES, type TaskStatus, type TaskPriority } from '~/stores/tasks'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'
import { formatDate } from '~/lib/utils'

const props = defineProps<{ open: boolean; taskId: string | null }>()
const emit = defineEmits<{ 'update:open': [value: boolean]; delete: [id: string] }>()

const tasksStore = useTasksStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const task = computed(() => (props.taskId ? tasksStore.getTaskById(props.taskId) : null))

const newSubtask = ref('')
const newChecklist = ref('')
const newComment = ref('')
const showTagPicker = ref(false)
const titleEdit = ref('')
const descEdit = ref('')
const editingTitle = ref(false)
const editingDesc = ref(false)

watch(
  () => task.value?.id,
  () => {
    titleEdit.value = task.value?.title ?? ''
    descEdit.value = task.value?.description ?? ''
    editingTitle.value = false
    editingDesc.value = false
  },
  { immediate: true },
)

const employeeOptions = computed(() => employeesStore.employees.map((e) => ({ value: e.id, label: e.name })))
const statusOptions = TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))
const priorityOptions = TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))

const allTags = computed(() => tasksStore.tags)
const taskTags = computed(() =>
  task.value ? task.value.tagIds.map((id) => tasksStore.getTagById(id)).filter(Boolean) as { id: string; name: string; color: string }[] : [],
)

function close() {
  emit('update:open', false)
}
function saveTitle() {
  if (!task.value || !titleEdit.value.trim()) return
  tasksStore.updateTask(task.value.id, { title: titleEdit.value })
  editingTitle.value = false
}
function saveDesc() {
  if (!task.value) return
  tasksStore.updateTask(task.value.id, { description: descEdit.value })
  editingDesc.value = false
}
function changeStatus(v: string) {
  if (!task.value) return
  tasksStore.setStatus(task.value.id, v as TaskStatus)
}
function changePriority(v: string) {
  if (!task.value) return
  tasksStore.updateTask(task.value.id, { priority: v as TaskPriority })
}
function changeAssignee(v: string) {
  if (!task.value) return
  tasksStore.updateTask(task.value.id, { assigneeId: v })
}
function changeDueDate(v: string) {
  if (!task.value) return
  tasksStore.updateTask(task.value.id, { dueDate: v })
}
function changeStartDate(v: string) {
  if (!task.value) return
  tasksStore.updateTask(task.value.id, { startDate: v })
}
function changeEstimate(v: string | number) {
  if (!task.value) return
  tasksStore.updateTask(task.value.id, { estimateHours: Number(v) || 0 })
}
function changeSpent(v: string | number) {
  if (!task.value) return
  tasksStore.updateTask(task.value.id, { spentHours: Number(v) || 0 })
}

function toggleTag(tagId: string) {
  if (!task.value) return
  const has = task.value.tagIds.includes(tagId)
  const next = has ? task.value.tagIds.filter((t) => t !== tagId) : [...task.value.tagIds, tagId]
  tasksStore.updateTask(task.value.id, { tagIds: next })
}
function toggleWatcher(empId: string) {
  if (!task.value) return
  tasksStore.toggleWatcher(task.value.id, empId)
}

function addSubtask() {
  if (!task.value || !newSubtask.value.trim()) return
  tasksStore.addSubtask(task.value.id, newSubtask.value.trim())
  newSubtask.value = ''
}
function toggleSub(subId: string) {
  if (!task.value) return
  const s = task.value.subtasks.find((x) => x.id === subId)
  if (s) tasksStore.updateSubtask(task.value.id, subId, { done: !s.done })
}
function removeSub(subId: string) {
  if (!task.value) return
  tasksStore.removeSubtask(task.value.id, subId)
}
function changeSubAssignee(subId: string, v: string) {
  if (!task.value) return
  tasksStore.updateSubtask(task.value.id, subId, { assigneeId: v || undefined })
}

function addCheck() {
  if (!task.value || !newChecklist.value.trim()) return
  tasksStore.addChecklistItem(task.value.id, newChecklist.value.trim())
  newChecklist.value = ''
}
function toggleCheck(itemId: string) {
  if (!task.value) return
  tasksStore.toggleChecklist(task.value.id, itemId)
}
function removeCheck(itemId: string) {
  if (!task.value) return
  tasksStore.removeChecklistItem(task.value.id, itemId)
}

function postComment() {
  if (!task.value || !newComment.value.trim()) return
  tasksStore.addComment(task.value.id, {
    authorId: authStore.user?.id ?? 'me',
    authorName: authStore.user?.name ?? 'Saya',
    body: newComment.value.trim(),
  })
  newComment.value = ''
}

function uploadAttachment(ev: Event) {
  if (!task.value) return
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    tasksStore.addEvidence(task.value!.id, {
      fileName: file.name,
      fileData: reader.result as string,
    })
  }
  reader.readAsDataURL(file)
}

function duplicateTask() {
  if (!task.value) return
  tasksStore.duplicateTask(task.value.id)
  close()
}
function deleteTask() {
  if (!task.value) return
  emit('delete', task.value.id)
  close()
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const progress = computed(() => (task.value ? tasksStore.progressOf(task.value) : 0))
const watchersList = computed(() =>
  task.value ? task.value.watchers.map((w) => employeesStore.getEmployeeById(w)).filter(Boolean) : [],
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && task"
        class="fixed inset-0 z-50 flex bg-background/80 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="ml-auto w-full max-w-3xl h-full bg-card border-l border-border flex flex-col">
          <!-- Header -->
          <div class="flex items-start justify-between gap-3 p-5 border-b border-border">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span class="font-mono">#{{ task.id.slice(-6) }}</span>
                <span>•</span>
                <span>Dibuat {{ formatDate(task.createdAt) }}</span>
                <span>•</span>
                <span>Diperbarui {{ formatDate(task.updatedAt) }}</span>
              </div>
              <input
                v-if="editingTitle"
                v-model="titleEdit"
                class="text-xl font-bold text-foreground bg-transparent w-full focus:outline-none border-b border-primary mt-1"
                autofocus
                @blur="saveTitle"
                @keyup.enter="saveTitle"
              >
              <h2
                v-else
                class="text-xl font-bold text-foreground mt-1 cursor-text hover:bg-muted/30 rounded px-1 -mx-1"
                @click="editingTitle = true"
              >
                {{ task.title }}
              </h2>
            </div>
            <div class="flex items-center gap-1">
              <button class="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50" title="Duplikat" @click="duplicateTask">
                <Copy class="w-4 h-4" />
              </button>
              <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="deleteTask">
                <Trash2 class="w-4 h-4" />
              </button>
              <button class="p-2 rounded-lg text-muted-foreground hover:text-foreground" @click="close">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-6">
            <!-- Properties grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="rounded-lg bg-muted/30 px-3 py-2">
                <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><CheckCircle2 class="w-3 h-3" /> Status</p>
                <UiSelect class="mt-1" :model-value="task.status" :options="statusOptions" @update:model-value="changeStatus" />
              </div>
              <div class="rounded-lg bg-muted/30 px-3 py-2">
                <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Flag class="w-3 h-3" /> Priority</p>
                <UiSelect class="mt-1" :model-value="task.priority" :options="priorityOptions" @update:model-value="changePriority" />
              </div>
              <div class="rounded-lg bg-muted/30 px-3 py-2">
                <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><User class="w-3 h-3" /> Assignee</p>
                <UiSelect class="mt-1" :model-value="task.assigneeId" :options="employeeOptions" @update:model-value="changeAssignee" />
              </div>
              <div class="rounded-lg bg-muted/30 px-3 py-2">
                <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Calendar class="w-3 h-3" /> Due Date</p>
                <UiInput class="mt-1" :model-value="task.dueDate" type="date" @update:model-value="changeDueDate" />
              </div>
              <div class="rounded-lg bg-muted/30 px-3 py-2">
                <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Calendar class="w-3 h-3" /> Start Date</p>
                <UiInput class="mt-1" :model-value="task.startDate ?? ''" type="date" @update:model-value="changeStartDate" />
              </div>
              <div class="rounded-lg bg-muted/30 px-3 py-2 grid grid-cols-2 gap-2">
                <div>
                  <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Clock class="w-3 h-3" /> Est.</p>
                  <UiInput class="mt-1" :model-value="task.estimateHours ?? ''" type="number" placeholder="0h" @update:model-value="changeEstimate" />
                </div>
                <div>
                  <p class="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Clock class="w-3 h-3" /> Spent</p>
                  <UiInput class="mt-1" :model-value="task.spentHours ?? ''" type="number" placeholder="0h" @update:model-value="changeSpent" />
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div>
              <div class="flex items-center justify-between">
                <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Tag class="w-3 h-3" /> Tags</p>
                <button class="text-xs text-primary hover:underline" @click="showTagPicker = !showTagPicker">{{ showTagPicker ? 'Tutup' : 'Kelola' }}</button>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-2">
                <span
                  v-for="t in taskTags"
                  :key="t.id"
                  class="inline-flex items-center text-xs px-2 py-0.5 rounded-md font-medium"
                  :style="{ backgroundColor: `${t.color}20`, color: t.color }"
                >
                  {{ t.name }}
                </span>
                <span v-if="taskTags.length === 0" class="text-xs text-muted-foreground">Belum ada tag.</span>
              </div>
              <div v-if="showTagPicker" class="mt-2 flex flex-wrap gap-2 rounded-lg border border-border p-2">
                <button
                  v-for="t in allTags"
                  :key="t.id"
                  type="button"
                  :class="[
                    'inline-flex items-center text-xs px-2 py-1 rounded-md font-medium border transition',
                    task.tagIds.includes(t.id) ? 'opacity-100' : 'opacity-50 hover:opacity-100',
                  ]"
                  :style="{ backgroundColor: `${t.color}20`, color: t.color, borderColor: `${t.color}40` }"
                  @click="toggleTag(t.id)"
                >
                  {{ t.name }}
                </button>
              </div>
            </div>

            <!-- Watchers -->
            <div>
              <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Eye class="w-3 h-3" /> Watchers</p>
              <div class="flex items-center gap-2 mt-2 flex-wrap">
                <div
                  v-for="w in watchersList"
                  :key="w!.id"
                  class="inline-flex items-center gap-1.5 rounded-full bg-muted/40 px-2 py-1"
                >
                  <span class="w-5 h-5 rounded-full bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-[10px] font-semibold text-white">
                    {{ getInitials(w!.name) }}
                  </span>
                  <span class="text-xs">{{ w!.name }}</span>
                  <button class="text-muted-foreground hover:text-destructive" @click="toggleWatcher(w!.id)">
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div class="mt-2">
                <UiSelect
                  :options="[{ value: '', label: '+ Tambah watcher' }, ...employeeOptions]"
                  model-value=""
                  @update:model-value="(v: string) => v && toggleWatcher(v)"
                />
              </div>
            </div>

            <!-- Description -->
            <div>
              <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Description</p>
              <textarea
                v-if="editingDesc"
                v-model="descEdit"
                class="mt-2 w-full min-h-32 rounded-xl border border-input bg-card/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                @blur="saveDesc"
              />
              <div
                v-else
                class="mt-2 text-sm text-foreground whitespace-pre-line cursor-text hover:bg-muted/20 rounded-xl p-3 min-h-12 border border-transparent hover:border-border"
                @click="editingDesc = true"
              >
                {{ task.description || 'Klik untuk menambahkan deskripsi...' }}
              </div>
            </div>

            <!-- Subtasks -->
            <div>
              <div class="flex items-center justify-between">
                <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><ListChecks class="w-3 h-3" /> Subtasks</p>
                <span class="text-xs text-muted-foreground">{{ task.subtasks.filter((s) => s.done).length }}/{{ task.subtasks.length }}</span>
              </div>
              <div class="mt-2 space-y-1.5">
                <div v-for="s in task.subtasks" :key="s.id" class="flex items-center gap-2 rounded-lg hover:bg-muted/20 p-1.5 group">
                  <input type="checkbox" :checked="s.done" class="w-4 h-4 accent-primary" @change="toggleSub(s.id)" >
                  <span class="flex-1 text-sm" :class="s.done ? 'line-through text-muted-foreground' : 'text-foreground'">{{ s.title }}</span>
                  <UiSelect
                    class="w-32 hidden sm:block"
                    :model-value="s.assigneeId ?? ''"
                    :options="[{ value: '', label: '—' }, ...employeeOptions]"
                    @update:model-value="(v: string) => changeSubAssignee(s.id, v)"
                  />
                  <button class="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100" @click="removeSub(s.id)">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <UiInput v-model="newSubtask" placeholder="Tambah subtask..." @keyup.enter="addSubtask" />
                <UiButton size="sm" variant="outline" :disabled="!newSubtask.trim()" @click="addSubtask">
                  <Plus class="w-4 h-4" />
                </UiButton>
              </div>
            </div>

            <!-- Checklist -->
            <div>
              <div class="flex items-center justify-between">
                <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Checklist</p>
                <span class="text-xs text-muted-foreground">{{ task.checklist.filter((c) => c.done).length }}/{{ task.checklist.length }}</span>
              </div>
              <div class="mt-2 space-y-1.5">
                <div v-for="c in task.checklist" :key="c.id" class="flex items-center gap-2 rounded-lg hover:bg-muted/20 p-1.5 group">
                  <input type="checkbox" :checked="c.done" class="w-4 h-4 accent-primary" @change="toggleCheck(c.id)" >
                  <span class="flex-1 text-sm" :class="c.done ? 'line-through text-muted-foreground' : 'text-foreground'">{{ c.text }}</span>
                  <button class="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100" @click="removeCheck(c.id)">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <UiInput v-model="newChecklist" placeholder="Tambah checklist item..." @keyup.enter="addCheck" />
                <UiButton size="sm" variant="outline" :disabled="!newChecklist.trim()" @click="addCheck">
                  <Plus class="w-4 h-4" />
                </UiButton>
              </div>
            </div>

            <!-- Progress bar overall -->
            <div v-if="task.subtasks.length + task.checklist.length > 0" class="rounded-xl bg-muted/30 p-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted-foreground">Progress keseluruhan</span>
                <span class="font-semibold text-foreground">{{ progress }}%</span>
              </div>
              <div class="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-primary transition-all" :style="{ width: `${progress}%` }" />
              </div>
            </div>

            <!-- Attachments -->
            <div>
              <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><Paperclip class="w-3 h-3" /> Attachments</p>
              <div class="mt-2 space-y-1.5">
                <div v-for="e in task.evidence" :key="e.id" class="rounded-lg border border-border p-2 flex items-center justify-between text-sm">
                  <span class="font-mono">{{ e.fileName ?? '(catatan)' }}</span>
                  <span class="text-xs text-muted-foreground">{{ formatDate(e.uploadedAt) }}</span>
                </div>
              </div>
              <label class="flex items-center gap-2 h-10 mt-2 rounded-xl border border-dashed border-input bg-card/50 px-3 text-sm text-muted-foreground hover:border-primary/50 cursor-pointer">
                <Upload class="w-4 h-4" />
                <span>Upload file</span>
                <input type="file" class="hidden" @change="uploadAttachment" >
              </label>
            </div>

            <!-- Comments -->
            <div>
              <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-1.5"><MessageCircle class="w-3 h-3" /> Komentar ({{ task.comments.length }})</p>
              <div class="mt-2 space-y-2">
                <div v-for="c in task.comments" :key="c.id" class="rounded-lg bg-muted/30 p-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium text-foreground">{{ c.authorName }}</span>
                    <span class="text-muted-foreground">{{ formatDate(c.createdAt) }}</span>
                  </div>
                  <p class="text-sm mt-1">{{ c.body }}</p>
                </div>
              </div>
              <div class="flex items-end gap-2 mt-2">
                <UiTextarea v-model="newComment" rows="2" placeholder="Tulis komentar..." />
                <UiButton variant="gradient" :disabled="!newComment.trim()" @click="postComment">
                  <Send class="w-4 h-4" />
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
