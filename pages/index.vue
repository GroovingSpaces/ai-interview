<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Users, UsersRound, ClipboardList, CalendarCheck, CalendarOff, Clock, Target,
  TrendingUp, Wallet, Receipt, Briefcase, Sparkles, GraduationCap,
  Activity, AlertTriangle, FileText, Send, ChevronRight,
  // Stats / signal
  CheckCircle2, UserCheck, Flame, CalendarDays, FileBarChart, PlusCircle, Inbox,
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useEmployeesStore } from '~/stores/employees'
import { useAttendanceStore } from '~/stores/attendance'
import { useLeaveStore } from '~/stores/leave'
import { useOvertimeStore } from '~/stores/overtime'
import { useKpiStore } from '~/stores/kpi'
import { useTasksStore } from '~/stores/tasks'
import { useCompensationStore } from '~/stores/compensation'
import { useCandidatesStore } from '~/stores/candidates'
import { useRequisitionsStore } from '~/stores/requisitions'
import { useContractsStore } from '~/stores/contracts'
import { useLmsStore } from '~/stores/lms'
import { useHrServiceStore } from '~/stores/hr-service'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('dashboard')
useHead({ title: () => title.value })

const authStore = useAuthStore()
const employeesStore = useEmployeesStore()
const attendanceStore = useAttendanceStore()
const leaveStore = useLeaveStore()
const overtimeStore = useOvertimeStore()
const kpiStore = useKpiStore()
const tasksStore = useTasksStore()
const compStore = useCompensationStore()
const candidatesStore = useCandidatesStore()
const reqStore = useRequisitionsStore()
const contractsStore = useContractsStore()
const lmsStore = useLmsStore()
const hrStore = useHrServiceStore()

const role = computed(() => authStore.user?.role ?? 'admin')
const userName = computed(() => authStore.user?.name ?? 'User')
const meId = computed(() => authStore.user?.id ?? '1')
const today = new Date().toISOString().slice(0, 10)
const currentPeriod = computed(() => `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 11) return 'Selamat pagi'
  if (h < 15) return 'Selamat siang'
  if (h < 19) return 'Selamat sore'
  return 'Selamat malam'
})

const roleLabel: Record<string, string> = {
  admin: 'Administrator',
  c_level: 'C-Level',
  hr: 'HR',
  manager: 'Manager',
  supervisor: 'Supervisor',
  staff: 'Staff',
  recruiter: 'Recruiter',
  candidate: 'Kandidat',
}

// ============================================================================
// AGGREGATE METRICS (role-based)
// ============================================================================

// Org-level (admin/c_level/hr)
const totalEmployees = computed(() => employeesStore.employees.length)
const activeEmployees = computed(() => employeesStore.employees.filter((e) => e.isActive).length)
const presentToday = computed(() => attendanceStore.records.filter((r) => r.date === today && (r.status === 'present' || r.status === 'late')).length)
const onLeaveToday = computed(() => leaveStore.requests.filter((r) => r.status === 'approved' && r.startDate <= today && r.endDate >= today).length)
const pendingLeave = computed(() => leaveStore.stats.pending)
const pendingOvertime = computed(() => overtimeStore.stats.pending)
const openTickets = computed(() => hrStore.tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length)

const expiringContracts = computed(() => contractsStore.stats.expiringSoon)
const totalCandidates = computed(() => candidatesStore.candidates.length)
const openJobs = computed(() => reqStore.jobOpenings.filter((j) => j.status === 'open').length)
const submittedKpis = computed(() => kpiStore.assignments.filter((a) => a.period === currentPeriod.value && a.status === 'submitted').length)

// Manager — team data (using directSupervisorId)
const myTeam = computed(() => employeesStore.employees.filter((e) => e.directSupervisorId === meId.value && e.isActive))
const teamPresentToday = computed(() => {
  const ids = new Set(myTeam.value.map((e) => e.id))
  return attendanceStore.records.filter((r) => r.date === today && ids.has(r.employeeId) && (r.status === 'present' || r.status === 'late')).length
})
const teamPendingLeave = computed(() => {
  const ids = new Set(myTeam.value.map((e) => e.id))
  return leaveStore.requests.filter((r) => r.status === 'pending' && ids.has(r.employeeId)).length
})
const teamSubmittedKpi = computed(() => {
  const ids = new Set(myTeam.value.map((e) => e.id))
  return kpiStore.assignments.filter((a) => a.period === currentPeriod.value && ids.has(a.employeeId) && a.status === 'submitted').length
})
const teamTasksDue = computed(() => {
  const ids = new Set(myTeam.value.map((e) => e.id))
  return tasksStore.tasks.filter((t) => ids.has(t.assigneeId) && t.status !== 'done' && t.status !== 'approved').length
})

// Self (staff)
const myAttendanceToday = computed(() => attendanceStore.getTodayRecordByEmployee(meId.value, today))
const myLeaveBalance = computed(() => leaveStore.getAnnualBalance(meId.value, String(new Date().getFullYear())))
const myOpenTasks = computed(() => tasksStore.tasks.filter((t) => t.assigneeId === meId.value && t.status !== 'done' && t.status !== 'approved').length)
const myKpiCount = computed(() => kpiStore.getAssignmentsByEmployeeAndPeriod(meId.value, currentPeriod.value).length)
const myKpiScore = computed(() => {
  const list = kpiStore.getAssignmentsByEmployeeAndPeriod(meId.value, currentPeriod.value)
  if (list.length === 0) return 0
  let s = 0, w = 0
  for (const a of list) {
    const p = kpiStore.getPolicyById(a.policyId)
    if (!p) continue
    s += (a.target > 0 ? Math.min(100, (a.actual / a.target) * 100) : 0) * p.weight
    w += p.weight
  }
  return w === 0 ? 0 : Math.round(s / w)
})
const myLearningProgress = computed(() => lmsStore.totalProgress)
const myLatestPayslip = computed(() => {
  const list = compStore.payslips.filter((p) => p.employeeId === meId.value)
  return list.length ? list[list.length - 1] : null
})

// Recruiter
const candidatesInPipeline = computed(() => candidatesStore.pipelineCount)

// ============================================================================
// ROLE-BASED CONFIGS
// ============================================================================
type Tone = 'good' | 'low' | 'average' | 'primary' | 'muted' | 'warning'

interface StatItem {
  label: string
  value: string | number
  hint?: string
  tone?: Tone
  icon: typeof Users
}

interface QuickAction {
  label: string
  description: string
  href: string
  icon: typeof Users
  badge?: string
  tone?: Tone
}

// Top KPI strip per role
const stats = computed<StatItem[]>(() => {
  if (role.value === 'admin' || role.value === 'c_level' || role.value === 'hr') {
    return [
      { label: 'Total Karyawan', value: totalEmployees.value, hint: `${activeEmployees.value} aktif`, tone: 'primary', icon: Users },
      { label: 'Hadir Hari Ini', value: presentToday.value, hint: `dari ${activeEmployees.value}`, tone: 'good', icon: UserCheck },
      { label: 'Cuti Hari Ini', value: onLeaveToday.value, tone: 'average', icon: CalendarOff },
      { label: 'Pending Approval', value: pendingLeave.value + pendingOvertime.value, hint: `${pendingLeave.value} cuti, ${pendingOvertime.value} lembur`, tone: 'warning', icon: AlertTriangle },
      { label: 'Kontrak Expiring', value: expiringContracts.value, hint: '60 hari', tone: 'low', icon: FileText },
      { label: 'Open Tickets', value: openTickets.value, tone: 'primary', icon: Inbox },
    ]
  }
  if (role.value === 'manager' || role.value === 'supervisor') {
    return [
      { label: 'Anggota Tim', value: myTeam.value.length, tone: 'primary', icon: UsersRound },
      { label: 'Hadir Hari Ini', value: teamPresentToday.value, tone: 'good', icon: UserCheck },
      { label: 'Approval Cuti', value: teamPendingLeave.value, tone: 'warning', icon: CalendarOff },
      { label: 'Submission KPI', value: teamSubmittedKpi.value, hint: 'Untuk direview', tone: 'average', icon: Target },
      { label: 'Task Tim Aktif', value: teamTasksDue.value, tone: 'primary', icon: ClipboardList },
    ]
  }
  if (role.value === 'recruiter') {
    return [
      { label: 'Total Kandidat', value: totalCandidates.value, tone: 'primary', icon: Users },
      { label: 'Dalam Pipeline', value: candidatesInPipeline.value, tone: 'good', icon: TrendingUp },
      { label: 'Lowongan Terbuka', value: openJobs.value, tone: 'average', icon: Briefcase },
      { label: 'Requisition Pending', value: reqStore.requisitions.filter((r) => r.status === 'submitted').length, tone: 'warning', icon: ClipboardList },
    ]
  }
  // staff (default)
  return [
    {
      label: 'Status Absensi',
      value: myAttendanceToday.value?.checkIn ? (myAttendanceToday.value.checkOut ? 'Selesai' : 'Hadir') : 'Belum',
      hint: myAttendanceToday.value?.checkIn ?? '—',
      tone: myAttendanceToday.value?.checkIn ? 'good' : 'warning',
      icon: CalendarCheck,
    },
    { label: 'Sisa Cuti', value: `${myLeaveBalance.value.remaining} hari`, hint: `Terpakai ${myLeaveBalance.value.used}`, tone: 'good', icon: CalendarOff },
    { label: 'Skor KPI', value: `${myKpiScore.value}%`, hint: `${myKpiCount.value} indikator`, tone: 'primary', icon: Target },
    { label: 'Task Aktif', value: myOpenTasks.value, tone: 'average', icon: ClipboardList },
    { label: 'Learning', value: `${myLearningProgress.value}%`, tone: 'primary', icon: GraduationCap },
  ]
})

// Quick actions per role
const quickActions = computed<QuickAction[]>(() => {
  if (role.value === 'admin' || role.value === 'c_level' || role.value === 'hr') {
    return [
      { label: 'Tambah Karyawan', description: 'Onboard karyawan baru', href: '/employees/database/add', icon: PlusCircle, tone: 'primary' },
      { label: 'Approval Cuti', description: `${pendingLeave.value} menunggu`, href: '/leave-permission/leave-request', icon: CalendarOff, tone: 'warning', badge: pendingLeave.value > 0 ? String(pendingLeave.value) : undefined },
      { label: 'Service Console', description: `${openTickets.value} tiket aktif`, href: '/hr-service/service-console', icon: Inbox, tone: 'primary', badge: openTickets.value > 0 ? String(openTickets.value) : undefined },
      { label: 'Payroll Run', description: 'Jalankan payroll periode', href: '/compensation-benefits/payroll-run', icon: Wallet, tone: 'good' },
      { label: 'Insights', description: 'Burnout & attrition risk', href: '/insights/burnout-indicator', icon: Flame, tone: 'low' },
    ]
  }
  if (role.value === 'manager' || role.value === 'supervisor') {
    return [
      { label: 'Assign KPI', description: 'Tetapkan KPI untuk tim', href: '/performance/assign-kpi', icon: Target, tone: 'primary' },
      { label: 'Approve Cuti', description: `${teamPendingLeave.value} menunggu`, href: '/leave-permission/leave-request', icon: CalendarOff, tone: 'warning', badge: teamPendingLeave.value > 0 ? String(teamPendingLeave.value) : undefined },
      { label: 'Team Review', description: 'Review pencapaian KPI', href: '/performance/team-review', icon: ClipboardList, tone: 'primary' },
      { label: 'Tugaskan Task', description: 'Buat task untuk tim', href: '/tasks/assign-task', icon: ClipboardList, tone: 'good' },
      { label: 'Evidence Review', description: 'Tinjau hasil tim', href: '/tasks/evidence-review', icon: CheckCircle2, tone: 'average' },
    ]
  }
  if (role.value === 'recruiter') {
    return [
      { label: 'Buat Lowongan', description: 'Publikasikan posisi baru', href: '/talent-acquisition/job-openings', icon: PlusCircle, tone: 'primary' },
      { label: 'Tambah Kandidat', description: 'Catat kandidat baru', href: '/talent-acquisition/candidates', icon: Users, tone: 'good' },
      { label: 'Pipeline', description: 'Kelola tahap rekrutmen', href: '/talent-acquisition/recruitment', icon: TrendingUp, tone: 'primary' },
      { label: 'Requisitions', description: 'Daftar permintaan rekrut', href: '/talent-acquisition/requisitions', icon: ClipboardList, tone: 'average' },
    ]
  }
  // staff
  return [
    {
      label: myAttendanceToday.value?.checkIn ? (myAttendanceToday.value.checkOut ? 'Selesai Hari Ini' : 'Clock Out') : 'Clock In',
      description: 'Absensi GPS + face recognition',
      href: '/time-attendance/my-attendance',
      icon: CalendarCheck,
      tone: 'good',
    },
    { label: 'Ajukan Cuti', description: `Sisa ${myLeaveBalance.value.remaining} hari`, href: '/leave-permission/my-leave', icon: CalendarOff, tone: 'primary' },
    { label: 'Self-Assessment', description: 'Update progress KPI', href: '/performance/self-assessment', icon: Target, tone: 'average' },
    { label: 'Submit Request', description: 'Buat tiket ke HR', href: '/hr-service/submit-request', icon: Send, tone: 'primary' },
    { label: 'My Tasks', description: `${myOpenTasks.value} task aktif`, href: '/tasks/my-tasks', icon: ClipboardList, tone: 'good', badge: myOpenTasks.value > 0 ? String(myOpenTasks.value) : undefined },
    { label: 'Slip Gaji', description: myLatestPayslip.value?.period ?? '—', href: '/compensation-benefits/payslip', icon: Receipt, tone: 'primary' },
  ]
})

const LG_GRID_COLS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
}

const XL_GRID_COLS: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
  5: 'xl:grid-cols-5',
  6: 'xl:grid-cols-6',
}

function gridColsClass(total: number, prefix: 'lg' | 'xl' = 'xl'): string {
  const safe = Math.max(1, Math.min(total, 6))
  return prefix === 'lg' ? LG_GRID_COLS[safe] : XL_GRID_COLS[safe]
}

const statsGridClass = computed(() => gridColsClass(stats.value.length, 'lg'))
const quickActionsGridClass = computed(() => gridColsClass(quickActions.value.length, 'xl'))

// ============================================================================
// ALERT PANEL
// ============================================================================
interface AlertItem {
  level: 'info' | 'warning' | 'danger' | 'success'
  title: string
  message: string
  href?: string
  icon: typeof AlertTriangle
}

const alerts = computed<AlertItem[]>(() => {
  const out: AlertItem[] = []
  if (role.value === 'admin' || role.value === 'c_level' || role.value === 'hr') {
    if (expiringContracts.value > 0) {
      out.push({
        level: 'warning',
        title: `${expiringContracts.value} kontrak akan berakhir`,
        message: 'Tinjau dan perpanjang/konversi sebelum jatuh tempo.',
        href: '/employees/contracts',
        icon: FileText,
      })
    }
    if (pendingLeave.value > 0) {
      out.push({
        level: 'info',
        title: `${pendingLeave.value} pengajuan cuti menunggu approval`,
        message: 'Tinjau dan setujui di Leave Request.',
        href: '/leave-permission/leave-request',
        icon: CalendarOff,
      })
    }
    if (openTickets.value > 0) {
      out.push({
        level: 'info',
        title: `${openTickets.value} tiket HR butuh tindak lanjut`,
        message: 'Buka Service Console untuk menangani.',
        href: '/hr-service/service-console',
        icon: Inbox,
      })
    }
    if (out.length === 0) {
      out.push({ level: 'success', title: 'Semua aman', message: 'Tidak ada alert kritikal saat ini.', icon: CheckCircle2 })
    }
  } else if (role.value === 'manager' || role.value === 'supervisor') {
    if (teamPendingLeave.value > 0) out.push({ level: 'warning', title: `${teamPendingLeave.value} cuti tim menunggu approval`, message: 'Buka Leave Request.', href: '/leave-permission/leave-request', icon: CalendarOff })
    if (teamSubmittedKpi.value > 0) out.push({ level: 'info', title: `${teamSubmittedKpi.value} KPI tim siap direview`, message: 'Buka Team Review.', href: '/performance/team-review', icon: Target })
    if (out.length === 0) out.push({ level: 'success', title: 'Tidak ada antrian', message: 'Tim Anda tertangani dengan baik.', icon: CheckCircle2 })
  } else {
    if (!myAttendanceToday.value?.checkIn) {
      out.push({ level: 'info', title: 'Belum clock in hari ini', message: 'Lakukan absensi untuk memulai hari kerja.', href: '/time-attendance/my-attendance', icon: CalendarCheck })
    }
    if (myOpenTasks.value > 0) {
      out.push({ level: 'info', title: `${myOpenTasks.value} task menunggu`, message: 'Lihat dan kerjakan task aktif Anda.', href: '/tasks/my-tasks', icon: ClipboardList })
    }
    if (out.length === 0) out.push({ level: 'success', title: 'Hari Anda terkendali', message: 'Tidak ada tindakan mendesak.', icon: CheckCircle2 })
  }
  return out
})

// Recent activity (cross-module)
const recentActivities = computed(() => {
  const items: { time: string; label: string; href?: string; icon: typeof Users }[] = []
  // Recent leave requests
  for (const r of [...leaveStore.requests].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 3)) {
    const emp = employeesStore.getEmployeeById(r.employeeId)
    items.push({
      time: r.startDate,
      label: `${emp?.name ?? '-'} mengajukan cuti ${r.type} (${r.days} hari) — ${r.status}`,
      href: '/leave-permission/leave-request',
      icon: CalendarOff,
    })
  }
  // Recent overtime
  for (const o of [...overtimeStore.records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2)) {
    const emp = employeesStore.getEmployeeById(o.employeeId)
    items.push({
      time: o.date,
      label: `${emp?.name ?? '-'} catat lembur ${o.hours}j — ${o.status}`,
      href: '/time-attendance/overtime',
      icon: Clock,
    })
  }
  // Recent tasks update
  for (const t of [...tasksStore.tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 2)) {
    items.push({
      time: t.updatedAt,
      label: `Task "${t.title}" — ${t.status}`,
      href: '/tasks/assign-task',
      icon: ClipboardList,
    })
  }
  return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6)
})

function badgeTone(tone?: Tone): Tone {
  return tone ?? 'primary'
}

function statTone(tone?: Tone): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (!tone) return 'primary'
  return tone === 'warning' ? 'average' : tone
}
</script>

<template>
  <div class="space-y-6">
    <!-- HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <p class="text-sm text-muted-foreground">{{ greeting }},</p>
        <h1 class="text-2xl md:text-3xl font-bold text-foreground">{{ userName }}</h1>
        <div class="flex items-center gap-2 mt-2 flex-wrap">
          <UiStatusBadge :label="roleLabel[role] ?? role" tone="primary" />
          <span class="text-xs text-muted-foreground">Periode aktif: <span class="font-mono text-foreground">{{ currentPeriod }}</span></span>
        </div>
      </div>
      <div class="text-sm text-muted-foreground">
        {{ new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
      </div>
    </div>

    <!-- STATS STRIP -->
    <div class="grid grid-cols-4 md:grid-cols-3 gap-3">
      <UiStatCard
        v-for="(s, i) in stats"
        :key="i"
        :label="s.label"
        :value="s.value"
        :icon="s.icon"
        :tone="statTone(s.tone)"
        :hint="s.hint"
      />
    </div>

    <!-- QUICK ACTIONS -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base font-semibold text-foreground flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-primary" />
          Aksi Cepat
        </h2>
      </div>
      <div :class="['grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3', quickActionsGridClass]">
        <NuxtLink
          v-for="(qa, i) in quickActions"
          :key="i"
          :to="qa.href"
          class="rounded-xl border border-border bg-card hover:border-primary/40 hover:bg-card/70 transition-all p-4 group flex items-start gap-3"
        >
          <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
            qa.tone === 'primary' ? 'bg-primary/10 text-primary' :
            qa.tone === 'good' ? 'bg-emerald-500/10 text-emerald-500' :
            qa.tone === 'warning' ? 'bg-orange-500/10 text-orange-500' :
            qa.tone === 'low' ? 'bg-red-500/10 text-red-500' :
            qa.tone === 'average' ? 'bg-amber-500/10 text-amber-500' :
            'bg-muted text-muted-foreground']"
          >
            <component :is="qa.icon" class="w-5 h-5" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2">
              <p class="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">{{ qa.label }}</p>
              <UiStatusBadge v-if="qa.badge" :label="qa.badge" :tone="badgeTone(qa.tone)" />
            </div>
            <p class="text-xs text-muted-foreground mt-0.5 line-clamp-2">{{ qa.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- ALERTS + ACTIVITY ROW -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Alerts -->
      <div class="rounded-xl border border-border bg-card overflow-hidden">
        <div class="p-4 border-b border-border flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-500" />
          <h3 class="font-semibold text-foreground">Alert & Notifikasi</h3>
        </div>
        <div class="divide-y divide-border">
          <component
            v-for="(a, i) in alerts"
            :key="i"
            :is="a.href ? 'NuxtLink' : 'div'"
            :to="a.href"
            :class="['p-4 flex items-start gap-3 transition-colors', a.href ? 'hover:bg-muted/30 cursor-pointer' : '']"
          >
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
              a.level === 'danger' ? 'bg-red-500/10 text-red-500' :
              a.level === 'warning' ? 'bg-amber-500/10 text-amber-500' :
              a.level === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
              'bg-primary/10 text-primary']"
            >
              <component :is="a.icon" class="w-4 h-4" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-foreground">{{ a.title }}</p>
              <p class="text-xs text-muted-foreground mt-0.5">{{ a.message }}</p>
            </div>
            <ChevronRight v-if="a.href" class="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
          </component>
        </div>
      </div>

      <!-- Activity feed -->
      <div class="lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden">
        <div class="p-4 border-b border-border flex items-center gap-2">
          <Activity class="w-4 h-4 text-primary" />
          <h3 class="font-semibold text-foreground">Aktivitas Terbaru</h3>
        </div>
        <div class="divide-y divide-border">
          <NuxtLink
            v-for="(a, i) in recentActivities"
            :key="i"
            :to="a.href ?? '/'"
            class="p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
          >
            <div class="w-8 h-8 rounded-lg bg-muted/40 text-muted-foreground flex items-center justify-center shrink-0">
              <component :is="a.icon" class="w-3.5 h-3.5" />
            </div>
            <p class="text-sm text-foreground flex-1 min-w-0 truncate">{{ a.label }}</p>
            <span class="text-xs text-muted-foreground shrink-0 font-mono">{{ a.time }}</span>
          </NuxtLink>
          <div v-if="recentActivities.length === 0" class="p-8 text-center text-sm text-muted-foreground">
            Belum ada aktivitas terbaru.
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
