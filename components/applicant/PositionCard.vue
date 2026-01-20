<script setup lang="ts">
import type { JobPosition } from '~/stores/application'
import { cn, getScoreColor } from '~/lib/utils'
import {
  MapPin,
  Wifi,
  Building2,
  ChevronRight,
  Sparkles,
} from 'lucide-vue-next'

interface Props {
  position: JobPosition
  class?: string
}

const props = defineProps<Props>()

const typeColors = {
  'full-time': 'bg-score-excellent/20 text-score-excellent border-score-excellent/30',
  'part-time': 'bg-score-average/20 text-score-average border-score-average/30',
  contract: 'bg-ai-orange/20 text-ai-orange border-ai-orange/30',
  internship: 'bg-ai-red/20 text-ai-red border-ai-red/30',
}
</script>

<template>
  <NuxtLink
    :to="`/apply/positions/${position.id}`"
    :class="cn(
      'group relative block rounded-2xl p-6 transition-all duration-300 cursor-pointer border',
      'bg-card border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
      props.class
    )"
  >
    <!-- Match score badge -->
    <div
      v-if="position.matchScore"
      :class="cn(
        'absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold',
        `bg-score-${getScoreColor(position.matchScore)}/20`,
        `text-score-${getScoreColor(position.matchScore)}`,
        `border border-score-${getScoreColor(position.matchScore)}/30`,
      )"
    >
      <Sparkles class="w-3.5 h-3.5" />
      {{ position.matchScore }}% Match
    </div>

    <!-- Header -->
    <div class="mb-4 pr-24">
      <h3 class="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
        {{ position.title }}
      </h3>
      <div class="flex items-center gap-1 text-sm text-muted-foreground mt-1">
        <Building2 class="w-4 h-4" />
        {{ position.department }}
      </div>
    </div>

    <!-- Meta info -->
    <div class="flex flex-wrap gap-3 mb-4">
      <span :class="cn('px-2 py-1 rounded text-xs font-medium capitalize border', typeColors[position.type])">
        {{ position.type.replace('-', ' ') }}
      </span>
      <span class="flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin class="w-4 h-4" />
        {{ position.location }}
      </span>
      <span v-if="position.remote" class="flex items-center gap-1 text-sm text-score-excellent">
        <Wifi class="w-4 h-4" />
        Remote OK
      </span>
    </div>

    <!-- Description -->
    <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
      {{ position.description }}
    </p>

    <!-- Requirements preview -->
    <div class="space-y-2 mb-4">
      <p class="text-xs text-muted-foreground uppercase tracking-wider">Requirements</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="req in position.requirements.slice(0, 3)"
          :key="req"
          class="px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
        >
          {{ req.split(' ').slice(0, 3).join(' ') }}...
        </span>
        <span
          v-if="position.requirements.length > 3"
          class="px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
        >
          +{{ position.requirements.length - 3 }} more
        </span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-end pt-4 border-t border-border">
      <span class="flex items-center gap-1.5 text-sm text-primary font-medium">
        View Details
        <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </span>
    </div>
  </NuxtLink>
</template>
