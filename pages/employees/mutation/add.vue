<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMutationsStore } from '~/stores/mutations'
import { useEmployeesStore } from '~/stores/employees'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('mutation')
const tCommon = useModuleT('common')
const { title } = usePageTitle('mutation')
useHead({ title: () => `${t('addMutationModal')} | ${title.value}` })

const router = useRouter()
const mutationsStore = useMutationsStore()
const employeesStore = useEmployeesStore()

const form = ref({
  employeeId: '',
  fromDepartment: '',
  toDepartment: '',
  fromDivision: '',
  toDivision: '',
  fromPosition: '',
  toPosition: '',
  mutationDate: new Date().toISOString().split('T')[0],
  reason: '',
})

const employeeOptionsForm = computed(() => [
  { value: '', label: t('selectEmployee') as string },
  ...employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

watch(
  () => form.value.employeeId,
  (id) => {
    if (!id) return
    const emp = employeesStore.getEmployeeById(id)
    if (emp) {
      form.value.fromPosition = emp.position
      form.value.fromDepartment = emp.department
      if (!form.value.toDepartment) form.value.toDepartment = emp.department
    }
  }
)

function goBack() {
  router.push('/employees/mutation')
}

function handleSubmit() {
  mutationsStore.addMutation({
    employeeId: form.value.employeeId,
    fromDepartment: form.value.fromDepartment,
    toDepartment: form.value.toDepartment,
    fromDivision: form.value.fromDivision.trim() || undefined,
    toDivision: form.value.toDivision.trim() || undefined,
    fromPosition: form.value.fromPosition,
    toPosition: form.value.toPosition,
    mutationDate: form.value.mutationDate,
    reason: form.value.reason.trim() || undefined,
  })
  router.push('/employees/mutation')
}

const isFormValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.fromDepartment !== '' &&
    form.value.toDepartment !== '' &&
    form.value.fromPosition !== '' &&
    form.value.toPosition !== '' &&
    form.value.mutationDate !== ''
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
        <h1 class="text-2xl font-bold text-foreground">{{ t('addMutationModal') }}</h1>
        <p class="text-sm text-muted-foreground">{{ title }}</p>
      </div>
    </div>

    <form class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('employee') }} *</label>
          <UiSelect v-model="form.employeeId" :options="employeeOptionsForm" :placeholder="t('selectEmployee')" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('fromDepartment') }} *</label>
            <UiInput v-model="form.fromDepartment" :placeholder="t('fromDepartment')" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('toDepartment') }} *</label>
            <UiInput v-model="form.toDepartment" :placeholder="t('toDepartment')" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('fromDivision') }}</label>
            <UiInput v-model="form.fromDivision" :placeholder="t('fromDivision')" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('toDivision') }}</label>
            <UiInput v-model="form.toDivision" :placeholder="t('toDivision')" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('fromPosition') }} *</label>
          <UiInput v-model="form.fromPosition" :placeholder="t('fromPosition')" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('toPosition') }} *</label>
          <UiInput v-model="form.toPosition" :placeholder="t('toPosition')" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('mutationDate') }} *</label>
          <UiInput v-model="form.mutationDate" type="date" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('reason') }}</label>
          <UiInput v-model="form.reason" :placeholder="t('reason')" />
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
