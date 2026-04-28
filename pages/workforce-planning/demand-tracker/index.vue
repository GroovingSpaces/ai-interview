<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, BarChart3 } from 'lucide-vue-next'
import { useDemandStore, type DepartmentDemand } from '~/stores/demand'
import { useCompanyStore } from '~/stores/company'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('demandTracker')
useHead({ title: () => title.value })

const demandStore = useDemandStore()
const demands = computed(() => demandStore.demands)
const pagination = usePagination(demands, { pageSize: 10 })
const companyStore = useCompanyStore()

const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const targetId = ref<string | null>(null)

interface FormState {
  departmentId: string
  departmentName: string
  requiredHeadcount: number | undefined
  year: string
  notes: string
}
const empty = (): FormState => ({
  departmentId: '',
  departmentName: '',
  requiredHeadcount: undefined,
  year: String(new Date().getFullYear()),
  notes: '',
})
const form = ref<FormState>(empty())

const departmentOptions = computed(() =>
  companyStore.departments.map((d) => ({ value: d.id, label: d.name })),
)

const isEdit = computed(() => editingId.value !== null)
const isValid = computed(() => form.value.departmentId !== '' && (form.value.requiredHeadcount ?? 0) > 0)

function openAdd() {
  editingId.value = null
  form.value = empty()
  showForm.value = true
}
function openEdit(d: DepartmentDemand) {
  editingId.value = d.id
  form.value = {
    departmentId: d.departmentId,
    departmentName: d.departmentName,
    requiredHeadcount: d.requiredHeadcount,
    year: d.year ?? String(new Date().getFullYear()),
    notes: d.notes ?? '',
  }
  showForm.value = true
}
function onDeptPicked(id: string) {
  form.value.departmentId = id
  form.value.departmentName = companyStore.getDepartmentById(id)?.name ?? ''
}
function handleSave() {
  if (!isValid.value) return
  const payload = {
    departmentId: form.value.departmentId,
    departmentName: form.value.departmentName,
    requiredHeadcount: Number(form.value.requiredHeadcount) || 0,
    year: form.value.year,
    notes: form.value.notes || undefined,
  }
  if (isEdit.value && editingId.value) {
    demandStore.updateDemand(editingId.value, payload)
  } else {
    demandStore.addDemand(payload)
  }
  showForm.value = false
}
function askDelete(id: string) {
  targetId.value = id
  showDelete.value = true
}
function confirmDelete() {
  if (targetId.value) demandStore.deleteDemand(targetId.value)
  showDelete.value = false
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Definisikan target headcount per departemen per tahun.">
      <template #actions>
        <UiButton variant="gradient" @click="openAdd">
          <Plus class="w-4 h-4" />
          Demand Baru
        </UiButton>
      </template>
    </UiPageHeader>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Departemen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tahun</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Target Headcount</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Catatan</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in pagination.pagedItems.value" :key="d.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm font-medium text-foreground">{{ d.departmentName }}</td>
              <td class="px-4 py-3 text-sm">{{ d.year ?? '-' }}</td>
              <td class="px-4 py-3 text-sm font-mono font-semibold">{{ d.requiredHeadcount }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{{ d.notes ?? '-' }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEdit(d)">
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDelete(d.id)">
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
        :icon="BarChart3"
        title="Belum ada target demand"
        description="Tambahkan target headcount per departemen."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="target"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>

    <UiModal
      :open="showForm"
      :title="isEdit ? 'Edit Demand' : 'Demand Baru'"
      description="Tetapkan target headcount per departemen per tahun."
      @update:open="showForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Departemen" required>
          <UiSelect :model-value="form.departmentId" :options="departmentOptions" placeholder="Pilih departemen" @update:model-value="onDeptPicked" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Tahun" required>
            <UiInput v-model="form.year" placeholder="2026" />
          </UiFormField>
          <UiFormField label="Target Headcount" required>
            <UiInput v-model.number="form.requiredHeadcount" type="number" />
          </UiFormField>
        </div>
        <UiFormField label="Catatan">
          <UiTextarea v-model="form.notes" rows="2" placeholder="e.g. Ekspansi project xyz" />
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
      title="Hapus Target Demand?"
      message="Catatan akan dihapus permanen."
      confirm-text="Ya, Hapus"
      @update:open="showDelete = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>
