<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cn } from '~/lib/utils'
import { ChevronDown } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const option = props.options.find(o => o.value === props.modelValue)
  return option?.label ?? props.placeholder
})

function handleSelect(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="selectRef" class="relative">
    <button
      type="button"
      :disabled="disabled"
      :class="cn(
        'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card/50 px-4 py-2 text-sm transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'backdrop-blur-sm',
        !modelValue && 'text-muted-foreground',
        props.class
      )"
      @click="isOpen = !isOpen"
    >
      <span>{{ selectedLabel }}</span>
      <ChevronDown
        class="h-4 w-4 opacity-50 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="isOpen"
        class="absolute z-50 mt-2 w-full rounded-xl border border-border bg-popover p-1 shadow-lg backdrop-blur-xl"
      >
        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          :class="cn(
            'relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors',
            'hover:bg-accent/10 hover:text-accent-foreground',
            option.value === modelValue && 'bg-primary/10 text-primary'
          )"
          @click="handleSelect(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
  </div>
</template>
