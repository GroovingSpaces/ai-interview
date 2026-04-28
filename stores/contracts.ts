import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ContractType = 'PKWT' | 'PKWTT' | 'INTERNSHIP' | 'DAILY_WORKER' | 'FREELANCE'
export type ContractDuration = '3_MONTHS' | '6_MONTHS' | '1_YEAR' | '2_YEARS' | 'PERMANENT'
export type ContractStatus = 'active' | 'expired' | 'terminated' | 'extended' | 'converted'
export type ContractActionType = 'created' | 'extended' | 'terminated' | 'converted'

export interface ContractAction {
  id: string
  type: ContractActionType
  performedAt: string
  performedBy?: string
  reason?: string
  /** Detail dependent on type:
   *  - extended: { newEndDate, newDuration }
   *  - terminated: { terminationDate, severance, reason }
   *  - converted: { effectiveDate, convertedFromContractId }
   */
  details?: Record<string, unknown>
  notes?: string
}

export interface EmployeeContract {
  id: string
  employeeId: string
  contractNumber: string
  type: ContractType
  duration: ContractDuration
  startDate: string
  endDate?: string
  baseSalary: number
  positionAtContract?: string
  departmentAtContract?: string
  status: ContractStatus
  /** If this contract replaced another (extension or conversion) */
  previousContractId?: string
  /** Severance (pesangon) when terminated */
  severance?: number
  terminationDate?: string
  terminationReason?: string
  notes?: string
  createdAt: string
  updatedAt: string
  history: ContractAction[]
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

function endDateFromDuration(start: string, duration: ContractDuration): string | undefined {
  if (duration === 'PERMANENT') return undefined
  const map: Record<Exclude<ContractDuration, 'PERMANENT'>, number> = {
    '3_MONTHS': 3,
    '6_MONTHS': 6,
    '1_YEAR': 12,
    '2_YEARS': 24,
  }
  return addMonths(start, map[duration])
}

export const useContractsStore = defineStore('contracts', () => {
  const contracts = ref<EmployeeContract[]>([
    {
      id: '1',
      employeeId: '1',
      contractNumber: 'CTR-2025-0001',
      type: 'PKWT',
      duration: '1_YEAR',
      startDate: '2025-01-15',
      endDate: '2026-01-14',
      baseSalary: 12000000,
      positionAtContract: 'Software Engineer',
      departmentAtContract: 'Engineering',
      status: 'expired',
      createdAt: '2025-01-10',
      updatedAt: '2026-01-14',
      history: [
        { id: 'a1', type: 'created', performedAt: '2025-01-10', performedBy: '99' },
      ],
    },
    {
      id: '2',
      employeeId: '1',
      contractNumber: 'CTR-2026-0010',
      type: 'PKWT',
      duration: '1_YEAR',
      startDate: '2026-01-15',
      endDate: '2027-01-14',
      baseSalary: 15000000,
      positionAtContract: 'Senior Software Engineer',
      departmentAtContract: 'Engineering',
      status: 'active',
      previousContractId: '1',
      createdAt: '2026-01-10',
      updatedAt: '2026-01-10',
      history: [
        { id: 'a2', type: 'extended', performedAt: '2026-01-10', performedBy: '99', notes: 'Perpanjangan kontrak setelah 1 tahun.', details: { previousContractId: '1' } },
      ],
    },
    {
      id: '3',
      employeeId: '99',
      contractNumber: 'CTR-2020-0001',
      type: 'PKWTT',
      duration: 'PERMANENT',
      startDate: '2020-01-01',
      baseSalary: 25000000,
      positionAtContract: 'System Administrator',
      departmentAtContract: 'IT',
      status: 'active',
      createdAt: '2019-12-20',
      updatedAt: '2019-12-20',
      history: [
        { id: 'a3', type: 'created', performedAt: '2019-12-20', performedBy: '99' },
      ],
    },
    {
      id: '4',
      employeeId: '2',
      contractNumber: 'CTR-2025-0002',
      type: 'PKWT',
      duration: '1_YEAR',
      startDate: '2025-02-01',
      endDate: '2026-01-31',
      baseSalary: 14000000,
      positionAtContract: 'HR Manager',
      departmentAtContract: 'Human Resources',
      status: 'active',
      createdAt: '2025-01-25',
      updatedAt: '2025-01-25',
      history: [
        { id: 'a4', type: 'created', performedAt: '2025-01-25', performedBy: '99' },
      ],
    },
    {
      id: '5',
      employeeId: '3',
      contractNumber: 'CTR-2025-0010',
      type: 'PKWT',
      duration: '3_MONTHS',
      startDate: '2025-01-10',
      endDate: '2025-04-09',
      baseSalary: 8000000,
      positionAtContract: 'Finance Analyst',
      departmentAtContract: 'Finance',
      status: 'active',
      createdAt: '2025-01-05',
      updatedAt: '2025-01-05',
      history: [
        { id: 'a5', type: 'created', performedAt: '2025-01-05', performedBy: '99' },
      ],
    },
  ])

  const employeeFilter = ref('')
  const statusFilter = ref<string>('all')
  const typeFilter = ref<string>('all')

  const statusLabels: Record<ContractStatus, string> = {
    active: 'Aktif',
    expired: 'Kadaluarsa',
    terminated: 'Diterminasi',
    extended: 'Diperpanjang',
    converted: 'Dikonversi',
  }
  const typeLabels: Record<ContractType, string> = {
    PKWT: 'PKWT (Kontrak)',
    PKWTT: 'PKWTT (Permanen)',
    INTERNSHIP: 'Magang',
    DAILY_WORKER: 'Pekerja Harian',
    FREELANCE: 'Freelance',
  }
  const durationLabels: Record<ContractDuration, string> = {
    '3_MONTHS': '3 Bulan',
    '6_MONTHS': '6 Bulan',
    '1_YEAR': '1 Tahun',
    '2_YEARS': '2 Tahun',
    PERMANENT: 'Permanen',
  }

  const filtered = computed(() => {
    let r = contracts.value
    if (employeeFilter.value) r = r.filter((c) => c.employeeId === employeeFilter.value)
    if (statusFilter.value !== 'all') r = r.filter((c) => c.status === statusFilter.value)
    if (typeFilter.value !== 'all') r = r.filter((c) => c.type === typeFilter.value)
    return [...r].sort((a, b) => b.startDate.localeCompare(a.startDate))
  })

  const stats = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      total: contracts.value.length,
      active: contracts.value.filter((c) => c.status === 'active').length,
      expiringSoon: contracts.value.filter((c) => {
        if (c.status !== 'active' || !c.endDate) return false
        const days = (new Date(c.endDate).getTime() - new Date(today).getTime()) / 86400000
        return days >= 0 && days <= 60
      }).length,
      expired: contracts.value.filter((c) => c.status === 'expired').length,
      terminated: contracts.value.filter((c) => c.status === 'terminated').length,
      permanent: contracts.value.filter((c) => c.type === 'PKWTT' && c.status === 'active').length,
    }
  })

  function nextContractNumber(): string {
    const year = new Date().getFullYear()
    const yearCount = contracts.value.filter((c) => c.contractNumber.includes(`CTR-${year}`)).length + 1
    return `CTR-${year}-${String(yearCount).padStart(4, '0')}`
  }

  function genId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  }

  function addContract(payload: Omit<EmployeeContract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt' | 'history' | 'status'> & { status?: ContractStatus; performedBy?: string; reason?: string }): string {
    const id = genId()
    const today = new Date().toISOString().slice(0, 10)
    const status = payload.status ?? 'active'
    const computedEndDate = payload.endDate ?? endDateFromDuration(payload.startDate, payload.duration)
    contracts.value.push({
      id,
      contractNumber: nextContractNumber(),
      employeeId: payload.employeeId,
      type: payload.type,
      duration: payload.duration,
      startDate: payload.startDate,
      endDate: computedEndDate,
      baseSalary: payload.baseSalary,
      positionAtContract: payload.positionAtContract,
      departmentAtContract: payload.departmentAtContract,
      status,
      previousContractId: payload.previousContractId,
      severance: payload.severance,
      notes: payload.notes,
      createdAt: today,
      updatedAt: today,
      history: [
        {
          id: genId('a'),
          type: 'created',
          performedAt: today,
          performedBy: payload.performedBy,
          reason: payload.reason,
        },
      ],
    })
    return id
  }

  function updateContract(id: string, updates: Partial<Omit<EmployeeContract, 'id' | 'history'>>): boolean {
    const i = contracts.value.findIndex((c) => c.id === id)
    if (i === -1) return false
    contracts.value[i] = { ...contracts.value[i], ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
    return true
  }

  function deleteContract(id: string): boolean {
    const i = contracts.value.findIndex((c) => c.id === id)
    if (i === -1) return false
    contracts.value.splice(i, 1)
    return true
  }

  function getContractById(id: string) {
    return contracts.value.find((c) => c.id === id)
  }
  function getContractsByEmployee(employeeId: string) {
    return contracts.value
      .filter((c) => c.employeeId === employeeId)
      .sort((a, b) => b.startDate.localeCompare(a.startDate))
  }
  function getActiveContractByEmployee(employeeId: string) {
    return contracts.value.find((c) => c.employeeId === employeeId && c.status === 'active')
  }

  /**
   * Terminate kontrak: ubah status, simpan terminationDate, severance, dan reason.
   */
  function terminateContract(
    id: string,
    payload: { terminationDate: string; reason: string; severance?: number; performedBy?: string; notes?: string },
  ): boolean {
    const c = getContractById(id)
    if (!c) return false
    c.status = 'terminated'
    c.terminationDate = payload.terminationDate
    c.terminationReason = payload.reason
    c.severance = payload.severance
    c.notes = payload.notes ?? c.notes
    c.updatedAt = new Date().toISOString().slice(0, 10)
    c.history.push({
      id: genId('a'),
      type: 'terminated',
      performedAt: payload.terminationDate,
      performedBy: payload.performedBy,
      reason: payload.reason,
      notes: payload.notes,
      details: { terminationDate: payload.terminationDate, severance: payload.severance },
    })
    return true
  }

  /**
   * Perpanjang kontrak: buat kontrak baru aktif, dan tandai kontrak lama sebagai 'extended'.
   */
  function extendContract(
    id: string,
    payload: {
      newDuration: ContractDuration
      newStartDate: string
      newBaseSalary: number
      newPosition?: string
      newDepartment?: string
      reason?: string
      performedBy?: string
      notes?: string
    },
  ): string | null {
    const c = getContractById(id)
    if (!c) return null
    const today = new Date().toISOString().slice(0, 10)
    c.status = 'extended'
    c.updatedAt = today
    c.history.push({
      id: genId('a'),
      type: 'extended',
      performedAt: today,
      performedBy: payload.performedBy,
      reason: payload.reason,
      notes: payload.notes,
      details: { newDuration: payload.newDuration, newStartDate: payload.newStartDate },
    })
    return addContract({
      employeeId: c.employeeId,
      type: c.type,
      duration: payload.newDuration,
      startDate: payload.newStartDate,
      baseSalary: payload.newBaseSalary,
      positionAtContract: payload.newPosition ?? c.positionAtContract,
      departmentAtContract: payload.newDepartment ?? c.departmentAtContract,
      previousContractId: c.id,
      performedBy: payload.performedBy,
      reason: payload.reason ?? 'Perpanjangan kontrak',
      notes: payload.notes,
    })
  }

  /**
   * Konversi kontrak ke karyawan tetap (PKWTT). Tutup kontrak lama, buat kontrak permanen baru.
   */
  function convertToPermanent(
    id: string,
    payload: {
      effectiveDate: string
      newBaseSalary: number
      newPosition?: string
      newDepartment?: string
      reason?: string
      performedBy?: string
      notes?: string
    },
  ): string | null {
    const c = getContractById(id)
    if (!c) return null
    const today = new Date().toISOString().slice(0, 10)
    c.status = 'converted'
    c.updatedAt = today
    c.history.push({
      id: genId('a'),
      type: 'converted',
      performedAt: today,
      performedBy: payload.performedBy,
      reason: payload.reason,
      notes: payload.notes,
      details: { effectiveDate: payload.effectiveDate },
    })
    return addContract({
      employeeId: c.employeeId,
      type: 'PKWTT',
      duration: 'PERMANENT',
      startDate: payload.effectiveDate,
      baseSalary: payload.newBaseSalary,
      positionAtContract: payload.newPosition ?? c.positionAtContract,
      departmentAtContract: payload.newDepartment ?? c.departmentAtContract,
      previousContractId: c.id,
      performedBy: payload.performedBy,
      reason: payload.reason ?? 'Konversi ke karyawan tetap',
      notes: payload.notes,
    })
  }

  return {
    contracts,
    employeeFilter,
    statusFilter,
    typeFilter,
    statusLabels,
    typeLabels,
    durationLabels,
    filtered,
    stats,
    addContract,
    updateContract,
    deleteContract,
    getContractById,
    getContractsByEmployee,
    getActiveContractByEmployee,
    terminateContract,
    extendContract,
    convertToPermanent,
    endDateFromDuration,
  }
})
