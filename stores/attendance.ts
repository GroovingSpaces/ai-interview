import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'wfh'

export interface Attendance {
  id: string
  employeeId: string
  date: string
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
  notes?: string
  /** Manual attendance needs approval by direct supervisor or admin */
  approved?: boolean
  approvedBy?: string
}

export const useAttendanceStore = defineStore('attendance', () => {
  const records = ref<Attendance[]>([
    { id: '1', employeeId: '1', date: '2026-02-03', checkIn: '08:00', checkOut: '17:30', status: 'present', approved: true },
    { id: '2', employeeId: '2', date: '2026-02-03', checkIn: '08:15', checkOut: '17:45', status: 'late', approved: true },
    { id: '3', employeeId: '3', date: '2026-02-03', checkIn: '08:00', checkOut: '17:00', status: 'present', approved: true },
    { id: '4', employeeId: '1', date: '2026-02-02', checkIn: '08:05', checkOut: '17:30', status: 'present', approved: true },
    { id: '5', employeeId: '4', date: '2026-02-03', status: 'wfh', notes: 'Remote work', approved: false },
  ])

  const dateFilter = ref('')
  const employeeFilter = ref('')
  const statusFilter = ref<string>('all')

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'present', label: 'Hadir' },
    { value: 'late', label: 'Terlambat' },
    { value: 'absent', label: 'Tidak Hadir' },
    { value: 'leave', label: 'Cuti' },
    { value: 'wfh', label: 'WFH' },
  ]

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
    return result.sort((a, b) => (b.date + (b.checkIn || '')).localeCompare(a.date + (a.checkIn || '')))
  })

  const stats = computed(() => ({
    total: records.value.length,
    present: records.value.filter((r) => r.status === 'present').length,
    late: records.value.filter((r) => r.status === 'late').length,
    absent: records.value.filter((r) => r.status === 'absent').length,
    leave: records.value.filter((r) => r.status === 'leave').length,
    wfh: records.value.filter((r) => r.status === 'wfh').length,
  }))

  function addRecord(payload: Omit<Attendance, 'id'>): string {
    const id = String(Date.now())
    records.value.push({ ...payload, id, approved: payload.approved ?? false })
    return id
  }

  function updateRecord(id: string, updates: Partial<Omit<Attendance, 'id'>>): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value[i] = { ...records.value[i], ...updates }
    return true
  }

  function deleteRecord(id: string): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value.splice(i, 1)
    return true
  }

  function getRecordById(id: string): Attendance | undefined {
    return records.value.find((r) => r.id === id)
  }

  return {
    records,
    dateFilter,
    employeeFilter,
    statusFilter,
    statusOptions,
    filteredRecords,
    stats,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordById,
  }
})
