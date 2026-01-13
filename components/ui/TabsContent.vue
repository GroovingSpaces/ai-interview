<script setup lang="ts">
import { inject, type Ref } from 'vue'
import { cn } from '~/lib/utils'

interface Props {
  value: string
  class?: string
}

const props = defineProps<Props>()

const currentValue = inject<Ref<string>>('tabs-value')
</script>

<template>
  <div
    v-show="currentValue?.value === value"
    :class="cn(
      'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'animate-fade-in',
      props.class
    )"
  >
    <slot />
  </div>
</template>

