<script setup lang="ts">
import { ref } from 'vue'
import { useApplicationStore } from '~/stores/application'
import { cn } from '~/lib/utils'
import {
  Upload,
  FileText,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-vue-next'

const applicationStore = useApplicationStore()
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    handleFile(files[0])
  }
}

function handleFile(file: File) {
  const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  
  if (!validTypes.includes(file.type)) {
    alert('Please upload a PDF or Word document')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB')
    return
  }

  applicationStore.uploadResume(file)
}

function openFileDialog() {
  fileInputRef.value?.click()
}

function resetUpload() {
  applicationStore.reset()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Upload area -->
    <div
      v-if="applicationStore.status === 'idle'"
      :class="cn(
        'relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-muted/30',
      )"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @click="openFileDialog"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,.doc,.docx"
        class="hidden"
        @change="handleFileSelect"
      >

      <div class="text-center space-y-4">
        <div
          :class="cn(
            'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300',
            isDragging
              ? 'bg-primary/20 scale-110'
              : 'bg-gradient-to-br from-primary/10 to-accent/10',
          )"
        >
          <Upload
            :class="cn(
              'w-10 h-10 transition-all duration-300',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )"
          />
        </div>

        <div class="space-y-2">
          <h3 class="text-xl font-semibold text-foreground">
            {{ isDragging ? 'Drop your CV here' : 'Upload your CV' }}
          </h3>
          <p class="text-muted-foreground">
            Drag and drop your resume or <span class="text-primary font-medium">browse</span>
          </p>
          <p class="text-sm text-muted-foreground">
            Supports PDF, DOC, DOCX (Max 10MB)
          </p>
        </div>
      </div>

      <!-- AI badge -->
      <div class="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-ai-purple/10 border border-ai-purple/30">
        <Sparkles class="w-4 h-4 text-ai-purple" />
        <span class="text-sm font-medium text-ai-purple">AI-Powered Analysis</span>
      </div>
    </div>

    <!-- Processing state -->
    <div
      v-else-if="applicationStore.isProcessing"
      class="glass-card p-8 text-center space-y-6"
    >
      <div class="relative w-24 h-24 mx-auto">
        <!-- Spinning ring -->
        <div class="absolute inset-0 rounded-full border-4 border-muted/30" />
        <div
          class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"
        />
        
        <!-- Center icon -->
        <div class="absolute inset-0 flex items-center justify-center">
          <Sparkles class="w-8 h-8 text-primary animate-pulse" />
        </div>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl font-semibold text-foreground">{{ applicationStore.currentStep }}</h3>
        <p class="text-muted-foreground">
          Please wait while our AI analyzes your resume
        </p>
      </div>

      <!-- Progress bar -->
      <div class="max-w-md mx-auto">
        <UiProgress :value="applicationStore.progress" variant="gradient" size="lg" />
        <p class="text-sm text-muted-foreground mt-2">
          {{ applicationStore.progress }}% complete
        </p>
      </div>

      <!-- File info -->
      <div class="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/30 max-w-xs mx-auto">
        <FileText class="w-5 h-5 text-primary" />
        <span class="text-sm text-foreground truncate">
          {{ applicationStore.uploadedFile?.name }}
        </span>
      </div>
    </div>

    <!-- Completed state -->
    <div
      v-else-if="applicationStore.status === 'complete'"
      class="glass-card p-6 space-y-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-score-excellent/20 flex items-center justify-center">
            <CheckCircle class="w-6 h-6 text-score-excellent" />
          </div>
          <div>
            <h3 class="font-semibold text-foreground">Resume Uploaded Successfully</h3>
            <p class="text-sm text-muted-foreground">
              {{ applicationStore.uploadedFile?.name }}
            </p>
          </div>
        </div>
        <button
          class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
          @click="resetUpload"
        >
          <X class="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div class="flex items-center gap-2 text-sm text-ai-purple">
        <Sparkles class="w-4 h-4" />
        <span>AI analysis complete - scroll down to see results</span>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="applicationStore.status === 'error'"
      class="glass-card p-6"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
            <AlertCircle class="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 class="font-semibold text-foreground">Upload Failed</h3>
            <p class="text-sm text-muted-foreground">{{ applicationStore.error }}</p>
          </div>
        </div>
        <UiButton variant="outline" size="sm" @click="resetUpload">
          Try Again
        </UiButton>
      </div>
    </div>
  </div>
</template>

