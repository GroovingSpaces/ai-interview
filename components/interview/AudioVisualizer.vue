<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useInterviewStore } from '~/stores/interview'
import { cn } from '~/lib/utils'

interface Props {
  barCount?: number
  variant?: 'default' | 'compact'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  barCount: 5,
  variant: 'default',
})

const interviewStore = useInterviewStore()
const bars = ref<number[]>(Array(props.barCount).fill(0.3))
let animationFrame: number | null = null

function animateBars() {
  if (interviewStore.state === 'listening' || interviewStore.state === 'speaking') {
    bars.value = bars.value.map(() => 0.2 + Math.random() * 0.8)
  } else if (interviewStore.state === 'thinking') {
    const time = Date.now() / 200
    bars.value = bars.value.map((_, i) => 0.3 + 0.3 * Math.sin(time + i * 0.5))
  } else {
    bars.value = bars.value.map(() => 0.3)
  }
  animationFrame = requestAnimationFrame(animateBars)
}

onMounted(() => {
  animateBars()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})

const isActive = ['listening', 'speaking', 'thinking'].includes(interviewStore.state)
</script>

<template>
  <div
    :class="cn(
      'flex items-center justify-center gap-1',
      variant === 'compact' ? 'h-6' : 'h-12',
      props.class
    )"
  >
    <div
      v-for="(bar, index) in bars"
      :key="index"
      :class="[
        'rounded-full transition-all duration-75',
        variant === 'compact' ? 'w-0.5' : 'w-1',
      ]"
      :style="{
        height: variant === 'compact' ? `${bar * 20}px` : `${bar * 40}px`,
        background: isActive
          ? `linear-gradient(to top, ${interviewStore.state === 'listening' ? '#00D4FF' : interviewStore.state === 'speaking' ? '#10B981' : '#8B5CF6'}, ${interviewStore.state === 'listening' ? '#8B5CF6' : interviewStore.state === 'speaking' ? '#00D4FF' : '#EC4899'})`
          : 'hsl(var(--muted-foreground))',
        transitionDelay: `${index * 50}ms`,
      }"
    />
  </div>
</template>

