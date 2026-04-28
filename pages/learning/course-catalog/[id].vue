<script setup lang="ts">
import { computed } from 'vue'
import { ArrowLeft, PlayCircle } from 'lucide-vue-next'
import { useLmsStore } from '~/stores/lms'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const lmsStore = useLmsStore()

const moduleId = computed(() => String(route.params.id ?? ''))
const course = computed(() => lmsStore.getModuleById(moduleId.value))
const firstVideoLesson = computed(() =>
  course.value?.lessons.find((lesson) => lesson.type === 'video') ?? course.value?.lessons[0],
)

const pageTitle = computed(() =>
  course.value ? `${course.value.title} - Course Detail` : 'Course Detail',
)
useHead({ title: () => pageTitle.value })

const videoUrl = computed(() => {
  if (!firstVideoLesson.value) return ''
  return 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ course?.title || 'Course tidak ditemukan' }}</h1>
        <p class="text-muted-foreground mt-1">
          {{ course?.description || 'Modul yang kamu cari tidak tersedia di katalog.' }}
        </p>
      </div>
      <NuxtLink to="/learning/course-catalog">
        <UiButton variant="outline">
          <ArrowLeft class="w-4 h-4" />
          Kembali ke Catalog
        </UiButton>
      </NuxtLink>
    </div>

    <div v-if="course" class="rounded-xl border border-border bg-card p-4 md:p-6 space-y-4">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <PlayCircle class="w-4 h-4" />
        <span>Video pembelajaran</span>
        <span v-if="firstVideoLesson">- {{ firstVideoLesson.title }}</span>
      </div>

      <video
        v-if="videoUrl"
        class="w-full rounded-xl border border-border bg-black"
        controls
        preload="metadata"
      >
        <source :src="videoUrl" type="video/mp4">
        Browser Anda tidak mendukung pemutaran video.
      </video>

      <UiEmptyState
        v-else
        :icon="PlayCircle"
        title="Video belum tersedia"
        description="Belum ada lesson video pada course ini."
      />
    </div>
  </div>
</template>
