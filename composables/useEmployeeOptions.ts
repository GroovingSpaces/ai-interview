export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'ktp', label: 'KTP (Kartu Tanda Penduduk)' },
  { value: 'kk', label: 'Kartu Keluarga' },
  { value: 'npwp', label: 'NPWP' },
  { value: 'bpjs_kesehatan', label: 'BPJS Kesehatan' },
  { value: 'bpjs_ketenagakerjaan', label: 'BPJS Ketenagakerjaan' },
  { value: 'ijazah', label: 'Ijazah' },
  { value: 'transcript', label: 'Transkrip Nilai' },
  { value: 'certificate', label: 'Sertifikat' },
  { value: 'contract', label: 'Kontrak Kerja' },
  { value: 'photo', label: 'Pas Foto' },
  { value: 'cv', label: 'CV / Resume' },
  { value: 'reference_letter', label: 'Surat Referensi' },
  { value: 'other', label: 'Lainnya' },
] as const

export const RELATIONSHIP_OPTIONS = [
  { value: 'spouse', label: 'Suami / Istri' },
  { value: 'child', label: 'Anak' },
  { value: 'father', label: 'Ayah' },
  { value: 'mother', label: 'Ibu' },
  { value: 'sibling', label: 'Saudara Kandung' },
  { value: 'emergency_contact', label: 'Kontak Darurat' },
  { value: 'other', label: 'Lainnya' },
] as const

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Laki-laki' },
  { value: 'female', label: 'Perempuan' },
] as const

export const RELIGION_OPTIONS = [
  { value: 'islam', label: 'Islam' },
  { value: 'christian', label: 'Kristen' },
  { value: 'catholic', label: 'Katolik' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddhist', label: 'Buddha' },
  { value: 'confucianism', label: 'Konghucu' },
] as const

export const MARRIAGE_STATUS_OPTIONS = [
  { value: 'single', label: 'Belum Menikah' },
  { value: 'married', label: 'Menikah' },
  { value: 'divorced', label: 'Cerai' },
  { value: 'widowed', label: 'Janda / Duda' },
] as const

export const BLOOD_TYPE_OPTIONS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'AB', label: 'AB' },
  { value: 'O', label: 'O' },
] as const

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'PKWTT', label: 'PKWTT (Permanen)' },
  { value: 'PKWT', label: 'PKWT (Kontrak)' },
  { value: 'INTERNSHIP', label: 'Magang' },
  { value: 'DAILY_WORKER', label: 'Pekerja Harian' },
  { value: 'FREELANCE', label: 'Freelance' },
] as const

export const CONTRACT_DURATION_OPTIONS = [
  { value: '3_MONTHS', label: '3 Bulan' },
  { value: '6_MONTHS', label: '6 Bulan' },
  { value: '1_YEAR', label: '1 Tahun' },
  { value: 'PERMANENT', label: 'Permanen' },
] as const

export function labelOf<T extends { value: string; label: string }>(
  options: readonly T[],
  value?: string
): string {
  if (!value) return '-'
  return options.find((o) => o.value === value)?.label ?? value
}
