<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { cn } from '~/lib/utils'

interface Props {
  value: string
  class?: string
}

const props = defineProps<Props>()

const currentValue = inject<Ref<string>>('tabs-value')

function handleClick() {
  if (currentValue) {
    currentValue.value = props.value
  }
}
</script>

<template>
  <button
    type="button"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      currentValue?.value === value
        ? 'bg-background text-foreground shadow-sm'
        : 'hover:text-foreground',
      props.class
    )"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

