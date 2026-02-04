<script setup lang="ts">
import { ref, computed } from 'vue'
import { useApplicationStore, type JobPosition } from '~/stores/application'
import { ArrowLeft, Check, X } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
useHead({ title: () => 'Create New Position | Position Management' })

const router = useRouter()
const appStore = useApplicationStore()

const formData = ref({
  title: '',
  department: '',
  location: '',
  type: 'full-time' as JobPosition['type'],
  remote: false,
  description: '',
  requirements: [''],
  benefits: [''],
})

const typeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

function addRequirement() {
  formData.value.requirements.push('')
}
function removeRequirement(index: number) {
  if (formData.value.requirements.length > 1) {
    formData.value.requirements.splice(index, 1)
  }
}
function addBenefit() {
  formData.value.benefits.push('')
}
function removeBenefit(index: number) {
  if (formData.value.benefits.length > 1) {
    formData.value.benefits.splice(index, 1)
  }
}

function goBack() {
  router.push('/positions')
}

function handleSubmit() {
  appStore.addPosition({
    title: formData.value.title,
    department: formData.value.department,
    location: formData.value.location,
    type: formData.value.type,
    remote: formData.value.remote,
    description: formData.value.description,
    requirements: formData.value.requirements.filter((r) => r.trim() !== ''),
    benefits: formData.value.benefits.filter((b) => b.trim() !== ''),
  })
  router.push('/positions')
}

const isFormValid = computed(
  () =>
    formData.value.title.trim() !== '' &&
    formData.value.department.trim() !== '' &&
    formData.value.location.trim() !== '' &&
    formData.value.description.trim() !== ''
)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">Create New Position</h1>
        <p class="text-sm text-muted-foreground">Manage and create job positions for recruitment</p>
      </div>
    </div>

    <form class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-6">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Job Title *</label>
          <UiInput v-model="formData.title" placeholder="e.g. Senior Software Engineer" />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Department *</label>
            <UiInput v-model="formData.department" placeholder="e.g. Engineering" />
          </div>
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">Location *</label>
            <UiInput v-model="formData.location" placeholder="e.g. Jakarta, Indonesia" />
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <div class="w-40">
            <label class="block text-sm font-medium text-foreground mb-2">Employment Type</label>
            <UiSelect v-model="formData.type" :options="typeOptions" />
          </div>
          <div class="flex items-center gap-3 pt-8">
            <input
              id="remote"
              v-model="formData.remote"
              type="checkbox"
              class="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label for="remote" class="text-sm font-medium text-foreground">Remote Work Available</label>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Description *</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-4 py-3 rounded-xl border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
            placeholder="Describe the role and responsibilities..."
          />
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-foreground">Requirements</label>
            <button type="button" class="text-sm text-primary hover:underline" @click="addRequirement">
              + Add Requirement
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(req, index) in formData.requirements"
              :key="index"
              class="flex gap-2"
            >
              <UiInput
                v-model="formData.requirements[index]"
                placeholder="e.g. 5+ years of experience"
                class="flex-1"
              />
              <button
                v-if="formData.requirements.length > 1"
                type="button"
                class="p-2 rounded-lg hover:bg-score-low/10 transition-colors"
                @click="removeRequirement(index)"
              >
                <X class="w-4 h-4 text-score-low" />
              </button>
            </div>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-foreground">Benefits</label>
            <button type="button" class="text-sm text-primary hover:underline" @click="addBenefit">
              + Add Benefit
            </button>
          </div>
          <div class="space-y-2">
            <div
              v-for="(benefit, index) in formData.benefits"
              :key="index"
              class="flex gap-2"
            >
              <UiInput
                v-model="formData.benefits[index]"
                placeholder="e.g. Health insurance"
                class="flex-1"
              />
              <button
                v-if="formData.benefits.length > 1"
                type="button"
                class="p-2 rounded-lg hover:bg-score-low/10 transition-colors"
                @click="removeBenefit(index)"
              >
                <X class="w-4 h-4 text-score-low" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UiButton type="button" variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          Cancel
        </UiButton>
        <UiButton type="submit" variant="gradient" :disabled="!isFormValid">
          <Check class="w-4 h-4" />
          Create Position
        </UiButton>
      </div>
    </form>
  </div>
</template>
