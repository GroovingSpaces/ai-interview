<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Heart } from 'lucide-vue-next'
import { useCompensationStore, type BenefitItem } from '~/stores/compensation'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('benefits')
useHead({ title: () => title.value })

const compStore = useCompensationStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  name: string
  category: BenefitItem['category']
  description: string
  amount: number | undefined
  recurrence: BenefitItem['recurrence']
  eligibleRoles: string[]
  active: boolean
}
const empty = (): FormState => ({
  name: '',
  category: 'Lainnya',
  description: '',
  amount: undefined,
  recurrence: 'monthly',
  eligibleRoles: [],
  active: true,
})
const form = ref<FormState>(empty())

const categoryOptions: { value: BenefitItem['category']; label: string }[] = [
  { value: 'Kesehatan', label: 'Kesehatan' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Meal', label: 'Meal / Makan' },
  { value: 'Komunikasi', label: 'Komunikasi' },
  { value: 'Asuransi', label: 'Asuransi' },
  { value: 'Lainnya', label: 'Lainnya' },
]
const recurrenceOptions = [
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' },
  { value: 'one_time', label: 'Sekali (one-time)' },
]
const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'staff', label: 'Staff' },
  { value: 'c_level', label: 'C-Level' },
]

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(() => form.value.name.trim() !== '' && (form.value.amount ?? 0) > 0)

function recurrenceLabel(r: string) {
  return recurrenceOptions.find((o) => o.value === r)?.label ?? r
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(b: BenefitItem) {
  editingId.value = b.id
  form.value = {
    name: b.name,
    category: b.category,
    description: b.description ?? '',
    amount: b.amount,
    recurrence: b.recurrence,
    eligibleRoles: [...b.eligibleRoles],
    active: b.active,
  }
  showForm.value = true
}
function toggleRole(value: string) {
  const i = form.value.eligibleRoles.indexOf(value)
  if (i === -1) form.value.eligibleRoles.push(value)
  else form.value.eligibleRoles.splice(i, 1)
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    name: form.value.name,
    category: form.value.category,
    description: form.value.description || undefined,
    amount: Number(form.value.amount) || 0,
    recurrence: form.value.recurrence,
    eligibleRoles: form.value.eligibleRoles,
    active: form.value.active,
  }
  if (isEdit.value && editingId.value) {
    compStore.updateBenefit(editingId.value, payload)
  } else {
    compStore.addBenefit(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) compStore.deleteBenefit(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Kelola katalog benefit & tunjangan yang tersedia.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Tambah Benefit
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="b in compStore.benefits" :key="b.id" class="glass-card p-5">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Heart class="w-5 h-5" />
            </div>
            <div class="min-w-0">
              <p class="font-semibold text-foreground truncate">{{ b.name }}</p>
              <p class="text-xs text-muted-foreground">{{ b.category }} • {{ recurrenceLabel(b.recurrence) }}</p>
            </div>
          </div>
          <UiStatusBadge :label="b.active ? 'Aktif' : 'Nonaktif'" :tone="b.active ? 'good' : 'muted'" />
        </div>
        <p class="text-2xl font-bold text-foreground mt-4">Rp {{ b.amount.toLocaleString('id-ID') }}</p>
        <p v-if="b.description" class="text-sm text-muted-foreground mt-1">{{ b.description }}</p>
        <div v-if="b.eligibleRoles.length" class="mt-3 flex flex-wrap gap-1">
          <span v-for="r in b.eligibleRoles" :key="r" class="px-2 py-0.5 rounded-md bg-muted/50 text-xs">{{ r }}</span>
        </div>
        <p v-else class="text-xs text-muted-foreground mt-3">Berlaku untuk semua karyawan</p>
        <div class="flex justify-end gap-1 mt-3">
          <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(b)">
            <Pencil class="w-4 h-4" />
          </button>
          <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(b.id)">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Benefit' : 'Tambah Benefit'"
      description="Definisikan benefit yang dapat diberikan kepada karyawan."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Nama Benefit" required>
            <UiInput v-model="form.name" placeholder="e.g. Asuransi Kesehatan" />
          </UiFormField>
          <UiFormField label="Kategori" required>
            <UiSelect v-model="form.category" :options="categoryOptions" />
          </UiFormField>
          <UiFormField label="Nominal (Rp)" required>
            <UiInput v-model.number="form.amount" type="number" placeholder="0" />
          </UiFormField>
          <UiFormField label="Rekurensi" required>
            <UiSelect v-model="form.recurrence" :options="recurrenceOptions" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi">
          <UiTextarea v-model="form.description" rows="2" placeholder="Penjelasan singkat" />
        </UiFormField>
        <UiFormField label="Berlaku untuk Role" hint="Kosongkan untuk semua karyawan">
          <div class="flex flex-wrap gap-2">
            <label v-for="r in roleOptions" :key="r.value" class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border cursor-pointer text-sm">
              <input type="checkbox" :checked="form.eligibleRoles.includes(r.value)" class="accent-primary" @change="toggleRole(r.value)" >
              {{ r.label }}
            </label>
          </div>
        </UiFormField>
        <UiFormField label="Status">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.active" class="w-4 h-4 accent-primary" >
            Aktif (dapat diklaim karyawan)
          </label>
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
      title="Hapus Benefit?"
      message="Benefit akan dihapus dari katalog."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
