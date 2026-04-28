<script setup lang="ts">
import { ref, computed } from 'vue'
import { Save, Send, Upload, X } from 'lucide-vue-next'
import { useKpiStore, type KpiAssignment } from '~/stores/kpi'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('selfAssessment')
useHead({ title: () => title.value })

const kpiStore = useKpiStore()
const authStore = useAuthStore()

const meId = computed(() => authStore.user?.id ?? '1')
const period = ref(kpiStore.periodOptions[0]?.value ?? '2026-Q1')

const myAssignments = computed(() => kpiStore.getAssignmentsByEmployeeAndPeriod(meId.value, period.value))

interface DraftRow {
  id: string
  actual: number
  notes: string
  evidenceFileName: string
  evidenceFileData: string
}
const draft = ref<Record<string, DraftRow>>({})

function ensureDraft(a: KpiAssignment) {
  if (!draft.value[a.id]) {
    draft.value[a.id] = {
      id: a.id,
      actual: a.actual,
      notes: a.notes ?? '',
      evidenceFileName: a.evidenceFileName ?? '',
      evidenceFileData: a.evidenceFileData ?? '',
    }
  }
  return draft.value[a.id]
}

function uploadEvidence(id: string, ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const d = draft.value[id]
    d.evidenceFileName = file.name
    d.evidenceFileData = reader.result as string
  }
  reader.readAsDataURL(file)
}
function clearEvidence(id: string) {
  const d = draft.value[id]
  d.evidenceFileName = ''
  d.evidenceFileData = ''
}

function saveDraft(a: KpiAssignment) {
  const d = draft.value[a.id]
  if (!d) return
  kpiStore.updateAssignment(a.id, {
    actual: Number(d.actual) || 0,
    notes: d.notes,
    evidenceFileName: d.evidenceFileName || undefined,
    evidenceFileData: d.evidenceFileData || undefined,
    status: 'in_progress',
  })
}
function submitAll() {
  for (const a of myAssignments.value) {
    const d = draft.value[a.id]
    if (d) {
      kpiStore.updateAssignment(a.id, {
        actual: Number(d.actual) || 0,
        notes: d.notes,
        evidenceFileName: d.evidenceFileName || undefined,
        evidenceFileData: d.evidenceFileData || undefined,
        status: 'submitted',
      })
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Lakukan self-assessment terhadap KPI Anda untuk periode berjalan.">
      <template #actions>
        <div class="w-40">
          <UiSelect v-model="period" :options="kpiStore.periodOptions" />
        </div>
        <UiButton variant="gradient" :disabled="myAssignments.length === 0" @click="submitAll">
          <Send class="w-4 h-4" />
          Submit Semua
        </UiButton>
      </template>
    </UiPageHeader>

    <UiEmptyState
      v-if="myAssignments.length === 0"
      title="Belum ada KPI"
      description="KPI untuk periode ini belum ditetapkan. Hubungi atasan Anda."
    />

    <div v-else class="space-y-4">
      <div
        v-for="a in myAssignments"
        :key="a.id"
        class="glass-card p-5 space-y-4"
      >
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="font-semibold text-foreground">{{ kpiStore.getPolicyById(a.policyId)?.name }}</h3>
            <UiStatusBadge
              :label="a.status === 'submitted' ? 'Submitted' : a.status === 'in_progress' ? 'Draft' : a.status === 'reviewed' ? 'Final' : 'Belum'"
              :tone="a.status === 'submitted' ? 'primary' : a.status === 'reviewed' ? 'good' : 'average'"
            />
          </div>
          <p class="text-sm text-muted-foreground">{{ kpiStore.getPolicyById(a.policyId)?.description }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UiFormField label="Target" :hint="`Bobot ${kpiStore.getPolicyById(a.policyId)?.weight}%`">
            <UiInput :model-value="a.target" disabled />
          </UiFormField>
          <UiFormField label="Realisasi (Self)" required>
            <UiInput v-model.number="ensureDraft(a).actual" type="number" />
          </UiFormField>
          <UiFormField label="Pencapaian">
            <UiInput
              :model-value="`${a.target > 0 ? Math.min(100, Math.round((Number(ensureDraft(a).actual) / a.target) * 100)) : 0}%`"
              disabled
            />
          </UiFormField>
        </div>
        <UiFormField label="Catatan / Justifikasi" hint="Jelaskan pencapaian, kendala, atau bukti pendukung.">
          <UiTextarea v-model="ensureDraft(a).notes" rows="3" placeholder="Tuliskan poin penting yang menjelaskan pencapaian Anda" />
        </UiFormField>
        <UiFormField label="Bukti Pendukung (opsional)">
          <div v-if="ensureDraft(a).evidenceFileName" class="flex items-center justify-between rounded-xl border border-input bg-card/50 px-3 py-2 text-sm">
            <span class="truncate">{{ ensureDraft(a).evidenceFileName }}</span>
            <button type="button" class="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="clearEvidence(a.id)">
              <X class="w-4 h-4" />
            </button>
          </div>
          <label v-else class="flex items-center gap-2 h-11 rounded-xl border border-dashed border-input bg-card/50 px-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground cursor-pointer transition-colors">
            <Upload class="w-4 h-4" />
            <span>Pilih file</span>
            <input type="file" class="hidden" accept="image/*,.pdf" @change="uploadEvidence(a.id, $event)" >
          </label>
        </UiFormField>
        <div class="flex justify-end">
          <UiButton variant="outline" @click="saveDraft(a)">
            <Save class="w-4 h-4" />
            Simpan Draft
          </UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
