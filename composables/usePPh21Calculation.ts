/**
 * Perhitungan PPh 21 sesuai regulasi Indonesia (UU HPP, PP 58/2023).
 * PTKP per bulan (tahun ÷ 12), biaya jabatan 5% max Rp 500 rb.
 */

export const BIAYA_JABATAN_RATE = 0.05
export const BIAYA_JABATAN_MAX_MONTHLY = 500_000

/** PTKP per bulan (rupiah) per status. Sumber: peraturan PTKP terbaru. */
export const PTKP_MONTHLY: Record<string, number> = {
  'TK/0': 4_500_000,   // 54 jt/tahun
  'TK/1': 4_875_000,   // 58,5 jt/tahun
  'TK/2': 5_250_000,   // 63 jt/tahun
  'TK/3': 5_625_000,   // 67,5 jt/tahun
  'K/0': 4_875_000,    // 58,5 jt/tahun
  'K/1': 5_250_000,    // 63 jt/tahun
  'K/2': 5_625_000,    // 67,5 jt/tahun
  'K/3': 6_000_000,    // 72 jt/tahun
}

export const PTKP_OPTIONS = [
  { value: 'TK/0', label: 'TK/0' },
  { value: 'TK/1', label: 'TK/1' },
  { value: 'TK/2', label: 'TK/2' },
  { value: 'TK/3', label: 'TK/3' },
  { value: 'K/0', label: 'K/0' },
  { value: 'K/1', label: 'K/1' },
  { value: 'K/2', label: 'K/2' },
  { value: 'K/3', label: 'K/3' },
] as const

export type PtkpStatus = (typeof PTKP_OPTIONS)[number]['value']

export function getPtkpMonthly(status: string): number {
  return PTKP_MONTHLY[status] ?? PTKP_MONTHLY['TK/0']
}

/** Tarif PPh 21 progresif UU HPP (lapis bulanan) */
export function hitungPPh21Bulanan(pkpBulanan: number): number {
  if (pkpBulanan <= 0) return 0
  const lapis = [
    { limit: 5_000_000, rate: 0.05 },
    { limit: 20_833_333, rate: 0.15 },
    { limit: 41_666_667, rate: 0.25 },
    { limit: 416_666_667, rate: 0.3 },
    { limit: Infinity, rate: 0.35 },
  ]
  let tax = 0
  let remaining = pkpBulanan
  let prevLimit = 0
  for (const layer of lapis) {
    const layerWidth = Math.min(remaining, layer.limit - prevLimit)
    if (layerWidth > 0) tax += layerWidth * layer.rate
    remaining -= layerWidth
    prevLimit = layer.limit
    if (remaining <= 0) break
  }
  return Math.round(tax)
}

export function computePPh21FromGross(
  grossIncome: number,
  bpjsTk: number,
  bpjsKesehatan: number,
  ptkpStatus: string
): { pkp: number; pph21: number } {
  const biayaJabatan = Math.min(
    Math.round(grossIncome * BIAYA_JABATAN_RATE),
    BIAYA_JABATAN_MAX_MONTHLY
  )
  const ptkp = getPtkpMonthly(ptkpStatus)
  const pkp = Math.max(0, grossIncome - biayaJabatan - bpjsTk - bpjsKesehatan - ptkp)
  const pph21 = hitungPPh21Bulanan(pkp)
  return { pkp, pph21 }
}
