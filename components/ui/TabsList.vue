<script setup lang="ts">
import { cn } from '~/lib/utils'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div
    :class="cn(
      'inline-flex h-11 items-center justify-center rounded-xl bg-muted/50 p-1 text-muted-foreground backdrop-blur-sm',
      props.class
    )"
  >
    <slot />
  </div>
</template>

