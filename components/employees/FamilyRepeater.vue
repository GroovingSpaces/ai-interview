<script setup lang="ts">
import { Plus, Trash2, Users } from 'lucide-vue-next'
import { emptyFamily, type FamilyMember } from '~/stores/employees'
import { RELATIONSHIP_OPTIONS, GENDER_OPTIONS } from '~/composables/useEmployeeOptions'

const model = defineModel<FamilyMember[]>({ required: true })

const relationshipOptions = RELATIONSHIP_OPTIONS.map((o) => ({ value: o.value, label: o.label }))
const genderOptions = GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

function addItem() {
  model.value = [...model.value, emptyFamily()]
}

function removeItem(idx: number) {
  model.value = model.value.filter((_, i) => i !== idx)
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="model.length === 0" class="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <Users class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <p class="text-sm text-muted-foreground">Belum ada data keluarga.</p>
      <p class="text-xs text-muted-foreground/80 mt-1">Tambahkan anggota keluarga atau kontak darurat.</p>
    </div>

    <div
      v-for="(item, idx) in model"
      :key="idx"
      class="glass-card p-4 space-y-3 relative"
    >
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-sm font-medium text-foreground">
          <span class="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {{ idx + 1 }}
          </span>
          <span>Anggota Keluarga</span>
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
          <label class="block text-xs font-medium text-muted-foreground mb-1">Hubungan *</label>
          <UiSelect v-model="item.relationship" :options="relationshipOptions" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Nama *</label>
          <UiInput v-model="item.name" placeholder="Nama lengkap" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Jenis Kelamin</label>
          <UiSelect v-model="item.gender" :options="genderOptions" placeholder="Pilih" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Tanggal Lahir</label>
          <UiInput v-model="item.dateOfBirth" type="date" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">Pekerjaan</label>
          <UiInput v-model="item.occupation" placeholder="Pekerjaan" />
        </div>
        <div>
          <label class="block text-xs font-medium text-muted-foreground mb-1">No. Telepon</label>
          <UiInput v-model="item.phone" placeholder="+62..." />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-muted-foreground mb-1">Alamat</label>
          <UiInput v-model="item.address" placeholder="Alamat" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-xs font-medium text-muted-foreground mb-1">Catatan</label>
          <UiInput v-model="item.notes" placeholder="Catatan tambahan" />
        </div>
      </div>
    </div>

    <UiButton type="button" variant="outline" class="w-full" @click="addItem">
      <Plus class="w-4 h-4" />
      Tambah Anggota Keluarga
    </UiButton>
  </div>
</template>
