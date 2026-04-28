<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Users, GraduationCap } from 'lucide-vue-next'
import { useTrainingStore, type TrainingProgram, type TrainingStatus } from '~/stores/training'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('training')
useHead({ title: () => title.value })

const trainingStore = useTrainingStore()
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  title: string
  category: string
  trainer: string
  startDate: string
  endDate: string
  location: string
  format: 'online' | 'offline' | 'hybrid'
  capacity: number | undefined
  cost: number | undefined
  description: string
  participants: string[]
  status: TrainingStatus
}
const empty = (): FormState => ({
  title: '',
  category: '',
  trainer: '',
  startDate: '',
  endDate: '',
  location: '',
  format: 'offline',
  capacity: undefined,
  cost: undefined,
  description: '',
  participants: [],
  status: 'planned',
})
const form = ref<FormState>(empty())

const formatOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
]
const statusOptions = [
  { value: 'planned', label: 'Planned' },
  { value: 'open', label: 'Open' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]
const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: e.name })),
)

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () => form.value.title.trim() !== '' && form.value.startDate !== '' && form.value.endDate !== '',
)

function statusTone(s: TrainingStatus): 'good' | 'primary' | 'average' | 'low' | 'muted' {
  if (s === 'completed') return 'good'
  if (s === 'ongoing') return 'primary'
  if (s === 'open') return 'average'
  if (s === 'cancelled') return 'low'
  return 'muted'
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(p: TrainingProgram) {
  editingId.value = p.id
  form.value = {
    title: p.title,
    category: p.category,
    trainer: p.trainer,
    startDate: p.startDate,
    endDate: p.endDate,
    location: p.location,
    format: p.format,
    capacity: p.capacity,
    cost: p.cost,
    description: p.description,
    participants: [...p.participants],
    status: p.status,
  }
  showForm.value = true
}
function toggleParticipant(empId: string) {
  const i = form.value.participants.indexOf(empId)
  if (i === -1) form.value.participants.push(empId)
  else form.value.participants.splice(i, 1)
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    title: form.value.title,
    category: form.value.category,
    trainer: form.value.trainer,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    location: form.value.location,
    format: form.value.format,
    capacity: Number(form.value.capacity) || 0,
    cost: Number(form.value.cost) || 0,
    description: form.value.description,
    participants: form.value.participants,
    status: form.value.status,
  }
  if (isEdit.value && editingId.value) {
    trainingStore.updateProgram(editingId.value, payload)
  } else {
    trainingStore.addProgram(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) trainingStore.deleteProgram(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola program training: jadwal, kapasitas, dan peserta.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Training Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="p in trainingStore.programs" :key="p.id" class="glass-card p-5">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-semibold text-foreground truncate">{{ p.title }}</h3>
            <p class="text-xs text-muted-foreground">{{ p.category }} • {{ p.trainer }}</p>
          </div>
          <UiStatusBadge :label="statusOptions.find((o) => o.value === p.status)?.label ?? p.status" :tone="statusTone(p.status)" />
        </div>
        <p class="text-sm text-muted-foreground mt-2 line-clamp-2">{{ p.description }}</p>
        <div class="grid grid-cols-2 gap-2 text-xs mt-3">
          <div>
            <p class="text-muted-foreground">Periode</p>
            <p class="text-foreground">{{ formatDate(p.startDate) }} – {{ formatDate(p.endDate) }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Lokasi</p>
            <p class="text-foreground">{{ p.location }} ({{ p.format }})</p>
          </div>
          <div>
            <p class="text-muted-foreground">Peserta</p>
            <p class="text-foreground">{{ p.participants.length }} / {{ p.capacity }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">Biaya</p>
            <p class="font-mono text-foreground">Rp {{ p.cost.toLocaleString('id-ID') }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-1 mt-4 pt-3 border-t border-border">
          <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(p)">
            <Pencil class="w-4 h-4" />
          </button>
          <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(p.id)">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <UiEmptyState
      v-if="trainingStore.programs.length === 0"
      :icon="GraduationCap"
      title="Belum ada training"
      description="Buat program training baru."
    />

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Training' : 'Tambah Training'"
      description="Lengkapi detail program training termasuk peserta."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Judul Training" required>
            <UiInput v-model="form.title" placeholder="e.g. Leadership Bootcamp" />
          </UiFormField>
          <UiFormField label="Kategori">
            <UiInput v-model="form.category" placeholder="e.g. Leadership" />
          </UiFormField>
          <UiFormField label="Trainer / Penyelenggara">
            <UiInput v-model="form.trainer" />
          </UiFormField>
          <UiFormField label="Format">
            <UiSelect v-model="form.format" :options="formatOptions" />
          </UiFormField>
          <UiFormField label="Tanggal Mulai" required>
            <UiInput v-model="form.startDate" type="date" />
          </UiFormField>
          <UiFormField label="Tanggal Selesai" required>
            <UiInput v-model="form.endDate" type="date" />
          </UiFormField>
          <UiFormField label="Lokasi">
            <UiInput v-model="form.location" placeholder="e.g. Jakarta HQ atau Online" />
          </UiFormField>
          <UiFormField label="Status">
            <UiSelect v-model="form.status" :options="statusOptions" />
          </UiFormField>
          <UiFormField label="Kapasitas">
            <UiInput v-model.number="form.capacity" type="number" />
          </UiFormField>
          <UiFormField label="Biaya (Rp)">
            <UiInput v-model.number="form.cost" type="number" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi">
          <UiTextarea v-model="form.description" rows="3" />
        </UiFormField>
        <UiFormField label="Peserta" :hint="`${form.participants.length} dipilih`">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-xl border border-border p-2">
            <label v-for="opt in employeeOptions" :key="opt.value" class="flex items-center gap-2 text-sm cursor-pointer p-1.5 hover:bg-muted/30 rounded-md">
              <input type="checkbox" :checked="form.participants.includes(opt.value)" class="accent-primary" @change="toggleParticipant(opt.value)" >
              {{ opt.label }}
            </label>
          </div>
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Tambah' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Training?"
      message="Program akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
