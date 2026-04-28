<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'

interface Props {
  title: string
  subtitle?: string
  backTo?: string
}

const props = defineProps<Props>()
const router = useRouter()

function goBack() {
  if (props.backTo) router.push(props.backTo)
  else router.back()
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
    <div class="flex items-start gap-3 min-w-0">
      <button
        v-if="backTo"
        type="button"
        class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground shrink-0"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-foreground truncate">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-muted-foreground">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
