<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useKpiStore } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'
import type { KpiAssignment, KpiStatus } from '~/stores/kpi'
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

const employeeId = computed(() => route.params.employeeId as string)
const period = computed(() => (route.params.period as string) ? decodeURIComponent(route.params.period as string) : '')
const assignments = computed(() => kpiStore.getAssignmentsByEmployeeAndPeriod(employeeId.value, period.value))

const employeeName = computed(() => employeesStore.getEmployeeById(employeeId.value)?.name ?? employeeId.value)

/** Per-assignment form: assignmentId -> { actual, status, notes, evidenceFileName, evidenceFileData } */
const rows = ref<Record<string, { actual: number; status: KpiStatus; notes: string; evidenceFileName: string; evidenceFileData: string }>>({})

const statusOptions = computed(() => [
  { value: 'draft', label: t('draft') || 'Draft' },
  { value: 'in_progress', label: t('inProgress') || 'In Progress' },
  { value: 'submitted', label: t('submitted') || 'Submitted' },
  { value: 'reviewed', label: t('reviewed') || 'Reviewed' },
])

const evidenceInputRef = ref<HTMLInputElement | null>(null)
const evidenceTargetAssignmentId = ref<string | null>(null)

onMounted(() => {
  assignments.value.forEach((a) => {
    rows.value[a.id] = {
      actual: a.actual,
      status: a.status,
      notes: a.notes ?? '',
      evidenceFileName: a.evidenceFileName ?? '',
      evidenceFileData: a.evidenceFileData ?? '',
    }
  })
})

function getPolicyName(id: string) {
  return kpiStore.getPolicyById(id)?.name ?? id
}

function goBack() {
  router.push('/kpi')
}

function setActual(assignmentId: string, value: number) {
  if (rows.value[assignmentId]) rows.value[assignmentId].actual = value
}

function setStatus(assignmentId: string, value: KpiStatus) {
  if (rows.value[assignmentId]) rows.value[assignmentId].status = value
}

function setNotes(assignmentId: string, value: string) {
  if (rows.value[assignmentId]) rows.value[assignmentId].notes = value
}

function openEvidenceInput(assignmentId: string) {
  evidenceTargetAssignmentId.value = assignmentId
  evidenceInputRef.value?.click()
}

function onEvidenceFileSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  const assignmentId = evidenceTargetAssignmentId.value
  if (!file || !assignmentId || !rows.value[assignmentId]) return
  const reader = new FileReader()
  reader.onload = () => {
    rows.value[assignmentId].evidenceFileData = reader.result as string
    rows.value[assignmentId].evidenceFileName = file.name
  }
  reader.readAsDataURL(file)
  input.value = ''
  evidenceTargetAssignmentId.value = null
}

function removeEvidence(assignmentId: string) {
  if (rows.value[assignmentId]) {
    rows.value[assignmentId].evidenceFileName = ''
    rows.value[assignmentId].evidenceFileData = ''
  }
}

function handleSubmit() {
  assignments.value.forEach((a) => {
    const r = rows.value[a.id]
    if (r) {
      kpiStore.updateAssignment(a.id, {
        actual: Number(r.actual) ?? 0,
        status: r.status,
        notes: r.notes.trim() || undefined,
        evidenceFileName: r.evidenceFileName || undefined,
        evidenceFileData: r.evidenceFileData || undefined,
      })
    }
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
        <p class="text-sm text-muted-foreground">
          {{ t('evaluateKpiDesc') || 'Isi nilai aktual dan status penilaian per kebijakan (multiple row policies).' }}
        </p>
      </div>
    </div>

    <div v-if="assignments.length === 0" class="glass-card p-12 text-center">
      <p class="text-muted-foreground">{{ t('noData') || 'Tidak ada penugasan KPI untuk karyawan & periode ini.' }}</p>
      <UiButton variant="outline" class="mt-4" @click="goBack">{{ tCommon('cancel') || 'Kembali' }}</UiButton>
    </div>

    <form v-else class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="rounded-xl border border-border bg-card p-4">
        <h2 class="text-lg font-semibold text-foreground mb-2">{{ t('assignmentInfo') || 'Info Penugasan' }}</h2>
        <div class="flex flex-wrap gap-6 text-sm">
          <div>
            <p class="text-muted-foreground">{{ t('employee') || 'Karyawan' }}</p>
            <p class="font-medium text-foreground">{{ employeeName }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">{{ t('period') || 'Periode' }}</p>
            <p class="font-medium text-foreground">{{ period }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">{{ t('policiesCount') || 'Kebijakan' }}</p>
            <p class="font-medium text-foreground tabular-nums">{{ assignments.length }}</p>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border bg-card overflow-hidden">
        <div class="border-b border-border bg-muted/30 px-5 py-4">
          <h2 class="text-lg font-semibold text-foreground">{{ t('evaluation') || 'Penilaian per kebijakan' }}</h2>
          <p class="text-sm text-muted-foreground">
            {{ t('evaluateKpiDesc') || 'Isi nilai aktual dan status untuk tiap company policy (multiple rows).' }}
          </p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[700px] text-sm">
            <thead>
              <tr class="border-b border-border bg-muted/50">
                <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('policyName') || 'Kebijakan' }}</th>
                <th class="px-4 py-3 text-left font-medium text-foreground w-24">{{ t('target') || 'Target' }}</th>
                <th class="px-4 py-3 text-left font-medium text-foreground w-28">{{ t('actual') || 'Aktual' }}</th>
                <th class="px-4 py-3 text-left font-medium text-foreground w-36">{{ tCommon('status') || 'Status' }}</th>
                <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('notes') || 'Catatan' }}</th>
                <th class="px-4 py-3 text-left font-medium text-foreground w-40">{{ t('evidence') || 'Evidence' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="a in assignments"
                :key="a.id"
                class="border-b border-border hover:bg-muted/20"
              >
                <td class="px-4 py-3">
                  <p class="font-medium text-foreground">{{ getPolicyName(a.policyId) }}</p>
                </td>
                <td class="px-4 py-3 text-foreground tabular-nums">{{ a.target }}</td>
                <td class="px-4 py-3">
                  <UiInput
                    :model-value="rows[a.id]?.actual ?? 0"
                    type="number"
                    min="0"
                    class="w-24"
                    @update:model-value="(v) => setActual(a.id, Number(v) || 0)"
                  />
                </td>
                <td class="px-4 py-3">
                  <UiSelect
                    :model-value="rows[a.id]?.status ?? 'draft'"
                    :options="statusOptions"
                    class="w-32"
                    @update:model-value="(v) => setStatus(a.id, v as KpiStatus)"
                  />
                </td>
                <td class="px-4 py-3">
                  <UiInput
                    :model-value="rows[a.id]?.notes ?? ''"
                    type="text"
                    class="min-w-[120px]"
                    :placeholder="t('notesPlaceholder') || 'Opsional'"
                    @update:model-value="(v) => setNotes(a.id, String(v))"
                  />
                </td>
                <td class="px-4 py-3">
                  <template v-if="rows[a.id]?.evidenceFileName">
                    <div class="flex items-center gap-2">
                      <FileText class="w-4 h-4 text-primary flex-shrink-0" />
                      <span class="text-foreground truncate max-w-[100px]">{{ rows[a.id].evidenceFileName }}</span>
                      <a
                        v-if="rows[a.id].evidenceFileData"
                        :href="rows[a.id].evidenceFileData"
                        target="_blank"
                        rel="noopener"
                        class="text-xs text-primary hover:underline"
                      >
                        {{ t('view') || 'Lihat' }}
                      </a>
                      <button type="button" class="p-1 rounded hover:bg-muted text-muted-foreground" @click="removeEvidence(a.id)">
                        <X class="w-3 h-3" />
                      </button>
                    </div>
                  </template>
                  <UiButton
                    v-else
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="openEvidenceInput(a.id)"
                  >
                    <Upload class="w-3 h-3" />
                    {{ t('uploadEvidence') || 'Upload' }}
                  </UiButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <input
        ref="evidenceInputRef"
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
        class="hidden"
        @change="onEvidenceFileSelect"
      />

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
