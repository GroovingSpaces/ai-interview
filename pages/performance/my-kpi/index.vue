<script setup lang="ts">
import { ref, computed } from 'vue'
import { Target, Sparkles, Trophy, ClipboardList } from 'lucide-vue-next'
import { useKpiStore } from '~/stores/kpi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('myKpi')
useHead({ title: () => title.value })

const kpiStore = useKpiStore()
const authStore = useAuthStore()

const meId = computed(() => authStore.user?.id ?? '1')
const period = ref(kpiStore.periodOptions[0]?.value ?? '2026-Q1')

const periodOptions = kpiStore.periodOptions

const myAssignments = computed(() => kpiStore.getAssignmentsByEmployeeAndPeriod(meId.value, period.value))

const overallScore = computed(() => {
  if (myAssignments.value.length === 0) return 0
  let sum = 0
  let totalWeight = 0
  for (const a of myAssignments.value) {
    const policy = kpiStore.getPolicyById(a.policyId)
    if (!policy) continue
    const pct = a.target > 0 ? Math.min(100, (a.actual / a.target) * 100) : 0
    sum += pct * policy.weight
    totalWeight += policy.weight
  }
  return totalWeight === 0 ? 0 : Math.round(sum / totalWeight)
})

const statsByStatus = computed(() => ({
  total: myAssignments.value.length,
  reviewed: myAssignments.value.filter((a) => a.status === 'reviewed').length,
  submitted: myAssignments.value.filter((a) => a.status === 'submitted').length,
  inProgress: myAssignments.value.filter((a) => a.status === 'in_progress').length,
}))

function pct(target: number, actual: number) {
  if (!target) return 0
  return Math.min(100, Math.round((actual / target) * 100))
}
function tone(p: number): 'good' | 'average' | 'low' {
  if (p >= 90) return 'good'
  if (p >= 70) return 'average'
  return 'low'
}
function statusLabel(s: string) {
  return s === 'reviewed' ? 'Final' : s === 'submitted' ? 'Submitted' : s === 'in_progress' ? 'In Progress' : 'Draft'
}
function statusTone(s: string): 'good' | 'average' | 'muted' | 'primary' {
  if (s === 'reviewed') return 'good'
  if (s === 'submitted') return 'primary'
  if (s === 'in_progress') return 'average'
  return 'muted'
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Pantau pencapaian KPI Anda di setiap periode.">
      <template #actions>
        <div class="w-40">
          <UiSelect v-model="period" :options="periodOptions" />
        </div>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UiStatCard label="Skor Keseluruhan" :value="`${overallScore}%`" tone="primary" :icon="Trophy" />
      <UiStatCard label="Total KPI" :value="statsByStatus.total" :icon="ClipboardList" />
      <UiStatCard label="Sudah Direview" :value="statsByStatus.reviewed" tone="good" :icon="Sparkles" />
      <UiStatCard label="In Progress" :value="statsByStatus.inProgress" tone="average" :icon="Target" />
    </div>

    <div class="space-y-3">
      <UiEmptyState
        v-if="myAssignments.length === 0"
        :icon="Target"
        title="Belum ada KPI untuk periode ini"
        description="Hubungi atasan untuk menetapkan KPI."
      />
      <div
        v-for="a in myAssignments"
        :key="a.id"
        class="glass-card p-5"
      >
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-foreground">{{ kpiStore.getPolicyById(a.policyId)?.name ?? 'KPI' }}</h3>
              <UiStatusBadge :label="statusLabel(a.status)" :tone="statusTone(a.status)" />
              <span class="text-xs text-muted-foreground">Bobot {{ kpiStore.getPolicyById(a.policyId)?.weight ?? 0 }}%</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">
              {{ kpiStore.getPolicyById(a.policyId)?.description }}
            </p>
            <div class="grid grid-cols-3 gap-3 mt-3 text-sm">
              <div>
                <p class="text-xs text-muted-foreground">Target</p>
                <p class="font-semibold text-foreground">{{ a.target }} {{ kpiStore.getPolicyById(a.policyId)?.targetUnit }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Realisasi</p>
                <p class="font-semibold text-foreground">{{ a.actual }} {{ kpiStore.getPolicyById(a.policyId)?.targetUnit }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Pencapaian</p>
                <p class="font-semibold" :class="`text-score-${tone(pct(a.target, a.actual))}`">{{ pct(a.target, a.actual) }}%</p>
              </div>
            </div>
            <div class="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                class="h-full"
                :class="`bg-score-${tone(pct(a.target, a.actual))}`"
                :style="{ width: `${pct(a.target, a.actual)}%` }"
              />
            </div>
            <p v-if="a.notes" class="text-sm text-muted-foreground mt-3">📝 {{ a.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
