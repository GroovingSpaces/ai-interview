<script setup lang="ts">
import { Plus, Trash2, GraduationCap } from 'lucide-vue-next'
import { emptyEducation, type EducationItem } from '~/stores/employees'

const model = defineModel<EducationItem[]>({ required: true })

const degreeOptions = [
  { value: 'SD', label: 'SD' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SMA/SMK', label: 'SMA / SMK' },
  { value: 'D3', label: 'D3 (Diploma)' },
  { value: 'D4', label: 'D4 (Sarjana Terapan)' },
  { value: 'S1', label: 'S1 (Sarjana)' },
  { value: 'S2', label: 'S2 (Magister)' },
  { value: 'S3', label: 'S3 (Doktor)' },
]

function addItem() {
  model.value = [...model.value, emptyEducation()]
}
function removeItem(idx: number) {
  model.value = model.value.filter((_, i) => i !== idx)
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="model.length === 0" class="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <GraduationCap class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground">Belum ada riwayat pendidikan.</p>
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
          <span>Pendidikan</span>
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
          <label class="block text-xs font-medium text-muted-foreground mb-1">Institusi *</label>
          <UiInput v-model="item.institution" placeholder="Nama sekolah / kampus" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Jenjang *</label>
          <UiSelect v-model="item.degree" :options="degreeOptions" placeholder="Pilih jenjang" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Bidang / Jurusan</label>
          <UiInput v-model="item.fieldOfStudy" placeholder="e.g. Teknik Informatika" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tahun Mulai</label>
          <UiInput v-model="item.startYear" placeholder="2008" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tahun Selesai</label>
          <UiInput v-model="item.endYear" placeholder="2012" />
        </div>
      </div>
    </div>

    <UiButton type="button" variant="outline" class="w-full" @click="addItem">
      <Plus class="w-4 h-4" />
      Tambah Riwayat Pendidikan
    </UiButton>
  </div>
</template>
