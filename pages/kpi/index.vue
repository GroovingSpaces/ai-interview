<script setup lang="ts">
import { computed } from 'vue'
import { useKpiStore } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import type { KpiAssignment, KpiStatus } from '~/stores/kpi'
import { Target, FileCheck, UsersRound, Calendar, Filter, Plus, Edit, FileText, ExternalLink, Building2 } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })

const t = useModuleT('kpi')
const tCommon = useModuleT('common')
const { title } = usePageTitle('kpi')
useHead({ title: () => title.value })

const kpiStore = useKpiStore()
const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()

/** KPI per Department: setiap department punya standar KPI yang berbeda (policies dengan applicableTo department) */
const departmentKpiList = computed(() => {
  return companyStore.departments.map((dept) => {
    const policies = kpiStore.policies.filter(
      (p) => p.applicableTo === 'department' && p.departmentId === dept.id
    )
    const allPolicies = kpiStore.policies.filter((p) => p.applicableTo === 'all')
    return {
      id: dept.id,
      name: dept.name,
      code: dept.code,
      departmentPolicies: policies,
      sharedPolicies: allPolicies,
      totalCount: policies.length + allPolicies.length,
    }
  })
})

const employeeOptions = computed(() => [
  { value: '', label: t('allEmployees') || 'All Employees' },
  ...employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` })),
])

const policyOptions = computed(() => [
  { value: '', label: t('allPolicies') || 'All Policies' },
  ...kpiStore.policies.map((p) => ({ value: p.id, label: p.name })),
])

const statusOptions = computed(() => [
  { value: 'all', label: t('allStatus') || 'All Status' },
  { value: 'draft', label: t('draft') || 'Draft' },
  { value: 'in_progress', label: t('inProgress') || 'In Progress' },
  { value: 'submitted', label: t('submitted') || 'Submitted' },
  { value: 'reviewed', label: t('reviewed') || 'Reviewed' },
])

function getEmployeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}

function getPolicyName(id: string) {
  return kpiStore.getPolicyById(id)?.name ?? id
}

function statusLabel(s: KpiStatus): string {
  const m: Record<KpiStatus, string> = {
    draft: t('draft') || 'Draft',
    in_progress: t('inProgress') || 'In Progress',
    submitted: t('submitted') || 'Submitted',
    reviewed: t('reviewed') || 'Reviewed',
  }
  return m[s] ?? s
}

function statusClass(s: KpiStatus): string {
  const classes: Record<KpiStatus, string> = {
    draft: 'bg-muted/50 text-muted-foreground border-border',
    in_progress: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
    submitted: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
    reviewed: 'bg-score-excellent/10 text-score-excellent border-score-excellent/30',
  }
  return classes[s] ?? ''
}

function achievementPercent(assignment: KpiAssignment): number {
  if (assignment.target <= 0) return 0
  return Math.round((assignment.actual / assignment.target) * 100)
}

/** 1 row = 1 employee (per period); evaluate KPI opens page with multiple rows (policies) */
interface EmployeePeriodRow {
  employeeId: string
  period: string
  employeeName: string
  assignments: KpiAssignment[]
  reviewedCount: number
}
const employeePeriodRows = computed<EmployeePeriodRow[]>(() => {
  const list = kpiStore.filteredAssignments
  const map = new Map<string, EmployeePeriodRow>()
  for (const a of list) {
    const key = `${a.employeeId}|${a.period}`
    if (!map.has(key)) {
      map.set(key, {
        employeeId: a.employeeId,
        period: a.period,
        employeeName: getEmployeeName(a.employeeId),
        assignments: [],
        reviewedCount: 0,
      })
    }
    const row = map.get(key)!
    row.assignments.push(a)
    if (a.status === 'reviewed') row.reviewedCount += 1
  }
  return Array.from(map.values()).sort(
    (a, b) => b.period.localeCompare(a.period) || a.employeeName.localeCompare(b.employeeName)
  )
})

function evaluatePath(group: EmployeePeriodRow) {
  return `/kpi/evaluate/${group.employeeId}/${encodeURIComponent(group.period)}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- 1. Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-muted-foreground">
          {{ t('subtitle') || 'KPI per karyawan mencakup beberapa company policies; setiap karyawan dinilai per kebijakan.' }}
        </p>
      </div>
      <NuxtLink to="/kpi/add">
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          {{ t('addKpi') || 'Input KPI' }}
        </UiButton>
      </NuxtLink>
    </div>

    <!-- 2. Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileCheck class="w-6 h-6 text-primary" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground">{{ kpiStore.stats.totalPolicies }}</p>
          <p class="text-xs text-muted-foreground">{{ t('companyPolicies') || 'Company Policies' }}</p>
        </div>
      </div>
      <div class="glass-card p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-ai-orange/10 flex items-center justify-center">
          <Target class="w-6 h-6 text-ai-orange" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground">{{ kpiStore.stats.totalAssignments }}</p>
          <p class="text-xs text-muted-foreground">{{ t('assignments') || 'Assignments' }}</p>
        </div>
      </div>
      <div class="glass-card p-4 flex items-center gap-4">
        <p class="text-2xl font-bold text-score-excellent">{{ kpiStore.stats.reviewed }}</p>
        <p class="text-xs text-muted-foreground">{{ t('reviewed') || 'Reviewed' }}</p>
      </div>
      <div class="glass-card p-4 flex items-center gap-4">
        <p class="text-2xl font-bold text-amber-600">{{ kpiStore.stats.inProgress }}</p>
        <p class="text-xs text-muted-foreground">{{ t('inProgress') || 'In Progress' }}</p>
      </div>
    </div>

    <!-- 3. Filters -->
    <div class="rounded-xl border border-border bg-card p-4">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter class="w-4 h-4 text-muted-foreground" />
          {{ t('filterByPeriod') || 'Period' }}
        </div>
        <UiSelect
          v-model="kpiStore.periodFilter"
          :options="[{ value: '', label: t('allPeriods') || 'All Periods' }, ...kpiStore.periodOptions]"
          class="w-36"
        />
        <div class="flex items-center gap-2 text-sm font-medium text-foreground">
          <UsersRound class="w-4 h-4 text-muted-foreground" />
          {{ t('filterByEmployee') || 'Employee' }}
        </div>
        <UiSelect v-model="kpiStore.employeeFilter" :options="employeeOptions" class="w-52" />
        <div class="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileCheck class="w-4 h-4 text-muted-foreground" />
          {{ t('filterByPolicy') || 'Policy' }}
        </div>
        <UiSelect v-model="kpiStore.policyFilter" :options="policyOptions" class="w-48" />
        <div class="flex items-center gap-2 text-sm font-medium text-foreground">
          {{ t('filterByStatus') || 'Status' }}
        </div>
        <UiSelect v-model="kpiStore.statusFilter" :options="statusOptions" class="w-40" />
      </div>
    </div>

    <!-- 4. Assignments (main content) -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="border-b border-border bg-muted/30 px-5 py-4">
        <h2 class="text-lg font-semibold text-foreground">{{ t('assignments') || 'Assignments' }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ t('assignmentsDesc') || 'Setiap karyawan dinilai berdasarkan beberapa kebijakan perusahaan (company policies) per periode.' }}
        </p>
      </div>
      <div v-if="kpiStore.filteredAssignments.length === 0" class="p-12 text-center text-muted-foreground">
        <Target class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>{{ t('noData') || 'No KPI assignments' }}</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[500px] text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('employee') || 'Employee' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('period') || 'Period' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('policiesCount') || 'Policies' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('statusSummary') || 'Status' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ tCommon('actions') || 'Actions' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in employeePeriodRows"
              :key="`${row.employeeId}-${row.period}`"
              class="border-b border-border hover:bg-muted/30"
            >
              <td class="px-4 py-3 font-medium text-foreground">{{ row.employeeName }}</td>
              <td class="px-4 py-3 text-foreground">{{ row.period }}</td>
              <td class="px-4 py-3 text-muted-foreground tabular-nums">{{ row.assignments.length }}</td>
              <td class="px-4 py-3 text-muted-foreground">
                {{ row.reviewedCount }} / {{ row.assignments.length }} {{ t('reviewed') || 'Reviewed' }}
              </td>
              <td class="px-4 py-3">
                <NuxtLink :to="evaluatePath(row)">
                  <UiButton variant="outline" size="sm">
                    <Edit class="w-4 h-4" />
                    {{ t('evaluateKpi') || 'Menilai' }}
                  </UiButton>
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4b. KPI per Department (standar KPI tiap department) -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="border-b border-border bg-muted/30 px-5 py-4 flex items-center gap-2">
        <Building2 class="w-5 h-5 text-ai-red" />
        <div>
          <h2 class="text-lg font-semibold text-foreground">{{ t('kpiPerDepartment') || 'KPI per Department' }}</h2>
          <p class="text-sm text-muted-foreground">{{ t('kpiPerDepartmentDesc') || 'Standar KPI tiap department berbeda; policy "By Dept" hanya berlaku untuk department terkait.' }}</p>
        </div>
      </div>
      <div class="p-5 space-y-4">
        <div
          v-for="row in departmentKpiList"
          :key="row.id"
          class="rounded-xl border border-border bg-muted/20 p-4"
        >
          <div class="flex items-center gap-2 mb-3">
            <span class="font-semibold text-foreground">{{ row.name }}</span>
            <span class="text-xs text-muted-foreground">({{ row.code }})</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{{ row.totalCount }} KPI</span>
          </div>
          <div class="space-y-2 text-sm">
            <div v-if="row.departmentPolicies.length > 0">
              <span class="text-muted-foreground">{{ t('departmentSpecific') || 'Khusus department' }}:</span>
              <ul class="list-disc list-inside mt-1 text-foreground">
                <li v-for="p in row.departmentPolicies" :key="p.id">{{ p.name }} ({{ p.weight }}%)</li>
              </ul>
            </div>
            <div v-if="row.sharedPolicies.length > 0">
              <span class="text-muted-foreground">{{ t('sharedAll') || 'Umum (semua department)' }}:</span>
              <ul class="list-disc list-inside mt-1 text-foreground">
                <li v-for="p in row.sharedPolicies" :key="p.id">{{ p.name }} ({{ p.weight }}%)</li>
              </ul>
            </div>
            <div v-if="row.totalCount === 0" class="text-muted-foreground">{{ t('noPoliciesForDept') || 'Belum ada policy untuk department ini.' }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. Company Policies (reference) -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="border-b border-border bg-muted/30 px-5 py-4">
        <h2 class="text-lg font-semibold text-foreground">{{ t('companyPolicies') || 'Company Policies' }}</h2>
        <p class="text-sm text-muted-foreground">
          {{ t('policiesDesc') || 'KPI definitions aligned with company policies' }}
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[500px] text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('policyName') || 'Policy Name' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('category') || 'Category' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('targetUnit') || 'Unit' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('weight') || 'Weight' }}</th>
              <th class="px-4 py-3 text-left font-medium text-foreground">{{ t('applicableTo') || 'Applicable To' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="policy in kpiStore.policies"
              :key="policy.id"
              class="border-b border-border hover:bg-muted/30"
            >
              <td class="px-4 py-3">
                <p class="font-medium text-foreground">{{ policy.name }}</p>
                <p class="text-xs text-muted-foreground line-clamp-1">{{ policy.description }}</p>
              </td>
              <td class="px-4 py-3 text-muted-foreground">{{ policy.category }}</td>
              <td class="px-4 py-3 text-foreground">{{ policy.targetUnit }}</td>
              <td class="px-4 py-3 text-foreground tabular-nums">{{ policy.weight }}%</td>
              <td class="px-4 py-3 text-muted-foreground">
                {{ policy.applicableTo === 'all' ? (t('allEmployees') || 'All') : (t('byDepartment') || 'By Dept') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
