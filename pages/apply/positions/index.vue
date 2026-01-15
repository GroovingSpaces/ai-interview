<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApplicationStore } from '~/stores/application'
import {
  Search,
  MapPin,
  Briefcase,
  Clock,
  Wifi,
  Building2,
  ChevronRight,
  Filter,
  Users,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'applicant',
})

useHead({
  title: 'Open Positions - Telkomsel Careers',
})

const applicationStore = useApplicationStore()
const searchQuery = ref('')
const typeFilter = ref('all')
const departmentFilter = ref('all')

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const departments = computed(() => {
  const depts = [...new Set(applicationStore.availablePositions.map(p => p.department))]
  return [{ value: 'all', label: 'All Departments' }, ...depts.map(d => ({ value: d, label: d }))]
})

const filteredPositions = computed(() => {
  return applicationStore.availablePositions.filter(pos => {
    const matchesSearch = 
      pos.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      pos.department.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      pos.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = typeFilter.value === 'all' || pos.type === typeFilter.value
    const matchesDept = departmentFilter.value === 'all' || pos.department === departmentFilter.value
    
    return matchesSearch && matchesType && matchesDept
  })
})

const typeColors: Record<string, string> = {
  'full-time': 'bg-score-excellent/20 text-score-excellent border-score-excellent/30',
  'part-time': 'bg-score-average/20 text-score-average border-score-average/30',
  'contract': 'bg-ai-orange/20 text-ai-orange border-ai-orange/30',
  'internship': 'bg-ai-red/20 text-ai-red border-ai-red/30',
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl lg:text-4xl font-bold text-foreground">
        Open Positions
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Explore exciting career opportunities at Telkomsel. Find the role that matches your skills and passion.
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-foreground">{{ applicationStore.availablePositions.length }}</div>
        <div class="text-sm text-muted-foreground">Total Positions</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-foreground">{{ applicationStore.availablePositions.filter(p => p.type === 'full-time').length }}</div>
        <div class="text-sm text-muted-foreground">Full Time</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-foreground">{{ applicationStore.availablePositions.filter(p => p.remote).length }}</div>
        <div class="text-sm text-muted-foreground">Remote Friendly</div>
      </div>
      <div class="glass-card p-4 text-center">
        <div class="text-2xl font-bold text-foreground">{{ [...new Set(applicationStore.availablePositions.map(p => p.department))].length }}</div>
        <div class="text-sm text-muted-foreground">Departments</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search positions by title, department, or keywords..."
            class="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>
        <div class="flex gap-3">
          <select
            v-model="typeFilter"
            class="px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
          >
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select
            v-model="departmentFilter"
            class="px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
          >
            <option v-for="opt in departments" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Positions Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <NuxtLink
        v-for="position in filteredPositions"
        :key="position.id"
        :to="`/apply/positions/${position.id}`"
        class="glass-card-hover p-6 space-y-4 block cursor-pointer"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1">
            <h3 class="text-xl font-semibold text-foreground group-hover:text-ai-red transition-colors">{{ position.title }}</h3>
            <div class="flex items-center gap-2 text-muted-foreground">
              <Building2 class="w-4 h-4" />
              <span class="text-sm">{{ position.department }}</span>
            </div>
          </div>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium border capitalize',
              typeColors[position.type] || 'bg-muted text-muted-foreground',
            ]"
          >
            {{ position.type.replace('-', ' ') }}
          </span>
        </div>

        <p class="text-muted-foreground text-sm line-clamp-2">
          {{ position.description }}
        </p>

        <div class="flex flex-wrap gap-3">
          <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin class="w-4 h-4" />
            {{ position.location }}
          </div>
          <div v-if="position.remote" class="flex items-center gap-1.5 text-sm text-score-excellent">
            <Wifi class="w-4 h-4" />
            Remote Available
          </div>
        </div>

        <div class="pt-4 border-t border-border flex items-center justify-between">
          <div class="text-sm text-muted-foreground">
            {{ position.requirements.length }} requirements
          </div>
          <span
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-sm"
          >
            View Details
            <ChevronRight class="w-4 h-4" />
          </span>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredPositions.length === 0"
      class="glass-card p-12 text-center"
    >
      <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Briefcase class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">No positions found</h3>
      <p class="text-muted-foreground">
        Try adjusting your search or filter criteria
      </p>
    </div>
  </div>
</template>

