<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import {
  CheckCircle,
  Clock,
  FileText,
  Users,
  Video,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  AlertCircle,
  Sparkles,
  LogIn,
  ChevronRight,
  MapPin,
  Building2,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'applicant',
})

useHead({
  title: 'My Applications - Telkomsel Careers',
})

const authStore = useAuthStore()
const isLoading = ref(true)

// Mock application history data for the logged-in user
const applications = ref<{
  id: string
  position: string
  department: string
  location: string
  appliedDate: string
  status: 'submitted' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected'
  stages: {
    name: string
    status: 'completed' | 'current' | 'pending'
    date?: string
    notes?: string
  }[]
}[]>([])

const selectedApplication = ref<typeof applications.value[0] | null>(null)

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  submitted: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-muted' },
  screening: { bg: 'bg-ai-orange/10', text: 'text-ai-orange', border: 'border-ai-orange/30' },
  interview: { bg: 'bg-ai-red/10', text: 'text-ai-red', border: 'border-ai-red/30' },
  assessment: { bg: 'bg-score-average/10', text: 'text-score-average', border: 'border-score-average/30' },
  offer: { bg: 'bg-score-excellent/10', text: 'text-score-excellent', border: 'border-score-excellent/30' },
  hired: { bg: 'bg-score-excellent/10', text: 'text-score-excellent', border: 'border-score-excellent/30' },
  rejected: { bg: 'bg-score-low/10', text: 'text-score-low', border: 'border-score-low/30' },
}

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  screening: 'Screening',
  interview: 'Interview',
  assessment: 'Assessment',
  offer: 'Offer',
  hired: 'Hired',
  rejected: 'Rejected',
}

onMounted(async () => {
  // Simulate loading application history
  await new Promise(resolve => setTimeout(resolve, 800))
  
  if (authStore.isAuthenticated) {
    // Mock data - in real app, this would come from API
    applications.value = [
      {
        id: 'APP-2026-001',
        position: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Jakarta, Indonesia',
        appliedDate: '2026-01-10',
        status: 'interview',
        stages: [
          {
            name: 'Application Submitted',
            status: 'completed',
            date: '2026-01-10',
            notes: 'Your application has been received',
          },
          {
            name: 'AI Resume Screening',
            status: 'completed',
            date: '2026-01-11',
            notes: 'Profile match score: 85%',
          },
          {
            name: 'HR Review',
            status: 'completed',
            date: '2026-01-12',
            notes: 'Approved for interview',
          },
          {
            name: 'AI Interview',
            status: 'current',
            date: '2026-01-15',
            notes: 'Scheduled for today',
          },
          {
            name: 'Technical Assessment',
            status: 'pending',
          },
          {
            name: 'Final Interview',
            status: 'pending',
          },
          {
            name: 'Offer',
            status: 'pending',
          },
        ],
      },
      {
        id: 'APP-2026-002',
        position: 'Product Manager',
        department: 'Product',
        location: 'Jakarta, Indonesia',
        appliedDate: '2026-01-05',
        status: 'rejected',
        stages: [
          {
            name: 'Application Submitted',
            status: 'completed',
            date: '2026-01-05',
            notes: 'Your application has been received',
          },
          {
            name: 'AI Resume Screening',
            status: 'completed',
            date: '2026-01-06',
            notes: 'Profile match score: 45%',
          },
          {
            name: 'HR Review',
            status: 'completed',
            date: '2026-01-08',
            notes: 'Not proceeding with this application',
          },
        ],
      },
      {
        id: 'APP-2025-089',
        position: 'DevOps Engineer',
        department: 'Engineering',
        location: 'Jakarta, Indonesia',
        appliedDate: '2025-11-20',
        status: 'hired',
        stages: [
          {
            name: 'Application Submitted',
            status: 'completed',
            date: '2025-11-20',
            notes: 'Your application has been received',
          },
          {
            name: 'AI Resume Screening',
            status: 'completed',
            date: '2025-11-21',
            notes: 'Profile match score: 92%',
          },
          {
            name: 'HR Review',
            status: 'completed',
            date: '2025-11-22',
            notes: 'Fast-tracked for interview',
          },
          {
            name: 'AI Interview',
            status: 'completed',
            date: '2025-11-25',
            notes: 'Excellent performance',
          },
          {
            name: 'Technical Assessment',
            status: 'completed',
            date: '2025-11-28',
            notes: 'Score: 95/100',
          },
          {
            name: 'Final Interview',
            status: 'completed',
            date: '2025-12-02',
            notes: 'Approved by hiring manager',
          },
          {
            name: 'Offer',
            status: 'completed',
            date: '2025-12-05',
            notes: 'Offer accepted',
          },
        ],
      },
    ]
    
    // Auto-select the first active application
    const activeApp = applications.value.find(a => !['hired', 'rejected'].includes(a.status))
    if (activeApp) {
      selectedApplication.value = activeApp
    } else if (applications.value.length > 0) {
      selectedApplication.value = applications.value[0]
    }
  }
  
  isLoading.value = false
})

function getStageIcon(stage: string) {
  if (stage.includes('Submitted')) return FileText
  if (stage.includes('Screening') || stage.includes('Review')) return Sparkles
  if (stage.includes('Interview')) return Video
  if (stage.includes('Assessment')) return Users
  if (stage.includes('Offer')) return Mail
  return CheckCircle
}

function selectApplication(app: typeof applications.value[0]) {
  selectedApplication.value = app
}

const activeApplicationsCount = computed(() => 
  applications.value.filter(a => !['hired', 'rejected'].includes(a.status)).length
)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl lg:text-4xl font-bold text-foreground">
        My Applications
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Track all your job applications at Telkomsel
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="glass-card p-12 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4 animate-pulse">
        <Clock class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">Loading your applications...</h3>
    </div>

    <!-- Not Logged In -->
    <div v-else-if="!authStore.isAuthenticated" class="glass-card p-12 text-center max-w-lg mx-auto">
      <div class="w-20 h-20 mx-auto rounded-2xl bg-ai-red/10 flex items-center justify-center mb-6">
        <LogIn class="w-10 h-10 text-ai-red" />
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-3">Sign In Required</h3>
      <p class="text-muted-foreground mb-6">
        Please sign in to view your application history and track your progress.
      </p>
      <NuxtLink
        to="/apply"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-t from-ai-orange to-ai-red text-white font-semibold hover:opacity-90 transition-opacity"
      >
        <LogIn class="w-5 h-5" />
        Sign In
      </NuxtLink>
    </div>

    <!-- No Applications -->
    <div v-else-if="applications.length === 0" class="glass-card p-12 text-center max-w-lg mx-auto">
      <div class="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <Briefcase class="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-3">No Applications Yet</h3>
      <p class="text-muted-foreground mb-6">
        You haven't applied to any positions yet. Start exploring opportunities!
      </p>
      <NuxtLink
        to="/apply/positions"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-t from-ai-orange to-ai-red text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Browse Positions
        <ChevronRight class="w-5 h-5" />
      </NuxtLink>
    </div>

    <!-- Applications List -->
    <template v-else>
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-foreground">{{ applications.length }}</div>
          <div class="text-sm text-muted-foreground">Total Applications</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-ai-red">{{ activeApplicationsCount }}</div>
          <div class="text-sm text-muted-foreground">In Progress</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-score-excellent">{{ applications.filter(a => a.status === 'hired').length }}</div>
          <div class="text-sm text-muted-foreground">Hired</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-score-low">{{ applications.filter(a => a.status === 'rejected').length }}</div>
          <div class="text-sm text-muted-foreground">Rejected</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Applications Sidebar -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-foreground px-1">Your Applications</h2>
          <div class="space-y-3">
            <button
              v-for="app in applications"
              :key="app.id"
              @click="selectApplication(app)"
              :class="[
                'w-full text-left p-4 rounded-xl border transition-all',
                selectedApplication?.id === app.id
                  ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/20'
                  : 'bg-card border-border hover:border-primary/30',
              ]"
            >
              <div class="flex items-start justify-between gap-2 mb-2">
                <h3 class="font-semibold text-foreground text-sm line-clamp-1">{{ app.position }}</h3>
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
                    statusColors[app.status].bg,
                    statusColors[app.status].text,
                  ]"
                >
                  {{ statusLabels[app.status] }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Building2 class="w-3 h-3" />
                {{ app.department }}
              </div>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar class="w-3 h-3" />
                Applied {{ new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
              </div>
            </button>
          </div>
        </div>

        <!-- Selected Application Details -->
        <div class="lg:col-span-2 space-y-6">
          <template v-if="selectedApplication">
            <!-- Application Info Card -->
            <div class="glass-card p-6">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-sm text-muted-foreground">Application ID:</span>
                    <span class="font-mono font-medium text-foreground">{{ selectedApplication.id }}</span>
                  </div>
                  <h2 class="text-xl font-semibold text-foreground">{{ selectedApplication.position }}</h2>
                  <div class="flex items-center gap-4 mt-1">
                    <span class="flex items-center gap-1 text-muted-foreground text-sm">
                      <Building2 class="w-4 h-4" />
                      {{ selectedApplication.department }}
                    </span>
                    <span class="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin class="w-4 h-4" />
                      {{ selectedApplication.location }}
                    </span>
                  </div>
                </div>
                <div
                  :class="[
                    'px-4 py-2 rounded-xl border text-sm font-medium capitalize',
                    statusColors[selectedApplication.status].bg,
                    statusColors[selectedApplication.status].text,
                    statusColors[selectedApplication.status].border,
                  ]"
                >
                  {{ statusLabels[selectedApplication.status] }}
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p class="text-sm text-muted-foreground">Applied On</p>
                  <p class="font-medium text-foreground">
                    {{ new Date(selectedApplication.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Current Stage</p>
                  <p class="font-medium text-foreground">
                    {{ selectedApplication.stages.find(s => s.status === 'current')?.name || 
                       (selectedApplication.status === 'hired' ? 'Completed' : 
                        selectedApplication.status === 'rejected' ? 'Closed' : 'Processing') }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="glass-card p-6">
              <h3 class="text-lg font-semibold text-foreground mb-6">Application Progress</h3>
              
              <div class="space-y-0">
                <div
                  v-for="(stage, index) in selectedApplication.stages"
                  :key="stage.name"
                  class="relative pl-10 pb-8 last:pb-0"
                >
                  <!-- Line -->
                  <div
                    v-if="index < selectedApplication.stages.length - 1"
                    :class="[
                      'absolute left-[15px] top-8 w-0.5 h-full',
                      stage.status === 'completed' ? 'bg-score-excellent' : 'bg-border',
                    ]"
                  />
                  
                  <!-- Icon -->
                  <div
                    :class="[
                      'absolute left-0 w-8 h-8 rounded-full flex items-center justify-center',
                      stage.status === 'completed' && 'bg-score-excellent text-white',
                      stage.status === 'current' && 'bg-ai-red text-white animate-pulse',
                      stage.status === 'pending' && 'bg-muted text-muted-foreground',
                    ]"
                  >
                    <CheckCircle v-if="stage.status === 'completed'" class="w-4 h-4" />
                    <component v-else :is="getStageIcon(stage.name)" class="w-4 h-4" />
                  </div>

                  <!-- Content -->
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <h4
                        :class="[
                          'font-medium',
                          stage.status === 'pending' ? 'text-muted-foreground' : 'text-foreground',
                        ]"
                      >
                        {{ stage.name }}
                      </h4>
                      <span
                        v-if="stage.status === 'current'"
                        class="px-2 py-0.5 rounded text-xs font-medium bg-ai-red/10 text-ai-red"
                      >
                        In Progress
                      </span>
                    </div>
                    <p v-if="stage.date" class="text-sm text-muted-foreground">
                      <Calendar class="w-3.5 h-3.5 inline mr-1" />
                      {{ new Date(stage.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}
                    </p>
                    <p v-if="stage.notes" class="text-sm text-muted-foreground">
                      {{ stage.notes }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Help Section -->
            <div class="glass-card p-6">
              <h3 class="text-lg font-semibold text-foreground mb-4">Need Help?</h3>
              <p class="text-muted-foreground mb-4">
                If you have questions about your application, please contact our recruitment team.
              </p>
              <div class="flex flex-wrap gap-4">
                <a href="mailto:careers@telkomsel.com" class="inline-flex items-center gap-2 text-primary hover:underline">
                  <Mail class="w-4 h-4" />
                  careers@telkomsel.com
                </a>
                <a href="tel:+62211234567" class="inline-flex items-center gap-2 text-primary hover:underline">
                  <Phone class="w-4 h-4" />
                  +62 21 123 4567
                </a>
              </div>
            </div>
          </template>

          <!-- No Selection -->
          <div v-else class="glass-card p-12 text-center">
            <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <FileText class="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">Select an Application</h3>
            <p class="text-muted-foreground">
              Choose an application from the list to view its details and progress
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
