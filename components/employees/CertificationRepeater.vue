<script setup lang="ts">
import { Plus, Trash2, Award } from 'lucide-vue-next'
import { emptyCertification, type CertificationItem } from '~/stores/employees'

const model = defineModel<CertificationItem[]>({ required: true })

function addItem() {
  model.value = [...model.value, emptyCertification()]
}
function removeItem(idx: number) {
  model.value = model.value.filter((_, i) => i !== idx)
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="model.length === 0" class="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <Award class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground">Belum ada sertifikasi.</p>
    </div>

    <div
      v-for="(item, idx) in model"
      :key="idx"
      class="glass-card p-4 space-y-3"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-sm font-medium text-foreground">
          <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {{ idx + 1 }}
          </span>
          <span>Sertifikasi</span>
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
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-muted-foreground mb-1">Nama Sertifikasi *</label>
          <UiInput v-model="item.name" placeholder="e.g. AWS Solutions Architect" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Penerbit *</label>
          <UiInput v-model="item.issuer" placeholder="e.g. Amazon Web Services" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">No. Kredensial</label>
          <UiInput v-model="item.credentialId" placeholder="ID / nomor sertifikat" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Terbit</label>
          <UiInput v-model="item.date" type="date" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Kadaluarsa</label>
          <UiInput v-model="item.expiryDate" type="date" />
        </div>
      </div>
    </div>

    <UiButton type="button" variant="outline" class="w-full" @click="addItem">
      <Plus class="w-4 h-4" />
      Tambah Sertifikasi
    </UiButton>
  </div>
</template>
