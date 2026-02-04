import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** Komponen gaji (Initial Payroll): tunjangan atau potongan yang didefinisikan di awal */
export interface SalaryComponent {
  id: string
  type: 'allowance' | 'deduction'
  name: string
  code: string
  /** Nilai tetap (rupiah) */
  defaultAmount?: number
  /** Atau persen dari gaji pokok (0-100) */
  percentageOfBase?: number
  description?: string
}

/** Satu item tunjangan (repeater) - standar regulasi Indonesia */
export interface AllowanceItem {
  id: string
  name: string
  amount: number
}

export interface Payroll {
  id: string
  employeeId: string
  periodMonth: number
  periodYear: number
  /** Gaji pokok */
  baseSalary: number
  /** Tunjangan (repeater: nama + nominal) */
  allowances: AllowanceItem[]
  /** Penghasilan bruto = gaji pokok + total tunjangan */
  grossIncome: number
  /** Potongan BPJS Ketenagakerjaan (JHT 2%, JKK, JKM, dll) */
  bpjsTk: number
  /** Potongan BPJS Kesehatan */
  bpjsKesehatan: number
  /** Potongan lain-lain */
  otherDeductions: number
  /** Total potongan = bpjsTk + bpjsKesehatan + otherDeductions */
  totalDeductions: number
  /** Penghasilan kena pajak (untuk perhitungan PPh 21) */
  taxableIncome: number
  /** PPh 21 (perpajakan) */
  pph21: number
  /** Take home pay = grossIncome - totalDeductions - pph21 */
  netPay: number
  status: 'draft' | 'processed' | 'paid'
  paidAt?: string
  notes?: string
  /** Status PTKP untuk perhitungan PPh 21 (TK/0, K/1, dll.) */
  ptkpStatus?: string
}

function sumAllowances(items: AllowanceItem[]): number {
  return items.reduce((s, a) => s + (a.amount || 0), 0)
}

const DEFAULT_BASE_SALARY = 10_000_000

/** Regulasi Indonesia: batas upah untuk iuran BPJS Kesehatan (Perpres 64/2020) */
const BPJS_KES_MAX_BASE = 12_000_000
/** PTKP TK/0 per bulan (54 juta / 12) */
const PTKP_MONTHLY = 4_500_000
/** Biaya jabatan 5% dari bruto, max 6 juta/tahun = 500 rb/bulan */
const BIAYA_JABATAN_RATE = 0.05
const BIAYA_JABATAN_MAX_MONTHLY = 500_000

/** Tarif PPh 21 progresif UU HPP (lapis bulanan, setara tahunan 60jt/250jt/500jt/5M) */
function hitungPPh21Bulanan(pkpBulanan: number): number {
  if (pkpBulanan <= 0) return 0
  const lapis = [
    { limit: 5_000_000, rate: 0.05 },       // 0 - 60jt/tahun
    { limit: 20_833_333, rate: 0.15 },     // 60 - 250jt
    { limit: 41_666_667, rate: 0.25 },    // 250 - 500jt
    { limit: 416_666_667, rate: 0.3 },     // 500jt - 5M
    { limit: Infinity, rate: 0.35 },
  ]
  let tax = 0
  let remaining = pkpBulanan
  let prevLimit = 0
  for (const layer of lapis) {
    const layerWidth = Math.min(remaining, layer.limit - prevLimit)
    if (layerWidth > 0) tax += layerWidth * layer.rate
    remaining -= layerWidth
    prevLimit = layer.limit
    if (remaining <= 0) break
  }
  return Math.round(tax)
}

export const usePayrollStore = defineStore('payroll', () => {
  // —— Initial Payroll: komponen umum (BPJS & Pajak sesuai regulasi Indonesia) ——
  // BPJS TK: iuran peserta JHT 2% + JP 1% (UU No. 11/2020). JKK & JKM ditanggung perusahaan.
  // BPJS Kes: iuran peserta 1% (Perpres 64/2020), batas max Rp 12 juta.
  // PPh 21: dihitung di runGenerate (tarif progresif UU HPP, PTKP, biaya jabatan 5%).
  const salaryComponents = ref<SalaryComponent[]>([
    { id: 'sc3', type: 'deduction', name: 'BPJS Ketenagakerjaan', code: 'BPJS-TK', percentageOfBase: 3, description: 'JHT 2% + JP 1% (iuran peserta, UU No. 11/2020). JKK & JKM ditanggung perusahaan.' },
    { id: 'sc4', type: 'deduction', name: 'BPJS Kesehatan', code: 'BPJS-KES', percentageOfBase: 1, description: '1% iuran peserta (Perpres 64/2020). Batas perhitungan max Rp 12 juta.' },
    { id: 'sc5', type: 'deduction', name: 'PPh 21', code: 'PPH21', percentageOfBase: 0, description: 'Dihitung otomatis: tarif progresif UU HPP, PTKP TK/0 Rp 4,5 jt/bulan, biaya jabatan 5% max Rp 500 rb.' },
  ])

  const deductionComponents = computed(() =>
    salaryComponents.value.filter((c) => c.type === 'deduction')
  )

  // —— Gaji & tunjangan per karyawan (di-set per orang) ——
  const employeeSalaryConfig = ref<Record<string, { baseSalary?: number; allowances: AllowanceItem[] }>>({})

  function getEmployeeSalaryConfig(employeeId: string): { baseSalary?: number; allowances: AllowanceItem[] } {
    const c = employeeSalaryConfig.value[employeeId]
    return c ? { baseSalary: c.baseSalary, allowances: [...c.allowances] } : { allowances: [] }
  }

  function setEmployeeSalaryConfig(
    employeeId: string,
    config: { baseSalary?: number; allowances: AllowanceItem[] }
  ): void {
    employeeSalaryConfig.value[employeeId] = {
      baseSalary: config.baseSalary,
      allowances: config.allowances.map((a) => ({ id: a.id, name: a.name, amount: a.amount })),
    }
  }

  function addSalaryComponent(payload: Omit<SalaryComponent, 'id'>): string {
    const id = `sc${Date.now()}`
    salaryComponents.value.push({ ...payload, id })
    return id
  }

  function updateSalaryComponent(id: string, updates: Partial<Omit<SalaryComponent, 'id'>>): boolean {
    const i = salaryComponents.value.findIndex((c) => c.id === id)
    if (i === -1) return false
    salaryComponents.value[i] = { ...salaryComponents.value[i], ...updates }
    return true
  }

  function deleteSalaryComponent(id: string): boolean {
    const i = salaryComponents.value.findIndex((c) => c.id === id)
    if (i === -1) return false
    salaryComponents.value.splice(i, 1)
    return true
  }

  function getSalaryComponentById(id: string): SalaryComponent | undefined {
    return salaryComponents.value.find((c) => c.id === id)
  }

  // —— Cut-off penggajian: tanggal tiap bulan (misal 20 = setiap tanggal 20). Periode = 21 bulan lalu s/d tanggal cut-off bulan berjalan. ——
  const cutOffDay = ref<number>(20)

  function setPayrollCutOffDay(day: number) {
    const d = Math.min(31, Math.max(1, Math.floor(day)))
    cutOffDay.value = d
  }

  // —— Payroll records (Generate Payroll) ——
  const records = ref<Payroll[]>([
    {
      id: '1',
      employeeId: '1',
      periodMonth: 2,
      periodYear: 2025,
      baseSalary: 15000000,
      allowances: [
        { id: 'a1', name: 'Tunjangan Jabatan', amount: 2000000 },
        { id: 'a2', name: 'Tunjangan Transport', amount: 500000 },
      ],
      grossIncome: 17500000,
      bpjsTk: 300000,
      bpjsKesehatan: 175000,
      otherDeductions: 0,
      totalDeductions: 475000,
      taxableIncome: 16612500,
      pph21: 524250,
      netPay: 16509750,
      status: 'paid',
      paidAt: '2025-02-28',
    },
  ])

  const employeeFilter = ref('')
  const periodFilter = ref('')

  const filteredRecords = computed(() => {
    let result = records.value
    if (employeeFilter.value) {
      result = result.filter((r) => r.employeeId === employeeFilter.value)
    }
    if (periodFilter.value) {
      const [year, month] = periodFilter.value.split('-').map(Number)
      result = result.filter((r) => r.periodYear === year && r.periodMonth === month)
    }
    return result.sort((a, b) => {
      if (a.periodYear !== b.periodYear) return b.periodYear - a.periodYear
      return b.periodMonth - a.periodMonth
    })
  })

  const stats = computed(() => ({
    total: records.value.length,
    totalNet: records.value.reduce((sum, r) => sum + r.netPay, 0),
  }))

  /** Daftar periode (month-year) yang sudah ada payroll-nya */
  const generatedPeriods = computed(() => {
    const set = new Set<string>()
    records.value.forEach((r) => set.add(`${r.periodYear}-${r.periodMonth}`))
    return Array.from(set).sort().reverse()
  })

  function hasPayrollForPeriod(month: number, year: number): boolean {
    return records.value.some((r) => r.periodMonth === month && r.periodYear === year)
  }

  function addPayroll(payload: Omit<Payroll, 'id'>): string {
    const id = String(Date.now())
    records.value.push({ ...payload, id })
    return id
  }

  function updatePayroll(id: string, updates: Partial<Omit<Payroll, 'id'>>): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value[i] = { ...records.value[i], ...updates }
    return true
  }

  function deletePayroll(id: string): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value.splice(i, 1)
    return true
  }

  function getPayrollById(id: string): Payroll | undefined {
    return records.value.find((r) => r.id === id)
  }

  function getPayrollsByEmployeeId(employeeId: string): Payroll[] {
    return records.value
      .filter((r) => r.employeeId === employeeId)
      .sort((a, b) => {
        if (a.periodYear !== b.periodYear) return b.periodYear - a.periodYear
        return b.periodMonth - a.periodMonth
      })
  }

  /** Generate payroll untuk periode. Tunjangan dari config per orang; BPJS & pajak dari komponen umum. */
  function runGeneratePayrollForPeriod(
    month: number,
    year: number,
    activeEmployeeIds: string[],
    getEmployeeBaseSalary: (employeeId: string) => number
  ): number {
    const deductions = deductionComponents.value
    let created = 0
    activeEmployeeIds.forEach((employeeId) => {
      if (records.value.some((r) => r.employeeId === employeeId && r.periodMonth === month && r.periodYear === year)) {
        return
      }
      const config = getEmployeeSalaryConfig(employeeId)
      const baseSalary =
        config.baseSalary ?? getEmployeeBaseSalary(employeeId) ?? DEFAULT_BASE_SALARY
      const allowanceItems: AllowanceItem[] = config.allowances.length
        ? config.allowances
        : []
      const totalAllowance = sumAllowances(allowanceItems)
      const grossIncome = baseSalary + totalAllowance

      let bpjsTk = 0
      let bpjsKesehatan = 0
      let otherDeductions = 0
      deductions.forEach((d) => {
        if (d.code === 'BPJS-TK' || d.name.toLowerCase().includes('ketenagakerjaan')) {
          bpjsTk = d.defaultAmount ?? Math.round((baseSalary * (d.percentageOfBase ?? 0)) / 100)
        } else if (d.code === 'BPJS-KES' || d.name.toLowerCase().includes('kesehatan')) {
          const baseForBpjsKes = Math.min(baseSalary + totalAllowance, BPJS_KES_MAX_BASE)
          bpjsKesehatan = d.defaultAmount ?? Math.round((baseForBpjsKes * (d.percentageOfBase ?? 0)) / 100)
        } else if (d.code === 'PPH21' || d.name.toLowerCase().includes('pph')) {
          // PPh 21 dihitung di bawah (regulasi Indonesia)
        } else {
          otherDeductions += d.defaultAmount ?? Math.round((baseSalary * (d.percentageOfBase ?? 0)) / 100)
        }
      })

      // PPh 21 sesuai regulasi: biaya jabatan 5% max 500rb, PTKP 4,5jt/bulan, tarif progresif UU HPP
      const biayaJabatan = Math.min(Math.round(grossIncome * BIAYA_JABATAN_RATE), BIAYA_JABATAN_MAX_MONTHLY)
      const pkp = Math.max(0, grossIncome - biayaJabatan - bpjsTk - bpjsKesehatan - PTKP_MONTHLY)
      const pph21 = hitungPPh21Bulanan(pkp)

      const totalDeductions = bpjsTk + bpjsKesehatan + otherDeductions
      const taxableIncome = Math.max(0, grossIncome - biayaJabatan - bpjsTk - bpjsKesehatan)
      const netPay = grossIncome - totalDeductions - pph21

      addPayroll({
        employeeId,
        periodMonth: month,
        periodYear: year,
        baseSalary,
        allowances: allowanceItems,
        grossIncome,
        bpjsTk,
        bpjsKesehatan,
        otherDeductions,
        totalDeductions,
        taxableIncome,
        pph21,
        netPay,
        status: 'draft',
      })
      created++
    })
    return created
  }

  return {
    salaryComponents,
    deductionComponents,
    employeeSalaryConfig,
    getEmployeeSalaryConfig,
    setEmployeeSalaryConfig,
    addSalaryComponent,
    updateSalaryComponent,
    deleteSalaryComponent,
    getSalaryComponentById,
    cutOffDay,
    setPayrollCutOffDay,
    records,
    filteredRecords,
    stats,
    generatedPeriods,
    hasPayrollForPeriod,
    employeeFilter,
    periodFilter,
    addPayroll,
    updatePayroll,
    deletePayroll,
    getPayrollById,
    getPayrollsByEmployeeId,
    runGeneratePayrollForPeriod,
    sumAllowances,
  }
})
