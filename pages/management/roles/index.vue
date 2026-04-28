<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, Pencil, Trash2, ShieldCheck, Shield, Lock } from 'lucide-vue-next'
import { useRolesStore, ALL_PERMISSIONS, type Role } from '~/stores/roles'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('roles')
useHead({ title: () => title.value })

const rolesStore = useRolesStore()
const filteredRoles = computed(() => rolesStore.filteredRoles)
const pagination = usePagination(filteredRoles, { pageSize: 10 })

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetDeleteId = ref<string | null>(null)

interface FormState {
  name: string
  code: string
  description: string
  permissions: string[]
}

const empty = (): FormState => ({ name: '', code: '', description: '', permissions: [] })
const form = ref<FormState>(empty())

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(() => form.value.name.trim() !== '' && form.value.code.trim() !== '')

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(role: Role) {
  editingId.value = role.id
  form.value = {
    name: role.name,
    code: role.code,
    description: role.description ?? '',
    permissions: [...role.permissions],
  }
  showForm.value = true
}
function togglePermission(value: string) {
  const i = form.value.permissions.indexOf(value)
  if (i === -1) form.value.permissions.push(value)
  else form.value.permissions.splice(i, 1)
}
function selectAllInGroup(items: typeof ALL_PERMISSIONS[number][]) {
  for (const p of items) {
    if (!form.value.permissions.includes(p.value)) form.value.permissions.push(p.value)
  }
}
function clearGroup(items: typeof ALL_PERMISSIONS[number][]) {
  form.value.permissions = form.value.permissions.filter((p) => !items.some((i) => i.value === p))
}
function handleSave() {
  if (!isValid.value) return
  if (isEdit.value && editingId.value) {
    rolesStore.updateRole(editingId.value, { ...form.value })
  } else {
    rolesStore.addRole({ ...form.value })
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetDeleteId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetDeleteId.value) rolesStore.deleteRole(targetDeleteId.value)
  showDelete.value = false
  targetDeleteId.value = null
}

const targetDelete = computed(() => (targetDeleteId.value ? rolesStore.getRoleById(targetDeleteId.value) : null))
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Kelola role dan permission yang dipakai user portal."
    >
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Tambah Role
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput v-model="rolesStore.searchQuery" placeholder="Cari role berdasarkan nama atau kode..." class="pl-9" />
      </div>
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Kode</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deskripsi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissions</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in pagination.pagedItems.value" :key="role.id" class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck v-if="role.isSystem" class="w-4 h-4" />
                    <Shield v-else class="w-4 h-4" />
                  </div>
                  <div>
                    <p class="font-medium text-foreground">{{ role.name }}</p>
                    <p v-if="role.isSystem" class="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock class="w-3 h-3" />
                      Sistem
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 text-sm font-mono text-foreground">{{ role.code }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ role.description || '-' }}</td>
              <td class="px-4 py-3">
                <UiStatusBadge :label="`${role.permissions.length} permissions`" tone="primary" />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                    title="Edit"
                    @click="openEdit(role)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    :disabled="role.isSystem"
                    :class="[
                      'p-2 rounded-lg transition-colors',
                      role.isSystem
                        ? 'opacity-30 cursor-not-allowed text-muted-foreground'
                        : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive',
                    ]"
                    title="Hapus"
                    @click="!role.isSystem && askDelete(role.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        title="Tidak ada role"
        description="Tambah role baru untuk mengatur akses user portal."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="role"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Role' : 'Tambah Role'"
      description="Tentukan nama, kode, dan permission yang dimiliki role ini."
      size="lg"
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Nama Role" required>
            <UiInput v-model="form.name" placeholder="e.g. Manager" />
          </UiFormField>
          <UiFormField label="Kode" required hint="Identifier unik (huruf besar)">
            <UiInput v-model="form.code" placeholder="e.g. MANAGER" />
          </UiFormField>
        </div>
        <UiFormField label="Deskripsi">
          <UiTextarea v-model="form.description" placeholder="Penjelasan singkat tentang role" />
        </UiFormField>

        <div class="space-y-3">
          <h4 class="text-sm font-medium text-foreground">Permissions</h4>
          <div
            v-for="group in rolesStore.permissionGroups"
            :key="group.group"
            class="rounded-xl border border-border p-4 space-y-2"
          >
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-foreground">{{ group.group }}</p>
              <div class="flex items-center gap-2 text-xs">
                <button type="button" class="text-primary hover:underline" @click="selectAllInGroup(group.items)">Pilih semua</button>
                <span class="text-muted-foreground">/</span>
                <button type="button" class="text-muted-foreground hover:underline" @click="clearGroup(group.items)">Kosongkan</button>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                v-for="p in group.items"
                :key="p.value"
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/30 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  :checked="form.permissions.includes(p.value)"
                  class="w-4 h-4 rounded accent-primary"
                  @change="togglePermission(p.value)"
                >
                <span class="text-foreground">{{ p.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah Role' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Role?"
      :message="`Role ${targetDelete?.name} akan dihapus permanen.`"
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
