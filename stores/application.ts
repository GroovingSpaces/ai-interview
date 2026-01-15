import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ParsingStatus = 
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'analyzing'
  | 'complete'
  | 'error'

export interface ParsedResume {
  fileName: string
  uploadedAt: Date
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    github?: string
  }
  summary: string
  skills: {
    name: string
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    yearsOfExperience: number
  }[]
  experience: {
    company: string
    title: string
    startDate: string
    endDate: string
    current: boolean
    highlights: string[]
  }[]
  education: {
    institution: string
    degree: string
    field: string
    year: number
    gpa?: number
  }[]
  certifications: {
    name: string
    issuer: string
    year: number
  }[]
  languages: {
    name: string
    proficiency: string
  }[]
  aiInsights: {
    strengths: string[]
    areasForGrowth: string[]
    cultureFitScore: number
    technicalScore: number
    communicationScore: number
    suggestedRoles: string[]
  }
}

export interface JobPosition {
  id: string
  title: string
  department: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  remote: boolean
  description: string
  requirements: string[]
  benefits: string[]
  matchScore?: number
}

export const useApplicationStore = defineStore('application', () => {
  const status = ref<ParsingStatus>('idle')
  const progress = ref(0)
  const currentStep = ref('')
  const uploadedFile = ref<File | null>(null)
  const parsedResume = ref<ParsedResume | null>(null)
  const selectedPosition = ref<JobPosition | null>(null)
  const error = ref<string | null>(null)

  const availablePositions = ref<JobPosition[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'Jakarta, Indonesia',
      type: 'full-time',
      remote: true,
      description: 'Join our engineering team to build scalable solutions for millions of users.',
      requirements: [
        '5+ years of experience in software development',
        'Proficiency in React, TypeScript, and Node.js',
        'Experience with cloud services (AWS/GCP)',
        'Strong problem-solving skills',
      ],
      benefits: [
        'Competitive salary',
        'Remote work flexibility',
        'Health insurance',
        'Learning budget',
      ],
    },
    {
      id: '2',
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Jakarta, Indonesia',
      type: 'full-time',
      remote: true,
      description: 'Help us build and maintain our cloud infrastructure.',
      requirements: [
        '3+ years of DevOps experience',
        'Expertise in Kubernetes and Docker',
        'CI/CD pipeline experience',
        'Infrastructure as Code (Terraform)',
      ],
      benefits: [
        'Competitive salary',
        'Remote work flexibility',
        'Stock options',
        'Training opportunities',
      ],
    },
    {
      id: '3',
      title: 'Product Manager',
      department: 'Product',
      location: 'Jakarta, Indonesia',
      type: 'full-time',
      remote: false,
      description: 'Lead product strategy and roadmap for our AI recruitment platform.',
      requirements: [
        '4+ years of product management experience',
        'Experience with B2B SaaS products',
        'Strong analytical skills',
        'Excellent communication',
      ],
      benefits: [
        'Leadership role',
        'Equity package',
        'Health benefits',
        'Flexible hours',
      ],
    },
    {
      id: '4',
      title: 'UX Designer',
      department: 'Design',
      location: 'Jakarta, Indonesia',
      type: 'full-time',
      remote: true,
      description: 'Design beautiful and intuitive experiences for our users.',
      requirements: [
        '3+ years of UX design experience',
        'Proficiency in Figma',
        'User research experience',
        'Portfolio demonstrating design thinking',
      ],
      benefits: [
        'Creative environment',
        'Remote flexibility',
        'Design tools budget',
        'Conference attendance',
      ],
    },
    {
      id: '5',
      title: 'Data Scientist',
      department: 'Analytics',
      location: 'Jakarta, Indonesia',
      type: 'full-time',
      remote: true,
      description: 'Build ML models to power our AI recruitment features.',
      requirements: [
        'MS/PhD in Computer Science or related field',
        'Experience with Python, TensorFlow/PyTorch',
        'Strong statistical background',
        'Published research is a plus',
      ],
      benefits: [
        'Research opportunities',
        'GPU cluster access',
        'Conference sponsorship',
        'Flexible schedule',
      ],
    },
  ])

  const isProcessing = computed(() => 
    ['uploading', 'parsing', 'analyzing'].includes(status.value)
  )

  async function uploadResume(file: File) {
    uploadedFile.value = file
    status.value = 'uploading'
    progress.value = 0
    currentStep.value = 'Uploading your resume...'
    error.value = null

    try {
      // Simulate upload progress
      for (let i = 0; i <= 30; i += 10) {
        await delay(200)
        progress.value = i
      }

      status.value = 'parsing'
      currentStep.value = 'Extracting information from your CV...'

      for (let i = 30; i <= 60; i += 10) {
        await delay(300)
        progress.value = i
      }

      status.value = 'analyzing'
      currentStep.value = 'AI is analyzing your profile...'

      for (let i = 60; i <= 90; i += 10) {
        await delay(400)
        progress.value = i
      }

      // Simulate parsed result
      parsedResume.value = generateMockParsedResume(file.name)
      
      // Calculate match scores for positions
      availablePositions.value = availablePositions.value.map(pos => ({
        ...pos,
        matchScore: Math.floor(Math.random() * 30) + 70,
      }))

      progress.value = 100
      currentStep.value = 'Analysis complete!'
      status.value = 'complete'

    } catch (e) {
      status.value = 'error'
      error.value = 'Failed to process resume. Please try again.'
    }
  }

  function generateMockParsedResume(fileName: string): ParsedResume {
    return {
      fileName,
      uploadedAt: new Date(),
      personalInfo: {
        name: 'Your Name',
        email: 'your.email@example.com',
        phone: '+62 812 3456 7890',
        location: 'Jakarta, Indonesia',
        linkedin: 'linkedin.com/in/yourprofile',
        github: 'github.com/yourprofile',
      },
      summary: 'Experienced software engineer with a passion for building scalable applications and working with cutting-edge technologies.',
      skills: [
        { name: 'JavaScript', level: 'expert', yearsOfExperience: 5 },
        { name: 'TypeScript', level: 'advanced', yearsOfExperience: 3 },
        { name: 'React', level: 'expert', yearsOfExperience: 4 },
        { name: 'Node.js', level: 'advanced', yearsOfExperience: 4 },
        { name: 'Python', level: 'intermediate', yearsOfExperience: 2 },
        { name: 'AWS', level: 'intermediate', yearsOfExperience: 2 },
      ],
      experience: [
        {
          company: 'Tech Company A',
          title: 'Senior Software Engineer',
          startDate: '2022-01',
          endDate: '',
          current: true,
          highlights: [
            'Led a team of 5 developers',
            'Improved system performance by 40%',
            'Implemented CI/CD pipelines',
          ],
        },
        {
          company: 'Startup B',
          title: 'Software Engineer',
          startDate: '2019-06',
          endDate: '2021-12',
          current: false,
          highlights: [
            'Built core product features',
            'Mentored junior developers',
            'Contributed to open source projects',
          ],
        },
      ],
      education: [
        {
          institution: 'University of Indonesia',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          year: 2019,
          gpa: 3.8,
        },
      ],
      certifications: [
        { name: 'AWS Solutions Architect', issuer: 'Amazon', year: 2023 },
        { name: 'Google Cloud Professional', issuer: 'Google', year: 2022 },
      ],
      languages: [
        { name: 'Indonesian', proficiency: 'Native' },
        { name: 'English', proficiency: 'Professional' },
      ],
      aiInsights: {
        strengths: [
          'Strong technical background in modern web technologies',
          'Leadership experience with proven team management',
          'Continuous learning mindset with relevant certifications',
        ],
        areasForGrowth: [
          'Could benefit from more backend/infrastructure experience',
          'Consider expanding into ML/AI technologies',
        ],
        cultureFitScore: 85,
        technicalScore: 88,
        communicationScore: 82,
        suggestedRoles: [
          'Senior Software Engineer',
          'Tech Lead',
          'Full Stack Developer',
        ],
      },
    }
  }

  function selectPosition(position: JobPosition) {
    selectedPosition.value = position
  }

  function reset() {
    status.value = 'idle'
    progress.value = 0
    currentStep.value = ''
    uploadedFile.value = null
    parsedResume.value = null
    selectedPosition.value = null
    error.value = null
  }

  // CRUD Operations for Positions
  function addPosition(position: Omit<JobPosition, 'id'>) {
    const newId = String(Date.now())
    availablePositions.value.push({
      ...position,
      id: newId,
    })
    return newId
  }

  function updatePosition(id: string, updates: Partial<Omit<JobPosition, 'id'>>) {
    const index = availablePositions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      availablePositions.value[index] = {
        ...availablePositions.value[index],
        ...updates,
      }
      return true
    }
    return false
  }

  function deletePosition(id: string) {
    const index = availablePositions.value.findIndex(p => p.id === id)
    if (index !== -1) {
      availablePositions.value.splice(index, 1)
      return true
    }
    return false
  }

  function getPositionById(id: string) {
    return availablePositions.value.find(p => p.id === id)
  }

  // Position filtering
  const positionSearchQuery = ref('')
  const positionTypeFilter = ref<string>('all')
  const positionDepartmentFilter = ref<string>('all')

  const filteredPositions = computed(() => {
    let result = availablePositions.value

    if (positionSearchQuery.value) {
      const query = positionSearchQuery.value.toLowerCase()
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.department.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query)
      )
    }

    if (positionTypeFilter.value !== 'all') {
      result = result.filter(p => p.type === positionTypeFilter.value)
    }

    if (positionDepartmentFilter.value !== 'all') {
      result = result.filter(p => p.department === positionDepartmentFilter.value)
    }

    return result
  })

  const departments = computed(() => {
    const depts = new Set(availablePositions.value.map(p => p.department))
    return Array.from(depts)
  })

  const positionStats = computed(() => ({
    total: availablePositions.value.length,
    fullTime: availablePositions.value.filter(p => p.type === 'full-time').length,
    partTime: availablePositions.value.filter(p => p.type === 'part-time').length,
    contract: availablePositions.value.filter(p => p.type === 'contract').length,
    internship: availablePositions.value.filter(p => p.type === 'internship').length,
    remote: availablePositions.value.filter(p => p.remote).length,
  }))

  return {
    status,
    progress,
    currentStep,
    uploadedFile,
    parsedResume,
    selectedPosition,
    error,
    availablePositions,
    isProcessing,
    uploadResume,
    selectPosition,
    reset,
    // Position CRUD
    addPosition,
    updatePosition,
    deletePosition,
    getPositionById,
    // Position filtering
    positionSearchQuery,
    positionTypeFilter,
    positionDepartmentFilter,
    filteredPositions,
    departments,
    positionStats,
  }
})

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

