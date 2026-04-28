import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RosterEntry } from '~/stores/shifts'

export interface ComplianceRules {
  maxHoursPerWeek: number
  minRestBetweenShiftsHours: number
  maxConsecutiveDays: number
  gracePeriodMinutes: number
}

export interface ComplianceViolation {
  type: 'max_hours_week' | 'min_rest' | 'max_consecutive_days'
  employeeId: string
  message: string
  details?: string
}

const DEFAULT_RULES: ComplianceRules = {
  maxHoursPerWeek: 40,
  minRestBetweenShiftsHours: 11,
  maxConsecutiveDays: 6,
  gracePeriodMinutes: 15,
}

export const useWfmComplianceStore = defineStore('wfm-compliance', () => {
  const rules = ref<ComplianceRules>({ ...DEFAULT_RULES })

  function updateRules(updates: Partial<ComplianceRules>) {
    rules.value = { ...rules.value, ...updates }
  }

  function getRules(): ComplianceRules {
    return { ...rules.value }
  }

  /**
   * Parse shift time to minutes from midnight (e.g. "08:00" -> 480, "20:00" -> 1200).
   * End time past midnight (e.g. "04:00") -> 24*60 + 240 = 1560
   */
  function timeToMinutes(t: string): number {
    const [h, m] = t.split(':').map(Number)
    if (h < 12) return h * 60 + m + 24 * 60 // next day
    return h * 60 + m
  }

  function getShiftDurationMinutes(startTime: string, endTime: string, breakMinutes: number): number {
    const start = startTime.split(':').map(Number)
    const end = endTime.split(':').map(Number)
    let startMin = start[0] * 60 + start[1]
    let endMin = end[0] * 60 + end[1]
    if (endMin < startMin) endMin += 24 * 60
    return Math.max(0, endMin - startMin - (breakMinutes || 0))
  }

  /**
   * Check roster entries for a week and return violations.
   */
  function validateRoster(
    rosterEntries: RosterEntry[],
    getShift: (shiftId: string) => { startTime: string; endTime: string; breakMinutes?: number } | undefined
  ): ComplianceViolation[] {
    const violations: ComplianceViolation[] = []
    const r = rules.value

    const byEmployee = new Map<string, RosterEntry[]>()
    for (const e of rosterEntries) {
      if (!byEmployee.has(e.employeeId)) byEmployee.set(e.employeeId, [])
      byEmployee.get(e.employeeId)!.push(e)
    }

    for (const [employeeId, entries] of byEmployee) {
      const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))

      let totalMinutes = 0
      for (const ent of sorted) {
        const shift = getShift(ent.shiftId)
        if (shift) {
          totalMinutes += getShiftDurationMinutes(
            shift.startTime,
            shift.endTime,
            shift.breakMinutes ?? 0
          )
        }
      }
      if (totalMinutes > r.maxHoursPerWeek * 60) {
        violations.push({
          type: 'max_hours_week',
          employeeId,
          message: `Melebihi ${r.maxHoursPerWeek} jam/minggu`,
          details: `${Math.round(totalMinutes / 60)} jam`,
        })
      }

      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const curr = sorted[i]
        const prevShift = getShift(prev.shiftId)
        const currShift = getShift(curr.shiftId)
        if (!prevShift || !currShift) continue
        const prevEnd = prevShift.endTime
        const currStart = currShift.startTime
        const prevDate = new Date(prev.date)
        const currDate = new Date(curr.date)
        const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        let restHours = 0
        if (dayDiff === 0) {
          const prevEndMin = prevEnd.split(':').map(Number)[0] * 60 + prevEnd.split(':').map(Number)[1]
          let currStartMin = currStart.split(':').map(Number)[0] * 60 + currStart.split(':').map(Number)[1]
          if (currStartMin < prevEndMin) currStartMin += 24 * 60
          restHours = (currStartMin - prevEndMin) / 60
        } else if (dayDiff === 1) {
          const [ph, pm] = prevEnd.split(':').map(Number)
          const [ch, cm] = currStart.split(':').map(Number)
          restHours = (24 - ph - pm / 60) + (ch + cm / 60)
        }
        if (restHours < r.minRestBetweenShiftsHours) {
          violations.push({
            type: 'min_rest',
            employeeId,
            message: `Istirahat antar shift < ${r.minRestBetweenShiftsHours} jam`,
            details: `${restHours.toFixed(1)} jam`,
          })
        }
      }

      let consecutive = 1
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1].date)
        const curr = new Date(sorted[i].date)
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        if (diff === 1) consecutive++
        else consecutive = 1
      }
      if (consecutive > r.maxConsecutiveDays) {
        violations.push({
          type: 'max_consecutive_days',
          employeeId,
          message: `Max ${r.maxConsecutiveDays} hari berturut-turut`,
          details: `${consecutive} hari`,
        })
      }
    }

    return violations
  }

  return {
    rules,
    updateRules,
    getRules,
    validateRoster,
    getShiftDurationMinutes,
  }
})
