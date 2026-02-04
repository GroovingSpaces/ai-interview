<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePromotionsStore } from '~/stores/promotions'
import { useEmployeesStore } from '~/stores/employees'
import type { Promotion } from '~/stores/promotions'
import { Plus, Edit, Trash2, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
const t = useModuleT('promotion')
const tCommon = useModuleT('common')
const tDash = useModuleT('dashboard')
const tAtt = useModuleT('attendance')
const { title } = usePageTitle('promotion')
useHead({ title: () => title.value })

const promotionsStore = usePromotionsStore()
const employeesStore = useEmployeesStore()
const showDeleteModal = ref(false)
const selected = ref<Promotion | null>(null)

const employeeOptions = computed(() =>
  employeesStore.employees
    .filter((e) => e.isActive)
    .map((e) => ({ value: e.id, label: `${e.name} (${e.employeeId})` }))
)

function getEmployeeName(employeeId: string) {
  return employeesStore.getEmployeeById(employeeId)?.name ?? employeeId
}

function openDelete(item: Promotion) {
  selected.value = item
  showDeleteModal.value = true
}
function closeModals() {
  showDeleteModal.value = false
  selected.value = null
}
function handleDelete() {
  if (!selected.value) return
  promotionsStore.deletePromotion(selected.value.id)
  closeModals()
}

function goToEmployee(id: string) {
  navigateTo(`/employees/${id}`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ title }}</h1>
        <p class="text-muted-foreground">{{ t('subtitle') }}</p>
      </div>
      <NuxtLink to="/employees/promotion/add">
        <UiButton variant="gradient">
          <Plus class="w-4 h-4" />
          {{ t('addPromotion') }}
        </UiButton>
      </NuxtLink>
    </div>

    <div class="glass-card p-4">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-score-excellent/10">
          <TrendingUp class="w-5 h-5 text-score-excellent" />
        </div>
        <div>
          <p class="text-2xl font-bold text-foreground">{{ promotionsStore.stats.total }}</p>
          <p class="text-xs text-muted-foreground">{{ tDash('total') }} {{ title }}</p>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <UiSelect
        v-model="promotionsStore.employeeFilter"
        :options="[{ value: '', label: tAtt('allEmployees') }, ...employeeOptions]"
        class="w-52"
      />
      <UiInput v-model="promotionsStore.dateFilter" type="date" :placeholder="t('promotionDate')" class="w-40" />
    </div>

    <div v-if="promotionsStore.filteredRecords.length === 0" class="glass-card p-12 text-center">
      <TrendingUp class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">{{ t('noData') }}</h3>
      <p class="text-muted-foreground mb-4">{{ t('addFirst') }}</p>
      <NuxtLink to="/employees/promotion/add">
        <UiButton variant="gradient"><Plus class="w-4 h-4" /> {{ t('addPromotion') }}</UiButton>
      </NuxtLink>
    </div>

    <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50">
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">{{ tCommon('actions') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('employee') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('fromPosition') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('toPosition') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('department') }}</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">{{ t('promotionDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in promotionsStore.filteredRecords"
              :key="item.id"
              class="border-b border-border last:border-0 hover:bg-muted/30"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                <NuxtLink :to="`/employees/promotion/${item.id}/edit`">
                  <button class="p-2 rounded-lg hover:bg-muted/50" :title="tCommon('edit')" type="button"><Edit class="w-4 h-4" /></button>
                </NuxtLink>
                <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" :title="tCommon('delete')" @click="openDelete(item)"><Trash2 class="w-4 h-4" /></button>
              </td>
              <td class="px-4 py-3">
                <button
                  type="button"
                  class="font-medium text-foreground hover:text-primary flex items-center gap-1"
                  @click="goToEmployee(item.employeeId)"
                >
                  {{ getEmployeeName(item.employeeId) }}
                  <ChevronRight class="w-4 h-4" />
                </button>
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ item.fromPosition }}</td>
              <td class="px-4 py-3 text-sm font-medium text-foreground">{{ item.toPosition }}</td>
              <td class="px-4 py-3 text-sm">{{ item.toDepartment ?? item.fromDepartment ?? '-' }}</td>
              <td class="px-4 py-3 text-sm">{{ item.promotionDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 text-center">
            <AlertTriangle class="w-12 h-12 mx-auto text-score-low mb-4" />
            <h2 class="text-lg font-bold mb-2">{{ t('deletePromotion') }}</h2>
            <p class="text-muted-foreground mb-6">{{ t('deleteConfirm', { name: selected ? getEmployeeName(selected.employeeId) : '' }) }}</p>
            <div class="flex justify-center gap-3">
              <UiButton variant="outline" @click="closeModals">{{ tCommon('cancel') }}</UiButton>
              <UiButton variant="outline" class="text-score-low border-score-low/30 hover:bg-score-low/10" @click="handleDelete"><Trash2 class="w-4 h-4" /> {{ tCommon('delete') }}</UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
