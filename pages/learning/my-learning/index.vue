<script setup lang="ts">
import { computed } from 'vue'
import { GraduationCap, BookOpen, Trophy, Clock } from 'lucide-vue-next'
import { useLmsStore } from '~/stores/lms'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('myLearning')
useHead({ title: () => title.value })

const lmsStore = useLmsStore()

const inProgress = computed(() => lmsStore.modules.filter((m) => !m.completed && m.progress > 0))
const completed = computed(() => lmsStore.modules.filter((m) => m.completed))
const recommended = computed(() => lmsStore.modules.filter((m) => m.progress === 0 && !m.locked).slice(0, 3))
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Pantau learning path personal Anda dan progres modul." />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Progress" :value="`${lmsStore.totalProgress}%`" tone="primary" :icon="Trophy" />
      <UiStatCard label="Modul Selesai" :value="lmsStore.completedModules" tone="good" :icon="GraduationCap" />
      <UiStatCard label="Total Belajar" :value="`${lmsStore.totalLearningTime} menit`" tone="average" :icon="Clock" />
      <UiStatCard label="Sedang Belajar" :value="inProgress.length" :icon="BookOpen" />
    </div>

    <div v-if="inProgress.length" class="space-y-3">
      <h3 class="font-semibold text-foreground">Sedang Berlangsung</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="m in inProgress" :key="m.id" class="glass-card p-5">
          <p class="font-medium text-foreground">{{ m.title }}</p>
          <p class="text-sm text-muted-foreground">{{ m.category }} • {{ m.duration }} menit</p>
          <div class="mt-3">
            <div class="flex items-center justify-between text-xs text-muted-foreground"><span>Progress</span><span class="font-semibold">{{ m.progress }}%</span></div>
            <div class="mt-1 h-2 rounded-full bg-muted overflow-hidden">
              <div class="h-full bg-primary" :style="{ width: `${m.progress}%` }" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="recommended.length" class="space-y-3">
      <h3 class="font-semibold text-foreground">Direkomendasikan</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="m in recommended" :key="m.id" class="glass-card p-5">
          <UiStatusBadge :label="m.difficulty" tone="primary" />
          <p class="font-medium text-foreground mt-2">{{ m.title }}</p>
          <p class="text-sm text-muted-foreground line-clamp-2">{{ m.description }}</p>
        </div>
      </div>
    </div>

    <div v-if="completed.length" class="space-y-3">
      <h3 class="font-semibold text-foreground">Sudah Selesai</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div v-for="m in completed" :key="m.id" class="rounded-xl border border-border bg-card/50 p-4 flex items-center gap-3">
          <Trophy class="w-5 h-5 text-score-good shrink-0" />
          <div class="min-w-0">
            <p class="font-medium text-foreground truncate">{{ m.title }}</p>
            <p class="text-xs text-muted-foreground">{{ m.category }}</p>
          </div>
        </div>
      </div>
    </div>

    <UiEmptyState
      v-if="!inProgress.length && !completed.length && !recommended.length"
      :icon="GraduationCap"
      title="Belum ada modul"
      description="Modul learning belum tersedia."
    />
  </div>
</template>
