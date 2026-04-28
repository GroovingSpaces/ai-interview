import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none'
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'submitted' | 'approved' | 'rejected' | 'done'

export interface TaskEvidence {
  id: string
  fileName?: string
  fileData?: string
  note?: string
  uploadedAt: string
}

export interface TaskComment {
  id: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export interface TaskChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Subtask {
  id: string
  title: string
  done: boolean
  assigneeId?: string
  dueDate?: string
}

export interface TaskTag {
  id: string
  name: string
  color: string
}

export interface WorkTask {
  id: string
  title: string
  description: string
  assigneeId: string
  assignerId: string
  watchers: string[]
  priority: TaskPriority
  status: TaskStatus
  startDate?: string
  dueDate: string
  estimateHours?: number
  spentHours?: number
  tagIds: string[]
  subtasks: Subtask[]
  checklist: TaskChecklistItem[]
  comments: TaskComment[]
  evidence: TaskEvidence[]
  createdAt: string
  updatedAt: string
}

export const TASK_STATUSES: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'todo', label: 'To Do', color: '#94a3b8' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'in_review', label: 'In Review', color: '#a855f7' },
  { value: 'submitted', label: 'Submitted', color: '#f59e0b' },
  { value: 'approved', label: 'Approved', color: '#22c55e' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' },
  { value: 'done', label: 'Done', color: '#16a34a' },
]

export const TASK_PRIORITIES: { value: TaskPriority; label: string; color: string; tone: 'low' | 'warning' | 'average' | 'good' | 'muted' }[] = [
  { value: 'urgent', label: 'Urgent', color: '#ef4444', tone: 'low' },
  { value: 'high', label: 'High', color: '#f97316', tone: 'warning' },
  { value: 'medium', label: 'Medium', color: '#eab308', tone: 'average' },
  { value: 'low', label: 'Low', color: '#22c55e', tone: 'good' },
  { value: 'none', label: 'No Priority', color: '#94a3b8', tone: 'muted' },
]

export const useTasksStore = defineStore('tasks', () => {
  const tags = ref<TaskTag[]>([
    { id: 't1', name: 'Frontend', color: '#3b82f6' },
    { id: 't2', name: 'Backend', color: '#a855f7' },
    { id: 't3', name: 'Design', color: '#ec4899' },
    { id: 't4', name: 'Bug', color: '#ef4444' },
    { id: 't5', name: 'Improvement', color: '#22c55e' },
    { id: 't6', name: 'Documentation', color: '#f59e0b' },
  ])

  const tasks = ref<WorkTask[]>([
    {
      id: '1',
      title: 'Submit laporan bulanan Maret',
      description: 'Lengkapi laporan bulanan termasuk data penjualan dan ringkasan kendala.',
      assigneeId: '1',
      assignerId: '99',
      watchers: ['2'],
      priority: 'high',
      status: 'in_progress',
      startDate: '2026-04-15',
      dueDate: '2026-04-30',
      estimateHours: 8,
      spentHours: 3,
      tagIds: ['t6'],
      subtasks: [
        { id: 's1', title: 'Kumpulkan data penjualan', done: true },
        { id: 's2', title: 'Tulis ringkasan kendala', done: false, dueDate: '2026-04-28' },
      ],
      checklist: [
        { id: 'c1', text: 'Format sesuai template HQ', done: true },
        { id: 'c2', text: 'Review oleh atasan', done: false },
      ],
      comments: [
        { id: 'cm1', authorId: '99', authorName: 'Super Admin', body: 'Tolong selesai sebelum akhir bulan ya.', createdAt: '2026-04-20' },
      ],
      evidence: [],
      createdAt: '2026-04-20',
      updatedAt: '2026-04-22',
    },
    {
      id: '2',
      title: 'Review draft kontrak vendor',
      description: 'Review draft kontrak dan beri komentar.',
      assigneeId: '2',
      assignerId: '99',
      watchers: [],
      priority: 'medium',
      status: 'submitted',
      dueDate: '2026-05-05',
      estimateHours: 4,
      tagIds: ['t6'],
      subtasks: [],
      checklist: [],
      comments: [],
      evidence: [
        { id: 'e1', fileName: 'review-notes.pdf', note: 'Sudah saya review, ada 3 catatan revisi.', uploadedAt: '2026-04-26' },
      ],
      createdAt: '2026-04-22',
      updatedAt: '2026-04-26',
    },
    {
      id: '3',
      title: 'Bug: Login form crash di Safari',
      description: 'Form login crash saat user submit dengan password kosong di Safari iOS.',
      assigneeId: '1',
      assignerId: '2',
      watchers: ['99'],
      priority: 'urgent',
      status: 'todo',
      dueDate: '2026-04-29',
      estimateHours: 3,
      tagIds: ['t1', 't4'],
      subtasks: [
        { id: 's3', title: 'Reproduce di Safari iOS', done: false },
        { id: 's4', title: 'Patch + add unit test', done: false },
      ],
      checklist: [],
      comments: [],
      evidence: [],
      createdAt: '2026-04-25',
      updatedAt: '2026-04-25',
    },
    {
      id: '4',
      title: 'Design system component update',
      description: 'Update Button, Input, dan Modal sesuai design v2.',
      assigneeId: '4',
      assignerId: '2',
      watchers: [],
      priority: 'low',
      status: 'done',
      dueDate: '2026-04-15',
      estimateHours: 12,
      spentHours: 14,
      tagIds: ['t1', 't3', 't5'],
      subtasks: [],
      checklist: [
        { id: 'c3', text: 'Button variants', done: true },
        { id: 'c4', text: 'Input states', done: true },
        { id: 'c5', text: 'Modal sizes', done: true },
      ],
      comments: [],
      evidence: [],
      createdAt: '2026-04-01',
      updatedAt: '2026-04-15',
    },
  ])

  function nowIso() {
    return new Date().toISOString().slice(0, 10)
  }
  function genId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  }

  function addTask(payload: Partial<WorkTask> & { title: string; assigneeId: string; assignerId: string; dueDate: string }): string {
    const id = genId()
    const today = nowIso()
    tasks.value.push({
      id,
      title: payload.title,
      description: payload.description ?? '',
      assigneeId: payload.assigneeId,
      assignerId: payload.assignerId,
      watchers: payload.watchers ?? [],
      priority: payload.priority ?? 'medium',
      status: payload.status ?? 'todo',
      startDate: payload.startDate,
      dueDate: payload.dueDate,
      estimateHours: payload.estimateHours,
      spentHours: payload.spentHours,
      tagIds: payload.tagIds ?? [],
      subtasks: payload.subtasks ?? [],
      checklist: payload.checklist ?? [],
      comments: payload.comments ?? [],
      evidence: payload.evidence ?? [],
      createdAt: today,
      updatedAt: today,
    })
    return id
  }
  function updateTask(id: string, updates: Partial<Omit<WorkTask, 'id'>>): boolean {
    const i = tasks.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    tasks.value[i] = { ...tasks.value[i], ...updates, updatedAt: nowIso() }
    return true
  }
  function deleteTask(id: string): boolean {
    const i = tasks.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    tasks.value.splice(i, 1)
    return true
  }
  function getTaskById(id: string) {
    return tasks.value.find((t) => t.id === id)
  }
  function setStatus(id: string, status: TaskStatus) {
    return updateTask(id, { status })
  }
  function duplicateTask(id: string) {
    const t = getTaskById(id)
    if (!t) return ''
    return addTask({
      title: `${t.title} (copy)`,
      description: t.description,
      assigneeId: t.assigneeId,
      assignerId: t.assignerId,
      watchers: [...t.watchers],
      priority: t.priority,
      status: 'todo',
      startDate: t.startDate,
      dueDate: t.dueDate,
      estimateHours: t.estimateHours,
      tagIds: [...t.tagIds],
      subtasks: t.subtasks.map((s) => ({ ...s, id: genId('s'), done: false })),
      checklist: t.checklist.map((c) => ({ ...c, id: genId('c'), done: false })),
    })
  }

  function addSubtask(taskId: string, title: string) {
    const t = getTaskById(taskId)
    if (!t) return
    t.subtasks.push({ id: genId('s'), title, done: false })
    t.updatedAt = nowIso()
  }
  function updateSubtask(taskId: string, subId: string, updates: Partial<Subtask>) {
    const t = getTaskById(taskId)
    if (!t) return
    const i = t.subtasks.findIndex((s) => s.id === subId)
    if (i === -1) return
    t.subtasks[i] = { ...t.subtasks[i], ...updates }
    t.updatedAt = nowIso()
  }
  function removeSubtask(taskId: string, subId: string) {
    const t = getTaskById(taskId)
    if (!t) return
    t.subtasks = t.subtasks.filter((s) => s.id !== subId)
    t.updatedAt = nowIso()
  }

  function addChecklistItem(taskId: string, text: string) {
    const t = getTaskById(taskId)
    if (!t) return
    t.checklist.push({ id: genId('c'), text, done: false })
    t.updatedAt = nowIso()
  }
  function toggleChecklist(taskId: string, itemId: string) {
    const t = getTaskById(taskId)
    if (!t) return
    const item = t.checklist.find((c) => c.id === itemId)
    if (item) item.done = !item.done
    t.updatedAt = nowIso()
  }
  function removeChecklistItem(taskId: string, itemId: string) {
    const t = getTaskById(taskId)
    if (!t) return
    t.checklist = t.checklist.filter((c) => c.id !== itemId)
    t.updatedAt = nowIso()
  }

  function addComment(taskId: string, payload: Omit<TaskComment, 'id' | 'createdAt'>) {
    const t = getTaskById(taskId)
    if (!t) return
    t.comments.push({
      ...payload,
      id: genId('cm'),
      createdAt: nowIso(),
    })
    t.updatedAt = nowIso()
  }

  function addEvidence(taskId: string, evidence: Omit<TaskEvidence, 'id' | 'uploadedAt'>) {
    const t = getTaskById(taskId)
    if (!t) return
    t.evidence.push({
      ...evidence,
      id: genId('e'),
      uploadedAt: nowIso(),
    })
    t.updatedAt = nowIso()
  }

  function addTag(name: string, color: string): string {
    const id = genId('tag-')
    tags.value.push({ id, name, color })
    return id
  }
  function deleteTag(id: string) {
    tags.value = tags.value.filter((t) => t.id !== id)
    for (const t of tasks.value) {
      t.tagIds = t.tagIds.filter((tid) => tid !== id)
    }
  }
  function getTagById(id: string) {
    return tags.value.find((t) => t.id === id)
  }

  function toggleWatcher(taskId: string, userId: string) {
    const t = getTaskById(taskId)
    if (!t) return
    if (t.watchers.includes(userId)) t.watchers = t.watchers.filter((w) => w !== userId)
    else t.watchers.push(userId)
    t.updatedAt = nowIso()
  }

  function progressOf(task: WorkTask): number {
    const total = task.subtasks.length + task.checklist.length
    if (total === 0) return task.status === 'done' || task.status === 'approved' ? 100 : 0
    const done = task.subtasks.filter((s) => s.done).length + task.checklist.filter((c) => c.done).length
    return Math.round((done / total) * 100)
  }

  return {
    tasks,
    tags,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    setStatus,
    duplicateTask,
    addSubtask,
    updateSubtask,
    removeSubtask,
    addChecklistItem,
    toggleChecklist,
    removeChecklistItem,
    addComment,
    addEvidence,
    addTag,
    deleteTag,
    getTagById,
    toggleWatcher,
    progressOf,
  }
})
