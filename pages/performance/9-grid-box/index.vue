<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Pencil, RotateCcw, Save, X, Check, Settings, UserPlus, Move, Sparkles,
} from 'lucide-vue-next'
import { useKpiStore } from '~/stores/kpi'
import { useEmployeesStore } from '~/stores/employees'
import {
  useNineGridStore,
  NINE_GRID_TONES,
  NINE_GRID_ICONS,
  cellKey,
  type NineGridCell,
  type NineGridTone,
} from '~/stores/nine-grid'
import { lucideByName } from '~/composables/useLucideIcon'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('nineGridBox')
useHead({ title: () => title.value })

const kpiStore = useKpiStore()
const employeesStore = useEmployeesStore()
const gridStore = useNineGridStore()

const period = ref(kpiStore.periodOptions[0]?.value ?? '2026-Q1')
const editMode = ref(false)
const dragEmployeeId = ref<string | null>(null)

interface BoxItem {
  id: string
  name: string
  position: string
  perf: number
  pot: number
  manual: boolean
}

type Bucket = 0 | 1 | 2

function bucket(score: number): Bucket {
  if (score >= 75) return 2
  if (score >= 50) return 1
  return 0
}

function autoPotentialFor(empId: string): number {
  const e = employeesStore.getEmployeeById(empId)
  if (!e) return 30
  const cert = (e.certifications?.length ?? 0) * 10
  const exp = Math.min(40, (e.workHistory?.length ?? 0) * 12)
  return Math.min(100, 30 + cert + exp)
}
function autoPerformanceFor(empId: string): number {
  const list = kpiStore.getAssignmentsByEmployeeAndPeriod(empId, period.value)
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

const items = computed<BoxItem[]>(() =>
  employeesStore.employees.map((e) => {
    const ms = gridStore.getManualScore(e.id) ?? {}
    const perf = ms.perf ?? autoPerformanceFor(e.id)
    const pot = ms.pot ?? autoPotentialFor(e.id)
    return {
      id: e.id,
      name: e.name,
      position: e.position,
      perf,
      pot,
      manual: ms.perf !== undefined || ms.pot !== undefined,
    }
  }),
)

/**
 * Determine which cell key an employee falls into.
 * Manual placement override → bypass auto bucket.
 */
function placementOf(item: BoxItem): string {
  const manual = gridStore.getPlacement(item.id)
  if (manual) return manual
  const perfBucket = bucket(item.perf) // 0..2 column index (0 = low perf)
  const potBucket = bucket(item.pot) // 0..2; convert: bucket 2 = High pot = row 0
  const rowIdx = 2 - potBucket
  return cellKey(rowIdx, perfBucket)
}

function inCellByKey(key: string): BoxItem[] {
  return items.value.filter((i) => placementOf(i) === key)
}

// ============================================================================
// TONE & ICON HELPERS
// ============================================================================
const toneClasses: Record<NineGridTone, { bg: string; border: string; chip: string; iconBg: string; iconText: string; dot: string }> = {
  red: { bg: 'bg-red-500/10', border: 'border-red-500/40', chip: 'bg-red-500/15 text-red-300 border-red-500/30', iconBg: 'bg-red-500/20', iconText: 'text-red-400', dot: 'bg-red-500' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/40', chip: 'bg-amber-500/15 text-amber-300 border-amber-500/30', iconBg: 'bg-amber-500/20', iconText: 'text-amber-400', dot: 'bg-amber-500' },
  green: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', iconBg: 'bg-emerald-500/20', iconText: 'text-emerald-400', dot: 'bg-emerald-500' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/40', chip: 'bg-blue-500/15 text-blue-300 border-blue-500/30', iconBg: 'bg-blue-500/20', iconText: 'text-blue-400', dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/40', chip: 'bg-purple-500/15 text-purple-300 border-purple-500/30', iconBg: 'bg-purple-500/20', iconText: 'text-purple-400', dot: 'bg-purple-500' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/40', chip: 'bg-pink-500/15 text-pink-300 border-pink-500/30', iconBg: 'bg-pink-500/20', iconText: 'text-pink-400', dot: 'bg-pink-500' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/40', chip: 'bg-teal-500/15 text-teal-300 border-teal-500/30', iconBg: 'bg-teal-500/20', iconText: 'text-teal-400', dot: 'bg-teal-500' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/40', chip: 'bg-slate-500/15 text-slate-300 border-slate-500/30', iconBg: 'bg-slate-500/20', iconText: 'text-slate-400', dot: 'bg-slate-500' },
}

function dotColor(level: 'low' | 'moderate' | 'high'): string {
  if (level === 'high') return 'bg-emerald-500'
  if (level === 'moderate') return 'bg-amber-500'
  return 'bg-red-500'
}

// ============================================================================
// DISTRIBUTION SUMMARY
// ============================================================================
const distribution = computed(() => {
  const out: Record<string, number> = {}
  for (const cell of gridStore.cells) {
    out[cell.key] = inCellByKey(cell.key).length
  }
  return out
})

// ============================================================================
// CELL EDIT MODAL
// ============================================================================
const showCellEdit = ref(false)
const editingCellKey = ref<string | null>(null)
const cellForm = ref<Omit<NineGridCell, 'key'>>({ title: '', description: '', iconName: 'help-circle', tone: 'green' })

function openCellEdit(key: string) {
  const c = gridStore.getCell(key)
  if (!c) return
  editingCellKey.value = key
  cellForm.value = { title: c.title, description: c.description, iconName: c.iconName, tone: c.tone }
  showCellEdit.value = true
}
function saveCellEdit() {
  if (!editingCellKey.value) return
  gridStore.updateCell(editingCellKey.value, { ...cellForm.value })
  showCellEdit.value = false
}

// ============================================================================
// EMPLOYEE PLACEMENT MODAL (manual move)
// ============================================================================
const showAssign = ref(false)
const assignEmpId = ref<string | null>(null)

function openAssign(empId: string) {
  assignEmpId.value = empId
  showAssign.value = true
}
function moveEmployee(targetKey: string | null) {
  if (!assignEmpId.value) return
  gridStore.setPlacement(assignEmpId.value, targetKey)
  showAssign.value = false
}
function resetEmpToAuto() {
  if (!assignEmpId.value) return
  gridStore.setPlacement(assignEmpId.value, null)
  gridStore.clearManualScore(assignEmpId.value)
  showAssign.value = false
}

// Manual override scores form
const manualPerfInput = ref<number | null>(null)
const manualPotInput = ref<number | null>(null)

function openAssignWithLoad(empId: string) {
  openAssign(empId)
  const ms = gridStore.getManualScore(empId)
  manualPerfInput.value = ms?.perf ?? null
  manualPotInput.value = ms?.pot ?? null
}

function applyManualScores() {
  if (!assignEmpId.value) return
  const updates: { perf?: number; pot?: number } = {}
  if (manualPerfInput.value !== null && manualPerfInput.value !== undefined) updates.perf = Number(manualPerfInput.value)
  if (manualPotInput.value !== null && manualPotInput.value !== undefined) updates.pot = Number(manualPotInput.value)
  if (Object.keys(updates).length > 0) gridStore.setManualScore(assignEmpId.value, updates)
}

// ============================================================================
// DRAG & DROP
// ============================================================================
function onDragStart(empId: string, ev: DragEvent) {
  if (!editMode.value) {
    ev.preventDefault()
    return
  }
  dragEmployeeId.value = empId
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move'
    ev.dataTransfer.setData('text/plain', empId)
  }
}
function onDrop(targetKey: string) {
  if (!editMode.value || !dragEmployeeId.value) return
  gridStore.setPlacement(dragEmployeeId.value, targetKey)
  dragEmployeeId.value = null
}

// ============================================================================
// RESET & STATS
// ============================================================================
const showResetConfirm = ref(false)
function confirmReset() {
  gridStore.resetCells()
  gridStore.clearAllPlacements()
  gridStore.manualScores = {}
  showResetConfirm.value = false
}

const editingEmployee = computed(() => assignEmpId.value ? employeesStore.getEmployeeById(assignEmpId.value) : null)
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="9-Box Talent Review Matrix — performa vs potensi karyawan untuk perencanaan talent."
    >
      <template #actions>
        <div class="w-40">
          <UiSelect v-model="period" :options="kpiStore.periodOptions" />
        </div>
        <UiButton :variant="editMode ? 'gradient' : 'outline'" @click="editMode = !editMode">
          <Pencil v-if="!editMode" class="w-4 h-4" />
          <Check v-else class="w-4 h-4" />
          {{ editMode ? 'Selesai Edit' : 'Edit Mode' }}
        </UiButton>
        <UiButton variant="outline" @click="showResetConfirm = true">
          <RotateCcw class="w-4 h-4" />
          Reset
        </UiButton>
      </template>
    </UiPageHeader>

    <!-- Edit mode banner -->
    <div v-if="editMode" class="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 flex items-center gap-3 text-sm">
      <Sparkles class="w-4 h-4 text-primary" />
      <div class="flex-1">
        <p class="text-primary font-semibold">Edit Mode aktif</p>
        <p class="text-xs text-muted-foreground mt-0.5">
          Klik <span class="font-semibold">ikon pensil</span> di pojok box untuk edit konten/warna/icon.
          Klik <span class="font-semibold">badge karyawan</span> untuk reassign manual atau set skor manual.
          Drag-drop badge antar box juga bisa.
        </p>
      </div>
      <UiStatusBadge v-if="gridStore.overriddenCount > 0" :label="`${gridStore.overriddenCount} override aktif`" tone="warning" />
    </div>

    <!-- Matrix -->
    <div class="glass-card p-4 md:p-6">
      <p class="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase mb-4">9 Box Talent Review Matrix</p>

      <div class="flex gap-3">
        <!-- Y-axis (Potential) -->
        <div class="flex flex-col items-center pt-2 pb-12 shrink-0">
          <p class="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase rotate-180 [writing-mode:vertical-rl] mb-2">Potential</p>
          <div class="flex flex-col items-center gap-1 flex-1">
            <div class="flex flex-col items-center gap-1 flex-1 justify-around w-12">
              <div class="flex flex-col items-center gap-1">
                <span :class="['w-3 h-3 rounded-full', dotColor('high')]" />
                <span class="text-[10px] font-semibold text-foreground">High</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span :class="['w-3 h-3 rounded-full', dotColor('moderate')]" />
                <span class="text-[10px] font-semibold text-foreground">Moderate</span>
              </div>
              <div class="flex flex-col items-center gap-1">
                <span :class="['w-3 h-3 rounded-full', dotColor('low')]" />
                <span class="text-[10px] font-semibold text-foreground">Low</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Grid + X-axis -->
        <div class="flex-1 min-w-0">
          <!-- Grid 3x3 -->
          <div class="grid grid-cols-3 gap-3">
            <template v-for="rIdx in 3" :key="`row-${rIdx - 1}`">
              <div
                v-for="cIdx in 3"
                :key="`${rIdx - 1}-${cIdx - 1}`"
                :class="[
                  'rounded-xl border-2 p-4 min-h-[220px] flex flex-col relative group transition-all',
                  toneClasses[gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.tone ?? 'slate'].bg,
                  toneClasses[gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.tone ?? 'slate'].border,
                  editMode ? 'hover:border-primary/60 hover:shadow-lg' : '',
                ]"
                @dragover.prevent
                @drop="onDrop(cellKey(rIdx - 1, cIdx - 1))"
              >
                <!-- Edit button (only in edit mode) -->
                <button
                  v-if="editMode"
                  type="button"
                  class="absolute top-2 right-2 w-7 h-7 rounded-lg bg-card/80 backdrop-blur-sm border border-border text-muted-foreground hover:text-primary hover:border-primary opacity-0 group-hover:opacity-100 transition flex items-center justify-center z-10"
                  title="Edit box"
                  @click.stop="openCellEdit(cellKey(rIdx - 1, cIdx - 1))"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>

                <div class="flex items-start justify-between gap-2 pr-7">
                  <h4 class="text-sm font-bold text-foreground uppercase tracking-wide">
                    {{ gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.title }}
                  </h4>
                  <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', toneClasses[gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.tone ?? 'slate'].iconBg]">
                    <component
                      :is="lucideByName(gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.iconName ?? 'help-circle')"
                      :class="['w-4 h-4', toneClasses[gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.tone ?? 'slate'].iconText]"
                    />
                  </div>
                </div>
                <p class="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                  {{ gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.description }}
                </p>

                <!-- Employees in this cell -->
                <div class="mt-auto pt-3 flex flex-wrap gap-1">
                  <button
                    v-for="emp in inCellByKey(cellKey(rIdx - 1, cIdx - 1))"
                    :key="emp.id"
                    type="button"
                    :draggable="editMode"
                    :class="[
                      'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border font-medium transition',
                      toneClasses[gridStore.getCellByCoord(rIdx - 1, cIdx - 1)?.tone ?? 'slate'].chip,
                      editMode ? 'cursor-move hover:scale-105' : 'cursor-pointer',
                      gridStore.getPlacement(emp.id) ? 'ring-1 ring-primary/50' : '',
                    ]"
                    :title="`${emp.name} • Perf ${emp.perf}, Pot ${emp.pot}${gridStore.getPlacement(emp.id) ? ' (manual)' : ''}`"
                    @click.stop="openAssignWithLoad(emp.id)"
                    @dragstart="onDragStart(emp.id, $event)"
                  >
                    <Move v-if="editMode" class="w-2.5 h-2.5" />
                    {{ emp.name }}
                  </button>
                  <span v-if="inCellByKey(cellKey(rIdx - 1, cIdx - 1)).length === 0" class="text-[10px] text-muted-foreground/70 italic">— kosong —</span>
                </div>
              </div>
            </template>
          </div>

          <!-- X-axis (Performance) -->
          <div class="grid grid-cols-3 gap-3 mt-3">
            <div v-for="level in (['low', 'moderate', 'high'] as const)" :key="level" class="flex flex-col items-center gap-1">
              <span :class="['w-3 h-3 rounded-full', dotColor(level)]" />
              <span class="text-[10px] font-semibold text-foreground capitalize">{{ level }}</span>
            </div>
          </div>
          <p class="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center mt-2">Performance</p>
        </div>
      </div>
    </div>

    <!-- Distribution summary -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-2">
      <div
        v-for="cell in gridStore.cells"
        :key="cell.key"
        :class="['rounded-lg border p-3', toneClasses[cell.tone].bg, toneClasses[cell.tone].border]"
      >
        <p class="text-[10px] font-semibold text-foreground uppercase tracking-wider truncate">{{ cell.title }}</p>
        <p class="text-2xl font-bold text-foreground mt-1">{{ distribution[cell.key] ?? 0 }}</p>
      </div>
    </div>

    <!-- Legend / How to read -->
    <div class="glass-card p-4">
      <p class="text-sm font-semibold text-foreground mb-3">Cara Membaca</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
        <div class="flex items-start gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
          <p><span class="font-semibold text-foreground">Hijau (Talent)</span> — pertahankan & kembangkan untuk peran lebih tinggi.</p>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-3 h-3 rounded-full bg-amber-500 mt-0.5 shrink-0" />
          <p><span class="font-semibold text-foreground">Kuning (Watch)</span> — butuh intervensi: coaching, stretch goal, atau fokus inovasi.</p>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-3 h-3 rounded-full bg-red-500 mt-0.5 shrink-0" />
          <p><span class="font-semibold text-foreground">Merah (Risk)</span> — perlu reassignment, reklasifikasi, atau exit jika tidak ada perbaikan.</p>
        </div>
      </div>
      <p class="text-xs text-muted-foreground mt-3">
        Bucket otomatis: <span class="font-mono">Low &lt; 50</span>, <span class="font-mono">Moderate 50–74</span>, <span class="font-mono">High ≥ 75</span>.
        Performa diambil dari KPI periode terpilih; potensi dari sertifikasi & pengalaman kerja.
        Anda bisa override bucket per karyawan via <span class="font-semibold text-foreground">Edit Mode</span>.
      </p>
    </div>

    <!-- ============================================================== -->
    <!-- CELL EDIT MODAL -->
    <!-- ============================================================== -->
    <UiModal
      :open="showCellEdit"
      title="Edit Box"
      description="Ubah judul, deskripsi, warna, dan ikon untuk box ini."
      size="lg"
      @update:open="showCellEdit = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Judul" required>
          <UiInput v-model="cellForm.title" placeholder="e.g. Future Leader" />
        </UiFormField>
        <UiFormField label="Deskripsi">
          <UiTextarea v-model="cellForm.description" rows="4" placeholder="Karakteristik & rekomendasi action untuk box ini." />
        </UiFormField>

        <UiFormField label="Warna (Tone)">
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
            <button
              v-for="t in NINE_GRID_TONES"
              :key="t.value"
              type="button"
              :class="[
                'rounded-lg border-2 p-3 flex flex-col items-center gap-1 transition',
                cellForm.tone === t.value ? 'ring-2 ring-primary' : 'hover:border-primary/40',
                toneClasses[t.value].bg,
                toneClasses[t.value].border,
              ]"
              @click="cellForm.tone = t.value"
            >
              <span :class="['w-5 h-5 rounded-full', toneClasses[t.value].dot]" />
              <span class="text-[10px] font-medium text-foreground">{{ t.label }}</span>
            </button>
          </div>
        </UiFormField>

        <UiFormField label="Ikon">
          <div class="grid grid-cols-4 sm:grid-cols-8 gap-2">
            <button
              v-for="iconName in NINE_GRID_ICONS"
              :key="iconName"
              type="button"
              :class="[
                'rounded-lg border-2 aspect-square flex items-center justify-center transition',
                cellForm.iconName === iconName
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground',
              ]"
              :title="iconName"
              @click="cellForm.iconName = iconName"
            >
              <component :is="lucideByName(iconName)" class="w-5 h-5" />
            </button>
          </div>
        </UiFormField>

        <!-- Live preview -->
        <div class="space-y-2">
          <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Preview</p>
          <div :class="['rounded-xl border-2 p-4', toneClasses[cellForm.tone].bg, toneClasses[cellForm.tone].border]">
            <div class="flex items-start justify-between gap-2">
              <h4 class="text-sm font-bold text-foreground uppercase tracking-wide">{{ cellForm.title || 'Judul Box' }}</h4>
              <div :class="['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', toneClasses[cellForm.tone].iconBg]">
                <component :is="lucideByName(cellForm.iconName)" :class="['w-4 h-4', toneClasses[cellForm.tone].iconText]" />
              </div>
            </div>
            <p class="text-xs text-muted-foreground mt-2 leading-relaxed">
              {{ cellForm.description || 'Deskripsi box akan tampil di sini...' }}
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showCellEdit = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!cellForm.title.trim()" @click="saveCellEdit">
          <Save class="w-4 h-4" />
          Simpan
        </UiButton>
      </template>
    </UiModal>

    <!-- ============================================================== -->
    <!-- ASSIGN EMPLOYEE MODAL -->
    <!-- ============================================================== -->
    <UiModal
      :open="showAssign"
      :title="`Atur Penempatan: ${editingEmployee?.name ?? ''}`"
      description="Pilih box manual atau kembalikan ke auto. Anda juga bisa override skor performa/potensi."
      size="lg"
      @update:open="showAssign = $event"
    >
      <div v-if="assignEmpId" class="space-y-4">
        <!-- Box picker -->
        <div>
          <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2">Pindahkan ke Box</p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="cell in gridStore.cells"
              :key="cell.key"
              type="button"
              :class="[
                'rounded-lg border-2 p-3 text-left transition',
                gridStore.getPlacement(assignEmpId) === cell.key ? 'ring-2 ring-primary' : '',
                toneClasses[cell.tone].bg,
                toneClasses[cell.tone].border,
                'hover:border-primary/60',
              ]"
              @click="moveEmployee(cell.key)"
            >
              <div class="flex items-center gap-2">
                <component :is="lucideByName(cell.iconName)" :class="['w-4 h-4', toneClasses[cell.tone].iconText]" />
                <p class="text-xs font-bold text-foreground uppercase tracking-wide">{{ cell.title }}</p>
              </div>
              <p class="text-[10px] text-muted-foreground mt-1 line-clamp-2">{{ cell.description }}</p>
            </button>
          </div>
        </div>

        <!-- Manual scores override -->
        <div class="rounded-xl border border-border p-4 space-y-3">
          <p class="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Override Skor Manual (opsional)</p>
          <p class="text-xs text-muted-foreground">
            Set skor manual untuk override perhitungan otomatis. Kosongkan untuk pakai nilai auto.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <UiFormField label="Performa (0-100)">
              <UiInput v-model.number="manualPerfInput" type="number" :placeholder="`Auto: ${autoPerformanceFor(assignEmpId)}`" />
            </UiFormField>
            <UiFormField label="Potensi (0-100)">
              <UiInput v-model.number="manualPotInput" type="number" :placeholder="`Auto: ${autoPotentialFor(assignEmpId)}`" />
            </UiFormField>
          </div>
          <UiButton variant="outline" size="sm" @click="applyManualScores">
            <Save class="w-3.5 h-3.5" />
            Terapkan Skor Manual
          </UiButton>
        </div>

        <!-- Reset auto -->
        <div class="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center justify-between">
          <div class="text-xs">
            <p class="text-amber-500 font-semibold">Status saat ini: {{ gridStore.getPlacement(assignEmpId) ? 'Override Manual' : 'Auto' }}</p>
            <p class="text-muted-foreground mt-0.5">Reset akan menghapus penempatan manual & skor manual karyawan ini.</p>
          </div>
          <UiButton variant="outline" size="sm" @click="resetEmpToAuto">
            <RotateCcw class="w-3.5 h-3.5" />
            Reset ke Auto
          </UiButton>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showAssign = false">Tutup</UiButton>
      </template>
    </UiModal>

    <!-- ============================================================== -->
    <!-- RESET CONFIRM -->
    <!-- ============================================================== -->
    <UiConfirmDialog
      :open="showResetConfirm"
      title="Reset 9-Box ke Default?"
      message="Konten/warna/icon semua box dikembalikan ke setting awal. Override penempatan manual dan skor manual semua karyawan juga akan dihapus."
      confirm-text="Ya, Reset"
      @update:open="showResetConfirm = $event"
      @confirm="confirmReset"
    />
  </div>
</template>
