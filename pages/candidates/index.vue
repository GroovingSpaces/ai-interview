<script setup lang="ts">
import { useCandidatesStore } from '~/stores/candidates'
import { Search, Filter, Plus, Download, LayoutGrid, List } from 'lucide-vue-next'
import { ref } from 'vue'

definePageMeta({
  middleware: 'admin',
})

useHead({
  title: 'Candidates',
})

const router = useRouter()
const candidatesStore = useCandidatesStore()
const viewMode = ref<'list' | 'grid'>('list')

function openCandidateDetail(id: string) {
  router.push(`/candidates/${id}`)
}

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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">All Candidates</h1>
        <p class="text-muted-foreground">Manage and track all applicants in your pipeline</p>
      </div>
      <div class="flex gap-2">
        <UiButton variant="outline">
          <Download class="w-4 h-4" />
          Export
        </UiButton>
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          Add Candidate
        </UiButton>
      </div>
    </div>

    <!-- Filters Bar -->
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput
          v-model="candidatesStore.searchQuery"
          placeholder="Search by name, email, or position..."
          class="pl-11"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <UiSelect
          v-model="candidatesStore.stageFilter"
          :options="stageOptions"
          class="w-40"
        />
        <UiButton variant="outline">
          <Filter class="w-4 h-4" />
          More Filters
        </UiButton>
        <div class="flex rounded-xl border border-border overflow-hidden">
          <button
            :class="[
              'p-2.5 transition-colors',
              viewMode === 'list' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
            ]"
            @click="viewMode = 'list'"
          >
            <List class="w-4 h-4" />
          </button>
          <button
            :class="[
              'p-2.5 transition-colors',
              viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50',
            ]"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Results count -->
    <p class="text-sm text-muted-foreground">
      Showing {{ candidatesStore.filteredCandidates.length }} of {{ candidatesStore.candidates.length }} candidates
    </p>

    <!-- List View -->
    <DashboardCandidateTable v-if="viewMode === 'list'" />

    <!-- Grid View -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <UiCard
        v-for="candidate in candidatesStore.filteredCandidates"
        :key="candidate.id"
        variant="glass"
        hover
        class="cursor-pointer"
        @click="openCandidateDetail(candidate.id)"
      >
        <div class="flex items-start gap-4">
          <UiAvatar :alt="candidate.name" size="lg" />
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-semibold text-foreground truncate">{{ candidate.name }}</h3>
                <p class="text-sm text-muted-foreground truncate">{{ candidate.position }}</p>
              </div>
              <DashboardAIScoreBadge :score="candidate.aiScore" size="sm" />
            </div>
            <div class="flex flex-wrap gap-1 mt-3">
              <span
                v-for="skill in candidate.skills.slice(0, 3)"
                :key="skill"
                class="px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground"
              >
                {{ skill }}
              </span>
              <span
                v-if="candidate.skills.length > 3"
                class="px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground"
              >
                +{{ candidate.skills.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </UiCard>
    </div>
  </div>
</template>

