<script setup lang="ts">
import { ref, computed } from 'vue'
import { Play, Calculator, Wallet, Users, Receipt } from 'lucide-vue-next'
import { useCompensationStore } from '~/stores/compensation'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('payrollRun')
useHead({ title: () => title.value })

const compStore = useCompensationStore()
const payrollRuns = computed(() => compStore.payrollRuns)
const pagination = usePagination(payrollRuns, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showRun = ref(false)
const runPeriod = ref(new Date().toISOString().slice(0, 7))

const totals = computed(() => ({
  runs: compStore.payrollRuns.length,
  paid: compStore.payrollRuns.filter((r) => r.status === 'paid').length,
  totalGross: compStore.payrollRuns.reduce((s, r) => s + r.totalGross, 0),
  totalNet: compStore.payrollRuns.reduce((s, r) => s + r.totalNet, 0),
}))

function statusTone(s: string): 'good' | 'primary' | 'muted' {
  if (s === 'paid') return 'good'
  if (s === 'finalized') return 'primary'
  return 'muted'
}

function startRun() {
  compStore.runPayroll(runPeriod.value)
  showRun.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Eksekusi payroll run per periode dan lihat history.">
      <template #actions>
        <UiButton variant="gradient" @click="showRun = true">
          <Play class="w-4 h-4" />
          Jalankan Payroll
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total Run" :value="totals.runs" :icon="Calculator" />
      <UiStatCard label="Sudah Dibayar" :value="totals.paid" tone="good" :icon="Wallet" />
      <UiStatCard label="Karyawan Aktif" :value="employeesStore.employees.filter((e) => e.isActive).length" tone="primary" :icon="Users" />
      <UiStatCard label="Total Net Distribusi" :value="`Rp ${totals.totalNet.toLocaleString('id-ID')}`" :icon="Receipt" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="p-4 border-b border-border">
        <h3 class="font-semibold text-foreground">History Payroll Run</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Periode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Dijalankan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Bruto</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Net</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in pagination.pagedItems.value" :key="r.id" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm font-semibold text-foreground">{{ r.period }}</td>
              <td class="px-4 py-3 text-sm">{{ formatDate(r.runAt) }}</td>
              <td class="px-4 py-3 text-sm">{{ r.totalEmployees }}</td>
              <td class="px-4 py-3 text-sm font-mono">Rp {{ r.totalGross.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3 text-sm font-mono text-score-good font-semibold">Rp {{ r.totalNet.toLocaleString('id-ID') }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="r.status === 'paid' ? 'Paid' : r.status === 'finalized' ? 'Final' : 'Draft'" :tone="statusTone(r.status)" /></td>
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
        item-label="payroll run"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showRun"
      title="Jalankan Payroll Run"
      description="Periode payroll yang akan diproses. Pastikan data attendance, leave, dan overtime sudah final."
      @update:open="showRun = $event"
    >
      <UiFormField label="Periode (YYYY-MM)" required>
        <UiInput v-model="runPeriod" placeholder="2026-04" />
      </UiFormField>
      <p class="text-xs text-muted-foreground mt-3">Setelah dijalankan, semua slip gaji periode ini akan dibuat dan tidak dapat diubah tanpa rollback.</p>
      <template #footer>
        <UiButton variant="outline" @click="showRun = false">Batal</UiButton>
        <UiButton variant="gradient" @click="startRun">
          <Play class="w-4 h-4" />
          Jalankan
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>
