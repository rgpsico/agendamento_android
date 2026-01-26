<template>
  <div class="app-layout professor-layout" :class="{ 'theme-dark': isDark }">
    <div class="app-main">
      <header class="topbar">
        <div class="topbar-content">
          <div class="topbar-brand">
            <div class="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            </div>
            <div class="brand-info">
              <p class="brand-label">Professor</p>
              <h2 class="brand-name">{{ teacher.name }}</h2>
            </div>
          </div>
          
          <div class="topbar-actions">
            <button class="action-btn theme-btn" @click="toggleTheme" :title="isDark ? 'Modo claro' : 'Modo escuro'">
              <svg v-if="!isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
            <button class="action-btn logout-btn" @click="logout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span class="logout-text">Sair</span>
            </button>
          </div>
        </div>
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
          :open-chat-from-appointment="openChatFromAppointment"
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

        <ProfessorMessagesView
          v-if="currentTab === 'messages'"
          :pending-chat-student="pendingChatStudent"
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
        :aria-label="'Ir para Dashboard' + (currentTab === 'dashboard' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
            <rect x="13" y="3" width="8" height="5" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
            <rect x="13" y="10" width="8" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
            <rect x="3" y="13" width="8" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          </svg>
        </div>
        <span class="nav-label">Dashboard</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'appointments' }"
        @click="goToTab('appointments')"
        :aria-label="'Ir para Agendas' + (currentTab === 'appointments' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
            <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" stroke-width="2"></line>
            <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" stroke-width="2"></line>
            <line x1="3" y1="11" x2="21" y2="11" stroke="currentColor" stroke-width="2"></line>
          </svg>
        </div>
        <span class="nav-label">Agendas</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'messages' }"
        @click="goToTab('messages')"
        :aria-label="'Ir para Mensagens' + (unreadMessagesCount ? ` (${unreadMessagesCount} não lidas)` : '') + (currentTab === 'messages' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16v9a2 2 0 0 1-2 2H9l-4 3v-3H6a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"></path>
            <circle cx="9" cy="10" r="1.3" fill="currentColor"></circle>
            <circle cx="12" cy="10" r="1.3" fill="currentColor"></circle>
            <circle cx="15" cy="10" r="1.3" fill="currentColor"></circle>
          </svg>
          <span v-if="unreadMessagesCount" class="nav-badge">{{ unreadMessagesCount > 99 ? '99+' : unreadMessagesCount }}</span>
        </div>
        <span class="nav-label">Mensagens</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'services' }"
        @click="goToTab('services')"
        :aria-label="'Ir para Serviços' + (currentTab === 'services' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16v4H4z" fill="none" stroke="currentColor" stroke-width="2"></path>
            <path d="M4 14h10v4H4z" fill="none" stroke="currentColor" stroke-width="2"></path>
            <path d="M16 14h4v4h-4z" fill="none" stroke="currentColor" stroke-width="2"></path>
          </svg>
        </div>
        <span class="nav-label">Serviços</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'students' }"
        @click="goToTab('students')"
        :aria-label="'Ir para Alunos' + (currentTab === 'students' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle>
            <circle cx="16" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"></circle>
            <path d="M2 20c1.5-3 4-4 6-4" fill="none" stroke="currentColor" stroke-width="2"></path>
            <path d="M16 16c2 0 4.5 1 6 4" fill="none" stroke="currentColor" stroke-width="2"></path>
            <path d="M9 20c1-2.5 2.5-4 5-4" fill="none" stroke="currentColor" stroke-width="2"></path>
          </svg>
        </div>
        <span class="nav-label">Alunos</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: currentTab === 'availability' }"
        @click="goToTab('availability')"
        :aria-label="'Ir para Horários' + (currentTab === 'availability' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"></circle>
            <path d="M12 7v5l3 3" fill="none" stroke="currentColor" stroke-width="2"></path>
          </svg>
        </div>
        <span class="nav-label">Horários</span>
      </button>
    </nav>
  </div>
</template>

<script>
import ProfessorDashboardView from "./professor/ProfessorDashboardView.vue";
import ProfessorDayScheduleView from "./professor/ProfessorDayScheduleView.vue";
import ProfessorAppointmentsView from "./professor/ProfessorAppointmentsView.vue";
import ProfessorMessagesView from "./professor/ProfessorMessagesView.vue";
import ProfessorServicesView from "./professor/ProfessorServicesView.vue";
import ProfessorStudentsView from "./professor/ProfessorStudentsView.vue";
import ProfessorAvailabilityView from "./professor/ProfessorAvailabilityView.vue";
import ProfessorCapacitorLabView from "./professor/ProfessorCapacitorLabView.vue";

const THEME_KEY = "agenda_theme";
const THEMES = { LIGHT: "light", DARK: "dark" };

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return stored == THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
}

export default {
  name: "ProfessorPortal",
  components: {
    ProfessorDashboardView,
    ProfessorDayScheduleView,
    ProfessorAppointmentsView,
    ProfessorMessagesView,
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
    servicesLoading: {
      type: Boolean,
      required: true
    },
    servicesError: {
      type: String,
      default: ""
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
    unreadMessagesCount: {
      type: Number,
      default: 0
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
    },
    openChatFromAppointment: {
      type: Function,
      required: true
    },
    pendingChatStudent: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      theme: loadTheme()
    };
  },
  computed: {
    isDark() {
      return this.theme === THEMES.DARK;
    }
  },
  methods: {
    toggleTheme() {
      this.theme = this.isDark ? THEMES.LIGHT : THEMES.DARK;
      localStorage.setItem(THEME_KEY, this.theme);
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* Layout Principal */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  transition: background-color 0.3s ease;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar Modernizada */
.topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.topbar-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: transform 0.3s ease;
}

.brand-icon:hover {
  transform: scale(1.05) rotate(-5deg);
}

.brand-info {
  min-width: 0;
  flex: 1;
}

.brand-label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.brand-name {
  margin: 2px 0 0 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.5px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
}

.theme-btn {
  padding: 10px;
}

.theme-btn svg {
  transition: transform 0.5s ease;
}

.theme-btn:hover svg {
  transform: rotate(20deg);
}

.logout-btn {
  color: #ef4444;
  border-color: #fee2e2;
  background: #fef2f2;
}

.logout-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

.logout-text {
  display: none;
}

/* Content Area */
.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Bottom Navigation */
.bottom-nav {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.bottom-nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  max-width: 100px;
}

.nav-icon {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-icon svg {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  transition: all 0.3s ease;
}

.nav-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  border: 2px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.bottom-nav-btn:hover {
  color: #3b82f6;
}

.bottom-nav-btn:hover .nav-icon {
  transform: translateY(-2px);
}

.bottom-nav-btn.active {
  color: #3b82f6;
}

.bottom-nav-btn.active .nav-icon {
  transform: scale(1.1);
}

.bottom-nav-btn.active .nav-icon::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

.bottom-nav-btn.active .nav-label {
  font-weight: 800;
}

/* Theme Dark */
.theme-dark {
  background: #0f172a;
}

.theme-dark .topbar {
  background: #1e293b;
  border-bottom-color: #334155;
}

.theme-dark .brand-label {
  color: #94a3b8;
}

.theme-dark .brand-name {
  color: #f8fafc;
}

.theme-dark .action-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.theme-dark .action-btn:hover {
  background: #1e293b;
  border-color: #475569;
}

.theme-dark .logout-btn {
  color: #fca5a5;
  border-color: #7f1d1d;
  background: #450a0a;
}

.theme-dark .logout-btn:hover {
  background: #7f1d1d;
  border-color: #991b1b;
}

.theme-dark .bottom-nav {
  background: #1e293b;
  border-top-color: #334155;
}

.theme-dark .bottom-nav-btn {
  color: #94a3b8;
}

.theme-dark .bottom-nav-btn:hover {
  color: #60a5fa;
}

.theme-dark .bottom-nav-btn.active {
  color: #60a5fa;
}

.theme-dark .bottom-nav-btn.active .nav-icon::before {
  background: #60a5fa;
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);
}

.theme-dark .content {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
}

/* Responsivo - Tablet */
@media (min-width: 640px) {
  .topbar {
    padding: 16px 24px;
  }

  .brand-icon {
    width: 52px;
    height: 52px;
  }

  .brand-label {
    font-size: 12px;
  }

  .brand-name {
    font-size: 20px;
  }

  .logout-text {
    display: inline;
  }

  .action-btn {
    padding: 10px 16px;
  }

  .bottom-nav {
    padding: 12px 0 max(12px, env(safe-area-inset-bottom));
  }

  .bottom-nav-btn {
    gap: 6px;
    padding: 10px 8px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }

  .nav-icon svg {
    width: 26px;
    height: 26px;
  }

  .nav-label {
    font-size: 12px;
  }
}

/* Responsivo - Desktop */
@media (min-width: 1024px) {
  .topbar {
    padding: 20px 32px;
  }

  .brand-icon {
    width: 56px;
    height: 56px;
  }

  .brand-name {
    font-size: 22px;
  }

  .action-btn {
    padding: 12px 20px;
    font-size: 15px;
  }

  .bottom-nav {
    padding: 14px 0 max(14px, env(safe-area-inset-bottom));
    gap: 8px;
  }

  .bottom-nav-btn {
    max-width: 120px;
    padding: 12px 8px;
    gap: 8px;
    border-radius: 12px;
  }

  .bottom-nav-btn:hover {
    background: #f8fafc;
  }

  .theme-dark .bottom-nav-btn:hover {
    background: #0f172a;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
  }

  .nav-icon svg {
    width: 28px;
    height: 28px;
  }

  .nav-label {
    font-size: 13px;
  }
}

/* Melhorias de Acessibilidade */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible para navegação por teclado */
.action-btn:focus-visible,
.bottom-nav-btn:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 12px;
}

.theme-dark .action-btn:focus-visible,
.theme-dark .bottom-nav-btn:focus-visible {
  outline-color: #60a5fa;
}

/* Animações de entrada */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.topbar {
  animation: slideDown 0.4s ease;
}

.bottom-nav {
  animation: slideUp 0.4s ease;
}

/* Estados de toque para mobile */
@media (hover: none) {
  .action-btn:active {
    transform: scale(0.95);
  }

  .bottom-nav-btn:active {
    transform: scale(0.95);
  }
}

/* Scrollbar personalizada */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.theme-dark .content::-webkit-scrollbar-track {
  background: #0f172a;
}

.content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.theme-dark .content::-webkit-scrollbar-thumb {
  background: #334155;
}

.content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.theme-dark .content::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Safe area para dispositivos com notch */
@supports (padding-top: env(safe-area-inset-top)) {
  .topbar {
    padding-top: max(12px, env(safe-area-inset-top));
  }
}

/* Otimização para telas pequenas */
@media (max-width: 380px) {
  .brand-name {
    font-size: 16px;
  }

  .brand-icon {
    width: 44px;
    height: 44px;
  }

  .nav-label {
    font-size: 10px;
  }

  .nav-icon {
    width: 26px;
    height: 26px;
  }

  .nav-icon svg {
    width: 22px;
    height: 22px;
  }

  .action-btn {
    padding: 8px 10px;
    font-size: 13px;
  }

  .logout-text {
    display: none;
  }
}

/* Hover effects aprimorados para desktop */
@media (hover: hover) {
  .brand-icon {
    cursor: pointer;
  }

  .bottom-nav-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(59, 130, 246, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 12px;
  }

  .bottom-nav-btn:hover::before {
    opacity: 1;
  }

  .theme-dark .bottom-nav-btn::before {
    background: linear-gradient(135deg, transparent 0%, rgba(96, 165, 250, 0.1) 100%);
  }
}

/* Loading state (opcional) */
.topbar.loading {
  pointer-events: none;
  opacity: 0.6;
}

/* Indicador de notificação adicional */
.bottom-nav-btn.has-notification .nav-icon::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

.theme-dark .bottom-nav-btn.has-notification .nav-icon::after {
  border-color: #1e293b;
}
</style>