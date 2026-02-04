<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePayrollStore } from '~/stores/payroll'
import { useEmployeesStore } from '~/stores/employees'
import type { SalaryComponent, AllowanceItem } from '~/stores/payroll'
import { Plus, Edit, Trash2, X, Check, AlertTriangle, UserCog } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('payroll')
const tCommon = useModuleT('common')
const { title } = usePageTitle('initialPayroll')
useHead({ title: () => `${t('initialPayroll')} | ${title.value}` })

const store = usePayrollStore()
const employeesStore = useEmployeesStore()

// —— Modal: komponen umum (BPJS & Pajak) ——
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref<SalaryComponent | null>(null)
const form = ref({
  type: 'deduction' as 'allowance' | 'deduction',
  name: '',
  code: '',
  defaultAmount: undefined as number | undefined,
  percentageOfBase: undefined as number | undefined,
  description: '',
})

// —— Modal: gaji & tunjangan per karyawan ——
const showEmployeeModal = ref(false)
const selectedEmployee = ref<{ id: string; name: string; employeeId: string } | null>(null)
const employeeForm = ref({
  baseSalary: undefined as number | undefined,
  allowanceItems: [] as { id: string; name: string; amount: number }[],
})

const deductionList = computed(() => store.deductionComponents)
const activeEmployees = computed(() =>
  employeesStore.employees.filter((e) => e.isActive).map((e) => ({ id: e.id, name: e.name, employeeId: e.employeeId }))
)

function resetForm() {
  form.value = {
    type: 'deduction',
    name: '',
    code: '',
    defaultAmount: undefined,
    percentageOfBase: undefined,
    description: '',
  }
}
function openCreate() {
  resetForm()
  showCreateModal.value = true
}
function openEdit(item: SalaryComponent) {
  selected.value = item
  form.value = {
    type: item.type,
    name: item.name,
    code: item.code,
    defaultAmount: item.defaultAmount,
    percentageOfBase: item.percentageOfBase,
    description: item.description || '',
  }
  showEditModal.value = true
}
function openDelete(item: SalaryComponent) {
  selected.value = item
  showDeleteModal.value = true
}
function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selected.value = null
  resetForm()
}
function handleCreate() {
  store.addSalaryComponent({
    type: 'deduction',
    name: form.value.name.trim(),
    code: form.value.code.trim(),
    defaultAmount: form.value.defaultAmount,
    percentageOfBase: form.value.percentageOfBase,
    description: form.value.description.trim() || undefined,
  })
  closeModals()
}
function handleUpdate() {
  if (!selected.value) return
  store.updateSalaryComponent(selected.value.id, {
    type: form.value.type,
    name: form.value.name.trim(),
    code: form.value.code.trim(),
    defaultAmount: form.value.defaultAmount,
    percentageOfBase: form.value.percentageOfBase,
    description: form.value.description.trim() || undefined,
  })
  closeModals()
}
function handleDelete() {
  if (!selected.value) return
  store.deleteSalaryComponent(selected.value.id)
  closeModals()
}

const isFormValid = computed(
  () => form.value.name.trim() !== '' && form.value.code.trim() !== ''
)

// —— Per karyawan: buka modal atur gaji & tunjangan ——
function openEmployeeConfig(emp: { id: string; name: string; employeeId: string }) {
  selectedEmployee.value = emp
  const config = store.getEmployeeSalaryConfig(emp.id)
  const baseFromEmployee = employeesStore.getEmployeeById(emp.id)?.baseSalary
  employeeForm.value = {
    baseSalary: config.baseSalary ?? baseFromEmployee ?? undefined,
    allowanceItems: config.allowances.length
      ? config.allowances.map((a) => ({ id: a.id, name: a.name, amount: a.amount }))
      : [],
  }
  showEmployeeModal.value = true
}
function addAllowanceRow() {
  employeeForm.value.allowanceItems.push({
    id: `a${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    amount: 0,
  })
}
function removeAllowanceRow(index: number) {
  employeeForm.value.allowanceItems.splice(index, 1)
}
function closeEmployeeModal() {
  showEmployeeModal.value = false
  selectedEmployee.value = null
}
function saveEmployeeConfig() {
  if (!selectedEmployee.value) return
  const items: AllowanceItem[] = employeeForm.value.allowanceItems
    .filter((a) => a.name.trim() !== '')
    .map((a) => ({ id: a.id, name: a.name.trim(), amount: Number(a.amount) || 0 }))
  store.setEmployeeSalaryConfig(selectedEmployee.value.id, {
    baseSalary: employeeForm.value.baseSalary,
    allowances: items,
  })
  closeEmployeeModal()
}

function formatCurrency(value: number | undefined) {
  if (value == null) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

function getEmployeeConfigSummary(employeeId: string) {
  const config = store.getEmployeeSalaryConfig(employeeId)
  const base = config.baseSalary ?? employeesStore.getEmployeeById(employeeId)?.baseSalary
  const totalAllowance = config.allowances.reduce((s, a) => s + a.amount, 0)
  return { base, totalAllowance, count: config.allowances.length }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('initialPayroll') }}</h1>
        <p class="text-muted-foreground">{{ t('initialPayrollSubtitle') }}</p>
      </div>
      <NuxtLink to="/employees/payroll">
        <UiButton variant="outline">{{ t('generatePayroll') }}</UiButton>
      </NuxtLink>
    </div>

    <!-- Referensi regulasi: PTKP, angka BPJS & PPh 21 -->
    <details class="glass-card overflow-hidden" open>
      <summary class="px-6 py-4 cursor-pointer list-none flex items-center justify-between gap-2 font-semibold text-foreground hover:bg-muted/30">
        <span>{{ t('regulationTitle') }}</span>
        <span class="text-muted-foreground text-sm font-normal">{{ t('regulationIntro') }}</span>
      </summary>
      <div class="px-6 pb-6 pt-2 border-t border-border space-y-6">
        <div>
          <h3 class="text-sm font-semibold text-foreground mb-1">{{ t('ptkpTitle') }}</h3>
          <p class="text-sm text-muted-foreground mb-2">{{ t('ptkpDesc') }}</p>
          <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{{ t('ptkpTk0') }}</li>
            <li>{{ t('ptkpTk1') }}</li>
            <li>{{ t('ptkpTk2') }}</li>
            <li>{{ t('ptkpTk3') }}</li>
            <li>{{ t('ptkpK0') }}</li>
            <li>{{ t('ptkpK1') }}</li>
            <li>{{ t('ptkpK2') }}</li>
            <li>{{ t('ptkpK3') }}</li>
          </ul>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-foreground mb-1">{{ t('bpjsTkTitle') }}</h3>
          <p class="text-sm text-muted-foreground">{{ t('bpjsTkRates') }}</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-foreground mb-1">{{ t('bpjsKesTitle') }}</h3>
          <p class="text-sm text-muted-foreground">{{ t('bpjsKesRates') }}</p>
        </div>
        <div>
          <h3 class="text-sm font-semibold text-foreground mb-1">{{ t('pph21Title') }}</h3>
          <p class="text-sm text-muted-foreground mb-2">{{ t('pph21Rates') }}</p>
          <p class="text-sm text-muted-foreground">{{ t('pph21Layers') }}</p>
        </div>
      </div>
    </details>

    <!-- Komponen umum: hanya BPJS & Pajak (untuk semua karyawan) -->
    <div class="glass-card p-6">
      <h2 class="text-lg font-semibold text-foreground mb-2">{{ t('generalDeductions') }}</h2>
      <p class="text-sm text-muted-foreground mb-4">{{ t('generalDeductionsDesc') }}</p>
      <div class="flex justify-end mb-4">
        <UiButton variant="gradient" size="sm" @click="openCreate">
          <Plus class="w-4 h-4" />
          {{ t('addComponent') }}
        </UiButton>
      </div>
      <div v-if="deductionList.length === 0" class="text-sm text-muted-foreground py-4">
        Belum ada komponen. Tambah BPJS Ketenagakerjaan, BPJS Kesehatan, PPh 21.
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="item in deductionList"
          :key="item.id"
          class="flex items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-3"
        >
          <div>
            <span class="font-medium">{{ item.name }}</span>
            <span class="text-muted-foreground text-sm ml-2">({{ item.code }})</span>
            <p v-if="item.defaultAmount != null" class="text-sm text-muted-foreground mt-0.5">
              {{ formatCurrency(item.defaultAmount) }}
            </p>
            <p v-else-if="item.percentageOfBase != null" class="text-sm text-muted-foreground mt-0.5">
              {{ item.percentageOfBase }}% dari gaji pokok
            </p>
          </div>
          <div class="flex gap-1">
            <button class="p-2 rounded-lg hover:bg-muted/50" title="Edit" @click="openEdit(item)"><Edit class="w-4 h-4" /></button>
            <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" title="Delete" @click="openDelete(item)"><Trash2 class="w-4 h-4" /></button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Gaji & Tunjangan per karyawan -->
    <div class="glass-card p-6">
      <h2 class="text-lg font-semibold text-foreground mb-2">{{ t('perEmployeeSalary') }}</h2>
      <p class="text-sm text-muted-foreground mb-4">{{ t('perEmployeeSalaryDesc') }}</p>
      <div v-if="activeEmployees.length === 0" class="text-sm text-muted-foreground py-4">
        Tidak ada karyawan aktif.
      </div>
      <div v-else class="overflow-x-auto rounded-xl border border-border">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('employee') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('baseSalary') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('allowances') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ tCommon('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in activeEmployees"
              :key="emp.id"
              class="border-b border-border last:border-0 hover:bg-muted/30"
            >
              <td class="px-4 py-3 font-medium">{{ emp.name }}</td>
              <td class="px-4 py-3 text-sm">{{ formatCurrency(getEmployeeConfigSummary(emp.id).base) }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ getEmployeeConfigSummary(emp.id).count }} tunjangan
                <span v-if="getEmployeeConfigSummary(emp.id).totalAllowance > 0">({{ formatCurrency(getEmployeeConfigSummary(emp.id).totalAllowance) }})</span>
              </td>
              <td class="px-4 py-3">
                <UiButton variant="outline" size="sm" @click="openEmployeeConfig(emp)">
                  <UserCog class="w-4 h-4" />
                  {{ t('setSalary') }}
                </UiButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: tambah/edit komponen umum (deduction) -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold">{{ showCreateModal ? t('addComponent') : tCommon('edit') }} (BPJS / Pajak)</h2>
              <button class="p-2 rounded-lg hover:bg-muted/50" @click="closeModals"><X class="w-5 h-5" /></button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('componentName') }} *</label>
                <UiInput v-model="form.name" placeholder="e.g. BPJS Ketenagakerjaan" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('componentCode') }} *</label>
                <UiInput v-model="form.code" placeholder="e.g. BPJS-TK" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('defaultAmount') }}</label>
                <UiInput v-model.number="form.defaultAmount" type="number" placeholder="Nominal tetap (kosongkan jika pakai persen)" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('percentageOfBase') }}</label>
                <UiInput v-model.number="form.percentageOfBase" type="number" placeholder="Persen dari gaji pokok" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Keterangan</label>
                <UiInput v-model="form.description" placeholder="Opsional" />
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <UiButton variant="outline" @click="closeModals">{{ tCommon('cancel') }}</UiButton>
              <UiButton variant="gradient" :disabled="!isFormValid" @click="showCreateModal ? handleCreate() : handleUpdate()">
                <Check class="w-4 h-4" /> {{ showCreateModal ? tCommon('add') : tCommon('save') }}
              </UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal: atur gaji & tunjangan per karyawan -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showEmployeeModal && selectedEmployee" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeEmployeeModal" />
          <div class="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold">{{ t('setSalary') }}: {{ selectedEmployee.name }}</h2>
              <button class="p-2 rounded-lg hover:bg-muted/50" @click="closeEmployeeModal"><X class="w-5 h-5" /></button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">{{ t('baseSalary') }}</label>
                <UiInput v-model.number="employeeForm.baseSalary" type="number" placeholder="Gaji pokok (kosong = dari data karyawan)" />
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium">{{ t('allowances') }} (per orang)</label>
                  <UiButton variant="outline" size="sm" @click="addAllowanceRow">
                    <Plus class="w-4 h-4" /> {{ t('addAllowance') }}
                  </UiButton>
                </div>
                <div v-for="(row, idx) in employeeForm.allowanceItems" :key="row.id" class="flex gap-2 items-center mb-2">
                  <UiInput v-model="row.name" placeholder="Nama tunjangan" class="flex-1" />
                  <UiInput v-model.number="row.amount" type="number" placeholder="Nominal" class="w-32" />
                  <button type="button" class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" @click="removeAllowanceRow(idx)"><Trash2 class="w-4 h-4" /></button>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <UiButton variant="outline" @click="closeEmployeeModal">{{ tCommon('cancel') }}</UiButton>
              <UiButton variant="gradient" @click="saveEmployeeConfig">
                <Check class="w-4 h-4" /> {{ tCommon('save') }}
              </UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 text-center">
            <AlertTriangle class="w-12 h-12 mx-auto text-score-low mb-4" />
            <h2 class="text-lg font-bold mb-2">{{ tCommon('delete') }} {{ t('salaryComponents') }}</h2>
            <p class="text-muted-foreground mb-6">Hapus "{{ selected?.name }}" ({{ selected?.code }})?</p>
            <div class="flex justify-center gap-3">
              <UiButton variant="outline" @click="closeModals">{{ tCommon('cancel') }}</UiButton>
              <UiButton variant="outline" class="text-score-low border-score-low/30 hover:bg-score-low/10" @click="handleDelete"><Trash2 class="w-4 h-4" /> {{ tCommon('delete') }}</UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
