import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface LearningModule {
  id: string
  title: string
  description: string
  category: string
  duration: number // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  progress: number
  completed: boolean
  locked: boolean
  icon: string
  lessons: Lesson[]
  quiz?: Quiz
}

export interface Lesson {
  id: string
  title: string
  type: 'video' | 'reading' | 'interactive' | 'exercise'
  duration: number
  completed: boolean
  content?: string
}

export interface Quiz {
  id: string
  title: string
  questions: QuizQuestion[]
  passScore: number
  completed: boolean
  score?: number
  aiGenerated: boolean
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  userAnswer?: number
}

export interface LearningPath {
  id: string
  title: string
  description: string
  modules: string[] // module IDs
  progress: number
  estimatedTime: number
  skills: string[]
}

export const useLmsStore = defineStore('lms', () => {
  const modules = ref<LearningModule[]>([
    {
      id: '1',
      title: 'Company Culture & Values',
      description: 'Learn about our mission, vision, and core values that drive everything we do.',
      category: 'Onboarding',
      duration: 45,
      difficulty: 'beginner',
      progress: 100,
      completed: true,
      locked: false,
      icon: '🏢',
      lessons: [
        { id: '1-1', title: 'Welcome to Telkomsel', type: 'video', duration: 15, completed: true },
        { id: '1-2', title: 'Our History & Journey', type: 'reading', duration: 10, completed: true },
        { id: '1-3', title: 'Core Values Deep Dive', type: 'interactive', duration: 20, completed: true },
      ],
      quiz: {
        id: 'q1',
        title: 'Culture & Values Assessment',
        questions: [],
        passScore: 80,
        completed: true,
        score: 95,
        aiGenerated: false,
      },
    },
    {
      id: '2',
      title: 'Technical Onboarding',
      description: 'Set up your development environment and learn our tech stack.',
      category: 'Onboarding',
      duration: 120,
      difficulty: 'intermediate',
      progress: 75,
      completed: false,
      locked: false,
      icon: '💻',
      lessons: [
        { id: '2-1', title: 'Development Environment Setup', type: 'interactive', duration: 30, completed: true },
        { id: '2-2', title: 'Git & Version Control', type: 'video', duration: 25, completed: true },
        { id: '2-3', title: 'CI/CD Pipeline Overview', type: 'reading', duration: 20, completed: true },
        { id: '2-4', title: 'Code Review Guidelines', type: 'reading', duration: 15, completed: false },
        { id: '2-5', title: 'Hands-on Project Setup', type: 'exercise', duration: 30, completed: false },
      ],
    },
    {
      id: '3',
      title: 'AI & Machine Learning Fundamentals',
      description: 'Understand the basics of AI/ML and how we apply them in our products.',
      category: 'Technical',
      duration: 180,
      difficulty: 'intermediate',
      progress: 30,
      completed: false,
      locked: false,
      icon: '🤖',
      lessons: [
        { id: '3-1', title: 'Introduction to AI', type: 'video', duration: 30, completed: true },
        { id: '3-2', title: 'Machine Learning Concepts', type: 'reading', duration: 25, completed: true },
        { id: '3-3', title: 'Neural Networks Explained', type: 'video', duration: 35, completed: false },
        { id: '3-4', title: 'AI in Recruitment', type: 'interactive', duration: 40, completed: false },
        { id: '3-5', title: 'Practical ML Exercise', type: 'exercise', duration: 50, completed: false },
      ],
    },
    {
      id: '4',
      title: 'Leadership & Management',
      description: 'Develop essential leadership skills for guiding teams effectively.',
      category: 'Soft Skills',
      duration: 90,
      difficulty: 'advanced',
      progress: 0,
      completed: false,
      locked: true,
      icon: '👔',
      lessons: [
        { id: '4-1', title: 'Leadership Styles', type: 'video', duration: 20, completed: false },
        { id: '4-2', title: 'Effective Communication', type: 'interactive', duration: 25, completed: false },
        { id: '4-3', title: 'Conflict Resolution', type: 'reading', duration: 20, completed: false },
        { id: '4-4', title: 'Team Building', type: 'exercise', duration: 25, completed: false },
      ],
    },
    {
      id: '5',
      title: 'Cloud Architecture',
      description: 'Master cloud services and infrastructure design patterns.',
      category: 'Technical',
      duration: 240,
      difficulty: 'advanced',
      progress: 0,
      completed: false,
      locked: true,
      icon: '☁️',
      lessons: [
        { id: '5-1', title: 'Cloud Fundamentals', type: 'video', duration: 40, completed: false },
        { id: '5-2', title: 'AWS Services Overview', type: 'reading', duration: 35, completed: false },
        { id: '5-3', title: 'Serverless Architecture', type: 'interactive', duration: 45, completed: false },
        { id: '5-4', title: 'Container Orchestration', type: 'video', duration: 50, completed: false },
        { id: '5-5', title: 'Architecture Design Project', type: 'exercise', duration: 70, completed: false },
      ],
    },
    {
      id: '6',
      title: 'Data Security & Compliance',
      description: 'Learn security best practices and compliance requirements.',
      category: 'Compliance',
      duration: 60,
      difficulty: 'beginner',
      progress: 50,
      completed: false,
      locked: false,
      icon: '🔒',
      lessons: [
        { id: '6-1', title: 'Security Fundamentals', type: 'video', duration: 15, completed: true },
        { id: '6-2', title: 'Data Protection Laws', type: 'reading', duration: 15, completed: true },
        { id: '6-3', title: 'Best Practices', type: 'interactive', duration: 15, completed: false },
        { id: '6-4', title: 'Security Assessment', type: 'exercise', duration: 15, completed: false },
      ],
    },
  ])

  const learningPaths = ref<LearningPath[]>([
    {
      id: 'path-1',
      title: 'New Employee Onboarding',
      description: 'Essential training for all new team members',
      modules: ['1', '2', '6'],
      progress: 75,
      estimatedTime: 225,
      skills: ['Company Culture', 'Development Setup', 'Security Basics'],
    },
    {
      id: 'path-2',
      title: 'AI Engineer Track',
      description: 'Comprehensive path for AI/ML specialization',
      modules: ['2', '3', '5'],
      progress: 35,
      estimatedTime: 540,
      skills: ['Machine Learning', 'Cloud Architecture', 'AI Development'],
    },
    {
      id: 'path-3',
      title: 'Tech Lead Path',
      description: 'Development path for aspiring tech leads',
      modules: ['2', '4', '5'],
      progress: 25,
      estimatedTime: 450,
      skills: ['Leadership', 'System Design', 'Team Management'],
    },
  ])

  const currentModule = ref<LearningModule | null>(null)
  const currentQuiz = ref<Quiz | null>(null)
  const activeQuizQuestion = ref(0)

  const totalProgress = computed(() => {
    const total = modules.value.reduce((sum, m) => sum + m.progress, 0)
    return Math.round(total / modules.value.length)
  })

  const completedModules = computed(() => 
    modules.value.filter(m => m.completed).length
  )

  const totalLearningTime = computed(() => 
    modules.value.reduce((sum, m) => sum + m.duration, 0)
  )

  const earnedBadges = computed(() => {
    const badges = []
    if (completedModules.value >= 1) badges.push({ id: '1', name: 'First Steps', icon: '🌟' })
    if (completedModules.value >= 3) badges.push({ id: '2', name: 'Quick Learner', icon: '🚀' })
    if (totalProgress.value >= 50) badges.push({ id: '3', name: 'Halfway There', icon: '🎯' })
    if (modules.value.find(m => m.quiz?.score && m.quiz.score >= 90)) {
      badges.push({ id: '4', name: 'Quiz Master', icon: '🏆' })
    }
    return badges
  })

  function startModule(moduleId: string) {
    currentModule.value = modules.value.find(m => m.id === moduleId) || null
  }

  function completeLesson(moduleId: string, lessonId: string) {
    const module = modules.value.find(m => m.id === moduleId)
    if (!module) return

    const lesson = module.lessons.find(l => l.id === lessonId)
    if (lesson) {
      lesson.completed = true
      
      // Recalculate progress
      const completedLessons = module.lessons.filter(l => l.completed).length
      module.progress = Math.round((completedLessons / module.lessons.length) * 100)
      
      if (module.progress === 100) {
        module.completed = true
        unlockNextModule(moduleId)
      }
    }
  }

  function unlockNextModule(currentModuleId: string) {
    const currentIndex = modules.value.findIndex(m => m.id === currentModuleId)
    if (currentIndex < modules.value.length - 1) {
      modules.value[currentIndex + 1].locked = false
    }
  }

  function startQuiz(quizId: string) {
    const module = modules.value.find(m => m.quiz?.id === quizId)
    if (module?.quiz) {
      currentQuiz.value = module.quiz
      activeQuizQuestion.value = 0
    }
  }

  function answerQuizQuestion(questionIndex: number, answer: number) {
    if (!currentQuiz.value) return
    currentQuiz.value.questions[questionIndex].userAnswer = answer
  }

  function submitQuiz() {
    if (!currentQuiz.value) return

    const correct = currentQuiz.value.questions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length
    const score = Math.round((correct / currentQuiz.value.questions.length) * 100)
    
    currentQuiz.value.score = score
    currentQuiz.value.completed = true
    
    currentQuiz.value = null
    return score
  }

  function generateAIQuiz(moduleId: string): Quiz {
    // Simulate AI-generated quiz
    const aiQuiz: Quiz = {
      id: `ai-quiz-${moduleId}`,
      title: 'AI-Generated Assessment',
      aiGenerated: true,
      passScore: 70,
      completed: false,
      questions: [
        {
          id: 'q1',
          question: 'Based on the module content, which approach is most effective for this scenario?',
          options: [
            'Option A: Traditional approach',
            'Option B: AI-enhanced approach',
            'Option C: Hybrid approach',
            'Option D: Manual approach',
          ],
          correctAnswer: 2,
          explanation: 'A hybrid approach combines the best of both traditional and AI methods.',
        },
        {
          id: 'q2',
          question: 'What is the primary benefit of the technique discussed?',
          options: [
            'Cost reduction',
            'Time efficiency',
            'Quality improvement',
            'All of the above',
          ],
          correctAnswer: 3,
          explanation: 'The technique provides multiple benefits across all these dimensions.',
        },
      ],
    }
    return aiQuiz
  }

  return {
    modules,
    learningPaths,
    currentModule,
    currentQuiz,
    activeQuizQuestion,
    totalProgress,
    completedModules,
    totalLearningTime,
    earnedBadges,
    startModule,
    completeLesson,
    startQuiz,
    answerQuizQuestion,
    submitQuiz,
    generateAIQuiz,
  }
})

