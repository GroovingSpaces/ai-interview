<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus, Search, Rows3, KanbanSquare, ListChecks, Clock, Filter, Calendar, MessageCircle, Paperclip, Flag,
} from 'lucide-vue-next'
import { useTasksStore, TASK_STATUSES, TASK_PRIORITIES, type WorkTask, type TaskStatus, type TaskPriority } from '~/stores/tasks'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

const props = withDefaults(
  defineProps<{
    /** Filter ke tasks ditugaskan ke user ini saja */
    assigneeFilter?: string
    /** Default view mode */
    defaultView?: 'list' | 'board'
    /** Title fallback */
    title?: string
    /** Subtitle */
    subtitle?: string
  }>(),
  { defaultView: 'list' },
)

const tasksStore = useTasksStore()
const employeesStore = useEmployeesStore()

const view = ref<'list' | 'board'>(props.defaultView)
const search = ref('')
const filterStatus = ref<string>('all')
const filterPriority = ref<string>('all')
const filterAssignee = ref<string>('all')
const filterTag = ref<string>('all')
const sortBy = ref<'dueDate' | 'priority' | 'updated' | 'created'>('dueDate')
const showFilters = ref(false)

const showForm = ref(false)
const showDetail = ref(false)
const detailId = ref<string | null>(null)
const formDefaultStatus = ref<TaskStatus | undefined>(undefined)

const employeeOptions = computed(() => [
  { value: 'all', label: 'Semua Assignee' },
  ...employeesStore.employees.map((e) => ({ value: e.id, label: e.name })),
])
const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  ...TASK_STATUSES.map((s) => ({ value: s.value, label: s.label })),
]
const priorityOptions = [
  { value: 'all', label: 'Semua Priority' },
  ...TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label })),
]
const tagFilterOptions = computed(() => [
  { value: 'all', label: 'Semua Tag' },
  ...tasksStore.tags.map((t) => ({ value: t.id, label: t.name })),
])
const sortOptions = [
  { value: 'dueDate', label: 'Deadline terdekat' },
  { value: 'priority', label: 'Priority' },
  { value: 'updated', label: 'Terakhir diperbarui' },
  { value: 'created', label: 'Terbaru dibuat' },
]

const filtered = computed(() => {
  const priorityRank: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 }
  let rows = tasksStore.tasks.slice()
  if (props.assigneeFilter) rows = rows.filter((t) => t.assigneeId === props.assigneeFilter)
  if (search.value) {
    const q = search.value.toLowerCase()
    rows = rows.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    )
  }
  if (filterStatus.value !== 'all') rows = rows.filter((t) => t.status === filterStatus.value)
  if (filterPriority.value !== 'all') rows = rows.filter((t) => t.priority === filterPriority.value)
  if (filterAssignee.value !== 'all') rows = rows.filter((t) => t.assigneeId === filterAssignee.value)
  if (filterTag.value !== 'all') rows = rows.filter((t) => t.tagIds.includes(filterTag.value))

  return rows.sort((a, b) => {
    if (sortBy.value === 'dueDate') return (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
    if (sortBy.value === 'priority') return priorityRank[a.priority] - priorityRank[b.priority]
    if (sortBy.value === 'updated') return b.updatedAt.localeCompare(a.updatedAt)
    return b.createdAt.localeCompare(a.createdAt)
  })
})

const pagination = usePagination(filtered, { pageSize: 10 })

const stats = computed(() => ({
  total: filtered.value.length,
  overdue: filtered.value.filter((t) => {
    if (t.status === 'done' || t.status === 'approved') return false
    return new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0)
  }).length,
  doneRate: (() => {
    if (filtered.value.length === 0) return 0
    const done = filtered.value.filter((t) => t.status === 'done' || t.status === 'approved').length
    return Math.round((done / filtered.value.length) * 100)
  })(),
}))

function tasksByStatus(status: TaskStatus) {
  return filtered.value.filter((t) => t.status === status)
}

function openCreate(status?: TaskStatus) {
  formDefaultStatus.value = status
  showForm.value = true
}

function openDetail(id: string) {
  detailId.value = id
  showDetail.value = true
}

function deleteTask(id: string) {
  tasksStore.deleteTask(id)
  showDetail.value = false
}

// Drag-drop on board (simplified: click status header to open create; click chip to change status)
const dragId = ref<string | null>(null)
function onDragStart(id: string) {
  dragId.value = id
}
function onDrop(status: TaskStatus) {
  if (dragId.value) {
    tasksStore.setStatus(dragId.value, status)
    dragId.value = null
  }
}

function priorityTone(p: TaskPriority) {
  return TASK_PRIORITIES.find((x) => x.value === p)?.tone ?? 'muted'
}
function statusColor(s: TaskStatus) {
  return TASK_STATUSES.find((x) => x.value === s)?.color ?? '#94a3b8'
}
function statusLabel(s: TaskStatus) {
  return TASK_STATUSES.find((x) => x.value === s)?.label ?? s
}
function assigneeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? '-'
}
function tagOf(id: string) {
  return tasksStore.getTagById(id)
}

function isOverdue(t: WorkTask): boolean {
  if (t.status === 'done' || t.status === 'approved') return false
  return new Date(t.dueDate).getTime() < new Date().setHours(0, 0, 0, 0)
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

function changeRowStatus(id: string, value: string) {
  tasksStore.setStatus(id, value as TaskStatus)
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title ?? 'Tasks'" :subtitle="subtitle">
      <template #actions>
        <div class="inline-flex rounded-lg border border-border p-1 bg-card/60">
          <button
            type="button"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors',
              view === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="view = 'list'"
          >
            <Rows3 class="w-3.5 h-3.5" />
            List
          </button>
          <button
            type="button"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors',
              view === 'board' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground',
            ]"
            @click="view = 'board'"
          >
            <KanbanSquare class="w-3.5 h-3.5" />
            Board
          </button>
        </div>
        <UiButton variant="outline" @click="showFilters = !showFilters">
          <Filter class="w-4 h-4" />
          Filter
        </UiButton>
        <UiButton variant="gradient" @click="openCreate()">
          <Plus class="w-4 h-4" />
          Task Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Task" :value="stats.total" :icon="ListChecks" />
      <UiStatCard label="Overdue" :value="stats.overdue" tone="low" :icon="Clock" />
      <UiStatCard label="Selesai" :value="`${stats.doneRate}%`" tone="good" :icon="Flag" />
      <UiStatCard label="Tag Aktif" :value="tasksStore.tags.length" :icon="Filter" />
    </div>

    <!-- Search + filters -->
    <div class="glass-card p-3 space-y-3">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <UiInput v-model="search" placeholder="Cari task..." class="pl-9" />
        </div>
        <div class="hidden md:block w-48">
          <UiSelect v-model="sortBy" :options="sortOptions" />
        </div>
      </div>
      <div v-if="showFilters" class="grid grid-cols-1 md:grid-cols-4 gap-2">
        <UiSelect v-model="filterStatus" :options="statusOptions" />
        <UiSelect v-model="filterPriority" :options="priorityOptions" />
        <UiSelect v-if="!assigneeFilter" v-model="filterAssignee" :options="employeeOptions" />
        <UiSelect v-model="filterTag" :options="tagFilterOptions" />
      </div>
    </div>

    <!-- LIST VIEW -->
    <div v-if="view === 'list'" class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Task</th>
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Assignee</th>
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Due</th>
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="t in pagination.pagedItems.value"
              :key="t.id"
              class="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
              @click="openDetail(t.id)"
            >
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2 min-w-0">
                  <Flag class="w-3.5 h-3.5 shrink-0" :style="{ color: TASK_PRIORITIES.find((p) => p.value === t.priority)?.color }" />
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ t.title }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span
                        v-for="tagId in t.tagIds.slice(0, 3)"
                        :key="tagId"
                        class="inline-flex text-[9px] px-1 py-0.5 rounded font-medium"
                        :style="{ backgroundColor: `${tagOf(tagId)?.color}20`, color: tagOf(tagId)?.color }"
                      >
                        {{ tagOf(tagId)?.name }}
                      </span>
                      <span v-if="t.subtasks.length" class="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <ListChecks class="w-2.5 h-2.5" />
                        {{ t.subtasks.filter((s) => s.done).length }}/{{ t.subtasks.length }}
                      </span>
                      <span v-if="t.comments.length" class="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <MessageCircle class="w-2.5 h-2.5" />
                        {{ t.comments.length }}
                      </span>
                      <span v-if="t.evidence.length" class="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Paperclip class="w-2.5 h-2.5" />
                        {{ t.evidence.length }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-2.5" @click.stop>
                <UiSelect :model-value="t.status" :options="statusOptions.filter((o) => o.value !== 'all')" @update:model-value="(v) => changeRowStatus(t.id, v)" />
              </td>
              <td class="px-3 py-2.5">
                <UiStatusBadge :label="TASK_PRIORITIES.find((p) => p.value === t.priority)?.label ?? t.priority" :tone="priorityTone(t.priority)" />
              </td>
              <td class="px-3 py-2.5">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
                    {{ getInitials(assigneeName(t.assigneeId)) }}
                  </div>
                  <span class="text-sm text-foreground truncate">{{ assigneeName(t.assigneeId) }}</span>
                </div>
              </td>
              <td class="px-3 py-2.5 text-sm" :class="isOverdue(t) ? 'text-destructive font-medium' : 'text-muted-foreground'">
                <span class="inline-flex items-center gap-1"><Calendar class="w-3 h-3" />{{ formatDate(t.dueDate) }}</span>
              </td>
              <td class="px-3 py-2.5 w-32">
                <div class="flex items-center gap-2">
                  <div class="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div class="h-full bg-primary" :style="{ width: `${tasksStore.progressOf(t)}%` }" />
                  </div>
                  <span class="text-xs font-mono text-muted-foreground w-8 text-right">{{ tasksStore.progressOf(t) }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        :icon="ListChecks"
        title="Tidak ada task"
        description="Buat task baru atau ubah filter."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="task"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <!-- BOARD VIEW -->
    <div v-else class="overflow-x-auto pb-4">
      <div class="flex gap-3 min-w-max">
        <div
          v-for="col in TASK_STATUSES"
          :key="col.value"
          class="w-72 shrink-0 rounded-xl bg-muted/30 border border-border flex flex-col max-h-[calc(100vh-22rem)]"
          @dragover.prevent
          @drop="onDrop(col.value)"
        >
          <div class="flex items-center justify-between p-3 border-b border-border">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: col.color }" />
              <p class="text-sm font-semibold text-foreground">{{ col.label }}</p>
              <span class="text-xs text-muted-foreground">({{ tasksByStatus(col.value).length }})</span>
            </div>
            <button class="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground" @click="openCreate(col.value)">
              <Plus class="w-3.5 h-3.5" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-2">
            <div
              v-for="t in tasksByStatus(col.value)"
              :key="t.id"
              draggable="true"
              @dragstart="onDragStart(t.id)"
            >
              <TasksTaskCard :task="t" @open="openDetail" />
            </div>
            <p v-if="tasksByStatus(col.value).length === 0" class="text-xs text-center text-muted-foreground py-4">Kosong</p>
          </div>
        </div>
      </div>
    </div>

    <TasksTaskFormModal :open="showForm" :default-status="formDefaultStatus" :default-assignee-id="assigneeFilter" @update:open="showForm = $event" />
    <TasksTaskDetailDrawer :open="showDetail" :task-id="detailId" @update:open="showDetail = $event" @delete="deleteTask" />
  </div>
</template>
