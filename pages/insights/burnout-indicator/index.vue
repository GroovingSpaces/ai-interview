<script setup lang="ts">
import { computed } from 'vue'
import { Flame, Clock, Heart, AlertTriangle } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'
import { useOvertimeStore } from '~/stores/overtime'
import { useLeaveStore } from '~/stores/leave'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('burnoutIndicator')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()
const overtimeStore = useOvertimeStore()
const leaveStore = useLeaveStore()

interface BurnoutRow {
  id: string
  name: string
  department: string
  overtimeHours: number
  leaveDays: number
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
}

const rows = computed<BurnoutRow[]>(() =>
  employeesStore.employees.map((e) => {
    const ot = overtimeStore.records
      .filter((r) => r.employeeId === e.id && r.status === 'approved')
      .reduce((s, r) => s + (r.hours ?? 0), 0)
    const leaveDays = leaveStore.requests
      .filter((r) => r.employeeId === e.id && r.status === 'approved' && r.type === 'annual')
      .reduce((s, r) => s + r.days, 0)
    const otScore = Math.min(100, ot * 5)
    const lowLeave = leaveDays < 5 ? 30 : 0
    const score = Math.min(100, otScore + lowLeave)
    const level = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low' as 'low' | 'medium' | 'high' | 'critical'
    return {
      id: e.id,
      name: e.name,
      department: e.department,
      overtimeHours: ot,
      leaveDays,
      score,
      level,
    }
  }).sort((a, b) => b.score - a.score),
)

const summary = computed(() => ({
  critical: rows.value.filter((r) => r.level === 'critical').length,
  high: rows.value.filter((r) => r.level === 'high').length,
  medium: rows.value.filter((r) => r.level === 'medium').length,
  low: rows.value.filter((r) => r.level === 'low').length,
}))

const pagination = usePagination(rows, { pageSize: 10 })

function tone(level: string): 'low' | 'warning' | 'average' | 'good' {
  if (level === 'critical') return 'low'
  if (level === 'high') return 'warning'
  if (level === 'medium') return 'average'
  return 'good'
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Identifikasi karyawan dengan risiko burnout berdasarkan jam lembur & pola cuti." />

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Critical" :value="summary.critical" tone="low" :icon="AlertTriangle" />
      <UiStatCard label="High" :value="summary.high" tone="average" :icon="Flame" />
      <UiStatCard label="Medium" :value="summary.medium" tone="average" :icon="Clock" />
      <UiStatCard label="Low" :value="summary.low" tone="good" :icon="Heart" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border">
        <h3 class="font-semibold text-foreground">Per Karyawan</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Departemen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Jam Lembur</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Cuti Tahunan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Skor Burnout</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Level</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagination.pagedItems.value" :key="r.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm text-foreground">{{ r.name }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ r.department }}</td>
              <td class="px-4 py-3 text-sm">{{ r.overtimeHours }} jam</td>
              <td class="px-4 py-3 text-sm">{{ r.leaveDays }} hari</td>
              <td class="px-4 py-3 text-sm font-semibold">{{ r.score }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="r.level.toUpperCase()" :tone="tone(r.level)" /></td>
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
