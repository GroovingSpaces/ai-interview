<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, MessageCircle, Paperclip, ListChecks, Clock, Flag } from 'lucide-vue-next'
import { useTasksStore, type WorkTask, TASK_PRIORITIES } from '~/stores/tasks'
import { useEmployeesStore } from '~/stores/employees'
import { formatDate } from '~/lib/utils'

const props = defineProps<{ task: WorkTask }>()
defineEmits<{ open: [id: string] }>()

const tasksStore = useTasksStore()
const employeesStore = useEmployeesStore()

const assignee = computed(() => employeesStore.getEmployeeById(props.task.assigneeId))
const tags = computed(() => props.task.tagIds.map((id) => tasksStore.getTagById(id)).filter(Boolean) as { id: string; name: string; color: string }[])
const priority = computed(() => TASK_PRIORITIES.find((p) => p.value === props.task.priority))
const progress = computed(() => tasksStore.progressOf(props.task))
const subtasksDone = computed(() => props.task.subtasks.filter((s) => s.done).length)

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  if (props.task.status === 'done' || props.task.status === 'approved') return false
  return new Date(props.task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0)
})
</script>

<template>
  <div
    class="rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer"
    @click="$emit('open', task.id)"
  >
    <!-- Tags + priority -->
    <div class="flex items-center gap-1 flex-wrap">
      <span
        v-for="t in tags"
        :key="t.id"
        class="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium"
        :style="{ backgroundColor: `${t.color}20`, color: t.color }"
      >
        {{ t.name }}
      </span>
    </div>

    <!-- Title -->
    <p class="font-medium text-foreground text-sm mt-2 line-clamp-2">{{ task.title }}</p>

    <!-- Progress -->
    <div v-if="task.subtasks.length + task.checklist.length > 0" class="mt-2">
      <div class="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Progress</span>
        <span class="font-mono font-semibold text-foreground">{{ progress }}%</span>
      </div>
      <div class="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div class="h-full bg-primary transition-all" :style="{ width: `${progress}%` }" />
      </div>
    </div>

    <!-- Metadata footer -->
    <div class="flex items-center justify-between mt-3 pt-2 border-t border-border/60 text-xs">
      <div class="flex items-center gap-2 text-muted-foreground">
        <span v-if="priority" class="inline-flex items-center gap-0.5" :title="`Priority: ${priority.label}`">
          <Flag class="w-3 h-3" :style="{ color: priority.color }" :fill="priority.color" />
        </span>
        <span class="inline-flex items-center gap-1" :class="isOverdue ? 'text-destructive' : ''">
          <Calendar class="w-3 h-3" />
          {{ formatDate(task.dueDate) }}
        </span>
        <span v-if="task.estimateHours" class="inline-flex items-center gap-1">
          <Clock class="w-3 h-3" />
          {{ task.estimateHours }}h
        </span>
      </div>
      <div class="flex items-center gap-2 text-muted-foreground">
        <span v-if="task.subtasks.length" class="inline-flex items-center gap-0.5" :title="`${subtasksDone}/${task.subtasks.length} subtasks`">
          <ListChecks class="w-3 h-3" />
          {{ subtasksDone }}/{{ task.subtasks.length }}
        </span>
        <span v-if="task.comments.length" class="inline-flex items-center gap-0.5" :title="`${task.comments.length} komentar`">
          <MessageCircle class="w-3 h-3" />
          {{ task.comments.length }}
        </span>
        <span v-if="task.evidence.length" class="inline-flex items-center gap-0.5" :title="`${task.evidence.length} attachment`">
          <Paperclip class="w-3 h-3" />
          {{ task.evidence.length }}
        </span>
        <div
          v-if="assignee"
          class="w-6 h-6 rounded-full bg-gradient-to-t from-ai-orange to-ai-red flex items-center justify-center text-[10px] font-semibold text-white"
          :title="assignee.name"
        >
          {{ getInitials(assignee.name) }}
        </div>
      </div>
    </div>
  </div>
</template>
