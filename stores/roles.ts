import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Role {
  id: string
  name: string
  code: string
  description?: string
  permissions: string[]
  isSystem?: boolean
}

export const ALL_PERMISSIONS = [
  { value: 'employee.view', label: 'Lihat data karyawan', group: 'Employee' },
  { value: 'employee.manage', label: 'Kelola data karyawan', group: 'Employee' },
  { value: 'attendance.view', label: 'Lihat absensi', group: 'Attendance' },
  { value: 'attendance.approve', label: 'Approve absensi', group: 'Attendance' },
  { value: 'leave.request', label: 'Ajukan cuti', group: 'Leave' },
  { value: 'leave.approve', label: 'Approve cuti', group: 'Leave' },
  { value: 'overtime.request', label: 'Ajukan lembur', group: 'Overtime' },
  { value: 'overtime.approve', label: 'Approve lembur', group: 'Overtime' },
  { value: 'kpi.view', label: 'Lihat KPI', group: 'Performance' },
  { value: 'kpi.manage', label: 'Kelola KPI', group: 'Performance' },
  { value: 'payroll.view', label: 'Lihat payroll', group: 'Compensation' },
  { value: 'payroll.run', label: 'Jalankan payroll', group: 'Compensation' },
  { value: 'recruitment.view', label: 'Lihat rekrutmen', group: 'Talent Acquisition' },
  { value: 'recruitment.manage', label: 'Kelola rekrutmen', group: 'Talent Acquisition' },
  { value: 'learning.access', label: 'Akses learning', group: 'Learning' },
  { value: 'learning.manage', label: 'Kelola learning', group: 'Learning' },
  { value: 'admin.users', label: 'Kelola user portal', group: 'Admin' },
  { value: 'admin.roles', label: 'Kelola role & permission', group: 'Admin' },
] as const

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([
    {
      id: '1',
      name: 'Admin',
      code: 'ADMIN',
      description: 'Full access to all modules',
      permissions: ALL_PERMISSIONS.map((p) => p.value),
      isSystem: true,
    },
    {
      id: '2',
      name: 'HR',
      code: 'HR',
      description: 'HR operations: employees, payroll, recruitment',
      permissions: [
        'employee.view',
        'employee.manage',
        'attendance.view',
        'leave.approve',
        'overtime.approve',
        'payroll.view',
        'payroll.run',
        'recruitment.view',
        'recruitment.manage',
      ],
    },
    {
      id: '3',
      name: 'Manager',
      code: 'MANAGER',
      description: 'Team management and approvals',
      permissions: [
        'employee.view',
        'attendance.view',
        'attendance.approve',
        'leave.approve',
        'overtime.approve',
        'kpi.view',
        'kpi.manage',
      ],
    },
    {
      id: '4',
      name: 'Employee',
      code: 'EMPLOYEE',
      description: 'Self-service for staff',
      permissions: ['leave.request', 'overtime.request', 'kpi.view', 'learning.access'],
    },
    {
      id: '5',
      name: 'Recruiter',
      code: 'RECRUITER',
      description: 'Recruitment specialist',
      permissions: ['recruitment.view', 'recruitment.manage'],
    },
  ])

  const searchQuery = ref('')

  const filteredRoles = computed(() => {
    if (!searchQuery.value) return roles.value
    const q = searchQuery.value.toLowerCase()
    return roles.value.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q),
    )
  })

  function addRole(payload: Omit<Role, 'id'>): string {
    const id = String(Date.now())
    roles.value.push({ ...payload, id })
    return id
  }
  function updateRole(id: string, updates: Partial<Omit<Role, 'id'>>): boolean {
    const i = roles.value.findIndex((r) => r.id === id)
    if (i === -1) return false
    roles.value[i] = { ...roles.value[i], ...updates }
    return true
  }
  function deleteRole(id: string): boolean {
    const i = roles.value.findIndex((r) => r.id === id)
    if (i === -1 || roles.value[i].isSystem) return false
    roles.value.splice(i, 1)
    return true
  }
  function getRoleById(id: string) {
    return roles.value.find((r) => r.id === id)
  }

  const permissionGroups = computed(() => {
    const groups = new Map<string, typeof ALL_PERMISSIONS[number][]>()
    for (const p of ALL_PERMISSIONS) {
      if (!groups.has(p.group)) groups.set(p.group, [])
      groups.get(p.group)!.push(p)
    }
    return Array.from(groups.entries()).map(([group, items]) => ({ group, items }))
  })

  return {
    roles,
    searchQuery,
    filteredRoles,
    addRole,
    updateRole,
    deleteRole,
    getRoleById,
    permissionGroups,
  }
})
