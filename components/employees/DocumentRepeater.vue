<script setup lang="ts">
import { Plus, Trash2, FileText, Upload, X } from 'lucide-vue-next'
import type { EmployeeDocument } from '~/stores/employees'
import { DOCUMENT_TYPE_OPTIONS, labelOf } from '~/composables/useEmployeeOptions'

const model = defineModel<EmployeeDocument[]>({ required: true })

function genId() {
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function addItem() {
  model.value = [
    ...model.value,
    {
      id: genId(),
      name: '',
      type: 'ktp',
      uploadedAt: new Date().toISOString().slice(0, 10),
    },
  ]
}

function removeItem(idx: number) {
  model.value = model.value.filter((_, i) => i !== idx)
}

async function onFileChange(idx: number, ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const next = [...model.value]
    next[idx] = {
      ...next[idx],
      fileName: file.name,
      fileData: reader.result as string,
    }
    if (!next[idx].name) next[idx].name = file.name
    model.value = next
  }
  reader.readAsDataURL(file)
}

function clearFile(idx: number) {
  const next = [...model.value]
  next[idx] = { ...next[idx], fileName: undefined, fileData: undefined }
  model.value = next
}

function typeLabel(type: string): string {
  return labelOf(DOCUMENT_TYPE_OPTIONS, type)
}

const documentTypeOptions = DOCUMENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
</script>

<template>
  <div class="space-y-4">
    <div v-if="model.length === 0" class="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <FileText class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground">Belum ada dokumen.</p>
      <p class="text-xs text-muted-foreground/80 mt-1">Lampirkan dokumen penting karyawan (KTP, NPWP, ijazah, dll).</p>
    </div>

    <div
      v-for="(item, idx) in model"
      :key="item.id"
      class="glass-card p-4 space-y-3"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-sm font-medium text-foreground">
          <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {{ idx + 1 }}
          </span>
          <span>{{ typeLabel(String(item.type)) }}</span>
        </div>
        <button
          type="button"
          class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          @click="removeItem(idx)"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tipe Dokumen *</label>
          <UiSelect v-model="item.type" :options="documentTypeOptions" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Nama Dokumen *</label>
          <UiInput v-model="item.name" placeholder="e.g. KTP Ahmad Rizki" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Nomor Dokumen</label>
          <UiInput v-model="item.documentNumber" placeholder="e.g. NIK / NPWP / No. BPJS" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Terbit</label>
          <UiInput v-model="item.issuedDate" type="date" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Kadaluarsa</label>
          <UiInput v-model="item.expiryDate" type="date" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Berkas</label>
          <div v-if="item.fileName" class="flex items-center justify-between rounded-xl border border-input bg-card/50 px-3 py-2 text-sm">
            <span class="truncate">{{ item.fileName }}</span>
            <button
              type="button"
              class="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              @click="clearFile(idx)"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
          <label
            v-else
            class="flex items-center gap-2 h-11 rounded-xl border border-dashed border-input bg-card/50 px-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground cursor-pointer transition-colors"
          >
            <Upload class="w-4 h-4" />
            <span>Pilih file (PDF / gambar)</span>
            <input
              type="file"
              class="hidden"
              accept="image/*,.pdf"
              @change="onFileChange(idx, $event)"
            >
          </label>
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-muted-foreground mb-1">Keterangan</label>
          <UiInput v-model="item.description" placeholder="Catatan / keterangan tambahan" />
        </div>
      </div>
    </div>

    <UiButton type="button" variant="outline" class="w-full" @click="addItem">
      <Plus class="w-4 h-4" />
      Tambah Dokumen
    </UiButton>
  </div>
</template>
