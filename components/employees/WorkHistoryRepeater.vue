<script setup lang="ts">
import { Plus, Trash2, Briefcase } from 'lucide-vue-next'
import { emptyWorkHistory, type WorkHistoryItem } from '~/stores/employees'

const model = defineModel<WorkHistoryItem[]>({ required: true })

function addItem() {
  model.value = [...model.value, emptyWorkHistory()]
}
function removeItem(idx: number) {
  model.value = model.value.filter((_, i) => i !== idx)
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="model.length === 0" class="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <Briefcase class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground">Belum ada riwayat pekerjaan.</p>
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
          <span>Pengalaman Kerja</span>
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
          <label class="block text-xs font-medium text-muted-foreground mb-1">Perusahaan *</label>
          <UiInput v-model="item.company" placeholder="Nama perusahaan" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Posisi *</label>
          <UiInput v-model="item.position" placeholder="Jabatan / posisi" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Mulai</label>
          <UiInput v-model="item.startDate" type="date" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Selesai</label>
          <UiInput v-model="item.endDate" type="date" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-muted-foreground mb-1">Deskripsi Pekerjaan</label>
          <textarea
            v-model="item.description"
            rows="2"
            class="flex w-full rounded-xl border border-input bg-card/50 px-4 py-2 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary backdrop-blur-sm"
            placeholder="Deskripsi singkat tanggung jawab"
          />
        </div>
      </div>
    </div>

    <UiButton type="button" variant="outline" class="w-full" @click="addItem">
      <Plus class="w-4 h-4" />
      Tambah Riwayat Pekerjaan
    </UiButton>
  </div>
</template>
