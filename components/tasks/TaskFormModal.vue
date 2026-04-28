<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTasksStore, TASK_STATUSES, TASK_PRIORITIES, type TaskPriority, type TaskStatus } from '~/stores/tasks'
import { useEmployeesStore } from '~/stores/employees'
import { useAuthStore } from '~/stores/auth'

const props = defineProps<{ open: boolean; defaultStatus?: TaskStatus; defaultAssigneeId?: string }>()
const emit = defineEmits<{ 'update:open': [value: boolean]; created: [id: string] }>()

const tasksStore = useTasksStore()
const employeesStore = useEmployeesStore()
const authStore = useAuthStore()

interface FormState {
  title: string
  description: string
  assigneeId: string
  priority: TaskPriority
  status: TaskStatus
  startDate: string
  dueDate: string
  estimateHours: number | undefined
  tagIds: string[]
}
const empty = (): FormState => ({
  title: '',
  description: '',
  assigneeId: props.defaultAssigneeId ?? '',
  priority: 'medium',
  status: props.defaultStatus ?? 'todo',
  startDate: '',
  dueDate: '',
  estimateHours: undefined,
  tagIds: [],
})
const form = ref<FormState>(empty())

watch(
  () => props.open,
  (v) => {
    if (v) form.value = empty()
  },
)

const employeeOptions = computed(() => employeesStore.employees.map((e) => ({ value: e.id, label: `${e.name} — ${e.position}` })))
const statusOptions = TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }))
const priorityOptions = TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))

const isValid = computed(() => form.value.title.trim() !== '' && form.value.assigneeId !== '' && form.value.dueDate !== '')

function toggleTag(id: string) {
  const i = form.value.tagIds.indexOf(id)
  if (i === -1) form.value.tagIds.push(id)
  else form.value.tagIds.splice(i, 1)
}

function handleSave() {
  if (!isValid.value) return
  const id = tasksStore.addTask({
    title: form.value.title,
    description: form.value.description,
    assigneeId: form.value.assigneeId,
    assignerId: authStore.user?.id ?? '99',
    priority: form.value.priority,
    status: form.value.status,
    startDate: form.value.startDate || undefined,
    dueDate: form.value.dueDate,
    estimateHours: form.value.estimateHours ? Number(form.value.estimateHours) : undefined,
    tagIds: form.value.tagIds,
  })
  emit('created', id)
  emit('update:open', false)
}
</script>

<template>
  <UiModal :open="open" title="Buat Task Baru" description="Tugaskan pekerjaan ke anggota tim." size="lg" @update:open="emit('update:open', $event)">
    <div class="space-y-4">
      <UiFormField label="Judul Task" required>
        <UiInput v-model="form.title" placeholder="e.g. Submit laporan bulanan" />
      </UiFormField>
      <UiFormField label="Deskripsi">
        <UiTextarea v-model="form.description" rows="3" placeholder="Konteks, ekspektasi hasil, dan acceptance criteria." />
      </UiFormField>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UiFormField label="Assignee" required>
          <UiSelect v-model="form.assigneeId" :options="employeeOptions" placeholder="Pilih PIC" />
        </UiFormField>
        <UiFormField label="Status">
          <UiSelect v-model="form.status" :options="statusOptions" />
        </UiFormField>
        <UiFormField label="Priority">
          <UiSelect v-model="form.priority" :options="priorityOptions" />
        </UiFormField>
        <UiFormField label="Estimasi (jam)">
          <UiInput v-model.number="form.estimateHours" type="number" placeholder="0" />
        </UiFormField>
        <UiFormField label="Tanggal Mulai">
          <UiInput v-model="form.startDate" type="date" />
        </UiFormField>
        <UiFormField label="Deadline" required>
          <UiInput v-model="form.dueDate" type="date" />
        </UiFormField>
      </div>
      <UiFormField label="Tags">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="t in tasksStore.tags"
            :key="t.id"
            type="button"
            :class="[
              'inline-flex items-center text-xs px-2 py-1 rounded-md font-medium border transition',
              form.tagIds.includes(t.id) ? 'opacity-100' : 'opacity-50 hover:opacity-100',
            ]"
            :style="{ backgroundColor: `${t.color}20`, color: t.color, borderColor: `${t.color}40` }"
            @click="toggleTag(t.id)"
          >
            {{ t.name }}
          </button>
        </div>
      </UiFormField>
    </div>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:open', false)">Batal</UiButton>
      <UiButton variant="gradient" :disabled="!isValid" @click="handleSave">Buat Task</UiButton>
    </template>
  </UiModal>
</template>
