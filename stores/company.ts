import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Department
export interface Department {
  id: string
  name: string
  code: string
  description?: string
}

// Division (Divisi)
export interface Division {
  id: string
  name: string
  code: string
  description?: string
}

/** Role / jenjang jabatan umum: Staff → Supervisor → Manager → Director → Level C */
export type PositionRoleKey = 'staff' | 'supervisor' | 'manager' | 'director' | 'c_level'

// Position Level (Jenjang Jabatan)
export interface PositionLevel {
  id: string
  name: string
  level: number
  /** Role untuk akses / hierarki: staff, supervisor, manager, director, c_level */
  roleKey?: PositionRoleKey
  description?: string
}

// Location
export interface Location {
  id: string
  name: string
  address?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
}

// Organization (anak perusahaan / subsidiary)
export interface Organization {
  id: string
  name: string
  code: string
  parentId?: string
  description?: string
}

export const useCompanyStore = defineStore('company', () => {
  // Departments
  const departments = ref<Department[]>([
    { id: '1', name: 'Engineering', code: 'ENG', description: 'Technology & Development' },
    { id: '2', name: 'Human Resources', code: 'HR', description: 'People & Culture' },
    { id: '3', name: 'Finance', code: 'FIN', description: 'Finance & Accounting' },
    { id: '4', name: 'Marketing', code: 'MKT', description: 'Marketing & Branding' },
  ])

  const addDepartment = (item: Omit<Department, 'id'>): string => {
    const id = String(Date.now())
    departments.value.push({ ...item, id })
    return id
  }
  const updateDepartment = (id: string, updates: Partial<Omit<Department, 'id'>>): boolean => {
    const i = departments.value.findIndex((d) => d.id === id)
    if (i === -1) return false
    departments.value[i] = { ...departments.value[i], ...updates }
    return true
  }
  const deleteDepartment = (id: string): boolean => {
    const i = departments.value.findIndex((d) => d.id === id)
    if (i === -1) return false
    departments.value.splice(i, 1)
    return true
  }
  const getDepartmentById = (id: string) => departments.value.find((d) => d.id === id)

  // Divisions
  const divisions = ref<Division[]>([
    { id: '1', name: 'Software Development', code: 'SD', description: 'Product development' },
    { id: '2', name: 'Infrastructure', code: 'INF', description: 'IT Infrastructure' },
    { id: '3', name: 'Talent Acquisition', code: 'TA', description: 'Recruitment' },
  ])

  const addDivision = (item: Omit<Division, 'id'>): string => {
    const id = String(Date.now())
    divisions.value.push({ ...item, id })
    return id
  }
  const updateDivision = (id: string, updates: Partial<Omit<Division, 'id'>>): boolean => {
    const i = divisions.value.findIndex((d) => d.id === id)
    if (i === -1) return false
    divisions.value[i] = { ...divisions.value[i], ...updates }
    return true
  }
  const deleteDivision = (id: string): boolean => {
    const i = divisions.value.findIndex((d) => d.id === id)
    if (i === -1) return false
    divisions.value.splice(i, 1)
    return true
  }
  const getDivisionById = (id: string) => divisions.value.find((d) => d.id === id)

  // Position Levels (Role: Staff → Supervisor → Manager → Director → Level C)
  const positionLevels = ref<PositionLevel[]>([
    { id: '1', name: 'Staff', level: 1, roleKey: 'staff', description: 'Staf / karyawan operasional' },
    { id: '2', name: 'Supervisor', level: 2, roleKey: 'supervisor', description: 'Supervisor / pengawas tim' },
    { id: '3', name: 'Manager', level: 3, roleKey: 'manager', description: 'Manager / manajer unit/department' },
    { id: '4', name: 'Director', level: 4, roleKey: 'director', description: 'Director / direktur' },
    { id: '5', name: 'Level C', level: 5, roleKey: 'c_level', description: 'C-Level / eksekutif (CEO, CTO, CFO, dll)' },
  ])

  const addPositionLevel = (item: Omit<PositionLevel, 'id'>): string => {
    const id = String(Date.now())
    positionLevels.value.push({ ...item, id })
    return id
  }
  const updatePositionLevel = (id: string, updates: Partial<Omit<PositionLevel, 'id'>>): boolean => {
    const i = positionLevels.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    positionLevels.value[i] = { ...positionLevels.value[i], ...updates }
    return true
  }
  const deletePositionLevel = (id: string): boolean => {
    const i = positionLevels.value.findIndex((p) => p.id === id)
    if (i === -1) return false
    positionLevels.value.splice(i, 1)
    return true
  }
  const getPositionLevelById = (id: string) => positionLevels.value.find((p) => p.id === id)

  // Locations
  const locations = ref<Location[]>([
    { id: '1', name: 'Jakarta HQ', address: 'Jl. Sudirman', city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
    { id: '2', name: 'Bandung Office', address: 'Jl. Dago', city: 'Bandung', country: 'Indonesia', latitude: -6.9175, longitude: 107.6191 },
    { id: '3', name: 'Surabaya Office', city: 'Surabaya', country: 'Indonesia', latitude: -7.2575, longitude: 112.7521 },
  ])

  const addLocation = (item: Omit<Location, 'id'>): string => {
    const id = String(Date.now())
    locations.value.push({ ...item, id })
    return id
  }
  const updateLocation = (id: string, updates: Partial<Omit<Location, 'id'>>): boolean => {
    const i = locations.value.findIndex((l) => l.id === id)
    if (i === -1) return false
    locations.value[i] = { ...locations.value[i], ...updates }
    return true
  }
  const deleteLocation = (id: string): boolean => {
    const i = locations.value.findIndex((l) => l.id === id)
    if (i === -1) return false
    locations.value.splice(i, 1)
    return true
  }
  const getLocationById = (id: string) => locations.value.find((l) => l.id === id)

  // Organizations (subsidiaries)
  const organizations = ref<Organization[]>([
    { id: '1', name: 'Telkomsel', code: 'TEL', description: 'Parent company' },
    { id: '2', name: 'Telkomsel Digital', code: 'TSD', parentId: '1', description: 'Digital subsidiary' },
    { id: '3', name: 'Telkomsel Mitra', code: 'TSM', parentId: '1', description: 'Partnership subsidiary' },
  ])

  const addOrganization = (item: Omit<Organization, 'id'>): string => {
    const id = String(Date.now())
    organizations.value.push({ ...item, id })
    return id
  }
  const updateOrganization = (id: string, updates: Partial<Omit<Organization, 'id'>>): boolean => {
    const i = organizations.value.findIndex((o) => o.id === id)
    if (i === -1) return false
    organizations.value[i] = { ...organizations.value[i], ...updates }
    return true
  }
  const deleteOrganization = (id: string): boolean => {
    const i = organizations.value.findIndex((o) => o.id === id)
    if (i === -1) return false
    organizations.value.splice(i, 1)
    return true
  }
  const getOrganizationById = (id: string) => organizations.value.find((o) => o.id === id)

  const parentOrganizationOptions = computed(() =>
    organizations.value.map((o) => ({ value: o.id, label: o.name }))
  )

  return {
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    divisions,
    addDivision,
    updateDivision,
    deleteDivision,
    getDivisionById,
    positionLevels,
    addPositionLevel,
    updatePositionLevel,
    deletePositionLevel,
    getPositionLevelById,
    locations,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocationById,
    organizations,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById,
    parentOrganizationOptions,
  }
})
