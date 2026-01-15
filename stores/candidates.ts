import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  stage: 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected'
  aiScore: number
  skills: string[]
  experience: number
  appliedAt: string
  lastActivity: string
  avatarUrl?: string
  resume?: {
    url: string
    parsedAt: string
    highlights: string[]
  }
  interviewScores?: {
    technical: number
    communication: number
    problemSolving: number
    cultureFit: number
  }
}

export const useCandidatesStore = defineStore('candidates', () => {
  const candidates = ref<Candidate[]>([
    // Applied candidates (12)
    {
      id: '1',
      name: 'Emma Watson',
      email: 'emma.w@email.com',
      phone: '+62 816 7890 1234',
      position: 'Data Scientist',
      department: 'Analytics',
      stage: 'applied',
      aiScore: 72,
      skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
      experience: 3,
      appliedAt: '2026-01-10',
      lastActivity: '2026-01-10',
    },
    {
      id: '2',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+62 816 1111 2222',
      position: 'Frontend Developer',
      department: 'Engineering',
      stage: 'applied',
      aiScore: 68,
      skills: ['React', 'JavaScript', 'CSS', 'HTML'],
      experience: 2,
      appliedAt: '2026-01-11',
      lastActivity: '2026-01-11',
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.g@email.com',
      phone: '+62 816 3333 4444',
      position: 'Product Manager',
      department: 'Product',
      stage: 'applied',
      aiScore: 70,
      skills: ['Agile', 'Roadmapping', 'Analytics'],
      experience: 3,
      appliedAt: '2026-01-12',
      lastActivity: '2026-01-12',
    },
    {
      id: '4',
      name: 'Kevin Lee',
      email: 'kevin.lee@email.com',
      phone: '+62 816 5555 6666',
      position: 'Backend Developer',
      department: 'Engineering',
      stage: 'applied',
      aiScore: 65,
      skills: ['Java', 'MySQL', 'REST API'],
      experience: 2,
      appliedAt: '2026-01-13',
      lastActivity: '2026-01-13',
    },
    {
      id: '5',
      name: 'Anna Brown',
      email: 'anna.b@email.com',
      phone: '+62 816 7777 8888',
      position: 'UX Designer',
      department: 'Design',
      stage: 'applied',
      aiScore: 74,
      skills: ['Figma', 'User Research', 'Prototyping'],
      experience: 2,
      appliedAt: '2026-01-13',
      lastActivity: '2026-01-13',
    },
    {
      id: '6',
      name: 'Tom Wilson',
      email: 'tom.w@email.com',
      phone: '+62 816 9999 0000',
      position: 'DevOps Engineer',
      department: 'Engineering',
      stage: 'applied',
      aiScore: 69,
      skills: ['Docker', 'Linux', 'AWS'],
      experience: 3,
      appliedAt: '2026-01-14',
      lastActivity: '2026-01-14',
    },
    // Screening candidates (8)
    {
      id: '7',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+62 814 5678 9012',
      position: 'Product Manager',
      department: 'Product',
      stage: 'screening',
      aiScore: 78,
      skills: ['Agile', 'Scrum', 'Data Analysis', 'Roadmapping', 'Stakeholder Management'],
      experience: 5,
      appliedAt: '2026-01-08',
      lastActivity: '2026-01-10',
    },
    {
      id: '8',
      name: 'Lisa Park',
      email: 'lisa.park@email.com',
      phone: '+62 818 9012 3456',
      position: 'Frontend Developer',
      department: 'Engineering',
      stage: 'screening',
      aiScore: 81,
      skills: ['Vue.js', 'JavaScript', 'CSS', 'Nuxt', 'Tailwind'],
      experience: 4,
      appliedAt: '2026-01-06',
      lastActivity: '2026-01-09',
    },
    {
      id: '9',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+62 818 1234 5678',
      position: 'Data Analyst',
      department: 'Analytics',
      stage: 'screening',
      aiScore: 76,
      skills: ['SQL', 'Python', 'Tableau', 'Excel'],
      experience: 3,
      appliedAt: '2026-01-07',
      lastActivity: '2026-01-09',
    },
    {
      id: '10',
      name: 'Jessica Taylor',
      email: 'jessica.t@email.com',
      phone: '+62 818 2345 6789',
      position: 'UI Designer',
      department: 'Design',
      stage: 'screening',
      aiScore: 79,
      skills: ['Figma', 'Adobe XD', 'Illustration'],
      experience: 4,
      appliedAt: '2026-01-08',
      lastActivity: '2026-01-10',
    },
    // Interview candidates (5)
    {
      id: '11',
      name: 'Sarah Chen',
      email: 'sarah.chen@email.com',
      phone: '+62 812 3456 7890',
      position: 'Senior Software Engineer',
      department: 'Engineering',
      stage: 'interview',
      aiScore: 94,
      skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Python'],
      experience: 6,
      appliedAt: '2026-01-05',
      lastActivity: '2026-01-12',
      interviewScores: {
        technical: 92,
        communication: 95,
        problemSolving: 96,
        cultureFit: 93,
      },
    },
    {
      id: '12',
      name: 'Ahmed Hassan',
      email: 'ahmed.h@email.com',
      phone: '+62 817 8901 2345',
      position: 'Backend Developer',
      department: 'Engineering',
      stage: 'interview',
      aiScore: 85,
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'REST API'],
      experience: 5,
      appliedAt: '2026-01-02',
      lastActivity: '2026-01-11',
      interviewScores: {
        technical: 87,
        communication: 82,
        problemSolving: 88,
        cultureFit: 84,
      },
    },
    {
      id: '13',
      name: 'Rachel Green',
      email: 'rachel.g@email.com',
      phone: '+62 817 1111 2222',
      position: 'Product Designer',
      department: 'Design',
      stage: 'interview',
      aiScore: 86,
      skills: ['Figma', 'User Research', 'Design Systems'],
      experience: 5,
      appliedAt: '2026-01-03',
      lastActivity: '2026-01-11',
      interviewScores: {
        technical: 84,
        communication: 90,
        problemSolving: 85,
        cultureFit: 88,
      },
    },
    // Assessment candidates (3)
    {
      id: '14',
      name: 'Marcus Johnson',
      email: 'marcus.j@email.com',
      phone: '+62 813 4567 8901',
      position: 'DevOps Engineer',
      department: 'Engineering',
      stage: 'assessment',
      aiScore: 87,
      skills: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux'],
      experience: 4,
      appliedAt: '2026-01-03',
      lastActivity: '2026-01-11',
      interviewScores: {
        technical: 88,
        communication: 84,
        problemSolving: 90,
        cultureFit: 86,
      },
    },
    {
      id: '15',
      name: 'Nina Patel',
      email: 'nina.p@email.com',
      phone: '+62 821 2345 6789',
      position: 'QA Engineer',
      department: 'Engineering',
      stage: 'assessment',
      aiScore: 76,
      skills: ['Selenium', 'Cypress', 'Test Automation', 'API Testing', 'Performance Testing'],
      experience: 4,
      appliedAt: '2026-01-04',
      lastActivity: '2026-01-10',
    },
    // Offer candidates (2)
    {
      id: '16',
      name: 'David Kim',
      email: 'david.kim@email.com',
      phone: '+62 815 6789 0123',
      position: 'UX Designer',
      department: 'Design',
      stage: 'offer',
      aiScore: 91,
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Usability Testing'],
      experience: 7,
      appliedAt: '2025-12-28',
      lastActivity: '2026-01-12',
      interviewScores: {
        technical: 89,
        communication: 94,
        problemSolving: 90,
        cultureFit: 92,
      },
    },
    {
      id: '17',
      name: 'Daniel Park',
      email: 'daniel.p@email.com',
      phone: '+62 815 1111 2222',
      position: 'Senior Backend Developer',
      department: 'Engineering',
      stage: 'offer',
      aiScore: 93,
      skills: ['Go', 'Kubernetes', 'PostgreSQL', 'gRPC'],
      experience: 7,
      appliedAt: '2025-12-25',
      lastActivity: '2026-01-12',
      interviewScores: {
        technical: 95,
        communication: 90,
        problemSolving: 94,
        cultureFit: 91,
      },
    },
    // Hired candidates (1)
    {
      id: '18',
      name: 'Carlos Rodriguez',
      email: 'carlos.r@email.com',
      phone: '+62 819 0123 4567',
      position: 'Security Engineer',
      department: 'Engineering',
      stage: 'hired',
      aiScore: 96,
      skills: ['Cybersecurity', 'Penetration Testing', 'SIEM', 'Compliance', 'Cloud Security'],
      experience: 8,
      appliedAt: '2025-12-15',
      lastActivity: '2026-01-08',
      interviewScores: {
        technical: 98,
        communication: 94,
        problemSolving: 97,
        cultureFit: 95,
      },
    },
    // Rejected candidates
    {
      id: '19',
      name: 'Yuki Tanaka',
      email: 'yuki.t@email.com',
      phone: '+62 820 1234 5678',
      position: 'Mobile Developer',
      department: 'Engineering',
      stage: 'rejected',
      aiScore: 45,
      skills: ['React Native', 'Flutter', 'iOS', 'Android'],
      experience: 2,
      appliedAt: '2025-12-20',
      lastActivity: '2026-01-02',
    },
  ])

  const selectedCandidate = ref<Candidate | null>(null)
  const searchQuery = ref('')
  const stageFilter = ref<string>('all')
  const departmentFilter = ref<string>('all')

  const filteredCandidates = computed(() => {
    return candidates.value.filter(candidate => {
      const matchesSearch = 
        candidate.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesStage = stageFilter.value === 'all' || candidate.stage === stageFilter.value
      const matchesDepartment = departmentFilter.value === 'all' || candidate.department === departmentFilter.value

      return matchesSearch && matchesStage && matchesDepartment
    })
  })

  const stageStats = computed(() => {
    const stats = {
      applied: 0,
      screening: 0,
      interview: 0,
      assessment: 0,
      offer: 0,
      hired: 0,
      rejected: 0,
    }
    candidates.value.forEach(c => {
      stats[c.stage]++
    })
    return stats
  })

  const averageAiScore = computed(() => {
    const activeCandidates = candidates.value.filter(c => c.stage !== 'rejected')
    if (activeCandidates.length === 0) return 0
    return Math.round(
      activeCandidates.reduce((sum, c) => sum + c.aiScore, 0) / activeCandidates.length
    )
  })

  function selectCandidate(id: string) {
    selectedCandidate.value = candidates.value.find(c => c.id === id) || null
  }

  function updateCandidateStage(id: string, stage: Candidate['stage']) {
    const candidate = candidates.value.find(c => c.id === id)
    if (candidate) {
      candidate.stage = stage
      candidate.lastActivity = new Date().toISOString().split('T')[0]
    }
  }

  function addCandidate(candidate: Omit<Candidate, 'id'>) {
    candidates.value.push({
      ...candidate,
      id: Date.now().toString(),
    })
  }

  return {
    candidates,
    selectedCandidate,
    searchQuery,
    stageFilter,
    departmentFilter,
    filteredCandidates,
    stageStats,
    averageAiScore,
    selectCandidate,
    updateCandidateStage,
    addCandidate,
  }
})


