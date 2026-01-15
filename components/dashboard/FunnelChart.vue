<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '~/lib/utils'

interface FunnelStage {
  name: string
  count: number
  color: string
}

interface Props {
  stages: FunnelStage[]
  class?: string
}

const props = defineProps<Props>()

const maxCount = computed(() => Math.max(...props.stages.map(s => s.count)))
</script>

<template>
  <div :class="cn('space-y-4', props.class)">
    <div
      v-for="(stage, index) in stages"
      :key="stage.name"
      class="relative group"
    >
      <div class="flex items-center gap-4">
        <!-- Stage indicator -->
        <div class="flex flex-col items-center">
          <div
            :class="[
              'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-transform group-hover:scale-110',
            ]"
            :style="{ backgroundColor: `${stage.color}20`, color: stage.color }"
          >
            {{ index + 1 }}
          </div>
          <div
            v-if="index < stages.length - 1"
            class="w-0.5 h-8 bg-gradient-to-b from-border to-transparent mt-2"
          />
        </div>

        <!-- Bar and label -->
        <div class="flex-1 space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-foreground">{{ stage.name }}</span>
            <span class="text-xs text-muted-foreground">
              {{ Math.round((stage.count / maxCount) * 100) }}%
            </span>
          </div>
          <div class="h-3 rounded-full bg-muted/50 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-700 ease-out"
              :style="{
                width: `${(stage.count / maxCount) * 100}%`,
                background: `linear-gradient(90deg, ${stage.color}, ${stage.color}88)`,
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

