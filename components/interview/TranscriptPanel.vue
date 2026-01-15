<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useInterviewStore } from '~/stores/interview'
import { cn, formatTime } from '~/lib/utils'
import { Sparkles, User } from 'lucide-vue-next'

const interviewStore = useInterviewStore()
const transcriptContainer = ref<HTMLElement | null>(null)

// Auto-scroll to bottom when new messages arrive
watch(
  () => interviewStore.transcript.length,
  async () => {
    await nextTick()
    if (transcriptContainer.value) {
      transcriptContainer.value.scrollTop = transcriptContainer.value.scrollHeight
    }
  }
)
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 class="font-semibold text-foreground">Live Transcript</h3>
      <span class="text-xs text-muted-foreground">
        {{ interviewStore.transcript.length }} messages
      </span>
    </div>

    <!-- Transcript -->
    <div
      ref="transcriptContainer"
      class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4"
    >
      <div
        v-for="(entry, index) in interviewStore.transcript"
        :key="entry.id"
        :class="[
          'flex gap-3 animate-fade-in',
          entry.speaker === 'ai' ? 'flex-row' : 'flex-row-reverse',
        ]"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <!-- Avatar -->
        <div
          :class="[
            'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
            entry.speaker === 'ai'
              ? 'bg-gradient-to-t from-ai-orange to-ai-red'
              : 'bg-gradient-to-br from-primary to-accent',
          ]"
        >
          <Sparkles v-if="entry.speaker === 'ai'" class="w-4 h-4 text-white" />
          <User v-else class="w-4 h-4 text-white" />
        </div>

        <!-- Message bubble -->
        <div
          :class="[
            'flex-1 max-w-[80%]',
            entry.speaker === 'ai' ? '' : 'text-right',
          ]"
        >
          <div
            :class="[
              'inline-block px-4 py-3 rounded-2xl text-sm',
              entry.speaker === 'ai'
                ? 'bg-card border border-border text-foreground rounded-tl-sm'
                : 'bg-primary/10 text-foreground rounded-tr-sm',
            ]"
          >
            {{ entry.message }}
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            {{ formatTime(entry.timestamp) }}
          </p>
        </div>
      </div>

      <!-- Typing indicator when AI is thinking -->
      <div
        v-if="interviewStore.state === 'thinking'"
        class="flex gap-3 animate-fade-in"
      >
        <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-t from-ai-orange to-ai-red">
          <Sparkles class="w-4 h-4 text-white animate-pulse" />
        </div>
        <div class="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-card border border-border">
          <div class="typing-dot" />
          <div class="typing-dot" />
          <div class="typing-dot" />
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-if="interviewStore.transcript.length === 0"
        class="flex flex-col items-center justify-center h-full text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Sparkles class="w-8 h-8 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground">
          Start the interview to see the transcript
        </p>
      </div>
    </div>
  </div>
</template>

