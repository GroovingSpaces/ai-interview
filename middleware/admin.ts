export default defineNuxtRouteMiddleware((to) => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('auth_user')
    const token = localStorage.getItem('auth_token')

    // No auth - redirect to apply (public career portal)
    if (!user || !token) {
      // If accessing root, redirect to apply
      if (to.path === '/') {
        return navigateTo('/apply')
      }
      return navigateTo('/portal-login')
    }

    try {
      const parsedUser = JSON.parse(user)
      
      // Only admin, hr, and recruiter can access admin routes
      if (!['admin', 'hr', 'recruiter'].includes(parsedUser.role)) {
        // Candidates should go to their portal
        return navigateTo('/apply')
      }
    } catch {
      return navigateTo('/portal-login')
    }
  }
})

