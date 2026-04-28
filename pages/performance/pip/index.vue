<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Plus as PlusIcon, Trash, AlertTriangle, CheckCheck, Activity } from 'lucide-vue-next'
import { usePipStore, type PipPlan, type PipStatus, type PipMilestone } from '~/stores/pip'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('pip')
useHead({ title: () => title.value })

const pipStore = usePipStore()
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  employeeId: string
  reason: string
  startDate: string
  endDate: string
  goals: string
  milestones: PipMilestone[]
  supervisorId: string
  hrPicId: string
  status: PipStatus
}
const empty = (): FormState => ({
  employeeId: '',
  reason: '',
  startDate: '',
  endDate: '',
  goals: '',
  milestones: [],
  supervisorId: '',
  hrPicId: '',
  status: 'draft',
})
const form = ref<FormState>(empty())

const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.employeeId}` })),
)
const employeeFilterOptions = computed(() => [{ value: '', label: 'Semua Karyawan' }, ...employeeOptions.value])
const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Aktif' },
  { value: 'on_track', label: 'On Track' },
  { value: 'at_risk', label: 'At Risk' },
  { value: 'completed', label: 'Selesai' },
  { value: 'failed', label: 'Gagal' },
]
const formStatusOptions = statusOptions.filter((o) => o.value !== 'all')

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () =>
    form.value.employeeId !== '' &&
    form.value.reason.trim() !== '' &&
    form.value.startDate !== '' &&
    form.value.endDate !== '' &&
    form.value.goals.trim() !== '',
)

function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}
function statusTone(s: PipStatus): 'good' | 'low' | 'average' | 'primary' | 'muted' {
  if (s === 'completed') return 'good'
  if (s === 'failed') return 'low'
  if (s === 'at_risk') return 'low'
  if (s === 'on_track') return 'good'
  if (s === 'active') return 'primary'
  return 'muted'
}
function statusLabel(s: PipStatus) {
  return statusOptions.find((o) => o.value === s)?.label ?? s
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(p: PipPlan) {
  editingId.value = p.id
  form.value = {
    employeeId: p.employeeId,
    reason: p.reason,
    startDate: p.startDate,
    endDate: p.endDate,
    goals: p.goals,
    milestones: JSON.parse(JSON.stringify(p.milestones ?? [])),
    supervisorId: p.supervisorId ?? '',
    hrPicId: p.hrPicId ?? '',
    status: p.status,
  }
  showForm.value = true
}
function addMilestone() {
  form.value.milestones.push({ title: '', dueDate: '', done: false })
}
function removeMilestone(i: number) {
  form.value.milestones.splice(i, 1)
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    employeeId: form.value.employeeId,
    reason: form.value.reason,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    goals: form.value.goals,
    milestones: form.value.milestones,
    supervisorId: form.value.supervisorId || undefined,
    hrPicId: form.value.hrPicId || undefined,
    status: form.value.status,
  }
  if (isEdit.value && editingId.value) {
    pipStore.updatePlan(editingId.value, payload)
  } else {
    pipStore.addPlan(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) pipStore.deletePlan(targetId.value)
  showDelete.value = false
}

function progress(p: PipPlan): number {
  if (p.milestones.length === 0) return 0
  const done = p.milestones.filter((m) => m.done).length
  return Math.round((done / p.milestones.length) * 100)
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola Performance Improvement Plan dengan milestone yang terukur.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          PIP Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <UiStatCard label="Total" :value="pipStore.stats.total" :icon="Activity" />
      <UiStatCard label="Aktif" :value="pipStore.stats.active" tone="primary" :icon="Activity" />
      <UiStatCard label="Selesai" :value="pipStore.stats.completed" tone="good" :icon="CheckCheck" />
      <UiStatCard label="Gagal" :value="pipStore.stats.failed" tone="low" :icon="AlertTriangle" />
    </div>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <UiSelect v-model="pipStore.employeeFilter" :options="employeeFilterOptions" />
      <UiSelect v-model="pipStore.statusFilter" :options="statusOptions" />
    </div>

    <div v-if="pipStore.filtered.length === 0">
      <UiEmptyState
        :icon="Activity"
        title="Belum ada PIP"
        description="Buat PIP baru untuk membantu karyawan memenuhi target performa."
      />
    </div>
    <div v-else class="space-y-3">
      <div v-for="p in pipStore.filtered" :key="p.id" class="glass-card p-5">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-foreground">{{ employeeName(p.employeeId) }}</h3>
              <UiStatusBadge :label="statusLabel(p.status)" :tone="statusTone(p.status)" />
              <span class="text-xs text-muted-foreground">{{ formatDate(p.startDate) }} → {{ formatDate(p.endDate) }}</span>
            </div>
            <p class="text-sm text-muted-foreground mt-1">{{ p.reason }}</p>
            <p class="text-sm text-foreground mt-2"><span class="text-xs text-muted-foreground">Goal: </span>{{ p.goals }}</p>
            <div class="mt-3">
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress milestone</span>
                <span class="font-semibold text-foreground">{{ progress(p) }}%</span>
              </div>
              <div class="mt-1 h-2 rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-primary" :style="{ width: `${progress(p)}%` }" />
              </div>
            </div>
            <ul v-if="p.milestones.length" class="mt-3 space-y-1">
              <li v-for="(m, i) in p.milestones" :key="i" class="flex items-center gap-2 text-sm">
                <input type="checkbox" :checked="m.done" class="w-4 h-4 accent-primary" @change="(e) => pipStore.updatePlan(p.id, { milestones: p.milestones.map((mm, mi) => mi === i ? { ...mm, done: (e.target as HTMLInputElement).checked } : mm) })" >
                <span :class="m.done ? 'line-through text-muted-foreground' : 'text-foreground'">{{ m.title }}</span>
                <span class="text-xs text-muted-foreground">— {{ m.dueDate || '-' }}</span>
              </li>
            </ul>
          </div>
          <div class="flex md:flex-col gap-1">
            <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Edit" @click="openEdit(p)">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" title="Hapus" @click="askDelete(p.id)">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit PIP' : 'Buat Performance Improvement Plan'"
      description="Susun goal, periode, dan milestone yang spesifik dan terukur."
      size="xl"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Karyawan" required>
            <UiSelect v-model="form.employeeId" :options="employeeOptions" placeholder="Pilih karyawan" />
          </UiFormField>
          <UiFormField label="Status">
            <UiSelect v-model="form.status" :options="formStatusOptions" />
          </UiFormField>
          <UiFormField label="Atasan / Supervisor">
            <UiSelect v-model="form.supervisorId" :options="employeeOptions" placeholder="Pilih supervisor" />
          </UiFormField>
          <UiFormField label="HR PIC">
            <UiSelect v-model="form.hrPicId" :options="employeeOptions" placeholder="Pilih HR PIC" />
          </UiFormField>
          <UiFormField label="Tanggal Mulai" required>
            <UiInput v-model="form.startDate" type="date" />
          </UiFormField>
          <UiFormField label="Tanggal Selesai" required>
            <UiInput v-model="form.endDate" type="date" />
          </UiFormField>
        </div>
        <UiFormField label="Alasan PIP" required>
          <UiTextarea v-model="form.reason" rows="3" placeholder="Alasan dimulainya PIP, mis. KPI di bawah target." />
        </UiFormField>
        <UiFormField label="Goal & Ekspektasi" required>
          <UiTextarea v-model="form.goals" rows="3" placeholder="Hasil yang harus dicapai pada akhir periode PIP." />
        </UiFormField>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-foreground">Milestone</h4>
            <UiButton type="button" variant="outline" size="sm" @click="addMilestone">
              <PlusIcon class="w-3.5 h-3.5" />
              Tambah Milestone
            </UiButton>
          </div>
          <div v-if="form.milestones.length === 0" class="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Belum ada milestone.
          </div>
          <div v-for="(m, i) in form.milestones" :key="i" class="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
            <div class="md:col-span-7">
              <UiInput v-model="m.title" placeholder="Milestone (e.g. Submit campaign plan)" />
            </div>
            <div class="md:col-span-3">
              <UiInput v-model="m.dueDate" type="date" />
            </div>
            <div class="md:col-span-1 flex items-center justify-center">
              <input type="checkbox" v-model="m.done" class="w-4 h-4 accent-primary" >
            </div>
            <div class="md:col-span-1 flex justify-end">
              <button type="button" class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="removeMilestone(i)">
                <Trash class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Buat PIP' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus PIP?"
      message="PIP beserta seluruh milestone akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
