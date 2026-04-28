<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Props {
  title?: string
  description?: string
  icon?: Component
}

withDefaults(defineProps<Props>(), {
  title: 'Belum ada data',
  description: 'Tambahkan data pertama untuk memulai.',
  icon: Inbox,
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
      <component :is="icon" class="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 class="text-lg font-medium text-foreground mb-1">{{ title }}</h3>
    <p class="text-sm text-muted-foreground max-w-md">{{ description }}</p>
    <div class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
