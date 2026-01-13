<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Quiz, QuizQuestion } from '~/stores/lms'
import { cn } from '~/lib/utils'
import { Sparkles, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-vue-next'

interface Props {
  quiz: Quiz
  class?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [score: number]
}>()

const currentQuestionIndex = ref(0)
const selectedAnswers = ref<Record<string, number>>({})
const showResults = ref(false)

const currentQuestion = computed(() => props.quiz.questions[currentQuestionIndex.value])
const isLastQuestion = computed(() => currentQuestionIndex.value === props.quiz.questions.length - 1)

const score = computed(() => {
  let correct = 0
  props.quiz.questions.forEach(q => {
    if (selectedAnswers.value[q.id] === q.correctAnswer) {
      correct++
    }
  })
  return Math.round((correct / props.quiz.questions.length) * 100)
})

function selectAnswer(answer: number) {
  if (!showResults.value) {
    selectedAnswers.value[currentQuestion.value.id] = answer
  }
}

function nextQuestion() {
  if (isLastQuestion.value) {
    showResults.value = true
    emit('complete', score.value)
  } else {
    currentQuestionIndex.value++
  }
}

function resetQuiz() {
  currentQuestionIndex.value = 0
  selectedAnswers.value = {}
  showResults.value = false
}
</script>

<template>
  <div :class="cn('glass-card p-6', props.class)">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2">
        <div class="p-2 rounded-lg bg-ai-purple/20">
          <Sparkles class="w-5 h-5 text-ai-purple" />
        </div>
        <div>
          <h3 class="font-semibold text-foreground">{{ quiz.title }}</h3>
          <p v-if="quiz.aiGenerated" class="text-xs text-ai-purple">AI Generated</p>
        </div>
      </div>
      <span class="text-sm text-muted-foreground">
        {{ showResults ? 'Completed' : `${currentQuestionIndex + 1}/${quiz.questions.length}` }}
      </span>
    </div>

    <!-- Results view -->
    <div v-if="showResults" class="text-center py-8 space-y-6">
      <div
        :class="cn(
          'w-24 h-24 mx-auto rounded-full flex items-center justify-center text-3xl font-bold',
          score >= quiz.passScore
            ? 'bg-score-excellent/20 text-score-excellent'
            : 'bg-score-low/20 text-score-low'
        )"
      >
        {{ score }}%
      </div>
      <div>
        <h4 class="text-xl font-semibold text-foreground">
          {{ score >= quiz.passScore ? 'Congratulations!' : 'Keep Learning' }}
        </h4>
        <p class="text-muted-foreground mt-1">
          {{ score >= quiz.passScore 
            ? 'You passed the assessment!' 
            : `You need ${quiz.passScore}% to pass. Try again!` 
          }}
        </p>
      </div>
      <UiButton variant="outline" @click="resetQuiz">
        <RotateCcw class="w-4 h-4" />
        Retake Quiz
      </UiButton>
    </div>

    <!-- Question view -->
    <template v-else>
      <!-- Progress -->
      <UiProgress
        :value="((currentQuestionIndex + 1) / quiz.questions.length) * 100"
        variant="gradient"
        size="sm"
        class="mb-6"
      />

      <!-- Question -->
      <div class="space-y-4">
        <p class="text-lg font-medium text-foreground">
          {{ currentQuestion.question }}
        </p>

        <!-- Options -->
        <div class="space-y-3">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            :class="cn(
              'w-full p-4 rounded-xl text-left transition-all duration-200 border',
              selectedAnswers[currentQuestion.id] === index
                ? 'bg-primary/10 border-primary/30 text-foreground'
                : 'bg-muted/30 border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground',
            )"
            @click="selectAnswer(index)"
          >
            <div class="flex items-center gap-3">
              <div
                :class="cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  selectedAnswers[currentQuestion.id] === index
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground',
                )"
              >
                <div
                  v-if="selectedAnswers[currentQuestion.id] === index"
                  class="w-2 h-2 rounded-full bg-white"
                />
              </div>
              <span>{{ option }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-end mt-6">
        <UiButton
          variant="gradient"
          :disabled="selectedAnswers[currentQuestion.id] === undefined"
          @click="nextQuestion"
        >
          {{ isLastQuestion ? 'Submit' : 'Next' }}
          <ArrowRight class="w-4 h-4" />
        </UiButton>
      </div>
    </template>
  </div>
</template>

