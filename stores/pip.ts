import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PipStatus = 'draft' | 'active' | 'on_track' | 'at_risk' | 'completed' | 'failed'

export interface PipMilestone {
  title: string
  dueDate: string
  done: boolean
  notes?: string
}

export interface PipPlan {
  id: string
  employeeId: string
  reason: string
  startDate: string
  endDate: string
  goals: string
  milestones: PipMilestone[]
  supervisorId?: string
  hrPicId?: string
  status: PipStatus
  createdAt: string
}

export const usePipStore = defineStore('pip', () => {
  const plans = ref<PipPlan[]>([
    {
      id: '1',
      employeeId: '5',
      reason: 'Pencapaian KPI di bawah ekspektasi 2 periode terakhir.',
      startDate: '2026-04-01',
      endDate: '2026-06-30',
      goals: 'Meningkatkan produktivitas marketing campaign hingga 80% target.',
      milestones: [
        { title: '1-1 weekly dengan supervisor', dueDate: '2026-04-15', done: true },
        { title: 'Submit campaign plan baru', dueDate: '2026-04-30', done: false },
        { title: 'Evaluasi pertengahan', dueDate: '2026-05-30', done: false },
      ],
      supervisorId: '2',
      hrPicId: '99',
      status: 'active',
      createdAt: '2026-03-25',
    },
  ])

  const employeeFilter = ref('')
  const statusFilter = ref<string>('all')

  const filtered = computed(() => {
    let r = plans.value
    if (employeeFilter.value) r = r.filter((p) => p.employeeId === employeeFilter.value)
    if (statusFilter.value !== 'all') r = r.filter((p) => p.status === statusFilter.value)
    return [...r].sort((a, b) => b.startDate.localeCompare(a.startDate))
  })

  const stats = computed(() => ({
    total: plans.value.length,
    active: plans.value.filter((p) => p.status === 'active' || p.status === 'on_track' || p.status === 'at_risk').length,
    completed: plans.value.filter((p) => p.status === 'completed').length,
    failed: plans.value.filter((p) => p.status === 'failed').length,
  }))

  function addPlan(payload: Omit<PipPlan, 'id' | 'createdAt'>): string {
    const id = String(Date.now())
    plans.value.push({ ...payload, id, createdAt: new Date().toISOString().slice(0, 10) })
    return id
  }
  function updatePlan(id: string, updates: Partial<Omit<PipPlan, 'id'>>): boolean {
    const i = plans.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    plans.value[i] = { ...plans.value[i], ...updates }
    return true
  }
  function deletePlan(id: string): boolean {
    const i = plans.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    plans.value.splice(i, 1)
    return true
  }
  function getPlanById(id: string) {
    return plans.value.find((p) => p.id === id)
  }

  return {
    plans,
    employeeFilter,
    statusFilter,
    filtered,
    stats,
    addPlan,
    updatePlan,
    deletePlan,
    getPlanById,
  }
})
