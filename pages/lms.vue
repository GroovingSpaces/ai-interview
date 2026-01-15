<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLmsStore } from '~/stores/lms'
import { cn } from '~/lib/utils'
import {
  GraduationCap,
  Trophy,
  Clock,
  BookOpen,
  Target,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-vue-next'

useHead({
  title: 'Learning Hub',
})

const lmsStore = useLmsStore()
const activeCategory = ref('all')
const showQuiz = ref(false)

const categories = computed(() => {
  const cats = new Set(lmsStore.modules.map(m => m.category))
  return ['all', ...Array.from(cats)]
})

const filteredModules = computed(() => {
  if (activeCategory.value === 'all') return lmsStore.modules
  return lmsStore.modules.filter(m => m.category === activeCategory.value)
})

const stats = [
  {
    label: 'Total Progress',
    value: `${lmsStore.totalProgress}%`,
    icon: Target,
    color: 'from-ai-red to-ai-orange',
  },
  {
    label: 'Completed',
    value: lmsStore.completedModules,
    icon: GraduationCap,
    color: 'from-score-excellent to-emerald-400',
  },
  {
    label: 'Learning Time',
    value: `${Math.floor(lmsStore.totalLearningTime / 60)}h`,
    icon: Clock,
    color: 'from-ai-orange to-ai-red',
  },
  {
    label: 'Badges Earned',
    value: lmsStore.earnedBadges.length,
    icon: Trophy,
    color: 'from-amber-400 to-orange-400',
  },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Hero section -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-t from-ai-orange/20 to-ai-red/20 p-8 lg:p-12 border border-primary/20">
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-t from-ai-orange/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-ai-orange/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div class="space-y-4">
          <div class="flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-ai-red" />
            <span class="text-sm font-medium text-ai-red">AI-Powered Learning</span>
          </div>
          <h1 class="text-3xl lg:text-4xl font-bold text-foreground">
            Your Learning Journey
          </h1>
          <p class="text-muted-foreground text-lg max-w-lg">
            Personalized training paths designed to accelerate your growth and help you succeed in your role.
          </p>
          <div class="flex flex-wrap gap-3 pt-4">
            <UiButton variant="gradient" size="lg">
              Continue Learning
              <ChevronRight class="w-5 h-5" />
            </UiButton>
            <UiButton variant="outline" size="lg">
              Browse Paths
            </UiButton>
          </div>
        </div>

        <div class="flex justify-center lg:justify-end">
          <LmsProgressRing :value="lmsStore.totalProgress" :size="200" :stroke-width="12" />
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="glass-card p-4 flex items-center gap-4"
      >
        <div
          :class="cn(
            'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
            stat.color
          )"
        >
          <component :is="stat.icon" class="w-6 h-6 text-white" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground">{{ stat.value }}</p>
          <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Badges -->
    <div v-if="lmsStore.earnedBadges.length > 0" class="glass-card p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-foreground">Earned Badges</h2>
        <UiButton variant="ghost" size="sm">View All</UiButton>
      </div>
      <div class="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        <div
          v-for="badge in lmsStore.earnedBadges"
          :key="badge.id"
          class="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
        >
          <span class="text-3xl">{{ badge.icon }}</span>
          <span class="text-sm font-medium text-foreground whitespace-nowrap">{{ badge.name }}</span>
        </div>
      </div>
    </div>

    <!-- Learning Paths -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold text-foreground">Learning Paths</h2>
        <UiButton variant="ghost" size="sm">
          View All Paths
          <ChevronRight class="w-4 h-4" />
        </UiButton>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <LmsLearningPath
          v-for="path in lmsStore.learningPaths"
          :key="path.id"
          :path="path"
        />
      </div>
    </div>

    <!-- Modules -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 class="text-xl font-semibold text-foreground">All Modules</h2>
        <div class="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <button
            v-for="category in categories"
            :key="category"
            :class="cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeCategory === category
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )"
            @click="activeCategory = category"
          >
            {{ category === 'all' ? 'All' : category }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <LmsModuleCard
          v-for="module in filteredModules"
          :key="module.id"
          :module="module"
          @start="lmsStore.startModule"
        />
      </div>
    </div>

    <!-- AI Quiz Demo -->
    <div class="glass-card p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-ai-orange/20">
            <Sparkles class="w-5 h-5 text-ai-orange" />
          </div>
          <div>
            <h3 class="font-semibold text-foreground">AI-Generated Quiz</h3>
            <p class="text-sm text-muted-foreground">Test your knowledge with personalized questions</p>
          </div>
        </div>
        <UiButton
          variant="outline"
          @click="showQuiz = !showQuiz"
        >
          {{ showQuiz ? 'Hide Quiz' : 'Try Quiz' }}
        </UiButton>
      </div>

      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <LmsQuizCard
          v-if="showQuiz"
          :quiz="{
            id: 'demo-quiz',
            title: 'Quick Knowledge Check',
            aiGenerated: true,
            passScore: 70,
            completed: false,
            questions: [
              {
                id: 'q1',
                question: 'What is the primary purpose of our AI recruitment system?',
                options: [
                  'To replace human HR staff',
                  'To streamline and enhance the hiring process',
                  'To automatically reject candidates',
                  'To manage payroll',
                ],
                correctAnswer: 1,
                explanation: 'The AI system is designed to assist and enhance, not replace human decision-making.',
              },
              {
                id: 'q2',
                question: 'Which metric best indicates a strong candidate match?',
                options: [
                  'Years of experience only',
                  'AI Score combined with interview performance',
                  'Number of certifications',
                  'Previous salary',
                ],
                correctAnswer: 1,
                explanation: 'A holistic approach combining AI analysis and human assessment provides the best results.',
              },
            ],
          }"
          class="mt-4"
        />
      </Transition>
    </div>
  </div>
</template>

