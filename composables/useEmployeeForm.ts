import type { Employee } from '~/stores/employees'

export interface EmployeeFormState {
  name: string
  email: string
  employeeId: string
  department: string
  position: string
  joinDate: string
  phone: string
  dateOfBirth: string
  placeOfBirth: string
  gender: string
  bloodType: string
  religion: string
  marriageStatus: string
  nationality: string
  nationalId: string
  taxId: string
  personalEmail: string
  dependents: number | undefined
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  bpjsKesehatan: string
  bpjsKetenagakerjaan: string
  address: string
  provinsi: string
  kota: string
  kecamatan: string
  kelurahan: string
  postalCode: string
  photoUrl: string
  departmentId: string
  divisionId: string
  positionLevelId: string
  locationId: string
  organizationId: string
  directSupervisorId: string
  employeeStatus: string
  contractStartDate: string
  contractEndDate: string
  contractDurationType: '3_MONTHS' | '6_MONTHS' | '1_YEAR' | 'PERMANENT' | ''
  baseSalary: number | undefined
  family: Employee['family']
  workHistory: Employee['workHistory']
  education: Employee['education']
  certifications: Employee['certifications']
  documents: Employee['documents']
}

export function emptyEmployeeForm(): EmployeeFormState {
  return {
    name: '',
    email: '',
    employeeId: '',
    department: '',
    position: '',
    joinDate: '',
    phone: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: '',
    bloodType: '',
    religion: '',
    marriageStatus: '',
    nationality: 'Indonesia',
    nationalId: '',
    taxId: '',
    personalEmail: '',
    dependents: undefined,
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bpjsKesehatan: '',
    bpjsKetenagakerjaan: '',
    address: '',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    postalCode: '',
    photoUrl: '',
    departmentId: '',
    divisionId: '',
    positionLevelId: '',
    locationId: '',
    organizationId: '',
    directSupervisorId: '',
    employeeStatus: '',
    contractStartDate: '',
    contractEndDate: '',
    contractDurationType: '',
    baseSalary: undefined,
    family: [],
    workHistory: [],
    education: [],
    certifications: [],
    documents: [],
  }
}

export function employeeToForm(emp: Employee): EmployeeFormState {
  return {
    name: emp.name ?? '',
    email: emp.email ?? '',
    employeeId: emp.employeeId ?? '',
    department: emp.department ?? '',
    position: emp.position ?? '',
    joinDate: emp.joinDate ?? '',
    phone: emp.phone ?? '',
    dateOfBirth: emp.dateOfBirth ?? '',
    placeOfBirth: emp.placeOfBirth ?? '',
    gender: emp.gender ?? '',
    bloodType: emp.bloodType ?? '',
    religion: emp.religion ?? '',
    marriageStatus: emp.marriageStatus ?? '',
    nationality: emp.nationality ?? '',
    nationalId: emp.nationalId ?? '',
    taxId: emp.taxId ?? '',
    personalEmail: emp.personalEmail ?? '',
    dependents: emp.dependents,
    bankName: emp.bankName ?? '',
    bankAccountName: emp.bankAccountName ?? '',
    bankAccountNumber: emp.bankAccountNumber ?? '',
    bpjsKesehatan: emp.bpjsKesehatan ?? '',
    bpjsKetenagakerjaan: emp.bpjsKetenagakerjaan ?? '',
    address: emp.address ?? '',
    provinsi: emp.provinsi ?? '',
    kota: emp.kota ?? '',
    kecamatan: emp.kecamatan ?? '',
    kelurahan: emp.kelurahan ?? '',
    postalCode: emp.postalCode ?? '',
    photoUrl: emp.photoUrl ?? '',
    departmentId: emp.departmentId ?? '',
    divisionId: emp.divisionId ?? '',
    positionLevelId: emp.positionLevelId ?? '',
    locationId: emp.locationId ?? '',
    organizationId: emp.organizationId ?? '',
    directSupervisorId: emp.directSupervisorId ?? '',
    employeeStatus: emp.employeeStatus ?? '',
    contractStartDate: emp.contractStartDate ?? '',
    contractEndDate: emp.contractEndDate ?? '',
    contractDurationType: emp.contractDurationType ?? '',
    baseSalary: emp.baseSalary,
    family: emp.family ? JSON.parse(JSON.stringify(emp.family)) : [],
    workHistory: emp.workHistory ? JSON.parse(JSON.stringify(emp.workHistory)) : [],
    education: emp.education ? JSON.parse(JSON.stringify(emp.education)) : [],
    certifications: emp.certifications ? JSON.parse(JSON.stringify(emp.certifications)) : [],
    documents: emp.documents ? JSON.parse(JSON.stringify(emp.documents)) : [],
  }
}
