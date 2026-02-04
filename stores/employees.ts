import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface WorkHistoryItem {
  company: string
  position: string
  startDate: string
  endDate: string
  description?: string
}

export interface EducationItem {
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: string
  endYear: string
}

export interface CertificationItem {
  name: string
  issuer: string
  date: string
  expiryDate?: string
}

export interface EmployeeDocument {
  id: string
  name: string
  type: string
  /** Keterangan / description of the document */
  description?: string
  /** Original file name (when uploaded as file) */
  fileName?: string
  /** Base64 data URL of uploaded file (data:type;base64,...) */
  fileData?: string
  /** @deprecated Link URL; use fileData for uploads */
  url?: string
  uploadedAt: string
}

export interface Employee {
  id: string
  name: string
  email: string
  employeeId: string
  department: string
  position: string
  joinDate: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  religion?: string
  marriageStatus?: string
  address?: string
  provinsi?: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
  postalCode?: string
  isActive: boolean
  /** Gaji pokok (untuk generate payroll) */
  baseSalary?: number
  departmentId?: string
  divisionId?: string
  positionLevelId?: string
  locationId?: string
  organizationId?: string
  workHistory: WorkHistoryItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  documents: EmployeeDocument[]
  directSupervisorId?: string
  employeeStatus?: string
}

export interface CreateEmployeePayload {
  name: string
  email: string
  employeeId: string
  department: string
  position: string
  joinDate: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  religion?: string
  marriageStatus?: string
  address?: string
  provinsi?: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
  postalCode?: string
  departmentId?: string
  divisionId?: string
  positionLevelId?: string
  locationId?: string
  organizationId?: string
  workHistory: WorkHistoryItem[]
  education: EducationItem[]
  certifications: CertificationItem[]
  directSupervisorId?: string
  employeeStatus?: string
}


export interface UpdateEmployeePayload {
  name?: string
  email?: string
  employeeId?: string
  department?: string
  position?: string
  joinDate?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  religion?: string
  marriageStatus?: string
  address?: string
  provinsi?: string
  kota?: string
  kecamatan?: string
  kelurahan?: string
  postalCode?: string
  isActive?: boolean
  baseSalary?: number
  departmentId?: string
  divisionId?: string
  positionLevelId?: string
  locationId?: string
  organizationId?: string
  workHistory?: WorkHistoryItem[]
  education?: EducationItem[]
  certifications?: CertificationItem[]
  documents?: EmployeeDocument[]
  directSupervisorId?: string
  employeeStatus?: string
}

const emptyWorkHistory = (): WorkHistoryItem => ({
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  description: '',
})

const emptyEducation = (): EducationItem => ({
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startYear: '',
  endYear: '',
})

const emptyCertification = (): CertificationItem => ({
  name: '',
  issuer: '',
  date: '',
  expiryDate: '',
})

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([
    {
      id: '1',
      name: 'Ahmad Rizki',
      email: 'ahmad.rizki@telkomsel.com',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Software Engineer',
      joinDate: '2022-03-15',
      phone: '+62 812-3456-7890',
      dateOfBirth: '1990-05-12',
      address: 'Jakarta Selatan',
      isActive: true,
      workHistory: [
        {
          company: 'PT Tech Solutions',
          position: 'Software Engineer',
          startDate: '2018-01-01',
          endDate: '2022-02-28',
          description: 'Developed web applications',
        },
      ],
      education: [
        {
          institution: 'Universitas Indonesia',
          degree: 'S1',
          fieldOfStudy: 'Computer Science',
          startYear: '2008',
          endYear: '2012',
        },
      ],
      certifications: [
        { name: 'AWS Solutions Architect', issuer: 'Amazon', date: '2021-06-01', expiryDate: '2024-06-01' },
      ],
      documents: [],
      directSupervisorId: '99',
      baseSalary: 15000000,
    },
    {
      id: '99',
      name: 'Super Admin',
      email: 'admin@telkomsel.com',
      employeeId: 'EMP099',
      department: 'IT',
      position: 'System Administrator',
      joinDate: '2020-01-01',
      dateOfBirth: '1988-02-04',
      isActive: true,
      workHistory: [],
      education: [],
      certifications: [],
      documents: [],
    },
    {
      id: '2',
      name: 'Budi Santoso',
      email: 'budi.santoso@telkomsel.com',
      employeeId: 'EMP002',
      department: 'Human Resources',
      position: 'HR Manager',
      joinDate: '2021-06-01',
      phone: '+62 821-9876-5432',
      dateOfBirth: '1990-02-04',
      isActive: true,
      workHistory: [],
      education: [],
      certifications: [],
      documents: [],
      directSupervisorId: '99',
    },
    {
      id: '3',
      name: 'Citra Dewi',
      email: 'citra.dewi@telkomsel.com',
      employeeId: 'EMP003',
      department: 'Finance',
      position: 'Finance Analyst',
      joinDate: '2023-01-10',
      dateOfBirth: '1992-03-15',
      isActive: true,
      workHistory: [],
      education: [],
      certifications: [],
      documents: [],
    },
    {
      id: '4',
      name: 'Dian Kusuma',
      email: 'dian.kusuma@telkomsel.com',
      employeeId: 'EMP004',
      department: 'Engineering',
      position: 'DevOps Engineer',
      joinDate: '2022-09-20',
      phone: '+62 856-1234-5678',
      dateOfBirth: '1991-07-20',
      isActive: true,
      workHistory: [],
      education: [],
      certifications: [],
      documents: [],
    },
    {
      id: '5',
      name: 'Eka Putri',
      email: 'eka.putri@telkomsel.com',
      employeeId: 'EMP005',
      department: 'Marketing',
      position: 'Marketing Specialist',
      joinDate: '2020-11-05',
      isActive: false,
      workHistory: [],
      education: [],
      certifications: [],
      documents: [],
    },
  ])

  const searchQuery = ref('')
  const departmentFilter = ref<string>('all')
  const statusFilter = ref<string>('all')

  const filteredEmployees = computed(() => {
    let result = employees.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.email.toLowerCase().includes(query) ||
          e.employeeId.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query) ||
          e.position.toLowerCase().includes(query)
      )
    }

    if (departmentFilter.value !== 'all') {
      result = result.filter((e) => e.department === departmentFilter.value)
    }

    if (statusFilter.value !== 'all') {
      const isActive = statusFilter.value === 'active'
      result = result.filter((e) => e.isActive === isActive)
    }

    return result
  })

  const departments = computed(() => {
    const depts = new Set(employees.value.map((e) => e.department))
    return Array.from(depts).sort()
  })

  const employeeStats = computed(() => ({
    total: employees.value.length,
    active: employees.value.filter((e) => e.isActive).length,
    inactive: employees.value.filter((e) => !e.isActive).length,
    byDepartment: departments.value.reduce(
      (acc, dept) => {
        acc[dept] = employees.value.filter((e) => e.department === dept).length
        return acc
      },
      {} as Record<string, number>
    ),
  }))

  function addEmployee(payload: CreateEmployeePayload): string {
    const newId = String(Date.now())
    const newEmployee: Employee = {
      id: newId,
      name: payload.name,
      email: payload.email,
      employeeId: payload.employeeId,
      department: payload.department,
      position: payload.position,
      joinDate: payload.joinDate,
      phone: payload.phone,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      religion: payload.religion,
      marriageStatus: payload.marriageStatus,
      address: payload.address,
      provinsi: payload.provinsi,
      kota: payload.kota,
      kecamatan: payload.kecamatan,
      kelurahan: payload.kelurahan,
      postalCode: payload.postalCode,
      isActive: true,
      departmentId: payload.departmentId,
      divisionId: payload.divisionId,
      positionLevelId: payload.positionLevelId,
      locationId: payload.locationId,
      organizationId: payload.organizationId,
      workHistory: payload.workHistory?.length ? payload.workHistory : [],
      education: payload.education?.length ? payload.education : [],
      certifications: payload.certifications?.length ? payload.certifications : [],
      documents: [],
      directSupervisorId: payload.directSupervisorId,
      employeeStatus: payload.employeeStatus,
    }
    employees.value.push(newEmployee)
    return newId
  }

  function updateEmployee(id: string, updates: UpdateEmployeePayload): boolean {
    const index = employees.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      const current = employees.value[index]
      employees.value[index] = {
        ...current,
        ...updates,
        workHistory: updates.workHistory ?? current.workHistory,
        education: updates.education ?? current.education,
        certifications: updates.certifications ?? current.certifications,
        documents: updates.documents ?? current.documents,
      }
      return true
    }
    return false
  }

  function addEmployeeDocument(employeeId: string, payload: Omit<EmployeeDocument, 'id' | 'uploadedAt'>): string {
    const emp = employees.value.find((e) => e.id === employeeId)
    if (!emp) return ''
    const docId = String(Date.now())
    const doc: EmployeeDocument = {
      id: docId,
      ...payload,
      uploadedAt: new Date().toISOString().split('T')[0],
    }
    if (!emp.documents) emp.documents = []
    emp.documents.push(doc)
    return docId
  }

  function updateEmployeeDocument(employeeId: string, documentId: string, updates: Partial<Omit<EmployeeDocument, 'id'>>): boolean {
    const emp = employees.value.find((e) => e.id === employeeId)
    if (!emp?.documents) return false
    const idx = emp.documents.findIndex((d) => d.id === documentId)
    if (idx === -1) return false
    emp.documents[idx] = { ...emp.documents[idx], ...updates }
    return true
  }

  function deleteEmployeeDocument(employeeId: string, documentId: string): boolean {
    const emp = employees.value.find((e) => e.id === employeeId)
    if (!emp?.documents) return false
    const idx = emp.documents.findIndex((d) => d.id === documentId)
    if (idx === -1) return false
    emp.documents.splice(idx, 1)
    return true
  }

  function deleteEmployee(id: string): boolean {
    const index = employees.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      employees.value.splice(index, 1)
      return true
    }
    return false
  }

  function toggleEmployeeStatus(id: string): boolean {
    const emp = employees.value.find((e) => e.id === id)
    if (emp) {
      emp.isActive = !emp.isActive
      return true
    }
    return false
  }

  function getEmployeeById(id: string): Employee | undefined {
    return employees.value.find((e) => e.id === id)
  }

  return {
    employees,
    searchQuery,
    departmentFilter,
    statusFilter,
    filteredEmployees,
    departments,
    employeeStats,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    toggleEmployeeStatus,
    getEmployeeById,
    addEmployeeDocument,
    updateEmployeeDocument,
    deleteEmployeeDocument,
  }
})
