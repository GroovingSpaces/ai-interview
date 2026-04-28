<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, GraduationCap } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('trainingSuggestions')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()

interface Suggestion {
  employeeId: string
  name: string
  position: string
  suggestions: { module: string; reason: string }[]
}

function suggestionsFor(empId: string): { module: string; reason: string }[] {
  const e = employeesStore.getEmployeeById(empId)
  if (!e) return []
  const out: { module: string; reason: string }[] = []
  const certs = (e.certifications ?? []).map((c) => c.name.toLowerCase())
  if (e.position.toLowerCase().includes('engineer') && !certs.some((c) => c.includes('aws') || c.includes('cloud'))) {
    out.push({ module: 'Cloud Fundamentals (AWS / GCP)', reason: 'Engineer tanpa sertifikasi cloud' })
  }
  if (e.position.toLowerCase().includes('manager') && !certs.some((c) => c.includes('leadership'))) {
    out.push({ module: 'Leadership 101', reason: 'Manager tanpa training leadership formal' })
  }
  if ((e.certifications?.length ?? 0) === 0) {
    out.push({ module: 'Sertifikasi Dasar Industri', reason: 'Belum memiliki sertifikasi' })
  }
  if (e.position.toLowerCase().includes('hr')) {
    out.push({ module: 'People Analytics', reason: 'Skill HR modern: data-driven decisions' })
  }
  return out.slice(0, 3)
}

const suggestions = computed<Suggestion[]>(() =>
  employeesStore.employees
    .map((e) => ({ employeeId: e.id, name: e.name, position: e.position, suggestions: suggestionsFor(e.id) }))
    .filter((s) => s.suggestions.length > 0),
)
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Rekomendasi training berdasarkan posisi, sertifikasi, dan gap karyawan." />

    <UiEmptyState
      v-if="suggestions.length === 0"
      :icon="GraduationCap"
      title="Tidak ada rekomendasi"
      description="Semua karyawan sudah memiliki pelatihan yang sesuai."
    />

    <div v-else class="space-y-3">
      <div v-for="s in suggestions" :key="s.employeeId" class="glass-card p-5">
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-semibold text-foreground">{{ s.name }}</p>
            <p class="text-sm text-muted-foreground">{{ s.position }}</p>
          </div>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            <Sparkles class="w-3 h-3" />
            {{ s.suggestions.length }} rekomendasi
          </span>
        </div>
        <ul class="mt-3 space-y-2">
          <li v-for="sug in s.suggestions" :key="sug.module" class="rounded-lg border border-border p-3">
            <div class="flex items-center gap-2">
              <GraduationCap class="w-4 h-4 text-primary" />
              <p class="font-medium text-foreground">{{ sug.module }}</p>
            </div>
            <p class="text-sm text-muted-foreground mt-1">{{ sug.reason }}</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
