<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '~/stores/users'
import type { UserRole } from '~/stores/auth'
import { ArrowLeft, Check } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('users')
useHead({ title: () => `Edit User | ${title.value}` })

const route = useRoute()
const router = useRouter()
const usersStore = useUsersStore()
const userId = computed(() => route.params.id as string)
const user = computed(() => usersStore.getUserById(userId.value))

const formData = ref({
  email: '',
  name: '',
  role: 'recruiter' as UserRole,
  department: '',
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
  const item = user.value
  if (!item) return
  usersStore.updateUser(item.id, {
    email: formData.value.email,
    name: formData.value.name,
    role: formData.value.role,
    department: formData.value.department || undefined,
  })
  router.push('/users')
}

const isFormValid = computed(
  () =>
    formData.value.email.trim() !== '' &&
    formData.value.name.trim() !== ''
)

onMounted(() => {
  const item = user.value
  if (!item) {
    router.replace('/users')
    return
  }
  formData.value = {
    email: item.email,
    name: item.name,
    role: item.role,
    department: item.department || '',
  }
})
</script>

<template>
  <div v-if="user" class="space-y-6">
    <div class="flex items-center gap-4">
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        @click="goBack"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">Edit User</h1>
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
      </div>

      <div class="flex flex-wrap gap-3">
        <UiButton type="button" variant="outline" @click="goBack">
          <ArrowLeft class="w-4 h-4" />
          Cancel
        </UiButton>
        <UiButton type="submit" variant="gradient" :disabled="!isFormValid">
          <Check class="w-4 h-4" />
          Save Changes
        </UiButton>
      </div>
    </form>
  </div>
</template>
