import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

/** Required headcount per department (demand planning). */
export interface DepartmentDemand {
  id: string
  departmentId: string
  departmentName: string
  requiredHeadcount: number
  year?: string
  notes?: string
}

export const useDemandStore = defineStore('demand', () => {
  const demands = ref<DepartmentDemand[]>([
    { id: '1', departmentId: '1', departmentName: 'Engineering', requiredHeadcount: 15, year: '2026' },
    { id: '2', departmentId: '2', departmentName: 'HR', requiredHeadcount: 5, year: '2026' },
    { id: '3', departmentId: '3', departmentName: 'Finance', requiredHeadcount: 8, year: '2026' },
  ])

  const currentYear = computed(() => String(new Date().getFullYear()))

  function getDemandByDepartment(departmentId: string, year?: string): number {
    const y = year ?? currentYear.value
    const d = demands.value.find(
      (x) => (x.departmentId === departmentId || x.departmentName === departmentId) && (x.year === y || !x.year)
    )
    return d?.requiredHeadcount ?? 0
  }

  function getDemandsForYear(year: string): DepartmentDemand[] {
    return demands.value.filter((x) => x.year === year || !x.year)
  }

  function addDemand(payload: Omit<DepartmentDemand, 'id'>): string {
    const id = String(Date.now())
    demands.value.push({ ...payload, id })
    return id
  }
  function updateDemand(id: string, updates: Partial<Omit<DepartmentDemand, 'id'>>): boolean {
    const i = demands.value.findIndex((d) => d.id === id)
    if (i === -1) return false
    demands.value[i] = { ...demands.value[i], ...updates }
    return true
  }
  function deleteDemand(id: string): boolean {
    const i = demands.value.findIndex((d) => d.id === id)
    if (i === -1) return false
    demands.value.splice(i, 1)
    return true
  }

  return {
    demands,
    currentYear,
    getDemandByDepartment,
    getDemandsForYear,
    addDemand,
    updateDemand,
    deleteDemand,
  }
})
