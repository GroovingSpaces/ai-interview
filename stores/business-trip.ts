import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type BusinessTripStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed'

export interface BusinessTripExpense {
  category: string
  amount: number
  description?: string
}

export interface BusinessTrip {
  id: string
  employeeId: string
  destination: string
  purpose: string
  startDate: string
  endDate: string
  transportMode?: string
  accommodation?: string
  estimatedBudget: number
  expenses: BusinessTripExpense[]
  notes?: string
  status: BusinessTripStatus
  approvedBy?: string
  approvedAt?: string
}

export const useBusinessTripStore = defineStore('businessTrip', () => {
  const trips = ref<BusinessTrip[]>([
    {
      id: '1',
      employeeId: '1',
      destination: 'Surabaya, Indonesia',
      purpose: 'Site visit & client meeting',
      startDate: '2026-04-15',
      endDate: '2026-04-17',
      transportMode: 'Pesawat',
      accommodation: 'Hotel Bintang 4',
      estimatedBudget: 7500000,
      expenses: [
        { category: 'Transport', amount: 2500000, description: 'PP Jakarta-Surabaya' },
        { category: 'Akomodasi', amount: 3000000, description: '2 malam hotel' },
        { category: 'Konsumsi', amount: 1500000 },
      ],
      status: 'approved',
      approvedBy: '99',
      approvedAt: '2026-04-01',
    },
    {
      id: '2',
      employeeId: '2',
      destination: 'Bandung, Indonesia',
      purpose: 'Training internal',
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      transportMode: 'Mobil dinas',
      estimatedBudget: 3500000,
      expenses: [],
      status: 'submitted',
    },
  ])

  const employeeFilter = ref('')
  const statusFilter = ref<string>('all')

  const filtered = computed(() => {
    let r = trips.value
    if (employeeFilter.value) r = r.filter((t) => t.employeeId === employeeFilter.value)
    if (statusFilter.value !== 'all') r = r.filter((t) => t.status === statusFilter.value)
    return [...r].sort((a, b) => b.startDate.localeCompare(a.startDate))
  })

  const stats = computed(() => ({
    total: trips.value.length,
    submitted: trips.value.filter((t) => t.status === 'submitted').length,
    approved: trips.value.filter((t) => t.status === 'approved').length,
    completed: trips.value.filter((t) => t.status === 'completed').length,
    totalBudget: trips.value.reduce((sum, t) => sum + (t.estimatedBudget || 0), 0),
  }))

  function addTrip(payload: Omit<BusinessTrip, 'id'>): string {
    const id = String(Date.now())
    trips.value.push({ ...payload, id })
    return id
  }
  function updateTrip(id: string, updates: Partial<Omit<BusinessTrip, 'id'>>): boolean {
    const i = trips.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    trips.value[i] = { ...trips.value[i], ...updates }
    return true
  }
  function deleteTrip(id: string): boolean {
    const i = trips.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    trips.value.splice(i, 1)
    return true
  }
  function getTripById(id: string) {
    return trips.value.find((t) => t.id === id)
  }
  function approve(id: string, approvedBy: string) {
    return updateTrip(id, { status: 'approved', approvedBy, approvedAt: new Date().toISOString().slice(0, 10) })
  }
  function reject(id: string) {
    return updateTrip(id, { status: 'rejected' })
  }

  return {
    trips,
    employeeFilter,
    statusFilter,
    filtered,
    stats,
    addTrip,
    updateTrip,
    deleteTrip,
    getTripById,
    approve,
    reject,
  }
})
