<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, CalendarCheck, Clock, UserX, FileBarChart, UserCheck } from 'lucide-vue-next'
import { useAttendanceStore } from '~/stores/attendance'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('attendanceReports')
useHead({ title: () => title.value })

const attendanceStore = useAttendanceStore()
const employeesStore = useEmployeesStore()

const month = ref(new Date().toISOString().slice(0, 7))

const monthOptions = computed(() => {
  const out: { value: string; label: string }[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const v = d.toISOString().slice(0, 7)
    out.push({ value: v, label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) })
  }
  return out
})

const inMonth = computed(() => attendanceStore.records.filter((r) => r.date.startsWith(month.value)))

const summary = computed(() => ({
  records: inMonth.value.length,
  present: inMonth.value.filter((r) => r.status === 'present').length,
  late: inMonth.value.filter((r) => r.status === 'late').length,
  absent: inMonth.value.filter((r) => r.status === 'absent').length,
  wfh: inMonth.value.filter((r) => r.status === 'wfh').length,
}))

const perEmployee = computed(() =>
  employeesStore.employees.map((e) => {
    const rs = inMonth.value.filter((r) => r.employeeId === e.id)
    return {
      id: e.id,
      employeeId: e.employeeId,
      name: e.name,
      department: e.department,
      total: rs.length,
      present: rs.filter((r) => r.status === 'present').length,
      late: rs.filter((r) => r.status === 'late').length,
      absent: rs.filter((r) => r.status === 'absent').length,
      wfh: rs.filter((r) => r.status === 'wfh').length,
    }
  }),
)

const pagination = usePagination(perEmployee, { pageSize: 10 })

function exportCsv() {
  const rows = [
    ['NIK', 'Nama', 'Departemen', 'Total', 'Hadir', 'Terlambat', 'Tidak Hadir', 'WFH'],
    ...perEmployee.value.map((p) => [p.employeeId, p.name, p.department, p.total, p.present, p.late, p.absent, p.wfh]),
  ]
  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `attendance-report-${month.value}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Ringkasan absensi bulanan per karyawan.">
      <template #actions>
        <div class="w-48">
          <UiSelect v-model="month" :options="monthOptions" />
        </div>
        <UiButton variant="outline" @click="exportCsv">
          <Download class="w-4 h-4" />
          Export CSV
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
      <UiStatCard label="Total Catatan" :value="summary.records" :icon="FileBarChart" />
      <UiStatCard label="Hadir" :value="summary.present" tone="good" :icon="UserCheck" />
      <UiStatCard label="Terlambat" :value="summary.late" tone="average" :icon="Clock" />
      <UiStatCard label="Tidak Hadir" :value="summary.absent" tone="low" :icon="UserX" />
      <UiStatCard label="WFH" :value="summary.wfh" tone="primary" :icon="CalendarCheck" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border">
        <h3 class="font-semibold text-foreground">Per Karyawan</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">NIK</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nama</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Dept</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Hadir</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Terlambat</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tidak Hadir</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">WFH</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in pagination.pagedItems.value" :key="row.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm font-mono">{{ row.employeeId }}</td>
              <td class="px-4 py-3 text-sm text-foreground">{{ row.name }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ row.department }}</td>
              <td class="px-4 py-3 text-sm">{{ row.total }}</td>
              <td class="px-4 py-3 text-sm text-score-good font-semibold">{{ row.present }}</td>
              <td class="px-4 py-3 text-sm text-score-average font-semibold">{{ row.late }}</td>
              <td class="px-4 py-3 text-sm text-score-low font-semibold">{{ row.absent }}</td>
              <td class="px-4 py-3 text-sm text-primary font-semibold">{{ row.wfh }}</td>
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
