import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UnavailabilityReason = 'personal' | 'leave' | 'sick' | 'training' | 'other'

export interface Unavailability {
  id: string
  employeeId: string
  startDate: string
  endDate: string
  reason: UnavailabilityReason
  notes?: string
  createdAt: string
}

export const useWfmAvailabilityStore = defineStore('wfm-availability', () => {
  const unavailabilities = ref<Unavailability[]>([
    {
      id: 'u1',
      employeeId: '1',
      startDate: '2026-02-10',
      endDate: '2026-02-12',
      reason: 'leave',
      notes: 'Cuti',
      createdAt: '2026-01-15T10:00:00',
    },
    {
      id: 'u2',
      employeeId: '2',
      startDate: '2026-02-05',
      endDate: '2026-02-05',
      reason: 'personal',
      notes: 'Keperluan pribadi',
      createdAt: '2026-02-01T09:00:00',
    },
  ])

  const reasonOptions: { value: UnavailabilityReason; label: string }[] = [
    { value: 'personal', label: 'Keperluan pribadi' },
    { value: 'leave', label: 'Cuti' },
    { value: 'sick', label: 'Sakit' },
    { value: 'training', label: 'Pelatihan' },
    { value: 'other', label: 'Lainnya' },
  ]

  const employeeFilter = ref('')

  const filtered = computed(() => {
    let result = unavailabilities.value
    if (employeeFilter.value) {
      result = result.filter((u) => u.employeeId === employeeFilter.value)
    }
    return result.sort((a, b) => b.startDate.localeCompare(a.startDate))
  })

  function isUnavailable(employeeId: string, date: string): boolean {
    return unavailabilities.value.some(
      (u) =>
        u.employeeId === employeeId &&
        u.startDate <= date &&
        u.endDate >= date
    )
  }

  function getUnavailabilitiesForEmployee(employeeId: string): Unavailability[] {
    return unavailabilities.value
      .filter((u) => u.employeeId === employeeId)
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
  }

  function getUnavailabilitiesInRange(start: string, end: string): Unavailability[] {
    return unavailabilities.value.filter(
      (u) => u.startDate <= end && u.endDate >= start
    )
  }

  function add(payload: Omit<Unavailability, 'id' | 'createdAt'>): string {
    const id = `u-${Date.now()}`
    unavailabilities.value.push({
      ...payload,
      id,
      createdAt: new Date().toISOString(),
    })
    return id
  }

  function update(id: string, updates: Partial<Omit<Unavailability, 'id'>>): boolean {
    const i = unavailabilities.value.findIndex((u) => u.id === id)
    if (i === -1) return false
    unavailabilities.value[i] = { ...unavailabilities.value[i], ...updates }
    return true
  }

  function remove(id: string): boolean {
    const i = unavailabilities.value.findIndex((u) => u.id === id)
    if (i === -1) return false
    unavailabilities.value.splice(i, 1)
    return true
  }

  return {
    unavailabilities,
    reasonOptions,
    employeeFilter,
    filtered,
    isUnavailable,
    getUnavailabilitiesForEmployee,
    getUnavailabilitiesInRange,
    add,
    update,
    remove,
  }
})
