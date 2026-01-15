<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <div class="min-h-screen bg-background grid-bg">
    <!-- Radial gradient overlay -->
    <div class="fixed inset-0 radial-overlay pointer-events-none" />

    <!-- Header -->
    <header class="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        <div class="flex items-center gap-3">
          <div class="relative">
            <img src="~/assets/telkomsel.png" alt="Telkomsel" class="w-10 h-10 object-contain" />
          </div>
          <div>
            <span class="font-bold text-foreground text-lg">Telkomsel Careers</span>
            <p class="text-xs text-muted-foreground">Powered by AI</p>
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink to="/apply" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Apply Now
          </NuxtLink>
          <NuxtLink to="/apply/positions" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Open Positions
          </NuxtLink>
          <NuxtLink to="/apply/status" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Check Status
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <button
            class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            @click="toggleTheme"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <Sun v-if="isDark" class="w-5 h-5 text-muted-foreground" />
            <Moon v-else class="w-5 h-5 text-muted-foreground" />
          </button>

          <UiButton variant="gradient" size="sm">
            Sign In
          </UiButton>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="border-t border-border py-8 mt-12">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-muted-foreground">
            © 2026 Telkomsel. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" class="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

