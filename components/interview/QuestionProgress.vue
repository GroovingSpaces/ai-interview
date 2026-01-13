<script setup lang="ts">
import { computed } from 'vue'
import { useInterviewStore } from '~/stores/interview'
import { cn, getScoreColor } from '~/lib/utils'
import { Check, Circle, Play, Lock } from 'lucide-vue-next'

const interviewStore = useInterviewStore()

const questionTypeColors: Record<string, string> = {
  behavioral: 'from-blue-500 to-blue-400',
  technical: 'from-ai-cyan to-cyan-400',
  situational: 'from-ai-purple to-purple-400',
  'follow-up': 'from-ai-pink to-pink-400',
}
</script>

<template>
  <div class="space-y-4">
    <!-- Progress bar -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Progress</span>
        <span class="font-medium text-foreground">
          {{ interviewStore.questions.filter(q => q.answered).length }}/{{ interviewStore.questions.length }} Questions
        </span>
      </div>
      <UiProgress :value="interviewStore.progress" variant="gradient" size="md" />
    </div>

    <!-- Questions list -->
    <div class="space-y-2">
      <div
        v-for="(question, index) in interviewStore.questions"
        :key="question.id"
        :class="cn(
          'relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200',
          question.answered
            ? 'bg-muted/30 border border-border'
            : interviewStore.currentQuestion?.id === question.id
              ? 'bg-primary/5 border border-primary/30'
              : 'bg-muted/10 border border-transparent',
        )"
      >
        <!-- Status icon -->
        <div
          :class="cn(
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
            question.answered
              ? 'bg-score-excellent/20'
              : interviewStore.currentQuestion?.id === question.id
                ? `bg-gradient-to-br ${questionTypeColors[question.type]} text-white`
                : 'bg-muted/50'
          )"
        >
          <Check v-if="question.answered" class="w-4 h-4 text-score-excellent" />
          <Play v-else-if="interviewStore.currentQuestion?.id === question.id" class="w-4 h-4" />
          <Circle v-else class="w-4 h-4 text-muted-foreground" />
        </div>

        <!-- Question info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span
              :class="cn(
                'px-2 py-0.5 rounded text-xs font-medium capitalize',
                question.answered
                  ? 'bg-muted text-muted-foreground'
                  : interviewStore.currentQuestion?.id === question.id
                    ? `bg-gradient-to-r ${questionTypeColors[question.type]} text-white`
                    : 'bg-muted/50 text-muted-foreground',
              )"
            >
              {{ question.type }}
            </span>
            <span
              :class="cn(
                'px-2 py-0.5 rounded text-xs',
                question.difficulty === 'easy' && 'bg-score-excellent/20 text-score-excellent',
                question.difficulty === 'medium' && 'bg-score-average/20 text-score-average',
                question.difficulty === 'hard' && 'bg-score-low/20 text-score-low',
              )"
            >
              {{ question.difficulty }}
            </span>
          </div>
          <p
            :class="cn(
              'text-sm line-clamp-2',
              question.answered
                ? 'text-muted-foreground'
                : interviewStore.currentQuestion?.id === question.id
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground',
            )"
          >
            {{ question.question }}
          </p>
          <p v-if="question.answered && question.score" class="mt-1 text-xs">
            <span :class="`text-score-${getScoreColor(question.score)}`">
              Score: {{ question.score }}%
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

