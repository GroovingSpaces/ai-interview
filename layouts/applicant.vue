<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sun, Moon, LogOut, User, Lock, Eye, EyeOff, X, LogIn, UserPlus, Loader2, AlertCircle, Mail, Phone, MapPin } from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'
import { useAuthStore } from '~/stores/auth'

const { isDark, toggleTheme } = useTheme()
const authStore = useAuthStore()
const router = useRouter()

// Modal states
const showLoginModal = ref(false)
const showRegisterModal = ref(false)

// Login form
const loginForm = ref({
  email: '',
  password: '',
  showPassword: false,
  rememberMe: false,
})
const loginError = ref('')

// Register form
const registerForm = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  showPassword: false,
  agreeTerms: false,
})
const registerError = ref('')
const registerSuccess = ref(false)

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
  return authStore.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

function openLoginModal() {
  showRegisterModal.value = false
  showLoginModal.value = true
  loginError.value = ''
}

function openRegisterModal() {
  showLoginModal.value = false
  showRegisterModal.value = true
  registerError.value = ''
  registerSuccess.value = false
}

function closeModals() {
  showLoginModal.value = false
  showRegisterModal.value = false
  loginError.value = ''
  registerError.value = ''
}

async function handleLogin() {
  loginError.value = ''
  
  const success = await authStore.login({
    email: loginForm.value.email,
    password: loginForm.value.password,
  })

  if (success) {
    // Only allow candidates to login here
    if (!authStore.isCandidate) {
      authStore.logout()
      loginError.value = 'This login is for candidates only. Internal staff please use the Portal Login.'
      return
    }
    closeModals()
    // Reset form
    loginForm.value = {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
    }
  }
}

async function handleRegister() {
  registerError.value = ''
  
  // Validation
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Passwords do not match'
    return
  }
  
  if (registerForm.value.password.length < 6) {
    registerError.value = 'Password must be at least 6 characters'
    return
  }
  
  if (!registerForm.value.agreeTerms) {
    registerError.value = 'Please agree to the Terms and Conditions'
    return
  }

  // Simulate registration (in real app, call API)
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  registerSuccess.value = true
  
  // Reset form after short delay
  setTimeout(() => {
    registerForm.value = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      agreeTerms: false,
    }
    // Switch to login
    openLoginModal()
  }, 2000)
}

function handleLogout() {
  authStore.logout()
}

// Demo credentials
function fillDemoCredentials() {
  loginForm.value.email = 'candidate@email.com'
  loginForm.value.password = 'candidate123'
}

const isLoginFormValid = computed(() => {
  return loginForm.value.email.trim() !== '' && loginForm.value.password.trim() !== ''
})

const isRegisterFormValid = computed(() => {
  return registerForm.value.name.trim() !== '' &&
    registerForm.value.email.trim() !== '' &&
    registerForm.value.password.length >= 6 &&
    registerForm.value.password === registerForm.value.confirmPassword &&
    registerForm.value.agreeTerms
})
</script>

<template>
  <div class="min-h-screen bg-background grid-bg">
    <!-- Radial gradient overlay -->
    <div class="fixed inset-0 radial-overlay pointer-events-none" />

    <!-- Header -->
    <header class="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
      <div class="flex items-center justify-between h-full px-4 max-w-7xl mx-auto">
        <NuxtLink to="/apply" class="flex items-center gap-3">
          <div class="relative">
            <img src="~/assets/telkomsel.png" alt="Telkomsel" class="w-10 h-10 object-contain" />
          </div>
          <div>
            <span class="font-bold text-foreground text-lg">Telkomsel Careers</span>
            <p class="text-xs text-muted-foreground">Powered by AI</p>
          </div>
        </NuxtLink>

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

          <!-- User Info / Login -->
          <template v-if="authStore.isAuthenticated">
            <div class="flex items-center gap-3">
              <div class="hidden sm:flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-sm font-semibold text-white">
                  {{ userInitials }}
                </div>
                <div class="text-left">
                  <p class="text-sm font-medium">{{ authStore.user?.name }}</p>
                  <p class="text-xs text-muted-foreground capitalize">{{ authStore.user?.role }}</p>
                </div>
              </div>
              <button
                class="p-2 rounded-lg hover:bg-score-low/10 transition-colors text-score-low"
                @click="handleLogout"
                title="Logout"
              >
                <LogOut class="w-5 h-5" />
              </button>
            </div>
          </template>
          <template v-else>
            <button
              class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              @click="openLoginModal"
            >
              Sign In
            </button>
            <UiButton variant="gradient" size="sm" @click="openRegisterModal">
              Register
            </UiButton>
          </template>
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

    <!-- Login Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showLoginModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 class="text-xl font-bold text-foreground">Welcome Back</h2>
                <p class="text-sm text-muted-foreground">Sign in to your candidate account</p>
              </div>
              <button
                class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                @click="closeModals"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Modal Content -->
            <div class="p-6">
              <form @submit.prevent="handleLogin" class="space-y-4">
                <!-- Error Alert -->
                <div
                  v-if="authStore.error || loginError"
                  class="flex items-center gap-3 p-3 rounded-xl bg-score-low/10 border border-score-low/30 text-score-low"
                >
                  <AlertCircle class="w-5 h-5 flex-shrink-0" />
                  <p class="text-sm">{{ loginError || authStore.error }}</p>
                </div>

                <!-- Email -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-foreground">Email</label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      v-model="loginForm.email"
                      type="email"
                      placeholder="your@email.com"
                      class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <!-- Password -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-foreground">Password</label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      v-model="loginForm.password"
                      :type="loginForm.showPassword ? 'text' : 'password'"
                      placeholder="Enter password"
                      class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      @click="loginForm.showPassword = !loginForm.showPassword"
                    >
                      <EyeOff v-if="loginForm.showPassword" class="w-5 h-5" />
                      <Eye v-else class="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <!-- Remember & Forgot -->
                <div class="flex items-center justify-between">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="loginForm.rememberMe"
                      type="checkbox"
                      class="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span class="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  <a href="#" class="text-sm text-primary hover:underline">Forgot password?</a>
                </div>

                <!-- Submit -->
                <UiButton
                  type="submit"
                  variant="gradient"
                  class="w-full"
                  :disabled="!isLoginFormValid || authStore.isLoading"
                >
                  <Loader2 v-if="authStore.isLoading" class="w-5 h-5 animate-spin" />
                  <LogIn v-else class="w-5 h-5" />
                  {{ authStore.isLoading ? 'Signing in...' : 'Sign In' }}
                </UiButton>

                <!-- Demo -->
                <button
                  type="button"
                  class="w-full p-3 rounded-xl bg-muted/30 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                  @click="fillDemoCredentials"
                >
                  <p class="text-xs text-muted-foreground">Demo Account</p>
                  <p class="text-sm font-medium text-foreground">candidate@email.com</p>
                </button>
              </form>

              <!-- Register Link -->
              <p class="text-center mt-4 text-sm text-muted-foreground">
                Don't have an account?
                <button class="text-primary hover:underline font-medium" @click="openRegisterModal">
                  Register
                </button>
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Register Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showRegisterModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-card flex items-center justify-between p-6 border-b border-border z-10">
              <div>
                <h2 class="text-xl font-bold text-foreground">Create Account</h2>
                <p class="text-sm text-muted-foreground">Join Telkomsel Careers</p>
              </div>
              <button
                class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                @click="closeModals"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Modal Content -->
            <div class="p-6">
              <!-- Success Message -->
              <div v-if="registerSuccess" class="text-center py-8">
                <div class="w-16 h-16 mx-auto rounded-full bg-score-excellent/10 flex items-center justify-center mb-4">
                  <UserPlus class="w-8 h-8 text-score-excellent" />
                </div>
                <h3 class="text-lg font-semibold text-foreground mb-2">Registration Successful!</h3>
                <p class="text-muted-foreground">Redirecting to login...</p>
              </div>

              <form v-else @submit.prevent="handleRegister" class="space-y-4">
                <!-- Error Alert -->
                <div
                  v-if="registerError"
                  class="flex items-center gap-3 p-3 rounded-xl bg-score-low/10 border border-score-low/30 text-score-low"
                >
                  <AlertCircle class="w-5 h-5 flex-shrink-0" />
                  <p class="text-sm">{{ registerError }}</p>
                </div>

                <!-- Name -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-foreground">Full Name *</label>
                  <div class="relative">
                    <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      v-model="registerForm.name"
                      type="text"
                      placeholder="John Doe"
                      class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <!-- Email -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-foreground">Email *</label>
                  <div class="relative">
                    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      v-model="registerForm.email"
                      type="email"
                      placeholder="your@email.com"
                      class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                  </div>
                </div>

                <!-- Phone -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-foreground">Phone Number</label>
                  <div class="relative">
                    <Phone class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      v-model="registerForm.phone"
                      type="tel"
                      placeholder="+62 812 3456 7890"
                      class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <!-- Password -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-foreground">Password *</label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      v-model="registerForm.password"
                      :type="registerForm.showPassword ? 'text' : 'password'"
                      placeholder="Min. 6 characters"
                      class="w-full pl-10 pr-10 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                    <button
                      type="button"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      @click="registerForm.showPassword = !registerForm.showPassword"
                    >
                      <EyeOff v-if="registerForm.showPassword" class="w-5 h-5" />
                      <Eye v-else class="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <!-- Confirm Password -->
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-foreground">Confirm Password *</label>
                  <div class="relative">
                    <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      v-model="registerForm.confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                    />
                  </div>
                  <p v-if="registerForm.password && registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword" class="text-xs text-score-low">
                    Passwords do not match
                  </p>
                </div>

                <!-- Terms -->
                <label class="flex items-start gap-2 cursor-pointer">
                  <input
                    v-model="registerForm.agreeTerms"
                    type="checkbox"
                    class="w-4 h-4 mt-0.5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span class="text-sm text-muted-foreground">
                    I agree to the <a href="#" class="text-primary hover:underline">Terms of Service</a> and <a href="#" class="text-primary hover:underline">Privacy Policy</a>
                  </span>
                </label>

                <!-- Submit -->
                <UiButton
                  type="submit"
                  variant="gradient"
                  class="w-full"
                  :disabled="!isRegisterFormValid"
                >
                  <UserPlus class="w-5 h-5" />
                  Create Account
                </UiButton>
              </form>

              <!-- Login Link -->
              <p v-if="!registerSuccess" class="text-center mt-4 text-sm text-muted-foreground">
                Already have an account?
                <button class="text-primary hover:underline font-medium" @click="openLoginModal">
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
