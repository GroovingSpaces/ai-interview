<script setup lang="ts">
import { computed } from 'vue'
import { useEmployeesStore } from '~/stores/employees'
import { UserX, UsersRound, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  middleware: 'admin',
})

const t = useModuleT('retired')
const { title } = usePageTitle('retired')
useHead({ title: () => title.value })

const employeesStore = useEmployeesStore()

const retiredEmployees = computed(() =>
  employeesStore.employees.filter((e) => !e.isActive)
)

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function goToEmployee(id: string) {
  navigateTo(`/employees/${id}`)
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
      <p class="text-muted-foreground">{{ t('subtitle') }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-score-low/10">
            <UserX class="w-5 h-5 text-score-low" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ retiredEmployees.length }}</p>
            <p class="text-xs text-muted-foreground">Retired / Inactive</p>
          </div>
        </div>
      </div>
      <div class="glass-card p-4">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-lg bg-muted/50">
            <UsersRound class="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ employeesStore.employeeStats.total }}</p>
            <p class="text-xs text-muted-foreground">Total in database</p>
          </div>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="glass-card overflow-hidden">
      <div class="p-4 border-b border-border">
        <h2 class="text-lg font-semibold text-foreground">Inactive / Retired Employees</h2>
        <p class="text-sm text-muted-foreground">Records marked as inactive (retired or left).</p>
      </div>
      <div v-if="retiredEmployees.length === 0" class="p-12 text-center text-muted-foreground">
        <UserX class="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No retired or inactive employees.</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Employee</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Department</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Position</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Join Date</th>
              <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="emp in retiredEmployees"
              :key="emp.id"
              class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td class="px-4 py-4">
                <div>
                  <p class="font-medium text-foreground">{{ emp.name }}</p>
                  <p class="text-sm text-muted-foreground">{{ emp.email }}</p>
                </div>
              </td>
              <td class="px-4 py-4 text-sm font-mono text-muted-foreground">{{ emp.employeeId }}</td>
              <td class="px-4 py-4 text-sm text-muted-foreground">{{ emp.department }}</td>
              <td class="px-4 py-4 text-sm text-muted-foreground">{{ emp.position }}</td>
              <td class="px-4 py-4 text-sm text-muted-foreground">{{ formatDate(emp.joinDate) }}</td>
              <td class="px-4 py-4 text-right">
                <button
                  type="button"
                  class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  title="View detail"
                  @click="goToEmployee(emp.id)"
                >
                  <ChevronRight class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
