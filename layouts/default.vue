<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  LayoutDashboard,
  Users,
  Video,
  GraduationCap,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  ExternalLink,
} from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'

const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)

// Use theme composable for persistent theme switching
const { isDark, toggleTheme } = useTheme()

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, external: false },
  { name: 'Candidates', href: '/candidates', icon: Users, external: false },
  { name: 'AI Interview', href: '/interview', icon: Video, external: false },
  { name: 'Learning Hub', href: '/lms', icon: GraduationCap, external: false },
  { name: 'Applications', href: '/apply', icon: FileText, external: true },
]

const currentPage = computed(() => {
  const current = navigation.find(n => n.href === route.path)
  return current?.name || 'Dashboard'
})

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
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
        'fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-out',
        'bg-card/80 backdrop-blur-xl border-r border-border',
        isSidebarOpen ? 'w-64' : 'w-20',
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 h-16 border-b border-border">
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
            <span class="font-bold text-foreground">AI HCM</span>
            <span class="text-xs text-muted-foreground">Telkomsel</span>
          </div>
        </Transition>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <template v-for="item in navigation" :key="item.name">
          <!-- External link (open in new tab) -->
          <a
            v-if="item.external"
            :href="item.href"
            target="_blank"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
              'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <Transition
              enter-active-class="transition-opacity duration-200"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition-opacity duration-200"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span v-if="isSidebarOpen" class="font-medium">{{ item.name }}</span>
            </Transition>
            <ExternalLink
              v-if="isSidebarOpen"
              class="w-3.5 h-3.5 ml-auto text-muted-foreground"
            />
          </a>
          <!-- Internal link -->
          <NuxtLink
            v-else
            :to="item.href"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
              route.path === item.href
                ? 'bg-foreground/10 text-foreground border border-foreground/20 font-semibold'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            ]"
            @click="isMobileSidebarOpen = false"
          >
            <component
              :is="item.icon"
              :class="[
                'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                route.path === item.href ? 'text-foreground' : 'group-hover:scale-110',
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
              <span v-if="isSidebarOpen" class="font-medium">{{ item.name }}</span>
            </Transition>
            <ChevronRight
              v-if="isSidebarOpen && route.path === item.href"
              class="w-4 h-4 ml-auto text-foreground"
            />
          </NuxtLink>
        </template>
      </nav>

      <!-- Bottom section -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <button
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200',
            'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="w-5 h-5 flex-shrink-0" />
          <Moon v-else class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="font-medium">{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
        <button
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all duration-200',
            'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
        >
          <Settings class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="font-medium">Settings</span>
        </button>
      </div>
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
              <p class="text-sm text-muted-foreground hidden sm:block">AI-Powered Recruitment Platform</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border">
              <Search class="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                class="bg-transparent border-none outline-none text-sm w-48 placeholder:text-muted-foreground"
              >
              <kbd class="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background text-xs text-muted-foreground border border-border">
                ⌘K
              </kbd>
            </div>

            <!-- Notifications -->
            <button class="relative p-2 rounded-xl hover:bg-muted/50 transition-colors">
              <Bell class="w-5 h-5" />
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-ai-red" />
            </button>

            <!-- User avatar -->
            <button class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-muted/50 transition-colors">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-sm font-semibold text-white">
                HR
              </div>
              <div class="hidden lg:block text-left">
                <p class="text-sm font-medium">HR Admin</p>
                <p class="text-xs text-muted-foreground">IT Manager</p>
              </div>
            </button>
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

