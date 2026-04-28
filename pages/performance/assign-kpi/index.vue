<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Plus, Search, Trash2, Save, Send, Copy, Wand2, Layers, Users, Target,
  CheckCircle2, AlertTriangle, Sparkles, FileSpreadsheet, RefreshCw,
} from 'lucide-vue-next'
import { useKpiStore, KPI_CATEGORIES, type KpiPolicy, type KpiAssignment, type CascadeObjective } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('assignKpi')
useHead({ title: () => title.value })

const kpiStore = useKpiStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

const meId = computed(() => authStore.user?.id ?? '99')

// ============================================================================
// SETUP STATE
// ============================================================================
const period = ref<string>(`${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`)
const selectedTeam = ref<string[]>([])
const teamSearchTerm = ref('')
const sourceMode = ref<'blank' | 'template' | 'copy'>('blank')
const sourceTemplateId = ref<string>('')
const sourceCopyPeriod = ref<string>('')
const cascadeId = ref<string>('')

// ============================================================================
// KPI ITEMS (selected for this batch)
// ============================================================================
interface KpiItem {
  policyId: string
  defaultTarget: number
  defaultWeight: number
  policyName?: string
  /** override per-employee: empId → { target, weight } */
  perEmployee: Record<string, { target?: number; weight?: number }>
}
const kpiItems = ref<KpiItem[]>([])

// ============================================================================
// EMPLOYEE TEAM PICKER
// ============================================================================
const teamCandidates = computed(() => {
  const term = teamSearchTerm.value.toLowerCase()
  return employeesStore.employees.filter((e) => {
    if (!e.isActive) return false
    if (!term) return true
    return (
      e.name.toLowerCase().includes(term) ||
      e.position.toLowerCase().includes(term) ||
      e.employeeId.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term)
    )
  })
})

function toggleEmployee(id: string) {
  const i = selectedTeam.value.indexOf(id)
  if (i === -1) selectedTeam.value.push(id)
  else selectedTeam.value.splice(i, 1)
}
function selectAllTeam() {
  selectedTeam.value = teamCandidates.value.map((e) => e.id)
}
function clearTeam() {
  selectedTeam.value = []
}
function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}
function employeeName(id: string) {
  return employeesStore.getEmployeeById(id)?.name ?? id
}

// ============================================================================
// PERIOD OPTIONS
// ============================================================================
const periodOptions = computed(() => {
  const year = new Date().getFullYear()
  const list: { value: string; label: string }[] = []
  for (const y of [year - 1, year, year + 1]) {
    for (const q of ['Q1', 'Q2', 'Q3', 'Q4']) list.push({ value: `${y}-${q}`, label: `${y} ${q}` })
    list.push({ value: `${y}-H1`, label: `${y} Semester 1` })
    list.push({ value: `${y}-H2`, label: `${y} Semester 2` })
    list.push({ value: `${y}-FY`, label: `${y} Full Year` })
  }
  // Tambah periode unik dari assignments yang ada
  const existing = new Set(kpiStore.assignments.map((a) => a.period))
  for (const p of existing) {
    if (!list.some((o) => o.value === p)) list.push({ value: p, label: p })
  }
  return list
})

const previousPeriodOptions = computed(() => {
  const set = new Set(kpiStore.assignments.map((a) => a.period))
  return [{ value: '', label: '— Pilih periode sumber —' }, ...Array.from(set).sort().reverse().map((p) => ({ value: p, label: p }))]
})

// ============================================================================
// KPI LIBRARY PICKER
// ============================================================================
const showLibrary = ref(false)
const libraryFilter = ref('')
const libraryCategoryFilter = ref<string>('all')

const filteredLibrary = computed(() => {
  const term = libraryFilter.value.toLowerCase()
  return kpiStore.policies.filter((p) => {
    if (libraryCategoryFilter.value !== 'all' && p.category !== libraryCategoryFilter.value) return false
    if (!term) return true
    return p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
  })
})

const categoryFilterOptions = [
  { value: 'all', label: 'Semua Kategori' },
  ...KPI_CATEGORIES.map((c) => ({ value: c, label: c })),
]

function addPolicyToBatch(p: KpiPolicy) {
  if (kpiItems.value.some((i) => i.policyId === p.id)) return
  kpiItems.value.push({
    policyId: p.id,
    defaultTarget: 100,
    defaultWeight: p.weight,
    policyName: p.name,
    perEmployee: {},
  })
}
function removeKpiItem(idx: number) {
  kpiItems.value.splice(idx, 1)
}

// ============================================================================
// CUSTOM POLICY (inline create)
// ============================================================================
const showCustomPolicy = ref(false)
const customForm = ref<{ name: string; description: string; category: string; targetUnit: string }>({
  name: '',
  description: '',
  category: KPI_CATEGORIES[0],
  targetUnit: '%',
})
function saveCustomPolicy() {
  if (!customForm.value.name.trim()) return
  const id = kpiStore.addPolicy({
    name: customForm.value.name,
    description: customForm.value.description,
    category: customForm.value.category,
    targetUnit: customForm.value.targetUnit,
    weight: 10,
    applicableTo: 'all',
  })
  const p = kpiStore.getPolicyById(id)
  if (p) addPolicyToBatch(p)
  customForm.value = { name: '', description: '', category: KPI_CATEGORIES[0], targetUnit: '%' }
  showCustomPolicy.value = false
}

// ============================================================================
// TEMPLATE SOURCE
// ============================================================================
function applyTemplate() {
  if (!sourceTemplateId.value) return
  const tpl = kpiStore.getTemplateById(sourceTemplateId.value)
  if (!tpl) return
  kpiItems.value = tpl.items.map((item) => {
    const p = kpiStore.getPolicyById(item.policyId)
    return {
      policyId: item.policyId,
      defaultTarget: item.defaultTarget,
      defaultWeight: item.defaultWeight,
      policyName: p?.name ?? '(unknown)',
      perEmployee: {},
    }
  })
}
function applyCopyFromPeriod() {
  if (!sourceCopyPeriod.value || selectedTeam.value.length === 0) return
  const sourceAssignments = kpiStore.assignments.filter(
    (a) => a.period === sourceCopyPeriod.value && selectedTeam.value.includes(a.employeeId),
  )
  // unique policies
  const map = new Map<string, KpiItem>()
  for (const a of sourceAssignments) {
    if (!map.has(a.policyId)) {
      const p = kpiStore.getPolicyById(a.policyId)
      map.set(a.policyId, {
        policyId: a.policyId,
        defaultTarget: a.target,
        defaultWeight: a.weight ?? p?.weight ?? 10,
        policyName: p?.name ?? '(unknown)',
        perEmployee: {},
      })
    }
    const item = map.get(a.policyId)!
    item.perEmployee[a.employeeId] = { target: a.target, weight: a.weight ?? p_default(a) }
  }
  function p_default(a: KpiAssignment) {
    return kpiStore.getPolicyById(a.policyId)?.weight ?? 10
  }
  kpiItems.value = Array.from(map.values())
}

// ============================================================================
// DEFAULT EVEN WEIGHT DISTRIBUTION
// ============================================================================
function distributeWeightsEvenly() {
  const arr = kpiStore.distributeWeightsEvenly(kpiItems.value.length)
  kpiItems.value.forEach((item, idx) => {
    item.defaultWeight = arr[idx] ?? 0
    // reset per-employee overrides
    item.perEmployee = {}
  })
}

// ============================================================================
// MATRIX HELPERS
// ============================================================================
function cellTarget(item: KpiItem, empId: string): number {
  return item.perEmployee[empId]?.target ?? item.defaultTarget
}
function cellWeight(item: KpiItem, empId: string): number {
  return item.perEmployee[empId]?.weight ?? item.defaultWeight
}
function setCellTarget(item: KpiItem, empId: string, value: number) {
  if (!item.perEmployee[empId]) item.perEmployee[empId] = {}
  item.perEmployee[empId].target = value
}
function setCellWeight(item: KpiItem, empId: string, value: number) {
  if (!item.perEmployee[empId]) item.perEmployee[empId] = {}
  item.perEmployee[empId].weight = value
}
function rowWeightTotal(empId: string): number {
  return kpiItems.value.reduce((sum, item) => sum + Number(cellWeight(item, empId) || 0), 0)
}
function rowWeightOk(empId: string): boolean {
  return rowWeightTotal(empId) === 100
}

function applyDefaultsToAll() {
  for (const item of kpiItems.value) {
    item.perEmployee = {}
  }
}
function autoDistributePerEmployee() {
  const arr = kpiStore.distributeWeightsEvenly(kpiItems.value.length)
  for (const empId of selectedTeam.value) {
    kpiItems.value.forEach((item, idx) => {
      if (!item.perEmployee[empId]) item.perEmployee[empId] = {}
      item.perEmployee[empId].weight = arr[idx] ?? 0
    })
  }
}

// ============================================================================
// VALIDATION
// ============================================================================
const validation = computed(() => {
  const errors: string[] = []
  if (!period.value) errors.push('Pilih periode penilaian.')
  if (selectedTeam.value.length === 0) errors.push('Pilih minimal satu anggota tim.')
  if (kpiItems.value.length === 0) errors.push('Pilih minimal satu KPI.')
  for (const empId of selectedTeam.value) {
    if (!rowWeightOk(empId)) {
      errors.push(`Total bobot untuk ${employeeName(empId)} = ${rowWeightTotal(empId)}% (harus 100%).`)
    }
  }
  return { ok: errors.length === 0, errors }
})

// ============================================================================
// SAVE / SUBMIT
// ============================================================================
const saveResultMessage = ref('')
const showSummary = ref(false)
const lastResult = ref<{ created: number; replaced: number; mode: 'draft' | 'submitted' } | null>(null)

function buildPayload(): {
  employeeIds: string[]
  period: string
  items: { policyId: string; target: number; weight: number }[]
} {
  return {
    employeeIds: selectedTeam.value,
    period: period.value,
    items: kpiItems.value.map((it) => ({
      policyId: it.policyId,
      target: it.defaultTarget,
      weight: it.defaultWeight,
    })),
  }
}

function buildPerEmployeePayload(empId: string) {
  return kpiItems.value.map((it) => ({
    policyId: it.policyId,
    target: cellTarget(it, empId),
    weight: cellWeight(it, empId),
  }))
}

function saveDraft() {
  if (kpiItems.value.length === 0 || selectedTeam.value.length === 0 || !period.value) return
  let totalCreated = 0
  let totalReplaced = 0
  for (const empId of selectedTeam.value) {
    const r = kpiStore.bulkAssign({
      employeeIds: [empId],
      period: period.value,
      items: buildPerEmployeePayload(empId),
      assignedBy: meId.value,
      approvalStatus: 'draft',
      cascadedFromId: cascadeId.value || undefined,
    })
    totalCreated += r.created
    totalReplaced += r.replaced
  }
  lastResult.value = { created: totalCreated, replaced: totalReplaced, mode: 'draft' }
  saveResultMessage.value = `Draft tersimpan: ${totalCreated} dibuat, ${totalReplaced} diperbarui.`
  showSummary.value = true
}

function submitForApproval() {
  if (!validation.value.ok) return
  let totalCreated = 0
  let totalReplaced = 0
  for (const empId of selectedTeam.value) {
    const r = kpiStore.bulkAssign({
      employeeIds: [empId],
      period: period.value,
      items: buildPerEmployeePayload(empId),
      assignedBy: meId.value,
      approvalStatus: 'pending_employee_ack',
      cascadedFromId: cascadeId.value || undefined,
    })
    totalCreated += r.created
    totalReplaced += r.replaced
  }
  lastResult.value = { created: totalCreated, replaced: totalReplaced, mode: 'submitted' }
  saveResultMessage.value = `KPI dikirim ke ${selectedTeam.value.length} karyawan untuk acknowledge.`
  showSummary.value = true
}

// ============================================================================
// EXISTING ASSIGNMENTS PREVIEW (apa yang sudah ada untuk team & period yang dipilih)
// ============================================================================
const existingAssignments = computed(() => {
  if (!period.value || selectedTeam.value.length === 0) return [] as KpiAssignment[]
  return kpiStore.assignments.filter(
    (a) => a.period === period.value && selectedTeam.value.includes(a.employeeId),
  )
})

// Watcher: clear template if mode changes
watch(sourceMode, (mode) => {
  if (mode !== 'template') sourceTemplateId.value = ''
  if (mode !== 'copy') sourceCopyPeriod.value = ''
})

// ============================================================================
// CASCADE OBJECTIVES OPTIONS
// ============================================================================
const cascadeOptions = computed(() => [
  { value: '', label: '— Tidak terhubung —' },
  ...kpiStore.cascadeObjectives.map((c) => ({
    value: c.id,
    label: `[${c.level}] ${c.label}`,
  })),
])
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Assign KPI ke tim Anda — pilih periode, anggota, dan tetapkan target & bobot per indikator."
    />

    <!-- ============================================================== -->
    <!-- SECTION A: SETUP -->
    <!-- ============================================================== -->
    <div class="glass-card p-5 space-y-4">
      <div class="flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-primary" />
        <h3 class="font-semibold text-foreground">1. Setup Penilaian</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UiFormField label="Periode Penilaian" required>
          <UiSelect v-model="period" :options="periodOptions" />
        </UiFormField>
        <UiFormField label="Cascade dari Objective (opsional)" hint="Tautkan KPI ini ke OKR perusahaan/divisi.">
          <UiSelect v-model="cascadeId" :options="cascadeOptions" />
        </UiFormField>
      </div>

      <div>
        <p class="text-sm font-medium text-foreground mb-2">Sumber KPI</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            type="button"
            :class="[
              'rounded-xl border p-3 text-left transition',
              sourceMode === 'blank' ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30',
            ]"
            @click="sourceMode = 'blank'"
          >
            <p class="text-sm font-semibold text-foreground">Mulai Kosong</p>
            <p class="text-xs text-muted-foreground">Pilih KPI satu per satu dari library.</p>
          </button>
          <button
            type="button"
            :class="[
              'rounded-xl border p-3 text-left transition',
              sourceMode === 'template' ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30',
            ]"
            @click="sourceMode = 'template'"
          >
            <p class="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Wand2 class="w-3.5 h-3.5" />
              Pakai Template
            </p>
            <p class="text-xs text-muted-foreground">Bundle KPI siap pakai per role/dept.</p>
          </button>
          <button
            type="button"
            :class="[
              'rounded-xl border p-3 text-left transition',
              sourceMode === 'copy' ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30',
            ]"
            @click="sourceMode = 'copy'"
          >
            <p class="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Copy class="w-3.5 h-3.5" />
              Copy dari Periode Lain
            </p>
            <p class="text-xs text-muted-foreground">Salin KPI tim dari periode sebelumnya.</p>
          </button>
        </div>

        <div v-if="sourceMode === 'template'" class="mt-3 flex items-end gap-2">
          <div class="flex-1">
            <UiFormField label="Pilih Template">
              <UiSelect
                v-model="sourceTemplateId"
                :options="[{ value: '', label: '— Pilih template —' }, ...kpiStore.templates.map((t) => ({ value: t.id, label: t.name }))]"
              />
            </UiFormField>
          </div>
          <UiButton variant="outline" :disabled="!sourceTemplateId" @click="applyTemplate">
            <Wand2 class="w-4 h-4" />
            Terapkan
          </UiButton>
        </div>

        <div v-if="sourceMode === 'copy'" class="mt-3 flex items-end gap-2">
          <div class="flex-1">
            <UiFormField label="Periode Sumber">
              <UiSelect v-model="sourceCopyPeriod" :options="previousPeriodOptions" />
            </UiFormField>
          </div>
          <UiButton variant="outline" :disabled="!sourceCopyPeriod || selectedTeam.length === 0" @click="applyCopyFromPeriod">
            <Copy class="w-4 h-4" />
            Salin
          </UiButton>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SECTION B: TEAM PICKER -->
    <!-- ============================================================== -->
    <div class="glass-card p-5 space-y-4">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <Users class="w-4 h-4 text-primary" />
          <h3 class="font-semibold text-foreground">2. Pilih Anggota Tim</h3>
          <UiStatusBadge :label="`${selectedTeam.length} dipilih`" tone="primary" />
        </div>
        <div class="flex items-center gap-2 text-xs">
          <button class="text-primary hover:underline" @click="selectAllTeam">Pilih semua</button>
          <span class="text-muted-foreground">/</span>
          <button class="text-muted-foreground hover:underline" @click="clearTeam">Kosongkan</button>
        </div>
      </div>

      <div class="relative max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <UiInput v-model="teamSearchTerm" placeholder="Cari nama, NIK, posisi, departemen..." class="pl-9" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
        <label
          v-for="emp in teamCandidates"
          :key="emp.id"
          :class="[
            'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition',
            selectedTeam.includes(emp.id) ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30',
          ]"
        >
          <input
            type="checkbox"
            :checked="selectedTeam.includes(emp.id)"
            class="w-4 h-4 accent-primary shrink-0"
            @change="toggleEmployee(emp.id)"
          >
          <div class="w-9 h-9 rounded-full bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {{ getInitials(emp.name) }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-medium text-foreground truncate">{{ emp.name }}</p>
            <p class="text-[10px] text-muted-foreground truncate">{{ emp.position }} • {{ emp.department }}</p>
          </div>
        </label>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SECTION C: KPI ITEMS -->
    <!-- ============================================================== -->
    <div class="glass-card p-5 space-y-4">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <Target class="w-4 h-4 text-primary" />
          <h3 class="font-semibold text-foreground">3. KPI yang Diberikan</h3>
          <UiStatusBadge :label="`${kpiItems.length} indikator`" tone="primary" />
        </div>
        <div class="flex items-center gap-2">
          <UiButton variant="outline" size="sm" @click="showLibrary = true">
            <Layers class="w-3.5 h-3.5" />
            Pilih dari Library
          </UiButton>
          <UiButton variant="outline" size="sm" @click="showCustomPolicy = true">
            <Plus class="w-3.5 h-3.5" />
            KPI Custom
          </UiButton>
          <UiButton variant="outline" size="sm" :disabled="kpiItems.length === 0" @click="distributeWeightsEvenly">
            <Wand2 class="w-3.5 h-3.5" />
            Distribusi Bobot Rata
          </UiButton>
        </div>
      </div>

      <UiEmptyState
        v-if="kpiItems.length === 0"
        :icon="Target"
        title="Belum ada KPI dipilih"
        description="Pilih KPI dari library, gunakan template, atau buat KPI custom."
      />

      <div v-else class="space-y-2">
        <div
          v-for="(item, idx) in kpiItems"
          :key="item.policyId"
          class="rounded-xl border border-border p-4 space-y-3"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-semibold text-foreground">{{ item.policyName ?? kpiStore.getPolicyById(item.policyId)?.name }}</p>
                <UiStatusBadge :label="kpiStore.getPolicyById(item.policyId)?.category ?? '-'" tone="muted" />
                <UiStatusBadge :label="`Default: ${item.defaultTarget} ${kpiStore.getPolicyById(item.policyId)?.targetUnit ?? ''}`" tone="primary" />
                <UiStatusBadge :label="`Bobot ${item.defaultWeight}%`" tone="average" />
              </div>
              <p class="text-xs text-muted-foreground mt-1">{{ kpiStore.getPolicyById(item.policyId)?.description }}</p>
            </div>
            <button class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="removeKpiItem(idx)">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UiFormField label="Target Default" :hint="`Unit: ${kpiStore.getPolicyById(item.policyId)?.targetUnit}`">
              <UiInput v-model.number="item.defaultTarget" type="number" />
            </UiFormField>
            <UiFormField label="Bobot Default (%)">
              <UiInput v-model.number="item.defaultWeight" type="number" />
            </UiFormField>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SECTION D: ASSIGNMENT MATRIX -->
    <!-- ============================================================== -->
    <div v-if="kpiItems.length > 0 && selectedTeam.length > 0" class="glass-card p-5 space-y-4">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-2">
          <FileSpreadsheet class="w-4 h-4 text-primary" />
          <h3 class="font-semibold text-foreground">4. Matrix Penugasan</h3>
          <span class="text-xs text-muted-foreground">Klik sel untuk override target / bobot per karyawan.</span>
        </div>
        <div class="flex items-center gap-2">
          <UiButton variant="outline" size="sm" @click="applyDefaultsToAll">
            <RefreshCw class="w-3.5 h-3.5" />
            Reset Override ke Default
          </UiButton>
          <UiButton variant="outline" size="sm" @click="autoDistributePerEmployee">
            <Wand2 class="w-3.5 h-3.5" />
            Distribusi Bobot per Karyawan
          </UiButton>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-border">
        <table class="w-full text-sm">
          <thead class="bg-muted/30 border-b border-border">
            <tr>
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider sticky left-0 bg-muted/30 z-10 min-w-[12rem]">
                Karyawan
              </th>
              <th
                v-for="item in kpiItems"
                :key="item.policyId"
                class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider min-w-[14rem]"
              >
                <p class="truncate">{{ item.policyName ?? kpiStore.getPolicyById(item.policyId)?.name }}</p>
                <p class="text-[9px] normal-case font-normal text-muted-foreground/80">
                  unit: {{ kpiStore.getPolicyById(item.policyId)?.targetUnit }}
                </p>
              </th>
              <th class="px-3 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider min-w-[6rem]">
                Total Bobot
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="empId in selectedTeam" :key="empId" class="border-b border-border last:border-0">
              <td class="px-3 py-2 sticky left-0 bg-card z-10">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                    {{ getInitials(employeeName(empId)) }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium text-foreground truncate">{{ employeeName(empId) }}</p>
                    <p class="text-[10px] text-muted-foreground truncate">{{ employeesStore.getEmployeeById(empId)?.position }}</p>
                  </div>
                </div>
              </td>
              <td v-for="item in kpiItems" :key="`${empId}-${item.policyId}`" class="px-2 py-2">
                <div class="grid grid-cols-2 gap-1">
                  <UiInput
                    :model-value="cellTarget(item, empId)"
                    type="number"
                    placeholder="Target"
                    @update:model-value="(v) => setCellTarget(item, empId, Number(v))"
                  />
                  <UiInput
                    :model-value="cellWeight(item, empId)"
                    type="number"
                    placeholder="Bobot %"
                    @update:model-value="(v) => setCellWeight(item, empId, Number(v))"
                  />
                </div>
              </td>
              <td class="px-3 py-2">
                <UiStatusBadge
                  :label="`${rowWeightTotal(empId)}%`"
                  :tone="rowWeightOk(empId) ? 'good' : 'low'"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-xs text-muted-foreground">
        <p>Setiap baris bobot harus sum = <span class="font-semibold text-foreground">100%</span>. Target dan bobot per cell bisa override default.</p>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- SECTION E: EXISTING (preview tabrakan) -->
    <!-- ============================================================== -->
    <div v-if="existingAssignments.length > 0" class="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
      <div class="flex items-center gap-2 text-amber-500">
        <AlertTriangle class="w-4 h-4" />
        <p class="font-semibold">Sudah ada {{ existingAssignments.length }} assignment KPI di periode {{ period }} untuk anggota tim ini</p>
      </div>
      <p class="text-xs text-muted-foreground mt-1">
        Saat disimpan, KPI dengan kombinasi (karyawan + indikator + periode) yang sama akan diperbarui (replace), bukan duplikat.
      </p>
    </div>

    <!-- ============================================================== -->
    <!-- VALIDATION & ACTIONS -->
    <!-- ============================================================== -->
    <div class="rounded-xl border border-border bg-card p-4 space-y-3 sticky bottom-0">
      <div v-if="!validation.ok" class="space-y-1">
        <div class="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle class="w-4 h-4" />
          <span class="font-semibold">Ada {{ validation.errors.length }} validasi yang perlu dilengkapi:</span>
        </div>
        <ul class="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
          <li v-for="(e, i) in validation.errors" :key="i">{{ e }}</li>
        </ul>
      </div>
      <div v-else class="flex items-center gap-2 text-sm text-score-good">
        <CheckCircle2 class="w-4 h-4" />
        <span>Siap di-submit. {{ selectedTeam.length }} karyawan × {{ kpiItems.length }} KPI = {{ selectedTeam.length * kpiItems.length }} assignment.</span>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <UiButton variant="outline" :disabled="kpiItems.length === 0 || selectedTeam.length === 0 || !period" @click="saveDraft">
          <Save class="w-4 h-4" />
          Simpan Draft
        </UiButton>
        <UiButton variant="gradient" :disabled="!validation.ok" @click="submitForApproval">
          <Send class="w-4 h-4" />
          Submit ke Tim
        </UiButton>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- KPI LIBRARY MODAL -->
    <!-- ============================================================== -->
    <UiModal :open="showLibrary" title="Pilih KPI dari Library" description="Indikator master yang sudah tersedia." size="xl" @update:open="showLibrary = $event">
      <div class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <UiInput v-model="libraryFilter" placeholder="Cari indikator..." class="pl-9" />
          </div>
          <UiSelect v-model="libraryCategoryFilter" :options="categoryFilterOptions" />
        </div>
        <div class="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          <div
            v-for="p in filteredLibrary"
            :key="p.id"
            class="rounded-xl border border-border p-3 flex items-start justify-between gap-3"
          >
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="font-medium text-foreground">{{ p.name }}</p>
                <UiStatusBadge :label="p.category" tone="muted" />
                <UiStatusBadge :label="`Bobot default ${p.weight}%`" tone="primary" />
                <UiStatusBadge :label="`Unit ${p.targetUnit}`" tone="muted" />
              </div>
              <p class="text-xs text-muted-foreground mt-1">{{ p.description }}</p>
            </div>
            <UiButton
              size="sm"
              :variant="kpiItems.some((i) => i.policyId === p.id) ? 'outline' : 'gradient'"
              :disabled="kpiItems.some((i) => i.policyId === p.id)"
              @click="addPolicyToBatch(p)"
            >
              {{ kpiItems.some((i) => i.policyId === p.id) ? 'Sudah dipilih' : 'Pilih' }}
            </UiButton>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showLibrary = false">Tutup</UiButton>
      </template>
    </UiModal>

    <!-- ============================================================== -->
    <!-- CUSTOM KPI MODAL -->
    <!-- ============================================================== -->
    <UiModal :open="showCustomPolicy" title="Tambah KPI Custom" description="Buat indikator baru. Akan disimpan ke KPI library." @update:open="showCustomPolicy = $event">
      <div class="space-y-4">
        <UiFormField label="Nama Indikator" required>
          <UiInput v-model="customForm.name" placeholder="e.g. Customer Satisfaction Score" />
        </UiFormField>
        <UiFormField label="Deskripsi">
          <UiTextarea v-model="customForm.description" rows="2" placeholder="Apa yang diukur dan bagaimana caranya." />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UiFormField label="Kategori">
            <UiSelect v-model="customForm.category" :options="KPI_CATEGORIES.map((c) => ({ value: c, label: c }))" />
          </UiFormField>
          <UiFormField label="Unit Target" hint="e.g. %, skor, hari, kasus">
            <UiInput v-model="customForm.targetUnit" />
          </UiFormField>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showCustomPolicy = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!customForm.name.trim()" @click="saveCustomPolicy">
          <Plus class="w-4 h-4" />
          Tambah
        </UiButton>
      </template>
    </UiModal>

    <!-- ============================================================== -->
    <!-- SUMMARY CONFIRMATION -->
    <!-- ============================================================== -->
    <UiModal :open="showSummary" title="Berhasil Disimpan" description="Ringkasan aksi yang baru dilakukan." @update:open="showSummary = $event">
      <div v-if="lastResult" class="space-y-3">
        <div class="flex items-center gap-2 text-score-good">
          <CheckCircle2 class="w-5 h-5" />
          <p class="font-semibold">{{ saveResultMessage }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-xs text-muted-foreground">Mode</p>
            <p class="font-semibold text-foreground">{{ lastResult.mode === 'draft' ? 'Draft (belum dikirim)' : 'Submitted untuk acknowledge' }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-xs text-muted-foreground">Periode</p>
            <p class="font-semibold text-foreground">{{ period }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-xs text-muted-foreground">Assignment Baru</p>
            <p class="font-semibold text-score-good">{{ lastResult.created }}</p>
          </div>
          <div class="rounded-lg bg-muted/30 p-3">
            <p class="text-xs text-muted-foreground">Diperbarui</p>
            <p class="font-semibold text-primary">{{ lastResult.replaced }}</p>
          </div>
        </div>
        <p class="text-xs text-muted-foreground">
          Lihat hasil di halaman <span class="font-mono text-foreground">My KPI</span> (per karyawan) atau <span class="font-mono text-foreground">Team Review</span> (untuk review).
        </p>
      </div>
      <template #footer>
        <UiButton variant="gradient" @click="showSummary = false">OK</UiButton>
      </template>
    </UiModal>
  </div>
</template>

