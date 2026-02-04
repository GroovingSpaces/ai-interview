<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useLeaveStore } from '~/stores/leave'
import { useEmployeesStore } from '~/stores/employees'
import type { LeaveType } from '~/stores/leave'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('leave')
const tForm = useModuleT('leaveForm')
const tCommon = useModuleT('common')
const tAtt = useModuleT('attendance')
const { title } = usePageTitle('leave')
useHead({ title: () => `${tForm('addLeaveModal') ?? 'Ajukan Cuti'} | ${title.value}` })

const router = useRouter()
const leaveStore = useLeaveStore()
const employeesStore = useEmployeesStore()

const form = ref({
  employeeId: '',
  type: 'annual' as LeaveType,
  startDate: '',
  endDate: '',
  days: 1,
  reason: '',
  notes: '',
})

const employeeOptionsForm = computed(() => [
  { value: '', label: tForm('selectEmployee') ?? 'Pilih karyawan' },
  ...employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

const typeOptionsForm = [
  { value: 'annual', label: 'Cuti Tahunan' },
  { value: 'sick', label: 'Sakit' },
  { value: 'personal', label: 'Izin' },
  { value: 'unpaid', label: 'Tanpa Bayar' },
  { value: 'other', label: 'Lainnya' },
]

function updateDays() {
  if (!form.value.startDate || !form.value.endDate) return
  const start = new Date(form.value.startDate)
  const end = new Date(form.value.endDate)
  if (end < start) {
    form.value.days = 0
    return
  }
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  form.value.days = Math.max(0, diff)
}

watch([() => form.value.startDate, () => form.value.endDate], updateDays)

function goBack() {
  router.push('/leave')
}

function handleSubmit() {
  leaveStore.addRequest({
    employeeId: form.value.employeeId,
    type: form.value.type,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    days: form.value.days,
    reason: form.value.reason.trim(),
    status: 'pending',
    notes: form.value.notes.trim() || undefined,
  })
  router.push('/leave')
}

const isFormValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.startDate !== '' &&
    form.value.endDate !== '' &&
    form.value.reason.trim() !== '' &&
    form.value.days >= 0
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
        <h1 class="text-2xl font-bold text-foreground">{{ tForm('addLeaveModal') ?? 'Ajukan Cuti' }}</h1>
        <p class="text-sm text-muted-foreground">{{ title }}</p>
      </div>
    </div>

    <form class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">{{ tForm('employee') ?? 'Karyawan' }} *</label>
          <UiSelect v-model="form.employeeId" :options="employeeOptionsForm" :placeholder="tForm('selectEmployee') ?? 'Pilih karyawan'" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ tForm('leaveType') ?? 'Tipe Cuti' }} *</label>
          <UiSelect v-model="form.type" :options="typeOptionsForm" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ tForm('startDate') ?? 'Tanggal Mulai' }} *</label>
            <UiInput v-model="form.startDate" type="date" @change="updateDays" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">{{ tForm('endDate') ?? 'Tanggal Selesai' }} *</label>
            <UiInput v-model="form.endDate" type="date" @change="updateDays" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ tForm('days') ?? 'Jumlah Hari' }}</label>
          <UiInput v-model.number="form.days" type="number" min="0" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ tForm('reason') ?? 'Alasan' }} *</label>
          <UiInput v-model="form.reason" :placeholder="tForm('reasonPlaceholder') ?? 'Alasan cuti'" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ tForm('notes') ?? 'Catatan' }}</label>
          <UiInput v-model="form.notes" :placeholder="tAtt('optional') ?? 'Opsional'" />
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UiButton type="button" variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          {{ tCommon('cancel') }}
        </UiButton>
        <UiButton type="submit" variant="gradient" :disabled="!isFormValid">
          <Check class="w-4 h-4" />
          {{ tForm('submit') ?? 'Ajukan' }}
        </UiButton>
      </div>
    </form>
  </div>
</template>
