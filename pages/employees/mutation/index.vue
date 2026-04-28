<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
})

const { title } = usePageTitle('mutation')
useHead({ title: () => title.value })
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
    <div class="rounded-xl border border-border bg-card p-6 text-muted-foreground">
      Blank page - Employee Mutation
    </div>
  </div>
</template>
