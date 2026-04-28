<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, Users, UserCheck, UserX, Shield, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-vue-next'
import { useUsersStore, type CreateUserPayload, type UpdateUserPayload } from '~/stores/users'
import type { UserRole } from '~/stores/auth'
import { usePagination } from '~/composables/usePagination'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('users')
useHead({ title: () => title.value })

const store = useUsersStore()

const filteredUsers = computed(() => store.filteredUsers)
const pagination = usePagination(filteredUsers, { pageSize: 10 })

// Modal states
const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const deleteId = ref<string | null>(null)

interface FormState {
  name: string
  email: string
  password: string
  role: UserRole
  department: string
}

const emptyForm = (): FormState => ({
  name: '',
  email: '',
  password: '',
  role: 'hr',
  department: '',
})

const form = ref<FormState>(emptyForm())
const formError = ref('')

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'hr', label: 'HR' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'staff', label: 'Staff' },
  { value: 'c_level', label: 'C-Level' },
  { value: 'candidate', label: 'Candidate' },
]

const filterRoleOptions = [
  { value: 'all', label: 'Semua Role' },
  ...roleOptions,
]

const filterStatusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
]

const roleTone: Record<string, string> = {
  admin: 'bg-primary/10 text-primary',
  hr: 'bg-score-good/10 text-score-good',
  recruiter: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  manager: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  supervisor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  staff: 'bg-muted/40 text-muted-foreground',
  c_level: 'bg-score-average/10 text-score-average',
  candidate: 'bg-muted/40 text-muted-foreground',
}

function roleLabel(role: string) {
  return roleOptions.find(r => r.value === role)?.label ?? role
}

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  formError.value = ''
  showForm.value = true
}

function openEdit(id: string) {
  const user = store.getUserById(id)
  if (!user) return
  editingId.value = id
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    department: user.department ?? '',
  }
  formError.value = ''
  showForm.value = true
}

function openDelete(id: string) {
  deleteId.value = id
  showDelete.value = true
}

function handleSubmit() {
  formError.value = ''
  if (!form.value.name.trim()) { formError.value = 'Nama wajib diisi.'; return }
  if (!form.value.email.trim()) { formError.value = 'Email wajib diisi.'; return }
  if (!editingId.value && !form.value.password.trim()) { formError.value = 'Password wajib diisi untuk user baru.'; return }

  if (editingId.value) {
    const updates: UpdateUserPayload = {
      name: form.value.name,
      email: form.value.email,
      role: form.value.role,
      department: form.value.department || undefined,
    }
    store.updateUser(editingId.value, updates)
  } else {
    const payload: CreateUserPayload = {
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role,
      department: form.value.department || undefined,
    }
    store.addUser(payload)
  }
  showForm.value = false
}

function handleDelete() {
  if (deleteId.value) store.deleteUser(deleteId.value)
  showDelete.value = false
  deleteId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-sm text-muted-foreground mt-1">Kelola akun pengguna dan hak akses sistem.</p>
      </div>
      <UiButton @click="openCreate">
        <Plus class="w-4 h-4" />
        User Baru
      </UiButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      <UiStatCard label="Total User" :value="store.userStats.total" :icon="Users" />
      <UiStatCard label="Aktif" :value="store.userStats.active" tone="good" :icon="UserCheck" />
      <UiStatCard label="Nonaktif" :value="store.userStats.inactive" tone="low" :icon="UserX" />
      <UiStatCard label="Admin" :value="store.userStats.admins" tone="primary" :icon="Shield" />
      <UiStatCard label="HR" :value="store.userStats.hr" tone="good" :icon="Users" />
      <UiStatCard label="Recruiter" :value="store.userStats.recruiters" :icon="Users" />
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="relative md:col-span-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <UiInput v-model="store.searchQuery" placeholder="Cari nama / email..." class="pl-9" />
      </div>
      <UiSelect v-model="store.roleFilter" :options="filterRoleOptions" />
      <UiSelect v-model="store.statusFilter" :options="filterStatusOptions" />
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pengguna</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Departemen</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Login Terakhir</th>
              <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th class="px-4 py-3" />
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-if="pagination.pagedItems.value.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-muted-foreground text-sm">
                Tidak ada pengguna ditemukan.
              </td>
            </tr>
            <tr
              v-for="user in pagination.pagedItems.value"
              :key="user.id"
              class="hover:bg-muted/20 transition-colors"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
                    {{ user.name.slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-foreground truncate">{{ user.name }}</p>
                    <p class="text-xs text-muted-foreground truncate">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', roleTone[user.role] ?? roleTone.staff]">
                  {{ roleLabel(user.role) }}
                </span>
              </td>
              <td class="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {{ user.department ?? '—' }}
              </td>
              <td class="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                {{ user.lastLogin ? formatDate(user.lastLogin) : '—' }}
              </td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs font-medium transition-colors"
                  :class="user.isActive ? 'text-score-good' : 'text-muted-foreground'"
                  :title="user.isActive ? 'Nonaktifkan' : 'Aktifkan'"
                  @click="store.toggleUserStatus(user.id)"
                >
                  <component :is="user.isActive ? ToggleRight : ToggleLeft" class="w-5 h-5" />
                  {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    title="Edit"
                    @click="openEdit(user.id)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Hapus"
                    @click="openDelete(user.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiPagination
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="pengguna"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <!-- Create / Edit Modal -->
    <UiModal
      :open="showForm"
      :title="editingId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'"
      size="md"
      @update:open="showForm = $event"
    >
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <p v-if="formError" class="text-xs text-destructive">{{ formError }}</p>

        <UiFormField label="Nama Lengkap" required>
          <UiInput v-model="form.name" placeholder="John Doe" />
        </UiFormField>

        <UiFormField label="Email" required>
          <UiInput v-model="form.email" type="email" placeholder="john@telkomsel.com" />
        </UiFormField>

        <UiFormField v-if="!editingId" label="Password" required>
          <UiInput v-model="form.password" type="password" placeholder="Min. 8 karakter" />
        </UiFormField>

        <UiFormField label="Role" required>
          <UiSelect v-model="form.role" :options="roleOptions" />
        </UiFormField>

        <UiFormField label="Departemen">
          <UiInput v-model="form.department" placeholder="e.g. Human Resources" />
        </UiFormField>

        <div class="flex justify-end gap-2 pt-2">
          <UiButton type="button" variant="outline" @click="showForm = false">Batal</UiButton>
          <UiButton type="submit">{{ editingId ? 'Simpan Perubahan' : 'Tambah User' }}</UiButton>
        </div>
      </form>
    </UiModal>

    <!-- Delete Confirm -->
    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Pengguna"
      message="User ini akan dihapus permanen dan tidak dapat dikembalikan."
      confirm-text="Ya, Hapus"
      @confirm="handleDelete"
      @cancel="showDelete = false"
      @update:open="showDelete = $event"
    />
  </div>
</template>
