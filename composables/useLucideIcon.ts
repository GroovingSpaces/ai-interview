import type { Component } from 'vue'
import {
  HelpCircle, Sprout, Crown, AlertTriangle, Users, Target, Frown, CheckCircle2, ShieldCheck,
  Sparkles, Rocket, Star, Trophy, Flag, Heart, Gem,
} from 'lucide-vue-next'

const map: Record<string, Component> = {
  'help-circle': HelpCircle,
  'sprout': Sprout,
  'crown': Crown,
  'alert-triangle': AlertTriangle,
  'users': Users,
  'target': Target,
  'frown': Frown,
  'check-circle-2': CheckCircle2,
  'shield-check': ShieldCheck,
  'sparkles': Sparkles,
  'rocket': Rocket,
  'star': Star,
  'trophy': Trophy,
  'flag': Flag,
  'heart': Heart,
  'gem': Gem,
}

export function lucideByName(name: string): Component {
  return map[name] ?? HelpCircle
}
