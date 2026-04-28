<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, Eye, Pencil, Trash2, UserCheck, UserX, Users, Mail, Phone } from 'lucide-vue-next'
import { usePagination } from '~/composables/usePagination'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('employeeDatabase')
useHead({ title: () => title.value })

const router = useRouter()
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const confirmDeleteId = ref<string | null>(null)

const departmentOptions = computed(() => [
  { value: 'all', label: 'Semua Departemen' },
  ...employeesStore.departments.map((d) => ({ value: d, label: d })),
])

const statusOptions = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Tidak Aktif' },
]

const filtered = computed(() => employeesStore.filteredEmployees)
const pagination = usePagination(filtered, { pageSize: 10 })

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function divisionName(id?: string): string {
  if (!id) return '-'
  return companyStore.getDivisionById(id)?.name ?? '-'
}

function goAdd() {
  router.push('/employees/database/add')
}
function goDetail(id: string) {
  router.push(`/employees/database/${id}`)
}
function goEdit(id: string) {
  router.push(`/employees/database/${id}/edit`)
}
function askDelete(id: string) {
  confirmDeleteId.value = id
}
function cancelDelete() {
  confirmDeleteId.value = null
}
function confirmDelete() {
  if (confirmDeleteId.value) {
    employeesStore.deleteEmployee(confirmDeleteId.value)
    confirmDeleteId.value = null
  }
}
function toggleStatus(id: string) {
  employeesStore.toggleEmployeeStatus(id)
}

const stats = computed(() => employeesStore.employeeStats)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-sm text-muted-foreground">Kelola data karyawan: personal, keluarga, riwayat kerja, pendidikan, sertifikasi & dokumen.</p>
      </div>
      <UiButton variant="gradient" @click="goAdd">
        <Plus class="w-4 h-4" />
        Tambah Karyawan
      </UiButton>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="glass-card p-4 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users class="w-6 h-6 text-primary" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground">Total Karyawan</p>
          <p class="text-2xl font-bold text-foreground">{{ stats.total }}</p>
        </div>
      </div>
      <div class="glass-card p-4 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-score-good/10 flex items-center justify-center">
          <UserCheck class="w-6 h-6 text-score-good" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground">Karyawan Aktif</p>
          <p class="text-2xl font-bold text-foreground">{{ stats.active }}</p>
        </div>
      </div>
      <div class="glass-card p-4 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-score-low/10 flex items-center justify-center">
          <UserX class="w-6 h-6 text-score-low" />
        </div>
        <div>
          <p class="text-xs text-muted-foreground">Tidak Aktif</p>
          <p class="text-2xl font-bold text-foreground">{{ stats.inactive }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput
          v-model="employeesStore.searchQuery"
          placeholder="Cari nama, email, NIK, jabatan..."
          class="pl-9"
        />
      </div>
      <UiSelect v-model="employeesStore.departmentFilter" :options="departmentOptions" />
      <UiSelect v-model="employeesStore.statusFilter" :options="statusOptions" />
    </div>

    <!-- Table -->
    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">NIK</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Departemen / Divisi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Posisi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Bergabung</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in pagination.pagedItems.value"
              :key="emp.id"
              class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-3">
                <NuxtLink :to="`/employees/database/${emp.id}`" class="flex items-center gap-3 min-w-0 group">
                  <div class="flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-gradient-to-t from-ai-orange to-ai-red font-semibold text-white text-sm">
                    {{ getInitials(emp.name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-foreground truncate group-hover:text-primary transition-colors">{{ emp.name }}</p>
                    <div class="flex items-center gap-3 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1 truncate">
                        <Mail class="w-3 h-3 shrink-0" />
                        <span class="truncate">{{ emp.email }}</span>
                      </span>
                      <span v-if="emp.phone" class="hidden md:flex items-center gap-1 truncate">
                        <Phone class="w-3 h-3 shrink-0" />
                        <span class="truncate">{{ emp.phone }}</span>
                      </span>
                    </div>
                  </div>
                </NuxtLink>
              </td>
              <td class="px-4 py-3 text-sm font-mono text-foreground">{{ emp.employeeId }}</td>
              <td class="px-4 py-3 text-sm">
                <p class="text-foreground">{{ emp.department }}</p>
                <p class="text-xs text-muted-foreground">{{ divisionName(emp.divisionId) }}</p>
              </td>
              <td class="px-4 py-3 text-sm text-foreground">{{ emp.position }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ formatDate(emp.joinDate) }}</td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                    emp.isActive
                      ? 'bg-score-good/10 text-score-good border-score-good/30 hover:bg-score-good/20'
                      : 'bg-score-low/10 text-score-low border-score-low/30 hover:bg-score-low/20',
                  ]"
                  @click.stop="toggleStatus(emp.id)"
                >
                  {{ emp.isActive ? 'Aktif' : 'Tidak Aktif' }}
                </button>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <NuxtLink
                    :to="`/employees/database/${emp.id}`"
                    class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                    title="Lihat detail"
                  >
                    <Eye class="w-4 h-4" />
                  </NuxtLink>
                  <button
                    class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-primary transition-colors"
                    title="Edit"
                    @click.stop="goEdit(emp.id)"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    class="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Hapus"
                    @click.stop="askDelete(emp.id)"
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
        :icon="Users"
        title="Tidak ada karyawan"
        description="Coba ubah pencarian atau filter, atau tambah karyawan baru."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="karyawan"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <!-- Delete confirmation -->
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
          v-if="confirmDeleteId"
          class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          @click.self="cancelDelete"
        >
          <div class="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 class="text-lg font-semibold text-foreground">Hapus Karyawan?</h3>
            <p class="text-sm text-muted-foreground mt-1">Tindakan ini tidak dapat dibatalkan. Data karyawan beserta dokumen akan dihapus.</p>
            <div class="flex justify-end gap-2 mt-5">
              <UiButton variant="outline" @click="cancelDelete">Batal</UiButton>
              <UiButton variant="destructive" @click="confirmDelete">
                <Trash2 class="w-4 h-4" />
                Hapus
              </UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
