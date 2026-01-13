<script setup lang="ts">
import { computed } from 'vue'
import { useInterviewStore, type InterviewState } from '~/stores/interview'
import { cn } from '~/lib/utils'
import { Sparkles } from 'lucide-vue-next'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'lg',
})

const interviewStore = useInterviewStore()

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-32 h-32',
}

const ringClasses = {
  sm: 'w-14 h-14',
  md: 'w-20 h-20',
  lg: 'w-28 h-28',
  xl: 'w-36 h-36',
}

const stateColors: Record<InterviewState, string> = {
  idle: 'from-muted to-muted',
  connecting: 'from-ai-amber to-yellow-400',
  ready: 'from-ai-cyan to-ai-purple',
  listening: 'from-ai-cyan via-ai-purple to-ai-pink',
  thinking: 'from-ai-purple via-ai-pink to-ai-cyan',
  speaking: 'from-ai-cyan to-emerald-400',
  paused: 'from-muted-foreground to-muted',
  ended: 'from-muted to-muted',
}

const isAnimating = computed(() => 
  ['listening', 'thinking', 'speaking', 'connecting'].includes(interviewStore.state)
)
</script>

<template>
  <div :class="cn('relative flex items-center justify-center', props.class)">
    <!-- Outer glow ring -->
    <div
      :class="[
        'absolute rounded-full transition-all duration-500',
        ringClasses[size],
        isAnimating && 'animate-pulse-glow',
      ]"
      :style="{
        background: `radial-gradient(circle, ${interviewStore.state === 'listening' ? 'rgba(0, 212, 255, 0.2)' : interviewStore.state === 'thinking' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}, transparent 70%)`,
      }"
    />

    <!-- Animated ring -->
    <div
      v-if="isAnimating"
      :class="[
        'absolute rounded-full border-2 transition-all duration-300',
        ringClasses[size],
        interviewStore.state === 'thinking' && 'animate-thinking',
      ]"
      :style="{
        borderColor: interviewStore.state === 'listening' ? 'rgba(0, 212, 255, 0.5)' : interviewStore.state === 'thinking' ? 'rgba(139, 92, 246, 0.5)' : 'rgba(16, 185, 129, 0.5)',
      }"
    />

    <!-- Avatar container -->
    <div
      :class="[
        'relative rounded-full bg-gradient-to-br p-[3px] transition-all duration-300',
        sizeClasses[size],
        stateColors[interviewStore.state],
        isAnimating && 'shadow-lg',
      ]"
    >
      <div class="w-full h-full rounded-full bg-card flex items-center justify-center">
        <!-- AI Icon/Face -->
        <div class="relative">
          <Sparkles
            :class="[
              'transition-all duration-300',
              size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-14 h-14',
              interviewStore.state === 'thinking' && 'animate-thinking text-ai-purple',
              interviewStore.state === 'listening' && 'text-ai-cyan',
              interviewStore.state === 'speaking' && 'text-emerald-400',
              !isAnimating && 'text-muted-foreground',
            ]"
          />
        </div>
      </div>
    </div>

    <!-- Status indicator dot -->
    <div
      :class="[
        'absolute -bottom-1 -right-1 rounded-full border-2 border-card transition-all duration-300',
        size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5',
        interviewStore.state === 'listening' && 'bg-ai-cyan animate-pulse',
        interviewStore.state === 'thinking' && 'bg-ai-purple animate-pulse',
        interviewStore.state === 'speaking' && 'bg-emerald-400 animate-pulse',
        interviewStore.state === 'ready' && 'bg-ai-cyan',
        interviewStore.state === 'connecting' && 'bg-amber-400 animate-pulse',
        ['idle', 'paused', 'ended'].includes(interviewStore.state) && 'bg-muted-foreground',
      ]"
    />
  </div>
</template>

