<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowLeft, Check, AlertCircle } from 'lucide-vue-next'
import { useEmployeesStore } from '~/stores/employees'
import { emptyEmployeeForm, employeeToForm } from '~/composables/useEmployeeForm'

definePageMeta({ middleware: 'admin' })
const { title } = usePageTitle('employeeDatabase')
useHead({ title: () => `Edit Karyawan | ${title.value}` })

const route = useRoute()
const router = useRouter()
const employeesStore = useEmployeesStore()

const employeeId = computed(() => String(route.params.id))
const employee = computed(() => employeesStore.getEmployeeById(employeeId.value))

const form = ref(emptyEmployeeForm())
const notFound = ref(false)

onMounted(() => {
  if (!employee.value) {
    notFound.value = true
    return
  }
  form.value = employeeToForm(employee.value)
})

const isValid = computed(
  () =>
    form.value.name.trim() !== '' &&
    form.value.email.trim() !== '' &&
    form.value.employeeId.trim() !== '' &&
    form.value.department.trim() !== '' &&
    form.value.position.trim() !== '' &&
    form.value.joinDate.trim() !== ''
)

function goBack() {
  router.push(`/employees/database/${employeeId.value}`)
}

function handleSubmit() {
  if (!isValid.value || !employee.value) return
  const f = form.value
  employeesStore.updateEmployee(employeeId.value, {
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
    baseSalary: f.baseSalary !== undefined && f.baseSalary !== null ? Number(f.baseSalary) : undefined,
  })
  router.push(`/employees/database/${employeeId.value}`)
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="notFound" class="glass-card p-8 text-center">
      <AlertCircle class="w-10 h-10 mx-auto text-muted-foreground mb-2" />
      <h2 class="text-lg font-semibold text-foreground">Karyawan tidak ditemukan</h2>
      <p class="text-sm text-muted-foreground mt-1">Data dengan ID tersebut tidak tersedia.</p>
      <UiButton variant="outline" class="mt-4" @click="router.push('/employees/database')">
        <ArrowLeft class="w-4 h-4" />
        Kembali ke Daftar
      </UiButton>
    </div>

    <template v-else>
      <div class="flex items-center gap-4">
        <button type="button" class="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground" @click="goBack">
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold text-foreground">Edit Karyawan</h1>
          <p class="text-sm text-muted-foreground">{{ form.name || employee?.name }} — {{ form.employeeId || employee?.employeeId }}</p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit">
        <EmployeesEmployeeForm v-model="form" />

        <div class="sticky bottom-0 mt-6 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-sm border-t border-border flex flex-wrap items-center justify-between gap-3">
          <p v-if="!isValid" class="text-xs text-muted-foreground">
            Field bertanda * wajib diisi.
          </p>
          <div class="flex flex-wrap gap-3 ml-auto">
            <UiButton type="button" variant="outline" @click="goBack">
              <ArrowLeft class="w-4 h-4" />
              Batal
            </UiButton>
            <UiButton type="submit" variant="gradient" :disabled="!isValid">
              <Check class="w-4 h-4" />
              Simpan Perubahan
            </UiButton>
          </div>
        </div>
      </form>
    </template>
  </div>
</template>
