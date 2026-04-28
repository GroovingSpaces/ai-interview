<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Briefcase, ExternalLink } from 'lucide-vue-next'
import { useRequisitionsStore, type JobOpening, type EmploymentType, type WorkArrangement } from '~/stores/requisitions'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('jobOpenings')
useHead({ title: () => title.value })

const reqStore = useRequisitionsStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  title: string
  department: string
  location: string
  employmentType: EmploymentType
  workArrangement: WorkArrangement
  experienceMin: number
  experienceMax: number
  salaryMin: number | undefined
  salaryMax: number | undefined
  shortDescription: string
  fullDescription: string
  responsibilities: string[]
  qualifications: string[]
  benefits: string[]
  status: JobOpening['status']
  requisitionId: string
}
const empty = (): FormState => ({
  title: '',
  department: '',
  location: '',
  employmentType: 'full_time',
  workArrangement: 'onsite',
  experienceMin: 0,
  experienceMax: 0,
  salaryMin: undefined,
  salaryMax: undefined,
  shortDescription: '',
  fullDescription: '',
  responsibilities: [],
  qualifications: [],
  benefits: [],
  status: 'draft',
  requisitionId: '',
})
const form = ref<FormState>(empty())

const employmentOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Kontrak' },
  { value: 'internship', label: 'Magang' },
]
const arrangementOptions = [
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'paused', label: 'Paused' },
  { value: 'closed', label: 'Closed' },
]
const requisitionOptions = computed(() => [
  { value: '', label: '— Tanpa requisition —' },
  ...reqStore.requisitions.map((r) => ({ value: r.id, label: r.title })),
])

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () =>
    form.value.title.trim() !== '' &&
    form.value.department.trim() !== '' &&
    form.value.location.trim() !== '' &&
    form.value.shortDescription.trim() !== '',
)

function statusTone(s: string): 'good' | 'low' | 'average' | 'muted' {
  if (s === 'open') return 'good'
  if (s === 'closed') return 'muted'
  if (s === 'paused') return 'average'
  return 'muted'
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(j: JobOpening) {
  editingId.value = j.id
  form.value = {
    title: j.title,
    department: j.department,
    location: j.location,
    employmentType: j.employmentType,
    workArrangement: j.workArrangement,
    experienceMin: j.experienceMin,
    experienceMax: j.experienceMax,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    shortDescription: j.shortDescription,
    fullDescription: j.fullDescription,
    responsibilities: [...j.responsibilities],
    qualifications: [...j.qualifications],
    benefits: [...j.benefits],
    status: j.status,
    requisitionId: j.requisitionId ?? '',
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    title: form.value.title,
    department: form.value.department,
    location: form.value.location,
    employmentType: form.value.employmentType,
    workArrangement: form.value.workArrangement,
    experienceMin: Number(form.value.experienceMin) || 0,
    experienceMax: Number(form.value.experienceMax) || 0,
    salaryMin: form.value.salaryMin ? Number(form.value.salaryMin) : undefined,
    salaryMax: form.value.salaryMax ? Number(form.value.salaryMax) : undefined,
    shortDescription: form.value.shortDescription,
    fullDescription: form.value.fullDescription,
    responsibilities: form.value.responsibilities.filter((r) => r.trim() !== ''),
    qualifications: form.value.qualifications.filter((r) => r.trim() !== ''),
    benefits: form.value.benefits.filter((r) => r.trim() !== ''),
    status: form.value.status,
    requisitionId: form.value.requisitionId || undefined,
  }
  if (isEdit.value && editingId.value) {
    reqStore.updateJobOpening(editingId.value, payload)
  } else {
    reqStore.addJobOpening(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) reqStore.deleteJobOpening(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola lowongan terbuka untuk publikasi ke kandidat.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Lowongan Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="j in reqStore.jobOpenings" :key="j.id" class="glass-card p-5 flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-semibold text-foreground truncate">{{ j.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ j.department }} • {{ j.location }}</p>
          </div>
          <UiStatusBadge :label="statusOptions.find((o) => o.value === j.status)?.label ?? j.status" :tone="statusTone(j.status)" />
        </div>
        <div class="mt-3 flex flex-wrap gap-2 text-xs">
          <span class="px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">{{ employmentOptions.find((o) => o.value === j.employmentType)?.label }}</span>
          <span class="px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">{{ arrangementOptions.find((o) => o.value === j.workArrangement)?.label }}</span>
          <span class="px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">{{ j.experienceMin }}-{{ j.experienceMax }} thn</span>
        </div>
        <p class="text-sm text-muted-foreground mt-3 line-clamp-3">{{ j.shortDescription }}</p>
        <p v-if="j.salaryMin && j.salaryMax" class="text-sm font-mono text-foreground mt-3">Rp {{ j.salaryMin.toLocaleString('id-ID') }} – {{ j.salaryMax.toLocaleString('id-ID') }}</p>
        <div class="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <p class="text-xs text-muted-foreground">Diposting {{ formatDate(j.postedAt) }}</p>
          <div class="flex items-center gap-1">
            <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(j)">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(j.id)">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <UiEmptyState
      v-if="reqStore.jobOpenings.length === 0"
      :icon="Briefcase"
      title="Belum ada lowongan"
      description="Buat lowongan baru untuk dipublikasikan."
    />

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Lowongan' : 'Tambah Lowongan'"
      description="Isi detail lowongan untuk dipublikasikan ke kandidat."
      size="xl"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Judul Lowongan" required>
            <UiInput v-model="form.title" />
          </UiFormField>
          <UiFormField label="Departemen" required>
            <UiInput v-model="form.department" />
          </UiFormField>
          <UiFormField label="Lokasi" required>
            <UiInput v-model="form.location" placeholder="Jakarta (Hybrid)" />
          </UiFormField>
          <UiFormField label="Requisition Terkait">
            <UiSelect v-model="form.requisitionId" :options="requisitionOptions" />
          </UiFormField>
          <UiFormField label="Tipe Pekerjaan" required>
            <UiSelect v-model="form.employmentType" :options="employmentOptions" />
          </UiFormField>
          <UiFormField label="Skema Kerja" required>
            <UiSelect v-model="form.workArrangement" :options="arrangementOptions" />
          </UiFormField>
          <UiFormField label="Pengalaman Minimum (tahun)">
            <UiInput v-model.number="form.experienceMin" type="number" />
          </UiFormField>
          <UiFormField label="Pengalaman Maksimum (tahun)">
            <UiInput v-model.number="form.experienceMax" type="number" />
          </UiFormField>
          <UiFormField label="Gaji Minimum (Rp)">
            <UiInput v-model.number="form.salaryMin" type="number" />
          </UiFormField>
          <UiFormField label="Gaji Maksimum (Rp)">
            <UiInput v-model.number="form.salaryMax" type="number" />
          </UiFormField>
          <UiFormField label="Status">
            <UiSelect v-model="form.status" :options="statusOptions" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi Singkat" required hint="1-2 kalimat untuk teaser">
          <UiTextarea v-model="form.shortDescription" rows="2" />
        </UiFormField>
        <UiFormField label="Deskripsi Lengkap">
          <UiTextarea v-model="form.fullDescription" rows="4" />
        </UiFormField>
        <UiFormField label="Tanggung Jawab">
          <EmployeesStringListField v-model="form.responsibilities" />
        </UiFormField>
        <UiFormField label="Kualifikasi">
          <EmployeesStringListField v-model="form.qualifications" />
        </UiFormField>
        <UiFormField label="Benefit">
          <EmployeesStringListField v-model="form.benefits" placeholder="e.g. Asuransi keluarga" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Publikasi' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Lowongan?"
      message="Lowongan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
