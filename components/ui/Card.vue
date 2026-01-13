<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  class?: string
  variant?: 'default' | 'glass' | 'gradient'
  hover?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  hover: false,
})

const variantClasses = {
  default: 'bg-card border border-border',
  glass: 'glass-card',
  gradient: 'glass-card gradient-border',
}
</script>

<template>
  <div
    :class="cn(
      'rounded-2xl p-6 transition-all duration-300',
      variantClasses[variant],
      hover && 'hover:bg-card/70 hover:border-white/10 hover:shadow-lg hover:shadow-primary/5 cursor-pointer',
      props.class
    )"
  >
    <slot />
  </div>
</template>

