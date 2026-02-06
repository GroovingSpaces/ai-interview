<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCompanyStore } from '~/stores/company'
import type { Location } from '~/stores/company'
import { Plus, Edit, Trash2, X, Check, AlertTriangle, MapPin } from 'lucide-vue-next'

definePageMeta({ middleware: 'admin' })
useHead({ title: 'Location - Company' })

const store = useCompanyStore()
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selected = ref<Location | null>(null)
const form = ref({ name: '', address: '', city: '', country: '', latitude: undefined as number | undefined, longitude: undefined as number | undefined })

function resetForm() {
  form.value = { name: '', address: '', city: '', country: '', latitude: undefined, longitude: undefined }
}
function openCreate() {
  resetForm()
  showCreateModal.value = true
}
function openEdit(item: Location) {
  selected.value = item
  form.value = {
    name: item.name,
    address: item.address || '',
    city: item.city || '',
    country: item.country || '',
    latitude: item.latitude,
    longitude: item.longitude,
  }
  showEditModal.value = true
}
function openDelete(item: Location) {
  selected.value = item
  showDeleteModal.value = true
}
function closeModals() {
  showCreateModal.value = false
  showEditModal.value = false
  showDeleteModal.value = false
  selected.value = null
  resetForm()
}
function handleCreate() {
  store.addLocation({
    name: form.value.name.trim(),
    address: form.value.address.trim() || undefined,
    city: form.value.city.trim() || undefined,
    country: form.value.country.trim() || undefined,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
  })
  closeModals()
}
function handleUpdate() {
  if (!selected.value) return
  store.updateLocation(selected.value.id, {
    name: form.value.name.trim(),
    address: form.value.address.trim() || undefined,
    city: form.value.city.trim() || undefined,
    country: form.value.country.trim() || undefined,
    latitude: form.value.latitude,
    longitude: form.value.longitude,
  })
  closeModals()
}
function handleDelete() {
  if (!selected.value) return
  store.deleteLocation(selected.value.id)
  closeModals()
}
const isFormValid = computed(() => form.value.name.trim() !== '')
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Location</h1>
        <p class="text-muted-foreground">Kelola lokasi kantor</p>
      </div>
      <UiButton variant="gradient" @click="openCreate">
        <Plus class="w-4 h-4" />
        Add Location
      </UiButton>
    </div>

    <div v-if="store.locations.length === 0" class="glass-card p-12 text-center">
      <MapPin class="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 class="text-lg font-semibold text-foreground mb-2">No Locations</h3>
      <p class="text-muted-foreground mb-4">Tambahkan lokasi pertama.</p>
      <UiButton variant="gradient" @click="openCreate"><Plus class="w-4 h-4" /> Add Location</UiButton>
    </div>

    <div v-else class="rounded-xl border border-border overflow-hidden bg-card/50">
      <div class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b border-border bg-muted/30">
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Address</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">City</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Country</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lat / Long</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in store.locations" :key="item.id" class="border-b border-border last:border-0 hover:bg-muted/30">
              <td class="px-4 py-3 font-medium">{{ item.name }}</td>
              <td class="px-4 py-3 text-sm text-muted-foreground">{{ item.address || '-' }}</td>
              <td class="px-4 py-3 text-sm">{{ item.city || '-' }}</td>
              <td class="px-4 py-3 text-sm">{{ item.country || '-' }}</td>
              <td class="px-4 py-3 text-sm font-mono text-muted-foreground">
                {{ item.latitude != null && item.longitude != null ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}` : '-' }}
              </td>
              <td class="px-4 py-3 text-left">
                <button class="p-2 rounded-lg hover:bg-muted/50" title="Edit" @click="openEdit(item)"><Edit class="w-4 h-4" /></button>
                <button class="p-2 rounded-lg hover:bg-score-low/10 text-score-low" title="Delete" @click="openDelete(item)"><Trash2 class="w-4 h-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showCreateModal || showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          <div class="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 my-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-bold">{{ showCreateModal ? 'Add Location' : 'Edit Location' }}</h2>
              <button class="p-2 rounded-lg hover:bg-muted/50" @click="closeModals"><X class="w-5 h-5" /></button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Name *</label>
                <UiInput v-model="form.name" placeholder="e.g. Jakarta HQ" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Address</label>
                <UiInput v-model="form.address" placeholder="Street address" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-2">City</label>
                  <UiInput v-model="form.city" placeholder="City" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Country</label>
                  <UiInput v-model="form.country" placeholder="Country" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">Pilih lokasi di peta</label>
                <ClientOnly>
                  <LocationMapPicker
                    v-model:latitude="form.latitude"
                    v-model:longitude="form.longitude"
                    :height="'240px'"
                  />
                  <template #fallback>
                    <div class="rounded-xl border border-border bg-muted/20 flex items-center justify-center text-muted-foreground" style="height: 240px">
                      Memuat peta...
                    </div>
                  </template>
                </ClientOnly>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-2">Latitude</label>
                  <UiInput :model-value="form.latitude != null ? String(form.latitude) : ''" placeholder="Klik peta" disabled class="bg-muted/30" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-2">Longitude</label>
                  <UiInput :model-value="form.longitude != null ? String(form.longitude) : ''" placeholder="Klik peta" disabled class="bg-muted/30" />
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
              <UiButton variant="outline" @click="closeModals">Cancel</UiButton>
              <UiButton variant="gradient" :disabled="!isFormValid" @click="showCreateModal ? handleCreate() : handleUpdate()">
                <Check class="w-4 h-4" /> {{ showCreateModal ? 'Add' : 'Save' }}
              </UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-150" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModals" />
          <div class="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 text-center">
            <AlertTriangle class="w-12 h-12 mx-auto text-score-low mb-4" />
            <h2 class="text-lg font-bold mb-2">Delete Location</h2>
            <p class="text-muted-foreground mb-6">Delete "{{ selected?.name }}"?</p>
            <div class="flex justify-center gap-3">
              <UiButton variant="outline" @click="closeModals">Cancel</UiButton>
              <UiButton variant="outline" class="text-score-low border-score-low/30 hover:bg-score-low/10" @click="handleDelete"><Trash2 class="w-4 h-4" /> Delete</UiButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
