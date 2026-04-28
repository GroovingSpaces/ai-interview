<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

interface Props {
  /** Halaman saat ini (0-indexed) */
  pageIndex: number
  /** Total halaman */
  pageCount: number
  /** Ukuran halaman */
  pageSize: number
  /** Total item */
  total: number
  /** Item pertama (1-indexed) di halaman saat ini */
  fromIndex: number
  /** Item terakhir (1-indexed) di halaman saat ini */
  toIndex: number
  /** Pilihan ukuran halaman */
  pageSizes?: number[]
  /** Label item, mis. 'karyawan' / 'kandidat' / 'data' (default: 'item') */
  itemLabel?: string
  /** Sembunyikan saat hanya 1 halaman (default: false) */
  hideOnSinglePage?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  pageSizes: () => [10, 25, 50, 100],
  itemLabel: 'item',
  hideOnSinglePage: false,
})

const emit = defineEmits<{
  'update:pageIndex': [value: number]
  'update:pageSize': [value: number]
}>()

/** Window halaman yang ditampilkan: max 7 angka dengan ellipsis di tengah jika perlu */
const visiblePages = computed(() => {
  const total = props.pageCount
  const current = props.pageIndex + 1 // 1-indexed
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []
  pages.push(1)
  if (current > 4) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 3) pages.push('...')
  pages.push(total)
  return pages
})

const showSinglePage = computed(() => !props.hideOnSinglePage || props.pageCount > 1)
const sizeOptions = computed(() => props.pageSizes.map((n) => ({ value: String(n), label: String(n) })))

function setPage(idx: number) {
  if (idx >= 0 && idx < props.pageCount) emit('update:pageIndex', idx)
}
function setSize(value: string) {
  emit('update:pageSize', Number(value))
}
</script>

<template>
  <div
    v-if="showSinglePage"
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-border bg-card/30"
  >
    <!-- Info -->
    <div class="flex items-center gap-3 flex-wrap">
      <p class="text-xs text-muted-foreground">
        <template v-if="total === 0">
          Tidak ada {{ itemLabel }}
        </template>
        <template v-else>
          Menampilkan
          <span class="font-mono font-semibold text-foreground">{{ fromIndex }}–{{ toIndex }}</span>
          dari
          <span class="font-mono font-semibold text-foreground">{{ total }}</span>
          {{ itemLabel }}
        </template>
      </p>
      <div v-if="pageSizes.length > 1" class="w-20">
        <UiSelect
          :model-value="String(pageSize)"
          :options="sizeOptions"
          class="h-8 text-xs px-2"
          @update:model-value="setSize"
        />
      </div>
    </div>

    <!-- Pager -->
    <div class="flex items-center gap-1">
      <button
        type="button"
        :disabled="pageIndex === 0"
        :class="[
          'inline-flex items-center justify-center w-8 h-8 rounded-md border border-border transition-colors',
          pageIndex === 0
            ? 'opacity-40 cursor-not-allowed text-muted-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        ]"
        title="Halaman pertama"
        @click="setPage(0)"
      >
        <ChevronsLeft class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        :disabled="pageIndex === 0"
        :class="[
          'inline-flex items-center justify-center w-8 h-8 rounded-md border border-border transition-colors',
          pageIndex === 0
            ? 'opacity-40 cursor-not-allowed text-muted-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        ]"
        title="Sebelumnya"
        @click="setPage(pageIndex - 1)"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
      </button>

      <template v-for="(p, i) in visiblePages" :key="`p-${i}`">
        <span
          v-if="p === '...'"
          class="inline-flex items-center justify-center w-8 h-8 text-xs text-muted-foreground"
        >…</span>
        <button
          v-else
          type="button"
          :class="[
            'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-md text-xs font-medium transition-colors',
            pageIndex === p - 1
              ? 'bg-primary text-primary-foreground'
              : 'border border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground',
          ]"
          @click="setPage((p as number) - 1)"
        >{{ p }}</button>
      </template>

      <button
        type="button"
        :disabled="pageIndex >= pageCount - 1"
        :class="[
          'inline-flex items-center justify-center w-8 h-8 rounded-md border border-border transition-colors',
          pageIndex >= pageCount - 1
            ? 'opacity-40 cursor-not-allowed text-muted-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        ]"
        title="Selanjutnya"
        @click="setPage(pageIndex + 1)"
      >
        <ChevronRight class="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        :disabled="pageIndex >= pageCount - 1"
        :class="[
          'inline-flex items-center justify-center w-8 h-8 rounded-md border border-border transition-colors',
          pageIndex >= pageCount - 1
            ? 'opacity-40 cursor-not-allowed text-muted-foreground'
            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
        ]"
        title="Halaman terakhir"
        @click="setPage(pageCount - 1)"
      >
        <ChevronsRight class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>
