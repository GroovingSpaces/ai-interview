import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type TicketCategory =
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'benefits'
  | 'data_change'
  | 'document_request'
  | 'complaint'
  | 'other'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed'

export interface TicketComment {
  id: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
  internal?: boolean
}

export interface Ticket {
  id: string
  ticketNumber: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  description: string
  attachmentName?: string
  attachmentData?: string
  requesterId: string
  requesterName: string
  assigneeId?: string
  assigneeName?: string
  comments: TicketComment[]
  createdAt: string
  updatedAt: string
}

export const useHrServiceStore = defineStore('hrService', () => {
  const tickets = ref<Ticket[]>([
    {
      id: '1',
      ticketNumber: 'HR-2026-0001',
      subject: 'Permintaan surat keterangan kerja',
      category: 'document_request',
      priority: 'medium',
      status: 'in_progress',
      description: 'Saya butuh surat keterangan kerja untuk pengurusan KPR.',
      requesterId: '1',
      requesterName: 'Ahmad Rizki',
      assigneeId: '2',
      assigneeName: 'Budi Santoso',
      comments: [
        { id: 'c1', authorId: '2', authorName: 'Budi Santoso', body: 'Halo, sedang kami siapkan. Mohon tunggu 1-2 hari kerja.', createdAt: '2026-04-22' },
      ],
      createdAt: '2026-04-21',
      updatedAt: '2026-04-22',
    },
    {
      id: '2',
      ticketNumber: 'HR-2026-0002',
      subject: 'Koreksi data alamat',
      category: 'data_change',
      priority: 'low',
      status: 'open',
      description: 'Alamat saya pindah, perlu update di sistem.',
      requesterId: '3',
      requesterName: 'Citra Dewi',
      comments: [],
      createdAt: '2026-04-25',
      updatedAt: '2026-04-25',
    },
  ])

  const categoryLabels: Record<TicketCategory, string> = {
    attendance: 'Absensi',
    leave: 'Cuti',
    payroll: 'Payroll',
    benefits: 'Benefit / Tunjangan',
    data_change: 'Perubahan Data',
    document_request: 'Permintaan Dokumen',
    complaint: 'Keluhan',
    other: 'Lainnya',
  }

  const priorityLabels: Record<TicketPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  }

  const statusLabels: Record<TicketStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    waiting_user: 'Waiting User',
    resolved: 'Resolved',
    closed: 'Closed',
  }

  function nextTicketNumber(): string {
    const year = new Date().getFullYear()
    const num = (tickets.value.length + 1).toString().padStart(4, '0')
    return `HR-${year}-${num}`
  }

  function addTicket(payload: Omit<Ticket, 'id' | 'ticketNumber' | 'comments' | 'createdAt' | 'updatedAt'>): string {
    const id = String(Date.now())
    const today = new Date().toISOString().slice(0, 10)
    tickets.value.push({
      ...payload,
      id,
      ticketNumber: nextTicketNumber(),
      comments: [],
      createdAt: today,
      updatedAt: today,
    })
    return id
  }
  function updateTicket(id: string, updates: Partial<Omit<Ticket, 'id' | 'ticketNumber'>>): boolean {
    const i = tickets.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    tickets.value[i] = { ...tickets.value[i], ...updates, updatedAt: new Date().toISOString().slice(0, 10) }
    return true
  }
  function deleteTicket(id: string): boolean {
    const i = tickets.value.findIndex((t) => t.id === id)
    if (i === -1) return false
    tickets.value.splice(i, 1)
    return true
  }
  function addComment(ticketId: string, comment: Omit<TicketComment, 'id' | 'createdAt'>) {
    const t = tickets.value.find((t) => t.id === ticketId)
    if (!t) return
    t.comments.push({
      ...comment,
      id: String(Date.now()),
      createdAt: new Date().toISOString().slice(0, 10),
    })
    t.updatedAt = new Date().toISOString().slice(0, 10)
  }
  function getTicketById(id: string) {
    return tickets.value.find((t) => t.id === id)
  }

  const myTicketsByUser = computed(() => (userId: string) =>
    tickets.value.filter((t) => t.requesterId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )

  return {
    tickets,
    categoryLabels,
    priorityLabels,
    statusLabels,
    addTicket,
    updateTicket,
    deleteTicket,
    addComment,
    getTicketById,
    myTicketsByUser,
  }
})
