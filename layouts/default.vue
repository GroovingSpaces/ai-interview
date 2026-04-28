<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  LayoutDashboard,
  Users,
  MonitorPlay,
  Bot,
  GraduationCap,
  Settings,
  Bell,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  ExternalLink,
  Briefcase,
  UserCog,
  ClipboardList,
  UsersRound,
  UserCheck,
  UserX,
  Building2,
  Building,
  Layers,
  TrendingUp,
  ArrowRightLeft,
  MapPin,
  GitBranch,
  CalendarCheck,
  CalendarOff,
  Clock,
  Target,
  CalendarRange,
  FileBarChart,
  Megaphone,
  Calendar,
  CalendarDays,
  AlertTriangle,
  ShieldCheck,
  DollarSign,
} from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'
import { useAiChatbot } from '~/composables/useAiChatbot'
import { useAuthStore } from '~/stores/auth'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t, locale, setLocale } = useI18n()
const router = useRouter()
const { toggleOpen: toggleAiChatbot, isOpen: aiChatbotOpen } = useAiChatbot()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)
const recruitmentMenuOpen = ref(false)
const companyMenuOpen = ref(false)
const managementMenuOpen = ref(false)
const employeeMenuOpen = ref(false)
const timeAttendanceMenuOpen = ref(false)
const leavePermissionMenuOpen = ref(false)
const performanceMenuOpen = ref(false)
const compensationBenefitsMenuOpen = ref(false)
const talentAcquisitionMenuOpen = ref(false)
const workforcePlanningMenuOpen = ref(false)
const successionMenuOpen = ref(false)
const learningMenuOpen = ref(false)
const insightsMenuOpen = ref(false)
const hrServiceMenuOpen = ref(false)
const tasksMenuOpen = ref(false)
const wfmMenuOpen = ref(false)
const profileDropdownOpen = ref(false)

// Use theme composable for persistent theme switching
const { isDark, toggleTheme } = useTheme()

// Auth store
const authStore = useAuthStore()

/** Role-based nav: admin/c_level=all, hr/manager=HCM no users, recruiter=recruitment+announcements+lms, supervisor/staff=attendance+leave+overtime+shifts+announcements+lms */
type NavRole = 'admin' | 'hr' | 'recruiter' | 'staff' | 'supervisor' | 'manager' | 'c_level'
const navByRole = computed(() => {
  const role = (authStore.user?.role ?? 'admin') as NavRole
  const canAccessUsers = role === 'admin' || role === 'c_level'
  return {
    users: canAccessUsers,
    employee: canAccessUsers,
    timeAttendance: canAccessUsers,
    leavePermission: canAccessUsers,
    performance: canAccessUsers,
    compensationBenefits: canAccessUsers,
    talentAcquisition: canAccessUsers,
    workforcePlanning: canAccessUsers,
    succession: canAccessUsers,
    learning: canAccessUsers,
    insights: canAccessUsers,
    hrService: canAccessUsers,
    tasks: canAccessUsers,
    attendance: false,
    leave: false,
    overtime: false,
    shifts: false,
    kpi: false,
    workforceReports: false,
    announcements: false,
    wfm: false,
    recruitment: false,
    company: false,
    learningHub: false,
  }
})

const profileDropdownRef = ref<HTMLElement | null>(null)

/** Avoid hydration mismatch: user comes from localStorage (client-only). Keep server and initial client render identical. */
const isClient = ref(false)

function handleProfileClickOutside(e: MouseEvent) {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target as Node)) {
    profileDropdownOpen.value = false
  }
}

onMounted(() => {
  isClient.value = true
  authStore.initAuth()
  document.addEventListener('click', handleProfileClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleProfileClickOutside)
})

// Sub-menu under Recruitment (name = i18n key)
const recruitmentSubMenu = [
  { name: 'nav.recruitmentDashboard', href: '/recruitment', icon: LayoutDashboard, external: false },
  { name: 'nav.recruitmentFunnel', href: '/recruitment/funnel', icon: Layers, external: false },
  { name: 'nav.candidates', href: '/candidates', icon: Users, external: false },
  { name: 'nav.positions', href: '/positions', icon: Briefcase, external: false },
  { name: 'nav.aiInterview', href: '/interview', icon: MonitorPlay, external: false },
]

// Sub-menu under Employee (label = tampilan, name = untuk i18n/currentPage)
const managementSubMenu = [
  { name: 'nav.users', label: 'Users', href: '/users', icon: UserCog, external: false },
  { name: 'nav.roles', label: 'Roles', href: '/management/roles', icon: ShieldCheck, external: false },
]

// Sub-menu under Employee (label = tampilan, name = untuk i18n/currentPage)
const employeeSubMenu = [
  { name: 'nav.employeeDatabase', label: 'Database', href: '/employees/database', icon: UsersRound, external: false },
  { name: 'nav.employeeContracts', label: 'Contracts', href: '/employees/contracts', icon: ClipboardList, external: false },
  { name: 'nav.employeeDocuments', label: 'Documents', href: '/employees/documents', icon: ClipboardList, external: false },
]

// Sub-menu under Time & Attendance
const timeAttendanceSubMenu = [
  { name: 'nav.myAttendance', label: 'My Attendance', href: '/time-attendance/my-attendance', icon: CalendarCheck, external: false },
  { name: 'nav.teamAttendance', label: 'Team Attendance', href: '/time-attendance/team-attendance', icon: Users, external: false },
  { name: 'nav.shiftSchedule', label: 'Shift Schedule', href: '/time-attendance/shift-schedule', icon: CalendarRange, external: false },
  { name: 'nav.taOvertime', label: 'Overtime', href: '/time-attendance/overtime', icon: Clock, external: false },
  { name: 'nav.attendanceReports', label: 'Attendance Reports', href: '/time-attendance/attendance-reports', icon: FileBarChart, external: false },
]

// Sub-menu under Leave & Permission
const leavePermissionSubMenu = [
  { name: 'nav.myLeave', label: 'My Leave', href: '/leave-permission/my-leave', icon: CalendarOff, external: false },
  { name: 'nav.leaveRequest', label: 'Leave Request', href: '/leave-permission/leave-request', icon: ClipboardList, external: false },
  { name: 'nav.businessTrip', label: 'Business Trip', href: '/leave-permission/business-trip', icon: Briefcase, external: false },
  { name: 'nav.leaveReports', label: 'Leave Reports', href: '/leave-permission/leave-reports', icon: FileBarChart, external: false },
]

// Sub-menu under Performance
const performanceSubMenu = [
  { name: 'nav.myKpi', label: 'My KPI', href: '/performance/my-kpi', icon: Target, external: false },
  { name: 'nav.assignKpi', label: 'Assign KPI', href: '/performance/assign-kpi', icon: Target, external: false },
  { name: 'nav.selfAssessment', label: 'Self-Assessment', href: '/performance/self-assessment', icon: UserCheck, external: false },
  { name: 'nav.teamReview', label: 'Team Review', href: '/performance/team-review', icon: Users, external: false },
  { name: 'nav.calibration', label: 'Calibration', href: '/performance/calibration', icon: Layers, external: false },
  { name: 'nav.pip', label: 'PIP', href: '/performance/pip', icon: AlertTriangle, external: false },
  { name: 'nav.nineGridBox', label: '9-Grid Box', href: '/performance/9-grid-box', icon: GitBranch, external: false },
  { name: 'nav.performancePromotion', label: 'Promotion', href: '/performance/promotion', icon: TrendingUp, external: false },
  { name: 'nav.performanceMutation', label: 'Mutation', href: '/performance/mutation', icon: ArrowRightLeft, external: false },
]

// Sub-menu under Compensation & Benefits
const compensationBenefitsSubMenu = [
  { name: 'nav.payslip', label: 'Payslip', href: '/compensation-benefits/payslip', icon: FileBarChart, external: false },
  { name: 'nav.benefits', label: 'Benefits', href: '/compensation-benefits/benefits', icon: ShieldCheck, external: false },
  { name: 'nav.bonusIncentive', label: 'Bonus & Incentive', href: '/compensation-benefits/bonus-incentive', icon: DollarSign, external: false },
  { name: 'nav.compAdjustment', label: 'Comp Adjustment', href: '/compensation-benefits/comp-adjustment', icon: TrendingUp, external: false },
  { name: 'nav.payrollRun', label: 'Payroll Run', href: '/compensation-benefits/payroll-run', icon: Clock, external: false },
]

// Sub-menu under Talent Acquisition
const talentAcquisitionSubMenu = [
  { name: 'nav.requisitions', label: 'Requisitions', href: '/talent-acquisition/requisitions', icon: ClipboardList, external: false },
  { name: 'nav.jobOpenings', label: 'Job Openings', href: '/talent-acquisition/job-openings', icon: Briefcase, external: false },
  { name: 'nav.talentCandidates', label: 'Candidate', href: '/talent-acquisition/candidates', icon: Users, external: false },
]

// Sub-menu under Workforce Planning
const workforcePlanningSubMenu = [
  { name: 'nav.headcountForecast', label: 'Headcount Forecast', href: '/workforce-planning/headcount-forecast', icon: TrendingUp, external: false },
  { name: 'nav.demandTracker', label: 'Demand Tracker', href: '/workforce-planning/demand-tracker', icon: ClipboardList, external: false },
  { name: 'nav.resourceAllocation', label: 'Resource Allocation', href: '/workforce-planning/resource-allocation', icon: UsersRound, external: false },
]

// Sub-menu under Succession
const successionSubMenu = [
  { name: 'nav.keyRoles', label: 'Key Roles', href: '/succession/key-roles', icon: ShieldCheck, external: false },
  { name: 'nav.successorPool', label: 'Successor Pool', href: '/succession/successor-pool', icon: UserCheck, external: false },
]

// Sub-menu under Learning
const learningSubMenu = [
  { name: 'nav.myLearning', label: 'My Learning', href: '/learning/my-learning', icon: GraduationCap, external: false },
  { name: 'nav.courseCatalog', label: 'Course Catalog', href: '/learning/course-catalog', icon: ClipboardList, external: false },
  { name: 'nav.certifications', label: 'Certifications', href: '/learning/certifications', icon: ShieldCheck, external: false },
  { name: 'nav.training', label: 'Training', href: '/learning/training', icon: CalendarDays, external: false },
]

// Sub-menu under Insights
const insightsSubMenu = [
  { name: 'nav.burnoutIndicator', label: 'Burnout Indicator', href: '/insights/burnout-indicator', icon: AlertTriangle, external: false },
  { name: 'nav.attritionForecast', label: 'Attrition Forecast', href: '/insights/attrition-forecast', icon: TrendingUp, external: false },
  { name: 'nav.trainingSuggestions', label: 'Training Suggestions', href: '/insights/training-suggestions', icon: GraduationCap, external: false },
]

// Sub-menu under HR Service
const hrServiceSubMenu = [
  { name: 'nav.submitRequest', label: 'Submit Request', href: '/hr-service/submit-request', icon: ClipboardList, external: false },
  { name: 'nav.myTickets', label: 'My Tickets', href: '/hr-service/my-tickets', icon: UserCheck, external: false },
  { name: 'nav.serviceConsole', label: 'Service Console', href: '/hr-service/service-console', icon: Settings, external: false },
]

// Sub-menu under Tasks
const tasksSubMenu = [
  { name: 'nav.myTasks', label: 'My Tasks', href: '/tasks/my-tasks', icon: ClipboardList, external: false },
  { name: 'nav.assignTask', label: 'Assign Task', href: '/tasks/assign-task', icon: Users, external: false },
  { name: 'nav.evidenceReview', label: 'Evidence Review', href: '/tasks/evidence-review', icon: ShieldCheck, external: false },
]

// Sub-menu under WFM
const wfmSubMenu = [
  { name: 'nav.wfmDashboard', href: '/wfm', icon: LayoutDashboard, external: false },
  { name: 'nav.wfmShiftSwap', href: '/wfm/shift-swap', icon: ArrowRightLeft, external: false },
  { name: 'nav.wfmAvailability', href: '/wfm/availability', icon: Users, external: false },
  { name: 'nav.wfmHolidays', href: '/wfm/holidays', icon: Calendar, external: false },
  { name: 'nav.wfmCompliance', href: '/wfm/compliance', icon: ShieldCheck, external: false },
  { name: 'nav.wfmOnboarding', href: '/wfm/onboarding', icon: ClipboardList, external: false },
  { name: 'nav.wfmLeaveCalendar', href: '/wfm/leave-calendar', icon: CalendarCheck, external: false },
  { name: 'nav.wfmLaborCost', href: '/wfm/labor-cost', icon: DollarSign, external: false },
]

// Sub-menu under Company
const companySubMenu = [
  { name: 'nav.department', href: '/company/departments', icon: Building, external: false },
  { name: 'nav.divisi', href: '/company/divisions', icon: Layers, external: false },
  { name: 'nav.positionLevel', href: '/company/position-levels', icon: TrendingUp, external: false },
  { name: 'nav.location', href: '/company/locations', icon: MapPin, external: false },
  { name: 'nav.organization', href: '/company/organizations', icon: GitBranch, external: false },
  { name: 'nav.approvalHierarchy', href: '/company/approval-hierarchy', icon: Settings, external: false },
]

// Urutan: Dashboard, then role-filtered items (for pageTitle sync)
const allNavItems = computed(() => {
  if (!navByRole.value.users) return []
  const items: { name: string; href: string; icon: unknown; external: boolean }[] = []
  if (navByRole.value.users) items.push(...managementSubMenu)
  if (navByRole.value.employee) items.push(...employeeSubMenu)
  if (navByRole.value.timeAttendance) items.push(...timeAttendanceSubMenu)
  if (navByRole.value.leavePermission) items.push(...leavePermissionSubMenu)
  if (navByRole.value.performance) items.push(...performanceSubMenu)
  if (navByRole.value.compensationBenefits) items.push(...compensationBenefitsSubMenu)
  if (navByRole.value.talentAcquisition) items.push(...talentAcquisitionSubMenu)
  if (navByRole.value.workforcePlanning) items.push(...workforcePlanningSubMenu)
  if (navByRole.value.succession) items.push(...successionSubMenu)
  if (navByRole.value.learning) items.push(...learningSubMenu)
  if (navByRole.value.insights) items.push(...insightsSubMenu)
  if (navByRole.value.hrService) items.push(...hrServiceSubMenu)
  if (navByRole.value.tasks) items.push(...tasksSubMenu)
  return items
})

const pageTitleState = useState<string>('pageTitleModule', () => 'dashboard')
// Sync header title from route when page doesn't call usePageTitle (e.g. recruitment, company)
const navKeyToModule: Record<string, string> = {
  cuti: 'leave',
  recruitmentDashboard: 'recruitment',
  recruitmentFunnel: 'recruitmentFunnel',
  employeeDatabase: 'employeeDatabase',
  employeeContracts: 'employeeContracts',
  employeeDocuments: 'employeeDocuments',
  promotion: 'promotion',
  mutation: 'mutation',
  myAttendance: 'myAttendance',
  teamAttendance: 'teamAttendance',
  shiftSchedule: 'shiftSchedule',
  taOvertime: 'taOvertime',
  attendanceReports: 'attendanceReports',
  myLeave: 'myLeave',
  leaveRequest: 'leaveRequest',
  businessTrip: 'businessTrip',
  leaveReports: 'leaveReports',
  myKpi: 'myKpi',
  assignKpi: 'assignKpi',
  selfAssessment: 'selfAssessment',
  teamReview: 'teamReview',
  calibration: 'calibration',
  pip: 'pip',
  nineGridBox: 'nineGridBox',
  performancePromotion: 'performancePromotion',
  performanceMutation: 'performanceMutation',
  payslip: 'payslip',
  benefits: 'benefits',
  bonusIncentive: 'bonusIncentive',
  compAdjustment: 'compAdjustment',
  payrollRun: 'payrollRun',
  requisitions: 'requisitions',
  jobOpenings: 'jobOpenings',
  talentCandidates: 'talentCandidates',
  talentRecruitment: 'talentRecruitment',
  headcountForecast: 'headcountForecast',
  demandTracker: 'demandTracker',
  resourceAllocation: 'resourceAllocation',
  keyRoles: 'keyRoles',
  successorPool: 'successorPool',
  myLearning: 'myLearning',
  courseCatalog: 'courseCatalog',
  certifications: 'certifications',
  training: 'training',
  burnoutIndicator: 'burnoutIndicator',
  attritionForecast: 'attritionForecast',
  trainingSuggestions: 'trainingSuggestions',
  submitRequest: 'submitRequest',
  myTickets: 'myTickets',
  serviceConsole: 'serviceConsole',
  myTasks: 'myTasks',
  assignTask: 'assignTask',
  evidenceReview: 'evidenceReview',
  roles: 'roles',
  kpi: 'kpi',
  shifts: 'shifts',
  workforceReports: 'workforceReports',
  announcements: 'announcements',
  wfmDashboard: 'wfm',
  wfmShiftSwap: 'wfmShiftSwap',
  wfmAvailability: 'wfmAvailability',
  wfmHolidays: 'wfmHolidays',
  wfmCompliance: 'wfmCompliance',
  wfmOnboarding: 'wfmOnboarding',
  wfmLeaveCalendar: 'wfmLeaveCalendar',
  wfmLaborCost: 'wfmLaborCost',
  approvalHierarchy: 'approvalHierarchy',
}
watch(
  () => route.path,
  () => {
    const current = allNavItems.value.find(
      (n) => route.path === n.href || route.path.startsWith(n.href + '/')
    )
    const key = current?.name?.replace('nav.', '') ?? 'dashboard'
    pageTitleState.value = navKeyToModule[key] ?? key
  },
  { immediate: true }
)
const { title: currentPage } = usePageTitle()

// Helper to check if a nav item is active
function isNavActive(href: string): boolean {
  if (href === '/') return route.path === '/'
  // Untuk hub seperti /wfm: hanya aktif saat path tepat /wfm, bukan /wfm/...
  if (href === '/wfm') return route.path === '/wfm'
  // Recruitment dashboard should only be active on exact route, not child routes (e.g. /recruitment/funnel)
  if (href === '/recruitment') return route.path === '/recruitment'
  return route.path === href || route.path.startsWith(href + '/')
}

const userInitials = computed(() => {
  if (!isClient.value || !authStore.user?.name) return 'U'
  return authStore.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

function handleLogout() {
  profileDropdownOpen.value = false
  authStore.logout()
  router.push('/portal-login')
}

function closeProfileDropdown() {
  profileDropdownOpen.value = false
}

function goSettings() {
  profileDropdownOpen.value = false
  router.push('/settings')
}
</script>

<template>
  <div class="min-h-screen bg-background grid-bg">
    <!-- Radial gradient overlay -->
    <div class="fixed inset-0 radial-overlay pointer-events-none" />

    <!-- Mobile sidebar backdrop -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobileSidebarOpen"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        @click="toggleMobileSidebar"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full flex flex-col overflow-hidden transition-all duration-300 ease-out',
        'bg-card/80 backdrop-blur-xl border-r border-border',
        isSidebarOpen ? 'w-64' : 'w-20',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 h-16 flex-shrink-0 border-b border-border">
        <div class="relative flex-shrink-0">
          <img src="~/assets/telkomsel.png" alt="Telkomsel" class="w-10 h-10 object-contain" />
        </div>
        <Transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div v-if="isSidebarOpen" class="flex flex-col">
            <span class="text-sm font-bold text-foreground">HCM</span>
            <span class="text-xs text-muted-foreground">Telkomsel</span>
          </div>
        </Transition>
      </div>

      <!-- Navigation (scrollable when content overflows) -->
      <nav class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-2">
        <!-- 1. Dashboard -->
        <NuxtLink
          to="/"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <LayoutDashboard
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.dashboard') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 2. Employee (expandable) - admin, hr -->
        <div v-if="navByRole.employee" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="employeeMenuOpen = !employeeMenuOpen"
          >
            <UsersRound class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.employee') }}</span>
            </Transition>
            <component
              :is="employeeMenuOpen ? ChevronDown : ChevronRight"
              class="w-4 h-4 flex-shrink-0 transition-transform"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[400px]"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="opacity-100 max-h-[400px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="employeeMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in employeeSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href)
                    ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                    isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110',
                  ]"
                />
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-200"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 3. Time & Attendance (expandable) -->
        <div v-if="navByRole.timeAttendance" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="timeAttendanceMenuOpen = !timeAttendanceMenuOpen"
          >
            <CalendarCheck class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.timeAttendance') }}</span>
            </Transition>
            <component
              :is="timeAttendanceMenuOpen ? ChevronDown : ChevronRight"
              class="w-4 h-4 flex-shrink-0 transition-transform"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[500px]"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="opacity-100 max-h-[500px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="timeAttendanceMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in timeAttendanceSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href)
                    ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                    isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110',
                  ]"
                />
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-200"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 4. Leave & Permission (expandable) -->
        <div v-if="navByRole.leavePermission" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="leavePermissionMenuOpen = !leavePermissionMenuOpen"
          >
            <CalendarOff class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.leavePermission') }}</span>
            </Transition>
            <component
              :is="leavePermissionMenuOpen ? ChevronDown : ChevronRight"
              class="w-4 h-4 flex-shrink-0 transition-transform"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[500px]"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="opacity-100 max-h-[500px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="leavePermissionMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in leavePermissionSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href)
                    ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                    isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110',
                  ]"
                />
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-200"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 5. Performance (expandable) -->
        <div v-if="navByRole.performance" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="performanceMenuOpen = !performanceMenuOpen"
          >
            <Target class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.performance') }}</span>
            </Transition>
            <component
              :is="performanceMenuOpen ? ChevronDown : ChevronRight"
              class="w-4 h-4 flex-shrink-0 transition-transform"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[600px]"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="opacity-100 max-h-[600px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="performanceMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in performanceSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href)
                    ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                    isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110',
                  ]"
                />
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-200"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 6. Compensation & Benefits (expandable) -->
        <div v-if="navByRole.compensationBenefits" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="compensationBenefitsMenuOpen = !compensationBenefitsMenuOpen"
          >
            <DollarSign class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.compensationBenefits') }}</span>
            </Transition>
            <component :is="compensationBenefitsMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="compensationBenefitsMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in compensationBenefitsSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 7. Talent Acquisition (expandable) -->
        <div v-if="navByRole.talentAcquisition" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="talentAcquisitionMenuOpen = !talentAcquisitionMenuOpen"
          >
            <Briefcase class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.talentAcquisition') }}</span>
            </Transition>
            <component :is="talentAcquisitionMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="talentAcquisitionMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in talentAcquisitionSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 8. Workforce Planning (expandable) -->
        <div v-if="navByRole.workforcePlanning" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="workforcePlanningMenuOpen = !workforcePlanningMenuOpen"
          >
            <Building2 class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.workforcePlanning') }}</span>
            </Transition>
            <component :is="workforcePlanningMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="workforcePlanningMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in workforcePlanningSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 9. Succession (expandable) -->
        <div v-if="navByRole.succession" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="successionMenuOpen = !successionMenuOpen"
          >
            <GitBranch class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.succession') }}</span>
            </Transition>
            <component :is="successionMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="successionMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in successionSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 10. Learning (expandable) -->
        <div v-if="navByRole.learning" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="learningMenuOpen = !learningMenuOpen"
          >
            <GraduationCap class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.learning') }}</span>
            </Transition>
            <component :is="learningMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="learningMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in learningSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 11. Insights (expandable) -->
        <div v-if="navByRole.insights" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="insightsMenuOpen = !insightsMenuOpen"
          >
            <Bot class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.insights') }}</span>
            </Transition>
            <component :is="insightsMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="insightsMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in insightsSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 12. HR Service (expandable) -->
        <div v-if="navByRole.hrService" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="hrServiceMenuOpen = !hrServiceMenuOpen"
          >
            <Settings class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.hrService') }}</span>
            </Transition>
            <component :is="hrServiceMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="hrServiceMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in hrServiceSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 13. Tasks (expandable) -->
        <div v-if="navByRole.tasks" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="tasksMenuOpen = !tasksMenuOpen"
          >
            <ClipboardList class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.tasks') }}</span>
            </Transition>
            <component :is="tasksMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="tasksMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in tasksSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 4. Absensi - admin, hr -->
        <NuxtLink
          v-if="navByRole.attendance"
          to="/attendance"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/attendance')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <CalendarCheck
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/attendance') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.attendance') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 5. Cuti - admin, hr -->
        <NuxtLink
          v-if="navByRole.leave"
          to="/leave"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/leave')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <CalendarOff
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/leave') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.cuti') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 6. Overtime - admin, hr -->
        <NuxtLink
          v-if="navByRole.overtime"
          to="/overtime"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/overtime')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <Clock
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/overtime') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.overtime') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 6b. Shift & Jadwal - admin, hr -->
        <NuxtLink
          v-if="navByRole.shifts"
          to="/shifts"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/shifts')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <CalendarRange
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/shifts') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.shifts') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 7. KPI - admin, hr -->
        <NuxtLink
          v-if="navByRole.kpi"
          to="/kpi"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/kpi')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <Target
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/kpi') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.kpi') || 'KPI' }}</span>
          </Transition>
        </NuxtLink>

        <!-- 7b. Laporan Tenaga Kerja - admin, hr -->
        <NuxtLink
          v-if="navByRole.workforceReports"
          to="/workforce-reports"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/workforce-reports')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <FileBarChart
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/workforce-reports') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.workforceReports') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 7c. Pengumuman - admin, hr, recruiter -->
        <NuxtLink
          v-if="navByRole.announcements"
          to="/announcements"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/announcements')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <Megaphone
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/announcements') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.announcements') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 7d. Workforce Management (expandable) - admin, hr -->
        <div v-if="navByRole.wfm" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="wfmMenuOpen = !wfmMenuOpen"
          >
            <CalendarDays class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.wfm') }}</span>
            </Transition>
            <component
              :is="wfmMenuOpen ? ChevronDown : ChevronRight"
              class="w-4 h-4 flex-shrink-0 transition-transform"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[600px]"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="opacity-100 max-h-[600px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="wfmMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in wfmSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href)
                    ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                    isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110',
                  ]"
                />
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-200"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ $t(item.name) }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 8. Recruitment (expandable) - admin, hr, recruiter -->
        <div v-if="navByRole.recruitment" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="recruitmentMenuOpen = !recruitmentMenuOpen"
          >
            <ClipboardList class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.recruitment') }}</span>
            </Transition>
            <component
              :is="recruitmentMenuOpen ? ChevronDown : ChevronRight"
              class="w-4 h-4 flex-shrink-0 transition-transform"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[800px]"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="opacity-100 max-h-[800px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="recruitmentMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <template v-for="item in recruitmentSubMenu" :key="item.name + item.href">
                <a
                  v-if="item.external"
                  :href="item.href"
                  target="_blank"
                  :class="[
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  ]"
                >
                  <component
                    :is="item.icon"
                    class="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />
                  <Transition
                    enter-active-class="transition-opacity duration-200"
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <span v-if="isSidebarOpen" class="text-xs font-medium">{{ $t(item.name) }}</span>
                  </Transition>
                  <ExternalLink
                    v-if="isSidebarOpen"
                    class="w-3 h-3 ml-auto text-muted-foreground"
                  />
                </a>
                <NuxtLink
                  v-else
                  :to="item.href"
                  :class="[
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                    isNavActive(item.href)
                      ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  ]"
                  @click="isMobileSidebarOpen = false"
                >
                  <component
                    :is="item.icon"
                    :class="[
                      'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                      isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110',
                    ]"
                  />
                  <Transition
                    enter-active-class="transition-opacity duration-200"
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100"
                    leave-active-class="transition-opacity duration-200"
                    leave-from-class="opacity-100"
                    leave-to-class="opacity-0"
                  >
                    <span v-if="isSidebarOpen" class="text-xs font-medium">{{ $t(item.name) }}</span>
                  </Transition>
                </NuxtLink>
              </template>
            </div>
          </Transition>
        </div>

        <!-- 5. Company (expandable) - admin, hr -->
        <div v-if="navByRole.company" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="companyMenuOpen = !companyMenuOpen"
          >
            <Building2 class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.company') }}</span>
            </Transition>
            <component
              :is="companyMenuOpen ? ChevronDown : ChevronRight"
              class="w-4 h-4 flex-shrink-0 transition-transform"
            />
          </button>
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[600px]"
            leave-active-class="transition-all duration-200 ease-out"
            leave-from-class="opacity-100 max-h-[600px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="companyMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in companySubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href)
                    ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                    isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110',
                  ]"
                />
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-200"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ $t(item.name) }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 6. Learning Hub - admin, hr, recruiter -->
        <NuxtLink
          v-if="navByRole.learningHub"
          to="/lms"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/lms')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <GraduationCap
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/lms') ? 'text-foreground' : 'group-hover:scale-110',
            ]"
          />
          <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.learningHub') }}</span>
          </Transition>
        </NuxtLink>

        <!-- Management (expandable) -->
        <div v-if="navByRole.users" class="space-y-1">
          <button
            type="button"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="managementMenuOpen = !managementMenuOpen"
          >
            <UserCog class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="text-sm font-medium flex-1 text-left">{{ $t('nav.management') }}</span>
            </Transition>
            <component :is="managementMenuOpen ? ChevronDown : ChevronRight" class="w-4 h-4 flex-shrink-0 transition-transform" />
          </button>
          <Transition enter-active-class="transition-all duration-200 ease-out" enter-from-class="opacity-0 max-h-0" enter-to-class="opacity-100 max-h-[500px]" leave-active-class="transition-all duration-200 ease-out" leave-from-class="opacity-100 max-h-[500px]" leave-to-class="opacity-0 max-h-0">
            <div v-show="managementMenuOpen" class="space-y-1 pl-2 ml-2 border-l border-border">
              <NuxtLink
                v-for="item in managementSubMenu"
                :key="item.name + item.href"
                :to="item.href"
                :class="[
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                  isNavActive(item.href) ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="isMobileSidebarOpen = false"
              >
                <component :is="item.icon" :class="['w-4 h-4 flex-shrink-0 transition-transform duration-200', isNavActive(item.href) ? 'text-foreground' : 'group-hover:scale-110']" />
                <Transition
                  enter-active-class="transition-opacity duration-200"
                  enter-from-class="opacity-0"
                  enter-to-class="opacity-100"
                  leave-active-class="transition-opacity duration-200"
                  leave-from-class="opacity-100"
                  leave-to-class="opacity-0"
                >
                  <span v-if="isSidebarOpen" class="text-xs font-medium">{{ item.label }}</span>
                </Transition>
              </NuxtLink>
            </div>
          </Transition>
        </div>
      </nav>
    </aside>

    <!-- Main content -->
    <div
      :class="[
        'min-h-screen transition-all duration-300',
        isSidebarOpen ? 'lg:pl-64' : 'lg:pl-20',
      ]"
    >
      <!-- Header -->
      <header class="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
        <div class="flex items-center justify-between h-full px-4 lg:px-8">
          <div class="flex items-center gap-4">
            <!-- Mobile menu button -->
            <button
              class="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              @click="toggleMobileSidebar"
            >
              <Menu class="w-5 h-5" />
            </button>
            
            <!-- Sidebar toggle -->
            <button
              class="hidden lg:flex p-2 rounded-lg hover:bg-muted/50 transition-colors"
              @click="toggleSidebar"
            >
              <Menu class="w-5 h-5" />
            </button>

            <!-- Page title -->
            <div>
              <h1 class="text-xl font-bold text-foreground">{{ currentPage }}</h1>
              <p class="text-sm text-muted-foreground hidden sm:block">Recruitment Platform</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Language switcher (EN / ID) -->
            <!-- <div class="flex rounded-xl border border-border overflow-hidden bg-muted/30">
              <button
                type="button"
                :class="[
                  'px-3 py-2 text-sm font-medium transition-colors',
                  locale === 'en'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="setLocale('en')"
              >
                EN
              </button>
              <button
                type="button"
                :class="[
                  'px-3 py-2 text-sm font-medium transition-colors border-l border-border',
                  locale === 'id'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                ]"
                @click="setLocale('id')"
              >
                ID
              </button>
            </div> -->

            <!-- Theme toggle (Light/Dark) di navbar -->
            <ClientOnly>
              <button
                class="p-2 rounded-xl hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                :title="isDark ? $t('common.lightMode') : $t('common.darkMode')"
                @click="toggleTheme"
              >
                <Sun v-if="isDark" class="w-5 h-5" />
                <Moon v-else class="w-5 h-5" />
              </button>
              <template #fallback>
                <div class="w-9 h-9 rounded-xl bg-muted/30 animate-pulse" />
              </template>
            </ClientOnly>

            <!-- Notifications -->
            <button class="relative p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <Bell class="w-5 h-5" />
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-ai-red" />
            </button>

            <!-- AI Chatbot (opens panel; trigger moved from floating FAB to header) -->
            <button
              type="button"
              class="p-2 rounded-xl hover:bg-muted/50 transition-colors"
              :class="aiChatbotOpen ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'"
              title="AI Assistant"
              @click="toggleAiChatbot"
            >
              <Bot class="w-5 h-5" />
            </button>

            <!-- Profile dropdown (Settings + Logout) -->
            <div ref="profileDropdownRef" class="relative">
              <button
                type="button"
                class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-muted/50 transition-colors"
                @click.stop="profileDropdownOpen = !profileDropdownOpen"
              >
                <div class="w-8 h-8 rounded-lg bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-sm font-semibold text-white">
                  {{ userInitials }}
                </div>
                <div v-if="isClient && authStore.user" class="hidden lg:block text-left">
                  <p class="text-sm font-medium text-foreground">{{ authStore.user.name }}</p>
                  <p class="text-xs text-muted-foreground capitalize">{{ authStore.user.role }}</p>
                </div>
                <ChevronDown
                  :class="['w-4 h-4 text-muted-foreground transition-transform', profileDropdownOpen && 'rotate-180']"
                />
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
              >
                <div
                  v-show="profileDropdownOpen"
                  class="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-lg py-1 z-50"
                >
                  <button
                    type="button"
                    class="flex items-center gap-3 w-full px-4 py-3 text-left text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                    @click="goSettings"
                  >
                    <Settings class="w-5 h-5 flex-shrink-0" />
                    <span class="font-medium">{{ $t('common.settings') }}</span>
                  </button>
                  <button
                    type="button"
                    class="flex items-center gap-3 w-full px-4 py-3 text-left text-score-low hover:bg-score-low/10 transition-colors"
                    @click="handleLogout"
                  >
                    <LogOut class="w-5 h-5 flex-shrink-0" />
                    <span class="font-medium">{{ $t('common.logout') }}</span>
                  </button>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
    <AiChatbot />
  </div>
</template>

