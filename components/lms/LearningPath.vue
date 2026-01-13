<script setup lang="ts">
import { computed } from 'vue'
import type { LearningPath } from '~/stores/lms'
import { useLmsStore } from '~/stores/lms'
import { cn } from '~/lib/utils'
import { Clock, Target, ArrowRight, CheckCircle } from 'lucide-vue-next'

interface Props {
  path: LearningPath
  class?: string
}

const props = defineProps<Props>()

const lmsStore = useLmsStore()

const pathModules = computed(() => 
  props.path.modules.map(id => lmsStore.modules.find(m => m.id === id)).filter(Boolean)
)

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours} hours` : `${minutes} min`
}
</script>

<template>
  <div
    :class="cn(
      'glass-card p-6 transition-all duration-300 hover:ai-glow cursor-pointer',
      props.class
    )"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-lg font-semibold text-foreground">{{ path.title }}</h3>
        <p class="text-sm text-muted-foreground mt-1">{{ path.description }}</p>
      </div>
      <div class="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
        <Target class="w-4 h-4" />
        {{ path.progress }}%
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mb-6">
      <UiProgress :value="path.progress" variant="gradient" size="md" />
    </div>

    <!-- Modules roadmap -->
    <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
      <template v-for="(module, index) in pathModules" :key="module?.id">
        <div
          :class="cn(
            'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
            module?.completed
              ? 'bg-score-excellent/10 border border-score-excellent/30'
              : module?.progress && module.progress > 0
                ? 'bg-primary/10 border border-primary/30'
                : 'bg-muted/30 border border-border',
          )"
        >
          <span class="text-lg">{{ module?.icon }}</span>
          <span
            :class="cn(
              'text-sm font-medium whitespace-nowrap',
              module?.completed ? 'text-score-excellent' : 'text-foreground'
            )"
          >
            {{ module?.title }}
          </span>
          <CheckCircle v-if="module?.completed" class="w-4 h-4 text-score-excellent" />
        </div>
        <ArrowRight
          v-if="index < pathModules.length - 1"
          class="w-4 h-4 text-muted-foreground flex-shrink-0"
        />
      </template>
    </div>

    <!-- Skills & Duration -->
    <div class="flex items-center justify-between">
      <div class="flex flex-wrap gap-2">
        <span
          v-for="skill in path.skills.slice(0, 3)"
          :key="skill"
          class="px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
        >
          {{ skill }}
        </span>
        <span
          v-if="path.skills.length > 3"
          class="px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
        >
          +{{ path.skills.length - 3 }} more
        </span>
      </div>
      <div class="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock class="w-4 h-4" />
        {{ formatDuration(path.estimatedTime) }}
      </div>
    </div>
  </div>
</template>

