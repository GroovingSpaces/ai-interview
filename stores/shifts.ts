import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Shift {
  id: string
  name: string
  startTime: string // "08:00"
  endTime: string   // "17:00"
  breakMinutes?: number
  color?: string
}

export interface RosterEntry {
  id: string
  employeeId: string
  shiftId: string
  date: string // YYYY-MM-DD
}

export const useShiftsStore = defineStore('shifts', () => {
  const shifts = ref<Shift[]>([
    { id: '1', name: 'Pagi', startTime: '08:00', endTime: '16:00', breakMinutes: 60, color: '#f97316' },
    { id: '2', name: 'Siang', startTime: '12:00', endTime: '20:00', breakMinutes: 60, color: '#eab308' },
    { id: '3', name: 'Malam', startTime: '20:00', endTime: '04:00', breakMinutes: 60, color: '#6366f1' },
    { id: '4', name: 'Full Day', startTime: '09:00', endTime: '18:00', breakMinutes: 60, color: '#22c55e' },
  ])

  const roster = ref<RosterEntry[]>([
    { id: 'r1', employeeId: '1', shiftId: '1', date: '2026-02-02' },
    { id: 'r2', employeeId: '2', shiftId: '1', date: '2026-02-02' },
    { id: 'r3', employeeId: '1', shiftId: '1', date: '2026-02-03' },
    { id: 'r4', employeeId: '2', shiftId: '2', date: '2026-02-03' },
    { id: 'r5', employeeId: '3', shiftId: '1', date: '2026-02-03' },
  ])

  const shiftsById = computed(() => {
    const map = new Map<string, Shift>()
    shifts.value.forEach((s) => map.set(s.id, s))
    return map
  })

  function getShiftById(id: string): Shift | undefined {
    return shiftsById.value.get(id)
  }

  function getRosterByDateRange(start: string, end: string): RosterEntry[] {
    return roster.value.filter((r) => r.date >= start && r.date <= end)
  }

  function getRosterByDate(date: string): RosterEntry[] {
    return roster.value.filter((r) => r.date === date)
  }

  function getShiftForEmployee(employeeId: string, date: string): Shift | undefined {
    const entry = roster.value.find((r) => r.employeeId === employeeId && r.date === date)
    return entry ? getShiftById(entry.shiftId) : undefined
  }

  function addShift(payload: Omit<Shift, 'id'>): string {
    const id = String(Date.now())
    shifts.value.push({ ...payload, id })
    return id
  }

  function updateShift(id: string, updates: Partial<Omit<Shift, 'id'>>): boolean {
    const i = shifts.value.findIndex((s) => s.id === id)
    if (i === -1) return false
    shifts.value[i] = { ...shifts.value[i], ...updates }
    return true
  }

  function deleteShift(id: string): boolean {
    const i = shifts.value.findIndex((s) => s.id === id)
    if (i === -1) return false
    shifts.value.splice(i, 1)
    roster.value = roster.value.filter((r) => r.shiftId !== id)
    return true
  }

  function assignShift(employeeId: string, shiftId: string, date: string): string | null {
    const existing = roster.value.find((r) => r.employeeId === employeeId && r.date === date)
    if (existing) {
      existing.shiftId = shiftId
      return existing.id
    }
    const id = `r-${Date.now()}`
    roster.value.push({ id, employeeId, shiftId, date })
    return id
  }

  function unassignRoster(employeeId: string, date: string): boolean {
    const i = roster.value.findIndex((r) => r.employeeId === employeeId && r.date === date)
    if (i === -1) return false
    roster.value.splice(i, 1)
    return true
  }

  return {
    shifts,
    roster,
    shiftsById,
    getShiftById,
    getRosterByDateRange,
    getRosterByDate,
    getShiftForEmployee,
    addShift,
    updateShift,
    deleteShift,
    assignShift,
    unassignRoster,
  }
})
