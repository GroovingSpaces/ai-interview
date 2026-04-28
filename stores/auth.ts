import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'admin' | 'hr' | 'recruiter' | 'candidate' | 'staff' | 'supervisor' | 'manager' | 'c_level'

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

const PASSWORD_OVERRIDE_KEY = 'auth_password_overrides_v1'

type PasswordOverrides = Record<string, string>

function loadPasswordOverrides(): PasswordOverrides {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PASSWORD_OVERRIDE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as PasswordOverrides
  } catch {
    return {}
  }
}

function savePasswordOverrides(map: PasswordOverrides) {
  if (typeof window === 'undefined') return
  localStorage.setItem(PASSWORD_OVERRIDE_KEY, JSON.stringify(map))
}

function getEffectivePassword(email: string, defaultPassword: string): string {
  const map = loadPasswordOverrides()
  return map[email] ?? defaultPassword
}

/** Roles that can access internal staff portal (dashboard layout) */
export const STAFF_ROLES: UserRole[] = ['admin', 'hr', 'recruiter', 'staff', 'supervisor', 'manager', 'c_level']

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isCandidate = computed(() => user.value?.role === 'candidate')
  const isStaff = computed(() => STAFF_ROLES.includes(user.value?.role || ''))

  // Demo users for testing (admin/hr/recruiter + level C, manager, supervisor, staff)
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
    // Level C, Manager, Supervisor, Staff (jenjang jabatan)
    {
      id: '5',
      email: 'levelc@telkomsel.com',
      password: 'levelc123',
      name: 'Executive Level C',
      role: 'c_level',
      department: 'Executive',
      createdAt: '2024-01-01',
      lastLogin: '2026-01-15',
      isActive: true,
    },
    {
      id: '6',
      email: 'manager@telkomsel.com',
      password: 'manager123',
      name: 'Department Manager',
      role: 'manager',
      department: 'Engineering',
      createdAt: '2024-02-01',
      lastLogin: '2026-01-14',
      isActive: true,
    },
    {
      id: '7',
      email: 'supervisor@telkomsel.com',
      password: 'supervisor123',
      name: 'Team Supervisor',
      role: 'supervisor',
      department: 'Engineering',
      createdAt: '2024-03-01',
      lastLogin: '2026-01-13',
      isActive: true,
    },
    {
      id: '8',
      email: 'staff@telkomsel.com',
      password: 'staff123',
      name: 'Operations Staff',
      role: 'staff',
      department: 'Engineering',
      createdAt: '2024-04-01',
      lastLogin: '2026-01-12',
      isActive: true,
    },
  ]

  async function login(credentials: LoginCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API delay
      await delay(1000)

      const foundUser = demoUsers.find((u) => {
        if (u.email !== credentials.email) return false
        const effective = getEffectivePassword(u.email, u.password)
        return effective === credentials.password
      })

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

  /**
   * Demo-only password change: persists per-email override in localStorage.
   * Next logins use the overridden password (fallback to built-in demo password).
   */
  function changePassword(currentPassword: string, newPassword: string): { ok: boolean; message: string } {
    if (!user.value?.email) return { ok: false, message: 'Not authenticated' }
    if (newPassword.trim().length < 6) return { ok: false, message: 'Password baru minimal 6 karakter.' }

    const demo = demoUsers.find((u) => u.email === user.value!.email)
    const expected = demo ? getEffectivePassword(demo.email, demo.password) : getEffectivePassword(user.value.email, '')

    if (!expected) return { ok: false, message: 'Akun tidak dikenali.' }
    if (currentPassword !== expected) return { ok: false, message: 'Password saat ini salah.' }

    const map = loadPasswordOverrides()
    map[user.value.email] = newPassword
    savePasswordOverrides(map)
    return { ok: true, message: 'Password berhasil diubah.' }
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
    changePassword,
    demoUsers,
  }
})

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

