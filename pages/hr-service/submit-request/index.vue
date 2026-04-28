<script setup lang="ts">
import { ref, computed } from 'vue'
import { Send, Upload, X, CheckCircle2, ClipboardList } from 'lucide-vue-next'
import { useHrServiceStore, type TicketCategory, type TicketPriority } from '~/stores/hr-service'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('submitRequest')
useHead({ title: () => title.value })

const hrStore = useHrServiceStore()
const authStore = useAuthStore()

interface FormState {
  subject: string
  category: TicketCategory
  priority: TicketPriority
  description: string
  attachmentName: string
  attachmentData: string
}
const empty = (): FormState => ({
  subject: '',
  category: 'other',
  priority: 'medium',
  description: '',
  attachmentName: '',
  attachmentData: '',
})
const form = ref<FormState>(empty())
const submittedNumber = ref<string | null>(null)

const categoryOptions = (Object.keys(hrStore.categoryLabels) as TicketCategory[]).map((k) => ({
  value: k,
  label: hrStore.categoryLabels[k],
}))
const priorityOptions = (Object.keys(hrStore.priorityLabels) as TicketPriority[]).map((k) => ({
  value: k,
  label: hrStore.priorityLabels[k],
}))

const isValid = computed(() => form.value.subject.trim() !== '' && form.value.description.trim() !== '')

function uploadFile(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.value.attachmentName = file.name
    form.value.attachmentData = reader.result as string
  }
  reader.readAsDataURL(file)
}
function clearFile() {
  form.value.attachmentName = ''
  form.value.attachmentData = ''
}
function handleSubmit() {
  if (!isValid.value) return
  const id = hrStore.addTicket({
    subject: form.value.subject,
    category: form.value.category,
    priority: form.value.priority,
    status: 'open',
    description: form.value.description,
    attachmentName: form.value.attachmentName || undefined,
    attachmentData: form.value.attachmentData || undefined,
    requesterId: authStore.user?.id ?? '1',
    requesterName: authStore.user?.name ?? 'Karyawan',
  })
  const t = hrStore.getTicketById(id)
  submittedNumber.value = t?.ticketNumber ?? null
  form.value = empty()
}
function newRequest() {
  submittedNumber.value = null
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Ajukan tiket ke HR untuk berbagai kebutuhan." />

    <div v-if="submittedNumber" class="glass-card p-8 text-center max-w-xl mx-auto">
      <CheckCircle2 class="w-16 h-16 mx-auto text-score-good mb-3" />
      <h3 class="text-xl font-bold text-foreground">Tiket Berhasil Dibuat</h3>
      <p class="text-sm text-muted-foreground mt-1">Nomor tiket Anda:</p>
      <p class="text-2xl font-mono text-primary mt-2">{{ submittedNumber }}</p>
      <p class="text-sm text-muted-foreground mt-4">Tim HR akan menindaklanjuti tiket Anda dalam 1-2 hari kerja.</p>
      <UiButton variant="gradient" class="mt-6" @click="newRequest">
        <ClipboardList class="w-4 h-4" />
        Buat Tiket Baru
      </UiButton>
    </div>

    <form v-else class="space-y-6 max-w-3xl" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Kategori" required>
            <UiSelect v-model="form.category" :options="categoryOptions" />
          </UiFormField>
          <UiFormField label="Prioritas" required>
            <UiSelect v-model="form.priority" :options="priorityOptions" />
          </UiFormField>
        </div>
        <UiFormField label="Subject" required hint="Ringkas permintaan dalam 1 kalimat.">
          <UiInput v-model="form.subject" placeholder="e.g. Permintaan surat keterangan kerja" />
        </UiFormField>
        <UiFormField label="Deskripsi" required hint="Jelaskan permintaan Anda detail termasuk konteks dan urgensi.">
          <UiTextarea v-model="form.description" rows="6" placeholder="Tuliskan detail permintaan Anda" />
        </UiFormField>
        <UiFormField label="Lampiran (opsional)" hint="PDF atau gambar untuk mendukung permintaan.">
          <div v-if="form.attachmentName" class="flex items-center justify-between rounded-xl border border-input bg-card/50 px-3 py-2 text-sm">
            <span class="truncate">{{ form.attachmentName }}</span>
            <button type="button" class="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="clearFile">
              <X class="w-4 h-4" />
            </button>
          </div>
          <label v-else class="flex items-center gap-2 h-11 rounded-xl border border-dashed border-input bg-card/50 px-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground cursor-pointer">
            <Upload class="w-4 h-4" />
            <span>Pilih file</span>
            <input type="file" class="hidden" accept="image/*,.pdf" @change="uploadFile" >
          </label>
        </UiFormField>
      </div>
      <div class="flex justify-end">
        <UiButton type="submit" variant="gradient" :disabled="!isValid">
          <Send class="w-4 h-4" />
          Kirim Permintaan
        </UiButton>
      </div>
    </form>
  </div>
</template>
