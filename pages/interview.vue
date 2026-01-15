<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useInterviewStore } from '~/stores/interview'
import { useCandidatesStore } from '~/stores/candidates'
import {
  Sparkles,
  Clock,
  Users,
  ChevronDown,
  MessageSquare,
  BarChart3,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin',
})

useHead({
  title: 'AI Interview',
})

const interviewStore = useInterviewStore()
const candidatesStore = useCandidatesStore()

const showCandidateSelect = ref(false)
const selectedCandidate = ref<string>('')
const interviewDuration = ref(0)
let durationInterval: ReturnType<typeof setInterval> | null = null

const interviewCandidates = candidatesStore.candidates.filter(
  c => c.stage === 'interview' || c.stage === 'screening'
)

function startInterview() {
  if (!selectedCandidate.value) return
  
  const candidate = candidatesStore.candidates.find(c => c.id === selectedCandidate.value)
  if (!candidate) return

  interviewStore.startInterview(candidate.id, candidate.name, candidate.position)
  
  // Start duration timer
  durationInterval = setInterval(() => {
    interviewDuration.value++
  }, 1000)
}

function endInterview() {
  interviewStore.endInterview()
  if (durationInterval) {
    clearInterval(durationInterval)
    durationInterval = null
  }
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Simulate AI conversation
function simulateResponse() {
  if (interviewStore.state !== 'listening') return

  // Simulate thinking
  interviewStore.simulateAIThinking()
  
  setTimeout(() => {
    // AI responds
    interviewStore.simulateAISpeaking()
    interviewStore.addTranscriptEntry(
      'ai',
      "That's a great answer! Your experience with scaling systems shows strong technical depth. Let me follow up on that - how did you handle the team dynamics during that challenging period?"
    )

    setTimeout(() => {
      // Answer the current question
      if (interviewStore.currentQuestion) {
        interviewStore.answerQuestion(
          interviewStore.currentQuestion.id,
          85 + Math.floor(Math.random() * 15),
          'Strong technical explanation with clear examples.'
        )
      }
      interviewStore.setListening()
    }, 3000)
  }, 2000)
}

// Simulate candidate speaking
function simulateCandidateResponse() {
  if (interviewStore.state !== 'listening') return

  interviewStore.addTranscriptEntry(
    'candidate',
    "Thank you for the question. In my previous role at the startup, I led a team of 5 engineers to rebuild our entire data pipeline. We faced significant challenges with legacy systems, but by implementing a phased migration approach and maintaining open communication with stakeholders, we successfully completed the project 2 weeks ahead of schedule."
  )

  // Trigger AI response after candidate speaks
  setTimeout(simulateResponse, 1000)
}

onUnmounted(() => {
  if (durationInterval) {
    clearInterval(durationInterval)
  }
  interviewStore.resetInterview()
})
</script>

<template>
  <div class="h-[calc(100vh-8rem)] flex flex-col">
    <!-- Pre-interview screen -->
    <div
      v-if="interviewStore.state === 'idle'"
      class="flex-1 flex items-center justify-center"
    >
      <div class="max-w-lg w-full text-center space-y-8">
        <!-- AI Avatar -->
        <div class="flex justify-center">
          <div class="relative">
            <div class="w-32 h-32 rounded-3xl bg-card border border-border flex items-center justify-center">
              <img src="~/assets/telkomsel.png" alt="Telkomsel" class="w-20 h-20 object-contain" />
            </div>
            <div class="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-card border border-border text-xs font-medium">
              
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-foreground">AI Interview Assistant</h1>
          <p class="text-muted-foreground">
            Select a candidate to begin an AI-powered interview session
          </p>
        </div>

        <!-- Candidate Selection -->
        <div class="space-y-4">
          <div class="relative">
            <button
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card/50 hover:bg-card/70 transition-colors"
              @click="showCandidateSelect = !showCandidateSelect"
            >
              <span :class="selectedCandidate ? 'text-foreground' : 'text-muted-foreground'">
                {{ selectedCandidate 
                  ? candidatesStore.candidates.find(c => c.id === selectedCandidate)?.name 
                  : 'Select a candidate' 
                }}
              </span>
              <ChevronDown class="w-4 h-4" />
            </button>

            <Transition
              enter-active-class="transition duration-150 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="showCandidateSelect"
                class="absolute z-10 w-full mt-2 rounded-xl border border-border bg-popover shadow-lg overflow-hidden"
              >
                <div
                  v-for="candidate in interviewCandidates"
                  :key="candidate.id"
                  class="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  @click="selectedCandidate = candidate.id; showCandidateSelect = false"
                >
                  <UiAvatar :alt="candidate.name" size="sm" />
                  <div class="flex-1 text-left">
                    <p class="font-medium text-foreground">{{ candidate.name }}</p>
                    <p class="text-sm text-muted-foreground">{{ candidate.position }}</p>
                  </div>
                  <DashboardAIScoreBadge :score="candidate.aiScore" size="sm" />
                </div>
                <div
                  v-if="interviewCandidates.length === 0"
                  class="px-4 py-6 text-center text-muted-foreground"
                >
                  No candidates ready for interview
                </div>
              </div>
            </Transition>
          </div>

          <UiButton
            variant="gradient"
            size="lg"
            class="w-full"
            :disabled="!selectedCandidate"
            @click="startInterview"
          >
            <Sparkles class="w-5 h-5" />
            Start AI Interview
          </UiButton>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-3 gap-4 pt-8">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 mx-auto rounded-xl bg-ai-red/10 flex items-center justify-center">
              <MessageSquare class="w-6 h-6 text-ai-red" />
            </div>
            <p class="text-sm text-muted-foreground">Real-time Transcript</p>
          </div>
          <div class="text-center space-y-2">
            <div class="w-12 h-12 mx-auto rounded-xl bg-ai-orange/10 flex items-center justify-center">
              <BarChart3 class="w-6 h-6 text-ai-orange" />
            </div>
            <p class="text-sm text-muted-foreground">AI Analysis</p>
          </div>
          <div class="text-center space-y-2">
            <div class="w-12 h-12 mx-auto rounded-xl bg-ai-red/10 flex items-center justify-center">
              <Sparkles class="w-6 h-6 text-ai-red" />
            </div>
            <p class="text-sm text-muted-foreground">Smart Questions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Interview in progress -->
    <template v-else>
      <!-- Top bar -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm rounded-t-xl">
        <div class="flex items-center gap-4">
          <InterviewStatusIndicator />
          <div class="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock class="w-4 h-4" />
            <span>{{ formatDuration(interviewDuration) }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <UiAvatar :alt="interviewStore.currentSession?.candidateName" size="sm" />
            <span class="text-sm font-medium hidden sm:inline">
              {{ interviewStore.currentSession?.candidateName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden p-4">
        <!-- Video/Avatar area -->
        <div class="lg:col-span-8 flex flex-col gap-4">
          <!-- Main video area -->
          <div class="flex-1 relative rounded-2xl bg-card border border-border overflow-hidden min-h-[300px]">
            <!-- Background pattern -->
            <div class="absolute inset-0 grid-bg opacity-50" />
            <div class="absolute inset-0 radial-overlay" />

            <!-- AI Avatar centered -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center space-y-6">
                <InterviewAIAvatar size="xl" />
                <div class="space-y-2">
                  <h3 class="text-lg font-semibold text-foreground">
                    {{ interviewStore.aiAssistant.name }}
                  </h3>
                  <p class="text-sm text-muted-foreground">AI Interview Assistant</p>
                </div>
                <InterviewAudioVisualizer v-if="['listening', 'speaking', 'thinking'].includes(interviewStore.state)" />
              </div>
            </div>

            <!-- Candidate video preview (placeholder) -->
            <div class="absolute bottom-4 right-4 w-32 h-24 sm:w-48 sm:h-36 rounded-xl bg-card border border-border overflow-hidden">
              <div class="w-full h-full flex items-center justify-center bg-muted/30">
                <UiAvatar :alt="interviewStore.currentSession?.candidateName" size="lg" />
              </div>
            </div>

            <!-- Current question overlay -->
            <div
              v-if="interviewStore.currentQuestion"
              class="absolute bottom-4 left-4 right-52 sm:right-56"
            >
              <div class="glass-card p-4 space-y-2">
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary capitalize">
                    {{ interviewStore.currentQuestion.type }}
                  </span>
                  <span class="text-xs text-muted-foreground">
                    Question {{ interviewStore.questions.filter(q => q.answered).length + 1 }} of {{ interviewStore.questions.length }}
                  </span>
                </div>
                <p class="text-sm text-foreground line-clamp-2">
                  {{ interviewStore.currentQuestion.question }}
                </p>
              </div>
            </div>
          </div>

          <!-- Controls -->
          <div class="flex justify-center">
            <div class="glass-card px-6 py-4">
              <InterviewControls @end="endInterview" />
            </div>
          </div>

          <!-- Simulate buttons (for demo) -->
          <div class="flex justify-center gap-2">
            <UiButton
              v-if="interviewStore.state === 'listening'"
              variant="outline"
              size="sm"
              @click="simulateCandidateResponse"
            >
              Simulate Response
            </UiButton>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <!-- Tabs -->
          <UiTabs default-value="transcript" class="flex-1 flex flex-col min-h-0">
            <UiTabsList class="w-full">
              <UiTabsTrigger value="transcript" class="flex-1">Transcript</UiTabsTrigger>
              <UiTabsTrigger value="questions" class="flex-1">Questions</UiTabsTrigger>
            </UiTabsList>

            <UiTabsContent value="transcript" class="flex-1 min-h-0 mt-0">
              <div class="h-full rounded-xl border border-border bg-card/50 overflow-hidden">
                <InterviewTranscriptPanel />
              </div>
            </UiTabsContent>

            <UiTabsContent value="questions" class="flex-1 min-h-0 overflow-y-auto custom-scrollbar mt-0">
              <div class="p-4 rounded-xl border border-border bg-card/50">
                <InterviewQuestionProgress />
              </div>
            </UiTabsContent>
          </UiTabs>

          <!-- Real-time metrics -->
          <div class="glass-card p-4 space-y-4">
            <h4 class="font-semibold text-foreground">Real-time Metrics</h4>
            <div class="grid grid-cols-2 gap-3">
              <div class="p-3 rounded-lg bg-muted/30">
                <p class="text-xs text-muted-foreground mb-1">Confidence</p>
                <div class="flex items-center gap-2">
                  <UiProgress :value="interviewStore.realtimeMetrics.confidence" variant="gradient" size="sm" class="flex-1" />
                  <span class="text-sm font-medium">{{ interviewStore.realtimeMetrics.confidence }}%</span>
                </div>
              </div>
              <div class="p-3 rounded-lg bg-muted/30">
                <p class="text-xs text-muted-foreground mb-1">Engagement</p>
                <div class="flex items-center gap-2">
                  <UiProgress :value="interviewStore.realtimeMetrics.engagement" variant="success" size="sm" class="flex-1" />
                  <span class="text-sm font-medium">{{ interviewStore.realtimeMetrics.engagement }}%</span>
                </div>
              </div>
              <div class="p-3 rounded-lg bg-muted/30">
                <p class="text-xs text-muted-foreground mb-1">Clarity</p>
                <div class="flex items-center gap-2">
                  <UiProgress :value="interviewStore.realtimeMetrics.clarity" variant="success" size="sm" class="flex-1" />
                  <span class="text-sm font-medium">{{ interviewStore.realtimeMetrics.clarity }}%</span>
                </div>
              </div>
              <div class="p-3 rounded-lg bg-muted/30">
                <p class="text-xs text-muted-foreground mb-1">Pace</p>
                <span class="text-sm font-medium capitalize">{{ interviewStore.realtimeMetrics.speakingPace }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

