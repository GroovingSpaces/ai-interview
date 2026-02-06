import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface PromotionDocument {
  id: string
  name: string
  fileName?: string
  fileData?: string
  uploadedAt: string
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
  promotionDate: string
  notes?: string
  /** Atasan / orang yang mempromosikan */
  promotedById?: string
  documents?: PromotionDocument[]
}

export const usePromotionsStore = defineStore('promotions', () => {
  const records = ref<Promotion[]>([
    {
      id: '1',
      employeeId: '1',
      fromPosition: 'Software Engineer',
      toPosition: 'Senior Software Engineer',
      fromDepartment: 'Engineering',
      toDepartment: 'Engineering',
      promotionDate: '2024-03-15',
      notes: 'Annual performance review',
      promotedById: '99',
      documents: [{ id: 'd1', name: 'Surat Promosi', uploadedAt: '2024-03-14' }],
    },
    {
      id: '2',
      employeeId: '2',
      fromPosition: 'HR Specialist',
      toPosition: 'HR Manager',
      fromDepartment: 'Human Resources',
      toDepartment: 'Human Resources',
      promotionDate: '2023-09-01',
      promotedById: '99',
    },
  ])

  const employeeFilter = ref('')
  const dateFilter = ref('')

  const filteredRecords = computed(() => {
    let result = records.value
    if (employeeFilter.value) {
      result = result.filter((r) => r.employeeId === employeeFilter.value)
    }
    if (dateFilter.value) {
      result = result.filter((r) => r.promotionDate === dateFilter.value)
    }
    return result.sort((a, b) => b.promotionDate.localeCompare(a.promotionDate))
  })

  const stats = computed(() => ({
    total: records.value.length,
  }))

  function addPromotion(payload: Omit<Promotion, 'id'>): string {
    const id = String(Date.now())
    records.value.push({ ...payload, id })
    return id
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
      .sort((a, b) => a.promotionDate.localeCompare(b.promotionDate))
  }

  return {
    records,
    filteredRecords,
    stats,
    employeeFilter,
    dateFilter,
    addPromotion,
    updatePromotion,
    deletePromotion,
    getPromotionById,
    getPromotionsByEmployeeId,
  }
})
