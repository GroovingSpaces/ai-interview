import { STAFF_ROLES } from '~/stores/auth'

type UserRole = 'admin' | 'hr' | 'recruiter' | 'staff' | 'supervisor' | 'manager' | 'c_level'

/** Only admin and c_level can access */
const adminOnlyPaths = ['/users']
/** Admin, hr, manager, c_level (recruiter, supervisor, staff cannot) */
const adminOrHrOrManagerPaths = [
  '/employees',
  '/kpi',
  '/workforce-reports',
  '/wfm',
  '/company',
]
/** Supervisor and staff can access (with manager/hr/admin/c_level) */
const supervisorOrStaffPaths = ['/attendance', '/leave', '/overtime', '/shifts', '/announcements', '/lms']
/** Recruitment: admin, hr, recruiter, manager, c_level (supervisor, staff cannot) */
const recruitmentPaths = ['/recruitment', '/candidates', '/positions', '/interview']

function pathMatches(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + '/'))
}

export default defineNuxtRouteMiddleware((to) => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token')

    if (!user || !token) {
      return navigateTo('/portal-login')
    }

    try {
      const parsedUser = JSON.parse(user) as { role: string }
      const role = parsedUser.role as UserRole

      // Staff portal: admin, hr, recruiter, staff, supervisor, manager, c_level
      if (!STAFF_ROLES.includes(role as any) || role === 'candidate') {
        return navigateTo('/portal-login')
      }

      // Dashboard always allowed
      if (to.path === '/') return

      // Admin-only: /users
      if (pathMatches(to.path, adminOnlyPaths)) {
        if (role !== 'admin' && role !== 'c_level') return navigateTo('/')
        return
      }

      // HCM (employee, kpi, wfm, company): admin, hr, manager, c_level
      if (pathMatches(to.path, adminOrHrOrManagerPaths)) {
        if (['recruiter', 'supervisor', 'staff'].includes(role)) return navigateTo('/')
        return
      }

      // Recruitment: admin, hr, recruiter (manager/supervisor/staff/c_level no access by default; we allow c_level to see all)
      if (pathMatches(to.path, recruitmentPaths)) {
        if (role === 'supervisor' || role === 'staff') return navigateTo('/')
        return
      }

      // Attendance, leave, overtime, shifts, announcements, lms: all staff roles
      if (pathMatches(to.path, supervisorOrStaffPaths)) return
    } catch {
      return navigateTo('/portal-login')
    }
  }
})

