<script setup lang="ts">
import { computed } from 'vue'
import { useLmsStore } from '~/stores/lms'
import type { Lesson } from '~/stores/lms'
import { cn } from '~/lib/utils'
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Video,
  FileText,
  MousePointer,
  Dumbbell,
  Lock,
  Play,
  CheckCircle,
  Target,
} from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const lmsStore = useLmsStore()

const moduleId = computed(() => route.params.id as string)
const moduleData = computed(() => lmsStore.getModuleById(moduleId.value))
const learningMethods = computed(() => lmsStore.getLearningMethodsByModule(moduleId.value))

const lessonTypeMeta: Record<Lesson['type'], { icon: typeof Video; labelKey: string; class: string }> = {
  video: { icon: Video, labelKey: 'learningHub.methodVideo', class: 'bg-blue-500/20 text-blue-600 border-blue-500/30' },
  reading: { icon: FileText, labelKey: 'learningHub.methodReading', class: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
  interactive: { icon: MousePointer, labelKey: 'learningHub.methodInteractive', class: 'bg-amber-500/20 text-amber-600 border-amber-500/30' },
  exercise: { icon: Dumbbell, labelKey: 'learningHub.methodExercise', class: 'bg-purple-500/20 text-purple-600 border-purple-500/30' },
}

const difficultyColors: Record<string, string> = {
  beginner: 'bg-score-excellent/20 text-score-excellent border-score-excellent/30',
  intermediate: 'bg-score-average/20 text-score-average border-score-average/30',
  advanced: 'bg-score-low/20 text-score-low border-score-low/30',
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function goBack() {
  router.push('/lms')
}

function startOrContinue() {
  if (!moduleData.value?.locked) lmsStore.startModule(moduleData.value!.id)
}

useHead({
  title: () => (moduleData.value ? `${moduleData.value.title} | ${t('learningHub.title')}` : t('learningHub.title')),
})
</script>

<template>
  <div class="space-y-6">
    <!-- Back -->
    <UiButton variant="ghost" size="sm" class="gap-2 -ml-2" @click="goBack">
      <ArrowLeft class="w-4 h-4" />
      {{ t('learningHub.backToModules') }}
    </UiButton>

    <template v-if="moduleData">
      <!-- Header -->
      <div class="rounded-2xl border border-border bg-card p-6 lg:p-8">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div class="flex items-start gap-4">
            <div
              :class="cn(
                'w-16 h-16 rounded-xl flex items-center justify-center text-3xl',
                moduleData.completed ? 'bg-score-excellent/20' : 'bg-primary/10',
              )"
            >
              <CheckCircle v-if="moduleData.completed" class="w-8 h-8 text-score-excellent" />
              <span v-else>{{ moduleData.icon }}</span>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-foreground">{{ moduleData.title }}</h1>
              <p class="text-muted-foreground mt-1">{{ moduleData.description }}</p>
              <div class="flex flex-wrap items-center gap-2 mt-3">
                <span class="px-2 py-1 rounded-lg bg-muted/50 text-sm text-muted-foreground">{{ moduleData.category }}</span>
                <span
                  :class="cn(
                    'px-2 py-1 rounded-lg text-sm font-medium capitalize border',
                    difficultyColors[moduleData.difficulty] ?? 'bg-muted/50 border-border',
                  )"
                >
                  {{ moduleData.difficulty }}
                </span>
                <span class="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock class="w-4 h-4" />
                  {{ formatDuration(moduleData.duration) }}
                </span>
              </div>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <UiButton
              v-if="!moduleData.locked"
              variant="gradient"
              class="gap-2"
              @click="startOrContinue"
            >
              <Play class="w-4 h-4" />
              {{ moduleData.progress > 0 ? t('learningHub.continueModule') : t('learningHub.startModule') }}
            </UiButton>
            <div
              v-if="moduleData.locked"
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 text-muted-foreground"
            >
              <Lock class="w-4 h-4" />
              <span class="text-sm">{{ t('learningHub.locked') }}</span>
            </div>
            <UiButton variant="outline" @click="goBack">
              {{ t('learningHub.backToModules') }}
            </UiButton>
          </div>
        </div>
        <div class="mt-6 pt-6 border-t border-border">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">{{ t('learningHub.progress') }}</span>
            <span class="font-medium">{{ moduleData.progress }}%</span>
          </div>
          <UiProgress
            :value="moduleData.progress"
            :variant="moduleData.completed ? 'success' : 'gradient'"
            size="md"
            class="mt-2"
          />
        </div>
      </div>

      <!-- Learning methods per module -->
      <div class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target class="w-5 h-5" />
          {{ t('learningHub.learningMethods') }}
        </h2>
        <p class="text-sm text-muted-foreground mb-4">
          {{ t('learningHub.learningMethodsDesc') }}
        </p>
        <div class="flex flex-wrap gap-3">
          <template v-for="(meta, type) in lessonTypeMeta" :key="type">
            <div
              v-if="learningMethods[type as Lesson['type']] > 0"
              :class="cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl border',
                meta.class,
              )"
            >
              <component :is="meta.icon" class="w-4 h-4" />
              <span class="font-medium">{{ t(meta.labelKey) }}</span>
              <span class="text-sm opacity-90">× {{ learningMethods[type as Lesson['type']] }}</span>
            </div>
          </template>
        </div>
      </div>

      <!-- Lessons list -->
      <div class="rounded-2xl border border-border bg-card p-6">
        <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BookOpen class="w-5 h-5" />
          {{ t('learningHub.lessons') }} ({{ moduleData.lessons.length }})
        </h2>
        <ul class="space-y-2">
          <li
            v-for="(lesson, index) in moduleData.lessons"
            :key="lesson.id"
            :class="cn(
              'flex items-center gap-4 p-3 rounded-xl border transition-colors',
              lesson.completed ? 'bg-score-excellent/5 border-score-excellent/20' : 'bg-muted/20 border-border',
            )"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-background border border-border">
              <CheckCircle v-if="lesson.completed" class="w-4 h-4 text-score-excellent" />
              <span v-else class="text-sm font-medium text-muted-foreground">{{ index + 1 }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-foreground">{{ lesson.title }}</p>
              <div class="flex items-center gap-2 mt-1">
                <span
                  :class="cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
                    lessonTypeMeta[lesson.type]?.class ?? 'bg-muted border-border',
                  )"
                >
                  <component :is="lessonTypeMeta[lesson.type]?.icon" class="w-3 h-3" />
                  {{ t(lessonTypeMeta[lesson.type]?.labelKey ?? 'learningHub.lesson') }}
                </span>
                <span class="text-xs text-muted-foreground">{{ formatDuration(lesson.duration) }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Quiz (if any) -->
      <div
        v-if="moduleData.quiz"
        class="rounded-2xl border border-border bg-card p-6"
      >
        <h2 class="text-lg font-semibold text-foreground mb-2">{{ moduleData.quiz.title }}</h2>
        <p class="text-sm text-muted-foreground mb-4">
          {{ moduleData.quiz.completed
            ? t('learningHub.quizScore', { score: moduleData.quiz.score })
            : t('learningHub.quizPassScore', { score: moduleData.quiz.passScore })
          }}
        </p>
        <UiButton
          v-if="!moduleData.quiz.completed && !moduleData.locked"
          variant="outline"
          @click="lmsStore.startQuiz(moduleData.quiz!.id)"
        >
          {{ t('learningHub.takeQuiz') }}
        </UiButton>
      </div>
    </template>

    <!-- Not found -->
    <div
      v-else
      class="rounded-2xl border border-border bg-card p-12 text-center"
    >
      <p class="text-muted-foreground mb-4">{{ t('learningHub.noModuleFound') }}</p>
      <UiButton variant="outline" @click="goBack">
        {{ t('learningHub.backToModules') }}
      </UiButton>
    </div>
  </div>
</template>
