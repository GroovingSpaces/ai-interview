import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

export interface UsePaginationOptions {
  /** Default ukuran halaman (default: 10) */
  pageSize?: number
  /** Pilihan ukuran halaman yang tersedia */
  pageSizes?: number[]
}

export interface UsePaginationReturn<T> {
  /** Halaman saat ini (0-indexed) */
  pageIndex: Ref<number>
  /** Ukuran halaman saat ini */
  pageSize: Ref<number>
  /** Slice item halaman saat ini */
  pagedItems: ComputedRef<T[]>
  /** Total halaman */
  pageCount: ComputedRef<number>
  /** Total item */
  total: ComputedRef<number>
  /** Item pertama (1-indexed) di halaman saat ini */
  fromIndex: ComputedRef<number>
  /** Item terakhir (1-indexed) di halaman saat ini */
  toIndex: ComputedRef<number>
  /** Pilihan ukuran halaman */
  pageSizes: number[]
  /** Pindah ke halaman tertentu */
  goToPage: (index: number) => void
  nextPage: () => void
  prevPage: () => void
  /** Ganti ukuran halaman (akan reset ke halaman 0) */
  setPageSize: (size: number) => void
}

/**
 * Hook pagination reusable untuk seluruh table di portal.
 * - Auto-clamp pageIndex ketika source data berubah (mis. setelah filter).
 * - Kembalikan pagedItems siap dipakai di template.
 */
export function usePagination<T>(
  items: Ref<T[]> | ComputedRef<T[]>,
  options: UsePaginationOptions = {},
): UsePaginationReturn<T> {
  const pageSizes = options.pageSizes ?? [10, 25, 50, 100]
  const pageSize = ref(options.pageSize ?? 10)
  const pageIndex = ref(0)

  const total = computed(() => items.value.length)
  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  // Auto-clamp pageIndex saat data/pageSize berubah
  watch([total, pageSize], () => {
    if (pageIndex.value > pageCount.value - 1) {
      pageIndex.value = Math.max(0, pageCount.value - 1)
    }
  })

  const pagedItems = computed(() => {
    const start = pageIndex.value * pageSize.value
    return items.value.slice(start, start + pageSize.value)
  })

  const fromIndex = computed(() => (total.value === 0 ? 0 : pageIndex.value * pageSize.value + 1))
  const toIndex = computed(() => Math.min((pageIndex.value + 1) * pageSize.value, total.value))

  function goToPage(idx: number) {
    pageIndex.value = Math.max(0, Math.min(idx, pageCount.value - 1))
  }
  function nextPage() {
    if (pageIndex.value < pageCount.value - 1) pageIndex.value++
  }
  function prevPage() {
    if (pageIndex.value > 0) pageIndex.value--
  }
  function setPageSize(size: number) {
    pageSize.value = size
    pageIndex.value = 0
  }

  return {
    pageIndex,
    pageSize,
    pagedItems,
    pageCount,
    total,
    fromIndex,
    toIndex,
    pageSizes,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  }
}
