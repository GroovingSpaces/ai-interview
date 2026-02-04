<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAttendanceStore } from '~/stores/attendance'
import { useEmployeesStore } from '~/stores/employees'
import type { AttendanceStatus } from '~/stores/attendance'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('attendance')
const tCommon = useModuleT('common')
const { title } = usePageTitle('attendance')
useHead({ title: () => `${t('editAttendanceModal')} | ${title.value}` })

const route = useRoute()
const router = useRouter()
const attendanceStore = useAttendanceStore()
const employeesStore = useEmployeesStore()
const recordId = computed(() => route.params.id as string)
const record = computed(() => attendanceStore.getRecordById(recordId.value))

const form = ref({
  employeeId: '',
  date: '',
  checkIn: '',
  checkOut: '',
  status: 'present' as AttendanceStatus,
  notes: '',
})

const employeeOptionsForm = computed(() => [
  { value: '', label: t('selectEmployee') as string },
  ...employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

const statusOptionsForm = computed(() => [
  { value: 'present', label: t('present') },
  { value: 'late', label: t('late') },
  { value: 'absent', label: t('absent') },
  { value: 'leave', label: t('leave') },
  { value: 'wfh', label: t('wfh') },
])

function goBack() {
  router.push('/attendance')
}

function handleSubmit() {
  const item = record.value
  if (!item) return
  attendanceStore.updateRecord(item.id, {
    employeeId: form.value.employeeId,
    date: form.value.date,
    checkIn: form.value.checkIn || undefined,
    checkOut: form.value.checkOut || undefined,
    status: form.value.status,
    notes: form.value.notes.trim() || undefined,
  })
  router.push('/attendance')
}

const isFormValid = computed(() => form.value.employeeId !== '' && form.value.date !== '')

onMounted(() => {
  const item = record.value
  if (!item) {
    router.replace('/attendance')
    return
  }
  form.value = {
    employeeId: item.employeeId,
    date: item.date,
    checkIn: item.checkIn ?? '',
    checkOut: item.checkOut ?? '',
    status: item.status,
    notes: item.notes ?? '',
  }
})
</script>

<template>
  <div v-if="record" class="space-y-6">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ t('editAttendanceModal') }}</h1>
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
            <label class="block text-sm font-medium mb-2">{{ t('checkIn') }}</label>
            <UiInput v-model="form.checkIn" type="time" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ t('checkOut') }}</label>
            <UiInput v-model="form.checkOut" type="time" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ tCommon('status') }}</label>
          <UiSelect v-model="form.status" :options="statusOptionsForm" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('notes') }}</label>
          <UiInput v-model="form.notes" :placeholder="t('optional')" />
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
