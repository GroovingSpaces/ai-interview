<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  LayoutDashboard,
  Users,
  MonitorPlay,
  GraduationCap,
  FileText,
  Settings,
  Settings2,
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
  Banknote,
  MapPin,
  GitBranch,
  CalendarCheck,
  CalendarOff,
  Clock,
} from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'
import { useAuthStore } from '~/stores/auth'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t, locale, setLocale } = useI18n()
const router = useRouter()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)
const recruitmentMenuOpen = ref(true)
const companyMenuOpen = ref(false)
const employeeMenuOpen = ref(false)
const profileDropdownOpen = ref(false)

// Use theme composable for persistent theme switching
const { isDark, toggleTheme } = useTheme()

// Auth store
const authStore = useAuthStore()

const profileDropdownRef = ref<HTMLElement | null>(null)

function handleProfileClickOutside(e: MouseEvent) {
  if (profileDropdownRef.value && !profileDropdownRef.value.contains(e.target as Node)) {
    profileDropdownOpen.value = false
  }
}

onMounted(() => {
  authStore.initAuth()
  document.addEventListener('click', handleProfileClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleProfileClickOutside)
})

// Sub-menu under Recruitment (name = i18n key)
const recruitmentSubMenu = [
  { name: 'nav.recruitmentDashboard', href: '/recruitment', icon: LayoutDashboard, external: false },
  { name: 'nav.candidates', href: '/candidates', icon: Users, external: false },
  { name: 'nav.positions', href: '/positions', icon: Briefcase, external: false },
  { name: 'nav.aiInterview', href: '/interview', icon: MonitorPlay, external: false },
  { name: 'nav.applications', href: '/apply', icon: FileText, external: true },
]

// Sub-menu under Employee (label = tampilan, name = untuk i18n/currentPage)
const employeeSubMenu = [
  { name: 'nav.employeeDatabase', label: 'Database', href: '/employees/database', icon: UsersRound, external: false },
  { name: 'nav.promotion', label: 'Promotion', href: '/employees/promotion', icon: TrendingUp, external: false },
  { name: 'nav.mutation', label: 'Mutation', href: '/employees/mutation', icon: ArrowRightLeft, external: false },
  { name: 'nav.initialPayroll', label: 'Initial Payroll', href: '/employees/payroll/initial', icon: Settings2, external: false },
  { name: 'nav.generatePayroll', label: 'Generate Payroll', href: '/employees/payroll', icon: Banknote, external: false },
  { name: 'nav.retired', label: 'Retired', href: '/employees/retired', icon: UserX, external: false },
]

// Sub-menu under Company
const companySubMenu = [
  { name: 'nav.department', href: '/company/departments', icon: Building, external: false },
  { name: 'nav.divisi', href: '/company/divisions', icon: Layers, external: false },
  { name: 'nav.positionLevel', href: '/company/position-levels', icon: TrendingUp, external: false },
  { name: 'nav.location', href: '/company/locations', icon: MapPin, external: false },
  { name: 'nav.organization', href: '/company/organizations', icon: GitBranch, external: false },
]

// Urutan: Dashboard, Users, Employee, Absensi, Cuti, Recruitment sub, Company sub, Learning Hub
const allNavItems = computed(() => {
  const items: { name: string; href: string; icon: unknown; external: boolean }[] = [
    { name: 'nav.dashboard', href: '/', icon: LayoutDashboard, external: false },
  ]
  if (authStore.isStaff) {
    items.push({ name: 'nav.users', href: '/users', icon: UserCog, external: false })
  }
  items.push(...employeeSubMenu)
  items.push({ name: 'nav.attendance', href: '/attendance', icon: CalendarCheck, external: false })
  items.push({ name: 'nav.cuti', href: '/leave', icon: CalendarOff, external: false })
  items.push({ name: 'nav.overtime', href: '/overtime', icon: Clock, external: false })
  items.push(...recruitmentSubMenu)
  items.push(...companySubMenu)
  items.push({ name: 'nav.learningHub', href: '/lms', icon: GraduationCap, external: false })
  return items
})

const pageTitleState = useState<string>('pageTitleModule', () => 'dashboard')
// Sync header title from route when page doesn't call usePageTitle (e.g. recruitment, company)
const navKeyToModule: Record<string, string> = {
  cuti: 'leave',
  recruitmentDashboard: 'recruitment',
  employeeDatabase: 'employee',
  mutation: 'mutation',
  payroll: 'payroll',
  initialPayroll: 'initialPayroll',
  generatePayroll: 'generatePayroll',
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
  return route.path === href || route.path.startsWith(href + '/')
}

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
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

        <!-- 2. Users (staff only) -->
        <NuxtLink
          v-if="authStore.isStaff"
          to="/users"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            isNavActive('/users')
              ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <UserCog
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              isNavActive('/users') ? 'text-foreground' : 'group-hover:scale-110',
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
            <span v-if="isSidebarOpen" class="text-sm font-medium">{{ $t('nav.users') }}</span>
          </Transition>
        </NuxtLink>

        <!-- 3. Employee (expandable) -->
        <div class="space-y-1">
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
                <ChevronRight
                  v-if="isSidebarOpen && isNavActive(item.href)"
                  class="w-3.5 h-3.5 ml-auto text-foreground"
                />
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 4. Absensi -->
        <NuxtLink
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

        <!-- 5. Cuti -->
        <NuxtLink
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

        <!-- 6. Overtime -->
        <NuxtLink
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

        <!-- 7. Recruitment (expandable) -->
        <div class="space-y-1">
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
                  <ChevronRight
                    v-if="isSidebarOpen && isNavActive(item.href)"
                    class="w-3.5 h-3.5 ml-auto text-foreground"
                  />
                </NuxtLink>
              </template>
            </div>
          </Transition>
        </div>

        <!-- 5. Company (expandable) -->
        <div class="space-y-1">
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
                <ChevronRight
                  v-if="isSidebarOpen && isNavActive(item.href)"
                  class="w-3.5 h-3.5 ml-auto text-foreground"
                />
              </NuxtLink>
            </div>
          </Transition>
        </div>

        <!-- 6. Learning Hub -->
        <NuxtLink
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
            <div class="flex rounded-xl border border-border overflow-hidden bg-muted/30">
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
            </div>

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
                <div v-if="authStore.user" class="hidden lg:block text-left">
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
                    @click="closeProfileDropdown"
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
  </div>
</template>

