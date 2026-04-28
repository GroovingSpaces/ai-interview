<script setup lang="ts">
import { computed } from 'vue'
import { Users, Sparkles, TrendingUp, Briefcase } from 'lucide-vue-next'
import { useCandidatesStore } from '~/stores/candidates'
import { useRequisitionsStore } from '~/stores/requisitions'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('talentRecruitment')
useHead({ title: () => title.value })

const candidatesStore = useCandidatesStore()
const reqStore = useRequisitionsStore()

const funnel = computed(() =>
  candidatesStore.funnelStages.map((s: any) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    count: candidatesStore.getStageCount(s.key),
  })),
)

const maxFunnel = computed(() => Math.max(1, ...funnel.value.map((f) => f.count)))

const stats = computed(() => ({
  total: candidatesStore.candidates.length,
  pipeline: candidatesStore.pipelineCount,
  avgScore: candidatesStore.averageAiScore,
  openJobs: reqStore.jobOpenings.filter((j) => j.status === 'open').length,
}))
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Pantau funnel rekrutmen, lowongan terbuka, dan kualitas kandidat." />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Kandidat" :value="stats.total" :icon="Users" />
      <UiStatCard label="Dalam Pipeline" :value="stats.pipeline" tone="primary" :icon="TrendingUp" />
      <UiStatCard label="Rata-rata Skor AI" :value="`${stats.avgScore}%`" tone="good" :icon="Sparkles" />
      <UiStatCard label="Lowongan Terbuka" :value="stats.openJobs" tone="average" :icon="Briefcase" />
    </div>

    <div class="glass-card p-6 space-y-4">
      <h3 class="font-semibold text-foreground">Funnel Rekrutmen</h3>
      <div class="space-y-3">
        <div v-for="(stage, i) in funnel" :key="stage.key" class="flex items-center gap-3">
          <div class="w-32 shrink-0 text-sm text-foreground capitalize">{{ stage.label }}</div>
          <div class="flex-1 h-8 bg-muted rounded-lg overflow-hidden flex items-center">
            <div
              class="h-full transition-all flex items-center px-3 text-xs font-semibold text-white"
              :style="{ width: `${(stage.count / maxFunnel) * 100}%`, backgroundColor: stage.color, minWidth: stage.count > 0 ? '60px' : '0' }"
            >
              <span v-if="stage.count > 0">{{ stage.count }}</span>
            </div>
          </div>
          <div class="w-16 text-right text-sm font-mono text-muted-foreground">{{ stage.count }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground">Lowongan Aktif</h3>
        </div>
        <div class="divide-y divide-border">
          <div v-for="j in reqStore.jobOpenings.filter((j) => j.status === 'open')" :key="j.id" class="p-4">
            <p class="font-medium text-foreground">{{ j.title }}</p>
            <p class="text-sm text-muted-foreground">{{ j.department }} • {{ j.location }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
        <div class="p-4 border-b border-border">
          <h3 class="font-semibold text-foreground">Top Kandidat (Skor AI)</h3>
        </div>
        <div class="divide-y divide-border">
          <div v-for="c in [...candidatesStore.candidates].sort((a, b) => b.aiScore - a.aiScore).slice(0, 5)" :key="c.id" class="p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-foreground">{{ c.name }}</p>
              <p class="text-sm text-muted-foreground">{{ c.position }}</p>
            </div>
            <UiStatusBadge :label="`${c.aiScore}%`" tone="primary" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
