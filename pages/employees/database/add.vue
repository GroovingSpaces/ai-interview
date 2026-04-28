<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, AlertCircle } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'
import { emptyEmployeeForm } from '~/composables/useEmployeeForm'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('employeeDatabase')
useHead({ title: () => `Tambah Karyawan | ${title.value}` })

const router = useRouter()
const employeesStore = useEmployeesStore()

const form = ref(emptyEmployeeForm())

// Required fields ada di step pertama (personal) dan kedua (employment).
const personalValid = computed(() => form.value.name.trim() !== '' && form.value.email.trim() !== '')
const employmentValid = computed(
  () =>
    form.value.employeeId.trim() !== '' &&
    form.value.department.trim() !== '' &&
    form.value.position.trim() !== '' &&
    form.value.joinDate.trim() !== '',
)

const isValid = computed(() => personalValid.value && employmentValid.value)

const missingFields = computed(() => {
  const out: string[] = []
  if (form.value.name.trim() === '') out.push('Nama')
  if (form.value.email.trim() === '') out.push('Email Kantor')
  if (form.value.employeeId.trim() === '') out.push('NIK Karyawan')
  if (form.value.department.trim() === '') out.push('Departemen')
  if (form.value.position.trim() === '') out.push('Posisi')
  if (form.value.joinDate.trim() === '') out.push('Tanggal Bergabung')
  return out
})

function goBack() {
  router.push('/employees/database')
}

function handleSubmit() {
  if (!isValid.value) return
  const f = form.value
  const newId = employeesStore.addEmployee({
    name: f.name,
    email: f.email,
    employeeId: f.employeeId,
    department: f.department,
    position: f.position,
    joinDate: f.joinDate,
    phone: f.phone || undefined,
    dateOfBirth: f.dateOfBirth || undefined,
    gender: f.gender || undefined,
    religion: f.religion || undefined,
    marriageStatus: f.marriageStatus || undefined,
    address: f.address || undefined,
    provinsi: f.provinsi || undefined,
    kota: f.kota || undefined,
    kecamatan: f.kecamatan || undefined,
    kelurahan: f.kelurahan || undefined,
    postalCode: f.postalCode || undefined,
    departmentId: f.departmentId || undefined,
    divisionId: f.divisionId || undefined,
    positionLevelId: f.positionLevelId || undefined,
    locationId: f.locationId || undefined,
    organizationId: f.organizationId || undefined,
    photoUrl: f.photoUrl || undefined,
    nationalId: f.nationalId || undefined,
    taxId: f.taxId || undefined,
    placeOfBirth: f.placeOfBirth || undefined,
    bloodType: f.bloodType || undefined,
    nationality: f.nationality || undefined,
    personalEmail: f.personalEmail || undefined,
    dependents: f.dependents,
    bankAccountName: f.bankAccountName || undefined,
    bankName: f.bankName || undefined,
    bankAccountNumber: f.bankAccountNumber || undefined,
    bpjsKetenagakerjaan: f.bpjsKetenagakerjaan || undefined,
    bpjsKesehatan: f.bpjsKesehatan || undefined,
    family: f.family,
    workHistory: f.workHistory,
    education: f.education,
    certifications: f.certifications,
    documents: f.documents,
    directSupervisorId: f.directSupervisorId || undefined,
    employeeStatus: f.employeeStatus || undefined,
    contractStartDate: f.contractStartDate || undefined,
    contractEndDate: f.contractEndDate || undefined,
    contractDurationType: (f.contractDurationType || undefined) as '3_MONTHS' | '6_MONTHS' | '1_YEAR' | 'PERMANENT' | undefined,
  })
  if (f.baseSalary !== undefined && f.baseSalary !== null) {
    employeesStore.updateEmployee(newId, { baseSalary: Number(f.baseSalary) })
  }
  router.push(`/employees/database/${newId}`)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <button type="button" class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground" @click="goBack">
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-foreground">Tambah Karyawan Baru</h1>
        <p class="text-sm text-muted-foreground">Ikuti wizard untuk melengkapi data karyawan secara bertahap.</p>
      </div>
    </div>

    <!-- Validation hint when missing required -->
    <div v-if="!isValid" class="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 flex items-start gap-2 text-sm">
      <AlertCircle class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
      <p class="text-muted-foreground">
        Field wajib di langkah <span class="font-semibold text-foreground">Data Pribadi</span> dan
        <span class="font-semibold text-foreground">Kepegawaian</span> belum lengkap:
        <span class="text-foreground">{{ missingFields.join(', ') }}</span>
      </p>
    </div>

    <EmployeesEmployeeForm
      v-model="form"
      mode="wizard"
      :can-submit="isValid"
      submit-label="Simpan Karyawan"
      @submit="handleSubmit"
      @cancel="goBack"
    />
  </div>
</template>
