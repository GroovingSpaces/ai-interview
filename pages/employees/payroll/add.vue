<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePayrollStore } from '~/stores/payroll'
import { useEmployeesStore } from '~/stores/employees'
import type { Payroll, AllowanceItem } from '~/stores/payroll'
import { PTKP_OPTIONS, computePPh21FromGross } from '~/composables/usePPh21Calculation'
import { ArrowLeft, Plus, Check, Banknote, Trash2 as TrashIcon } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('payroll')
const tCommon = useModuleT('common')
const { title } = usePageTitle('payroll')
useHead({ title: () => `${t('addPayrollModal')} | ${title.value}` })

const router = useRouter()
const payrollStore = usePayrollStore()
const employeesStore = useEmployeesStore()

interface AllowanceFormItem {
  id: string
  name: string
  amount: number
}

const form = ref({
  employeeId: '',
  periodMonth: new Date().getMonth() + 1,
  periodYear: new Date().getFullYear(),
  baseSalary: 0,
  allowanceItems: [] as AllowanceFormItem[],
  bpjsTk: 0,
  bpjsKesehatan: 0,
  otherDeductions: 0,
  ptkpStatus: 'TK/0' as string,
  taxableIncome: 0,
  pph21: 0,
  status: 'draft' as Payroll['status'],
  notes: '',
})

const employeeOptionsForm = computed(() => [
  { value: '', label: t('selectEmployee') as string },
  ...employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
}))

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

const totalAllowancesComputed = computed(() =>
  form.value.allowanceItems.reduce((sum, a) => sum + (Number(a.amount) || 0), 0)
)
const grossIncomeComputed = computed(
  () => (Number(form.value.baseSalary) || 0) + totalAllowancesComputed.value
)
const totalDeductionsComputed = computed(
  () =>
    (Number(form.value.bpjsTk) || 0) +
    (Number(form.value.bpjsKesehatan) || 0) +
    (Number(form.value.otherDeductions) || 0)
)

const ptkpOptions = PTKP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const taxFromPtkp = computed(() => {
  const gross = grossIncomeComputed.value
  const bpjsTk = Number(form.value.bpjsTk) || 0
  const bpjsKes = Number(form.value.bpjsKesehatan) || 0
  return computePPh21FromGross(gross, bpjsTk, bpjsKes, form.value.ptkpStatus)
})
const taxableIncomeComputed = computed(() => taxFromPtkp.value.pkp)
const pph21Computed = computed(() => taxFromPtkp.value.pph21)

const netPayComputed = computed(
  () =>
    grossIncomeComputed.value -
    totalDeductionsComputed.value -
    pph21Computed.value
)

function addAllowanceRow() {
  form.value.allowanceItems.push({
    id: `a${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: '',
    amount: 0,
  })
}
function removeAllowanceRow(id: string) {
  form.value.allowanceItems = form.value.allowanceItems.filter((a) => a.id !== id)
}

function mapAllowanceItems(): AllowanceItem[] {
  return form.value.allowanceItems
    .filter((a) => a.name.trim() !== '' || (a.amount && Number(a.amount) > 0))
    .map((a) => ({ id: a.id, name: a.name.trim() || t('allowances'), amount: Number(a.amount) || 0 }))
}

function goBack() {
  router.push('/employees/payroll')
}

function handleSubmit() {
  const allowances = mapAllowanceItems()
  const grossIncome = grossIncomeComputed.value
  const totalDeductions = totalDeductionsComputed.value
  const pph21 = pph21Computed.value
  const netPay = grossIncome - totalDeductions - pph21
  const taxableIncome = taxableIncomeComputed.value

  payrollStore.addPayroll({
    employeeId: form.value.employeeId,
    periodMonth: form.value.periodMonth,
    periodYear: Number(form.value.periodYear) || new Date().getFullYear(),
    baseSalary: Number(form.value.baseSalary) || 0,
    allowances,
    grossIncome,
    bpjsTk: Number(form.value.bpjsTk) || 0,
    bpjsKesehatan: Number(form.value.bpjsKesehatan) || 0,
    otherDeductions: Number(form.value.otherDeductions) || 0,
    totalDeductions,
    taxableIncome,
    pph21,
    netPay,
    status: form.value.status,
    notes: form.value.notes.trim() || undefined,
    ptkpStatus: form.value.ptkpStatus || undefined,
  })
  router.push('/employees/payroll')
}

const isFormValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.periodMonth >= 1 &&
    form.value.periodYear >= 2000 &&
    (Number(form.value.baseSalary) || 0) >= 0
)

onMounted(() => {
  addAllowanceRow()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('addPayrollModal') }}</h1>
        <p class="text-sm text-muted-foreground">{{ title }}</p>
      </div>
    </div>

    <form class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('employee') }} *</label>
          <UiSelect v-model="form.employeeId" :options="employeeOptionsForm" :placeholder="t('selectEmployee')" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('periodMonth') }} *</label>
            <UiSelect
              :model-value="String(form.periodMonth)"
              :options="monthOptions"
              @update:model-value="(v) => (form.periodMonth = Number(v) || 1)"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('periodYear') }} *</label>
            <UiInput v-model="form.periodYear" type="number" min="2000" max="2100" :placeholder="t('periodYear')" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ t('baseSalary') }} *</label>
          <UiInput v-model="form.baseSalary" type="number" min="0" step="1000" :placeholder="t('baseSalary')" />
        </div>

        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium">{{ t('allowances') }}</label>
            <UiButton type="button" variant="outline" size="sm" @click="addAllowanceRow">
              <Plus class="w-4 h-4" />
              {{ t('addAllowance') }}
            </UiButton>
          </div>
          <div class="space-y-2 rounded-lg border border-border p-3 bg-muted/10">
            <div
              v-for="row in form.allowanceItems"
              :key="row.id"
              class="flex gap-2 items-center"
            >
              <UiInput v-model="row.name" :placeholder="t('allowanceName')" class="flex-1 min-w-0" />
              <UiInput v-model="row.amount" type="number" min="0" step="1000" class="w-28 tabular-nums" placeholder="0" />
              <button type="button" class="p-2 rounded-lg hover:bg-score-low/10 text-score-low flex-shrink-0" :title="tCommon('delete')" @click="removeAllowanceRow(row.id)">
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-muted/30 px-3 py-2">
          <p class="text-xs text-muted-foreground">{{ t('grossIncome') }}</p>
          <p class="text-lg font-semibold tabular-nums">{{ formatCurrency(grossIncomeComputed) }}</p>
        </div>

        <div class="rounded-lg border border-border p-4 space-y-4">
          <p class="text-sm font-medium text-foreground">{{ t('deductionsSection') }}</p>
          <div>
            <label class="block text-xs text-muted-foreground mb-1">{{ t('bpjsTk') }}</label>
            <UiInput v-model="form.bpjsTk" type="number" min="0" step="1000" placeholder="0" />
          </div>
          <div>
            <label class="block text-xs text-muted-foreground mb-1">{{ t('bpjsKesehatan') }}</label>
            <UiInput v-model="form.bpjsKesehatan" type="number" min="0" step="1000" placeholder="0" />
          </div>
          <div>
            <label class="block text-xs text-muted-foreground mb-1">{{ t('otherDeductions') }}</label>
            <UiInput v-model="form.otherDeductions" type="number" min="0" step="1000" placeholder="0" />
          </div>
          <p class="text-xs font-medium text-muted-foreground pt-2 border-t border-border">
            {{ t('totalDeductions') }}: {{ formatCurrency(totalDeductionsComputed) }}
          </p>
        </div>

        <div class="rounded-lg border border-border p-4 space-y-4">
          <p class="text-sm font-medium text-foreground">{{ t('taxSection') }}</p>
          <div>
            <label class="block text-xs text-muted-foreground mb-1">{{ t('ptkp') }}</label>
            <UiSelect v-model="form.ptkpStatus" :options="ptkpOptions" :placeholder="t('ptkpPlaceholder')" />
          </div>
          <div>
            <label class="block text-xs text-muted-foreground mb-1">{{ t('taxableIncome') }}</label>
            <UiInput :model-value="formatCurrency(taxableIncomeComputed)" type="text" disabled class="bg-muted/30" />
          </div>
          <div>
            <label class="block text-xs text-muted-foreground mb-1">{{ t('pph21') }}</label>
            <UiInput :model-value="formatCurrency(pph21Computed)" type="text" disabled class="bg-muted/30" />
          </div>
        </div>

        <div class="rounded-lg bg-score-excellent/10 border border-score-excellent/30 px-3 py-2">
          <p class="text-xs text-muted-foreground">{{ t('netPay') }}</p>
          <p class="text-xl font-bold tabular-nums text-foreground">{{ formatCurrency(netPayComputed) }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">{{ t('status') }}</label>
          <UiSelect
            v-model="form.status"
            :options="[
              { value: 'draft', label: t('draft') },
              { value: 'processed', label: t('processed') },
              { value: 'paid', label: t('paid') },
            ] as { value: string; label: string }[]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('notes') }}</label>
          <UiInput v-model="form.notes" type="text" :placeholder="t('optional')" />
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UiButton type="button" variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          {{ tCommon('cancel') }}
        </UiButton>
        <UiButton type="submit" variant="gradient" :disabled="!isFormValid">
          <Check class="w-4 h-4" />
          {{ tCommon('save') }}
        </UiButton>
      </div>
    </form>
  </div>
</template>
