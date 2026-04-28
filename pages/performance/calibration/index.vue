<script setup lang="ts">
import { ref, computed } from 'vue'
import { Save, BarChart3, ArrowUpDown } from 'lucide-vue-next'
import { useKpiStore } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('calibration')
useHead({ title: () => title.value })

const kpiStore = useKpiStore()
const employeesStore = useEmployeesStore()

const period = ref(kpiStore.periodOptions[0]?.value ?? '2026-Q1')
const departmentFilter = ref<string>('all')

const departmentOptions = computed(() => [
  { value: 'all', label: 'Semua Departemen' },
  ...Array.from(new Set(employeesStore.employees.map((e) => e.department))).map((d) => ({ value: d, label: d })),
])

interface CalibrationRow {
  id: string
  name: string
  employeeId: string
  department: string
  rawScore: number
  rating: 'top' | 'core' | 'low' | ''
  finalScore: number
}

const rows = ref<CalibrationRow[]>([])
const pagination = usePagination(rows, { pageSize: 10 })

function refreshRows() {
  rows.value = employeesStore.employees
    .filter((e) => departmentFilter.value === 'all' || e.department === departmentFilter.value)
    .map((e) => {
      const list = kpiStore.getAssignmentsByEmployeeAndPeriod(e.id, period.value)
      let s = 0, w = 0
      for (const a of list) {
        const p = kpiStore.getPolicyById(a.policyId)
        if (!p) continue
        s += (a.target > 0 ? Math.min(100, (a.actual / a.target) * 100) : 0) * p.weight
        w += p.weight
      }
      const score = w === 0 ? 0 : Math.round(s / w)
      return {
        id: e.id,
        name: e.name,
        employeeId: e.employeeId,
        department: e.department,
        rawScore: score,
        rating: score >= 90 ? 'top' : score >= 70 ? 'core' : 'low' as 'top' | 'core' | 'low',
        finalScore: score,
      }
    })
    .sort((a, b) => b.rawScore - a.rawScore)
}
refreshRows()

const ratingOptions = [
  { value: 'top', label: 'Top Performer' },
  { value: 'core', label: 'Core' },
  { value: 'low', label: 'Below Expectation' },
]

const dist = computed(() => ({
  top: rows.value.filter((r) => r.rating === 'top').length,
  core: rows.value.filter((r) => r.rating === 'core').length,
  low: rows.value.filter((r) => r.rating === 'low').length,
}))

function tone(r: string): 'good' | 'average' | 'low' | 'muted' {
  if (r === 'top') return 'good'
  if (r === 'core') return 'average'
  if (r === 'low') return 'low'
  return 'muted'
}

function applyAdjustment() {
  // In a real flow, calibration adjusts assignment statuses or notes.
  // Here we just lock-in by setting status to 'reviewed' for everyone with finalScore > 0.
  for (const row of rows.value) {
    const list = kpiStore.getAssignmentsByEmployeeAndPeriod(row.id, period.value)
    for (const a of list) kpiStore.updateAssignment(a.id, { status: 'reviewed' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kalibrasi rating performa lintas tim agar konsisten dan adil.">
      <template #actions>
        <div class="w-40">
          <UiSelect v-model="period" :options="kpiStore.periodOptions" />
        </div>
        <div class="w-48">
          <UiSelect v-model="departmentFilter" :options="departmentOptions" @update:model-value="refreshRows" />
        </div>
        <UiButton variant="gradient" @click="applyAdjustment">
          <Save class="w-4 h-4" />
          Terapkan Kalibrasi
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Top Performer" :value="dist.top" tone="good" :icon="BarChart3" />
      <UiStatCard label="Core" :value="dist.core" tone="average" :icon="BarChart3" />
      <UiStatCard label="Below Expectation" :value="dist.low" tone="low" :icon="BarChart3" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">NIK</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Departemen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Skor Awal</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rating</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Skor Final</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagination.pagedItems.value" :key="row.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm font-mono">{{ row.employeeId }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ row.name }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ row.department }}</td>
              <td class="px-4 py-3 text-sm font-semibold">{{ row.rawScore }}</td>
              <td class="px-4 py-3">
                <UiSelect v-model="row.rating" :options="ratingOptions" />
              </td>
              <td class="px-4 py-3">
                <UiInput v-model.number="row.finalScore" type="number" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiPagination
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="karyawan"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>
  </div>
</template>
