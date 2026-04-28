<script setup lang="ts">
import { computed } from 'vue'
import { Users, TrendingUp, AlertTriangle } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'
import { useDemandStore } from '~/stores/demand'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('headcountForecast')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()
const demandStore = useDemandStore()

const departments = computed(() =>
  Array.from(new Set(employeesStore.employees.map((e) => e.department))).map((d) => {
    const current = employeesStore.employees.filter((e) => e.department === d && e.isActive).length
    const required = demandStore.getDemandByDepartment(d, demandStore.currentYear)
    const gap = required - current
    return { name: d, current, required, gap }
  }),
)

const total = computed(() => ({
  current: departments.value.reduce((s, d) => s + d.current, 0),
  required: departments.value.reduce((s, d) => s + d.required, 0),
  gap: departments.value.reduce((s, d) => s + Math.max(0, d.gap), 0),
}))
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Proyeksi headcount per departemen vs target tahun berjalan." />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Headcount Saat Ini" :value="total.current" :icon="Users" tone="primary" />
      <UiStatCard label="Target Tahunan" :value="total.required" :icon="TrendingUp" />
      <UiStatCard label="Gap Hire" :value="total.gap" :icon="AlertTriangle" tone="low" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border flex items-center justify-between gap-3">
        <h3 class="font-semibold text-foreground">Proyeksi per Departemen</h3>
        <span class="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
          Tahun {{ demandStore.currentYear }}
        </span>
      </div>

      <div v-if="departments.length > 0" class="divide-y divide-border">
        <div v-for="d in departments" :key="d.name" class="p-4 space-y-3">
          <div class="flex items-center justify-between gap-3">
            <p class="font-medium text-foreground">{{ d.name }}</p>
            <span
              class="text-xs px-2 py-1 rounded-md border"
              :class="d.gap > 0 ? 'text-destructive border-destructive/30 bg-destructive/10' : d.gap < 0 ? 'text-score-good border-score-good/30 bg-score-good/10' : 'text-primary border-primary/30 bg-primary/10'"
            >
              <template v-if="d.gap > 0">Perlu hire {{ d.gap }}</template>
              <template v-else-if="d.gap < 0">Surplus {{ Math.abs(d.gap) }}</template>
              <template v-else>Sesuai target</template>
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 text-xs">
            <div class="rounded-lg bg-muted/40 px-3 py-2">
              <p class="text-muted-foreground">Current</p>
              <p class="text-sm font-semibold text-foreground mt-0.5">{{ d.current }}</p>
            </div>
            <div class="rounded-lg bg-muted/40 px-3 py-2">
              <p class="text-muted-foreground">Required</p>
              <p class="text-sm font-semibold text-foreground mt-0.5">{{ d.required }}</p>
            </div>
            <div class="rounded-lg bg-muted/40 px-3 py-2">
              <p class="text-muted-foreground">Coverage</p>
              <p class="text-sm font-semibold text-foreground mt-0.5">
                {{ d.required > 0 ? Math.round((d.current / d.required) * 100) : 0 }}%
              </p>
            </div>
          </div>

          <div class="h-2 rounded-full bg-muted overflow-hidden">
            <div
              class="h-full transition-all"
              :class="d.current >= d.required ? 'bg-score-good' : d.current >= d.required * 0.7 ? 'bg-score-average' : 'bg-score-low'"
              :style="{ width: `${d.required > 0 ? Math.min(100, (d.current / d.required) * 100) : 0}%` }"
            />
          </div>
        </div>
      </div>

      <UiEmptyState
        v-else
        :icon="Users"
        title="Belum ada data proyeksi"
        description="Data departemen belum tersedia untuk ditampilkan."
      />
    </div>
  </div>
</template>
