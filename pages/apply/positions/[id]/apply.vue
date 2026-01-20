<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApplicationStore } from '~/stores/application'
import { useAuthStore } from '~/stores/auth'
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  Sparkles,
  AlertCircle,
  Loader2,
  Building2,
  MapPin,
  Briefcase,
} from 'lucide-vue-next'

definePageMeta({
  layout: 'applicant',
})

const route = useRoute()
const router = useRouter()
const applicationStore = useApplicationStore()
const authStore = useAuthStore()

const positionId = computed(() => route.params.id as string)
const position = computed(() => applicationStore.getPositionById(positionId.value))

useHead({
  title: computed(() => position.value ? `Apply - ${position.value.title}` : 'Apply'),
})

const isDragging = ref(false)
const uploadedFile = ref<File | null>(null)
const isSubmitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref<string | null>(null)

// Form fields
const fullName = ref('')
const email = ref('')
const phone = ref('')
const coverLetter = ref('')

onMounted(() => {
  // Pre-fill form if user is logged in
  if (authStore.user) {
    fullName.value = authStore.user.name
    email.value = authStore.user.email
  }
})

function goBack() {
  router.push(`/apply/positions/${positionId.value}`)
}

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
  const input = e.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    handleFile(input.files[0])
  }
}

function handleFile(file: File) {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]
  
  if (!allowedTypes.includes(file.type)) {
    submitError.value = 'Please upload a PDF or Word document'
    return
  }
  
  if (file.size > 5 * 1024 * 1024) {
    submitError.value = 'File size must be less than 5MB'
    return
  }
  
  uploadedFile.value = file
  submitError.value = null
}

function removeFile() {
  uploadedFile.value = null
}

const isFormValid = computed(() => {
  return fullName.value.trim() !== '' &&
         email.value.trim() !== '' &&
         phone.value.trim() !== '' &&
         uploadedFile.value !== null
})

async function submitApplication() {
  if (!isFormValid.value || !position.value) return
  
  isSubmitting.value = true
  submitError.value = null
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    submitSuccess.value = true
    
    // Redirect to status page after delay
    setTimeout(() => {
      router.push('/apply/status')
    }, 3000)
  } catch (e) {
    submitError.value = 'Failed to submit application. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft class="w-5 h-5" />
      <span>Back to Job Details</span>
    </button>

    <!-- Position Not Found -->
    <div v-if="!position" class="glass-card p-12 text-center">
      <div class="w-20 h-20 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
        <Briefcase class="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 class="text-2xl font-bold text-foreground mb-3">Position Not Found</h2>
      <p class="text-muted-foreground mb-6">
        The position you're trying to apply for doesn't exist.
      </p>
      <NuxtLink
        to="/apply/positions"
        class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
      >
        Browse Positions
      </NuxtLink>
    </div>

    <!-- Success State -->
    <div v-else-if="submitSuccess" class="glass-card p-12 text-center">
      <div class="w-20 h-20 mx-auto rounded-2xl bg-score-excellent/10 flex items-center justify-center mb-6">
        <CheckCircle class="w-12 h-12 text-score-excellent" />
      </div>
      <h2 class="text-2xl font-bold text-foreground mb-3">Application Submitted!</h2>
      <p class="text-muted-foreground mb-2">
        Thank you for applying for <strong class="text-foreground">{{ position.title }}</strong>
      </p>
      <p class="text-muted-foreground mb-6">
        We'll review your application and get back to you soon.
      </p>
      <p class="text-sm text-muted-foreground">
        Redirecting to your applications...
      </p>
    </div>

    <!-- Application Form -->
    <template v-else>
      <!-- Position Info -->
      <div class="glass-card p-6">
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center flex-shrink-0">
            <Briefcase class="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-foreground mb-1">{{ position.title }}</h1>
            <div class="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span class="flex items-center gap-1">
                <Building2 class="w-4 h-4" />
                {{ position.department }}
              </span>
              <span class="flex items-center gap-1">
                <MapPin class="w-4 h-4" />
                {{ position.location }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="submitApplication" class="space-y-6">
        <!-- Personal Info -->
        <div class="glass-card p-6 space-y-6">
          <h2 class="text-lg font-semibold text-foreground">Personal Information</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Full Name *</label>
              <input
                v-model="fullName"
                type="text"
                required
                placeholder="Enter your full name"
                class="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-foreground">Email Address *</label>
              <input
                v-model="email"
                type="email"
                required
                placeholder="your.email@example.com"
                class="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">Phone Number *</label>
            <input
              v-model="phone"
              type="tel"
              required
              placeholder="+62 812 3456 7890"
              class="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
        </div>

        <!-- CV Upload -->
        <div class="glass-card p-6 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-foreground">Upload Your CV *</h2>
            <div class="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles class="w-4 h-4 text-ai-red" />
              AI-Powered Analysis
            </div>
          </div>

          <!-- Dropzone -->
          <div
            v-if="!uploadedFile"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
            @drop="handleDrop"
            :class="[
              'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-muted/30',
            ]"
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @change="handleFileSelect"
            />
            <div class="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Upload class="w-8 h-8 text-primary" />
            </div>
            <h3 class="text-lg font-semibold text-foreground mb-2">
              Drop your CV here or click to upload
            </h3>
            <p class="text-sm text-muted-foreground">
              Supports PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>

          <!-- Uploaded File -->
          <div
            v-else
            class="flex items-center justify-between p-4 rounded-xl bg-score-excellent/10 border border-score-excellent/30"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-score-excellent/20 flex items-center justify-center">
                <FileText class="w-5 h-5 text-score-excellent" />
              </div>
              <div>
                <p class="font-medium text-foreground">{{ uploadedFile.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ (uploadedFile.size / 1024).toFixed(1) }} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              @click="removeFile"
              class="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Remove
            </button>
          </div>

          <p class="text-sm text-muted-foreground">
            Our AI will analyze your CV to match you with this position and provide insights.
          </p>
        </div>

        <!-- Cover Letter (Optional) -->
        <div class="glass-card p-6 space-y-4">
          <h2 class="text-lg font-semibold text-foreground">Cover Letter (Optional)</h2>
          <textarea
            v-model="coverLetter"
            rows="5"
            placeholder="Tell us why you're interested in this role and what makes you a great fit..."
            class="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
          ></textarea>
        </div>

        <!-- Error Message -->
        <div
          v-if="submitError"
          class="flex items-center gap-3 p-4 rounded-xl bg-score-low/10 border border-score-low/30 text-score-low"
        >
          <AlertCircle class="w-5 h-5 flex-shrink-0" />
          <p class="text-sm">{{ submitError }}</p>
        </div>

        <!-- Validation Message -->
        <div
          v-if="!isFormValid && !submitError"
          class="flex items-center gap-3 p-4 rounded-xl bg-ai-orange/10 border border-ai-orange/30 text-ai-orange"
        >
          <AlertCircle class="w-5 h-5 flex-shrink-0" />
          <div class="text-sm">
            <p class="font-medium">Please complete all required fields:</p>
            <ul class="mt-1 space-y-0.5 text-muted-foreground">
              <li v-if="!fullName.trim()">• Full Name</li>
              <li v-if="!email.trim()">• Email Address</li>
              <li v-if="!phone.trim()">• Phone Number</li>
              <li v-if="!uploadedFile">• Upload your CV</li>
            </ul>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p class="text-sm text-muted-foreground">
            By submitting, you agree to our Terms and Privacy Policy
          </p>
          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            :class="[
              'inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all w-full sm:w-auto justify-center',
              isFormValid && !isSubmitting
                ? 'bg-gradient-to-t from-ai-orange to-ai-red text-white hover:opacity-90'
                : 'bg-muted text-muted-foreground cursor-not-allowed',
            ]"
          >
            <Loader2 v-if="isSubmitting" class="w-5 h-5 animate-spin" />
            <Sparkles v-else class="w-5 h-5" />
            {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

