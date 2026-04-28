<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, CheckCheck, ClipboardCheck } from 'lucide-vue-next'
import { useKpiStore } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('teamReview')
useHead({ title: () => title.value })

const kpiStore = useKpiStore()
const employeesStore = useEmployeesStore()

const period = ref(kpiStore.periodOptions[0]?.value ?? '2026-Q1')
const search = ref('')

const teamMembers = computed(() => {
  const term = search.value.toLowerCase()
  return employeesStore.employees.filter(
    (e) =>
      !term ||
      e.name.toLowerCase().includes(term) ||
      e.employeeId.toLowerCase().includes(term) ||
      e.position.toLowerCase().includes(term),
  )
})

function memberAssignments(empId: string) {
  return kpiStore.getAssignmentsByEmployeeAndPeriod(empId, period.value)
}
function memberScore(empId: string) {
  const list = memberAssignments(empId)
  if (list.length === 0) return 0
  let s = 0, w = 0
  for (const a of list) {
    const p = kpiStore.getPolicyById(a.policyId)
    if (!p) continue
    s += (a.target > 0 ? Math.min(100, (a.actual / a.target) * 100) : 0) * p.weight
    w += p.weight
  }
  return w === 0 ? 0 : Math.round(s / w)
}

const showReview = ref(false)
const reviewingEmpId = ref<string | null>(null)

function openReview(id: string) {
  reviewingEmpId.value = id
  showReview.value = true
}
function approve(id: string) {
  kpiStore.updateAssignment(id, { status: 'reviewed' })
}
function approveAllForReviewing() {
  if (!reviewingEmpId.value) return
  for (const a of memberAssignments(reviewingEmpId.value)) {
    if (a.status === 'submitted') kpiStore.updateAssignment(a.id, { status: 'reviewed' })
  }
}

function reviewing() {
  return reviewingEmpId.value ? employeesStore.getEmployeeById(reviewingEmpId.value) : null
}
function reviewAdjust(id: string, value: string | number) {
  kpiStore.updateAssignment(id, { actual: Number(value) || 0 })
}
function reviewNote(id: string, value: string) {
  kpiStore.updateAssignment(id, { notes: value })
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader :title="title" subtitle="Review dan kalibrasi pencapaian KPI tim Anda.">
      <template #actions>
        <div class="w-40">
          <UiSelect v-model="period" :options="kpiStore.periodOptions" />
        </div>
      </template>
    </UiPageHeader>

    <div class="glass-card p-4">
      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput v-model="search" placeholder="Cari nama, NIK, atau jabatan tim..." class="pl-9" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="m in teamMembers"
        :key="m.id"
        class="glass-card p-5 cursor-pointer hover:bg-card/70"
        @click="openReview(m.id)"
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-white font-semibold">
            {{ m.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-foreground truncate">{{ m.name }}</p>
            <p class="text-xs text-muted-foreground">{{ m.position }}</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>Skor</span>
            <span class="font-semibold text-foreground">{{ memberScore(m.id) }}%</span>
          </div>
          <div class="mt-1 h-2 rounded-full bg-muted overflow-hidden">
            <div class="h-full bg-primary" :style="{ width: `${memberScore(m.id)}%` }" />
          </div>
        </div>
        <div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <ClipboardCheck class="w-3.5 h-3.5" />
          <span>{{ memberAssignments(m.id).length }} KPI</span>
        </div>
      </div>
    </div>

    <UiModal
      :open="showReview"
      :title="`Review KPI: ${reviewing()?.name ?? ''}`"
      description="Sesuaikan realisasi, beri catatan, dan finalisasi."
      size="xl"
      @update:open="showReview = $event"
    >
      <div class="space-y-4">
        <div v-if="reviewingEmpId">
          <div
            v-for="a in memberAssignments(reviewingEmpId)"
            :key="a.id"
            class="rounded-xl border border-border p-4 space-y-3"
          >
            <div class="flex items-center justify-between gap-2 flex-wrap">
              <p class="font-medium text-foreground">{{ kpiStore.getPolicyById(a.policyId)?.name }}</p>
              <UiStatusBadge
                :label="a.status === 'reviewed' ? 'Final' : a.status === 'submitted' ? 'Submitted' : 'Draft'"
                :tone="a.status === 'reviewed' ? 'good' : a.status === 'submitted' ? 'primary' : 'average'"
              />
            </div>
            <div class="grid grid-cols-3 gap-3 text-sm">
              <UiFormField label="Target">
                <UiInput :model-value="a.target" disabled />
              </UiFormField>
              <UiFormField label="Realisasi">
                <UiInput :model-value="a.actual" type="number" @update:model-value="reviewAdjust(a.id, $event)" />
              </UiFormField>
              <UiFormField label="Pencapaian">
                <UiInput :model-value="`${a.target > 0 ? Math.round((a.actual / a.target) * 100) : 0}%`" disabled />
              </UiFormField>
            </div>
            <UiFormField label="Catatan Reviewer">
              <UiTextarea :model-value="a.notes ?? ''" rows="2" @update:model-value="reviewNote(a.id, $event)" />
            </UiFormField>
            <div class="flex justify-end">
              <UiButton variant="outline" size="sm" :disabled="a.status === 'reviewed'" @click="approve(a.id)">
                <CheckCheck class="w-4 h-4" />
                Tandai Final
              </UiButton>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showReview = false">Tutup</UiButton>
        <UiButton variant="gradient" @click="approveAllForReviewing">
          <CheckCheck class="w-4 h-4" />
          Finalisasi Semua
        </UiButton>
      </template>
    </UiModal>
  </div>
</template>
