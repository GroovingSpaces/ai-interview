import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ShiftSwapStatus = 'pending' | 'approved' | 'rejected'

/** Request to swap my shift with another employee, or request cover for my shift */
export interface ShiftSwapRequest {
  id: string
  type: 'swap' | 'cover'
  requesterEmployeeId: string
  /** For swap: employee to swap with. For cover: employee who will cover (optional until assigned) */
  counterpartEmployeeId?: string
  rosterEntryId: string
  /** Optional: requested date/shift for cover (open shift) */
  requestedDate: string
  requestedShiftId: string
  reason: string
  status: ShiftSwapStatus
  approvedBy?: string
  approvedAt?: string
  rejectedReason?: string
  createdAt: string
}

/** Open shift: slot that needs to be filled (no assignee yet) */
export interface OpenShift {
  id: string
  date: string
  shiftId: string
  departmentId?: string
  notes?: string
  /** When someone picks up, link to roster */
  filledByEmployeeId?: string
  filledAt?: string
}

export const useWfmShiftSwapStore = defineStore('wfm-shift-swap', () => {
  const requests = ref<ShiftSwapRequest[]>([
    {
      id: 'ss1',
      type: 'swap',
      requesterEmployeeId: '1',
      counterpartEmployeeId: '2',
      rosterEntryId: 'r1',
      requestedDate: '2026-02-05',
      requestedShiftId: '2',
      reason: 'Acara keluarga',
      status: 'pending',
      createdAt: '2026-02-01T10:00:00',
    },
    {
      id: 'ss2',
      type: 'cover',
      requesterEmployeeId: '3',
      rosterEntryId: 'r5',
      requestedDate: '2026-02-04',
      requestedShiftId: '1',
      reason: 'Sakit',
      status: 'approved',
      counterpartEmployeeId: '4',
      approvedBy: '99',
      approvedAt: '2026-02-02',
      createdAt: '2026-02-02T08:00:00',
    },
  ])

  const openShifts = ref<OpenShift[]>([
    { id: 'os1', date: '2026-02-07', shiftId: '1', notes: 'Perlu pengganti' },
    { id: 'os2', date: '2026-02-08', shiftId: '2', departmentId: '1' },
  ])

  const statusFilter = ref<string>('all')
  const typeFilter = ref<string>('all')

  const filteredRequests = computed(() => {
    let result = requests.value
    if (statusFilter.value !== 'all') {
      result = result.filter((r) => r.status === statusFilter.value)
    }
    if (typeFilter.value !== 'all') {
      result = result.filter((r) => r.type === typeFilter.value)
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  const pendingCount = computed(() =>
    requests.value.filter((r) => r.status === 'pending').length
  )

  function addRequest(payload: Omit<ShiftSwapRequest, 'id' | 'createdAt'>): string {
    const id = `ss-${Date.now()}`
    requests.value.push({
      ...payload,
      id,
      createdAt: new Date().toISOString(),
    })
    return id
  }

  function updateRequest(id: string, updates: Partial<ShiftSwapRequest>): boolean {
    const i = requests.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    requests.value[i] = { ...requests.value[i], ...updates }
    return true
  }

  function approveRequest(id: string, approvedBy: string, counterpartEmployeeId?: string): boolean {
    return updateRequest(id, {
      status: 'approved',
      approvedBy,
      approvedAt: new Date().toISOString().split('T')[0],
      ...(counterpartEmployeeId && { counterpartEmployeeId }),
    })
  }

  function rejectRequest(id: string, rejectedReason?: string): boolean {
    return updateRequest(id, { status: 'rejected', rejectedReason })
  }

  function getRequestsByEmployee(employeeId: string): ShiftSwapRequest[] {
    return requests.value.filter(
      (r) => r.requesterEmployeeId === employeeId || r.counterpartEmployeeId === employeeId
    )
  }

  function addOpenShift(payload: Omit<OpenShift, 'id'>): string {
    const id = `os-${Date.now()}`
    openShifts.value.push({ ...payload, id })
    return id
  }

  function fillOpenShift(openShiftId: string, employeeId: string): boolean {
    const i = openShifts.value.findIndex((o) => o.id === openShiftId)
    if (i === -1) return false
    openShifts.value[i].filledByEmployeeId = employeeId
    openShifts.value[i].filledAt = new Date().toISOString()
    return true
  }

  function removeOpenShift(id: string): boolean {
    const i = openShifts.value.findIndex((o) => o.id === id)
    if (i === -1) return false
    openShifts.value.splice(i, 1)
    return true
  }

  function getOpenShiftsByDateRange(start: string, end: string): OpenShift[] {
    return openShifts.value.filter(
      (o) => !o.filledByEmployeeId && o.date >= start && o.date <= end
    )
  }

  return {
    requests,
    openShifts,
    statusFilter,
    typeFilter,
    filteredRequests,
    pendingCount,
    addRequest,
    updateRequest,
    approveRequest,
    rejectRequest,
    getRequestsByEmployee,
    addOpenShift,
    fillOpenShift,
    removeOpenShift,
    getOpenShiftsByDateRange,
  }
})
