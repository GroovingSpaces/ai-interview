import { ref } from 'vue'

const isOpen = ref(false)
const isMaximized = ref(false)

export function useAiChatbot() {
  function toggleOpen() {
    isOpen.value = !isOpen.value
  }

  function setOpen(open: boolean) {
    isOpen.value = open
  }

  function close() {
    isOpen.value = false
    isMaximized.value = false
  }

  function toggleMaximize() {
    isMaximized.value = !isMaximized.value
  }

  return {
    isOpen,
    isMaximized,
    toggleOpen,
    setOpen,
    close,
    toggleMaximize,
  }
}
