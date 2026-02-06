<script setup lang="ts">
import { computed } from 'vue'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import { useLeaveStore } from '~/stores/leave'
import type { LeaveType } from '~/stores/leave'
import { UsersRound, Building2, CalendarOff, Megaphone, AlertCircle, BarChart3 } from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin',
})

const { title } = usePageTitle('dashboard')
const t = useModuleT('dashboard')
const tLeave = useModuleT('leave')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()
const companyStore = useCompanyStore()
const leaveStore = useLeaveStore()

// Summary stats for dashboard
const summaryTotalEmployee = computed(() => employeesStore.employeeStats.total)
const summaryTotalOrganization = computed(() => companyStore.organizations.length)
const summaryLeaveToday = computed(() => Math.max(0, Number(leaveStore.leaveTodayCount) || 0))
const announcementCount = computed(() => 0)

// Contract ending soon (2 bulan, 1 bulan) - reminder HRD. Exclude PERMANENT.
const contractEndingSoonList = computed(() => {
  const today = new Date()
  const inTwoMonths = new Date(today)
  inTwoMonths.setMonth(inTwoMonths.getMonth() + 2)
  const inTwoMonthsStr = inTwoMonths.toISOString().slice(0, 10)
  return employeesStore.employees
    .filter(
      (e) =>
        e.isActive &&
        e.contractDurationType !== 'PERMANENT' &&
        e.contractEndDate &&
        e.contractEndDate >= today.toISOString().slice(0, 10) &&
        e.contractEndDate <= inTwoMonthsStr
    )
    .map((e) => {
      const end = new Date(e.contractEndDate!)
      const diffMs = end.getTime() - today.getTime()
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      const remaining =
        diffDays > 60 ? '2 bulan' : diffDays > 30 ? '1 bulan' : diffDays > 0 ? `${diffDays} hari` : '0 hari'
      return {
        id: e.id,
        name: e.name,
        employeeId: e.employeeId,
        department: e.department,
        contractEndDate: e.contractEndDate,
        remaining,
        diffDays,
      }
    })
    .sort((a, b) => (a.contractEndDate ?? '').localeCompare(b.contractEndDate ?? ''))
})

// Employees by division (for flowchart / chart)
const employeesByDivision = computed(() => {
  const map = new Map<string, { name: string; count: number }>()
  for (const e of employeesStore.employees.filter((emp) => emp.isActive)) {
    const divId = e.divisionId ?? '_none'
    const name =
      divId === '_none'
        ? (t('noDivision') || 'Lainnya')
        : companyStore.getDivisionById(divId)?.name ?? e.department ?? divId
    if (!map.has(divId)) map.set(divId, { name, count: 0 })
    map.get(divId)!.count += 1
  }
  return Array.from(map.entries())
    .map(([id, v]) => ({ id, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count)
})
const maxDivisionCount = computed(() =>
  employeesByDivision.value.length ? Math.max(...employeesByDivision.value.map((d) => d.count)) : 0
)

// Who's leave today: approved leave where today is between startDate and endDate
const leaveTodayList = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return leaveStore.requests
    .filter(
      (r) =>
        r.status === 'approved' &&
        r.startDate <= today &&
        r.endDate >= today
    )
    .map((r) => {
      const emp = employeesStore.getEmployeeById(r.employeeId)
      return {
        id: r.id,
        employeeName: emp?.name ?? r.employeeId,
        type: r.type,
        reason: r.reason,
        days: r.days,
      }
    })
})

// Today's birthdays: employees whose dateOfBirth month-day matches today
const birthdaysTodayList = computed(() => {
  const today = new Date()
  const mmdd = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return employeesStore.employees
    .filter((e) => {
      if (!e.dateOfBirth || e.dateOfBirth.length < 10) return false
      const dobMmdd = e.dateOfBirth.slice(5, 10)
      return dobMmdd === mmdd
    })
    .map((e) => ({ name: e.name, department: e.department, dateOfBirth: e.dateOfBirth }))
})

function leaveTypeLabel(type: LeaveType): string {
  const key = type === 'annual' ? 'annual' : type === 'sick' ? 'sick' : type === 'personal' ? 'personal' : type === 'unpaid' ? 'unpaid' : 'other'
  return tLeave(key) || type
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
      <p class="text-muted-foreground">{{ t('subtitle') }}</p>
    </div>

    <!-- Summary -->
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-4">{{ t('summary') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-t from-ai-red to-ai-orange text-white">
            <UsersRound class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-sm text-muted-foreground">{{ t('totalEmployee') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ summaryTotalEmployee }}</p>
          </div>
        </div>
        <div class="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-t from-ai-orange to-ai-red text-white">
            <Building2 class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-sm text-muted-foreground">{{ t('totalOrganization') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ summaryTotalOrganization }}</p>
          </div>
        </div>
        <div class="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-t from-ai-red to-ai-orange text-white">
            <CalendarOff class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-sm text-muted-foreground">{{ t('leaveToday') }}</p>
            <p class="text-2xl font-bold text-foreground tabular-nums">{{ summaryLeaveToday }}</p>
          </div>
        </div>
        <div class="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
          <div class="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-t from-ai-orange to-ai-red text-white">
            <Megaphone class="w-6 h-6" />
          </div>
          <div class="min-w-0">
            <p class="text-sm text-muted-foreground">{{ t('announce') }}</p>
            <p class="text-2xl font-bold text-foreground">{{ announcementCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Contract Ending Soon (Reminder HRD) -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="border-b border-border bg-muted/30 px-5 py-4 flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-amber-500" />
        <h2 class="text-lg font-semibold text-foreground">{{ t('contractEndingSoon') || 'Kontrak Akan Berakhir' }}</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[400px] text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left font-medium text-foreground p-3">{{ tLeave('employee') }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ t('department') }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ t('contractEndDate') || 'Tanggal Berakhir' }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ t('remaining') || 'Sisa' }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="contractEndingSoonList.length === 0" class="border-b border-border">
              <td colspan="4" class="p-4 text-muted-foreground text-center">{{ t('noContractEndingSoon') || 'Tidak ada kontrak yang berakhir dalam 2 bulan.' }}</td>
            </tr>
            <tr
              v-for="row in contractEndingSoonList"
              :key="row.id"
              class="border-b border-border hover:bg-muted/30"
            >
              <td class="p-3">
                <NuxtLink :to="`/employees/${row.id}`" class="font-medium text-foreground hover:text-ai-red hover:underline">{{ row.name }}</NuxtLink>
                <span class="text-muted-foreground text-xs block">{{ row.employeeId }}</span>
              </td>
              <td class="p-3 text-muted-foreground">{{ row.department }}</td>
              <td class="p-3 text-foreground">{{ row.contractEndDate }}</td>
              <td class="p-3">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    row.diffDays <= 30 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30' : 'bg-muted/50 text-muted-foreground border border-border',
                  ]"
                >
                  {{ row.remaining }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Employees by Division (flowchart) -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="border-b border-border bg-muted/30 px-5 py-4 flex items-center gap-2">
        <BarChart3 class="w-5 h-5 text-ai-red" />
        <h2 class="text-lg font-semibold text-foreground">{{ t('employeesByDivision') || 'Karyawan per Divisi' }}</h2>
      </div>
      <div class="p-5 space-y-4">
        <p class="text-sm text-muted-foreground">{{ t('employeesByDivisionDesc') || 'Divisi dengan jumlah karyawan terbanyak.' }}</p>
        <div v-if="employeesByDivision.length === 0" class="text-center py-8 text-muted-foreground text-sm">
          {{ t('noDivisionData') || 'Tidak ada data divisi.' }}
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="div in employeesByDivision"
            :key="div.id"
            class="flex items-center gap-3"
          >
            <div class="w-32 text-sm font-medium text-foreground shrink-0">{{ div.name }}</div>
            <div class="flex-1 h-8 rounded-lg bg-muted/50 overflow-hidden flex">
              <div
                class="h-full rounded-lg bg-gradient-to-r from-ai-orange to-ai-red transition-all duration-300"
                :style="{ width: maxDivisionCount ? `${(div.count / maxDivisionCount) * 100}%` : '0%', minWidth: div.count ? '24px' : '0' }"
              />
            </div>
            <span class="w-10 text-sm font-semibold text-foreground tabular-nums">{{ div.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Who's Leave Today -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="border-b border-border bg-muted/30 px-5 py-4">
        <h2 class="text-lg font-semibold text-foreground">{{ t('leaveTodayList') || "Who's Leave Today" }}</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[400px] text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left font-medium text-foreground p-3">{{ tLeave('employee') }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ tLeave('type') }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ tLeave('reason') }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ tLeave('days') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="leaveTodayList.length === 0" class="border-b border-border">
              <td colspan="4" class="p-4 text-muted-foreground text-center">{{ t('noLeaveToday') }}</td>
            </tr>
            <tr
              v-for="row in leaveTodayList"
              :key="row.id"
              class="border-b border-border hover:bg-muted/30"
            >
              <td class="p-3 text-foreground">{{ row.employeeName }}</td>
              <td class="p-3 text-foreground">{{ leaveTypeLabel(row.type) }}</td>
              <td class="p-3 text-muted-foreground">{{ row.reason }}</td>
              <td class="p-3 text-foreground tabular-nums">{{ row.days }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Today's Birthdays -->
    <div class="rounded-xl border border-border bg-card overflow-hidden">
      <div class="border-b border-border bg-muted/30 px-5 py-4">
        <h2 class="text-lg font-semibold text-foreground">{{ t('birthdaysToday') || "Today's Birthdays" }}</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[300px] text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/50">
              <th class="text-left font-medium text-foreground p-3">{{ tLeave('employee') }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ t('department') }}</th>
              <th class="text-left font-medium text-foreground p-3">{{ t('date') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="birthdaysTodayList.length === 0" class="border-b border-border">
              <td colspan="3" class="p-4 text-muted-foreground text-center">{{ t('noBirthdaysToday') }}</td>
            </tr>
            <tr
              v-for="(row, i) in birthdaysTodayList"
              :key="i"
              class="border-b border-border hover:bg-muted/30"
            >
              <td class="p-3 text-foreground">{{ row.name }}</td>
              <td class="p-3 text-muted-foreground">{{ row.department }}</td>
              <td class="p-3 text-foreground">{{ row.dateOfBirth }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
