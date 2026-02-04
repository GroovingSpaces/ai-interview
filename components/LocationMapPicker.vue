<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(
  defineProps<{
    latitude?: number | null
    longitude?: number | null
    height?: string
  }>(),
  { latitude: null, longitude: null, height: '280px' }
)

const emit = defineEmits<{
  'update:latitude': [value: number | undefined]
  'update:longitude': [value: number | undefined]
}>()

const mapContainer = ref<HTMLElement | null>(null)
let map: import('leaflet').Map | null = null
let marker: import('leaflet').Marker | null = null
let L: typeof import('leaflet') | null = null

const DEFAULT_CENTER: [number, number] = [-6.2088, 106.8456] // Jakarta
const DEFAULT_ZOOM = 12

function setMarker(lat: number, lng: number) {
  if (!L || !map) return
  if (marker) marker.remove()
  marker = L.marker([lat, lng]).addTo(map)
  map.setView([lat, lng], map.getZoom())
}

async function initMap() {
  if (!mapContainer.value || typeof window === 'undefined') return
  const leaflet = await import('leaflet')
  L = leaflet

  // Fix default icon path in Vite/bundler
  delete (leaflet.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl
  leaflet.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })

  const hasInitial = props.latitude != null && props.longitude != null && Number.isFinite(props.latitude) && Number.isFinite(props.longitude)
  const center: [number, number] = hasInitial ? [props.latitude!, props.longitude!] : DEFAULT_CENTER

  map = leaflet.map(mapContainer.value).setView(center, DEFAULT_ZOOM)
  leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)

  if (hasInitial) setMarker(props.latitude!, props.longitude!)

  map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
    const { lat, lng } = e.latlng
    setMarker(lat, lng)
    emit('update:latitude', lat)
    emit('update:longitude', lng)
  })
}

watch(
  () => [props.latitude, props.longitude] as const,
  ([lat, lng]) => {
    if (L && map && lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)) setMarker(lat, lng)
  },
  { deep: true }
)

onMounted(async () => {
  await import('leaflet/dist/leaflet.css')
  await initMap()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
    marker = null
    L = null
  }
})
</script>

<template>
  <div class="rounded-xl border border-border overflow-hidden bg-muted/20">
    <div
      ref="mapContainer"
      class="w-full bg-muted/30"
      :style="{ height }"
    />
    <p class="text-xs text-muted-foreground px-3 py-2 border-t border-border">
      Klik pada peta untuk memilih lokasi. Latitude dan longitude akan terisi otomatis.
    </p>
  </div>
</template>
