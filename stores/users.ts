import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from './auth'

export interface CreateUserPayload {
  email: string
  name: string
  role: UserRole
  department?: string
  password: string
}

export interface UpdateUserPayload {
  email?: string
  name?: string
  role?: UserRole
  department?: string
  isActive?: boolean
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([
    // Admin users
    {
      id: '1',
      email: 'admin@telkomsel.com',
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
      name: 'John Recruiter',
      role: 'recruiter',
      department: 'Talent Acquisition',
      createdAt: '2024-06-01',
      lastLogin: '2026-01-15',
      isActive: true,
    },
    {
      id: '4',
      email: 'recruiter2@telkomsel.com',
      name: 'Sarah Smith',
      role: 'recruiter',
      department: 'Engineering Recruitment',
      createdAt: '2024-08-15',
      lastLogin: '2026-01-13',
      isActive: true,
    },
    // Candidate users
    {
      id: '5',
      email: 'candidate@email.com',
      name: 'Jane Applicant',
      role: 'candidate',
      createdAt: '2026-01-10',
      lastLogin: '2026-01-15',
      isActive: true,
    },
    {
      id: '6',
      email: 'john.doe@email.com',
      name: 'John Doe',
      role: 'candidate',
      createdAt: '2026-01-08',
      lastLogin: '2026-01-12',
      isActive: true,
    },
    {
      id: '7',
      email: 'alice.wong@email.com',
      name: 'Alice Wong',
      role: 'candidate',
      createdAt: '2026-01-05',
      lastLogin: '2026-01-14',
      isActive: true,
    },
    {
      id: '8',
      email: 'bob.johnson@email.com',
      name: 'Bob Johnson',
      role: 'candidate',
      createdAt: '2025-12-20',
      lastLogin: '2026-01-10',
      isActive: false,
    },
    {
      id: '9',
      email: 'maria.garcia@email.com',
      name: 'Maria Garcia',
      role: 'candidate',
      createdAt: '2026-01-12',
      lastLogin: '2026-01-15',
      isActive: true,
    },
    {
      id: '10',
      email: 'david.lee@email.com',
      name: 'David Lee',
      role: 'candidate',
      createdAt: '2026-01-11',
      lastLogin: '2026-01-14',
      isActive: true,
    },
  ])

  const searchQuery = ref('')
  const roleFilter = ref<string>('all')
  const statusFilter = ref<string>('all')

  // Computed
  const adminUsers = computed(() => 
    users.value.filter(u => ['admin', 'hr', 'recruiter'].includes(u.role))
  )

  const candidateUsers = computed(() => 
    users.value.filter(u => u.role === 'candidate')
  )

  const filteredUsers = computed(() => {
    let result = users.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.department?.toLowerCase().includes(query)
      )
    }

    if (roleFilter.value !== 'all') {
      result = result.filter(u => u.role === roleFilter.value)
    }

    if (statusFilter.value !== 'all') {
      const isActive = statusFilter.value === 'active'
      result = result.filter(u => u.isActive === isActive)
    }

    return result
  })

  const filteredAdminUsers = computed(() =>
    filteredUsers.value.filter(u => ['admin', 'hr', 'recruiter'].includes(u.role))
  )

  const filteredCandidateUsers = computed(() =>
    filteredUsers.value.filter(u => u.role === 'candidate')
  )

  const userStats = computed(() => ({
    total: users.value.length,
    admins: users.value.filter(u => u.role === 'admin').length,
    hr: users.value.filter(u => u.role === 'hr').length,
    recruiters: users.value.filter(u => u.role === 'recruiter').length,
    candidates: users.value.filter(u => u.role === 'candidate').length,
    active: users.value.filter(u => u.isActive).length,
    inactive: users.value.filter(u => !u.isActive).length,
  }))

  // Actions
  function addUser(payload: CreateUserPayload): string {
    const newId = String(Date.now())
    const newUser: User = {
      id: newId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      department: payload.department,
      createdAt: new Date().toISOString().split('T')[0],
      isActive: true,
    }
    users.value.push(newUser)
    return newId
  }

  function updateUser(id: string, updates: UpdateUserPayload): boolean {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...updates }
      return true
    }
    return false
  }

  function deleteUser(id: string): boolean {
    const index = users.value.findIndex(u => u.id === id)
    if (index !== -1) {
      users.value.splice(index, 1)
      return true
    }
    return false
  }

  function toggleUserStatus(id: string): boolean {
    const user = users.value.find(u => u.id === id)
    if (user) {
      user.isActive = !user.isActive
      return true
    }
    return false
  }

  function getUserById(id: string): User | undefined {
    return users.value.find(u => u.id === id)
  }

  return {
    users,
    searchQuery,
    roleFilter,
    statusFilter,
    adminUsers,
    candidateUsers,
    filteredUsers,
    filteredAdminUsers,
    filteredCandidateUsers,
    userStats,
    addUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getUserById,
  }
})

