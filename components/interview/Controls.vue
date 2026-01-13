<script setup lang="ts">
import { useInterviewStore } from '~/stores/interview'
import { cn } from '~/lib/utils'
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Settings,
  Volume2,
  VolumeX,
  SkipForward,
  Pause,
  Play,
} from 'lucide-vue-next'

const interviewStore = useInterviewStore()

const emit = defineEmits<{
  end: []
}>()

function handleEndInterview() {
  emit('end')
}
</script>

<template>
  <div class="flex items-center justify-center gap-3">
    <!-- Mute toggle -->
    <button
      :class="cn(
        'relative p-4 rounded-2xl transition-all duration-200',
        interviewStore.isAudioEnabled
          ? 'bg-muted/50 hover:bg-muted/70 text-foreground'
          : 'bg-destructive/20 text-destructive hover:bg-destructive/30',
      )"
      @click="interviewStore.toggleAudio()"
    >
      <Mic v-if="interviewStore.isAudioEnabled" class="w-5 h-5" />
      <MicOff v-else class="w-5 h-5" />
    </button>

    <!-- Video toggle -->
    <button
      :class="cn(
        'relative p-4 rounded-2xl transition-all duration-200',
        interviewStore.isVideoEnabled
          ? 'bg-muted/50 hover:bg-muted/70 text-foreground'
          : 'bg-destructive/20 text-destructive hover:bg-destructive/30',
      )"
      @click="interviewStore.toggleVideo()"
    >
      <Video v-if="interviewStore.isVideoEnabled" class="w-5 h-5" />
      <VideoOff v-else class="w-5 h-5" />
    </button>

    <!-- End call -->
    <button
      class="p-4 rounded-2xl bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all duration-200 shadow-lg shadow-destructive/25"
      @click="handleEndInterview"
    >
      <PhoneOff class="w-5 h-5" />
    </button>

    <!-- Skip question -->
    <button
      class="p-4 rounded-2xl bg-muted/50 hover:bg-muted/70 text-foreground transition-all duration-200"
      :disabled="!interviewStore.currentQuestion"
    >
      <SkipForward class="w-5 h-5" />
    </button>

    <!-- Settings -->
    <button class="p-4 rounded-2xl bg-muted/50 hover:bg-muted/70 text-foreground transition-all duration-200">
      <Settings class="w-5 h-5" />
    </button>
  </div>
</template>

