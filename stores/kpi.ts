import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** Company KPI policy - aligns with company policies */
export interface KpiPolicy {
  id: string
  name: string
  description: string
  category: string
  targetUnit: string
  weight: number
  applicableTo: 'all' | 'department'
  departmentId?: string
}

/** KPI assignment/result per employee for a period */
export type KpiStatus = 'draft' | 'in_progress' | 'submitted' | 'reviewed'

export interface KpiAssignment {
  id: string
  policyId: string
  employeeId: string
  period: string
  target: number
  actual: number
  status: KpiStatus
  notes?: string
  /** Evidence file: original name (optional) */
  evidenceFileName?: string
  /** Evidence file: base64 data URL for download (optional) */
  evidenceFileData?: string
}

export const useKpiStore = defineStore('kpi', () => {
  const policies = ref<KpiPolicy[]>([
    {
      id: '1',
      name: 'Sales Target Achievement',
      description: 'Achieve monthly sales target as per company policy',
      category: 'Sales',
      targetUnit: '%',
      weight: 30,
      applicableTo: 'department',
      departmentId: '4',
    },
    {
      id: '2',
      name: 'Project Delivery On-Time',
      description: 'Deliver projects within agreed timeline (company standard)',
      category: 'Delivery',
      targetUnit: '%',
      weight: 25,
      applicableTo: 'all',
    },
    {
      id: '3',
      name: 'Quality Score',
      description: 'Maintain quality standards per company quality policy',
      category: 'Quality',
      targetUnit: 'score',
      weight: 20,
      applicableTo: 'all',
    },
    {
      id: '4',
      name: 'Training Completion',
      description: 'Complete mandatory training as per HR policy',
      category: 'Learning',
      targetUnit: '%',
      weight: 15,
      applicableTo: 'all',
    },
    {
      id: '5',
      name: 'Attendance & Punctuality',
      description: 'Adhere to attendance policy - no unexcused absences',
      category: 'Discipline',
      targetUnit: '%',
      weight: 10,
      applicableTo: 'all',
    },
  ])

  const assignments = ref<KpiAssignment[]>([
    {
      id: 'a1',
      policyId: '1',
      employeeId: '1',
      period: '2026-Q1',
      target: 100,
      actual: 95,
      status: 'reviewed',
      notes: 'Strong performance',
    },
    {
      id: 'a2',
      policyId: '2',
      employeeId: '1',
      period: '2026-Q1',
      target: 100,
      actual: 100,
      status: 'reviewed',
    },
    {
      id: 'a3',
      policyId: '2',
      employeeId: '2',
      period: '2026-Q1',
      target: 100,
      actual: 85,
      status: 'in_progress',
    },
    {
      id: 'a4',
      policyId: '3',
      employeeId: '1',
      period: '2026-Q1',
      target: 90,
      actual: 92,
      status: 'reviewed',
    },
    {
      id: 'a5',
      policyId: '4',
      employeeId: '3',
      period: '2026-Q1',
      target: 100,
      actual: 0,
      status: 'draft',
    },
  ])

  const periodFilter = ref('')
  const employeeFilter = ref('')
  const policyFilter = ref('')
  const statusFilter = ref<string>('all')

  const filteredAssignments = computed(() => {
    let result = assignments.value
    if (periodFilter.value) {
      result = result.filter((a) => a.period === periodFilter.value)
    }
    if (employeeFilter.value) {
      result = result.filter((a) => a.employeeId === employeeFilter.value)
    }
    if (policyFilter.value) {
      result = result.filter((a) => a.policyId === policyFilter.value)
    }
    if (statusFilter.value !== 'all') {
      result = result.filter((a) => a.status === statusFilter.value)
    }
    return result.sort((a, b) => b.period.localeCompare(a.period) || a.employeeId.localeCompare(b.employeeId))
  })

  const stats = computed(() => ({
    totalPolicies: policies.value.length,
    totalAssignments: assignments.value.length,
    reviewed: assignments.value.filter((a) => a.status === 'reviewed').length,
    inProgress: assignments.value.filter((a) => a.status === 'in_progress').length,
    draft: assignments.value.filter((a) => a.status === 'draft').length,
  }))

  const periodOptions = computed(() => {
    const periods = [...new Set(assignments.value.map((a) => a.period))].sort().reverse()
    return periods.map((p) => ({ value: p, label: p }))
  })

  function getPolicyById(id: string): KpiPolicy | undefined {
    return policies.value.find((p) => p.id === id)
  }

  function getAssignmentById(id: string): KpiAssignment | undefined {
    return assignments.value.find((a) => a.id === id)
  }

  function getAssignmentsByEmployeeAndPeriod(employeeId: string, period: string): KpiAssignment[] {
    return assignments.value
      .filter((a) => a.employeeId === employeeId && a.period === period)
      .sort((a, b) => a.policyId.localeCompare(b.policyId))
  }

  function addPolicy(payload: Omit<KpiPolicy, 'id'>): string {
    const id = String(Date.now())
    policies.value.push({ ...payload, id })
    return id
  }

  function updatePolicy(id: string, updates: Partial<Omit<KpiPolicy, 'id'>>): boolean {
    const i = policies.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    policies.value[i] = { ...policies.value[i], ...updates }
    return true
  }

  function deletePolicy(id: string): boolean {
    const i = policies.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    policies.value.splice(i, 1)
    assignments.value = assignments.value.filter((a) => a.policyId !== id)
    return true
  }

  function addAssignment(payload: Omit<KpiAssignment, 'id'>): string {
    const id = String(Date.now())
    assignments.value.push({ ...payload, id })
    return id
  }

  function updateAssignment(id: string, updates: Partial<Omit<KpiAssignment, 'id'>>): boolean {
    const i = assignments.value.findIndex((a) => a.id === id)
    if (i === -1) return false
    assignments.value[i] = { ...assignments.value[i], ...updates }
    return true
  }

  function deleteAssignment(id: string): boolean {
    const i = assignments.value.findIndex((a) => a.id === id)
    if (i === -1) return false
    assignments.value.splice(i, 1)
    return true
  }

  return {
    policies,
    assignments,
    periodFilter,
    employeeFilter,
    policyFilter,
    statusFilter,
    filteredAssignments,
    stats,
    periodOptions,
    getPolicyById,
    getAssignmentById,
    getAssignmentsByEmployeeAndPeriod,
    addPolicy,
    updatePolicy,
    deletePolicy,
    addAssignment,
    updateAssignment,
    deleteAssignment,
  }
})
