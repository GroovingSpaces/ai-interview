<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApplicationStore } from '~/stores/application'
import {
  ArrowLeft,
  MapPin,
  Building2,
  Wifi,
  Clock,
  Users,
  CheckCircle,
  Gift,
  ChevronRight,
  Share2,
  Bookmark,
  Briefcase,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'applicant',
})

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()

const positionId = computed(() => route.params.id as string)
const position = computed(() => applicationStore.getPositionById(positionId.value))

useHead({
  title: computed(() => position.value ? `${position.value.title} - Telkomsel Careers` : 'Position Not Found'),
})

const typeColors: Record<string, string> = {
  'full-time': 'bg-score-excellent/20 text-score-excellent border-score-excellent/30',
  'part-time': 'bg-score-average/20 text-score-average border-score-average/30',
  'contract': 'bg-ai-orange/20 text-ai-orange border-ai-orange/30',
  'internship': 'bg-ai-red/20 text-ai-red border-ai-red/30',
}

function goBack() {
  router.push('/apply/positions')
}

function applyNow() {
  if (position.value) {
    router.push(`/apply?position=${position.value.id}`)
  }
}

function sharePosition() {
  if (navigator.share && position.value) {
    navigator.share({
      title: position.value.title,
      text: `Check out this job opportunity at Telkomsel: ${position.value.title}`,
      url: window.location.href,
    })
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.href)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>Back to Positions</span>
    </button>

    <!-- Not Found State -->
    <div v-if="!position" class="glass-card p-12 text-center">
      <div class="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <Briefcase class="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 class="text-2xl font-bold text-foreground mb-3">Position Not Found</h2>
      <p class="text-muted-foreground mb-6 max-w-md mx-auto">
        The position you're looking for doesn't exist or has been removed.
      </p>
      <button
        @click="goBack"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
      >
        Browse Open Positions
      </button>
    </div>

    <!-- Position Content -->
    <template v-else>
      <!-- Header -->
      <div class="glass-card p-6 lg:p-8">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div class="space-y-4">
            <div class="flex items-center gap-3 flex-wrap">
              <span
                :class="[
                  'px-3 py-1.5 rounded-full text-sm font-medium border capitalize',
                  typeColors[position.type] || 'bg-muted text-muted-foreground',
                ]"
              >
                {{ position.type.replace('-', ' ') }}
              </span>
              <span
                v-if="position.remote"
                class="px-3 py-1.5 rounded-full text-sm font-medium bg-score-excellent/20 text-score-excellent border border-score-excellent/30 flex items-center gap-1.5"
              >
                <Wifi class="w-3.5 h-3.5" />
                Remote Available
              </span>
            </div>
            
            <h1 class="text-3xl lg:text-4xl font-bold text-foreground">
              {{ position.title }}
            </h1>
            
            <div class="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div class="flex items-center gap-2">
                <Building2 class="w-5 h-5" />
                <span>{{ position.department }}</span>
              </div>
              <div class="flex items-center gap-2">
                <MapPin class="w-5 h-5" />
                <span>{{ position.location }}</span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              @click="sharePosition"
              class="p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              title="Share Position"
            >
              <Share2 class="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              class="p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              title="Save Position"
            >
              <Bookmark class="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              @click="applyNow"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-t from-ai-orange to-ai-red text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Apply Now
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- About the Role -->
          <div class="glass-card p-6">
            <h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Briefcase class="w-5 h-5 text-ai-red" />
              About the Role
            </h2>
            <p class="text-muted-foreground leading-relaxed">
              {{ position.description }}
            </p>
            <p class="text-muted-foreground leading-relaxed mt-4">
              At Telkomsel, we believe in empowering our employees to do their best work. This role offers a unique opportunity to contribute to Indonesia's leading telecommunications company while growing your career in a dynamic and supportive environment.
            </p>
          </div>

          <!-- Requirements -->
          <div class="glass-card p-6">
            <h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle class="w-5 h-5 text-ai-red" />
              Requirements
            </h2>
            <ul class="space-y-3">
              <li
                v-for="(req, index) in position.requirements"
                :key="index"
                class="flex items-start gap-3"
              >
                <span class="mt-1.5 w-2 h-2 rounded-full bg-ai-red flex-shrink-0"></span>
                <span class="text-muted-foreground">{{ req }}</span>
              </li>
            </ul>
          </div>

          <!-- Benefits -->
          <div class="glass-card p-6">
            <h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Gift class="w-5 h-5 text-ai-red" />
              Benefits
            </h2>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li
                v-for="(benefit, index) in position.benefits"
                :key="index"
                class="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <CheckCircle class="w-5 h-5 text-score-excellent flex-shrink-0" />
                <span class="text-foreground">{{ benefit }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Job Summary -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">Job Summary</h3>
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-3 border-b border-border">
                <div class="w-10 h-10 rounded-lg bg-ai-red/10 flex items-center justify-center">
                  <Building2 class="w-5 h-5 text-ai-red" />
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Department</div>
                  <div class="font-medium text-foreground">{{ position.department }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3 pb-3 border-b border-border">
                <div class="w-10 h-10 rounded-lg bg-ai-red/10 flex items-center justify-center">
                  <MapPin class="w-5 h-5 text-ai-red" />
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Location</div>
                  <div class="font-medium text-foreground">{{ position.location }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3 pb-3 border-b border-border">
                <div class="w-10 h-10 rounded-lg bg-ai-red/10 flex items-center justify-center">
                  <Clock class="w-5 h-5 text-ai-red" />
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Employment Type</div>
                  <div class="font-medium text-foreground capitalize">{{ position.type.replace('-', ' ') }}</div>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-ai-red/10 flex items-center justify-center">
                  <Wifi class="w-5 h-5 text-ai-red" />
                </div>
                <div>
                  <div class="text-sm text-muted-foreground">Remote Work</div>
                  <div class="font-medium text-foreground">{{ position.remote ? 'Available' : 'On-site only' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Card -->
          <div class="glass-card p-6 text-center bg-gradient-to-br from-ai-red/5 to-ai-orange/5 border-ai-red/20">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center">
              <Users class="w-8 h-8 text-white" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Ready to Join?</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Take the first step towards your new career at Telkomsel.
            </p>
            <button
              @click="applyNow"
              class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-t from-ai-orange to-ai-red text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Apply Now
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>

          <!-- Contact -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-3">Questions?</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Have questions about this role? Contact our recruitment team.
            </p>
            <a
              href="mailto:careers@telkomsel.com"
              class="inline-flex items-center gap-2 text-ai-red hover:underline text-sm font-medium"
            >
              careers@telkomsel.com
            </a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

