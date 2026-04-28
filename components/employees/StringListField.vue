<script setup lang="ts">
import { Plus, X } from 'lucide-vue-next'

const model = defineModel<string[]>({ required: true })

interface Props {
  placeholder?: string
}
withDefaults(defineProps<Props>(), { placeholder: 'Tambah item' })

function addItem() {
  model.value = [...model.value, '']
}
function removeItem(i: number) {
  model.value = model.value.filter((_, idx) => idx !== i)
}
</script>

<template>
  <div class="space-y-2">
    <div v-for="(_, i) in model" :key="i" class="flex items-center gap-2">
      <UiInput v-model="model[i]" :placeholder="placeholder" />
      <button type="button" class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" @click="removeItem(i)">
        <X class="w-4 h-4" />
      </button>
    </div>
    <UiButton type="button" variant="outline" size="sm" @click="addItem">
      <Plus class="w-3.5 h-3.5" />
      Tambah Baris
    </UiButton>
  </div>
</template>
