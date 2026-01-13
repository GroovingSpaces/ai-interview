import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type InterviewState = 
  | 'idle'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'paused'
  | 'ended'

export interface TranscriptEntry {
  id: string
  speaker: 'ai' | 'candidate'
  message: string
  timestamp: Date
  sentiment?: 'positive' | 'neutral' | 'negative'
  keywords?: string[]
}

export interface InterviewQuestion {
  id: string
  question: string
  type: 'behavioral' | 'technical' | 'situational' | 'follow-up'
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  answered: boolean
  score?: number
  feedback?: string
}

export interface InterviewSession {
  id: string
  candidateId: string
  candidateName: string
  position: string
  startTime: Date
  endTime?: Date
  duration?: number
  state: InterviewState
  transcript: TranscriptEntry[]
  questions: InterviewQuestion[]
  overallScore?: number
  aiNotes?: string[]
}

export const useInterviewStore = defineStore('interview', () => {
  const currentSession = ref<InterviewSession | null>(null)
  const state = ref<InterviewState>('idle')
  const isAudioEnabled = ref(true)
  const isVideoEnabled = ref(true)
  const volume = ref(80)

  // AI Assistant personality
  const aiAssistant = ref({
    name: 'Nova',
    avatar: '/ai-avatar.png',
    personality: 'Professional yet friendly, thorough in assessment',
  })

  // Real-time metrics
  const realtimeMetrics = ref({
    speakingPace: 'normal' as 'slow' | 'normal' | 'fast',
    confidence: 75,
    engagement: 82,
    clarity: 88,
  })

  // Sample interview questions
  const sampleQuestions: InterviewQuestion[] = [
    {
      id: '1',
      question: 'Tell me about yourself and your experience in software development.',
      type: 'behavioral',
      topic: 'Introduction',
      difficulty: 'easy',
      answered: false,
    },
    {
      id: '2',
      question: 'Describe a challenging technical problem you solved recently. What was your approach?',
      type: 'technical',
      topic: 'Problem Solving',
      difficulty: 'medium',
      answered: false,
    },
    {
      id: '3',
      question: 'How do you handle disagreements with team members about technical decisions?',
      type: 'situational',
      topic: 'Collaboration',
      difficulty: 'medium',
      answered: false,
    },
    {
      id: '4',
      question: 'Explain how you would design a scalable microservices architecture.',
      type: 'technical',
      topic: 'System Design',
      difficulty: 'hard',
      answered: false,
    },
    {
      id: '5',
      question: 'What motivates you to work in this industry?',
      type: 'behavioral',
      topic: 'Motivation',
      difficulty: 'easy',
      answered: false,
    },
  ]

  const transcript = computed(() => currentSession.value?.transcript || [])
  const questions = computed(() => currentSession.value?.questions || [])
  const currentQuestion = computed(() => 
    questions.value.find(q => !q.answered) || null
  )
  const progress = computed(() => {
    const answered = questions.value.filter(q => q.answered).length
    return questions.value.length > 0 ? (answered / questions.value.length) * 100 : 0
  })

  function startInterview(candidateId: string, candidateName: string, position: string) {
    currentSession.value = {
      id: Date.now().toString(),
      candidateId,
      candidateName,
      position,
      startTime: new Date(),
      state: 'connecting',
      transcript: [],
      questions: [...sampleQuestions],
    }
    state.value = 'connecting'

    // Simulate connection
    setTimeout(() => {
      state.value = 'ready'
      if (currentSession.value) {
        currentSession.value.state = 'ready'
      }
      addTranscriptEntry('ai', `Hello! I'm ${aiAssistant.value.name}, your AI interviewer today. I'll be conducting your interview for the ${position} position. Are you ready to begin?`)
    }, 2000)
  }

  function addTranscriptEntry(speaker: 'ai' | 'candidate', message: string) {
    if (!currentSession.value) return

    const entry: TranscriptEntry = {
      id: Date.now().toString(),
      speaker,
      message,
      timestamp: new Date(),
    }

    currentSession.value.transcript.push(entry)
  }

  function simulateAIThinking() {
    state.value = 'thinking'
    if (currentSession.value) {
      currentSession.value.state = 'thinking'
    }
  }

  function simulateAISpeaking() {
    state.value = 'speaking'
    if (currentSession.value) {
      currentSession.value.state = 'speaking'
    }
  }

  function setListening() {
    state.value = 'listening'
    if (currentSession.value) {
      currentSession.value.state = 'listening'
    }
  }

  function answerQuestion(questionId: string, score: number, feedback: string) {
    if (!currentSession.value) return

    const question = currentSession.value.questions.find(q => q.id === questionId)
    if (question) {
      question.answered = true
      question.score = score
      question.feedback = feedback
    }
  }

  function endInterview() {
    if (!currentSession.value) return

    currentSession.value.endTime = new Date()
    currentSession.value.duration = Math.round(
      (currentSession.value.endTime.getTime() - currentSession.value.startTime.getTime()) / 1000
    )
    currentSession.value.state = 'ended'
    state.value = 'ended'

    // Calculate overall score
    const answeredQuestions = currentSession.value.questions.filter(q => q.answered && q.score)
    if (answeredQuestions.length > 0) {
      currentSession.value.overallScore = Math.round(
        answeredQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / answeredQuestions.length
      )
    }
  }

  function toggleAudio() {
    isAudioEnabled.value = !isAudioEnabled.value
  }

  function toggleVideo() {
    isVideoEnabled.value = !isVideoEnabled.value
  }

  function resetInterview() {
    currentSession.value = null
    state.value = 'idle'
  }

  return {
    currentSession,
    state,
    isAudioEnabled,
    isVideoEnabled,
    volume,
    aiAssistant,
    realtimeMetrics,
    transcript,
    questions,
    currentQuestion,
    progress,
    startInterview,
    addTranscriptEntry,
    simulateAIThinking,
    simulateAISpeaking,
    setListening,
    answerQuestion,
    endInterview,
    toggleAudio,
    toggleVideo,
    resetInterview,
  }
})

