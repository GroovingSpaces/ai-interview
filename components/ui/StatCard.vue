<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  label: string
  value: string | number
  icon?: Component
  tone?: 'primary' | 'good' | 'low' | 'average' | 'muted'
  hint?: string
}

withDefaults(defineProps<Props>(), {
  tone: 'primary',
})

const toneClasses: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  good: 'bg-score-good/10 text-score-good',
  low: 'bg-score-low/10 text-score-low',
  average: 'bg-score-average/10 text-score-average',
  muted: 'bg-muted/40 text-muted-foreground',
}
</script>

<template>
  <div class="glass-card p-4 flex items-center gap-3">
    <div v-if="icon" :class="['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', toneClasses[tone]]">
      <component :is="icon" class="w-6 h-6" />
    </div>
    <div class="min-w-0">
      <p class="text-xs text-muted-foreground truncate">{{ label }}</p>
      <p class="text-2xl font-bold text-foreground">{{ value }}</p>
      <p v-if="hint" class="text-xs text-muted-foreground truncate">{{ hint }}</p>
    </div>
  </div>
</template>
