<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, User, Lock, Building2 } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

useHead({
  title: 'Internal Login - Telkomsel AI HCM',
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loginError = ref('')

async function handleLogin() {
  loginError.value = ''
  
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })

  if (success) {
    // Only allow staff to login here
    if (authStore.isCandidate) {
      authStore.logout()
      loginError.value = 'This login is for internal staff only. Please use the Candidate login.'
      return
    }
    router.push('/')
  }
}

// Demo credentials info - only internal staff
const demoCredentials = [
  { role: 'Admin', email: 'admin@telkomsel.com', password: 'admin123' },
  { role: 'HR', email: 'hr@telkomsel.com', password: 'hr123' },
  { role: 'Recruiter', email: 'recruiter@telkomsel.com', password: 'recruiter123' },
]

function fillCredentials(cred: typeof demoCredentials[0]) {
  email.value = cred.email
  password.value = cred.password
}
</script>

<template>
  <div class="min-h-screen bg-background grid-bg flex items-center justify-center p-4">
    <!-- Background effects -->
    <div class="fixed inset-0 radial-overlay pointer-events-none" />
    
    <div class="w-full max-w-md relative z-10">
      <!-- Logo & Header -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-t from-ai-orange to-ai-red p-0.5 mb-4">
          <div class="w-full h-full rounded-2xl bg-background flex items-center justify-center">
            <img src="~/assets/telkomsel.png" alt="Telkomsel" class="w-12 h-12 object-contain" />
          </div>
        </div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Building2 class="w-4 h-4" />
          Internal Staff
        </div>
        <h1 class="text-2xl font-bold text-foreground">Staff Portal</h1>
        <p class="text-muted-foreground mt-1">Sign in to Telkomsel AI HCM Dashboard</p>
      </div>

      <!-- Login Card -->
      <div class="glass-card p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error Alert -->
          <div
            v-if="authStore.error || loginError"
            class="flex items-center gap-3 p-4 rounded-xl bg-score-low/10 border border-score-low/30 text-score-low"
          >
            <AlertCircle class="w-5 h-5 flex-shrink-0" />
            <p class="text-sm">{{ loginError || authStore.error }}</p>
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-foreground">Email</label>
            <div class="relative">
              <User class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                class="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-foreground">Password</label>
            <div class="relative">
              <Lock class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="w-full pl-12 pr-12 py-3 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                required
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Remember Me & Forgot Password -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <span class="text-sm text-muted-foreground">Remember me</span>
            </label>
            <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
          </div>

          <!-- Submit Button -->
          <UiButton
            type="submit"
            variant="gradient"
            class="w-full"
            :disabled="authStore.isLoading"
          >
            <Loader2 v-if="authStore.isLoading" class="w-5 h-5 animate-spin" />
            <LogIn v-else class="w-5 h-5" />
            {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
          </UiButton>
        </form>

        <!-- Divider -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-card px-2 text-muted-foreground">Demo Credentials</span>
          </div>
        </div>

        <!-- Demo Credentials -->
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="cred in demoCredentials"
            :key="cred.role"
            type="button"
            class="p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
            @click="fillCredentials(cred)"
          >
            <p class="text-sm font-medium text-foreground">{{ cred.role }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ cred.email }}</p>
          </button>
        </div>
      </div>

      <!-- Candidate Link -->
      <p class="text-center mt-6 text-muted-foreground">
        Are you a candidate?
        <NuxtLink to="/apply" class="text-primary hover:underline font-medium">
          Go to Career Portal
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

