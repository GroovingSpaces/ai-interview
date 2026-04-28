<script setup lang="ts">
import { cn } from '~/lib/utils'

type Tone = 'good' | 'low' | 'average' | 'primary' | 'muted' | 'warning'

interface Props {
  label: string
  tone?: Tone
}

withDefaults(defineProps<Props>(), {
  tone: 'muted',
})

const toneClasses: Record<Tone, string> = {
  good: 'bg-score-good/10 text-score-good border-score-good/30',
  low: 'bg-score-low/10 text-score-low border-score-low/30',
  average: 'bg-score-average/10 text-score-average border-score-average/30',
  warning: 'bg-ai-orange/10 text-ai-orange border-ai-orange/30',
  primary: 'bg-primary/10 text-primary border-primary/30',
  muted: 'bg-muted/40 text-muted-foreground border-border',
}
</script>

<template>
  <span :class="cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap', toneClasses[tone])">
    {{ label }}
  </span>
</template>
