<script setup lang="ts">
import { AlertTriangle, X } from 'lucide-vue-next'

interface Props {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Konfirmasi',
  message: 'Apakah Anda yakin?',
  confirmText: 'Ya, Lanjutkan',
  cancelText: 'Batal',
  variant: 'destructive',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:open': [value: boolean]
}>()

function handleCancel() {
  emit('cancel')
  emit('update:open', false)
}
function handleConfirm() {
  emit('confirm')
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
        @click.self="handleCancel"
      >
        <div class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
          <div class="flex items-start gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                variant === 'destructive' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
              ]"
            >
              <AlertTriangle class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-foreground">{{ title }}</h3>
              <p class="text-sm text-muted-foreground mt-1">{{ message }}</p>
            </div>
            <button
              type="button"
              class="p-1 rounded-md text-muted-foreground hover:text-foreground"
              @click="handleCancel"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <UiButton variant="outline" @click="handleCancel">{{ cancelText }}</UiButton>
            <UiButton :variant="variant === 'destructive' ? 'destructive' : 'default'" @click="handleConfirm">
              {{ confirmText }}
            </UiButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
