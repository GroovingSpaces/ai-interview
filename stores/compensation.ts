import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Payslip {
  id: string
  employeeId: string
  period: string
  baseSalary: number
  positionalAllowance: number
  transportAllowance: number
  mealAllowance: number
  overtimePay: number
  bonus: number
  bpjsKesehatan: number
  bpjsKetenagakerjaan: number
  pph21: number
  otherDeductions: number
  grossIncome: number
  totalDeductions: number
  netSalary: number
  status: 'draft' | 'finalized' | 'paid'
}

export interface BenefitItem {
  id: string
  name: string
  category: 'Kesehatan' | 'Transport' | 'Meal' | 'Komunikasi' | 'Asuransi' | 'Lainnya'
  description?: string
  amount: number
  recurrence: 'monthly' | 'yearly' | 'one_time'
  eligibleRoles: string[]
  active: boolean
}

export type BonusType = 'kpi_bonus' | 'project' | 'thr' | 'incentive' | 'spot' | 'lainnya'
export type BonusStatus = 'draft' | 'submitted' | 'approved' | 'paid'

export interface BonusIncentive {
  id: string
  employeeId: string
  type: BonusType
  amount: number
  period: string
  reason?: string
  status: BonusStatus
  approvedBy?: string
  approvedAt?: string
}

export type AdjustmentReason = 'merit' | 'promotion' | 'market_adjust' | 'cost_of_living' | 'lainnya'

export interface CompAdjustment {
  id: string
  employeeId: string
  effectiveDate: string
  oldSalary: number
  newSalary: number
  reason: AdjustmentReason
  notes?: string
  approvedBy?: string
}

export interface PayrollRun {
  id: string
  period: string
  runAt: string
  totalEmployees: number
  totalGross: number
  totalNet: number
  status: 'draft' | 'finalized' | 'paid'
}

export const useCompensationStore = defineStore('compensation', () => {
  const payslips = ref<Payslip[]>([
    {
      id: '1',
      employeeId: '1',
      period: '2026-03',
      baseSalary: 15000000,
      positionalAllowance: 2500000,
      transportAllowance: 1000000,
      mealAllowance: 500000,
      overtimePay: 600000,
      bonus: 0,
      bpjsKesehatan: 150000,
      bpjsKetenagakerjaan: 200000,
      pph21: 720000,
      otherDeductions: 0,
      grossIncome: 19600000,
      totalDeductions: 1070000,
      netSalary: 18530000,
      status: 'paid',
    },
  ])

  const benefits = ref<BenefitItem[]>([
    { id: '1', name: 'Asuransi Kesehatan Premium', category: 'Asuransi', amount: 800000, recurrence: 'monthly', eligibleRoles: ['manager', 'c_level'], active: true, description: 'Coverage karyawan + keluarga' },
    { id: '2', name: 'Tunjangan Komunikasi', category: 'Komunikasi', amount: 200000, recurrence: 'monthly', eligibleRoles: [], active: true },
    { id: '3', name: 'Tunjangan Makan Harian', category: 'Meal', amount: 35000, recurrence: 'monthly', eligibleRoles: [], active: true },
    { id: '4', name: 'Bonus Tahunan / THR', category: 'Lainnya', amount: 15000000, recurrence: 'yearly', eligibleRoles: [], active: true },
  ])

  const bonuses = ref<BonusIncentive[]>([
    { id: '1', employeeId: '1', type: 'kpi_bonus', amount: 5000000, period: '2026-Q1', reason: 'KPI achievement >100%', status: 'paid', approvedBy: '99', approvedAt: '2026-04-05' },
    { id: '2', employeeId: '2', type: 'thr', amount: 8000000, period: '2026-04', reason: 'THR Lebaran 2026', status: 'approved', approvedBy: '99' },
  ])

  const adjustments = ref<CompAdjustment[]>([
    { id: '1', employeeId: '1', effectiveDate: '2026-01-01', oldSalary: 13500000, newSalary: 15000000, reason: 'merit', notes: 'Annual increment', approvedBy: '99' },
  ])

  const payrollRuns = ref<PayrollRun[]>([
    { id: '1', period: '2026-03', runAt: '2026-03-25', totalEmployees: 5, totalGross: 78000000, totalNet: 71500000, status: 'paid' },
    { id: '2', period: '2026-04', runAt: '2026-04-25', totalEmployees: 5, totalGross: 78500000, totalNet: 72000000, status: 'finalized' },
  ])

  function addBenefit(payload: Omit<BenefitItem, 'id'>) {
    const id = String(Date.now())
    benefits.value.push({ ...payload, id })
    return id
  }
  function updateBenefit(id: string, updates: Partial<Omit<BenefitItem, 'id'>>) {
    const i = benefits.value.findIndex((b) => b.id === id)
    if (i === -1) return false
    benefits.value[i] = { ...benefits.value[i], ...updates }
    return true
  }
  function deleteBenefit(id: string) {
    const i = benefits.value.findIndex((b) => b.id === id)
    if (i === -1) return false
    benefits.value.splice(i, 1)
    return true
  }

  function addBonus(payload: Omit<BonusIncentive, 'id'>) {
    const id = String(Date.now())
    bonuses.value.push({ ...payload, id })
    return id
  }
  function updateBonus(id: string, updates: Partial<Omit<BonusIncentive, 'id'>>) {
    const i = bonuses.value.findIndex((b) => b.id === id)
    if (i === -1) return false
    bonuses.value[i] = { ...bonuses.value[i], ...updates }
    return true
  }
  function deleteBonus(id: string) {
    const i = bonuses.value.findIndex((b) => b.id === id)
    if (i === -1) return false
    bonuses.value.splice(i, 1)
    return true
  }

  function addAdjustment(payload: Omit<CompAdjustment, 'id'>) {
    const id = String(Date.now())
    adjustments.value.push({ ...payload, id })
    return id
  }
  function updateAdjustment(id: string, updates: Partial<Omit<CompAdjustment, 'id'>>) {
    const i = adjustments.value.findIndex((a) => a.id === id)
    if (i === -1) return false
    adjustments.value[i] = { ...adjustments.value[i], ...updates }
    return true
  }
  function deleteAdjustment(id: string) {
    const i = adjustments.value.findIndex((a) => a.id === id)
    if (i === -1) return false
    adjustments.value.splice(i, 1)
    return true
  }

  function runPayroll(period: string) {
    const id = String(Date.now())
    payrollRuns.value.push({
      id,
      period,
      runAt: new Date().toISOString().slice(0, 10),
      totalEmployees: payslips.value.filter((p) => p.period === period).length,
      totalGross: payslips.value.filter((p) => p.period === period).reduce((s, p) => s + p.grossIncome, 0),
      totalNet: payslips.value.filter((p) => p.period === period).reduce((s, p) => s + p.netSalary, 0),
      status: 'finalized',
    })
    return id
  }

  return {
    payslips,
    benefits,
    bonuses,
    adjustments,
    payrollRuns,
    addBenefit,
    updateBenefit,
    deleteBenefit,
    addBonus,
    updateBonus,
    deleteBonus,
    addAdjustment,
    updateAdjustment,
    deleteAdjustment,
    runPayroll,
  }
})
