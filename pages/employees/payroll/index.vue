<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePayrollStore } from '~/stores/payroll'
import { useEmployeesStore } from '~/stores/employees'
import type { Payroll } from '~/stores/payroll'
import { Plus, Edit, Trash2, AlertTriangle, Banknote, ChevronRight } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('payroll')
const tCommon = useModuleT('common')
const tDash = useModuleT('dashboard')
const { title } = usePageTitle('generatePayroll')
useHead({ title: () => `${t('generatePayroll')} | ${title.value}` })

const router = useRouter()
const payrollStore = usePayrollStore()
const employeesStore = useEmployeesStore()
const showDeleteModal = ref(false)
const selected = ref<Payroll | null>(null)

// Generate payroll: pilih periode
const generateMonth = ref(String(new Date().getMonth() + 1))
const generateYear = ref(String(new Date().getFullYear()))
const cutOffDayInput = ref(payrollStore.cutOffDay)
const generateMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const generateMonthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
}))
const generateYearOptions = computed(() => {
  const y = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, i) => ({ value: String(y - i), label: String(y - i) }))
})

function saveCutOffDay() {
  payrollStore.setPayrollCutOffDay(cutOffDayInput.value)
  cutOffDayInput.value = payrollStore.cutOffDay
  generateMessage.value = { type: 'success', text: `Cut-off diset ke tanggal ${payrollStore.cutOffDay}. Payroll akan otomatis digenerate pada tanggal tersebut setiap bulan.` }
  setTimeout(() => { generateMessage.value = null }, 4000)
}

function runGenerate() {
  const activeIds = employeesStore.employees.filter((e) => e.isActive).map((e) => e.id)
  if (activeIds.length === 0) {
    generateMessage.value = { type: 'error', text: 'Tidak ada karyawan aktif.' }
    return
  }
  const month = Number(generateMonth.value) || new Date().getMonth() + 1
  const year = Number(generateYear.value) || new Date().getFullYear()
  const getBaseSalary = (employeeId: string) => employeesStore.getEmployeeById(employeeId)?.baseSalary ?? 0
  const created = payrollStore.runGeneratePayrollForPeriod(month, year, activeIds, getBaseSalary)
  generateMessage.value = { type: 'success', text: `Payroll untuk ${formatPeriod(month, year)} digenerate: ${created} slip gaji.` }
  setTimeout(() => { generateMessage.value = null }, 5000)
}

const isCutOffToday = computed(() => {
  const today = new Date().getDate()
  return today === payrollStore.cutOffDay
})
const currentMonthGenerated = computed(() =>
  payrollStore.hasPayrollForPeriod(new Date().getMonth() + 1, new Date().getFullYear())
)

/** Label periode: 21 [bulan lalu] – [cutOff] [bulan dipilih]. Contoh: 21 Feb – 20 Mar */
const periodRangeLabel = computed(() => {
  const month = Number(generateMonth.value) || new Date().getMonth() + 1
  const year = Number(generateYear.value) || new Date().getFullYear()
  const cutOff = payrollStore.cutOffDay
  const prevDate = new Date(year, month - 2, 21) // month-2 = previous month (0-indexed)
  const currDate = new Date(year, month - 1, Math.min(cutOff, 28))
  const prevMonthName = prevDate.toLocaleString('default', { month: 'short' })
  const currMonthName = currDate.toLocaleString('default', { month: 'short' })
  return t('periodRangeExample', {
    prevMonth: prevMonthName,
    cutOff: String(cutOff),
    currentMonth: currMonthName,
  })
})

const employeeOptions = computed(() =>
  employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` }))
)

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
}))

function getEmployeeName(employeeId: string) {
  return employeesStore.getEmployeeById(employeeId)?.name ?? employeeId
}

function formatPeriod(periodMonth: number, periodYear: number) {
  const monthName = new Date(periodYear, periodMonth - 1).toLocaleString('default', { month: 'short' })
  return `${monthName} ${periodYear}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function statusLabel(s: Payroll['status']) {
  const map: Record<Payroll['status'], string> = {
    draft: t('draft'),
    processed: t('processed'),
    paid: t('paid'),
  }
  return map[s] ?? s
}

const periodFilterOptions = computed(() => {
  const current = new Date()
  const options: { value: string; label: string }[] = [{ value: '', label: t('period') }]
  for (let i = 0; i < 24; i++) {
    const d = new Date(current.getFullYear(), current.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    options.push({ value: val, label: formatPeriod(d.getMonth() + 1, d.getFullYear()) })
  }
  return options
})

function goToAdd() {
  router.push('/employees/payroll/add')
}

function goToEdit(item: Payroll) {
  router.push(`/employees/payroll/${item.id}/edit`)
}

function openDelete(item: Payroll) {
  selected.value = item
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selected.value = null
}

function handleDelete() {
  if (!selected.value) return
  payrollStore.deletePayroll(selected.value.id)
  closeDeleteModal()
  router.replace('/employees/payroll')
}

function goToEmployee(id: string) {
  router.push(`/employees/${id}`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('generatePayroll') }}</h1>
        <p class="text-muted-foreground">{{ t('generatePayrollSubtitle') }}</p>
      </div>
      <div class="flex gap-2">
        <NuxtLink to="/employees/payroll/initial">
          <UiButton variant="outline">{{ t('initialPayroll') }}</UiButton>
        </NuxtLink>
        <UiButton variant="gradient" @click="goToAdd">
          <Plus class="w-4 h-4" />
          {{ t('addPayroll') }}
        </UiButton>
      </div>
    </div>

    <!-- Cut-off penggajian: tanggal (misal 20 = setiap tanggal 20). Periode = 21 bulan lalu s/d tanggal cut-off bulan berjalan. -->
    <div class="glass-card p-6">
      <h2 class="text-lg font-semibold text-foreground mb-2">{{ t('cutOffTitle') }}</h2>
      <p class="text-sm text-muted-foreground mb-4">{{ t('cutOffDescription') }}</p>
      <div class="flex flex-wrap items-end gap-3">
        <div class="w-28">
          <label class="block text-sm font-medium mb-1">{{ t('cutOffDay') }} (1–31)</label>
          <UiInput v-model.number="cutOffDayInput" type="number" min="1" max="31" />
        </div>
        <UiButton variant="gradient" @click="saveCutOffDay">{{ tCommon('save') }}</UiButton>
      </div>
      <p v-if="isCutOffToday && !currentMonthGenerated" class="mt-3 text-sm text-amber-600">
        Hari ini tanggal cut-off. Belum ada payroll untuk bulan ini. Gunakan tombol "Generate sekarang" di bawah.
      </p>
    </div>

    <!-- Generate untuk periode. Periode = 21 (bulan sebelumnya) s/d [cutOff] (bulan dipilih). -->
    <div class="glass-card p-6">
      <h2 class="text-lg font-semibold text-foreground mb-2">{{ t('generateForPeriod') }}</h2>
      <p v-if="payrollStore.cutOffDay" class="text-sm text-muted-foreground mb-3">
        {{ periodRangeLabel }}
      </p>
      <div class="flex flex-wrap items-end gap-3">
        <div class="w-40">
          <label class="block text-sm font-medium mb-1">{{ t('periodMonth') }}</label>
          <UiSelect v-model="generateMonth" :options="generateMonthOptions" />
        </div>
        <div class="w-28">
          <label class="block text-sm font-medium mb-1">{{ t('periodYear') }}</label>
          <UiSelect v-model="generateYear" :options="generateYearOptions" />
        </div>
        <UiButton variant="gradient" @click="runGenerate">
          {{ t('generateNow') }}
        </UiButton>
      </div>
      <p v-if="generateMessage" :class="['mt-3 text-sm', generateMessage.type === 'success' ? 'text-score-excellent' : 'text-score-low']">
        {{ generateMessage.text }}
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-score-excellent/10">
            <Banknote class="w-5 h-5 text-score-excellent" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ payrollStore.stats.total }}</p>
            <p class="text-xs text-muted-foreground">{{ tDash('total') }} {{ title }}</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-ai-orange/10">
            <Banknote class="w-5 h-5 text-ai-orange" />
          </div>
          <div>
            <p class="text-xl font-bold text-foreground">{{ formatCurrency(payrollStore.stats.totalNet) }}</p>
            <p class="text-xs text-muted-foreground">{{ t('netPay') }} {{ tDash('total') }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <UiSelect
        v-model="payrollStore.employeeFilter"
        :options="[{ value: '', label: t('allEmployees') }, ...employeeOptions]"
        class="w-52"
      />
      <UiSelect v-model="payrollStore.periodFilter" :options="periodFilterOptions" class="w-40" />
    </div>

    <div v-if="payrollStore.filteredRecords.length === 0" class="glass-card p-12 text-center">
      <Banknote class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">{{ t('noData') }}</h3>
      <p class="text-muted-foreground mb-4">{{ t('addFirst') }}</p>
      <UiButton variant="gradient" @click="goToAdd"><Plus class="w-4 h-4" /> {{ t('addPayroll') }}</UiButton>
    </div>

    <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50">
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{{ tCommon('actions') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('employee') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('period') }}</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{{ t('baseSalary') }}</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{{ t('grossIncome') }}</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{{ t('totalDeductions') }}</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{{ t('pph21') }}</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">{{ t('netPay') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in payrollStore.filteredRecords"
              :key="item.id"
              class="border-b border-border last:border-0 hover:bg-muted/30"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <UiButton variant="ghost" size="sm" class="h-8 w-8 p-0" :title="tCommon('edit')" @click="goToEdit(item)">
                  <Edit class="w-4 h-4" />
                </UiButton>
                <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low inline-flex" :title="tCommon('delete')" @click="openDelete(item)"><Trash2 class="w-4 h-4" /></button>
              </td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  class="font-medium text-foreground hover:text-primary flex items-center gap-1"
                  @click="goToEmployee(item.employeeId)"
                >
                  {{ getEmployeeName(item.employeeId) }}
                  <ChevronRight class="w-4 h-4" />
                </button>
              </td>
              <td class="px-4 py-3 text-sm">{{ formatPeriod(item.periodMonth, item.periodYear) }}</td>
              <td class="px-4 py-3 text-sm text-right tabular-nums">{{ formatCurrency(item.baseSalary) }}</td>
              <td class="px-4 py-3 text-sm text-right tabular-nums">{{ formatCurrency(item.grossIncome) }}</td>
              <td class="px-4 py-3 text-sm text-right tabular-nums text-score-low">{{ formatCurrency(item.totalDeductions) }}</td>
              <td class="px-4 py-3 text-sm text-right tabular-nums text-amber-600">{{ formatCurrency(item.pph21) }}</td>
              <td class="px-4 py-3 text-sm font-medium text-right tabular-nums">{{ formatCurrency(item.netPay) }}</td>
              <td class="px-4 py-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium border',
                    item.status === 'paid' && 'bg-score-excellent/10 text-score-excellent border-score-excellent/30',
                    item.status === 'processed' && 'bg-amber-500/10 text-amber-600 border-amber-500/30',
                    item.status === 'draft' && 'bg-muted text-muted-foreground border-border',
                  ]"
                >
                  {{ statusLabel(item.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete confirmation modal only -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDeleteModal" />
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 text-center">
            <AlertTriangle class="w-12 h-12 mx-auto text-score-low mb-4" />
            <h2 class="text-lg font-bold mb-2">{{ t('deletePayroll') }}</h2>
            <p class="text-muted-foreground mb-6">
              {{ t('deleteConfirm', { name: selected ? getEmployeeName(selected.employeeId) : '', period: selected ? formatPeriod(selected.periodMonth, selected.periodYear) : '' }) }}
            </p>
            <div class="flex justify-center gap-3">
              <UiButton variant="outline" @click="closeDeleteModal">{{ tCommon('cancel') }}</UiButton>
              <UiButton variant="outline" class="text-score-low border-score-low/30 hover:bg-score-low/10" @click="handleDelete"><Trash2 class="w-4 h-4" /> {{ tCommon('delete') }}</UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
