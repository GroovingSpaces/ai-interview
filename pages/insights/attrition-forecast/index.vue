<script setup lang="ts">
import { computed } from 'vue'
import { TrendingDown, AlertTriangle, Users, Calendar } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('attritionForecast')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()

interface AttritionRow {
  id: string
  name: string
  department: string
  tenure: number
  contractEndDate?: string
  riskScore: number
  reasonHints: string[]
}

function computeTenure(joinDate: string): number {
  const join = new Date(joinDate).getTime()
  const now = new Date().getTime()
  return Math.max(0, Math.floor((now - join) / (1000 * 60 * 60 * 24 * 365)))
}

const rows = computed<AttritionRow[]>(() =>
  employeesStore.employees.filter((e) => e.isActive).map((e) => {
    const tenure = computeTenure(e.joinDate)
    const reasonHints: string[] = []
    let score = 0
    if (e.contractEndDate && new Date(e.contractEndDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000) {
      score += 40
      reasonHints.push('Kontrak hampir habis')
    }
    if (tenure >= 1 && tenure < 2) {
      score += 25
      reasonHints.push('Tenure 1-2 tahun (rentan turnover)')
    }
    if (tenure >= 5) {
      score += 15
      reasonHints.push('Tenure panjang, risiko stagnasi')
    }
    if ((e.certifications?.length ?? 0) === 0 && tenure >= 2) {
      score += 10
      reasonHints.push('Belum ada sertifikasi (development gap)')
    }
    return {
      id: e.id,
      name: e.name,
      department: e.department,
      tenure,
      contractEndDate: e.contractEndDate,
      riskScore: Math.min(100, score),
      reasonHints,
    }
  }).sort((a, b) => b.riskScore - a.riskScore),
)

const stats = computed(() => ({
  high: rows.value.filter((r) => r.riskScore >= 60).length,
  medium: rows.value.filter((r) => r.riskScore >= 30 && r.riskScore < 60).length,
  low: rows.value.filter((r) => r.riskScore < 30).length,
}))

function tone(score: number): 'low' | 'average' | 'good' {
  if (score >= 60) return 'low'
  if (score >= 30) return 'average'
  return 'good'
}
function level(score: number): string {
  if (score >= 60) return 'High'
  if (score >= 30) return 'Medium'
  return 'Low'
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Estimasi risiko karyawan keluar berdasarkan tenure, kontrak, dan development." />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Risiko Tinggi" :value="stats.high" tone="low" :icon="AlertTriangle" />
      <UiStatCard label="Risiko Sedang" :value="stats.medium" tone="average" :icon="TrendingDown" />
      <UiStatCard label="Risiko Rendah" :value="stats.low" tone="good" :icon="Users" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border">
        <h3 class="font-semibold text-foreground">Top Risiko Attrition</h3>
      </div>
      <div class="divide-y divide-border">
        <div v-for="r in rows" :key="r.id" class="p-4">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <p class="font-medium text-foreground">{{ r.name }}</p>
              <div class="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{{ r.department }}</span>
                <span>•</span>
                <span>{{ r.tenure }} tahun</span>
                <span v-if="r.contractEndDate">• Kontrak hingga {{ r.contractEndDate }}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-1">
                <span v-for="h in r.reasonHints" :key="h" class="px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground">{{ h }}</span>
                <span v-if="r.reasonHints.length === 0" class="text-xs text-muted-foreground">Tidak ada indikator risiko signifikan</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <UiStatusBadge :label="`${level(r.riskScore)} (${r.riskScore})`" :tone="tone(r.riskScore)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
