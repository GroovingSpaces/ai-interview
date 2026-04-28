<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { Bot, Maximize2, Minimize2, Send, X } from 'lucide-vue-next'
import { useAiChatbot } from '~/composables/useAiChatbot'

type Sender = 'user' | 'bot'
interface ChatMessage {
  id: string
  sender: Sender
  text: string
  createdAt: string
}

const { isOpen, isMaximized, close, toggleMaximize } = useAiChatbot()
const isTyping = ref(false)
const input = ref('')
const listRef = ref<HTMLElement | null>(null)
const STORAGE_KEY = 'ai_chatbot_messages_v1'

const messages = ref<ChatMessage[]>([
  {
    id: 'welcome',
    sender: 'bot',
    text: 'Hi! Saya AI Assistant. Tanyakan apa saja seputar penggunaan aplikasi ini.',
    createdAt: new Date().toISOString(),
  },
])

const canSend = computed(() => input.value.trim().length > 0 && !isTyping.value)

function scrollToBottom() {
  nextTick(() => {
    if (!listRef.value) return
    listRef.value.scrollTop = listRef.value.scrollHeight
  })
}

function getBotReply(text: string) {
  const q = text.toLowerCase()
  if (q.includes('user') || q.includes('pengguna')) {
    return 'Untuk kelola pengguna, buka menu Users. Kamu bisa tambah, edit, atau update status user dari sana.'
  }
  if (q.includes('login') || q.includes('masuk')) {
    return 'Gunakan halaman Portal Login untuk masuk. Jika kredensial salah, cek kembali email dan password demo yang tersedia.'
  }
  if (q.includes('menu')) {
    return 'Saat ini modul yang aktif hanya Users. Jika butuh modul lain, saya bisa bantu aktifkan kembali.'
  }
  if (q.includes('halo') || q.includes('hai') || q.includes('hello')) {
    return 'Halo! Ada yang bisa saya bantu?'
  }
  return 'Saya sudah menerima pertanyaanmu. Jelaskan lebih detail, nanti saya bantu langkah per langkah.'
}

function persistMessages() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value.slice(-30)))
}

function loadMessages() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return
    messages.value = parsed
  } catch {
    // ignore malformed local storage
  }
}

watch(isOpen, (open) => {
  if (open) scrollToBottom()
})

function sendMessage() {
  const text = input.value.trim()
  if (!text || isTyping.value) return

  messages.value.push({
    id: `u-${Date.now()}`,
    sender: 'user',
    text,
    createdAt: new Date().toISOString(),
  })
  input.value = ''
  isTyping.value = true
  scrollToBottom()

  setTimeout(() => {
    messages.value.push({
      id: `b-${Date.now()}`,
      sender: 'bot',
      text: getBotReply(text),
      createdAt: new Date().toISOString(),
    })
    isTyping.value = false
    persistMessages()
    scrollToBottom()
  }, 500)
}

onMounted(() => {
  loadMessages()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && isMaximized"
      class="fixed inset-0 z-[75] bg-black/35 backdrop-blur-sm"
      @click="toggleMaximize"
    />
    <div class="fixed top-[4.5rem] right-4 lg:right-8 z-[70] flex flex-col items-end pointer-events-none">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-if="isOpen"
          :class="[
            'rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 pointer-events-auto',
            isMaximized
              ? 'fixed top-1/2 left-1/2 z-[80] -translate-x-1/2 -translate-y-1/2 w-[min(1100px,calc(100vw-2rem))] h-[85vh] max-h-[900px] mb-0'
              : 'w-[340px] max-w-[calc(100vw-2rem)] max-h-[min(470px,calc(100vh-6rem))]',
          ]"
        >
          <div class="px-4 py-3 border-b border-border flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-t from-ai-orange to-ai-red text-white flex items-center justify-center">
                <Bot class="w-4 h-4" />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">AI Chatbot</p>
                <p class="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button class="p-1.5 rounded-lg hover:bg-muted/60" @click="toggleMaximize">
                <Minimize2 v-if="isMaximized" class="w-4 h-4" />
                <Maximize2 v-else class="w-4 h-4" />
              </button>
              <button class="p-1.5 rounded-lg hover:bg-muted/60" @click="close">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref="listRef" class="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-muted/10">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="[
                'max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap',
                msg.sender === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-card border border-border text-foreground',
              ]"
            >
              {{ msg.text }}
            </div>

            <div v-if="isTyping" class="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm bg-card border border-border text-muted-foreground">
              <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
              <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:120ms]" />
              <span class="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:240ms]" />
            </div>
          </div>

          <div class="p-3 border-t border-border bg-card">
            <form class="flex items-center gap-2" @submit.prevent="sendMessage">
              <UiInput v-model="input" placeholder="Ketik pesan..." />
              <UiButton type="submit" variant="gradient" size="icon" :disabled="!canSend">
                <Send class="w-4 h-4" />
              </UiButton>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>
