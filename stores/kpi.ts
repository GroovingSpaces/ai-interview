import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/**
 * Indikator KPI (master) – konsep umum: definisi indikator yang diukur.
 * Kategori umum: Penjualan, Kualitas, Delivery, Pembelajaran, Disiplin, Kepemimpinan.
 */
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

/** Status penilaian KPI (umum: draft → in progress → submitted → reviewed) */
export type KpiStatus = 'draft' | 'in_progress' | 'submitted' | 'reviewed'

/** Status persetujuan saat manager assign KPI ke tim */
export type KpiApprovalStatus = 'draft' | 'pending_employee_ack' | 'pending_hr' | 'approved' | 'returned'

export interface KpiCheckIn {
  id: string
  date: string
  progress: number
  comment?: string
  authorId?: string
  authorRole?: 'manager' | 'employee' | 'hr'
}

/** Penetapan target & hasil KPI per karyawan per periode (goal setting + realisasi) */
export interface KpiAssignment {
  id: string
  policyId: string
  employeeId: string
  period: string
  target: number
  actual: number
  /** Bobot KPI ini terhadap total skor karyawan untuk periode ini (0-100). Override default policy.weight */
  weight?: number
  /** Threshold untuk mencapai status "achieved" (% pencapaian target). Default 80 */
  achievementThreshold?: number
  status: KpiStatus
  /** Status approval saat manager assign */
  approvalStatus?: KpiApprovalStatus
  /** Manager yang assign KPI ini */
  assignedBy?: string
  assignedAt?: string
  /** Cascade dari objective parent (org goal / dept goal) */
  cascadedFromId?: string
  cascadedFromLabel?: string
  /** SMART checklist */
  smart?: {
    specific: boolean
    measurable: boolean
    achievable: boolean
    relevant: boolean
    timeBound: boolean
  }
  /** Mid-period check-ins */
  checkIns?: KpiCheckIn[]
  notes?: string
  evidenceFileName?: string
  evidenceFileData?: string
}

/** Template bundle KPI per role/dept untuk reuse cepat saat assign */
export interface KpiTemplate {
  id: string
  name: string
  description: string
  scope: 'all' | 'department' | 'role'
  departmentId?: string
  positionLevel?: string
  /** Item: refer ke policyId master + default target + weight */
  items: {
    policyId: string
    defaultTarget: number
    defaultWeight: number
  }[]
}

/** Cascade objective: company → department → team → individual */
export interface CascadeObjective {
  id: string
  label: string
  description?: string
  level: 'company' | 'department' | 'team'
  parentId?: string
  ownerId?: string
}

/** Kategori KPI yang umum digunakan (standar industri) */
export const KPI_CATEGORIES = [
  'Penjualan',
  'Kualitas',
  'Delivery',
  'Pembelajaran',
  'Disiplin',
  'Kepemimpinan',
] as const

export const useKpiStore = defineStore('kpi', () => {
  /** Indikator KPI – daftar master indikator yang umum dipakai */
  const policies = ref<KpiPolicy[]>([
    {
      id: '1',
      name: 'Pencapaian Target Penjualan',
      description: 'Realisasi target penjualan/revenue terhadap target yang ditetapkan',
      category: 'Penjualan',
      targetUnit: '%',
      weight: 25,
      applicableTo: 'department',
      departmentId: '4',
    },
    {
      id: '2',
      name: 'Kualitas Kerja',
      description: 'Tingkat kualitas hasil kerja (sesuai standar perusahaan)',
      category: 'Kualitas',
      targetUnit: '%',
      weight: 20,
      applicableTo: 'all',
    },
    {
      id: '3',
      name: 'Ketepatan Waktu (On Time Delivery)',
      description: 'Penyelesaian tugas/proyek sesuai tenggat waktu',
      category: 'Delivery',
      targetUnit: '%',
      weight: 20,
      applicableTo: 'all',
    },
    {
      id: '4',
      name: 'Penyelesaian Tugas / Target Kerja',
      description: 'Pencapaian target kerja yang ditetapkan (output/deliverable)',
      category: 'Delivery',
      targetUnit: '%',
      weight: 15,
      applicableTo: 'all',
    },
    {
      id: '5',
      name: 'Pelatihan & Pengembangan',
      description: 'Penyelesaian pelatihan wajib dan pengembangan kompetensi',
      category: 'Pembelajaran',
      targetUnit: '%',
      weight: 10,
      applicableTo: 'all',
    },
    {
      id: '6',
      name: 'Kehadiran & Kedisiplinan',
      description: 'Tingkat kehadiran dan kepatuhan terhadap aturan kerja',
      category: 'Disiplin',
      targetUnit: '%',
      weight: 5,
      applicableTo: 'all',
    },
    {
      id: '7',
      name: 'Inisiatif & Kepemimpinan',
      description: 'Kontribusi inisiatif, kolaborasi, dan perilaku kepemimpinan (skala 1–5)',
      category: 'Kepemimpinan',
      targetUnit: 'skor',
      weight: 5,
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

  /**
   * Policies that apply to a department (applicableTo 'all' or departmentId match).
   * Use in "Assign KPI" form: get employee's departmentId, then show only these policies.
   */
  function getPoliciesApplicableToDepartment(departmentId: string | undefined): KpiPolicy[] {
    return policies.value.filter(
      (p) =>
        p.applicableTo === 'all' ||
        (p.applicableTo === 'department' && p.departmentId === departmentId)
    )
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

  // -------------------- KPI TEMPLATES --------------------
  const templates = ref<KpiTemplate[]>([
    {
      id: 'tpl-eng-staff',
      name: 'Engineering — Staff (default)',
      description: 'Bundle KPI untuk staff engineering: kualitas, on-time delivery, learning, disiplin.',
      scope: 'department',
      departmentId: '1',
      items: [
        { policyId: '2', defaultTarget: 90, defaultWeight: 30 },
        { policyId: '3', defaultTarget: 90, defaultWeight: 30 },
        { policyId: '4', defaultTarget: 95, defaultWeight: 20 },
        { policyId: '5', defaultTarget: 100, defaultWeight: 10 },
        { policyId: '6', defaultTarget: 95, defaultWeight: 10 },
      ],
    },
    {
      id: 'tpl-sales',
      name: 'Sales / Marketing',
      description: 'Bundle KPI sales-driven: target penjualan + delivery + disiplin.',
      scope: 'all',
      items: [
        { policyId: '1', defaultTarget: 100, defaultWeight: 50 },
        { policyId: '3', defaultTarget: 90, defaultWeight: 20 },
        { policyId: '4', defaultTarget: 100, defaultWeight: 15 },
        { policyId: '6', defaultTarget: 95, defaultWeight: 10 },
        { policyId: '5', defaultTarget: 100, defaultWeight: 5 },
      ],
    },
    {
      id: 'tpl-leader',
      name: 'Manager / Leader',
      description: 'KPI leadership-heavy: kepemimpinan + delivery + pembelajaran tim.',
      scope: 'all',
      items: [
        { policyId: '7', defaultTarget: 4, defaultWeight: 30 },
        { policyId: '4', defaultTarget: 95, defaultWeight: 25 },
        { policyId: '3', defaultTarget: 90, defaultWeight: 20 },
        { policyId: '2', defaultTarget: 90, defaultWeight: 15 },
        { policyId: '5', defaultTarget: 100, defaultWeight: 10 },
      ],
    },
  ])

  function addTemplate(payload: Omit<KpiTemplate, 'id'>): string {
    const id = `tpl-${Date.now()}`
    templates.value.push({ ...payload, id })
    return id
  }
  function updateTemplate(id: string, updates: Partial<Omit<KpiTemplate, 'id'>>): boolean {
    const i = templates.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    templates.value[i] = { ...templates.value[i], ...updates }
    return true
  }
  function deleteTemplate(id: string): boolean {
    const i = templates.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    templates.value.splice(i, 1)
    return true
  }
  function getTemplateById(id: string) {
    return templates.value.find((t) => t.id === id)
  }

  // -------------------- CASCADE OBJECTIVES --------------------
  const cascadeObjectives = ref<CascadeObjective[]>([
    { id: 'co-company-1', label: 'Revenue Growth +20% YoY', description: 'Target revenue tahun ini naik 20%.', level: 'company' },
    { id: 'co-company-2', label: 'NPS ≥ 70', description: 'Customer satisfaction score minimum 70.', level: 'company' },
    { id: 'co-dept-eng', label: 'Engineering — On-time release 95%', level: 'department', parentId: 'co-company-1' },
    { id: 'co-dept-sales', label: 'Sales — Pipeline coverage 3x', level: 'department', parentId: 'co-company-1' },
    { id: 'co-dept-cs', label: 'Customer Success — CSAT 85%', level: 'department', parentId: 'co-company-2' },
  ])

  function addCascadeObjective(payload: Omit<CascadeObjective, 'id'>) {
    const id = `co-${Date.now()}`
    cascadeObjectives.value.push({ ...payload, id })
    return id
  }
  function getCascadeById(id: string) {
    return cascadeObjectives.value.find((c) => c.id === id)
  }

  // -------------------- BULK / TEAM ASSIGNMENT --------------------
  /**
   * Bulk-assign KPI ke beberapa karyawan sekaligus.
   * payload: list employee + list (policyId, target, weight) + period.
   * Akan replace assignments lama (employeeId+policyId+period) jika ada.
   */
  function bulkAssign(payload: {
    employeeIds: string[]
    period: string
    items: { policyId: string; target: number; weight: number; cascadedFromId?: string; achievementThreshold?: number }[]
    assignedBy?: string
    approvalStatus?: KpiApprovalStatus
    cascadedFromId?: string
    cascadedFromLabel?: string
  }): { created: number; replaced: number } {
    let created = 0
    let replaced = 0
    const today = new Date().toISOString().slice(0, 10)
    for (const empId of payload.employeeIds) {
      for (const item of payload.items) {
        const existingIdx = assignments.value.findIndex(
          (a) => a.employeeId === empId && a.policyId === item.policyId && a.period === payload.period,
        )
        const cascade = item.cascadedFromId ?? payload.cascadedFromId
        const cascadeLabel = cascade ? (getCascadeById(cascade)?.label ?? payload.cascadedFromLabel) : undefined
        if (existingIdx !== -1) {
          assignments.value[existingIdx] = {
            ...assignments.value[existingIdx],
            target: item.target,
            weight: item.weight,
            achievementThreshold: item.achievementThreshold ?? assignments.value[existingIdx].achievementThreshold,
            assignedBy: payload.assignedBy,
            assignedAt: today,
            approvalStatus: payload.approvalStatus ?? 'draft',
            cascadedFromId: cascade,
            cascadedFromLabel: cascadeLabel,
          }
          replaced++
        } else {
          assignments.value.push({
            id: `a-${Date.now()}-${empId}-${item.policyId}-${Math.random().toString(36).slice(2, 5)}`,
            policyId: item.policyId,
            employeeId: empId,
            period: payload.period,
            target: item.target,
            actual: 0,
            weight: item.weight,
            achievementThreshold: item.achievementThreshold,
            status: 'draft',
            approvalStatus: payload.approvalStatus ?? 'draft',
            assignedBy: payload.assignedBy,
            assignedAt: today,
            cascadedFromId: cascade,
            cascadedFromLabel: cascadeLabel,
            smart: { specific: true, measurable: true, achievable: true, relevant: true, timeBound: true },
            checkIns: [],
          })
          created++
        }
      }
    }
    return { created, replaced }
  }

  /** Copy assignment dari periode sumber ke periode target untuk employee tertentu (target reset, actual=0). */
  function copyFromPeriod(employeeIds: string[], sourcePeriod: string, targetPeriod: string, assignedBy?: string): number {
    const today = new Date().toISOString().slice(0, 10)
    let count = 0
    for (const empId of employeeIds) {
      const sourceList = assignments.value.filter((a) => a.employeeId === empId && a.period === sourcePeriod)
      for (const src of sourceList) {
        const exists = assignments.value.some((a) => a.employeeId === empId && a.policyId === src.policyId && a.period === targetPeriod)
        if (exists) continue
        assignments.value.push({
          ...src,
          id: `a-${Date.now()}-${empId}-${src.policyId}-${Math.random().toString(36).slice(2, 5)}`,
          period: targetPeriod,
          actual: 0,
          status: 'draft',
          approvalStatus: 'draft',
          assignedBy,
          assignedAt: today,
          checkIns: [],
        })
        count++
      }
    }
    return count
  }

  /** Distribusikan bobot rata pada array items (return sum 100). */
  function distributeWeightsEvenly(itemCount: number): number[] {
    if (itemCount === 0) return []
    const base = Math.floor(100 / itemCount)
    const remainder = 100 - base * itemCount
    return Array.from({ length: itemCount }, (_, i) => base + (i < remainder ? 1 : 0))
  }

  /** Tambah check-in ke assignment tertentu */
  function addCheckIn(assignmentId: string, payload: Omit<KpiCheckIn, 'id'>) {
    const a = getAssignmentById(assignmentId)
    if (!a) return
    if (!a.checkIns) a.checkIns = []
    a.checkIns.push({ ...payload, id: `ci-${Date.now()}` })
    a.actual = payload.progress
  }

  /** Update approval status assignment (manager → HR → approved) */
  function setApproval(assignmentIds: string[], status: KpiApprovalStatus) {
    for (const id of assignmentIds) updateAssignment(id, { approvalStatus: status })
  }

  /** Get team assignments for a manager: cari karyawan yang directSupervisorId === managerId */
  function getTeamAssignmentsByPeriod(_managerId: string, period: string): KpiAssignment[] {
    return assignments.value.filter((a) => a.period === period)
  }

  return {
    policies,
    assignments,
    templates,
    cascadeObjectives,
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
    getPoliciesApplicableToDepartment,
    addPolicy,
    updatePolicy,
    deletePolicy,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    addCascadeObjective,
    getCascadeById,
    bulkAssign,
    copyFromPeriod,
    distributeWeightsEvenly,
    addCheckIn,
    setApproval,
    getTeamAssignmentsByPeriod,
  }
})
