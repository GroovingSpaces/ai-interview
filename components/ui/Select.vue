<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
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
const dropdownStyle = ref<Record<string, string>>({})

const selectedLabel = computed(() => {
  const option = props.options.find(o => o.value === props.modelValue)
  return option?.label ?? props.placeholder
})

function updateDropdownPosition() {
  if (!selectRef.value) return
  const rect = selectRef.value.getBoundingClientRect()
  const GAP = 8
  const MAX_H = 240
  const spaceBelow = window.innerHeight - rect.bottom - GAP
  const spaceAbove = rect.top - GAP

  if (spaceBelow >= Math.min(MAX_H, spaceAbove)) {
    dropdownStyle.value = {
      top: `${rect.bottom + GAP}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      maxHeight: `${Math.min(MAX_H, spaceBelow)}px`,
    }
  } else {
    dropdownStyle.value = {
      bottom: `${window.innerHeight - rect.top + GAP}px`,
      top: 'auto',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      maxHeight: `${Math.min(MAX_H, spaceAbove)}px`,
    }
  }
}

async function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    updateDropdownPosition()
  }
}

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
  window.addEventListener('scroll', updateDropdownPosition, true)
  window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updateDropdownPosition, true)
  window.removeEventListener('resize', updateDropdownPosition)
})
</script>

<template>
  <div ref="selectRef" class="relative">
    <button
      type="button"
      :disabled="disabled"
      :class="cn(
        'flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card/50 px-4 py-2 text-sm transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-muted-foreground/20 focus-visible:border-muted-foreground/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'backdrop-blur-sm',
        isOpen && 'ring-2 ring-muted-foreground/15 border-muted-foreground/30',
        !modelValue && 'text-muted-foreground',
        props.class
      )"
      @click="toggleOpen"
    >
      <span>{{ selectedLabel }}</span>
      <ChevronDown
        class="h-4 w-4 opacity-50 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <Teleport to="body">
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
          :style="dropdownStyle"
          class="fixed z-[9999] overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg backdrop-blur-xl"
        >
          <button
            v-for="option in options"
            :key="option.value"
            type="button"
            :class="cn(
              'relative flex w-full cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm outline-none transition-colors',
              'hover:bg-muted/80 hover:text-foreground',
              option.value === modelValue && 'bg-muted font-medium text-foreground'
            )"
            @click="handleSelect(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
