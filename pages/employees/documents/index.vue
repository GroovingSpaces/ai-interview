<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Download, FileText, AlertTriangle, Eye } from 'lucide-vue-next'
import { useEmployeesStore, type EmployeeDocument } from '~/stores/employees'
import { DOCUMENT_TYPE_OPTIONS, labelOf } from '~/composables/useEmployeeOptions'
import { formatDate } from '~/lib/utils'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('employeeDocuments')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()
const router = useRouter()

const search = ref('')
const typeFilter = ref<string>('all')

interface Row {
  employeeId: string
  employeeName: string
  doc: EmployeeDocument
  expired: boolean
  expiringSoon: boolean
}

const allDocs = computed<Row[]>(() => {
  const out: Row[] = []
  const now = new Date()
  for (const e of employeesStore.employees) {
    for (const d of e.documents ?? []) {
      const exp = d.expiryDate ? new Date(d.expiryDate) : null
      const expired = exp ? exp.getTime() < now.getTime() : false
      const days = exp ? Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : Infinity
      const expiringSoon = !!exp && !expired && days <= 60
      out.push({ employeeId: e.id, employeeName: e.name, doc: d, expired, expiringSoon })
    }
  }
  return out
})

const filtered = computed(() =>
  allDocs.value.filter((r) => {
    if (typeFilter.value !== 'all' && r.doc.type !== typeFilter.value) return false
    if (search.value) {
      const q = search.value.toLowerCase()
      if (
        !r.doc.name.toLowerCase().includes(q) &&
        !r.employeeName.toLowerCase().includes(q) &&
        !(r.doc.documentNumber ?? '').toLowerCase().includes(q)
      ) return false
    }
    return true
  }),
)

const pagination = usePagination(filtered, { pageSize: 10 })

const typeOptions = [
  { value: 'all', label: 'Semua Tipe' },
  ...DOCUMENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
]

const stats = computed(() => ({
  total: allDocs.value.length,
  expiringSoon: allDocs.value.filter((r) => r.expiringSoon).length,
  expired: allDocs.value.filter((r) => r.expired).length,
}))

function downloadFile(d: EmployeeDocument) {
  if (!d.fileData) return
  const a = document.createElement('a')
  a.href = d.fileData
  a.download = d.fileName || d.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Eksplorasi dokumen seluruh karyawan dengan filter dan unduh cepat." />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Total Dokumen" :value="stats.total" :icon="FileText" />
      <UiStatCard label="Akan Kadaluarsa (60 hari)" :value="stats.expiringSoon" tone="average" :icon="AlertTriangle" />
      <UiStatCard label="Sudah Kadaluarsa" :value="stats.expired" tone="low" :icon="AlertTriangle" />
    </div>

    <div class="glass-card p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput v-model="search" placeholder="Cari nama dokumen, karyawan, atau nomor..." class="pl-9" />
      </div>
      <UiSelect v-model="typeFilter" :options="typeOptions" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Dokumen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Tipe</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">No. Dokumen</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Terbit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kadaluarsa</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in pagination.pagedItems.value" :key="`${r.employeeId}-${r.doc.id}`" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 text-sm">{{ r.employeeName }}</td>
              <td class="px-4 py-3 text-sm font-medium text-foreground">{{ r.doc.name }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ labelOf(DOCUMENT_TYPE_OPTIONS, String(r.doc.type)) }}</td>
              <td class="px-4 py-3 text-sm font-mono text-muted-foreground">{{ r.doc.documentNumber ?? '-' }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ r.doc.issuedDate ? formatDate(r.doc.issuedDate) : '-' }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ r.doc.expiryDate ? formatDate(r.doc.expiryDate) : '-' }}</td>
              <td class="px-4 py-3">
                <UiStatusBadge v-if="r.expired" label="Expired" tone="low" />
                <UiStatusBadge v-else-if="r.expiringSoon" label="Akan Expired" tone="warning" />
                <UiStatusBadge v-else label="Aktif" tone="good" />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-end gap-1">
                  <button class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Lihat profil karyawan" @click="router.push(`/employees/database/${r.employeeId}`)">
                    <Eye class="w-4 h-4" />
                  </button>
                  <button v-if="r.doc.fileData" class="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50" title="Unduh" @click="downloadFile(r.doc)">
                    <Download class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        :icon="FileText"
        title="Tidak ada dokumen"
        description="Tidak ada dokumen yang sesuai filter."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="dokumen"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>
  </div>
</template>
