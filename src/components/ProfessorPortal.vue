<template>
  <div class="app-layout professor-layout">
    <div class="app-main">
      <header class="topbar">
        <div class="topbar-spacer"></div>
        <div class="topbar-info">
          <p class="label">Professor</p>
          <h2>{{ teacher.name }}</h2>
        </div>
        <button class="secondary-btn" @click="logout">Logout</button>
      </header>

      <main class="content">
        <ProfessorDashboardView
          v-if="currentTab === 'dashboard'"
          :dashboard-start="dashboardStart"
          :dashboard-end="dashboardEnd"
          :day-appointments="dayAppointments"
          :active-day-label="activeDayLabel"
          :month-appointments="monthAppointments"
          :active-month-label="activeMonthLabel"
          :grouped-by-date="groupedByDate"
          :set-dashboard-start="setDashboardStart"
          :set-dashboard-end="setDashboardEnd"
          :apply-dashboard-filter="applyDashboardFilter"
          :open-day-schedule="openDaySchedule"
        />

        <ProfessorDayScheduleView
          v-if="currentTab === 'daySchedule'"
          :active-day-label="activeDayLabel"
          :day-appointments="dayAppointments"
          :go-to-tab="goToTab"
        />

        <ProfessorAppointmentsView
          v-if="currentTab === 'appointments'"
          :appointments-loading="appointmentsLoading"
          :appointments-error="appointmentsError"
          :appointments-filter="appointmentsFilter"
          :filtered-appointments="filteredAppointments"
          :appointment-modal-open="appointmentModalOpen"
          :appointment-form="appointmentForm"
          :students="students"
          :services="services"
          :start-new-appointment="startNewAppointment"
          :edit-appointment="editAppointment"
          :cancel-appointment="cancelAppointment"
          :close-appointment-modal="closeAppointmentModal"
          :save-appointment="saveAppointment"
          :reset-appointment-form="resetAppointmentForm"
        />

        <ProfessorServicesView
          v-if="currentTab === 'services'"
          :services-loading="servicesLoading"
          :services-error="servicesError"
          :services="services"
          :service-modal-open="serviceModalOpen"
          :service-form="serviceForm"
          :categories-loading="categoriesLoading"
          :categories-error="categoriesError"
          :categories="categories"
          :start-new-service="startNewService"
          :edit-service="editService"
          :remove-service="removeService"
          :close-service-modal="closeServiceModal"
          :save-service="saveService"
          :reset-service-form="resetServiceForm"
          :on-service-image-change="onServiceImageChange"
          :service-image-url="serviceImageUrl"
        />

        <ProfessorStudentsView
          v-if="currentTab === 'students'"
          :students-loading="studentsLoading"
          :students-error="studentsError"
          :students-detailed="studentsDetailed"
          :student-modal-open="studentModalOpen"
          :student-form="studentForm"
          :start-new-student="startNewStudent"
          :edit-student="editStudent"
          :remove-student="removeStudent"
          :close-student-modal="closeStudentModal"
          :save-student="saveStudent"
          :reset-student-form="resetStudentForm"
        />

        <ProfessorAvailabilityView
          v-if="currentTab === 'availability'"
          :availability-query="availabilityQuery"
          :availability-day-label="availabilityDayLabel"
          :availability-mode="availabilityMode"
          :availability-loading="availabilityLoading"
          :availability-error="availabilityError"
          :availability-slots="availabilitySlots"
          :contracted-loading="contractedLoading"
          :contracted-error="contractedError"
          :contracted-slots="contractedSlots"
          :services="services"
          :fetch-availability="fetchAvailability"
          :set-availability-mode="setAvailabilityMode"
        />

        <ProfessorCapacitorLabView v-if="currentTab === 'capacitor'" />
      </main>
    </div>

    <nav class="bottom-nav professor-nav" aria-label="Menu principal">
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'dashboard' }"
        @click="goToTab('dashboard')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <rect x="13" y="3" width="8" height="5" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <rect x="13" y="10" width="8" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
        </svg>
        <span>Dashboard</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'appointments' }"
        @click="goToTab('appointments')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" stroke-width="2"></line>
          <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" stroke-width="2"></line>
          <line x1="3" y1="11" x2="21" y2="11" stroke="currentColor" stroke-width="2"></line>
        </svg>
        <span>Agendas</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'services' }"
        @click="goToTab('services')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v4H4z" fill="none" stroke="currentColor" stroke-width="2"></path>
          <path d="M4 14h10v4H4z" fill="none" stroke="currentColor" stroke-width="2"></path>
          <path d="M16 14h4v4h-4z" fill="none" stroke="currentColor" stroke-width="2"></path>
        </svg>
        <span>Servicos</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'students' }"
        @click="goToTab('students')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <circle cx="16" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <path d="M2 20c1.5-3 4-4 6-4" fill="none" stroke="currentColor" stroke-width="2"></path>
          <path d="M16 16c2 0 4.5 1 6 4" fill="none" stroke="currentColor" stroke-width="2"></path>
          <path d="M9 20c1-2.5 2.5-4 5-4" fill="none" stroke="currentColor" stroke-width="2"></path>
        </svg>
        <span>Alunos</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'availability' }"
        @click="goToTab('availability')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <path d="M12 7v5l3 3" fill="none" stroke="currentColor" stroke-width="2"></path>
        </svg>
        <span>Horarios</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'capacitor' }"
        @click="goToTab('capacitor')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16v10H4z" fill="none" stroke="currentColor" stroke-width="2"></path>
          <path d="M8 7V5h8v2" fill="none" stroke="currentColor" stroke-width="2"></path>
          <circle cx="12" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="2"></circle>
        </svg>
        <span>Nativo</span>
      </button>
    </nav>
  </div>
</template>

<script>
import ProfessorDashboardView from "./professor/ProfessorDashboardView.vue";
import ProfessorDayScheduleView from "./professor/ProfessorDayScheduleView.vue";
import ProfessorAppointmentsView from "./professor/ProfessorAppointmentsView.vue";
import ProfessorServicesView from "./professor/ProfessorServicesView.vue";
import ProfessorStudentsView from "./professor/ProfessorStudentsView.vue";
import ProfessorAvailabilityView from "./professor/ProfessorAvailabilityView.vue";
import ProfessorCapacitorLabView from "./professor/ProfessorCapacitorLabView.vue";

export default {
  name: "ProfessorPortal",
  components: {
    ProfessorDashboardView,
    ProfessorDayScheduleView,
    ProfessorAppointmentsView,
    ProfessorServicesView,
    ProfessorStudentsView,
    ProfessorAvailabilityView,
    ProfessorCapacitorLabView
  },
  props: {
    showSidebar: {
      type: Boolean,
      required: true
    },
    currentTab: {
      type: String,
      required: true
    },
    teacher: {
      type: Object,
      required: true
    },
    dashboardStart: {
      type: String,
      required: true
    },
    dashboardEnd: {
      type: String,
      required: true
    },
    dayAppointments: {
      type: Array,
      required: true
    },
    activeDayLabel: {
      type: String,
      required: true
    },
    monthAppointments: {
      type: Array,
      required: true
    },
    activeMonthLabel: {
      type: String,
      required: true
    },
    groupedByDate: {
      type: Array,
      required: true
    },
    appointmentsLoading: {
      type: Boolean,
      required: true
    },
    appointmentsError: {
      type: String,
      default: ""
    },
    appointmentsFilter: {
      type: Object,
      required: true
    },
    filteredAppointments: {
      type: Array,
      required: true
    },
    appointmentModalOpen: {
      type: Boolean,
      required: true
    },
    appointmentForm: {
      type: Object,
      required: true
    },
    students: {
      type: Array,
      required: true
    },
    services: {
      type: Array,
      required: true
    },
    serviceModalOpen: {
      type: Boolean,
      required: true
    },
    serviceForm: {
      type: Object,
      required: true
    },
    categoriesLoading: {
      type: Boolean,
      required: true
    },
    categoriesError: {
      type: String,
      default: ""
    },
    categories: {
      type: Array,
      required: true
    },
    studentsLoading: {
      type: Boolean,
      required: true
    },
    studentsError: {
      type: String,
      default: ""
    },
    studentsDetailed: {
      type: Array,
      required: true
    },
    studentModalOpen: {
      type: Boolean,
      required: true
    },
    studentForm: {
      type: Object,
      required: true
    },
    availabilityQuery: {
      type: Object,
      required: true
    },
    availabilityDayLabel: {
      type: String,
      required: true
    },
    availabilityMode: {
      type: String,
      required: true
    },
    availabilityLoading: {
      type: Boolean,
      required: true
    },
    availabilityError: {
      type: String,
      default: ""
    },
    availabilitySlots: {
      type: Array,
      required: true
    },
    contractedLoading: {
      type: Boolean,
      required: true
    },
    contractedError: {
      type: String,
      default: ""
    },
    contractedSlots: {
      type: Array,
      required: true
    },
    toggleSidebar: {
      type: Function,
      required: true
    },
    closeSidebar: {
      type: Function,
      required: true
    },
    goToTab: {
      type: Function,
      required: true
    },
    logout: {
      type: Function,
      required: true
    },
    applyDashboardFilter: {
      type: Function,
      required: true
    },
    openDaySchedule: {
      type: Function,
      required: true
    },
    startNewAppointment: {
      type: Function,
      required: true
    },
    editAppointment: {
      type: Function,
      required: true
    },
    cancelAppointment: {
      type: Function,
      required: true
    },
    closeAppointmentModal: {
      type: Function,
      required: true
    },
    saveAppointment: {
      type: Function,
      required: true
    },
    resetAppointmentForm: {
      type: Function,
      required: true
    },
    startNewService: {
      type: Function,
      required: true
    },
    editService: {
      type: Function,
      required: true
    },
    removeService: {
      type: Function,
      required: true
    },
    closeServiceModal: {
      type: Function,
      required: true
    },
    saveService: {
      type: Function,
      required: true
    },
    resetServiceForm: {
      type: Function,
      required: true
    },
    onServiceImageChange: {
      type: Function,
      required: true
    },
    serviceImageUrl: {
      type: Function,
      required: true
    },
    startNewStudent: {
      type: Function,
      required: true
    },
    editStudent: {
      type: Function,
      required: true
    },
    removeStudent: {
      type: Function,
      required: true
    },
    closeStudentModal: {
      type: Function,
      required: true
    },
    saveStudent: {
      type: Function,
      required: true
    },
    resetStudentForm: {
      type: Function,
      required: true
    },
    fetchAvailability: {
      type: Function,
      required: true
    },
    setDashboardStart: {
      type: Function,
      required: true
    },
    setDashboardEnd: {
      type: Function,
      required: true
    },
    setAvailabilityMode: {
      type: Function,
      required: true
    }
  }
};
</script>
