import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Announcement {
  id: string
  title: string
  content: string
  priority: AnnouncementPriority
  publishedAt: string // ISO date
  expiresAt?: string // optional
  createdBy?: string
  departmentId?: string // null = company-wide
}

export const useAnnouncementsStore = defineStore('announcements', () => {
  const items = ref<Announcement[]>([
    {
      id: '1',
      title: 'Libur Nasional 17 Agustus',
      content: 'Seluruh karyawan libur pada tanggal 17 Agustus 2026 dalam rangka HUT RI.',
      priority: 'high',
      publishedAt: '2026-02-01T08:00:00',
      expiresAt: '2026-08-18',
      createdBy: '99',
    },
    {
      id: '2',
      title: 'Update kebijakan WFH',
      content: 'WFH maksimal 2 hari per minggu. Silakan koordinasi dengan atasan langsung.',
      priority: 'normal',
      publishedAt: '2026-02-05T09:00:00',
      createdBy: '99',
    },
  ])

  const sortedByDate = computed(() =>
    [...items.value].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  )

  /** Active = published and not expired */
  const activeAnnouncements = computed(() => {
    const now = new Date().toISOString()
    return sortedByDate.value.filter((a) => {
      if (a.publishedAt > now) return false
      if (a.expiresAt && a.expiresAt < now.slice(0, 10)) return false
      return true
    })
  })

  function getById(id: string): Announcement | undefined {
    return items.value.find((a) => a.id === id)
  }

  function add(payload: Omit<Announcement, 'id'>): string {
    const id = String(Date.now())
    items.value.push({ ...payload, id })
    return id
  }

  function update(id: string, updates: Partial<Omit<Announcement, 'id'>>): boolean {
    const i = items.value.findIndex((a) => a.id === id)
    if (i === -1) return false
    items.value[i] = { ...items.value[i], ...updates }
    return true
  }

  function remove(id: string): boolean {
    const i = items.value.findIndex((a) => a.id === id)
    if (i === -1) return false
    items.value.splice(i, 1)
    return true
  }

  return {
    items,
    sortedByDate,
    activeAnnouncements,
    getById,
    add,
    update,
    remove,
  }
})
