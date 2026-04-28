<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('myTasks')
useHead({ title: () => title.value })

const authStore = useAuthStore()
const meId = computed(() => authStore.user?.id ?? '1')
</script>

<template>
  <TasksTaskWorkspace
    :title="title"
    subtitle="Daftar task yang ditugaskan ke Anda — kelola progress, submit evidence, dan komentar."
    :assignee-filter="meId"
    default-view="list"
  />
</template>
