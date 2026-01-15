<script setup lang="ts">
import { computed } from 'vue'
import { useInterviewStore, type InterviewState } from '~/stores/interview'
import { cn } from '~/lib/utils'
import { Mic, Brain, Volume2, Pause, Play, Wifi, WifiOff } from 'lucide-vue-next'

const interviewStore = useInterviewStore()

const statusConfig: Record<InterviewState, { icon: any; label: string; color: string; bgColor: string }> = {
  idle: { icon: Pause, label: 'Ready to Start', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  connecting: { icon: Wifi, label: 'Connecting...', color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
  ready: { icon: Play, label: 'Ready', color: 'text-ai-red', bgColor: 'bg-ai-red/10' },
  listening: { icon: Mic, label: 'Listening', color: 'text-ai-red', bgColor: 'bg-ai-red/10' },
  thinking: { icon: Brain, label: 'Analyzing Response', color: 'text-ai-orange', bgColor: 'bg-ai-orange/10' },
  speaking: { icon: Volume2, label: 'Speaking', color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
  paused: { icon: Pause, label: 'Paused', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  ended: { icon: WifiOff, label: 'Interview Ended', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
}

const config = computed(() => statusConfig[interviewStore.state])
const isAnimating = computed(() => 
  ['listening', 'thinking', 'speaking', 'connecting'].includes(interviewStore.state)
)
</script>

<template>
  <div
    :class="cn(
      'inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300',
      config.bgColor,
      `border-${config.color.replace('text-', '')}/30`
    )"
  >
    <!-- Animated dot -->
    <div class="relative">
      <div
        :class="[
          'w-2 h-2 rounded-full transition-colors duration-300',
          config.color.replace('text-', 'bg-'),
        ]"
      />
      <div
        v-if="isAnimating"
        :class="[
          'absolute inset-0 w-2 h-2 rounded-full animate-ping',
          config.color.replace('text-', 'bg-'),
        ]"
      />
    </div>

    <!-- Icon -->
    <component
      :is="config.icon"
      :class="[
        'w-4 h-4 transition-all duration-300',
        config.color,
        isAnimating && 'animate-pulse',
      ]"
    />

    <!-- Label -->
    <span :class="['text-sm font-medium', config.color]">
      {{ config.label }}
    </span>

    <!-- Audio visualizer for active states -->
    <InterviewAudioVisualizer
      v-if="isAnimating"
      variant="compact"
      :bar-count="4"
      class="ml-1"
    />
  </div>
</template>

