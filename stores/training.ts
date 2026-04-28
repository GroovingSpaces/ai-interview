import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type TrainingStatus = 'planned' | 'open' | 'ongoing' | 'completed' | 'cancelled'

export interface TrainingProgram {
  id: string
  title: string
  category: string
  trainer: string
  startDate: string
  endDate: string
  location: string
  format: 'online' | 'offline' | 'hybrid'
  capacity: number
  cost: number
  description: string
  participants: string[]
  status: TrainingStatus
}

export const useTrainingStore = defineStore('training', () => {
  const programs = ref<TrainingProgram[]>([
    {
      id: '1',
      title: 'Leadership Bootcamp',
      category: 'Leadership',
      trainer: 'Jane Doe',
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      location: 'Jakarta HQ',
      format: 'offline',
      capacity: 20,
      cost: 25000000,
      description: 'Bootcamp 3 hari untuk supervisor dan manager.',
      participants: ['1', '2'],
      status: 'open',
    },
    {
      id: '2',
      title: 'Data Analytics for HR',
      category: 'Data',
      trainer: 'John Smith',
      startDate: '2026-06-01',
      endDate: '2026-06-15',
      location: 'Online',
      format: 'online',
      capacity: 50,
      cost: 12000000,
      description: 'Pelatihan analitik untuk HR.',
      participants: ['2'],
      status: 'planned',
    },
  ])

  function addProgram(payload: Omit<TrainingProgram, 'id'>): string {
    const id = String(Date.now())
    programs.value.push({ ...payload, id })
    return id
  }
  function updateProgram(id: string, updates: Partial<Omit<TrainingProgram, 'id'>>): boolean {
    const i = programs.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    programs.value[i] = { ...programs.value[i], ...updates }
    return true
  }
  function deleteProgram(id: string): boolean {
    const i = programs.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    programs.value.splice(i, 1)
    return true
  }
  function getProgramById(id: string) {
    return programs.value.find((p) => p.id === id)
  }

  return { programs, addProgram, updateProgram, deleteProgram, getProgramById }
})
