<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCandidatesStore } from '~/stores/candidates'
import { formatDate, getScoreColor } from '~/lib/utils'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  MapPin,
  FileText,
  Download,
  Eye,
  MonitorPlay,
  ChevronRight,
  Star,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  User,
  GraduationCap,
  Award,
  ExternalLink,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin',
})

const route = useRoute()
const router = useRouter()
const candidatesStore = useCandidatesStore()

const candidateId = computed(() => route.params.id as string)
const candidate = computed(() => 
  candidatesStore.candidates.find(c => c.id === candidateId.value)
)

useHead({
  title: computed(() => candidate.value ? `${candidate.value.name} - Candidate Detail` : 'Candidate Detail'),
})

const showCVPreview = ref(false)

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  applied: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  screening: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  interview: { bg: 'bg-ai-red/10', text: 'text-ai-red', border: 'border-ai-red/30' },
  assessment: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  offer: { bg: 'bg-score-excellent/10', text: 'text-score-excellent', border: 'border-score-excellent/30' },
  hired: { bg: 'bg-score-excellent/10', text: 'text-score-excellent', border: 'border-score-excellent/30' },
  rejected: { bg: 'bg-score-low/10', text: 'text-score-low', border: 'border-score-low/30' },
}

const stageActions: Record<string, string> = {
  applied: 'Start Screening',
  screening: 'Schedule Interview',
  interview: 'Send Assessment',
  assessment: 'Extend Offer',
  offer: 'Mark as Hired',
  hired: 'View Profile',
  rejected: 'Reconsider',
}

function goBack() {
  router.push('/candidates')
}

function nextStage() {
  if (!candidate.value) return
  const stages = ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired']
  const currentIndex = stages.indexOf(candidate.value.stage)
  if (currentIndex < stages.length - 1) {
    candidatesStore.updateCandidateStage(candidate.value.id, stages[currentIndex + 1] as any)
  }
}

function openWhatsApp() {
  if (!candidate.value) return
  // Remove all non-numeric characters from phone number
  const phone = candidate.value.phone.replace(/\D/g, '')
  // Open WhatsApp Web with the phone number
  const message = encodeURIComponent(`Hi ${candidate.value.name}, this is regarding your application at Telkomsel.`)
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back Button & Header -->
    <div class="flex items-center gap-4">
      <button
        @click="goBack"
        class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">Candidate Detail</h1>
        <p class="text-sm text-muted-foreground">View candidate information and resume</p>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-if="!candidate" class="glass-card p-12 text-center">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <User class="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 class="text-lg font-semibold text-foreground mb-2">Candidate Not Found</h3>
      <p class="text-muted-foreground mb-4">The candidate you're looking for doesn't exist.</p>
      <UiButton variant="outline" @click="goBack">
        <ArrowLeft class="w-4 h-4" />
        Back to Candidates
      </UiButton>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Profile & Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Profile Card -->
          <div class="glass-card p-6">
            <div class="flex flex-col sm:flex-row sm:items-start gap-6">
              <UiAvatar :alt="candidate.name" size="xl" class="mx-auto sm:mx-0" />
              <div class="flex-1 text-center sm:text-left">
                <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                  <h2 class="text-2xl font-bold text-foreground">{{ candidate.name }}</h2>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium border capitalize inline-block',
                      stageColors[candidate.stage].bg,
                      stageColors[candidate.stage].text,
                      stageColors[candidate.stage].border,
                    ]"
                  >
                    {{ candidate.stage }}
                  </span>
                </div>
                <p class="text-lg text-muted-foreground mb-4">{{ candidate.position }}</p>
                
                <div class="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                  <div class="flex items-center gap-2">
                    <Building2 class="w-4 h-4" />
                    {{ candidate.department }}
                  </div>
                  <div class="flex items-center gap-2">
                    <Briefcase class="w-4 h-4" />
                    {{ candidate.experience }} years exp.
                  </div>
                  <div class="flex items-center gap-2">
                    <Calendar class="w-4 h-4" />
                    Applied {{ formatDate(candidate.appliedAt) }}
                  </div>
                </div>
              </div>
              <div class="text-center sm:text-right">
                <DashboardAIScoreBadge :score="candidate.aiScore" size="lg" show-label />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div class="p-2 rounded-lg bg-primary/10">
                  <Mail class="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Email</p>
                  <p class="font-medium text-foreground">{{ candidate.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                <div class="p-2 rounded-lg bg-primary/10">
                  <Phone class="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p class="text-xs text-muted-foreground">Phone</p>
                  <p class="font-medium text-foreground">{{ candidate.phone }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Skills -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">Skills & Expertise</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="skill in candidate.skills"
                :key="skill"
                class="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium border border-primary/20"
              >
                {{ skill }}
              </span>
            </div>
          </div>

          <!-- Interview Scores -->
          <div v-if="candidate.interviewScores" class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">Interview Scores</h3>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <p class="text-sm text-muted-foreground mb-2">Technical</p>
                <p class="text-3xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.technical)}`">
                  {{ candidate.interviewScores.technical }}%
                </p>
                <UiProgress :value="candidate.interviewScores.technical" variant="gradient" size="sm" class="mt-2" />
              </div>
              <div class="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <p class="text-sm text-muted-foreground mb-2">Communication</p>
                <p class="text-3xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.communication)}`">
                  {{ candidate.interviewScores.communication }}%
                </p>
                <UiProgress :value="candidate.interviewScores.communication" variant="gradient" size="sm" class="mt-2" />
              </div>
              <div class="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <p class="text-sm text-muted-foreground mb-2">Problem Solving</p>
                <p class="text-3xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.problemSolving)}`">
                  {{ candidate.interviewScores.problemSolving }}%
                </p>
                <UiProgress :value="candidate.interviewScores.problemSolving" variant="gradient" size="sm" class="mt-2" />
              </div>
              <div class="p-4 rounded-xl bg-muted/30 border border-border text-center">
                <p class="text-sm text-muted-foreground mb-2">Culture Fit</p>
                <p class="text-3xl font-bold" :class="`text-score-${getScoreColor(candidate.interviewScores.cultureFit)}`">
                  {{ candidate.interviewScores.cultureFit }}%
                </p>
                <UiProgress :value="candidate.interviewScores.cultureFit" variant="gradient" size="sm" class="mt-2" />
              </div>
            </div>
          </div>

          <!-- CV Preview Section -->
          <div class="glass-card p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-foreground">Resume / CV</h3>
              <div class="flex gap-2">
                <UiButton variant="outline" size="sm" @click="showCVPreview = !showCVPreview">
                  <Eye class="w-4 h-4" />
                  {{ showCVPreview ? 'Hide' : 'Preview' }}
                </UiButton>
                <UiButton variant="outline" size="sm">
                  <Download class="w-4 h-4" />
                  Download
                </UiButton>
              </div>
            </div>

            <!-- CV Preview -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-4"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-4"
            >
              <div v-if="showCVPreview" class="mt-4 p-6 rounded-xl bg-white dark:bg-slate-900 border border-border">
                <!-- CV Content Preview -->
                <div class="space-y-6 text-slate-900 dark:text-slate-100">
                  <!-- Header -->
                  <div class="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <h2 class="text-2xl font-bold">{{ candidate.name }}</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400">{{ candidate.position }}</p>
                    <div class="flex flex-wrap gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      <span>{{ candidate.email }}</span>
                      <span>{{ candidate.phone }}</span>
                    </div>
                  </div>

                  <!-- Summary -->
                  <div>
                    <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
                      <User class="w-5 h-5" />
                      Professional Summary
                    </h3>
                    <p class="text-slate-600 dark:text-slate-400 leading-relaxed">
                      Experienced {{ candidate.position }} with {{ candidate.experience }} years of experience 
                      in {{ candidate.department }}. Proven track record of delivering high-quality results 
                      and strong collaboration skills. Passionate about leveraging technology to solve 
                      complex problems and drive business value.
                    </p>
                  </div>

                  <!-- Skills -->
                  <div>
                    <h3 class="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Star class="w-5 h-5" />
                      Technical Skills
                    </h3>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="skill in candidate.skills"
                        :key="skill"
                        class="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm"
                      >
                        {{ skill }}
                      </span>
                    </div>
                  </div>

                  <!-- Experience -->
                  <div>
                    <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Briefcase class="w-5 h-5" />
                      Work Experience
                    </h3>
                    <div class="space-y-4">
                      <div class="border-l-2 border-primary pl-4">
                        <h4 class="font-semibold">{{ candidate.position }}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400">Tech Company • 2022 - Present</p>
                        <ul class="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                          <li>Led cross-functional teams to deliver key projects on time</li>
                          <li>Implemented best practices resulting in 40% efficiency improvement</li>
                          <li>Mentored junior team members and conducted code reviews</li>
                        </ul>
                      </div>
                      <div class="border-l-2 border-slate-300 dark:border-slate-600 pl-4">
                        <h4 class="font-semibold">Junior {{ candidate.position.replace('Senior ', '') }}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400">Startup Inc • 2019 - 2022</p>
                        <ul class="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                          <li>Developed and maintained core product features</li>
                          <li>Collaborated with design team to improve user experience</li>
                          <li>Participated in agile development processes</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <!-- Education -->
                  <div>
                    <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap class="w-5 h-5" />
                      Education
                    </h3>
                    <div class="border-l-2 border-slate-300 dark:border-slate-600 pl-4">
                      <h4 class="font-semibold">Bachelor of Science in Computer Science</h4>
                      <p class="text-sm text-slate-500 dark:text-slate-400">University of Indonesia • 2015 - 2019</p>
                      <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">GPA: 3.8/4.0</p>
                    </div>
                  </div>

                  <!-- Certifications -->
                  <div>
                    <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award class="w-5 h-5" />
                      Certifications
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <CheckCircle class="w-5 h-5 text-score-excellent" />
                        <div>
                          <p class="font-medium text-sm">AWS Solutions Architect</p>
                          <p class="text-xs text-slate-500">Amazon Web Services • 2023</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <CheckCircle class="w-5 h-5 text-score-excellent" />
                        <div>
                          <p class="font-medium text-sm">Google Cloud Professional</p>
                          <p class="text-xs text-slate-500">Google Cloud • 2022</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- CV Not Previewing State -->
            <div v-if="!showCVPreview" class="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
              <div class="p-3 rounded-xl bg-primary/10">
                <FileText class="w-6 h-6 text-primary" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-foreground">{{ candidate.name }}_Resume.pdf</p>
                <p class="text-sm text-muted-foreground">Uploaded on {{ formatDate(candidate.appliedAt) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Actions & Timeline -->
        <div class="space-y-6">
          <!-- Quick Actions -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">Actions</h3>
            <div class="space-y-3">
              <UiButton 
                variant="gradient" 
                class="w-full justify-between"
                @click="nextStage"
                :disabled="candidate.stage === 'hired' || candidate.stage === 'rejected'"
              >
                {{ stageActions[candidate.stage] }}
                <ChevronRight class="w-4 h-4" />
              </UiButton>
              
              <div class="grid grid-cols-2 gap-2">
                <UiButton 
                  variant="outline" 
                  size="sm" 
                  class="flex-col h-auto py-3 gap-1 hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-500"
                  @click="openWhatsApp"
                >
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span class="text-xs">WhatsApp</span>
                </UiButton>
                <UiButton variant="outline" size="sm" class="flex-col h-auto py-3 gap-1">
                  <MonitorPlay class="w-4 h-4" />
                  <span class="text-xs">Interview</span>
                </UiButton>
              </div>

              <UiButton 
                v-if="candidate.stage !== 'rejected'" 
                variant="outline" 
                class="w-full text-score-low border-score-low/30 hover:bg-score-low/10"
              >
                <XCircle class="w-4 h-4" />
                Reject Candidate
              </UiButton>
            </div>
          </div>

          <!-- Stage Progress -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">Pipeline Stage</h3>
            <div class="space-y-3">
              <div
                v-for="(stage, index) in ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired']"
                :key="stage"
                class="flex items-center gap-3"
              >
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                    candidate.stage === stage 
                      ? 'bg-primary text-white' 
                      : ['applied', 'screening', 'interview', 'assessment', 'offer', 'hired'].indexOf(candidate.stage) > index
                        ? 'bg-score-excellent text-white'
                        : 'bg-muted text-muted-foreground',
                  ]"
                >
                  <CheckCircle 
                    v-if="['applied', 'screening', 'interview', 'assessment', 'offer', 'hired'].indexOf(candidate.stage) > index" 
                    class="w-4 h-4" 
                  />
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <span
                  :class="[
                    'capitalize text-sm',
                    candidate.stage === stage ? 'font-semibold text-foreground' : 'text-muted-foreground',
                  ]"
                >
                  {{ stage }}
                </span>
              </div>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="glass-card p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <div class="space-y-4">
              <div class="flex gap-3">
                <div class="relative">
                  <div class="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div class="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border" />
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">Stage updated to {{ candidate.stage }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(candidate.lastActivity) }}</p>
                </div>
              </div>
              <div class="flex gap-3">
                <div class="relative">
                  <div class="w-2 h-2 rounded-full bg-muted mt-2" />
                  <div class="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border" />
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">AI Score calculated</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(candidate.appliedAt) }}</p>
                </div>
              </div>
              <div class="flex gap-3">
                <div class="w-2 h-2 rounded-full bg-muted mt-2" />
                <div>
                  <p class="text-sm font-medium text-foreground">Application submitted</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(candidate.appliedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

