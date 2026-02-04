<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOvertimeStore } from '~/stores/overtime'
import { useEmployeesStore } from '~/stores/employees'
import type { OvertimeStatus } from '~/stores/overtime'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('overtime')
const tCommon = useModuleT('common')
const { title } = usePageTitle('overtime')
useHead({ title: () => `${t('editOvertimeModal')} | ${title.value}` })

const route = useRoute()
const router = useRouter()
const overtimeStore = useOvertimeStore()
const employeesStore = useEmployeesStore()
const overtimeId = computed(() => route.params.id as string)
const overtime = computed(() => overtimeStore.getOvertimeById(overtimeId.value))

const form = ref({
  employeeId: '',
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
  status: 'pending' as OvertimeStatus,
})

const employeeOptionsForm = computed(() => [
  { value: '', label: t('selectEmployee') as string },
  ...employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

const statusOptionsForm = computed(() => [
  { value: 'pending', label: t('pending') },
  { value: 'approved', label: t('approved') },
  { value: 'rejected', label: t('rejected') },
])

function goBack() {
  router.push('/overtime')
}

function handleSubmit() {
  const item = overtime.value
  if (!item) return
  overtimeStore.updateOvertime(item.id, {
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

onMounted(() => {
  const item = overtime.value
  if (!item) {
    router.replace('/overtime')
    return
  }
  form.value = {
    employeeId: item.employeeId,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    reason: item.reason ?? '',
    status: item.status,
  }
})
</script>

<template>
  <div v-if="overtime" class="space-y-6">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('editOvertimeModal') }}</h1>
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
          <label class="block text-sm font-medium mb-2">{{ t('status') }}</label>
          <UiSelect v-model="form.status" :options="statusOptionsForm" />
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
