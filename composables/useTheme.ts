import { ref, watch, onMounted } from 'vue'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const theme = ref<Theme>('dark')
  const isDark = ref(true)

  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      isDark.value = prefersDark
    } else {
      isDark.value = newTheme === 'dark'
    }

    updateDocumentClass()
    localStorage.setItem('theme', newTheme)
  }

  function updateDocumentClass() {
    if (isDark.value) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else {
      setTheme('dark')
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (theme.value === 'system') {
        isDark.value = e.matches
        updateDocumentClass()
      }
    })
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}

