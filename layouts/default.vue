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
  Sparkles,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
} from 'lucide-vue-next'

const route = useRoute()
const isSidebarOpen = ref(true)
const isMobileSidebarOpen = ref(false)
const isDarkMode = ref(true)

const navigation = [
  { name: 'Command Center', href: '/', icon: LayoutDashboard },
  { name: 'Candidates', href: '/candidates', icon: Users },
  { name: 'AI Interview', href: '/interview', icon: Video },
  { name: 'Learning Hub', href: '/lms', icon: GraduationCap },
  { name: 'Applications', href: '/apply', icon: FileText },
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

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('light', !isDarkMode.value)
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
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-ai-cyan via-ai-purple to-ai-pink flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-score-excellent border-2 border-background" />
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
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
            route.path === item.href
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="isMobileSidebarOpen = false"
        >
          <component
            :is="item.icon"
            :class="[
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              route.path === item.href ? 'text-primary' : 'group-hover:scale-110',
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
            class="w-4 h-4 ml-auto text-primary"
          />
        </NuxtLink>
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
          <Sun v-if="isDarkMode" class="w-5 h-5 flex-shrink-0" />
          <Moon v-else class="w-5 h-5 flex-shrink-0" />
          <span v-if="isSidebarOpen" class="font-medium">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
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
              <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-ai-pink" />
            </button>

            <!-- User avatar -->
            <button class="flex items-center gap-3 p-1.5 rounded-xl hover:bg-muted/50 transition-colors">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-ai-cyan to-ai-purple flex items-center justify-center text-sm font-semibold text-white">
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

