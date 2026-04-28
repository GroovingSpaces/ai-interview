<script setup lang="ts">
import { computed } from 'vue'
import { Award, AlertTriangle } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('certifications')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()

interface CertRow {
  employeeId: string
  employeeName: string
  cert: { name: string; issuer: string; date: string; expiryDate?: string; credentialId?: string }
  expiringSoon: boolean
  expired: boolean
}

const allCerts = computed<CertRow[]>(() => {
  const out: CertRow[] = []
  const now = new Date()
  for (const e of employeesStore.employees) {
    for (const c of e.certifications ?? []) {
      const exp = c.expiryDate ? new Date(c.expiryDate) : null
      const expired = exp ? exp.getTime() < now.getTime() : false
      const days = exp ? Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : Infinity
      const expiringSoon = !!exp && !expired && days <= 90
      out.push({ employeeId: e.id, employeeName: e.name, cert: c, expired, expiringSoon })
    }
  }
  return out.sort((a, b) => (a.cert.expiryDate ?? '').localeCompare(b.cert.expiryDate ?? ''))
})

const stats = computed(() => ({
  total: allCerts.value.length,
  expiringSoon: allCerts.value.filter((c) => c.expiringSoon).length,
  expired: allCerts.value.filter((c) => c.expired).length,
}))

const pagination = usePagination(allCerts, { pageSize: 10 })
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Daftar sertifikasi seluruh karyawan dan status kadaluarsanya." />

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UiStatCard label="Total Sertifikasi" :value="stats.total" :icon="Award" />
      <UiStatCard label="Akan Kadaluarsa (90 hari)" :value="stats.expiringSoon" tone="average" :icon="AlertTriangle" />
      <UiStatCard label="Sudah Kadaluarsa" :value="stats.expired" tone="low" :icon="AlertTriangle" />
    </div>

    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Karyawan</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Sertifikasi</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Penerbit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">No. Kredensial</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Terbit</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kadaluarsa</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in pagination.pagedItems.value" :key="i" class="border-b border-border last:border-0">
              <td class="px-4 py-3 text-sm">{{ row.employeeName }}</td>
              <td class="px-4 py-3 text-sm font-medium text-foreground">{{ row.cert.name }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ row.cert.issuer }}</td>
              <td class="px-4 py-3 text-sm font-mono text-muted-foreground">{{ row.cert.credentialId ?? '-' }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ row.cert.date ? formatDate(row.cert.date) : '-' }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ row.cert.expiryDate ? formatDate(row.cert.expiryDate) : 'Permanent' }}</td>
              <td class="px-4 py-3">
                <UiStatusBadge
                  v-if="row.expired"
                  label="Expired"
                  tone="low"
                />
                <UiStatusBadge
                  v-else-if="row.expiringSoon"
                  label="Akan Expired"
                  tone="warning"
                />
                <UiStatusBadge v-else label="Aktif" tone="good" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <UiEmptyState
        v-if="pagination.total.value === 0"
        :icon="Award"
        title="Belum ada sertifikasi"
        description="Sertifikasi karyawan akan muncul di sini."
      />
      <UiPagination
        v-else
        :page-index="pagination.pageIndex.value"
        :page-count="pagination.pageCount.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.total.value"
        :from-index="pagination.fromIndex.value"
        :to-index="pagination.toIndex.value"
        item-label="sertifikasi"
        @update:page-index="pagination.goToPage"
        @update:page-size="pagination.setPageSize"
      />
    </div>
  </div>
</template>
