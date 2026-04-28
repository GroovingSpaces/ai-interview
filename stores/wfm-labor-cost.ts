import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface LaborBudget {
  id: string
  departmentId: string
  year: number
  month: number
  budgetAmount: number
  currency: string
  notes?: string
}

export interface LaborActual {
  id: string
  departmentId: string
  year: number
  month: number
  actualAmount: number
  currency: string
  /** Payroll run or manual entry */
  source?: string
}

export const useWfmLaborCostStore = defineStore('wfm-labor-cost', () => {
  const budgets = ref<LaborBudget[]>([
    { id: 'lb1', departmentId: '1', year: 2026, month: 2, budgetAmount: 150_000_000, currency: 'IDR' },
    { id: 'lb2', departmentId: '2', year: 2026, month: 2, budgetAmount: 80_000_000, currency: 'IDR' },
  ])

  const actuals = ref<LaborActual[]>([
    { id: 'la1', departmentId: '1', year: 2026, month: 1, actualAmount: 148_500_000, currency: 'IDR', source: 'payroll' },
    { id: 'la2', departmentId: '2', year: 2026, month: 1, actualAmount: 79_200_000, currency: 'IDR', source: 'payroll' },
  ])

  const yearFilter = ref(new Date().getFullYear())
  const monthFilter = ref<number | 'all'>(new Date().getMonth() + 1)

  const varianceByDept = computed(() => {
    const result: { departmentId: string; budget: number; actual: number; variance: number; variancePct: number }[] = []
    const year = yearFilter.value
    const month = monthFilter.value
    const budgetMap = new Map<string, number>()
    const actualMap = new Map<string, number>()
    for (const b of budgets.value) {
      if (b.year !== year) continue
      if (month !== 'all' && b.month !== month) continue
      const key = b.departmentId
      budgetMap.set(key, (budgetMap.get(key) ?? 0) + b.budgetAmount)
    }
    for (const a of actuals.value) {
      if (a.year !== year) continue
      if (month !== 'all' && a.month !== month) continue
      const key = a.departmentId
      actualMap.set(key, (actualMap.get(key) ?? 0) + a.actualAmount)
    }
    const deptIds = new Set([...budgetMap.keys(), ...actualMap.keys()])
    for (const did of deptIds) {
      const budget = budgetMap.get(did) ?? 0
      const actual = actualMap.get(did) ?? 0
      const variance = actual - budget
      const variancePct = budget ? (variance / budget) * 100 : 0
      result.push({ departmentId: did, budget, actual, variance, variancePct })
    }
    return result
  })

  function getBudget(departmentId: string, year: number, month: number): LaborBudget | undefined {
    return budgets.value.find(
      (b) => b.departmentId === departmentId && b.year === year && b.month === month
    )
  }

  function getActual(departmentId: string, year: number, month: number): LaborActual | undefined {
    return actuals.value.find(
      (a) => a.departmentId === departmentId && a.year === year && a.month === month
    )
  }

  function setBudget(payload: Omit<LaborBudget, 'id'>): string {
    const existing = budgets.value.find(
      (b) =>
        b.departmentId === payload.departmentId &&
        b.year === payload.year &&
        b.month === payload.month
    )
    if (existing) {
      existing.budgetAmount = payload.budgetAmount
      existing.notes = payload.notes
      return existing.id
    }
    const id = `lb-${Date.now()}`
    budgets.value.push({ ...payload, id })
    return id
  }

  function setActual(payload: Omit<LaborActual, 'id'>): string {
    const existing = actuals.value.find(
      (a) =>
        a.departmentId === payload.departmentId &&
        a.year === payload.year &&
        a.month === payload.month
    )
    if (existing) {
      existing.actualAmount = payload.actualAmount
      existing.source = payload.source
      return existing.id
    }
    const id = `la-${Date.now()}`
    actuals.value.push({ ...payload, id })
    return id
  }

  return {
    budgets,
    actuals,
    yearFilter,
    monthFilter,
    varianceByDept,
    getBudget,
    getActual,
    setBudget,
    setActual,
  }
})
