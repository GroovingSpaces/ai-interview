<script setup lang="ts">
import { ref, h } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  FlexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/vue-table'
import { useCandidatesStore, type Candidate } from '~/stores/candidates'
import { cn, formatDate, getScoreColor } from '~/lib/utils'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Sparkles,
} from 'lucide-vue-next'

const candidatesStore = useCandidatesStore()

const sorting = ref<SortingState>([])
const globalFilter = ref('')

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  applied: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  screening: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  interview: { bg: 'bg-ai-cyan/10', text: 'text-ai-cyan', border: 'border-ai-cyan/30' },
  assessment: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  offer: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  hired: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  rejected: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
}

const scoreColorClasses: Record<string, string> = {
  excellent: 'from-score-excellent to-emerald-400 text-score-excellent border-score-excellent/30 bg-score-excellent/10',
  good: 'from-score-good to-green-400 text-score-good border-score-good/30 bg-score-good/10',
  average: 'from-score-average to-yellow-400 text-score-average border-score-average/30 bg-score-average/10',
  low: 'from-score-low to-red-400 text-score-low border-score-low/30 bg-score-low/10',
}

const columns: ColumnDef<Candidate>[] = [
  {
    accessorKey: 'name',
    header: 'Candidate',
    cell: ({ row }) => {
      const candidate = row.original
      const initials = candidate.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', {
          class: 'flex h-10 w-10 shrink-0 overflow-hidden rounded-full items-center justify-center bg-gradient-to-br from-ai-cyan to-ai-purple font-semibold text-white text-sm'
        }, initials),
        h('div', { class: 'min-w-0' }, [
          h('p', { class: 'font-medium text-foreground truncate' }, candidate.name),
          h('p', { class: 'text-sm text-muted-foreground truncate' }, candidate.email),
        ]),
      ])
    },
  },
  {
    accessorKey: 'position',
    header: 'Position',
    cell: ({ getValue }) => {
      return h('div', { class: 'min-w-0' }, [
        h('p', { class: 'font-medium text-foreground truncate' }, getValue() as string),
      ])
    },
  },
  {
    accessorKey: 'aiScore',
    header: 'AI Score',
    cell: ({ getValue }) => {
      const score = getValue() as number
      const colorKey = getScoreColor(score)
      const colorClass = scoreColorClasses[colorKey]
      
      return h('div', {
        class: cn(
          'inline-flex items-center gap-1.5 rounded-full font-semibold border transition-all duration-200 text-xs px-2 py-0.5',
          colorClass
        )
      }, [
        h(Sparkles, { class: 'w-3 h-3' }),
        h('span', {}, `${score}%`),
      ])
    },
  },
  {
    accessorKey: 'stage',
    header: 'Stage',
    cell: ({ getValue }) => {
      const stage = getValue() as string
      const colors = stageColors[stage] || stageColors.applied
      return h('span', {
        class: cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border',
          colors.bg,
          colors.text,
          colors.border
        ),
      }, stage)
    },
  },
  {
    accessorKey: 'skills',
    header: 'Skills',
    cell: ({ getValue }) => {
      const skills = getValue() as string[]
      return h('div', { class: 'flex flex-wrap gap-1' }, 
        skills.slice(0, 3).map(skill => 
          h('span', {
            class: 'px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground',
            key: skill,
          }, skill)
        )
      )
    },
  },
  {
    accessorKey: 'appliedAt',
    header: 'Applied',
    cell: ({ getValue }) => {
      return h('span', { class: 'text-sm text-muted-foreground' }, formatDate(getValue() as string))
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      return h('div', { class: 'flex items-center gap-1' }, [
        h('button', {
          class: 'p-2 rounded-lg hover:bg-muted/50 transition-colors',
          onClick: () => candidatesStore.selectCandidate(row.original.id),
        }, [h(Eye, { class: 'w-4 h-4 text-muted-foreground' })]),
        h('button', {
          class: 'p-2 rounded-lg hover:bg-muted/50 transition-colors',
        }, [h(MoreHorizontal, { class: 'w-4 h-4 text-muted-foreground' })]),
      ])
    },
  },
]

const table = useVueTable({
  get data() {
    return candidatesStore.filteredCandidates
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  initialState: {
    pagination: {
      pageSize: 8,
    },
  },
})
</script>

<template>
  <div class="space-y-4">
    <!-- Table -->
    <div class="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr
              v-for="headerGroup in table.getHeaderGroups()"
              :key="headerGroup.id"
              class="border-b border-border bg-muted/30"
            >
              <th
                v-for="header in headerGroup.headers"
                :key="header.id"
                :class="[
                  'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                  header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground',
                ]"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <div class="flex items-center gap-2">
                  <FlexRender
                    :render="header.column.columnDef.header"
                    :props="header.getContext()"
                  />
                  <template v-if="header.column.getCanSort()">
                    <ChevronUp
                      v-if="header.column.getIsSorted() === 'asc'"
                      class="w-4 h-4"
                    />
                    <ChevronDown
                      v-else-if="header.column.getIsSorted() === 'desc'"
                      class="w-4 h-4"
                    />
                    <ChevronsUpDown
                      v-else
                      class="w-4 h-4 opacity-50"
                    />
                  </template>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              class="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
            >
              <td
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="px-4 py-4"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div
        v-if="table.getRowModel().rows.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <div class="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-foreground mb-1">No candidates found</h3>
        <p class="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Showing {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }}
        to {{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }}
        of {{ table.getFilteredRowModel().rows.length }} candidates
      </p>
      <div class="flex items-center gap-2">
        <UiButton
          variant="outline"
          size="sm"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <ChevronLeft class="w-4 h-4" />
          Previous
        </UiButton>
        <div class="flex items-center gap-1">
          <button
            v-for="page in table.getPageCount()"
            :key="page"
            :class="[
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              table.getState().pagination.pageIndex === page - 1
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted/50 text-muted-foreground',
            ]"
            @click="table.setPageIndex(page - 1)"
          >
            {{ page }}
          </button>
        </div>
        <UiButton
          variant="outline"
          size="sm"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Next
          <ChevronRight class="w-4 h-4" />
        </UiButton>
      </div>
    </div>
  </div>
</template>
