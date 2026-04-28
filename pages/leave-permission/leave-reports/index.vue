<script setup lang="ts">
import { ref, computed } from 'vue'
import { CalendarDays, Users, Check, Clock, FileBarChart, Download } from 'lucide-vue-next'
import { useLeaveStore } from '~/stores/leave'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('leaveReports')
useHead({ title: () => title.value })

const leaveStore = useLeaveStore()
const employeesStore = useEmployeesStore()

const year = ref(String(new Date().getFullYear()))
const yearOptions = computed(() => {
  const now = new Date().getFullYear()
  return [now - 2, now - 1, now, now + 1].map((y) => ({ value: String(y), label: String(y) }))
})

const yearRequests = computed(() =>
  leaveStore.requests.filter((r) => r.startDate.startsWith(year.value)),
)

const summary = computed(() => ({
  total: yearRequests.value.length,
  approved: yearRequests.value.filter((r) => r.status === 'approved').length,
  pending: yearRequests.value.filter((r) => r.status === 'pending').length,
  rejected: yearRequests.value.filter((r) => r.status === 'rejected').length,
  totalDays: yearRequests.value.filter((r) => r.status === 'approved').reduce((s, r) => s + r.days, 0),
}))

const byType = computed(() => {
  const map = new Map<string, number>()
  for (const r of yearRequests.value) {
    if (r.status !== 'approved') continue
    map.set(r.type, (map.get(r.type) ?? 0) + r.days)
  }
  const labels: Record<string, string> = {
    annual: 'Cuti Tahunan',
    sick: 'Sakit',
    personal: 'Izin',
    unpaid: 'Tanpa Bayar',
    other: 'Lainnya',
  }
  const total = Array.from(map.values()).reduce((a, b) => a + b, 0)
  return Array.from(map.entries()).map(([type, days]) => ({
    type,
    label: labels[type] ?? type,
    days,
    pct: total === 0 ? 0 : Math.round((days / total) * 100),
  }))
})

const perEmployee = computed(() =>
  employeesStore.employees.map((e) => {
    const balance = leaveStore.getAnnualBalance(e.id, year.value)
    const inYear = yearRequests.value.filter((r) => r.employeeId === e.id)
    return {
      id: e.id,
      name: e.name,
      employeeId: e.employeeId,
      department: e.department,
      ...balance,
      requestCount: inYear.length,
    }
  }).sort((a, b) => b.used - a.used),
)

const pagination = usePagination(perEmployee, { pageSize: 10 })

function exportCsv() {
  const rows = [
    ['NIK', 'Nama', 'Departemen', 'Kuota', 'Terpakai', 'Sisa', 'Pengajuan'],
    ...perEmployee.value.map((p) => [p.employeeId, p.name, p.department, p.quota, p.used, p.remaining, p.requestCount]),
  ]
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leave-report-${year.value}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Ringkasan pemakaian cuti per tahun, per tipe, dan per karyawan."
    >
      <template #actions>
        <div class="w-40">
          <UiSelect v-model="year" :options="yearOptions" />
        </div>
        <UiButton variant="outline" @click="exportCsv">
          <Download class="w-4 h-4" />
          Export CSV
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Pengajuan" :value="summary.total" :icon="FileBarChart" />
      <UiStatCard label="Disetujui" :value="summary.approved" tone="good" :icon="Check" />
      <UiStatCard label="Menunggu" :value="summary.pending" tone="average" :icon="Clock" />
      <UiStatCard label="Total Hari Cuti" :value="summary.totalDays" tone="primary" :icon="CalendarDays" />
    </div>

    <div class="glass-card p-6 space-y-4">
      <h3 class="text-base font-semibold text-foreground">Distribusi per Tipe Cuti</h3>
      <div v-if="byType.length === 0" class="text-sm text-muted-foreground">Belum ada cuti yang disetujui pada tahun {{ year }}.</div>
      <div v-else class="space-y-3">
        <div v-for="item in byType" :key="item.type">
          <div class="flex items-center justify-between text-sm">
            <span class="text-foreground">{{ item.label }}</span>
            <span class="text-muted-foreground">{{ item.days }} hari ({{ item.pct }}%)</span>
          </div>
          <div class="mt-1 h-2 rounded-full bg-muted overflow-hidden">
            <div class="h-full bg-primary" :style="{ width: `${item.pct}%` }" />
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border flex items-center gap-2">
        <Users class="w-4 h-4 text-muted-foreground" />
        <h3 class="font-semibold text-foreground">Saldo Cuti per Karyawan ({{ year }})</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">NIK</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Departemen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kuota</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Terpakai</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Sisa</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Pengajuan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagination.pagedItems.value" :key="row.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm font-mono">{{ row.employeeId }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ row.name }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ row.department }}</td>
              <td class="px-4 py-3 text-sm">{{ row.quota }}</td>
              <td class="px-4 py-3 text-sm">
                <span :class="['font-semibold', row.used >= row.quota ? 'text-destructive' : 'text-foreground']">{{ row.used }}</span>
              </td>
              <td class="px-4 py-3 text-sm">
                <span :class="row.remaining === 0 ? 'text-destructive' : row.remaining < 3 ? 'text-ai-orange' : 'text-score-good'">{{ row.remaining }}</span>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ row.requestCount }}</td>
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
