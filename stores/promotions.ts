import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type PromotionStatus = 'draft' | 'submitted' | 'under_assessment' | 'passed' | 'failed'

export interface PromotionDocument {
  id: string
  name: string
  fileName?: string
  fileData?: string
  uploadedAt: string
}

/** Satu kriteria penilaian (e.g. Technical Skill, Leadership) */
export interface AssessmentCriterion {
  id: string
  name: string
  score: number
  maxScore: number
  weight?: number
}

export interface PromotionAssessment {
  criteria: AssessmentCriterion[]
  testScore?: number
  testMaxScore?: number
  passThreshold?: number
  assessedAt?: string
  assessedById?: string
  notes?: string
}

/** Rekomendasi AI saat karyawan tidak lulus assessment */
export interface PromotionAIRecommendation {
  summary: string
  recommendedTraining: {
    moduleId: string
    moduleTitle: string
    reason: string
    skillsCovered: string[]
  }[]
}

export interface Promotion {
  id: string
  employeeId: string
  fromPosition: string
  toPosition: string
  fromDepartment?: string
  toDepartment?: string
  fromDivision?: string
  toDivision?: string
  /** Tanggal pengajuan / requested date */
  requestedAt: string
  /** Tanggal efektif promosi (diisi setelah lulus) */
  promotionDate?: string
  notes?: string
  promotedById?: string
  documents?: PromotionDocument[]
  status: PromotionStatus
  assessment?: PromotionAssessment
  aiRecommendation?: PromotionAIRecommendation
}

/** Kriteria assessment default untuk kenaikan posisi */
export const DEFAULT_ASSESSMENT_CRITERIA: Omit<AssessmentCriterion, 'score'>[] = [
  { id: 'tech', name: 'Technical / Job competency', maxScore: 5, weight: 30 },
  { id: 'leadership', name: 'Leadership & communication', maxScore: 5, weight: 25 },
  { id: 'performance', name: 'Performance & results', maxScore: 5, weight: 25 },
  { id: 'readiness', name: 'Role readiness', maxScore: 5, weight: 20 },
]

export const usePromotionsStore = defineStore('promotions', () => {
  const records = ref<Promotion[]>([
    {
      id: '1',
      employeeId: '1',
      fromPosition: 'Software Engineer',
      toPosition: 'Senior Software Engineer',
      fromDepartment: 'Engineering',
      toDepartment: 'Engineering',
      requestedAt: '2024-03-10',
      promotionDate: '2024-03-15',
      notes: 'Annual performance review',
      promotedById: '99',
      documents: [{ id: 'd1', name: 'Surat Promosi', uploadedAt: '2024-03-14' }],
      status: 'passed',
    },
    {
      id: '2',
      employeeId: '2',
      fromPosition: 'HR Specialist',
      toPosition: 'HR Manager',
      fromDepartment: 'Human Resources',
      toDepartment: 'Human Resources',
      requestedAt: '2023-08-25',
      promotionDate: '2023-09-01',
      promotedById: '99',
      status: 'passed',
    },
    {
      id: '3',
      employeeId: '1',
      fromPosition: 'Senior Software Engineer',
      toPosition: 'Tech Lead',
      fromDepartment: 'Engineering',
      toDepartment: 'Engineering',
      requestedAt: new Date().toISOString().slice(0, 10),
      notes: 'Request for tech lead role',
      status: 'submitted',
    },
  ])

  const employeeFilter = ref('')
  const dateFilter = ref('')
  const statusFilter = ref<PromotionStatus | ''>('')

  const filteredRecords = computed(() => {
    let result = records.value
    if (employeeFilter.value) {
      result = result.filter((r) => r.employeeId === employeeFilter.value)
    }
    if (dateFilter.value) {
      result = result.filter((r) => r.requestedAt === dateFilter.value)
    }
    if (statusFilter.value) {
      result = result.filter((r) => r.status === statusFilter.value)
    }
    return result.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  })

  const stats = computed(() => ({
    total: records.value.length,
  }))

  function addPromotion(payload: Omit<Promotion, 'id'>): string {
    const id = String(Date.now())
    records.value.push({ ...payload, id })
    return id
  }

  /** Submit promotion request (draft → submitted) */
  function submitRequest(id: string): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1 || records.value[i].status !== 'draft') return false
    records.value[i].status = 'submitted'
    return true
  }

  /**
   * Evaluate assessment: hitung lulus/tidak, jika tidak lulus generate rekomendasi AI (mock).
   * Requires useLmsStore for recommended modules.
   */
  function evaluateAssessment(
    id: string,
    assessment: PromotionAssessment,
    lmsModuleIds: { id: string; title: string; category: string }[]
  ): { passed: boolean; aiRecommendation?: PromotionAIRecommendation } {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return { passed: false }

    const threshold = assessment.passThreshold ?? 70
    const criteriaTotal = assessment.criteria.reduce((sum, c) => sum + (c.score / c.maxScore) * 100, 0)
    const criteriaAvg = assessment.criteria.length ? criteriaTotal / assessment.criteria.length : 0
    const testScore = assessment.testMaxScore && assessment.testScore != null
      ? (assessment.testScore / assessment.testMaxScore) * 100
      : criteriaAvg
    const combined = assessment.testMaxScore != null ? (criteriaAvg * 0.6 + testScore * 0.4) : criteriaAvg
    const passed = combined >= threshold

    const promo = records.value[i]
    records.value[i].assessment = {
      ...assessment,
      assessedAt: new Date().toISOString().slice(0, 10),
    }
    records.value[i].status = passed ? 'passed' : 'failed'
    if (passed) {
      records.value[i].promotionDate = new Date().toISOString().slice(0, 10)
      records.value[i].aiRecommendation = undefined
      return { passed: true }
    }

    // Mock AI: recommend LMS modules by category (e.g. Leadership for manager roles)
    const targetRole = promo.toPosition.toLowerCase()
    const recommended = lmsModuleIds
      .filter((m) => {
        if (targetRole.includes('lead') || targetRole.includes('manager')) return m.category === 'Soft Skills' || m.title.includes('Leadership')
        if (targetRole.includes('tech') || targetRole.includes('engineer')) return m.category === 'Technical' || m.category === 'Onboarding'
        return true
      })
      .slice(0, 3)
      .map((m) => ({
        moduleId: m.id,
        moduleTitle: m.title,
        reason: `Recommended to build skills required for ${promo.toPosition}`,
        skillsCovered: [m.category],
      }))

    const aiRecommendation: PromotionAIRecommendation = {
      summary: `To qualify for ${promo.toPosition}, complete the recommended training below to strengthen the required competencies.`,
      recommendedTraining: recommended.length ? recommended : lmsModuleIds.slice(0, 2).map((m) => ({
        moduleId: m.id,
        moduleTitle: m.title,
        reason: 'General skill development',
        skillsCovered: [m.category],
      })),
    }
    records.value[i].aiRecommendation = aiRecommendation
    return { passed: false, aiRecommendation }
  }

  function updatePromotion(id: string, updates: Partial<Omit<Promotion, 'id'>>): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value[i] = { ...records.value[i], ...updates }
    return true
  }

  function deletePromotion(id: string): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value.splice(i, 1)
    return true
  }

  function getPromotionById(id: string): Promotion | undefined {
    return records.value.find((r) => r.id === id)
  }

  function getPromotionsByEmployeeId(employeeId: string): Promotion[] {
    return records.value
      .filter((r) => r.employeeId === employeeId)
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
  }

  return {
    records,
    filteredRecords,
    stats,
    employeeFilter,
    dateFilter,
    statusFilter,
    addPromotion,
    submitRequest,
    evaluateAssessment,
    updatePromotion,
    deletePromotion,
    getPromotionById,
    getPromotionsByEmployeeId,
  }
})
