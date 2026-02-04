<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePromotionsStore } from '~/stores/promotions'
import { useEmployeesStore } from '~/stores/employees'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('promotion')
const tCommon = useModuleT('common')
const tAtt = useModuleT('attendance')
const { title } = usePageTitle('promotion')
useHead({ title: () => `${t('addPromotionModal')} | ${title.value}` })

const router = useRouter()
const promotionsStore = usePromotionsStore()
const employeesStore = useEmployeesStore()

const form = ref({
  employeeId: '',
  fromPosition: '',
  toPosition: '',
  fromDepartment: '',
  toDepartment: '',
  promotionDate: new Date().toISOString().split('T')[0],
  notes: '',
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
  router.push('/employees/promotion')
}

function handleSubmit() {
  promotionsStore.addPromotion({
    employeeId: form.value.employeeId,
    fromPosition: form.value.fromPosition,
    toPosition: form.value.toPosition,
    fromDepartment: form.value.fromDepartment || undefined,
    toDepartment: form.value.toDepartment || undefined,
    promotionDate: form.value.promotionDate,
    notes: form.value.notes.trim() || undefined,
  })
  router.push('/employees/promotion')
}

const isFormValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.fromPosition !== '' &&
    form.value.toPosition !== '' &&
    form.value.promotionDate !== ''
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
        <h1 class="text-2xl font-bold text-foreground">{{ t('addPromotionModal') }}</h1>
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
          <label class="block text-sm font-medium mb-2">{{ t('fromPosition') }} *</label>
          <UiInput v-model="form.fromPosition" :placeholder="t('fromPosition')" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('toPosition') }} *</label>
          <UiInput v-model="form.toPosition" :placeholder="t('toPosition')" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('fromDepartment') }}</label>
            <UiInput v-model="form.fromDepartment" :placeholder="t('fromDepartment')" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('toDepartment') }}</label>
            <UiInput v-model="form.toDepartment" :placeholder="t('toDepartment')" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('promotionDate') }} *</label>
          <UiInput v-model="form.promotionDate" type="date" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('notes') }}</label>
          <UiInput v-model="form.notes" :placeholder="tAtt('optional')" />
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
