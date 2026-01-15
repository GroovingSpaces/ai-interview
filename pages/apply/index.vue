<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApplicationStore } from '~/stores/application'
import {
  Sparkles,
  Briefcase,
  CheckCircle,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'applicant',
})

useHead({
  title: 'Apply',
})

const applicationStore = useApplicationStore()
const searchQuery = ref('')
const typeFilter = ref('all')

const filteredPositions = computed(() => {
  return applicationStore.availablePositions.filter(pos => {
    const matchesSearch = 
      pos.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      pos.department.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = typeFilter.value === 'all' || pos.type === typeFilter.value
    
    return matchesSearch && matchesType
  }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
})

const typeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const steps = [
  { id: 1, title: 'Upload CV', description: 'Submit your resume' },
  { id: 2, title: 'AI Analysis', description: 'Get instant insights' },
  { id: 3, title: 'Choose Position', description: 'Find your fit' },
  { id: 4, title: 'Apply', description: 'Submit application' },
]

const currentStep = computed(() => {
  if (applicationStore.status === 'idle') return 1
  if (applicationStore.isProcessing) return 2
  if (applicationStore.status === 'complete' && !applicationStore.selectedPosition) return 3
  if (applicationStore.selectedPosition) return 4
  return 1
})

function submitApplication() {
  alert('Application submitted! (Demo)')
  applicationStore.reset()
}
</script>

<template>
  <div class="space-y-12">
    <!-- Hero Section -->
    <div class="text-center space-y-6 max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
        <Sparkles class="w-4 h-4" />
        AI-Powered Recruitment
      </div>
      <h1 class="text-4xl lg:text-5xl font-bold text-foreground">
        Find Your Perfect Role at <span class="ai-text-gradient">Telkomsel</span>
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Upload your CV and let our AI match you with the best opportunities. Get instant feedback and insights about your profile.
      </p>
    </div>

    <!-- Progress Steps -->
    <div class="flex items-center justify-center gap-4 lg:gap-8 overflow-x-auto pb-4">
      <template v-for="(step, index) in steps" :key="step.id">
        <div class="flex items-center gap-3 flex-shrink-0">
          <div
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
              currentStep >= step.id
                ? 'bg-gradient-to-t from-ai-orange to-ai-red text-white'
                : 'bg-muted text-muted-foreground',
            ]"
          >
            <CheckCircle v-if="currentStep > step.id" class="w-5 h-5" />
            <span v-else>{{ step.id }}</span>
          </div>
          <div class="hidden sm:block">
            <p
              :class="[
                'font-medium',
                currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground',
              ]"
            >
              {{ step.title }}
            </p>
            <p class="text-xs text-muted-foreground">{{ step.description }}</p>
          </div>
        </div>
        <ArrowRight
          v-if="index < steps.length - 1"
          :class="[
            'w-5 h-5 flex-shrink-0',
            currentStep > step.id ? 'text-primary' : 'text-muted-foreground',
          ]"
        />
      </template>
    </div>

    <!-- Main Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Upload & Analysis -->
      <div class="space-y-6">
        <ApplicantCVUploader />

        <!-- Parsed Resume View -->
        <ApplicantParsedResumeView v-if="applicationStore.status === 'complete'" />
      </div>

      <!-- Right Column: Positions -->
      <div class="space-y-6">
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-primary/20">
                <Briefcase class="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-foreground">Open Positions</h2>
                <p class="text-sm text-muted-foreground">
                  {{ applicationStore.availablePositions.length }} opportunities
                </p>
              </div>
            </div>
          </div>

          <!-- Filters -->
          <div class="flex flex-col sm:flex-row gap-3 mb-6">
            <div class="flex-1 relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <UiInput
                v-model="searchQuery"
                placeholder="Search positions..."
                class="pl-10"
              />
            </div>
            <UiSelect
              v-model="typeFilter"
              :options="typeOptions"
              class="w-full sm:w-40"
            />
          </div>

          <!-- Positions List -->
          <div class="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
            <ApplicantPositionCard
              v-for="position in filteredPositions"
              :key="position.id"
              :position="position"
              :selected="applicationStore.selectedPosition?.id === position.id"
              @select="applicationStore.selectPosition"
            />

            <div
              v-if="filteredPositions.length === 0"
              class="text-center py-12"
            >
              <p class="text-muted-foreground">No positions found matching your criteria</p>
            </div>
          </div>
        </div>

        <!-- Apply Button -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-4"
        >
          <div
            v-if="applicationStore.selectedPosition && applicationStore.status === 'complete'"
            class="glass-card p-6"
          >
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-foreground">
                  Apply for {{ applicationStore.selectedPosition.title }}
                </h3>
                <p class="text-sm text-muted-foreground">
                  Your profile is ready to submit
                </p>
              </div>
              <UiButton variant="gradient" size="lg" @click="submitApplication">
                <Sparkles class="w-5 h-5" />
                Submit Application
              </UiButton>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Features Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
      <div class="glass-card p-6 text-center">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-ai-red/20 flex items-center justify-center mb-4">
          <Sparkles class="w-7 h-7 text-ai-red" />
        </div>
        <h3 class="font-semibold text-foreground mb-2">AI-Powered Matching</h3>
        <p class="text-sm text-muted-foreground">
          Our AI analyzes your skills and experience to find the best role matches
        </p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-ai-orange/20 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-ai-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="font-semibold text-foreground mb-2">Instant Feedback</h3>
        <p class="text-sm text-muted-foreground">
          Get immediate insights about your profile strengths and areas to improve
        </p>
      </div>
      <div class="glass-card p-6 text-center">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-ai-red/20 flex items-center justify-center mb-4">
          <svg class="w-7 h-7 text-ai-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="font-semibold text-foreground mb-2">Fast Track Process</h3>
        <p class="text-sm text-muted-foreground">
          Streamlined application process with AI-assisted screening
        </p>
      </div>
    </div>
  </div>
</template>

