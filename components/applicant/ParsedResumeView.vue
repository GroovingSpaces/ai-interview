<script setup lang="ts">
import { computed } from 'vue'
import { useApplicationStore } from '~/stores/application'
import { getScoreColor } from '~/lib/utils'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Sparkles,
  TrendingUp,
  Target,
  Linkedin,
  Github,
} from 'lucide-vue-next'

const applicationStore = useApplicationStore()
const resume = computed(() => applicationStore.parsedResume)
</script>

<template>
  <div v-if="resume" class="space-y-6">
    <!-- AI Insights Card -->
    <div class="glass-card gradient-border p-6 space-y-6">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg bg-ai-orange/20">
          <Sparkles class="w-5 h-5 text-ai-orange" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-foreground">AI Insights</h2>
          <p class="text-sm text-muted-foreground">Personalized analysis of your profile</p>
        </div>
      </div>

      <!-- Scores -->
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-4 rounded-xl bg-muted/30">
          <p
            :class="[
              'text-3xl font-bold',
              `text-score-${getScoreColor(resume.aiInsights.technicalScore)}`
            ]"
          >
            {{ resume.aiInsights.technicalScore }}%
          </p>
          <p class="text-sm text-muted-foreground mt-1">Technical</p>
        </div>
        <div class="text-center p-4 rounded-xl bg-muted/30">
          <p
            :class="[
              'text-3xl font-bold',
              `text-score-${getScoreColor(resume.aiInsights.cultureFitScore)}`
            ]"
          >
            {{ resume.aiInsights.cultureFitScore }}%
          </p>
          <p class="text-sm text-muted-foreground mt-1">Culture Fit</p>
        </div>
        <div class="text-center p-4 rounded-xl bg-muted/30">
          <p
            :class="[
              'text-3xl font-bold',
              `text-score-${getScoreColor(resume.aiInsights.communicationScore)}`
            ]"
          >
            {{ resume.aiInsights.communicationScore }}%
          </p>
          <p class="text-sm text-muted-foreground mt-1">Communication</p>
        </div>
      </div>

      <!-- Strengths -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-score-excellent" />
          Strengths
        </h3>
        <ul class="space-y-2">
          <li
            v-for="strength in resume.aiInsights.strengths"
            :key="strength"
            class="flex items-start gap-2 text-sm"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-score-excellent mt-2 flex-shrink-0" />
            <span>{{ strength }}</span>
          </li>
        </ul>
      </div>

      <!-- Areas for Growth -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Target class="w-4 h-4 text-score-average" />
          Areas for Growth
        </h3>
        <ul class="space-y-2">
          <li
            v-for="area in resume.aiInsights.areasForGrowth"
            :key="area"
            class="flex items-start gap-2 text-sm"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-score-average mt-2 flex-shrink-0" />
            <span>{{ area }}</span>
          </li>
        </ul>
      </div>

      <!-- Suggested Roles -->
      <div class="space-y-3">
        <h3 class="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Suggested Roles
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="role in resume.aiInsights.suggestedRoles"
            :key="role"
            class="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20"
          >
            {{ role }}
          </span>
        </div>
      </div>
    </div>

    <!-- Personal Info -->
    <UiCard variant="glass" class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <User class="w-5 h-5 text-primary" />
        Personal Information
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center gap-3">
          <Mail class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm">{{ resume.personalInfo.email }}</span>
        </div>
        <div class="flex items-center gap-3">
          <Phone class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm">{{ resume.personalInfo.phone }}</span>
        </div>
        <div class="flex items-center gap-3">
          <MapPin class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm">{{ resume.personalInfo.location }}</span>
        </div>
        <div v-if="resume.personalInfo.linkedin" class="flex items-center gap-3">
          <Linkedin class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm">{{ resume.personalInfo.linkedin }}</span>
        </div>
        <div v-if="resume.personalInfo.github" class="flex items-center gap-3">
          <Github class="w-4 h-4 text-muted-foreground" />
          <span class="text-sm">{{ resume.personalInfo.github }}</span>
        </div>
      </div>
    </UiCard>

    <!-- Skills -->
    <UiCard variant="glass" class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-foreground">Skills</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="skill in resume.skills"
          :key="skill.name"
          class="flex items-center justify-between p-3 rounded-lg bg-muted/30"
        >
          <div>
            <p class="font-medium text-foreground">{{ skill.name }}</p>
            <p class="text-xs text-muted-foreground">{{ skill.yearsOfExperience }} years</p>
          </div>
          <span
            :class="[
              'px-2 py-1 rounded text-xs font-medium capitalize',
              skill.level === 'expert' && 'bg-score-excellent/20 text-score-excellent',
              skill.level === 'advanced' && 'bg-score-good/20 text-score-good',
              skill.level === 'intermediate' && 'bg-score-average/20 text-score-average',
              skill.level === 'beginner' && 'bg-muted text-muted-foreground',
            ]"
          >
            {{ skill.level }}
          </span>
        </div>
      </div>
    </UiCard>

    <!-- Experience -->
    <UiCard variant="glass" class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <Briefcase class="w-5 h-5 text-primary" />
        Experience
      </h2>
      <div class="space-y-6">
        <div
          v-for="exp in resume.experience"
          :key="`${exp.company}-${exp.startDate}`"
          class="relative pl-6 border-l-2 border-border"
        >
          <div class="absolute left-0 top-0 w-3 h-3 rounded-full bg-primary -translate-x-[7px]" />
          <div class="space-y-2">
            <div>
              <h3 class="font-semibold text-foreground">{{ exp.title }}</h3>
              <p class="text-sm text-muted-foreground">
                {{ exp.company }} · {{ exp.startDate }} - {{ exp.current ? 'Present' : exp.endDate }}
              </p>
            </div>
            <ul class="space-y-1">
              <li
                v-for="highlight in exp.highlights"
                :key="highlight"
                class="text-sm text-muted-foreground flex items-start gap-2"
              >
                <span class="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                {{ highlight }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Education -->
    <UiCard variant="glass" class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <GraduationCap class="w-5 h-5 text-primary" />
        Education
      </h2>
      <div class="space-y-4">
        <div
          v-for="edu in resume.education"
          :key="`${edu.institution}-${edu.year}`"
          class="p-4 rounded-lg bg-muted/30"
        >
          <h3 class="font-semibold text-foreground">{{ edu.degree }} in {{ edu.field }}</h3>
          <p class="text-sm text-muted-foreground">{{ edu.institution }} · {{ edu.year }}</p>
          <p v-if="edu.gpa" class="text-sm text-muted-foreground mt-1">GPA: {{ edu.gpa }}</p>
        </div>
      </div>
    </UiCard>

    <!-- Certifications -->
    <UiCard v-if="resume.certifications.length > 0" variant="glass" class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <Award class="w-5 h-5 text-primary" />
        Certifications
      </h2>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="cert in resume.certifications"
          :key="cert.name"
          class="px-4 py-2 rounded-lg bg-muted/30 border border-border"
        >
          <p class="font-medium text-foreground">{{ cert.name }}</p>
          <p class="text-xs text-muted-foreground">{{ cert.issuer }} · {{ cert.year }}</p>
        </div>
      </div>
    </UiCard>

    <!-- Languages -->
    <UiCard v-if="resume.languages.length > 0" variant="glass" class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <Globe class="w-5 h-5 text-primary" />
        Languages
      </h2>
      <div class="flex flex-wrap gap-3">
        <div
          v-for="lang in resume.languages"
          :key="lang.name"
          class="px-4 py-2 rounded-lg bg-muted/30"
        >
          <span class="font-medium text-foreground">{{ lang.name }}</span>
          <span class="text-muted-foreground"> · {{ lang.proficiency }}</span>
        </div>
      </div>
    </UiCard>
  </div>
</template>

