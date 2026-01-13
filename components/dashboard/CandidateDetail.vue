<script setup lang="ts">
import { computed } from 'vue'
import { useCandidatesStore } from '~/stores/candidates'
import { formatDate, getScoreColor } from '~/lib/utils'
import {
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  MessageSquare,
  Video,
  FileText,
  ChevronRight,
} from 'lucide-vue-next'

const candidatesStore = useCandidatesStore()
const candidate = computed(() => candidatesStore.selectedCandidate)

function closeDetail() {
  candidatesStore.selectCandidate('')
}

const stageActions = {
  applied: 'Start Screening',
  screening: 'Schedule Interview',
  interview: 'Send Assessment',
  assessment: 'Extend Offer',
  offer: 'Mark as Hired',
  hired: 'View Profile',
  rejected: 'Reconsider',
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-x-4"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-4"
  >
    <div
      v-if="candidate"
      class="fixed top-0 right-0 w-full max-w-md h-full bg-card border-l border-border z-50 overflow-y-auto custom-scrollbar"
    >
      <!-- Header -->
      <div class="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <UiAvatar :alt="candidate.name" size="xl" />
            <div>
              <h2 class="text-xl font-bold text-foreground">{{ candidate.name }}</h2>
              <p class="text-sm text-muted-foreground">{{ candidate.position }}</p>
            </div>
          </div>
          <button
            class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            @click="closeDetail"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="flex items-center gap-4 mt-4">
          <DashboardAIScoreBadge :score="candidate.aiScore" size="lg" show-label />
        </div>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Contact Info -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact</h3>
          <div class="space-y-2">
            <div class="flex items-center gap-3 text-sm">
              <Mail class="w-4 h-4 text-muted-foreground" />
              <span>{{ candidate.email }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Phone class="w-4 h-4 text-muted-foreground" />
              <span>{{ candidate.phone }}</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Briefcase class="w-4 h-4 text-muted-foreground" />
              <span>{{ candidate.experience }} years experience</span>
            </div>
            <div class="flex items-center gap-3 text-sm">
              <Calendar class="w-4 h-4 text-muted-foreground" />
              <span>Applied {{ formatDate(candidate.appliedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Skills -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Skills</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in candidate.skills"
              :key="skill"
              class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20"
            >
              {{ skill }}
            </span>
          </div>
        </div>

        <!-- Interview Scores -->
        <div v-if="candidate.interviewScores" class="space-y-3">
          <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Interview Scores</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-xl bg-muted/30 border border-border">
              <p class="text-sm text-muted-foreground mb-1">Technical</p>
              <p class="text-2xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.technical)}`">
                {{ candidate.interviewScores.technical }}%
              </p>
            </div>
            <div class="p-4 rounded-xl bg-muted/30 border border-border">
              <p class="text-sm text-muted-foreground mb-1">Communication</p>
              <p class="text-2xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.communication)}`">
                {{ candidate.interviewScores.communication }}%
              </p>
            </div>
            <div class="p-4 rounded-xl bg-muted/30 border border-border">
              <p class="text-sm text-muted-foreground mb-1">Problem Solving</p>
              <p class="text-2xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.problemSolving)}`">
                {{ candidate.interviewScores.problemSolving }}%
              </p>
            </div>
            <div class="p-4 rounded-xl bg-muted/30 border border-border">
              <p class="text-sm text-muted-foreground mb-1">Culture Fit</p>
              <p class="text-2xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.cultureFit)}`">
                {{ candidate.interviewScores.cultureFit }}%
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Actions</h3>
          <div class="space-y-2">
            <UiButton variant="gradient" class="w-full justify-between">
              {{ stageActions[candidate.stage] }}
              <ChevronRight class="w-4 h-4" />
            </UiButton>
            <div class="grid grid-cols-3 gap-2">
              <UiButton variant="outline" size="sm" class="flex-col h-auto py-3 gap-1">
                <MessageSquare class="w-4 h-4" />
                <span class="text-xs">Message</span>
              </UiButton>
              <UiButton variant="outline" size="sm" class="flex-col h-auto py-3 gap-1">
                <Video class="w-4 h-4" />
                <span class="text-xs">Interview</span>
              </UiButton>
              <UiButton variant="outline" size="sm" class="flex-col h-auto py-3 gap-1">
                <FileText class="w-4 h-4" />
                <span class="text-xs">Resume</span>
              </UiButton>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="space-y-3">
          <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">Activity</h3>
          <div class="space-y-4">
            <div class="flex gap-3">
              <div class="relative">
                <div class="w-2 h-2 rounded-full bg-primary mt-2" />
                <div class="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
              </div>
              <div>
                <p class="text-sm font-medium">Stage updated to {{ candidate.stage }}</p>
                <p class="text-xs text-muted-foreground">{{ formatDate(candidate.lastActivity) }}</p>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="w-2 h-2 rounded-full bg-muted mt-2" />
              <div>
                <p class="text-sm font-medium">Application submitted</p>
                <p class="text-xs text-muted-foreground">{{ formatDate(candidate.appliedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

