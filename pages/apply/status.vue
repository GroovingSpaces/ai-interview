<script setup lang="ts">
import { ref } from 'vue'
import {
  Search,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Video,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'applicant',
})

useHead({
  title: 'Check Application Status - Telkomsel Careers',
})

const applicationId = ref('')
const email = ref('')
const isSearching = ref(false)
const hasSearched = ref(false)

// Mock application data
const mockApplication = ref<{
  id: string
  applicantName: string
  position: string
  department: string
  appliedDate: string
  status: 'submitted' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected'
  stages: {
    name: string
    status: 'completed' | 'current' | 'pending'
    date?: string
    notes?: string
  }[]
} | null>(null)

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  submitted: { bg: 'bg-muted/50', text: 'text-muted-foreground', border: 'border-muted' },
  screening: { bg: 'bg-ai-orange/10', text: 'text-ai-orange', border: 'border-ai-orange/30' },
  interview: { bg: 'bg-ai-red/10', text: 'text-ai-red', border: 'border-ai-red/30' },
  assessment: { bg: 'bg-score-average/10', text: 'text-score-average', border: 'border-score-average/30' },
  offer: { bg: 'bg-score-excellent/10', text: 'text-score-excellent', border: 'border-score-excellent/30' },
  hired: { bg: 'bg-score-excellent/10', text: 'text-score-excellent', border: 'border-score-excellent/30' },
  rejected: { bg: 'bg-score-low/10', text: 'text-score-low', border: 'border-score-low/30' },
}

async function searchApplication() {
  if (!applicationId.value && !email.value) return
  
  isSearching.value = true
  hasSearched.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Mock response
  if (applicationId.value === 'APP-2026-001' || email.value.includes('@')) {
    mockApplication.value = {
      id: 'APP-2026-001',
      applicantName: 'John Doe',
      position: 'Senior Software Engineer',
      department: 'Engineering',
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
    }
  } else {
    mockApplication.value = null
  }
  
  isSearching.value = false
}

function getStageIcon(stage: string) {
  if (stage.includes('Submitted')) return FileText
  if (stage.includes('Screening') || stage.includes('Review')) return Sparkles
  if (stage.includes('Interview')) return Video
  if (stage.includes('Assessment')) return Users
  if (stage.includes('Offer')) return Mail
  return CheckCircle
}
</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl lg:text-4xl font-bold text-foreground">
        Check Application Status
      </h1>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Track the progress of your job application at Telkomsel
      </p>
    </div>

    <!-- Search Form -->
    <div class="glass-card p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Application ID</label>
          <div class="relative">
            <FileText class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              v-model="applicationId"
              type="text"
              placeholder="e.g., APP-2026-001"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Email Address</label>
          <div class="relative">
            <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              v-model="email"
              type="email"
              placeholder="your.email@example.com"
              class="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <UiButton
        variant="gradient"
        size="lg"
        class="w-full"
        :loading="isSearching"
        :disabled="!applicationId && !email"
        @click="searchApplication"
      >
        <Search class="w-5 h-5" />
        Search Application
      </UiButton>

      <p class="text-sm text-muted-foreground text-center">
        Enter your Application ID or the email you used to apply
      </p>
    </div>

    <!-- Results -->
    <template v-if="hasSearched">
      <!-- Application Found -->
      <div v-if="mockApplication" class="space-y-6">
        <!-- Application Info Card -->
        <div class="glass-card p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm text-muted-foreground">Application ID:</span>
                <span class="font-mono font-medium text-foreground">{{ mockApplication.id }}</span>
              </div>
              <h2 class="text-xl font-semibold text-foreground">{{ mockApplication.position }}</h2>
              <p class="text-muted-foreground">{{ mockApplication.department }}</p>
            </div>
            <div
              :class="[
                'px-4 py-2 rounded-xl border text-sm font-medium capitalize',
                statusColors[mockApplication.status].bg,
                statusColors[mockApplication.status].text,
                statusColors[mockApplication.status].border,
              ]"
            >
              {{ mockApplication.status }}
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p class="text-sm text-muted-foreground">Applicant</p>
              <p class="font-medium text-foreground">{{ mockApplication.applicantName }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Applied On</p>
              <p class="font-medium text-foreground">{{ new Date(mockApplication.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Current Stage</p>
              <p class="font-medium text-foreground">{{ mockApplication.stages.find(s => s.status === 'current')?.name || 'Processing' }}</p>
            </div>
          </div>
        </div>

        <!-- Timeline -->
        <div class="glass-card p-6">
          <h3 class="text-lg font-semibold text-foreground mb-6">Application Progress</h3>
          
          <div class="space-y-0">
            <div
              v-for="(stage, index) in mockApplication.stages"
              :key="stage.name"
              class="relative pl-10 pb-8 last:pb-0"
            >
              <!-- Line -->
              <div
                v-if="index < mockApplication.stages.length - 1"
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
      </div>

      <!-- Application Not Found -->
      <div v-else class="glass-card p-12 text-center">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-score-low/10 flex items-center justify-center mb-4">
          <AlertCircle class="w-8 h-8 text-score-low" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">Application Not Found</h3>
        <p class="text-muted-foreground mb-6">
          We couldn't find an application with the provided information. Please check your Application ID or email and try again.
        </p>
        <div class="text-sm text-muted-foreground">
          <p>Demo: Try using <strong class="text-foreground">APP-2026-001</strong> as Application ID</p>
        </div>
      </div>
    </template>

    <!-- Initial State -->
    <div v-else class="glass-card p-12 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Search class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">Track Your Application</h3>
      <p class="text-muted-foreground">
        Enter your Application ID or email above to check the status of your job application
      </p>
    </div>
  </div>
</template>

