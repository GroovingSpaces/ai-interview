import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type OvertimeStatus = 'pending' | 'approved' | 'rejected'

export interface Overtime {
  id: string
  employeeId: string
  date: string
  startTime: string
  endTime: string
  hours?: number
  reason?: string
  status: OvertimeStatus
}

function parseTimeToMinutes(time: string): number {
  if (!time) return 0
  const [h, m] = time.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

function computeHours(startTime: string, endTime: string): number {
  const start = parseTimeToMinutes(startTime)
  let end = parseTimeToMinutes(endTime)
  if (end <= start) end += 24 * 60 // next day
  return Math.round(((end - start) / 60) * 100) / 100
}

export const useOvertimeStore = defineStore('overtime', () => {
  const records = ref<Overtime[]>([
    {
      id: '1',
      employeeId: '1',
      date: '2025-02-10',
      startTime: '18:00',
      endTime: '21:00',
      hours: 3,
      reason: 'Project deadline',
      status: 'approved',
    },
    {
      id: '2',
      employeeId: '2',
      date: '2025-02-12',
      startTime: '17:30',
      endTime: '20:30',
      reason: 'Monthly report',
      status: 'pending',
    },
    {
      id: '3',
      employeeId: '3',
      date: '2025-02-08',
      startTime: '19:00',
      endTime: '22:00',
      hours: 3,
      reason: 'System deployment',
      status: 'approved',
    },
  ])

  const dateFilter = ref('')
  const employeeFilter = ref('')
  const statusFilter = ref<string>('all')

  const filteredRecords = computed(() => {
    let result = records.value
    if (dateFilter.value) {
      result = result.filter((r) => r.date === dateFilter.value)
    }
    if (employeeFilter.value) {
      result = result.filter((r) => r.employeeId === employeeFilter.value)
    }
    if (statusFilter.value !== 'all') {
      result = result.filter((r) => r.status === statusFilter.value)
    }
    return result.sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
  })

  const stats = computed(() => ({
    total: records.value.length,
    pending: records.value.filter((r) => r.status === 'pending').length,
    approved: records.value.filter((r) => r.status === 'approved').length,
    rejected: records.value.filter((r) => r.status === 'rejected').length,
  }))

  function addOvertime(payload: Omit<Overtime, 'id'>): string {
    const hours = payload.hours ?? computeHours(payload.startTime, payload.endTime)
    const id = String(Date.now())
    records.value.push({ ...payload, id, hours })
    return id
  }

  function updateOvertime(id: string, updates: Partial<Omit<Overtime, 'id'>>): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    const current = records.value[i]
    const startTime = updates.startTime ?? current.startTime
    const endTime = updates.endTime ?? current.endTime
    const hours = updates.hours ?? computeHours(startTime, endTime)
    records.value[i] = { ...current, ...updates, hours }
    return true
  }

  function deleteOvertime(id: string): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value.splice(i, 1)
    return true
  }

  function getOvertimeById(id: string): Overtime | undefined {
    return records.value.find((r) => r.id === id)
  }

  return {
    records,
    dateFilter,
    employeeFilter,
    statusFilter,
    filteredRecords,
    stats,
    addOvertime,
    updateOvertime,
    deleteOvertime,
    getOvertimeById,
    computeHours,
  }
})
