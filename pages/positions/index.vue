<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApplicationStore, type JobPosition } from '~/stores/application'
import {
  Search,
  Plus,
  Filter,
  Briefcase,
  MapPin,
  Building2,
  Clock,
  Users,
  Globe,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin',
})

useHead({
  title: 'Position Management',
})

const appStore = useApplicationStore()

// Modal states
const showDeleteModal = ref(false)
const selectedPosition = ref<JobPosition | null>(null)

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const departmentOptions = computed(() => [
  { value: 'all', label: 'All Departments' },
  ...appStore.departments.map(d => ({ value: d, label: d })),
])

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  'full-time': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
  'part-time': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  'contract': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  'internship': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
}

function openDeleteModal(position: JobPosition) {
  selectedPosition.value = position
  showDeleteModal.value = true
}

function closeModals() {
  showDeleteModal.value = false
  selectedPosition.value = null
}

function handleDelete() {
  if (!selectedPosition.value) return
  appStore.deletePosition(selectedPosition.value.id)
  closeModals()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Position Management</h1>
        <p class="text-muted-foreground">Manage and create job positions for recruitment</p>
      </div>
      <NuxtLink to="/positions/add">
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          Add Position
        </UiButton>
      </NuxtLink>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary/10">
            <Briefcase class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ appStore.positionStats.total }}</p>
            <p class="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-emerald-500/10">
            <Clock class="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ appStore.positionStats.fullTime }}</p>
            <p class="text-xs text-muted-foreground">Full-time</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-blue-500/10">
            <Clock class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ appStore.positionStats.partTime }}</p>
            <p class="text-xs text-muted-foreground">Part-time</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-amber-500/10">
            <Users class="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ appStore.positionStats.contract }}</p>
            <p class="text-xs text-muted-foreground">Contract</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-purple-500/10">
            <Users class="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ appStore.positionStats.internship }}</p>
            <p class="text-xs text-muted-foreground">Internship</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-ai-red/10">
            <Globe class="w-5 h-5 text-ai-red" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ appStore.positionStats.remote }}</p>
            <p class="text-xs text-muted-foreground">Remote</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput
          v-model="appStore.positionSearchQuery"
          placeholder="Search positions by title, department, or location..."
          class="pl-11"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <UiSelect
          v-model="appStore.positionTypeFilter"
          :options="typeOptions"
          class="w-36"
        />
        <UiSelect
          v-model="appStore.positionDepartmentFilter"
          :options="departmentOptions"
          class="w-40"
        />
      </div>
    </div>

    <!-- Positions List -->
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Showing {{ appStore.filteredPositions.length }} of {{ appStore.availablePositions.length }} positions
      </p>

      <div v-if="appStore.filteredPositions.length === 0" class="glass-card p-12 text-center">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Briefcase class="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">No Positions Found</h3>
        <p class="text-muted-foreground mb-4">Try adjusting your search or filter criteria, or create a new position.</p>
        <NuxtLink to="/positions/add">
          <UiButton variant="gradient">
            <Plus class="w-4 h-4" />
            Add Position
          </UiButton>
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="position in appStore.filteredPositions"
          :key="position.id"
          class="glass-card p-6 hover:border-primary/30 transition-all duration-200"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-foreground mb-1">{{ position.title }}</h3>
              <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span class="flex items-center gap-1">
                  <Building2 class="w-4 h-4" />
                  {{ position.department }}
                </span>
                <span class="flex items-center gap-1">
                  <MapPin class="w-4 h-4" />
                  {{ position.location }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink :to="`/positions/${position.id}/edit`">
                <button
                  class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  type="button"
                >
                  <Edit class="w-4 h-4 text-muted-foreground" />
                </button>
              </NuxtLink>
              <button
                class="p-2 rounded-lg hover:bg-score-low/10 transition-colors"
                @click="openDeleteModal(position)"
              >
                <Trash2 class="w-4 h-4 text-score-low" />
              </button>
            </div>
          </div>

          <p class="text-sm text-muted-foreground mb-4 line-clamp-2">
            {{ position.description }}
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-medium border capitalize',
                typeColors[position.type].bg,
                typeColors[position.type].text,
                typeColors[position.type].border,
              ]"
            >
              {{ position.type }}
            </span>
            <span
              v-if="position.remote"
              class="px-3 py-1 rounded-full text-xs font-medium bg-ai-red/10 text-ai-red border border-ai-red/30"
            >
              Remote
            </span>
            <span class="text-xs text-muted-foreground ml-auto">
              {{ position.requirements.length }} requirements • {{ position.benefits.length }} benefits
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-full bg-score-low/10 flex items-center justify-center mb-4">
                <AlertTriangle class="w-8 h-8 text-score-low" />
              </div>
              <h2 class="text-xl font-bold text-foreground mb-2">Delete Position</h2>
              <p class="text-muted-foreground mb-6">
                Are you sure you want to delete "{{ selectedPosition?.title }}"? This action cannot be undone.
              </p>
              <div class="flex justify-center gap-3">
                <UiButton variant="outline" @click="closeModals">Cancel</UiButton>
                <UiButton
                  variant="outline"
                  class="text-score-low border-score-low/30 hover:bg-score-low/10"
                  @click="handleDelete"
                >
                  <Trash2 class="w-4 h-4" />
                  Delete
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

