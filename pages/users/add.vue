<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsersStore } from '~/stores/users'
import type { UserRole } from '~/stores/auth'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('users')
useHead({ title: () => `Create New User | ${title.value}` })

const router = useRouter()
const usersStore = useUsersStore()

const formData = ref({
  email: '',
  name: '',
  role: 'recruiter' as UserRole,
  department: '',
  password: '',
  confirmPassword: '',
})

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'candidate', label: 'Candidate' },
]

function goBack() {
  router.push('/users')
}

function handleSubmit() {
  usersStore.addUser({
    email: formData.value.email,
    name: formData.value.name,
    role: formData.value.role,
    department: formData.value.department || undefined,
    password: formData.value.password,
  })
  router.push('/users')
}

const isFormValid = computed(() => {
  const base =
    formData.value.email.trim() !== '' &&
    formData.value.name.trim() !== ''
  return (
    base &&
    formData.value.password.length >= 6 &&
    formData.value.password === formData.value.confirmPassword
  )
})
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
        <h1 class="text-2xl font-bold text-foreground">Create New User</h1>
        <p class="text-sm text-muted-foreground">{{ title }}</p>
      </div>
    </div>

    <form class="space-y-6 w-full" @submit.prevent="handleSubmit">
      <div class="glass-card p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Full Name *</label>
          <UiInput v-model="formData.name" placeholder="Enter full name" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Email *</label>
          <UiInput v-model="formData.email" type="email" placeholder="Enter email address" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Role *</label>
          <UiSelect v-model="formData.role" :options="roleOptions" />
        </div>
        <div v-if="formData.role !== 'candidate'">
          <label class="block text-sm font-medium text-foreground mb-2">Department</label>
          <UiInput v-model="formData.department" placeholder="e.g. Human Resources" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Password *</label>
          <UiInput v-model="formData.password" type="password" placeholder="Min. 6 characters" />
        </div>
        <div>
          <label class="block text-sm font-medium text-foreground mb-2">Confirm Password *</label>
          <UiInput v-model="formData.confirmPassword" type="password" placeholder="Confirm password" />
          <p
            v-if="formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword"
            class="text-sm text-score-low mt-1"
          >
            Passwords do not match
          </p>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <UiButton type="button" variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          Cancel
        </UiButton>
        <UiButton type="submit" variant="gradient" :disabled="!isFormValid">
          <Check class="w-4 h-4" />
          Create User
        </UiButton>
      </div>
    </form>
  </div>
</template>
