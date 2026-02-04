<script setup lang="ts">
import { computed } from 'vue'
import { useEmployeesStore } from '~/stores/employees'
import { useCompanyStore } from '~/stores/company'
import { useLeaveStore } from '~/stores/leave'
import type { LeaveType } from '~/stores/leave'
import { UsersRound, Building2, CalendarOff, Megaphone } from 'lucide-vue-next'

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
