<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Search, BookOpen } from 'lucide-vue-next'
import { useLmsStore, type LearningModule } from '~/stores/lms'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('courseCatalog')
useHead({ title: () => title.value })

const lmsStore = useLmsStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)
const search = ref('')
const categoryFilter = ref<string>('all')
const difficultyFilter = ref<string>('all')

interface FormState {
  title: string
  description: string
  category: string
  duration: number | undefined
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string
}
const empty = (): FormState => ({
  title: '',
  description: '',
  category: '',
  duration: undefined,
  difficulty: 'beginner',
  icon: '📚',
})
const form = ref<FormState>(empty())

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]
const difficultyFilterOptions = [{ value: 'all', label: 'Semua Level' }, ...difficultyOptions]

const categoryOptions = computed(() => {
  const set = new Set(lmsStore.modules.map((m) => m.category))
  return [{ value: 'all', label: 'Semua Kategori' }, ...Array.from(set).map((c) => ({ value: c, label: c }))]
})

const filtered = computed(() =>
  lmsStore.modules.filter((m) => {
    if (search.value && !m.title.toLowerCase().includes(search.value.toLowerCase()) && !m.description.toLowerCase().includes(search.value.toLowerCase())) return false
    if (categoryFilter.value !== 'all' && m.category !== categoryFilter.value) return false
    if (difficultyFilter.value !== 'all' && m.difficulty !== difficultyFilter.value) return false
    return true
  }),
)

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(() => form.value.title.trim() !== '' && form.value.category.trim() !== '')

function difficultyTone(d: string): 'good' | 'average' | 'low' {
  if (d === 'beginner') return 'good'
  if (d === 'intermediate') return 'average'
  return 'low'
}

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(m: LearningModule) {
  editingId.value = m.id
  form.value = {
    title: m.title,
    description: m.description,
    category: m.category,
    duration: m.duration,
    difficulty: m.difficulty,
    icon: m.icon,
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    title: form.value.title,
    description: form.value.description,
    category: form.value.category,
    duration: Number(form.value.duration) || 0,
    difficulty: form.value.difficulty,
    icon: form.value.icon,
    progress: 0,
    completed: false,
    locked: false,
    lessons: [],
  }
  if (isEdit.value && editingId.value) {
    lmsStore.updateModule(editingId.value, payload)
  } else {
    lmsStore.addModule(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) lmsStore.deleteModule(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Katalog modul learning yang tersedia di organisasi.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Modul Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput v-model="search" placeholder="Cari judul atau deskripsi..." class="pl-9" />
      </div>
      <UiSelect v-model="categoryFilter" :options="categoryOptions" />
      <UiSelect v-model="difficultyFilter" :options="difficultyFilterOptions" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="m in filtered" :key="m.id" class="glass-card p-5 flex flex-col">
        <div class="flex items-start justify-between gap-2">
          <div class="text-3xl">{{ m.icon || '📚' }}</div>
          <UiStatusBadge :label="m.difficulty" :tone="difficultyTone(m.difficulty)" />
        </div>
        <h3 class="font-semibold text-foreground mt-3">{{ m.title }}</h3>
        <p class="text-sm text-muted-foreground line-clamp-2 mt-1">{{ m.description }}</p>
        <div class="flex items-center gap-3 text-xs text-muted-foreground mt-3">
          <span>{{ m.category }}</span>
          <span>•</span>
          <span>{{ m.duration }} menit</span>
          <span>•</span>
          <span>{{ m.lessons.length }} lesson</span>
        </div>
        <div class="flex justify-end gap-1 mt-4 pt-3 border-t border-border">
          <NuxtLink :to="`/learning/course-catalog/${m.id}`">
            <UiButton variant="outline" size="sm">
              Lihat Detail
            </UiButton>
          </NuxtLink>
          <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(m)">
            <Pencil class="w-4 h-4" />
          </button>
          <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(m.id)">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    <UiEmptyState
      v-if="filtered.length === 0"
      :icon="BookOpen"
      title="Tidak ada modul"
      description="Tambah modul baru atau ubah filter."
    />

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Modul' : 'Tambah Modul'"
      description="Lengkapi informasi modul learning."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Judul Modul" required>
            <UiInput v-model="form.title" placeholder="e.g. Cloud Fundamentals" />
          </UiFormField>
          <UiFormField label="Kategori" required>
            <UiInput v-model="form.category" placeholder="e.g. Technology" />
          </UiFormField>
          <UiFormField label="Durasi (menit)">
            <UiInput v-model.number="form.duration" type="number" />
          </UiFormField>
          <UiFormField label="Level">
            <UiSelect v-model="form.difficulty" :options="difficultyOptions" />
          </UiFormField>
          <UiFormField label="Icon (emoji)">
            <UiInput v-model="form.icon" placeholder="📚" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi">
          <UiTextarea v-model="form.description" rows="3" placeholder="Ringkasan modul" />
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
      title="Hapus Modul?"
      message="Modul akan dihapus dari katalog."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
