<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Pencil, Trash2, Clock, CalendarRange } from 'lucide-vue-next'
import { useShiftsStore, type Shift } from '~/stores/shifts'
import { useEmployeesStore } from '~/stores/employees'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('shiftSchedule')
useHead({ title: () => title.value })

const shiftsStore = useShiftsStore()
const employeesStore = useEmployeesStore()

const startDate = ref(new Date().toISOString().slice(0, 10))

const days = computed(() => {
  const out: { date: string; label: string }[] = []
  const start = new Date(startDate.value)
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' }),
    })
  }
  return out
})

function shiftAssigned(employeeId: string, date: string): Shift | undefined {
  return shiftsStore.getShiftForEmployee(employeeId, date)
}
function setShift(employeeId: string, date: string, shiftId: string) {
  if (!shiftId) {
    shiftsStore.unassignRoster(employeeId, date)
  } else {
    shiftsStore.assignShift(employeeId, shiftId, date)
  }
}

const showShiftForm = ref(false)
const showShiftDelete = ref(false)
const editingShiftId = ref<string | null>(null)
const targetShiftId = ref<string | null>(null)

interface ShiftFormState {
  name: string
  startTime: string
  endTime: string
  breakMinutes: number | undefined
  color: string
}
const emptyShift = (): ShiftFormState => ({ name: '', startTime: '08:00', endTime: '17:00', breakMinutes: 60, color: '#f97316' })
const shiftForm = ref<ShiftFormState>(emptyShift())
const isShiftEdit = computed(() => editingShiftId.value !== null)
const isShiftValid = computed(
  () => shiftForm.value.name.trim() !== '' && shiftForm.value.startTime !== '' && shiftForm.value.endTime !== '',
)

function openAddShift() {
  editingShiftId.value = null
  shiftForm.value = emptyShift()
  showShiftForm.value = true
}
function openEditShift(s: Shift) {
  editingShiftId.value = s.id
  shiftForm.value = {
    name: s.name,
    startTime: s.startTime,
    endTime: s.endTime,
    breakMinutes: s.breakMinutes ?? 60,
    color: s.color ?? '#f97316',
  }
  showShiftForm.value = true
}
function saveShift() {
  if (!isShiftValid.value) return
  const payload = {
    name: shiftForm.value.name,
    startTime: shiftForm.value.startTime,
    endTime: shiftForm.value.endTime,
    breakMinutes: Number(shiftForm.value.breakMinutes) || 0,
    color: shiftForm.value.color,
  }
  if (isShiftEdit.value && editingShiftId.value) {
    shiftsStore.updateShift(editingShiftId.value, payload)
  } else {
    shiftsStore.addShift(payload)
  }
  showShiftForm.value = false
}
function askDeleteShift(id: string) {
  targetShiftId.value = id
  showShiftDelete.value = true
}
function confirmDeleteShift() {
  if (targetShiftId.value) shiftsStore.deleteShift(targetShiftId.value)
  showShiftDelete.value = false
  targetShiftId.value = null
}

const shiftSelectOptions = computed(() => [
  { value: '', label: '— Tidak ada —' },
  ...shiftsStore.shifts.map((s) => ({ value: s.id, label: `${s.name} (${s.startTime}-${s.endTime})` })),
])

function shiftValueFor(employeeId: string, date: string): string {
  const s = shiftAssigned(employeeId, date)
  return s?.id ?? ''
}
</script>

<template>
  <div class="space-y-6">
    <UiPageHeader
      :title="title"
      subtitle="Kelola definisi shift dan jadwal karyawan per minggu."
    >
      <template #actions>
        <UiButton variant="outline" @click="openAddShift">
          <Plus class="w-4 h-4" />
          Tambah Shift
        </UiButton>
      </template>
    </UiPageHeader>

    <!-- Shift definitions -->
    <div class="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div class="p-4 border-b border-border flex items-center gap-2">
        <Clock class="w-4 h-4 text-muted-foreground" />
        <h3 class="font-semibold text-foreground">Definisi Shift</h3>
      </div>
      <div class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="s in shiftsStore.shifts"
          :key="s.id"
          class="rounded-xl border border-border p-3 flex items-start gap-3"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :style="{ backgroundColor: `${s.color}20`, color: s.color }">
            <Clock class="w-5 h-5" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-foreground truncate">{{ s.name }}</p>
            <p class="text-xs text-muted-foreground">{{ s.startTime }} – {{ s.endTime }} • Break {{ s.breakMinutes ?? 0 }}m</p>
          </div>
          <div class="flex items-center gap-1">
            <button class="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50" @click="openEditShift(s)">
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button class="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10" @click="askDeleteShift(s.id)">
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Roster grid -->
    <div class="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
      <div class="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div class="flex items-center gap-2">
          <CalendarRange class="w-4 h-4 text-muted-foreground" />
          <h3 class="font-semibold text-foreground">Jadwal Mingguan</h3>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Mulai:</span>
          <UiInput v-model="startDate" type="date" class="!h-9" />
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase sticky left-0 bg-muted/30 z-10">Karyawan</th>
              <th
                v-for="d in days"
                :key="d.date"
                class="px-3 py-3 text-left text-xs font-medium text-muted-foreground uppercase"
              >
                {{ d.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in employeesStore.employees" :key="emp.id" class="border-b border-border last:border-0">
              <td class="px-3 py-2 sticky left-0 bg-card/80 z-10">
                <p class="font-medium text-foreground truncate max-w-[10rem]">{{ emp.name }}</p>
                <p class="text-xs text-muted-foreground">{{ emp.employeeId }}</p>
              </td>
              <td v-for="d in days" :key="d.date" class="px-2 py-2 min-w-[10rem]">
                <UiSelect
                  :model-value="shiftValueFor(emp.id, d.date)"
                  :options="shiftSelectOptions"
                  @update:model-value="setShift(emp.id, d.date, $event)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UiModal
      :open="showShiftForm"
      :title="isShiftEdit ? 'Edit Shift' : 'Tambah Shift'"
      description="Definisikan jam kerja, break, dan warna shift."
      @update:open="showShiftForm = $event"
    >
      <div class="space-y-4">
        <UiFormField label="Nama Shift" required>
          <UiInput v-model="shiftForm.name" placeholder="e.g. Pagi, Malam" />
        </UiFormField>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Jam Mulai" required>
            <UiInput v-model="shiftForm.startTime" type="time" />
          </UiFormField>
          <UiFormField label="Jam Selesai" required>
            <UiInput v-model="shiftForm.endTime" type="time" />
          </UiFormField>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UiFormField label="Durasi Break (menit)">
            <UiInput v-model.number="shiftForm.breakMinutes" type="number" placeholder="60" />
          </UiFormField>
          <UiFormField label="Warna">
            <input v-model="shiftForm.color" type="color" class="w-full h-11 rounded-xl border border-input bg-card/50 cursor-pointer" >
          </UiFormField>
        </div>
      </div>
      <template #footer>
        <UiButton variant="outline" @click="showShiftForm = false">Batal</UiButton>
        <UiButton variant="gradient" :disabled="!isShiftValid" @click="saveShift">
          {{ isShiftEdit ? 'Simpan' : 'Tambah' }}
        </UiButton>
      </template>
    </UiModal>

    <UiConfirmDialog
      :open="showShiftDelete"
      title="Hapus Shift?"
      message="Penjadwalan yang menggunakan shift ini akan ikut dihapus."
      confirm-text="Ya, Hapus"
      @update:open="showShiftDelete = $event"
      @confirm="confirmDeleteShift"
    />
  </div>
</template>
