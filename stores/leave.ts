import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type LeaveType = 'annual' | 'sick' | 'personal' | 'unpaid' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  reason: string
  status: LeaveStatus
  approvedBy?: string
  approvedAt?: string
  notes?: string
}

export const useLeaveStore = defineStore('leave', () => {
  const requests = ref<LeaveRequest[]>([
    {
      id: '1',
      employeeId: '1',
      type: 'annual',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      days: 3,
      reason: 'Liburan keluarga',
      status: 'approved',
      approvedBy: '2',
      approvedAt: '2026-02-01',
    },
    {
      id: '2',
      employeeId: '2',
      type: 'sick',
      startDate: '2026-02-05',
      endDate: '2026-02-05',
      days: 1,
      reason: 'Sakit',
      status: 'approved',
    },
    {
      id: '3',
      employeeId: '3',
      type: 'personal',
      startDate: '2026-02-20',
      endDate: '2026-02-21',
      days: 2,
      reason: 'Keperluan pribadi',
      status: 'pending',
    },
    {
      id: '4',
      employeeId: '1',
      type: 'annual',
      startDate: '2026-02-01',
      endDate: '2026-02-07',
      days: 5,
      reason: 'Liburan keluarga',
      status: 'approved',
      approvedBy: '2',
      approvedAt: '2026-01-28',
    },
    {
      id: '5',
      employeeId: '2',
      type: 'sick',
      startDate: '2026-02-03',
      endDate: '2026-02-05',
      days: 3,
      reason: 'Flu',
      status: 'approved',
      approvedBy: '99',
      approvedAt: '2026-02-02',
    },
  ])

  const employeeFilter = ref('')
  const statusFilter = ref<string>('all')
  const typeFilter = ref<string>('all')

  const typeOptions = [
    { value: 'all', label: 'Semua Tipe' },
    { value: 'annual', label: 'Cuti Tahunan' },
    { value: 'sick', label: 'Sakit' },
    { value: 'personal', label: 'Izin' },
    { value: 'unpaid', label: 'Tanpa Bayar' },
    { value: 'other', label: 'Lainnya' },
  ]

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'rejected', label: 'Ditolak' },
  ]

  const filteredRequests = computed(() => {
    let result = requests.value
    if (employeeFilter.value) {
      result = result.filter((r) => r.employeeId === employeeFilter.value)
    }
    if (statusFilter.value !== 'all') {
      result = result.filter((r) => r.status === statusFilter.value)
    }
    if (typeFilter.value !== 'all') {
      result = result.filter((r) => r.type === typeFilter.value)
    }
    return result.sort((a, b) => b.startDate.localeCompare(a.startDate))
  })

  const stats = computed(() => ({
    total: requests.value.length,
    pending: requests.value.filter((r) => r.status === 'pending').length,
    approved: requests.value.filter((r) => r.status === 'approved').length,
    rejected: requests.value.filter((r) => r.status === 'rejected').length,
  }))

  /** Number of approved leave requests that include today (today between startDate and endDate) */
  const leaveTodayCount = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return requests.value.filter(
      (r) =>
        r.status === 'approved' &&
        r.startDate <= today &&
        r.endDate >= today
    ).length
  })

  function addRequest(payload: Omit<LeaveRequest, 'id'>): string {
    const id = String(Date.now())
    requests.value.push({ ...payload, id })
    return id
  }

  function updateRequest(id: string, updates: Partial<Omit<LeaveRequest, 'id'>>): boolean {
    const i = requests.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    requests.value[i] = { ...requests.value[i], ...updates }
    return true
  }

  function deleteRequest(id: string): boolean {
    const i = requests.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    requests.value.splice(i, 1)
    return true
  }

  function approveRequest(id: string, approvedBy: string): boolean {
    return updateRequest(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString().split('T')[0],
    })
  }

  function rejectRequest(id: string, notes?: string): boolean {
    return updateRequest(id, { status: 'rejected', notes })
  }

  function getRequestById(id: string): LeaveRequest | undefined {
    return requests.value.find((r) => r.id === id)
  }

  /** Annual leave balance for an employee in a given year (quota 12 days default). */
  const DEFAULT_ANNUAL_QUOTA = 12
  function getAnnualBalance(employeeId: string, year: string): { quota: number; used: number; remaining: number } {
    const y = Number(year)
    const startOfYear = `${year}-01-01`
    const endOfYear = `${year}-12-31`
    const approvedAnnual = requests.value.filter(
      (r) =>
        r.employeeId === employeeId &&
        r.type === 'annual' &&
        r.status === 'approved' &&
        r.endDate >= startOfYear &&
        r.startDate <= endOfYear
    )
    let used = 0
    for (const r of approvedAnnual) {
      const start = r.startDate < startOfYear ? startOfYear : r.startDate
      const end = r.endDate > endOfYear ? endOfYear : r.endDate
      const days = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1
      used += days
    }
    const quota = DEFAULT_ANNUAL_QUOTA
    return { quota, used, remaining: Math.max(0, quota - used) }
  }

  return {
    requests,
    employeeFilter,
    statusFilter,
    typeFilter,
    typeOptions,
    statusOptions,
    filteredRequests,
    stats,
    leaveTodayCount,
    addRequest,
    updateRequest,
    deleteRequest,
    approveRequest,
    rejectRequest,
    getRequestById,
    getAnnualBalance,
  }
})
