<script setup lang="ts">
import { computed } from 'vue'
import { useCandidatesStore } from '~/stores/candidates'
import {
  Users,
  UserCheck,
  Clock,
  TrendingUp,
  Filter,
  Download,
  Plus,
  Search,
  Sparkles,
} from 'lucide-vue-next'

// Protect dashboard - only for staff
definePageMeta({
  middleware: 'admin',
})

useHead({
  title: 'Dashboard',
})

const candidatesStore = useCandidatesStore()

const stats = computed(() => [
  {
    title: 'Total Candidates',
    value: candidatesStore.candidates.length,
    change: 12,
    changeLabel: 'vs last month',
    icon: Users,
  },
  {
    title: 'Active Pipeline',
    value: candidatesStore.stageStats.interview + candidatesStore.stageStats.assessment + candidatesStore.stageStats.offer,
    change: 8,
    changeLabel: 'vs last week',
    icon: Clock,
  },
  {
    title: 'Hired This Month',
    value: candidatesStore.stageStats.hired,
    change: 25,
    changeLabel: 'vs last month',
    icon: UserCheck,
  },
  {
    title: 'Avg. AI Score',
    value: `${candidatesStore.averageAiScore}%`,
    change: 3,
    changeLabel: 'improvement',
    icon: Sparkles,
  },
])

const funnelStages = computed(() => [
  { sort: 1, name: 'Applied', count: candidatesStore.stageStats.applied, color: '#3B82F6' },
  { sort: 2, name: 'Screening', count: candidatesStore.stageStats.screening, color: '#8B5CF6' },
  { sort: 3, name: 'Interview', count: candidatesStore.stageStats.interview, color: '#00D4FF' },
  { sort: 4, name: 'Assessment', count: candidatesStore.stageStats.assessment, color: '#F59E0B' },
  { sort: 5, name: 'Offer', count: candidatesStore.stageStats.offer, color: '#10B981' },
  { sort: 6, name: 'Hired', count: candidatesStore.stageStats.hired, color: '#22C55E' },
])

const stageOptions = [
  { value: 'all', label: 'All Stages' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
]

const departmentOptions = [
  { value: 'all', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Product', label: 'Product' },
  { value: 'Design', label: 'Design' },
  { value: 'Analytics', label: 'Analytics' },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatsCard
        v-for="(stat, index) in stats"
        :key="stat.title"
        :title="stat.title"
        :value="stat.value"
        :change="stat.change"
        :change-label="stat.changeLabel"
        :icon="stat.icon"
        :variant="index === 0 ? 'gradient' : 'default'"
        :class="{ 'animate-fade-in': true }"
        :style="{ animationDelay: `${index * 100}ms` }"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recruitment Funnel -->
      <UiCard variant="glass" class="lg:col-span-1">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-lg font-semibold text-foreground">Recruitment Funnel</h2>
            <p class="text-sm text-muted-foreground">Pipeline overview</p>
          </div>
          <div class="p-2 rounded-xl bg-primary/10">
            <TrendingUp class="w-5 h-5 text-primary" />
          </div>
        </div>
        <DashboardFunnelChart :stages="funnelStages" />
      </UiCard>

      <!-- Candidates Table -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <UiInput
              v-model="candidatesStore.searchQuery"
              placeholder="Search candidates..."
              class="pl-11"
            />
          </div>
          <div class="flex gap-2">
            <UiSelect
              v-model="candidatesStore.stageFilter"
              :options="stageOptions"
              class="w-40"
            />
            <UiSelect
              v-model="candidatesStore.departmentFilter"
              :options="departmentOptions"
              class="w-44"
            />
            <UiButton variant="outline">
              <Filter class="w-4 h-4" />
              <span class="hidden sm:inline">Filters</span>
            </UiButton>
            <UiButton variant="gradient">
              <Plus class="w-4 h-4" />
              <span class="hidden sm:inline">Add Candidate</span>
            </UiButton>
          </div>
        </div>

        <!-- Table -->
        <DashboardCandidateTable />
      </div>
    </div>

    <!-- Candidate Detail Sidebar -->
    <DashboardCandidateDetail />

    <!-- Quick Actions Bar -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8">
      <div class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-lg">
        <span class="text-sm text-muted-foreground hidden sm:inline">Quick Actions</span>
        <div class="flex gap-2">
          <UiButton variant="outline" size="sm">
            <Download class="w-4 h-4" />
            Export
          </UiButton>
          <NuxtLink to="/interview">
            <UiButton variant="gradient" size="sm">
              <Sparkles class="w-4 h-4" />
              Start AI Interview
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

