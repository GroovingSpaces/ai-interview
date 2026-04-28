<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('assignTask')
useHead({ title: () => title.value })
</script>

<template>
  <TasksTaskWorkspace
    :title="title"
    subtitle="Kelola seluruh task tim — list & board view, subtasks, checklist, komentar, attachment."
    default-view="board"
  />
</template>
