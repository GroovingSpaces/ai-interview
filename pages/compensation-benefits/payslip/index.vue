<script setup lang="ts">
import { ref, computed } from 'vue'
import { Download, Wallet, Receipt } from 'lucide-vue-next'
import { useCompensationStore } from '~/stores/compensation'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('payslip')
useHead({ title: () => title.value })

const compStore = useCompensationStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const meId = computed(() => authStore.user?.id ?? '1')

const period = ref(compStore.payslips[0]?.period ?? '2026-03')

const payslip = computed(() =>
  compStore.payslips.find((p) => p.employeeId === meId.value && p.period === period.value),
)

const periodOptions = computed(() => {
  const set = new Set(compStore.payslips.filter((p) => p.employeeId === meId.value).map((p) => p.period))
  return Array.from(set).sort().reverse().map((p) => ({ value: p, label: p }))
})

const employee = computed(() => employeesStore.getEmployeeById(meId.value))

function fmt(n: number) {
  return `Rp ${Number(n).toLocaleString('id-ID')}`
}

function downloadSlip() {
  if (!payslip.value) return
  const lines = [
    `SLIP GAJI - ${payslip.value.period}`,
    `Karyawan: ${employee.value?.name} (${employee.value?.employeeId})`,
    `Posisi: ${employee.value?.position}`,
    '',
    'PENDAPATAN:',
    `  Gaji Pokok                : ${fmt(payslip.value.baseSalary)}`,
    `  Tunjangan Jabatan         : ${fmt(payslip.value.positionalAllowance)}`,
    `  Tunjangan Transport       : ${fmt(payslip.value.transportAllowance)}`,
    `  Tunjangan Makan           : ${fmt(payslip.value.mealAllowance)}`,
    `  Lembur                    : ${fmt(payslip.value.overtimePay)}`,
    `  Bonus                     : ${fmt(payslip.value.bonus)}`,
    `  Total Pendapatan          : ${fmt(payslip.value.grossIncome)}`,
    '',
    'POTONGAN:',
    `  BPJS Kesehatan            : ${fmt(payslip.value.bpjsKesehatan)}`,
    `  BPJS Ketenagakerjaan      : ${fmt(payslip.value.bpjsKetenagakerjaan)}`,
    `  PPh 21                    : ${fmt(payslip.value.pph21)}`,
    `  Lainnya                   : ${fmt(payslip.value.otherDeductions)}`,
    `  Total Potongan            : ${fmt(payslip.value.totalDeductions)}`,
    '',
    `GAJI BERSIH                  : ${fmt(payslip.value.netSalary)}`,
  ].join('\n')
  const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payslip-${payslip.value.period}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Lihat slip gaji per periode dan unduh bukti pembayaran.">
      <template #actions>
        <div class="w-40">
          <UiSelect v-model="period" :options="periodOptions" placeholder="Pilih periode" />
        </div>
        <UiButton variant="outline" :disabled="!payslip" @click="downloadSlip">
          <Download class="w-4 h-4" />
          Unduh
        </UiButton>
      </template>
    </UiPageHeader>

    <div v-if="!payslip">
      <UiEmptyState
        :icon="Receipt"
        title="Slip gaji belum tersedia"
        description="Slip akan muncul setelah payroll run periode berjalan diselesaikan."
      />
    </div>

    <div v-else class="glass-card p-6 space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p class="text-sm text-muted-foreground">Periode</p>
          <p class="text-xl font-bold text-foreground">{{ payslip.period }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-muted-foreground">Take Home Pay</p>
          <p class="text-3xl font-bold text-primary">{{ fmt(payslip.netSalary) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="rounded-xl border border-border p-4 space-y-2">
          <h4 class="text-sm font-semibold text-muted-foreground uppercase">Pendapatan</h4>
          <dl class="space-y-1 text-sm">
            <div class="flex justify-between"><dt class="text-muted-foreground">Gaji Pokok</dt><dd class="font-mono">{{ fmt(payslip.baseSalary) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">Tunjangan Jabatan</dt><dd class="font-mono">{{ fmt(payslip.positionalAllowance) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">Tunjangan Transport</dt><dd class="font-mono">{{ fmt(payslip.transportAllowance) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">Tunjangan Makan</dt><dd class="font-mono">{{ fmt(payslip.mealAllowance) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">Lembur</dt><dd class="font-mono">{{ fmt(payslip.overtimePay) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">Bonus</dt><dd class="font-mono">{{ fmt(payslip.bonus) }}</dd></div>
            <div class="flex justify-between border-t border-border pt-2 mt-2 font-semibold"><dt>Total Bruto</dt><dd class="text-score-good font-mono">{{ fmt(payslip.grossIncome) }}</dd></div>
          </dl>
        </div>
        <div class="rounded-xl border border-border p-4 space-y-2">
          <h4 class="text-sm font-semibold text-muted-foreground uppercase">Potongan</h4>
          <dl class="space-y-1 text-sm">
            <div class="flex justify-between"><dt class="text-muted-foreground">BPJS Kesehatan</dt><dd class="font-mono">{{ fmt(payslip.bpjsKesehatan) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">BPJS Ketenagakerjaan</dt><dd class="font-mono">{{ fmt(payslip.bpjsKetenagakerjaan) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">PPh 21</dt><dd class="font-mono">{{ fmt(payslip.pph21) }}</dd></div>
            <div class="flex justify-between"><dt class="text-muted-foreground">Lainnya</dt><dd class="font-mono">{{ fmt(payslip.otherDeductions) }}</dd></div>
            <div class="flex justify-between border-t border-border pt-2 mt-2 font-semibold"><dt>Total Potongan</dt><dd class="text-destructive font-mono">{{ fmt(payslip.totalDeductions) }}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </div>
</template>
