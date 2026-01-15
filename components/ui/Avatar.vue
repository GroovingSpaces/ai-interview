<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

interface Props {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  fallback: '?',
})

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const initials = computed(() => {
  if (!props.alt) return props.fallback
  return props.alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<template>
  <div
    :class="cn(
      'relative flex shrink-0 overflow-hidden rounded-full',
      sizeClasses[size],
      props.class
    )"
  >
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
    >
    <div
      v-else
      class="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-t from-ai-orange to-ai-red font-semibold text-white"
    >
      {{ initials }}
    </div>
  </div>
</template>

