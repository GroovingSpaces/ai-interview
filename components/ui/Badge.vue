<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary border border-primary/30',
        secondary: 'bg-secondary text-secondary-foreground',
        destructive: 'bg-destructive/20 text-destructive border border-destructive/30',
        outline: 'border border-border text-foreground',
        success: 'bg-score-excellent/20 text-score-excellent border border-score-excellent/30',
        warning: 'bg-score-average/20 text-score-average border border-score-average/30',
        gradient: 'bg-gradient-to-t from-ai-orange/20 to-ai-red/20 text-white border border-white/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

type BadgeVariants = VariantProps<typeof badgeVariants>

interface Props {
  variant?: BadgeVariants['variant']
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})
</script>

<template>
  <span :class="cn(badgeVariants({ variant }), props.class)">
    <slot />
  </span>
</template>

