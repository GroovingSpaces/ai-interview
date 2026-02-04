<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useKpiStore } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const t = useModuleT('kpi')
const tCommon = useModuleT('common')
const { title } = usePageTitle('kpi')
useHead({ title: () => `${t('addKpi') || 'Input KPI'} | ${title.value}` })

const router = useRouter()
const kpiStore = useKpiStore()
const employeesStore = useEmployeesStore()

const form = ref({
  employeeId: '',
  period: '',
  targetsByPolicy: {} as Record<string, number>,
})

// Initialize targets for each policy
watch(
  () => kpiStore.policies,
  (policies) => {
    if (Object.keys(form.value.targetsByPolicy).length === 0 && policies.length) {
      const next: Record<string, number> = {}
      policies.forEach((p) => { next[p.id] = 0 })
      form.value.targetsByPolicy = next
    }
  },
  { immediate: true }
)

const employeeOptions = computed(() => [
  { value: '', label: t('selectEmployee') || 'Pilih karyawan' },
  ...employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

const periodOptions = computed(() => {
  const year = new Date().getFullYear()
  const options: { value: string; label: string }[] = []
  for (let q = 1; q <= 4; q++) {
    const p = `${year}-Q${q}`
    options.push({ value: p, label: p })
  }
  for (let q = 1; q <= 4; q++) {
    const p = `${year - 1}-Q${q}`
    options.push({ value: p, label: p })
  }
  return options
})

const policyRows = computed(() =>
  kpiStore.policies.map((policy) => ({
    ...policy,
    target: form.value.targetsByPolicy[policy.id] ?? 0,
  }))
)

function setTarget(policyId: string, value: number) {
  form.value.targetsByPolicy = {
    ...form.value.targetsByPolicy,
    [policyId]: value,
  }
}

function goBack() {
  router.push('/kpi')
}

function handleSubmit() {
  if (!form.value.employeeId || !form.value.period) return
  const employeeId = form.value.employeeId
  const period = form.value.period
  kpiStore.policies.forEach((policy) => {
    const target = Number(form.value.targetsByPolicy[policy.id]) || 0
    if (target > 0) {
      kpiStore.addAssignment({
        employeeId,
        policyId: policy.id,
        period,
        target,
        actual: 0,
        status: 'draft',
      })
    }
  })
  router.push('/kpi')
}

const hasAtLeastOneTarget = computed(() =>
  Object.values(form.value.targetsByPolicy).some((v) => Number(v) > 0)
)

const isFormValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.period !== '' &&
    hasAtLeastOneTarget.value
)
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
        <h1 class="text-2xl font-bold text-foreground">{{ t('addKpi') || 'Input KPI' }}</h1>
        <p class="text-sm text-muted-foreground">
          {{ t('addKpiDescMulti') || 'Tambah penugasan KPI untuk karyawan (multi kebijakan)' }}
        </p>
      </div>
    </div>

    <form class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('employee') || 'Karyawan' }} *</label>
            <UiSelect v-model="form.employeeId" :options="employeeOptions" :placeholder="t('selectEmployee') || 'Pilih karyawan'" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('period') || 'Periode' }} *</label>
            <UiSelect v-model="form.period" :options="periodOptions" :placeholder="t('selectPeriod') || 'Pilih periode'" />
          </div>
        </div>

        <div>
          <h3 class="text-sm font-semibold text-foreground mb-3">
            {{ t('targetPerPolicy') || 'Target per kebijakan (isi yang berlaku)' }}
          </h3>
          <div class="overflow-x-auto rounded-xl border border-border">
            <table class="w-full min-w-[400px] text-sm">
              <thead>
                <tr class="border-b border-border bg-muted/50">
                  <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('policyName') || 'Kebijakan' }}</th>
                  <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('category') || 'Kategori' }}</th>
                  <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('targetUnit') || 'Satuan' }}</th>
                  <th class="px-4 py-3 text-left font-medium text-foreground w-32">{{ t('target') || 'Target' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="policy in policyRows"
                  :key="policy.id"
                  class="border-b border-border hover:bg-muted/30"
                >
                  <td class="px-4 py-3">
                    <p class="font-medium text-foreground">{{ policy.name }}</p>
                    <p class="text-xs text-muted-foreground line-clamp-1">{{ policy.description }}</p>
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">{{ policy.category }}</td>
                  <td class="px-4 py-3 text-foreground">{{ policy.targetUnit }}</td>
                  <td class="px-4 py-3">
                    <UiInput
                      :model-value="form.targetsByPolicy[policy.id] ?? 0"
                      type="number"
                      min="0"
                      :placeholder="t('targetPlaceholder') || '0 = skip'"
                      @update:model-value="(v) => setTarget(policy.id, Number(v) || 0)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            {{ t('targetHint') || 'Isi target untuk kebijakan yang ingin ditugaskan; kosongkan atau 0 untuk melewati.' }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UiButton type="button" variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          {{ tCommon('cancel') || 'Batal' }}
        </UiButton>
        <UiButton type="submit" variant="gradient" :disabled="!isFormValid">
          <Check class="w-4 h-4" />
          {{ t('submit') || 'Simpan' }}
        </UiButton>
      </div>
    </form>
  </div>
</template>
