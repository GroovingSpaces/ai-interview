<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :class="cn(
      'flex h-11 w-full rounded-xl border border-input bg-card/50 px-4 py-2 text-sm transition-all duration-200',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'backdrop-blur-sm',
      props.class
    )"
    @input="handleInput"
  >
</template>

