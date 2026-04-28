import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ChecklistType = 'onboarding' | 'offboarding'
export type TaskStatus = 'pending' | 'in_progress' | 'done'

export interface ChecklistTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  dueDate?: string
  completedAt?: string
  completedBy?: string
  order: number
}

export interface OnboardingChecklist {
  id: string
  employeeId: string
  type: ChecklistType
  joinDate?: string
  exitDate?: string
  tasks: ChecklistTask[]
  status: 'in_progress' | 'completed'
  createdAt: string
  updatedAt: string
}

const DEFAULT_ONBOARDING_TASKS: Omit<ChecklistTask, 'id' | 'status' | 'order'>[] = [
  { title: 'Dokumen kontrak & NDA', description: 'Tandatangani dan serahkan ke HR' },
  { title: 'Setup email & akses sistem', description: 'IT provisioning' },
  { title: 'Kartu karyawan & akses gedung', description: 'Ambil di security' },
  { title: 'Onboarding session', description: 'Sesi pengenalan perusahaan' },
  { title: 'Perkenalan dengan tim', description: 'Meet & greet dengan divisi' },
  { title: 'Penyerahan peralatan kerja', description: 'Laptop, HP, dll' },
]

const DEFAULT_OFFBOARDING_TASKS: Omit<ChecklistTask, 'id' | 'status' | 'order'>[] = [
  { title: 'Pengembalian peralatan', description: 'Laptop, kartu, akses' },
  { title: 'Revoke akses sistem & email', description: 'IT' },
  { title: 'Exit interview', description: 'Dijadwalkan dengan HR' },
  { title: 'Handover tugas', description: 'Dokumentasi dan transfer knowledge' },
  { title: 'Kliring keuangan', description: 'Advance, klaim, dll' },
  { title: 'Surat referensi & pengalaman kerja', description: 'Jika diminta' },
]

function createTask(
  t: Omit<ChecklistTask, 'id' | 'status'> & { order: number },
  status: TaskStatus = 'pending'
): ChecklistTask {
  return {
    ...t,
    id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status,
  }
}

export const useWfmOnboardingStore = defineStore('wfm-onboarding', () => {
  const checklists = ref<OnboardingChecklist[]>([
    {
      id: 'cl1',
      employeeId: '1',
      type: 'onboarding',
      joinDate: '2026-01-15',
      tasks: DEFAULT_ONBOARDING_TASKS.map((t, i) =>
        createTask({ ...t, order: i }, i < 3 ? 'done' : i === 3 ? 'in_progress' : 'pending')
      ),
      status: 'in_progress',
      createdAt: '2026-01-10T00:00:00',
      updatedAt: '2026-02-01T00:00:00',
    },
    {
      id: 'cl2',
      employeeId: '2',
      type: 'offboarding',
      exitDate: '2026-02-28',
      tasks: DEFAULT_OFFBOARDING_TASKS.map((t, i) =>
        createTask({ ...t, order: i }, i < 1 ? 'done' : 'pending')
      ),
      status: 'in_progress',
      createdAt: '2026-02-01T00:00:00',
      updatedAt: '2026-02-01T00:00:00',
    },
  ])

  const typeFilter = ref<ChecklistType | 'all'>('all')
  const statusFilter = ref<string>('all')

  const filtered = computed(() => {
    let result = checklists.value
    if (typeFilter.value !== 'all') {
      result = result.filter((c) => c.type === typeFilter.value)
    }
    if (statusFilter.value !== 'all') {
      result = result.filter((c) => c.status === statusFilter.value)
    }
    return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  })

  function getChecklistById(id: string): OnboardingChecklist | undefined {
    return checklists.value.find((c) => c.id === id)
  }

  function getChecklistByEmployee(employeeId: string, type: ChecklistType): OnboardingChecklist | undefined {
    return checklists.value.find((c) => c.employeeId === employeeId && c.type === type)
  }

  function createChecklist(
    employeeId: string,
    type: ChecklistType,
    joinDate?: string,
    exitDate?: string
  ): string {
    const id = `cl-${Date.now()}`
    const tasks =
      type === 'onboarding'
        ? DEFAULT_ONBOARDING_TASKS.map((t, i) => createTask({ ...t, order: i }))
        : DEFAULT_OFFBOARDING_TASKS.map((t, i) => createTask({ ...t, order: i }))
    const now = new Date().toISOString()
    checklists.value.push({
      id,
      employeeId,
      type,
      joinDate,
      exitDate,
      tasks,
      status: 'in_progress',
      createdAt: now,
      updatedAt: now,
    })
    return id
  }

  function updateTaskStatus(
    checklistId: string,
    taskId: string,
    status: TaskStatus,
    completedBy?: string
  ): boolean {
    const cl = checklists.value.find((c) => c.id === checklistId)
    if (!cl) return false
    const task = cl.tasks.find((t) => t.id === taskId)
    if (!task) return false
    task.status = status
    if (status === 'done') {
      task.completedAt = new Date().toISOString().split('T')[0]
      task.completedBy = completedBy
    } else {
      task.completedAt = undefined
      task.completedBy = undefined
    }
    cl.updatedAt = new Date().toISOString()
    const allDone = cl.tasks.every((t) => t.status === 'done')
    if (allDone) cl.status = 'completed'
    return true
  }

  function addCustomTask(checklistId: string, title: string, description?: string): boolean {
    const cl = checklists.value.find((c) => c.id === checklistId)
    if (!cl) return false
    const order = cl.tasks.length
    cl.tasks.push(createTask({ title, description, order }))
    cl.updatedAt = new Date().toISOString()
    return true
  }

  function removeTask(checklistId: string, taskId: string): boolean {
    const cl = checklists.value.find((c) => c.id === checklistId)
    if (!cl) return false
    const i = cl.tasks.findIndex((t) => t.id === taskId)
    if (i === -1) return false
    cl.tasks.splice(i, 1)
    cl.updatedAt = new Date().toISOString()
    return true
  }

  return {
    checklists,
    typeFilter,
    statusFilter,
    filtered,
    getChecklistById,
    getChecklistByEmployee,
    createChecklist,
    updateTaskStatus,
    addCustomTask,
    removeTask,
  }
})
