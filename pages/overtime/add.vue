<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOvertimeStore } from '~/stores/overtime'
import { useEmployeesStore } from '~/stores/employees'
import type { OvertimeStatus } from '~/stores/overtime'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('overtime')
const tCommon = useModuleT('common')
const { title } = usePageTitle('overtime')
useHead({ title: () => `${t('addOvertimeModal')} | ${title.value}` })

const router = useRouter()
const overtimeStore = useOvertimeStore()
const employeesStore = useEmployeesStore()

const form = ref({
  employeeId: '',
  date: new Date().toISOString().split('T')[0],
  startTime: '18:00',
  endTime: '21:00',
  reason: '',
  status: 'pending' as OvertimeStatus,
})

const employeeOptionsForm = computed(() => [
  { value: '', label: t('selectEmployee') as string },
  ...employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

function goBack() {
  router.push('/overtime')
}

function handleSubmit() {
  overtimeStore.addOvertime({
    employeeId: form.value.employeeId,
    date: form.value.date,
    startTime: form.value.startTime,
    endTime: form.value.endTime,
    reason: form.value.reason.trim() || undefined,
    status: form.value.status,
  })
  router.push('/overtime')
}

const isFormValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.date !== '' &&
    form.value.startTime !== '' &&
    form.value.endTime !== ''
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
        <h1 class="text-2xl font-bold text-foreground">{{ t('addOvertimeModal') }}</h1>
        <p class="text-sm text-muted-foreground">{{ title }}</p>
      </div>
    </div>

    <form class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('employee') }} *</label>
          <UiSelect v-model="form.employeeId" :options="employeeOptionsForm" :placeholder="t('selectEmployee')" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('date') }} *</label>
          <UiInput v-model="form.date" type="date" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('startTime') }} *</label>
            <UiInput v-model="form.startTime" type="time" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('endTime') }} *</label>
            <UiInput v-model="form.endTime" type="time" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('reason') }}</label>
          <UiInput v-model="form.reason" :placeholder="t('optional')" />
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
