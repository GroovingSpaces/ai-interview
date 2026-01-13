import { ref, onMounted, onUnmounted } from 'vue'

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export function useBreakpoint() {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const current = ref<Breakpoint>('lg')

  function updateWidth() {
    width.value = window.innerWidth
    
    if (width.value < breakpoints.sm) {
      current.value = 'sm'
    } else if (width.value < breakpoints.md) {
      current.value = 'md'
    } else if (width.value < breakpoints.lg) {
      current.value = 'lg'
    } else if (width.value < breakpoints.xl) {
      current.value = 'xl'
    } else {
      current.value = '2xl'
    }
  }

  const isMobile = computed(() => width.value < breakpoints.md)
  const isTablet = computed(() => width.value >= breakpoints.md && width.value < breakpoints.lg)
  const isDesktop = computed(() => width.value >= breakpoints.lg)

  const isLessThan = (bp: Breakpoint) => computed(() => width.value < breakpoints[bp])
  const isGreaterThan = (bp: Breakpoint) => computed(() => width.value >= breakpoints[bp])

  onMounted(() => {
    updateWidth()
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  return {
    width,
    current,
    isMobile,
    isTablet,
    isDesktop,
    isLessThan,
    isGreaterThan,
  }
}

