<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, UsersRound } from 'lucide-vue-next'
import { useSuccessionStore, type SuccessorEntry, type SuccessionReadiness } from '~/stores/succession'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('successorPool')
useHead({ title: () => title.value })

const successionStore = useSuccessionStore()
const successors = computed(() => successionStore.successors)
const pagination = usePagination(successors, { pageSize: 10 })
const employeesStore = useEmployeesStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  keyRoleId: string
  candidateEmployeeId: string
  readiness: SuccessionReadiness
  developmentNeeds: string
  notes: string
}
const empty = (): FormState => ({
  keyRoleId: '',
  candidateEmployeeId: '',
  readiness: 'developing',
  developmentNeeds: '',
  notes: '',
})
const form = ref<FormState>(empty())

const keyRoleOptions = computed(() =>
  successionStore.keyRoles.map((r) => ({ value: r.id, label: `${r.title} (${r.department})` })),
)
const employeeOptions = computed(() =>
  employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.position}` })),
)
const readinessOptions = [
  { value: 'ready_now', label: 'Ready Now' },
  { value: 'ready_1y', label: 'Ready dalam 1 tahun' },
  { value: 'ready_2y_plus', label: 'Ready 2+ tahun' },
  { value: 'developing', label: 'Developing' },
]

function readinessTone(r: SuccessionReadiness): 'good' | 'primary' | 'average' | 'low' {
  if (r === 'ready_now') return 'good'
  if (r === 'ready_1y') return 'primary'
  if (r === 'ready_2y_plus') return 'average'
  return 'low'
}
function readinessLabel(r: SuccessionReadiness) {
  return readinessOptions.find((o) => o.value === r)?.label ?? r
}
function roleName(id: string) {
  return successionStore.getRoleById(id)?.title ?? '-'
}
function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? '-'
}

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(() => form.value.keyRoleId !== '' && form.value.candidateEmployeeId !== '')

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(s: SuccessorEntry) {
  editingId.value = s.id
  form.value = {
    keyRoleId: s.keyRoleId,
    candidateEmployeeId: s.candidateEmployeeId,
    readiness: s.readiness,
    developmentNeeds: s.developmentNeeds,
    notes: s.notes ?? '',
  }
  showForm.value = true
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    keyRoleId: form.value.keyRoleId,
    candidateEmployeeId: form.value.candidateEmployeeId,
    readiness: form.value.readiness,
    developmentNeeds: form.value.developmentNeeds,
    notes: form.value.notes || undefined,
  }
  if (isEdit.value && editingId.value) {
    successionStore.updateSuccessor(editingId.value, payload)
  } else {
    successionStore.addSuccessor(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) successionStore.deleteSuccessor(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Identifikasi & kelola successor untuk posisi kunci.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Tambah Successor
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Posisi Kunci</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Successor</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Readiness</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Development Needs</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in pagination.pagedItems.value" :key="s.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm font-medium text-foreground">{{ roleName(s.keyRoleId) }}</td>
              <td class="px-4 py-3 text-sm">{{ employeeName(s.candidateEmployeeId) }}</td>
              <td class="px-4 py-3"><UiStatusBadge :label="readinessLabel(s.readiness)" :tone="readinessTone(s.readiness)" /></td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-md truncate">{{ s.developmentNeeds }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(s)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(s.id)">
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
        :icon="UsersRound"
        title="Successor pool kosong"
        description="Tetapkan kandidat successor untuk posisi kunci."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="successor"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Successor' : 'Tambah Successor'"
      description="Pilih kandidat dan tentukan kesiapan & development needs."
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Posisi Kunci" required>
          <UiSelect v-model="form.keyRoleId" :options="keyRoleOptions" placeholder="Pilih posisi" />
        </UiFormField>
        <UiFormField label="Kandidat Successor" required>
          <UiSelect v-model="form.candidateEmployeeId" :options="employeeOptions" placeholder="Pilih karyawan" />
        </UiFormField>
        <UiFormField label="Kesiapan" required>
          <UiSelect v-model="form.readiness" :options="readinessOptions" />
        </UiFormField>
        <UiFormField label="Development Needs" required>
          <UiTextarea v-model="form.developmentNeeds" rows="3" placeholder="Skill / pengalaman yang perlu dikembangkan" />
        </UiFormField>
        <UiFormField label="Catatan">
          <UiTextarea v-model="form.notes" rows="2" placeholder="Catatan tambahan (opsional)" />
        </UiFormField>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">
          {{ isEdit ? 'Simpan' : 'Tambah' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showDelete"
      title="Hapus Successor?"
      message="Catatan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
