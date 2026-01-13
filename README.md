# Telkomsel AI HCM - Recruitment Suite

A modern, AI-powered Human Capital Management dashboard built with Nuxt.js. This application provides a comprehensive recruitment platform featuring AI-driven candidate matching, intelligent interviews, and adaptive learning management.

![Dashboard Preview](https://via.placeholder.com/1200x600/0a0f1a/00d4ff?text=AI+Recruitment+Suite)

## ✨ Features

### 🎯 HR Command Center
- **Candidate Pipeline Dashboard** - Visual funnel showing candidates across all stages
- **TanStack Table Integration** - Sortable, filterable candidate list with pagination
- **AI Match Scores** - Color-coded scoring system (Excellent/Good/Average/Low)
- **Quick Actions** - Immediate access to candidate profiles and actions

### 🤖 AI Interview Interface
- **Real-time Transcript** - Live conversation display with speaker identification
- **AI Status Indicators** - Visual feedback for Listening/Thinking/Speaking states
- **Audio Visualization** - Dynamic waveform display during active sessions
- **Question Progress Tracking** - Type-coded questions with difficulty levels
- **Real-time Metrics** - Confidence, engagement, and clarity scoring

### 📚 Learning Management System (LMS)
- **Adaptive Learning Paths** - Personalized training roadmaps
- **Module Cards** - Progress tracking with lesson completion
- **AI-Generated Quizzes** - Dynamic assessments with instant feedback
- **Badge System** - Achievement recognition for completed milestones
- **Progress Visualization** - Circular progress rings and progress bars

### 📄 Applicant Portal
- **Drag-and-Drop CV Upload** - Intuitive file upload interface
- **AI Resume Parsing** - Automatic extraction of skills, experience, education
- **Match Score Visualization** - Position compatibility scoring
- **Instant AI Feedback** - Strengths and areas for improvement
- **Job Discovery** - Searchable, filterable position listings

## 🛠️ Tech Stack

- **Framework**: [Nuxt.js 3](https://nuxt.com/) - Vue.js meta-framework
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Components**: Shadcn-vue inspired components
- **State Management**: [Pinia](https://pinia.vuejs.org/) - Vue store
- **Tables**: [TanStack Table](https://tanstack.com/table) - Headless UI tables
- **Icons**: [Lucide Vue](https://lucide.dev/) - Beautiful icons
- **Animations**: CSS animations + Tailwind Animate

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd telkomsel-ai-hcm-fe

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Generate production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
telkomsel-ai-hcm-fe/
├── assets/
│   └── css/
│       └── main.css          # Global styles & Tailwind directives
├── components/
│   ├── ui/                   # Base UI components (Button, Card, etc.)
│   ├── dashboard/            # HR dashboard components
│   ├── interview/            # AI interview components
│   ├── lms/                  # Learning management components
│   └── applicant/            # Applicant portal components
├── composables/              # Vue composables
├── layouts/
│   ├── default.vue           # Main dashboard layout
│   └── applicant.vue         # Public applicant layout
├── lib/
│   └── utils.ts              # Utility functions
├── pages/
│   ├── index.vue             # Command Center dashboard
│   ├── candidates.vue        # Full candidates view
│   ├── interview.vue         # AI interview interface
│   ├── lms.vue               # Learning hub
│   └── apply.vue             # Applicant portal
├── plugins/                  # Nuxt plugins
├── stores/                   # Pinia stores
│   ├── candidates.ts         # Candidate management
│   ├── interview.ts          # Interview state
│   ├── lms.ts                # Learning modules
│   └── application.ts        # Application flow
├── nuxt.config.ts            # Nuxt configuration
├── tailwind.config.ts        # Tailwind configuration
└── package.json
```

## 🎨 Design System

### Color Palette

| Color | CSS Variable | Usage |
|-------|-------------|-------|
| Cyan | `--ai-cyan` (#00D4FF) | Primary AI accent, active states |
| Purple | `--ai-purple` (#8B5CF6) | Secondary accent, thinking states |
| Pink | `--ai-pink` (#EC4899) | Tertiary accent, gradients |
| Green | `--score-excellent` (#10B981) | High scores, success |
| Yellow | `--score-average` (#F59E0B) | Medium scores, warning |
| Red | `--score-low` (#EF4444) | Low scores, errors |

### Typography

- **Primary Font**: DM Sans - Clean, modern sans-serif
- **Monospace**: JetBrains Mono - Code and technical content

### Components

All UI components follow a consistent design language:
- Glass morphism effects with backdrop blur
- Gradient borders and hover states
- Smooth transitions and micro-animations
- Dark mode optimized with light mode support

## 📱 Responsive Design

The application is fully responsive with mobile-first approach:
- **Mobile (< 768px)**: Collapsible sidebar, stacked layouts
- **Tablet (768px - 1024px)**: Adaptive grid layouts
- **Desktop (> 1024px)**: Full sidebar, multi-column layouts

## 🔧 Configuration

### Environment Variables

Create a `.env` file for configuration:

```env
# API Configuration (for future backend integration)
NUXT_PUBLIC_API_URL=https://api.example.com
```

### Customization

- **Themes**: Modify `assets/css/main.css` CSS variables
- **Colors**: Update `tailwind.config.ts` color definitions
- **Components**: Extend or modify components in `components/ui/`

## 📄 License

This project is proprietary software for Telkomsel.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

---

Built with ❤️ for Telkomsel's AI-driven recruitment transformation

