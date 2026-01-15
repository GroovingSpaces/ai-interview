import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'admin' | 'hr' | 'recruiter' | 'candidate'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  department?: string
  createdAt: string
  lastLogin?: string
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCandidate = computed(() => user.value?.role === 'candidate')
  const isStaff = computed(() => ['admin', 'hr', 'recruiter'].includes(user.value?.role || ''))

  // Demo users for testing
  const demoUsers: Array<User & { password: string }> = [
    {
      id: '1',
      email: 'admin@telkomsel.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'admin',
      department: 'IT',
      createdAt: '2024-01-01',
      lastLogin: '2026-01-15',
      isActive: true,
    },
    {
      id: '2',
      email: 'hr@telkomsel.com',
      password: 'hr123',
      name: 'HR Manager',
      role: 'hr',
      department: 'Human Resources',
      createdAt: '2024-03-15',
      lastLogin: '2026-01-14',
      isActive: true,
    },
    {
      id: '3',
      email: 'recruiter@telkomsel.com',
      password: 'recruiter123',
      name: 'John Recruiter',
      role: 'recruiter',
      department: 'Talent Acquisition',
      createdAt: '2024-06-01',
      lastLogin: '2026-01-15',
      isActive: true,
    },
    {
      id: '4',
      email: 'candidate@email.com',
      password: 'candidate123',
      name: 'Jane Applicant',
      role: 'candidate',
      createdAt: '2026-01-10',
      lastLogin: '2026-01-15',
      isActive: true,
    },
  ]

  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await delay(1000)

      const foundUser = demoUsers.find(
        u => u.email === credentials.email && u.password === credentials.password
      )

      if (!foundUser) {
        error.value = 'Invalid email or password'
        return false
      }

      if (!foundUser.isActive) {
        error.value = 'Your account has been deactivated'
        return false
      }

      const { password: _, ...userWithoutPassword } = foundUser
      user.value = userWithoutPassword
      token.value = `demo-token-${foundUser.id}-${Date.now()}`

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user.value))
        localStorage.setItem('auth_token', token.value)
      }

      return true
    } catch (e) {
      error.value = 'An error occurred during login'
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    }
  }

  function initAuth() {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user')
      const storedToken = localStorage.getItem('auth_token')

      if (storedUser && storedToken) {
        try {
          user.value = JSON.parse(storedUser)
          token.value = storedToken
        } catch {
          logout()
        }
      }
    }
  }

  function hasPermission(requiredRoles: UserRole[]): boolean {
    if (!user.value) return false
    return requiredRoles.includes(user.value.role)
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isCandidate,
    isStaff,
    login,
    logout,
    initAuth,
    hasPermission,
    demoUsers,
  }
})

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

