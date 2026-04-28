import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type SuccessionReadiness = 'ready_now' | 'ready_1y' | 'ready_2y_plus' | 'developing'

export interface KeyRole {
  id: string
  title: string
  department: string
  positionLevel: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  currentHolderId?: string
  description?: string
}

export interface SuccessorEntry {
  id: string
  keyRoleId: string
  candidateEmployeeId: string
  readiness: SuccessionReadiness
  developmentNeeds: string
  notes?: string
}

export const useSuccessionStore = defineStore('succession', () => {
  const keyRoles = ref<KeyRole[]>([
    { id: '1', title: 'CTO', department: 'Engineering', positionLevel: 'C-Level', riskLevel: 'critical', currentHolderId: '99', description: 'Pemimpin teknologi & arsitektur platform' },
    { id: '2', title: 'Head of HR', department: 'Human Resources', positionLevel: 'Director', riskLevel: 'high', currentHolderId: '2', description: 'Strategi people & culture perusahaan' },
    { id: '3', title: 'Engineering Manager', department: 'Engineering', positionLevel: 'Manager', riskLevel: 'medium' },
  ])

  const successors = ref<SuccessorEntry[]>([
    {
      id: '1',
      keyRoleId: '1',
      candidateEmployeeId: '1',
      readiness: 'ready_2y_plus',
      developmentNeeds: 'Strategic leadership, board exposure',
      notes: 'Strong tech, butuh exposure executive level',
    },
    {
      id: '2',
      keyRoleId: '2',
      candidateEmployeeId: '2',
      readiness: 'ready_1y',
      developmentNeeds: 'People analytics, employer branding',
    },
  ])

  function addKeyRole(payload: Omit<KeyRole, 'id'>): string {
    const id = String(Date.now())
    keyRoles.value.push({ ...payload, id })
    return id
  }
  function updateKeyRole(id: string, updates: Partial<Omit<KeyRole, 'id'>>): boolean {
    const i = keyRoles.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    keyRoles.value[i] = { ...keyRoles.value[i], ...updates }
    return true
  }
  function deleteKeyRole(id: string): boolean {
    const i = keyRoles.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    keyRoles.value.splice(i, 1)
    successors.value = successors.value.filter((s) => s.keyRoleId !== id)
    return true
  }

  function addSuccessor(payload: Omit<SuccessorEntry, 'id'>): string {
    const id = String(Date.now())
    successors.value.push({ ...payload, id })
    return id
  }
  function updateSuccessor(id: string, updates: Partial<Omit<SuccessorEntry, 'id'>>): boolean {
    const i = successors.value.findIndex((s) => s.id === id)
    if (i === -1) return false
    successors.value[i] = { ...successors.value[i], ...updates }
    return true
  }
  function deleteSuccessor(id: string): boolean {
    const i = successors.value.findIndex((s) => s.id === id)
    if (i === -1) return false
    successors.value.splice(i, 1)
    return true
  }

  function getRoleById(id: string) {
    return keyRoles.value.find((r) => r.id === id)
  }
  function successorsForRole(roleId: string) {
    return successors.value.filter((s) => s.keyRoleId === roleId)
  }

  return {
    keyRoles,
    successors,
    addKeyRole,
    updateKeyRole,
    deleteKeyRole,
    addSuccessor,
    updateSuccessor,
    deleteSuccessor,
    getRoleById,
    successorsForRole,
  }
})
