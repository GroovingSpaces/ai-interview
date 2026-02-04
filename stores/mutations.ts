import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Mutation {
  id: string
  employeeId: string
  fromDepartment: string
  toDepartment: string
  fromDivision?: string
  toDivision?: string
  fromPosition: string
  toPosition: string
  mutationDate: string
  reason?: string
}

export const useMutationsStore = defineStore('mutations', () => {
  const records = ref<Mutation[]>([
    {
      id: '1',
      employeeId: '1',
      fromDepartment: 'Engineering',
      toDepartment: 'Product',
      fromPosition: 'Software Engineer',
      toPosition: 'Product Engineer',
      mutationDate: '2024-06-01',
      reason: 'Internal transfer',
    },
  ])

  const employeeFilter = ref('')
  const dateFilter = ref('')

  const filteredRecords = computed(() => {
    let result = records.value
    if (employeeFilter.value) {
      result = result.filter((r) => r.employeeId === employeeFilter.value)
    }
    if (dateFilter.value) {
      result = result.filter((r) => r.mutationDate === dateFilter.value)
    }
    return result.sort((a, b) => b.mutationDate.localeCompare(a.mutationDate))
  })

  const stats = computed(() => ({
    total: records.value.length,
  }))

  function addMutation(payload: Omit<Mutation, 'id'>): string {
    const id = String(Date.now())
    records.value.push({ ...payload, id })
    return id
  }

  function updateMutation(id: string, updates: Partial<Omit<Mutation, 'id'>>): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value[i] = { ...records.value[i], ...updates }
    return true
  }

  function deleteMutation(id: string): boolean {
    const i = records.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    records.value.splice(i, 1)
    return true
  }

  function getMutationById(id: string): Mutation | undefined {
    return records.value.find((r) => r.id === id)
  }

  function getMutationsByEmployeeId(employeeId: string): Mutation[] {
    return records.value
      .filter((r) => r.employeeId === employeeId)
      .sort((a, b) => a.mutationDate.localeCompare(b.mutationDate))
  }

  return {
    records,
    filteredRecords,
    stats,
    employeeFilter,
    dateFilter,
    addMutation,
    updateMutation,
    deleteMutation,
    getMutationById,
    getMutationsByEmployeeId,
  }
})
