<script setup lang="ts">
interface Props {
  label?: string
  required?: boolean
  hint?: string
  error?: string
}

defineProps<Props>()
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" class="block text-sm font-medium text-foreground">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-muted-foreground">{{ hint }}</p>
    <p v-if="error" class="text-xs text-destructive">{{ error }}</p>
  </div>
</template>
