<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Crown, AlertTriangle } from 'lucide-vue-next'
import { useSuccessionStore, type KeyRole } from '~/stores/succession'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('keyRoles')
useHead({ title: () => title.value })

const successionStore = useSuccessionStore()
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  title: string
  department: string
  positionLevel: string
  riskLevel: KeyRole['riskLevel']
  currentHolderId: string
  description: string
}
const empty = (): FormState => ({
  title: '',
  department: '',
  positionLevel: '',
  riskLevel: 'medium',
  currentHolderId: '',
  description: '',
})
const form = ref<FormState>(empty())

const departmentOptions = computed(() => companyStore.departments.map((d) => ({ value: d.name, label: d.name })))
const positionLevelOptions = computed(() => companyStore.positionLevels.map((p) => ({ value: p.name, label: p.name })))
const employeeOptions = computed(() => [
  { value: '', label: '— Belum diisi —' },
  ...employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.position}` })),
])
const riskOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(
  () => form.value.title.trim() !== '' && form.value.department.trim() !== '' && form.value.positionLevel.trim() !== '',
)

function holderName(id?: string) {
  if (!id) return '— Vacant —'
  return employeesStore.getEmployeeById(id)?.name ?? '-'
}
function riskTone(r: string): 'good' | 'low' | 'average' | 'warning' | 'muted' {
  if (r === 'low') return 'good'
  if (r === 'medium') return 'average'
  if (r === 'high') return 'warning'
  if (r === 'critical') return 'low'
  return 'muted'
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(r: KeyRole) {
  editingId.value = r.id
  form.value = {
    title: r.title,
    department: r.department,
    positionLevel: r.positionLevel,
    riskLevel: r.riskLevel,
    currentHolderId: r.currentHolderId ?? '',
    description: r.description ?? '',
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    title: form.value.title,
    department: form.value.department,
    positionLevel: form.value.positionLevel,
    riskLevel: form.value.riskLevel,
    currentHolderId: form.value.currentHolderId || undefined,
    description: form.value.description || undefined,
  }
  if (isEdit.value && editingId.value) {
    successionStore.updateKeyRole(editingId.value, payload)
  } else {
    successionStore.addKeyRole(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) successionStore.deleteKeyRole(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Daftar posisi kunci yang harus selalu memiliki successor.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Key Role Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="r in successionStore.keyRoles" :key="r.id" class="glass-card p-5">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Crown class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-foreground truncate">{{ r.title }}</p>
              <p class="text-xs text-muted-foreground">{{ r.department }} • {{ r.positionLevel }}</p>
            </div>
          </div>
          <UiStatusBadge :label="`Risk: ${r.riskLevel}`" :tone="riskTone(r.riskLevel)" />
        </div>
        <p class="text-sm text-muted-foreground mt-3">{{ r.description ?? 'Tidak ada deskripsi' }}</p>
        <div class="mt-4 pt-3 border-t border-border flex items-center justify-between">
          <div>
            <p class="text-xs text-muted-foreground">Pemegang saat ini</p>
            <p class="text-sm font-medium text-foreground">{{ holderName(r.currentHolderId) }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(r)">
              <Pencil class="w-4 h-4" />
            </button>
            <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(r.id)">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <UiEmptyState
      v-if="successionStore.keyRoles.length === 0"
      :icon="Crown"
      title="Belum ada key role"
      description="Tetapkan posisi kunci yang butuh succession plan."
    />

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Key Role' : 'Tambah Key Role'"
      description="Definisikan posisi kunci dan level risiko jika kosong."
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Nama Posisi" required>
          <UiInput v-model="form.title" placeholder="e.g. Head of Engineering" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Departemen" required>
            <UiSelect v-model="form.department" :options="departmentOptions" />
          </UiFormField>
          <UiFormField label="Jenjang Jabatan" required>
            <UiSelect v-model="form.positionLevel" :options="positionLevelOptions" />
          </UiFormField>
          <UiFormField label="Risk Level" required hint="Risiko jika posisi ini kosong">
            <UiSelect v-model="form.riskLevel" :options="riskOptions" />
          </UiFormField>
          <UiFormField label="Pemegang Saat Ini">
            <UiSelect v-model="form.currentHolderId" :options="employeeOptions" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi Peran">
          <UiTextarea v-model="form.description" rows="3" placeholder="Tanggung jawab utama posisi" />
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
      title="Hapus Key Role?"
      message="Successor di posisi ini juga ikut terhapus."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
