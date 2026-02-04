/**
 * Composable untuk validasi approval: hanya admin atau direct supervisor (atasan langsung)
 * dari karyawan yang mengajukan yang dapat approve pengajuan (leave, manual attendance, overtime).
 */
export function useApprovalPermission() {
  const authStore = useAuthStore()
  const employeesStore = useEmployeesStore()

  /** Employee ID dari user yang login (dicek dari email karyawan) */
  const currentUserEmployeeId = computed(() => {
    const email = authStore.user?.email
    if (!email) return undefined
    const emp = employeesStore.employees.find((e) => e.email === email)
    return emp?.id
  })

  /**
   * True jika user saat ini boleh approve pengajuan dari karyawan dengan employeeId.
   * Boleh jika: user adalah admin, ATAU user adalah direct supervisor dari karyawan tersebut.
   */
  function canApproveSubmission(employeeId: string): boolean {
    if (!employeeId) return false
    // Admin (atau staff dengan akses penuh) bisa approve semua
    if (authStore.isAdmin) return true
    const supervisorId = currentUserEmployeeId.value
    if (!supervisorId) return false
    const employee = employeesStore.getEmployeeById(employeeId)
    return employee?.directSupervisorId === supervisorId
  }

  return {
    currentUserEmployeeId,
    canApproveSubmission,
  }
}
