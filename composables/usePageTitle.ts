/**
 * Returns reactive page title. Cukup "title" saja, tanpa key embel-embel.
 * Nilai diambil dari peta lokal (bukan i18n key).
 */
const TITLES: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    users: 'Users',
    employee: 'Employee',
    employeeDatabase: 'Employee',
    promotion: 'Promotion',
    retired: 'Retired',
    mutation: 'Mutation',
    payroll: 'Payroll',
    initialPayroll: 'Initial Payroll',
    generatePayroll: 'Generate Payroll',
    attendance: 'Attendance',
    cuti: 'Leave',
    leave: 'Leave',
    overtime: 'Overtime',
    recruitment: 'Recruitment',
    candidates: 'Candidates',
    positions: 'Positions',
    company: 'Company',
    department: 'Department',
    divisi: 'Division',
    positionLevel: 'Position Level',
    location: 'Location',
    organization: 'Organization',
    learningHub: 'Learning Hub',
  },
  id: {
    dashboard: 'Dashboard',
    users: 'Pengguna',
    employee: 'Karyawan',
    employeeDatabase: 'Karyawan',
    promotion: 'Promosi',
    retired: 'Pensiun',
    mutation: 'Mutasi',
    payroll: 'Penggajian',
    initialPayroll: 'Komponen Gaji (Initial Payroll)',
    generatePayroll: 'Generate Penggajian',
    attendance: 'Kehadiran',
    cuti: 'Cuti',
    leave: 'Cuti',
    overtime: 'Lembur',
    recruitment: 'Rekrutmen',
    candidates: 'Kandidat',
    positions: 'Posisi',
    company: 'Perusahaan',
    department: 'Departemen',
    divisi: 'Divisi',
    positionLevel: 'Jenjang Jabatan',
    location: 'Lokasi',
    organization: 'Organisasi',
    learningHub: 'Learning Hub',
  },
}

export function usePageTitle(module?: string) {
  const { locale } = useI18n()
  const state = useState<string>('pageTitleModule', () => 'dashboard')
  if (module !== undefined) state.value = module
  const title = computed(() => {
    const loc = locale.value || 'en'
    const mod = state.value || 'dashboard'
    return TITLES[loc]?.[mod] ?? TITLES[loc]?.dashboard ?? 'Dashboard'
  })
  return { title }
}
