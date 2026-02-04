<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useKpiStore } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'
import type { KpiStatus } from '~/stores/kpi'
import { ArrowLeft, Check, Upload, FileText, X } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const t = useModuleT('kpi')
const tCommon = useModuleT('common')
const { title } = usePageTitle('kpi')
useHead({ title: () => `${t('evaluateKpi') || 'Menilai KPI'} | ${title.value}` })

const route = useRoute()
const router = useRouter()
const kpiStore = useKpiStore()
const employeesStore = useEmployeesStore()

const assignmentId = computed(() => route.params.id as string)
const assignment = computed(() => kpiStore.getAssignmentById(assignmentId.value))

const form = ref({
  actual: 0,
  status: 'draft' as KpiStatus,
  notes: '',
  evidenceFileName: '' as string,
  evidenceFileData: '' as string,
})

const evidenceFileInput = ref<HTMLInputElement | null>(null)

const statusOptions = computed(() => [
  { value: 'draft', label: t('draft') || 'Draft' },
  { value: 'in_progress', label: t('inProgress') || 'In Progress' },
  { value: 'submitted', label: t('submitted') || 'Submitted' },
  { value: 'reviewed', label: t('reviewed') || 'Reviewed' },
])

onMounted(() => {
  if (assignment.value) {
    form.value.actual = assignment.value.actual
    form.value.status = assignment.value.status
    form.value.notes = assignment.value.notes ?? ''
    form.value.evidenceFileName = assignment.value.evidenceFileName ?? ''
    form.value.evidenceFileData = assignment.value.evidenceFileData ?? ''
  }
})

function onEvidenceFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.evidenceFileData = reader.result as string
    form.value.evidenceFileName = file.name
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function removeEvidence() {
  form.value.evidenceFileName = ''
  form.value.evidenceFileData = ''
}

function goBack() {
  router.push('/kpi')
}

function getEmployeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}

function getPolicyName(id: string) {
  return kpiStore.getPolicyById(id)?.name ?? id
}

function handleSubmit() {
  if (!assignment.value) return
  kpiStore.updateAssignment(assignment.value.id, {
    actual: Number(form.value.actual) ?? 0,
    status: form.value.status,
    notes: form.value.notes.trim() || undefined,
    evidenceFileName: form.value.evidenceFileName || undefined,
    evidenceFileData: form.value.evidenceFileData || undefined,
  })
  router.push('/kpi')
}
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
        <h1 class="text-2xl font-bold text-foreground">{{ t('evaluateKpi') || 'Menilai KPI' }}</h1>
        <p class="text-sm text-muted-foreground">{{ t('evaluateKpiDesc') || 'Isi nilai aktual dan status penilaian' }}</p>
      </div>
    </div>

    <div v-if="!assignment" class="glass-card p-12 text-center">
      <p class="text-muted-foreground">{{ t('noData') || 'Penugasan tidak ditemukan' }}</p>
      <UiButton variant="outline" class="mt-4" @click="goBack">{{ tCommon('cancel') || 'Kembali' }}</UiButton>
    </div>

    <form v-else class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-6">
        <h2 class="text-lg font-semibold text-foreground">{{ t('assignmentInfo') || 'Info Penugasan' }}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p class="text-muted-foreground">{{ t('employee') || 'Karyawan' }}</p>
            <p class="font-medium text-foreground">{{ getEmployeeName(assignment.employeeId) }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">{{ t('policyName') || 'Kebijakan' }}</p>
            <p class="font-medium text-foreground">{{ getPolicyName(assignment.policyId) }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">{{ t('period') || 'Periode' }}</p>
            <p class="font-medium text-foreground">{{ assignment.period }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">{{ t('target') || 'Target' }}</p>
            <p class="font-medium text-foreground tabular-nums">{{ assignment.target }}</p>
          </div>
        </div>

        <hr class="border-border" />

        <h2 class="text-lg font-semibold text-foreground">{{ t('evaluation') || 'Penilaian' }}</h2>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('actual') || 'Nilai Aktual' }} *</label>
          <UiInput v-model.number="form.actual" type="number" min="0" :placeholder="t('actualPlaceholder') || 'Hasil pencapaian'" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ tCommon('status') || 'Status' }}</label>
          <UiSelect v-model="form.status" :options="statusOptions" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">{{ t('notes') || 'Catatan' }}</label>
          <UiInput v-model="form.notes" type="text" :placeholder="t('notesPlaceholder') || 'Opsional'" />
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">
            {{ t('evidence') || 'Evidence' }}
            <span class="text-muted-foreground font-normal">({{ t('optional') || 'opsional' }})</span>
          </label>
          <input
            ref="evidenceFileInput"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
            class="hidden"
            @change="onEvidenceFileSelect"
          />
          <div v-if="!form.evidenceFileName" class="flex items-center gap-2">
            <UiButton type="button" variant="outline" size="sm" @click="evidenceFileInput?.click()">
              <Upload class="w-4 h-4" />
              {{ t('uploadEvidence') || 'Upload file' }}
            </UiButton>
          </div>
          <div v-else class="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
            <FileText class="w-5 h-5 text-primary" />
            <span class="text-sm font-medium text-foreground truncate flex-1">{{ form.evidenceFileName }}</span>
            <a
              v-if="form.evidenceFileData"
              :href="form.evidenceFileData"
              target="_blank"
              rel="noopener"
              class="text-xs text-primary hover:underline"
            >
              {{ t('view') || 'Lihat' }}
            </a>
            <button type="button" class="p-1 rounded hover:bg-muted text-muted-foreground" @click="removeEvidence" title="Remove">
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UiButton type="button" variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          {{ tCommon('cancel') || 'Batal' }}
        </UiButton>
        <UiButton type="submit" variant="gradient">
          <Check class="w-4 h-4" />
          {{ t('submit') || 'Simpan Penilaian' }}
        </UiButton>
      </div>
    </form>
  </div>
</template>
