<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/stores/auth'
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

const { title } = usePageTitle('users')
useHead({ title: () => title.value })

const usersStore = useUsersStore()
const authStore = useAuthStore()

// Tab state
const activeTab = ref<'admin' | 'candidates'>('admin')

// Modal states
const showDeleteModal = ref(false)
const selectedUser = ref<User | null>(null)

const adminRoleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'recruiter', label: 'Recruiter' },
]
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

function openDeleteModal(user: User) {
  selectedUser.value = user
  showDeleteModal.value = true
}

function closeModals() {
  showDeleteModal.value = false
  selectedUser.value = null
}

function handleDelete() {
  if (!selectedUser.value) return
  usersStore.deleteUser(selectedUser.value.id)
  closeModals()
}

function handleToggleStatus(user: User) {
  usersStore.toggleUserStatus(user.id)
}

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
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-muted-foreground">Manage admin staff and candidates</p>
      </div>
      <NuxtLink to="/users/add">
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          Add User
        </UiButton>
      </NuxtLink>
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
        <NuxtLink to="/users/add">
          <UiButton variant="gradient">
            <Plus class="w-4 h-4" />
            Add User
          </UiButton>
        </NuxtLink>
      </div>

      <!-- Users Table -->
      <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        <div class="overflow-x-auto">
          <table class="w-full min-w-max">
            <thead>
              <tr class="border-b border-border bg-muted/30">
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                <th v-if="activeTab === 'admin'" class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Department</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Login</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">Actions</th>
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
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-1">
                    <button
                      class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      title="Toggle Status"
                      @click="handleToggleStatus(user)"
                    >
                      <Power :class="['w-4 h-4', user.isActive ? 'text-score-excellent' : 'text-score-low']" />
                    </button>
                    <NuxtLink :to="`/users/${user.id}/edit`">
                      <button
                        class="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        title="Edit User"
                        type="button"
                      >
                        <Edit class="w-4 h-4 text-muted-foreground" />
                      </button>
                    </NuxtLink>
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

