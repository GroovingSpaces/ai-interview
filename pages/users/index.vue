<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useAuthStore } from '~/stores/auth'
import type { User, UserRole } from '~/stores/auth'
import {
  Search,
  Plus,
  Filter,
  Users,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Mail,
  Building2,
  Calendar,
  Clock,
  MoreHorizontal,
  Power,
} from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin',
})

useHead({
  title: 'User Management',
})

const usersStore = useUsersStore()
const authStore = useAuthStore()

// Tab state
const activeTab = ref<'admin' | 'candidates'>('admin')

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<User | null>(null)

// Form state
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

const adminRoleOptions = roleOptions.filter(r => r.value !== 'candidate')
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  admin: { bg: 'bg-ai-red/10', text: 'text-ai-red', border: 'border-ai-red/30' },
  hr: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' },
  recruiter: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  candidate: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/30' },
}

function resetForm() {
  formData.value = {
    email: '',
    name: '',
    role: activeTab.value === 'admin' ? 'recruiter' : 'candidate',
    department: '',
    password: '',
    confirmPassword: '',
  }
}

function openCreateModal() {
  resetForm()
  showCreateModal.value = true
}

function openEditModal(user: User) {
  selectedUser.value = user
  formData.value = {
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department || '',
    password: '',
    confirmPassword: '',
  }
  showEditModal.value = true
}

function openDeleteModal(user: User) {
  selectedUser.value = user
  showDeleteModal.value = true
}

function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selectedUser.value = null
  resetForm()
}

function handleCreate() {
  usersStore.addUser({
    email: formData.value.email,
    name: formData.value.name,
    role: formData.value.role,
    department: formData.value.department || undefined,
    password: formData.value.password,
  })
  closeModals()
}

function handleUpdate() {
  if (!selectedUser.value) return
  usersStore.updateUser(selectedUser.value.id, {
    email: formData.value.email,
    name: formData.value.name,
    role: formData.value.role,
    department: formData.value.department || undefined,
  })
  closeModals()
}

function handleDelete() {
  if (!selectedUser.value) return
  usersStore.deleteUser(selectedUser.value.id)
  closeModals()
}

function handleToggleStatus(user: User) {
  usersStore.toggleUserStatus(user.id)
}

const isFormValid = computed(() => {
  const base = 
    formData.value.email.trim() !== '' &&
    formData.value.name.trim() !== ''
  
  if (showCreateModal.value) {
    return base && 
      formData.value.password.length >= 6 &&
      formData.value.password === formData.value.confirmPassword
  }
  
  return base
})

const displayedUsers = computed(() => {
  if (activeTab.value === 'admin') {
    return usersStore.filteredAdminUsers
  }
  return usersStore.filteredCandidateUsers
})

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'Never'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">User Management</h1>
        <p class="text-muted-foreground">Manage admin staff and candidates</p>
      </div>
      <UiButton variant="gradient" @click="openCreateModal">
        <Plus class="w-4 h-4" />
        Add User
      </UiButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-primary/10">
            <Users class="w-5 h-5 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ usersStore.userStats.total }}</p>
            <p class="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-ai-red/10">
            <Shield class="w-5 h-5 text-ai-red" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ usersStore.userStats.admins }}</p>
            <p class="text-xs text-muted-foreground">Admins</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-purple-500/10">
            <UserCheck class="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ usersStore.userStats.hr }}</p>
            <p class="text-xs text-muted-foreground">HR</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-blue-500/10">
            <Users class="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ usersStore.userStats.recruiters }}</p>
            <p class="text-xs text-muted-foreground">Recruiters</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-emerald-500/10">
            <Users class="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ usersStore.userStats.candidates }}</p>
            <p class="text-xs text-muted-foreground">Candidates</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-score-excellent/10">
            <UserCheck class="w-5 h-5 text-score-excellent" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ usersStore.userStats.active }}</p>
            <p class="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-score-low/10">
            <UserX class="w-5 h-5 text-score-low" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ usersStore.userStats.inactive }}</p>
            <p class="text-xs text-muted-foreground">Inactive</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="glass-card p-2 inline-flex gap-1">
      <button
        :class="[
          'px-6 py-2.5 rounded-lg font-medium transition-all',
          activeTab === 'admin'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        ]"
        @click="activeTab = 'admin'"
      >
        <div class="flex items-center gap-2">
          <Shield class="w-4 h-4" />
          Admin Users
          <span class="px-2 py-0.5 rounded-full text-xs bg-background/50">
            {{ usersStore.adminUsers.length }}
          </span>
        </div>
      </button>
      <button
        :class="[
          'px-6 py-2.5 rounded-lg font-medium transition-all',
          activeTab === 'candidates'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        ]"
        @click="activeTab = 'candidates'"
      >
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4" />
          Candidates
          <span class="px-2 py-0.5 rounded-full text-xs bg-background/50">
            {{ usersStore.candidateUsers.length }}
          </span>
        </div>
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput
          v-model="usersStore.searchQuery"
          placeholder="Search by name, email, or department..."
          class="pl-11"
        />
      </div>
      <div class="flex flex-wrap gap-2">
        <UiSelect
          v-if="activeTab === 'admin'"
          v-model="usersStore.roleFilter"
          :options="[{ value: 'all', label: 'All Roles' }, ...adminRoleOptions]"
          class="w-36"
        />
        <UiSelect
          v-model="usersStore.statusFilter"
          :options="statusOptions"
          class="w-36"
        />
      </div>
    </div>

    <!-- Users List -->
    <div class="space-y-4">
      <p class="text-sm text-muted-foreground">
        Showing {{ displayedUsers.length }} {{ activeTab === 'admin' ? 'admin users' : 'candidates' }}
      </p>

      <div v-if="displayedUsers.length === 0" class="glass-card p-12 text-center">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Users class="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">No Users Found</h3>
        <p class="text-muted-foreground mb-4">Try adjusting your search or filter criteria.</p>
        <UiButton variant="gradient" @click="openCreateModal">
          <Plus class="w-4 h-4" />
          Add User
        </UiButton>
      </div>

      <!-- Users Table -->
      <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border bg-muted/30">
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th v-if="activeTab === 'admin'" class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="user in displayedUsers"
                :key="user.id"
                class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <UiAvatar :alt="user.name" size="md" />
                    <div>
                      <p class="font-medium text-foreground">{{ user.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium border capitalize',
                      roleColors[user.role].bg,
                      roleColors[user.role].text,
                      roleColors[user.role].border,
                    ]"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td v-if="activeTab === 'admin'" class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{ user.department || '-' }}</span>
                </td>
                <td class="px-4 py-4">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      user.isActive
                        ? 'bg-score-excellent/10 text-score-excellent border-score-excellent/30'
                        : 'bg-score-low/10 text-score-low border-score-low/30',
                    ]"
                  >
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{ formatDate(user.lastLogin) }}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-sm text-muted-foreground">{{ formatDate(user.createdAt) }}</span>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      title="Toggle Status"
                      @click="handleToggleStatus(user)"
                    >
                      <Power :class="['w-4 h-4', user.isActive ? 'text-score-excellent' : 'text-score-low']" />
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      title="Edit User"
                      @click="openEditModal(user)"
                    >
                      <Edit class="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      class="p-2 rounded-lg hover:bg-score-low/10 transition-colors"
                      title="Delete User"
                      @click="openDeleteModal(user)"
                      :disabled="user.id === authStore.user?.id"
                    >
                      <Trash2 :class="['w-4 h-4', user.id === authStore.user?.id ? 'text-muted-foreground/30' : 'text-score-low']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showCreateModal || showEditModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          
          <div class="relative w-full max-w-lg bg-card border border-border rounded-2xl overflow-hidden">
            <!-- Modal Header -->
            <div class="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 z-10">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-foreground">
                  {{ showCreateModal ? 'Create New User' : 'Edit User' }}
                </h2>
                <button
                  class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  @click="closeModals"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>
            </div>

            <!-- Modal Content -->
            <div class="p-6 space-y-4">
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
                <UiSelect
                  v-model="formData.role"
                  :options="roleOptions"
                />
              </div>

              <div v-if="formData.role !== 'candidate'">
                <label class="block text-sm font-medium text-foreground mb-2">Department</label>
                <UiInput v-model="formData.department" placeholder="e.g. Human Resources" />
              </div>

              <template v-if="showCreateModal">
                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Password *</label>
                  <UiInput v-model="formData.password" type="password" placeholder="Min. 6 characters" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Confirm Password *</label>
                  <UiInput v-model="formData.confirmPassword" type="password" placeholder="Confirm password" />
                  <p v-if="formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword" class="text-sm text-score-low mt-1">
                    Passwords do not match
                  </p>
                </div>
              </template>
            </div>

            <!-- Modal Footer -->
            <div class="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-6 z-10">
              <div class="flex justify-end gap-3">
                <UiButton variant="outline" @click="closeModals">Cancel</UiButton>
                <UiButton
                  variant="gradient"
                  :disabled="!isFormValid"
                  @click="showCreateModal ? handleCreate() : handleUpdate()"
                >
                  <Check class="w-4 h-4" />
                  {{ showCreateModal ? 'Create User' : 'Save Changes' }}
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6">
            <div class="text-center">
              <div class="w-16 h-16 mx-auto rounded-full bg-score-low/10 flex items-center justify-center mb-4">
                <AlertTriangle class="w-8 h-8 text-score-low" />
              </div>
              <h2 class="text-xl font-bold text-foreground mb-2">Delete User</h2>
              <p class="text-muted-foreground mb-6">
                Are you sure you want to delete "{{ selectedUser?.name }}"? This action cannot be undone.
              </p>
              <div class="flex justify-center gap-3">
                <UiButton variant="outline" @click="closeModals">Cancel</UiButton>
                <UiButton
                  variant="outline"
                  class="text-score-low border-score-low/30 hover:bg-score-low/10"
                  @click="handleDelete"
                >
                  <Trash2 class="w-4 h-4" />
                  Delete
                </UiButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

