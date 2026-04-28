import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type NineGridTone = 'red' | 'amber' | 'green' | 'blue' | 'purple' | 'pink' | 'slate' | 'teal'

export interface NineGridCell {
  /** "row-col" format, where row 0 = High potential (top), col 0 = Low performance (left). */
  key: string
  title: string
  description: string
  /** Lucide icon name (kebab-case key) */
  iconName: string
  tone: NineGridTone
}

export const NINE_GRID_TONES: { value: NineGridTone; label: string }[] = [
  { value: 'green', label: 'Green' },
  { value: 'amber', label: 'Amber / Yellow' },
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'pink', label: 'Pink' },
  { value: 'teal', label: 'Teal' },
  { value: 'slate', label: 'Slate' },
]

/** Lucide icon names yang umum dipakai untuk talent matrix (semua ada di lucide-vue-next 0.303). */
export const NINE_GRID_ICONS = [
  'help-circle',
  'sprout',
  'crown',
  'alert-triangle',
  'users',
  'target',
  'frown',
  'check-circle-2',
  'shield-check',
  'sparkles',
  'rocket',
  'star',
  'trophy',
  'flag',
  'heart',
  'gem',
] as const

export function cellKey(rowIdx: number, colIdx: number): string {
  return `${rowIdx}-${colIdx}`
}

function defaultCells(): NineGridCell[] {
  return [
    // Row 0 = High potential
    { key: '0-0', title: 'Enigma', description: 'Profesional senior dengan kapabilitas peran luas, namun masih menghadapi masalah yang butuh coaching dan mentoring.', iconName: 'help-circle', tone: 'amber' },
    { key: '0-1', title: 'Growth Employee', description: 'Kinerja baik di posisi sekarang dengan potensi lebih besar. Beri stretch assignment untuk persiapan jenjang berikutnya.', iconName: 'sprout', tone: 'green' },
    { key: '0-2', title: 'Future Leader', description: 'Performa konsisten tinggi di berbagai assignment. Big-picture thinker, problem solver, dan self-motivated.', iconName: 'crown', tone: 'green' },
    // Row 1 = Moderate potential
    { key: '1-0', title: 'Dilemma', description: 'Dengan coaching tepat dapat berkembang di levelnya. Fokus pada stretch goal untuk karyawan ini.', iconName: 'alert-triangle', tone: 'amber' },
    { key: '1-1', title: 'Core Employee', description: 'Layak dipertimbangkan untuk job enlargement di level yang sama. Dapat ditugaskan ke beberapa area, termasuk people management.', iconName: 'users', tone: 'green' },
    { key: '1-2', title: 'High Impact Performer', description: 'Saat ini masih bisa memberi peluang growth/development. Fokus pada hal taktis, dan bantu mempertajam strategic thinking.', iconName: 'target', tone: 'green' },
    // Row 2 = Low potential
    { key: '2-0', title: 'Under Performer', description: 'Kandidat untuk reassignment, reklasifikasi ke level lebih rendah, atau exit dari organisasi.', iconName: 'frown', tone: 'red' },
    { key: '2-1', title: 'Effective', description: 'Effective performer namun sudah mencapai potensi karir. Coba untuk fokus pada cara kerja yang lebih inovatif (lateral thinking).', iconName: 'check-circle-2', tone: 'amber' },
    { key: '2-2', title: 'Trusted Professional', description: 'Profesional berpengalaman dengan high performance namun sudah mencapai limit jenjang karir. Aset bernilai dan dapat didorong untuk komunikasi & delegation.', iconName: 'shield-check', tone: 'amber' },
  ]
}

export const useNineGridStore = defineStore('nineGrid', () => {
  /** Konfigurasi cell aktif (bisa di-edit) */
  const cells = ref<NineGridCell[]>(defaultCells())

  /**
   * Manual override placement: employeeId → cellKey ('0-0' s.d. '2-2'), atau 'auto' untuk pakai bucket otomatis.
   * Tidak ada entry / undefined = auto.
   */
  const placements = ref<Record<string, string>>({})

  /** Override per karyawan: skor performa & potensi manual (kalau diisi, bypass auto bucket). */
  const manualScores = ref<Record<string, { perf?: number; pot?: number }>>({})

  function getCell(key: string): NineGridCell | undefined {
    return cells.value.find((c) => c.key === key)
  }
  function getCellByCoord(rowIdx: number, colIdx: number): NineGridCell | undefined {
    return getCell(cellKey(rowIdx, colIdx))
  }

  function updateCell(key: string, updates: Partial<Omit<NineGridCell, 'key'>>): boolean {
    const i = cells.value.findIndex((c) => c.key === key)
    if (i === -1) return false
    cells.value[i] = { ...cells.value[i], ...updates }
    return true
  }

  function resetCells() {
    cells.value = defaultCells()
  }

  function setPlacement(employeeId: string, cellKey: string | null) {
    if (!cellKey) {
      delete placements.value[employeeId]
    } else {
      placements.value[employeeId] = cellKey
    }
  }
  function getPlacement(employeeId: string): string | undefined {
    return placements.value[employeeId]
  }
  function clearAllPlacements() {
    placements.value = {}
  }

  function setManualScore(employeeId: string, scores: { perf?: number; pot?: number }) {
    manualScores.value[employeeId] = { ...manualScores.value[employeeId], ...scores }
  }
  function clearManualScore(employeeId: string) {
    delete manualScores.value[employeeId]
  }
  function getManualScore(employeeId: string) {
    return manualScores.value[employeeId]
  }

  const overriddenCount = computed(() => Object.keys(placements.value).length)

  return {
    cells,
    placements,
    manualScores,
    overriddenCount,
    getCell,
    getCellByCoord,
    updateCell,
    resetCells,
    setPlacement,
    getPlacement,
    clearAllPlacements,
    setManualScore,
    clearManualScore,
    getManualScore,
  }
})
