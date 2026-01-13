<script setup lang="ts">
import { computed } from 'vue'
import type { LearningModule } from '~/stores/lms'
import { cn } from '~/lib/utils'
import { Clock, Lock, Play, CheckCircle, BookOpen, Sparkles } from 'lucide-vue-next'

interface Props {
  module: LearningModule
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: [moduleId: string]
}>()

const difficultyColors = {
  beginner: 'bg-score-excellent/20 text-score-excellent border-score-excellent/30',
  intermediate: 'bg-score-average/20 text-score-average border-score-average/30',
  advanced: 'bg-score-low/20 text-score-low border-score-low/30',
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
</script>

<template>
  <div
    :class="cn(
      'group relative rounded-2xl p-6 transition-all duration-300 border',
      module.locked
        ? 'bg-muted/20 border-border cursor-not-allowed opacity-60'
        : module.completed
          ? 'bg-card border-score-excellent/30 hover:border-score-excellent/50'
          : 'bg-card border-border hover:border-primary/30 cursor-pointer hover:shadow-lg hover:shadow-primary/5',
      props.class
    )"
    @click="!module.locked && !module.completed && emit('start', module.id)"
  >
    <!-- Locked overlay -->
    <div
      v-if="module.locked"
      class="absolute inset-0 flex items-center justify-center rounded-2xl bg-background/50 backdrop-blur-sm z-10"
    >
      <div class="text-center space-y-2">
        <Lock class="w-8 h-8 mx-auto text-muted-foreground" />
        <p class="text-sm text-muted-foreground">Complete previous modules</p>
      </div>
    </div>

    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-3">
        <div
          :class="cn(
            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
            module.completed
              ? 'bg-score-excellent/20'
              : 'bg-gradient-to-br from-primary/20 to-accent/20',
          )"
        >
          <CheckCircle v-if="module.completed" class="w-6 h-6 text-score-excellent" />
          <span v-else>{{ module.icon }}</span>
        </div>
        <div>
          <h3 class="font-semibold text-foreground group-hover:text-primary transition-colors">
            {{ module.title }}
          </h3>
          <p class="text-sm text-muted-foreground">{{ module.category }}</p>
        </div>
      </div>
      <span
        :class="cn(
          'px-2 py-1 rounded text-xs font-medium capitalize border',
          difficultyColors[module.difficulty]
        )"
      >
        {{ module.difficulty }}
      </span>
    </div>

    <!-- Description -->
    <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
      {{ module.description }}
    </p>

    <!-- Progress -->
    <div class="space-y-2 mb-4">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Progress</span>
        <span class="font-medium">{{ module.progress }}%</span>
      </div>
      <UiProgress
        :value="module.progress"
        :variant="module.completed ? 'success' : 'gradient'"
        size="sm"
      />
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4 text-sm text-muted-foreground">
        <span class="flex items-center gap-1">
          <Clock class="w-4 h-4" />
          {{ formatDuration(module.duration) }}
        </span>
        <span class="flex items-center gap-1">
          <BookOpen class="w-4 h-4" />
          {{ module.lessons.length }} lessons
        </span>
      </div>
      <div v-if="!module.locked && !module.completed" class="flex items-center gap-1 text-primary">
        <Play class="w-4 h-4" />
        <span class="text-sm font-medium">
          {{ module.progress > 0 ? 'Continue' : 'Start' }}
        </span>
      </div>
    </div>

    <!-- Quiz badge -->
    <div
      v-if="module.quiz && module.quiz.completed"
      class="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg bg-ai-purple/20 text-ai-purple text-xs font-medium"
    >
      <Sparkles class="w-3 h-3" />
      {{ module.quiz.score }}%
    </div>
  </div>
</template>

