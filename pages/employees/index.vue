<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
})

onMounted(() => {
  navigateTo('/employees/database', { replace: true })
})
</script>

<template>
  <div class="flex items-center justify-center min-h-[40vh]">
    <p class="text-muted-foreground">Redirecting to Employee Database...</p>
  </div>
</template>
