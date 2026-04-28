import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type RequisitionStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'closed'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship'
export type WorkArrangement = 'onsite' | 'hybrid' | 'remote'

export interface Requisition {
  id: string
  title: string
  department: string
  positionLevel?: string
  numberOfPositions: number
  employmentType: EmploymentType
  workArrangement: WorkArrangement
  location: string
  reasonOfHiring: 'replacement' | 'expansion' | 'project'
  budgetMin: number
  budgetMax: number
  jobDescription: string
  responsibilities: string[]
  qualifications: string[]
  niceToHave: string[]
  hiringManagerId?: string
  targetCloseDate?: string
  status: RequisitionStatus
  createdAt: string
}

export interface JobOpening {
  id: string
  requisitionId?: string
  title: string
  department: string
  location: string
  employmentType: EmploymentType
  workArrangement: WorkArrangement
  experienceMin: number
  experienceMax: number
  salaryMin?: number
  salaryMax?: number
  shortDescription: string
  fullDescription: string
  responsibilities: string[]
  qualifications: string[]
  benefits: string[]
  status: 'draft' | 'open' | 'paused' | 'closed'
  postedAt: string
  closedAt?: string
}

export const useRequisitionsStore = defineStore('requisitions', () => {
  const requisitions = ref<Requisition[]>([
    {
      id: '1',
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      positionLevel: 'Senior',
      numberOfPositions: 2,
      employmentType: 'full_time',
      workArrangement: 'hybrid',
      location: 'Jakarta',
      reasonOfHiring: 'expansion',
      budgetMin: 18000000,
      budgetMax: 28000000,
      jobDescription: 'Membangun & memelihara layanan backend skala besar.',
      responsibilities: ['Design backend services', 'Code review', 'Mentor junior'],
      qualifications: ['5+ tahun pengalaman', 'Go / Node.js', 'PostgreSQL'],
      niceToHave: ['Kafka', 'Kubernetes'],
      hiringManagerId: '99',
      targetCloseDate: '2026-06-30',
      status: 'approved',
      createdAt: '2026-04-01',
    },
  ])

  const jobOpenings = ref<JobOpening[]>([
    {
      id: '1',
      requisitionId: '1',
      title: 'Senior Backend Engineer',
      department: 'Engineering',
      location: 'Jakarta (Hybrid)',
      employmentType: 'full_time',
      workArrangement: 'hybrid',
      experienceMin: 5,
      experienceMax: 8,
      salaryMin: 18000000,
      salaryMax: 28000000,
      shortDescription: 'Bergabung sebagai Senior Backend Engineer untuk membangun produk digital.',
      fullDescription: 'Kami mencari Senior Backend Engineer berpengalaman untuk memimpin pengembangan microservices.',
      responsibilities: ['Design API', 'Optimize performance', 'Lead code reviews'],
      qualifications: ['5+ tahun di backend', 'Go / Node.js', 'Database design'],
      benefits: ['Asuransi keluarga', 'WFH 2 hari/minggu', 'Bonus tahunan'],
      status: 'open',
      postedAt: '2026-04-05',
    },
    {
      id: '2',
      title: 'Product Designer',
      department: 'Product',
      location: 'Jakarta',
      employmentType: 'full_time',
      workArrangement: 'onsite',
      experienceMin: 3,
      experienceMax: 5,
      shortDescription: 'Desain pengalaman pengguna produk fintech.',
      fullDescription: 'Mendesain UX/UI untuk produk fintech yang dipakai jutaan pengguna.',
      responsibilities: ['Riset user', 'Wireframe & prototipe', 'Design system'],
      qualifications: ['3+ tahun', 'Figma', 'Portfolio kuat'],
      benefits: ['Asuransi', 'Learning budget'],
      status: 'open',
      postedAt: '2026-04-10',
    },
  ])

  const reqStatusFilter = ref<string>('all')
  const reqDeptFilter = ref<string>('all')

  const filteredRequisitions = computed(() => {
    let r = requisitions.value
    if (reqStatusFilter.value !== 'all') r = r.filter((x) => x.status === reqStatusFilter.value)
    if (reqDeptFilter.value !== 'all') r = r.filter((x) => x.department === reqDeptFilter.value)
    return [...r].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  })

  function addRequisition(payload: Omit<Requisition, 'id' | 'createdAt'>): string {
    const id = String(Date.now())
    requisitions.value.push({ ...payload, id, createdAt: new Date().toISOString().slice(0, 10) })
    return id
  }
  function updateRequisition(id: string, updates: Partial<Omit<Requisition, 'id'>>): boolean {
    const i = requisitions.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    requisitions.value[i] = { ...requisitions.value[i], ...updates }
    return true
  }
  function deleteRequisition(id: string): boolean {
    const i = requisitions.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    requisitions.value.splice(i, 1)
    return true
  }

  function addJobOpening(payload: Omit<JobOpening, 'id' | 'postedAt'>): string {
    const id = String(Date.now())
    jobOpenings.value.push({ ...payload, id, postedAt: new Date().toISOString().slice(0, 10) })
    return id
  }
  function updateJobOpening(id: string, updates: Partial<Omit<JobOpening, 'id'>>): boolean {
    const i = jobOpenings.value.findIndex((j) => j.id === id)
    if (i === -1) return false
    jobOpenings.value[i] = { ...jobOpenings.value[i], ...updates }
    return true
  }
  function deleteJobOpening(id: string): boolean {
    const i = jobOpenings.value.findIndex((j) => j.id === id)
    if (i === -1) return false
    jobOpenings.value.splice(i, 1)
    return true
  }

  return {
    requisitions,
    jobOpenings,
    reqStatusFilter,
    reqDeptFilter,
    filteredRequisitions,
    addRequisition,
    updateRequisition,
    deleteRequisition,
    addJobOpening,
    updateJobOpening,
    deleteJobOpening,
  }
})
