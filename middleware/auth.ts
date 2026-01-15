export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check on login page and apply routes (public)
  if (to.path === '/portal-login' || to.path.startsWith('/apply')) {
    return
  }

  // Check if we're on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token')
    const user = localStorage.getItem('auth_user')

    // If no token or user, redirect to portal login for internal routes
    if (!token || !user) {
      return navigateTo('/portal-login')
    }

    try {
      const parsedUser = JSON.parse(user)
      
      // Check if candidate trying to access admin routes
      if (parsedUser.role === 'candidate') {
        const adminRoutes = ['/', '/candidates', '/positions', '/interview', '/lms', '/users']
        if (adminRoutes.some(route => to.path === route || to.path.startsWith(route + '/'))) {
          return navigateTo('/apply')
        }
      }
    } catch {
      return navigateTo('/portal-login')
    }
  }
})

