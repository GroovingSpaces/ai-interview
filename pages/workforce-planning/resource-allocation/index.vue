<script setup lang="ts">
import { computed } from 'vue'
import { Users, Building2 } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('resourceAllocation')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

const allocByDivision = computed(() =>
  companyStore.divisions.map((div) => ({
    name: div.name,
    employees: employeesStore.employees.filter((e) => e.divisionId === div.id && e.isActive),
  })),
)

const allocByLocation = computed(() =>
  companyStore.locations.map((loc) => ({
    name: loc.name,
    employees: employeesStore.employees.filter((e) => e.locationId === loc.id && e.isActive),
  })),
)
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Distribusi karyawan per divisi dan lokasi kerja." />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        <div class="p-4 border-b border-border flex items-center gap-2">
          <Building2 class="w-4 h-4 text-muted-foreground" />
          <h3 class="font-semibold text-foreground">Per Divisi</h3>
        </div>
        <div class="divide-y divide-border">
          <div v-for="row in allocByDivision" :key="row.name" class="p-4">
            <div class="flex items-center justify-between">
              <p class="font-medium text-foreground">{{ row.name }}</p>
              <UiStatusBadge :label="`${row.employees.length} orang`" tone="primary" />
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <span v-for="e in row.employees" :key="e.id" class="px-2 py-0.5 rounded-md bg-muted/50 text-xs">{{ e.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
        <div class="p-4 border-b border-border flex items-center gap-2">
          <Users class="w-4 h-4 text-muted-foreground" />
          <h3 class="font-semibold text-foreground">Per Lokasi</h3>
        </div>
        <div class="divide-y divide-border">
          <div v-for="row in allocByLocation" :key="row.name" class="p-4">
            <div class="flex items-center justify-between">
              <p class="font-medium text-foreground">{{ row.name }}</p>
              <UiStatusBadge :label="`${row.employees.length} orang`" tone="primary" />
            </div>
            <div class="mt-2 flex flex-wrap gap-1">
              <span v-for="e in row.employees" :key="e.id" class="px-2 py-0.5 rounded-md bg-muted/50 text-xs">{{ e.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
