<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function close() {
  emit('update:open', false)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        @click.self="close"
      >
        <div :class="['w-full rounded-2xl border border-border bg-card shadow-2xl', sizeClasses[size]]">
          <div v-if="title || description" class="flex items-start justify-between gap-3 p-6 border-b border-border">
            <div class="min-w-0">
              <h3 v-if="title" class="text-lg font-semibold text-foreground">{{ title }}</h3>
              <p v-if="description" class="text-sm text-muted-foreground mt-1">{{ description }}</p>
            </div>
            <button
              type="button"
              class="p-1 rounded-md text-muted-foreground hover:text-foreground shrink-0"
              @click="close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6 max-h-[70vh] overflow-y-auto">
            <slot />
          </div>
          <div v-if="$slots.footer" class="flex justify-end gap-2 p-6 border-t border-border">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
