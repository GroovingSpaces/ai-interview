import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface PublicHoliday {
  id: string
  name: string
  date: string
  type: 'national' | 'company' | 'optional'
  region?: string
  notes?: string
}

export const useWfmHolidaysStore = defineStore('wfm-holidays', () => {
  const holidays = ref<PublicHoliday[]>([
    { id: 'h1', name: 'Tahun Baru 2026', date: '2026-01-01', type: 'national' },
    { id: 'h2', name: 'Hari Kemerdekaan RI', date: '2026-08-17', type: 'national' },
    { id: 'h3', name: 'Idul Fitri 1447 H', date: '2026-03-30', type: 'national' },
    { id: 'h4', name: 'Idul Fitri 1447 H (2)', date: '2026-03-31', type: 'national' },
    { id: 'h5', name: 'Cuti Bersama Tahun Baru', date: '2026-12-31', type: 'company', notes: 'Cuti bersama' },
  ])

  const yearFilter = ref(new Date().getFullYear().toString())

  const filtered = computed(() => {
    return holidays.value
      .filter((h) => h.date.startsWith(yearFilter.value))
      .sort((a, b) => a.date.localeCompare(b.date))
  })

  function isHoliday(date: string): boolean {
    return holidays.value.some((h) => h.date === date)
  }

  function getHoliday(date: string): PublicHoliday | undefined {
    return holidays.value.find((h) => h.date === date)
  }

  function getHolidaysInRange(start: string, end: string): PublicHoliday[] {
    return holidays.value.filter(
      (h) => h.date >= start && h.date <= end
    )
  }

  function add(payload: Omit<PublicHoliday, 'id'>): string {
    const id = `h-${Date.now()}`
    holidays.value.push({ ...payload, id })
    return id
  }

  function update(id: string, updates: Partial<Omit<PublicHoliday, 'id'>>): boolean {
    const i = holidays.value.findIndex((h) => h.id === id)
    if (i === -1) return false
    holidays.value[i] = { ...holidays.value[i], ...updates }
    return true
  }

  function remove(id: string): boolean {
    const i = holidays.value.findIndex((h) => h.id === id)
    if (i === -1) return false
    holidays.value.splice(i, 1)
    return true
  }

  return {
    holidays,
    yearFilter,
    filtered,
    isHoliday,
    getHoliday,
    getHolidaysInRange,
    add,
    update,
    remove,
  }
})
