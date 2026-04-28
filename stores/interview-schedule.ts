import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type InterviewMode = 'online' | 'onsite' | 'phone'
export type InterviewScheduleStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

export interface InterviewSchedule {
  id: string
  candidateId: string
  candidateName: string
  candidateEmail: string
  position: string
  date: string
  startTime: string
  durationMinutes: number
  mode: InterviewMode
  meetingLink?: string
  location?: string
  interviewerIds: string[]
  interviewerNames: string[]
  round: string
  notes?: string
  status: InterviewScheduleStatus
  emailSent: boolean
  emailSentAt?: string
  createdAt: string
}

export const useInterviewScheduleStore = defineStore('interviewSchedule', () => {
  const schedules = ref<InterviewSchedule[]>([])

  const todayStr = () => new Date().toISOString().slice(0, 10)
  const nowIso = () => new Date().toISOString()
  const genId = () => `is-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

  function getByCandidate(candidateId: string): InterviewSchedule[] {
    return schedules.value
      .filter((s) => s.candidateId === candidateId)
      .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
  }

  function getActiveByCandidate(candidateId: string): InterviewSchedule | undefined {
    return schedules.value
      .filter((s) => s.candidateId === candidateId && s.status === 'scheduled')
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0]
  }

  const upcoming = computed(() =>
    schedules.value
      .filter((s) => s.status === 'scheduled' && s.date >= todayStr())
      .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime)),
  )

  function addSchedule(payload: Omit<InterviewSchedule, 'id' | 'createdAt' | 'emailSent' | 'emailSentAt'>): string {
    const id = genId()
    schedules.value.push({
      ...payload,
      id,
      emailSent: false,
      createdAt: nowIso(),
    })
    return id
  }

  function updateSchedule(id: string, updates: Partial<Omit<InterviewSchedule, 'id'>>): boolean {
    const i = schedules.value.findIndex((s) => s.id === id)
    if (i === -1) return false
    schedules.value[i] = { ...schedules.value[i], ...updates }
    return true
  }

  function deleteSchedule(id: string): boolean {
    const i = schedules.value.findIndex((s) => s.id === id)
    if (i === -1) return false
    schedules.value.splice(i, 1)
    return true
  }

  /** Mark email sebagai terkirim (simulasi). Real-world: integrasi dengan email service. */
  function markEmailSent(id: string) {
    return updateSchedule(id, { emailSent: true, emailSentAt: nowIso() })
  }

  /** Generate template invitation email — untuk preview & "send" simulasi. */
  function buildInvitationEmail(s: InterviewSchedule): { subject: string; body: string; to: string } {
    const dateLabel = new Date(s.date).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    const lines = [
      `Halo ${s.candidateName},`,
      '',
      `Terima kasih telah melamar untuk posisi ${s.position} di Telkomsel.`,
      `Kami mengundang Anda untuk mengikuti tahap interview dengan detail berikut:`,
      '',
      `📅 Tanggal     : ${dateLabel}`,
      `🕐 Waktu       : ${s.startTime} WIB (${s.durationMinutes} menit)`,
      `🏷️  Tahap       : ${s.round}`,
      `🎯 Mode        : ${s.mode === 'online' ? 'Online (video conference)' : s.mode === 'onsite' ? 'On-site' : 'Telepon'}`,
      ...(s.meetingLink ? [`🔗 Link        : ${s.meetingLink}`] : []),
      ...(s.location ? [`📍 Lokasi      : ${s.location}`] : []),
      `👥 Interviewer : ${s.interviewerNames.join(', ')}`,
      ...(s.notes ? ['', '📝 Catatan:', s.notes] : []),
      '',
      'Mohon konfirmasi kehadiran Anda dengan membalas email ini.',
      'Pastikan koneksi internet & device Anda siap minimal 10 menit sebelum sesi dimulai.',
      '',
      'Salam hangat,',
      'Talent Acquisition Team',
      'Telkomsel',
    ]
    return {
      subject: `[Telkomsel] Undangan Interview — ${s.position} (${dateLabel})`,
      body: lines.join('\n'),
      to: s.candidateEmail,
    }
  }

  return {
    schedules,
    upcoming,
    getByCandidate,
    getActiveByCandidate,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    markEmailSent,
    buildInvitationEmail,
  }
})
