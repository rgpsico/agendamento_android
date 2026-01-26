<template>
  <div class="app-shell">
    <LoginScreen
      v-if="!isAuthenticated && !clientAuthenticated"
      :active-portal="activePortal"
      :login-form="loginForm"
      :client-login-form="clientLoginForm"
      :auth-loading="authLoading"
      :client-loading="clientLoading"
      :login-error="loginError"
      :client-login-error="clientLoginError"
      :show-forgot="showForgot"
      @set-portal="activePortal = $event"
      @toggle-forgot="showForgot = !showForgot"
      @login="handleLogin"
      @client-login="handleClientLogin"
    />

    <ProfessorPortal
      v-else-if="isAuthenticated && activePortal === 'professor'"
      :show-sidebar="showSidebar"
      :current-tab="currentTab"
      :teacher="teacher"
      :dashboard-start="dashboardStart"
      :dashboard-end="dashboardEnd"
      :day-appointments="dayAppointments"
      :active-day-label="activeDayLabel"
      :month-appointments="monthAppointments"
      :active-month-label="activeMonthLabel"
      :grouped-by-date="groupedByDate"
      :appointments-loading="appointmentsLoading"
      :appointments-error="appointmentsError"
      :appointments-filter="appointmentsFilter"
      :filtered-appointments="filteredAppointments"
      :appointment-modal-open="appointmentModalOpen"
      :appointment-form="appointmentForm"
      :students="students"
      :services="services"
      :services-loading="servicesLoading"
      :services-error="servicesError"
      :service-modal-open="serviceModalOpen"
      :service-form="serviceForm"
      :categories-loading="categoriesLoading"
      :categories-error="categoriesError"
      :categories="categories"
      :students-loading="studentsLoading"
      :students-error="studentsError"
      :students-detailed="studentsDetailed"
      :student-modal-open="studentModalOpen"
      :student-form="studentForm"
      :availability-query="availabilityQuery"
      :availability-day-label="availabilityDayLabel"
      :availability-mode="availabilityMode"
      :availability-loading="availabilityLoading"
      :availability-error="availabilityError"
      :availability-slots="availabilitySlots"
      :contracted-loading="contractedLoading"
      :contracted-error="contractedError"
      :contracted-slots="contractedSlots"
      :toggle-sidebar="toggleSidebar"
      :close-sidebar="closeSidebar"
      :go-to-tab="goToTab"
      :logout="logout"
      :apply-dashboard-filter="applyDashboardFilter"
      :open-day-schedule="openDaySchedule"
      :start-new-appointment="startNewAppointment"
      :edit-appointment="editAppointment"
      :cancel-appointment="cancelAppointment"
      :close-appointment-modal="closeAppointmentModal"
      :save-appointment="saveAppointment"
      :reset-appointment-form="resetAppointmentForm"
      :start-new-service="startNewService"
      :edit-service="editService"
      :remove-service="removeService"
      :close-service-modal="closeServiceModal"
      :save-service="saveService"
      :reset-service-form="resetServiceForm"
      :on-service-image-change="onServiceImageChange"
      :service-image-url="serviceImageUrl"
      :start-new-student="startNewStudent"
      :edit-student="editStudent"
      :remove-student="removeStudent"
      :close-student-modal="closeStudentModal"
      :save-student="saveStudent"
      :reset-student-form="resetStudentForm"
      :fetch-availability="fetchAvailability"
      :set-dashboard-start="setDashboardStart"
      :set-dashboard-end="setDashboardEnd"
      :set-availability-mode="setAvailabilityMode"
      :open-chat-from-appointment="openChatFromAppointment"
      :pending-chat-student="pendingProfessorChat"
    />

    <ClientPortal
      v-else-if="clientAuthenticated && activePortal === 'cliente'"
      :show-client-sidebar="showClientSidebar"
      :client-tab="clientTab"
      :client-profile="clientProfile"
      :client-companies="clientCompanies"
      :client-companies-loading="clientCompaniesLoading"
      :client-companies-error="clientCompaniesError"
      :client-services="clientServices"
      :client-services-loading="clientServicesLoading"
      :client-services-error="clientServicesError"
      :selected-company="selectedCompany"
      :client-services-for-company="clientServicesForCompany"
      :selected-service="selectedService"
      :selected-company-label="selectedCompanyLabel"
      :selected-service-label="selectedServiceLabel"
      :client-schedule-date="clientScheduleDate"
      :client-availability-loading="clientAvailabilityLoading"
      :client-availability-error="clientAvailabilityError"
      :client-available-slots="clientAvailableSlots"
      :client-bookings-detailed="clientBookingsDetailed"
      :client-profile-saved="clientProfileSaved"
      :show-slots-modal="clientSlotsModalOpen"
      :is-client-company-saved="isSelectedCompanySaved"
      :go-to-saved-company="goToSavedCompany"
      :toggle-client-sidebar="toggleClientSidebar"
      :close-client-sidebar="closeClientSidebar"
      :go-to-client-tab="goToClientTab"
      :client-logout="clientLogout"
      :select-company="selectCompany"
      :save-client-company="saveClientCompany"
      :select-service="selectService"
      :book-slot="bookSlot"
      :remove-client-booking="removeClientBooking"
      :fetch-waitlist-queue="fetchWaitlistQueue"
      :close-slots-modal="closeClientSlotsModal"
      :save-client-profile="saveClientProfile"
      :company-city-label="companyCityLabel"
      :company-descricao-label="companyDescricaoLabel"
      :company-image-url="companyImageUrl"
      :service-image-url="serviceImageUrl"
      :set-client-schedule-date="setClientScheduleDate"
      :open-checkout="openClientCheckout"
      :close-checkout="closeClientCheckout"
      :confirm-checkout="confirmClientCheckout"
      :checkout-open="clientCheckoutOpen"
      :checkout-loading="clientCheckoutLoading"
      :checkout-error="clientCheckoutError"
      :checkout-summary="clientCheckoutSummary"
      :checkout-methods="clientCheckoutMethods"
      :checkout-method="clientCheckoutMethod"
      :checkout-status="clientCheckoutStatus"
      :checkout-card="clientCheckoutCard"
      :checkout-pix-message="clientCheckoutPixMessage"
      :checkout-pix-data="clientCheckoutPixData"
      :checkout-pix-finalize-ready="clientCheckoutPixFinalizeReady"
      :checkout-pix-expiration="clientCheckoutPixExpiration"
      :set-checkout-method="setClientCheckoutMethod"
      :set-checkout-status="setClientCheckoutStatus"
      :set-checkout-card="setClientCheckoutCard"
      :finalize-checkout="finalizeClientCheckout"
    />
  </div>
</template>

<script>
import LoginScreen from "./components/LoginScreen.vue";
import ProfessorPortal from "./components/ProfessorPortal.vue";
import ClientPortal from "./components/ClientPortal.vue";

const PROD_API_BASE = "https://agendamento.rjpasseios.com.br";
const API_BASE = PROD_API_BASE;
const ASSET_BASE = PROD_API_BASE;

const STORAGE = {
  TOKEN: "agenda_token",
  EMPRESA: "agenda_empresa_id",
  PROFESSOR: "agenda_professor_id",
  TEACHER: "agenda_teacher",
  APPOINTMENTS: "agenda_appointments",
  SERVICES: "agenda_services",
  STUDENTS: "agenda_students",
  CLIENT_TOKEN: "agenda_client_token",
  CLIENT_PROFILE: "agenda_client_profile",
  CLIENT_BOOKINGS: "agenda_client_bookings",
  CLIENT_COMPANY: "agenda_client_company_id"
};


function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"];

function loadStorage(key, fallback) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDateLabel(date) {
  if (!date) return "-";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function getDayNumber(dateStr) {
  if (!dateStr) return 0;
  const dt = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? 0 : dt.getDay();
}

export default {
  components: {
    LoginScreen,
    ProfessorPortal,
    ClientPortal
  },
  data() {
    return {
      loginForm: {
        email: "",
        password: ""
      },
      loginError: "",
      showForgot: false,
      isAuthenticated: Boolean(localStorage.getItem(STORAGE.TOKEN)),
      clientAuthenticated: Boolean(localStorage.getItem(STORAGE.CLIENT_TOKEN)),
      activePortal: "professor",
      authLoading: false,
      clientLoading: false,
      currentTab: "dashboard",
      pendingProfessorChat: null,
      teacher: loadStorage(STORAGE.TEACHER, { name: "", email: "" }),
      services: loadStorage(STORAGE.SERVICES, []),
      students: loadStorage(STORAGE.STUDENTS, []),
      appointments: loadStorage(STORAGE.APPOINTMENTS, []),
      clientTab: "companies",
      clientLoginForm: {
        email: "",
        password: ""
      },
      clientLoginError: "",
      clientProfile: loadStorage(STORAGE.CLIENT_PROFILE, {
        id: "",
        nome: "",
        email: "",
        telefone: "",
        documento: "",
        foto: ""
      }),
      clientProfileSaved: false,
      clientCompanies: [],
      clientCompaniesLoading: false,
      clientCompaniesError: "",
      clientServices: [],
      clientServicesLoading: false,
      clientServicesError: "",
      clientAvailableSlots: [],
      clientAvailabilityLoading: false,
      clientAvailabilityError: "",
      clientBookings: loadStorage(STORAGE.CLIENT_BOOKINGS, []),
      selectedCompanyId: loadStorage(STORAGE.CLIENT_COMPANY, ""),
      savedClientCompanyId: loadStorage(STORAGE.CLIENT_COMPANY, ""),
      selectedServiceId: "",
      clientScheduleDate: todayISO(),
      clientSlotsModalOpen: false,
      clientCheckoutOpen: false,
      clientCheckoutLoading: false,
      clientCheckoutError: "",
      clientCheckoutMethods: [],
      clientCheckoutMethod: "",
      clientCheckoutStatus: "PENDING",
      clientCheckoutProfessorId: "",
      clientCheckoutAlunoId: "",
      clientCheckoutModalidadeId: "",
      clientCheckoutTokenGateway: "",
      clientCheckoutSummary: {
        date: "",
        time: "",
        title: "",
        price: ""
      },
      clientCheckoutCard: {
        name: "",
        number: "",
        expiry: "",
        cvv: "",
        cpf: ""
      },
      clientCheckoutPixData: null,
      clientCheckoutPixMessage: "",
      clientCheckoutPixFinalizeReady: false,
      clientCheckoutPixExpiration: "",
      clientCheckoutPixIntervalId: null,
      showClientSidebar: false,
      availabilitySlots: [],
      contractedSlots: [],
      availabilityQuery: {
        date: todayISO(),
        serviceId: ""
      },
      availabilityMode: "available",
      availabilityLoading: false,
      availabilityError: "",
      contractedLoading: false,
      contractedError: "",
      dashboardStart: "",
      dashboardEnd: "",
      activeDashboardStart: "",
      activeDashboardEnd: "",
      activeDay: "",
      appointmentsFilter: {
        start: "",
        end: "",
        status: ""
      },
      appointmentForm: {
        id: null,
        date: "",
        time: "",
        studentId: "",
        serviceId: "",
        status: "confirmado"
      },
      serviceForm: {
        id: null,
        empresa_id: loadStorage(STORAGE.EMPRESA, ""),
        imagem: "",
        imagemFile: null,
        titulo: "",
        descricao: "",
        preco: "",
        tempo_de_aula: "",
        tipo_agendamento: "HORARIO",
        vagas: "",
        categoria_id: ""
      },
      studentForm: {
        id: null,
        primeiro_nome: "",
        ultimo_nome: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        password: ""
      },
      showSidebar: false,
      serviceModalOpen: false,
      servicesLoading: false,
      servicesError: "",
      appointmentsLoading: false,
      appointmentsError: "",
      appointmentModalOpen: false,
      studentsLoading: false,
      studentsError: "",
      studentModalOpen: false,
      categories: [],
      categoriesLoading: false,
      categoriesError: ""
    };
  },
  computed: {
    appointmentsDetailed() {
      return this.appointments.map((appt) => this.normalizeAppointment(appt));
    },
    studentsDetailed() {
      return this.students.map((student) => this.normalizeStudent(student));
    },
    selectedCompany() {
      return (
        this.clientCompanies.find(
          (company) => String(company.id) === String(this.selectedCompanyId)
        ) || null
      );
    },
    selectedService() {
      return (
        this.clientServices.find(
          (service) => String(service.id) === String(this.selectedServiceId)
        ) || null
      );
    },
    selectedCompanyLabel() {
      return this.selectedCompany ? this.selectedCompany.nome : "-";
    },
    selectedServiceLabel() {
      return this.selectedService ? this.selectedService.titulo || this.selectedService.nome : "-";
    },
    clientServicesForCompany() {
      if (!this.selectedCompanyId) return [];
      return this.clientServices.filter((service) => {
        const empresaId = service.empresa_id || service.companyId;
        return String(empresaId) === String(this.selectedCompanyId);
      });
    },
    clientBookingsDetailed() {
        return this.clientBookings.map((booking) => {
          const company =
            this.clientCompanies.find((item) => item.id === booking.companyId) || {};
          const service =
            this.clientServices.find((item) => item.id === booking.serviceId) || {};
          const companyName = company.nome || booking.companyName || "Empresa";
          const serviceName =
            service.titulo || service.nome || booking.serviceName || "Servico";
          const serviceDuration =
            service.tempo_de_aula ||
            service.duracao ||
            booking.serviceDuration ||
            booking.duracao ||
            "";
          return {
            ...booking,
            companyName,
            serviceName,
            serviceDuration,
            dateLabel: formatDateLabel(booking.date)
          };
        });
      },
    filteredAppointments() {
      return this.appointmentsDetailed.filter((appt) => {
        const matchesStart = this.appointmentsFilter.start
          ? appt.date >= this.appointmentsFilter.start
          : true;
        const matchesEnd = this.appointmentsFilter.end ? appt.date <= this.appointmentsFilter.end : true;
        const matchesStatus = this.appointmentsFilter.status
          ? appt.status === this.appointmentsFilter.status
          : true;
        return matchesStart && matchesEnd && matchesStatus;
      });
    },
    dashboardAppointments() {
      if (!this.activeDashboardStart && !this.activeDashboardEnd) {
        return this.appointmentsDetailed;
      }
      return this.appointmentsDetailed.filter((appt) => {
        const dateOk =
          (!this.activeDashboardStart || appt.date >= this.activeDashboardStart) &&
          (!this.activeDashboardEnd || appt.date <= this.activeDashboardEnd);
        return dateOk;
      });
    },
    dayAppointments() {
      const day = this.activeDay || todayISO();
      return this.dashboardAppointments.filter((appt) => appt.date === day);
    },
    activeDayLabel() {
      return formatDateLabel(this.activeDay || todayISO());
    },
    activeMonthLabel() {
      const date = this.activeDashboardStart || todayISO();
      const [year, month] = date.split("-");
      return `${month}/${year}`;
    },
    monthAppointments() {
      const date = this.activeDashboardStart || todayISO();
      const [year, month] = date.split("-");
      return this.dashboardAppointments.filter((appt) => appt.date.startsWith(`${year}-${month}`));
    },
    groupedByDate() {
      const map = {};
      this.dashboardAppointments.forEach((appt) => {
        map[appt.date] = (map[appt.date] || 0) + 1;
      });
      return Object.keys(map)
        .sort()
        .slice(0, 6)
        .map((date) => ({
          date,
          label: formatDateLabel(date),
          count: map[date]
        }));
    },
    availabilityDayLabel() {
      if (!this.availabilityQuery.date) return "-";
      const day = getDayNumber(this.availabilityQuery.date);
      return WEEKDAY_LABELS[day] || "-";
    },
    isSelectedCompanySaved() {
      if (!this.selectedCompanyId || !this.savedClientCompanyId) return false;
      return String(this.selectedCompanyId) === String(this.savedClientCompanyId);
    }
  },
  watch: {
    clientScheduleDate() {
      if (this.clientSlotsModalOpen) {
        this.fetchClientAvailability();
      }
    }
  },
  created() {
    if (this.isAuthenticated) {
      this.activePortal = "professor";
    } else if (this.clientAuthenticated) {
      this.activePortal = "cliente";
    }
      this.fetchClientCompanies();
      if (this.clientAuthenticated) {
        this.fetchClientProfile();
      }
      if (!this.availabilityQuery.serviceId && this.services.length) {
        this.availabilityQuery.serviceId = this.services[0].id;
      }
    if (this.isAuthenticated) {
      this.fetchServices();
      this.fetchCategories();
      this.fetchAppointments();
      this.fetchStudents();
    }
  },
  methods: {
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    closeSidebar() {
      this.showSidebar = false;
    },
    goToTab(tab) {
      this.currentTab = tab;
      this.showSidebar = false;
      if (tab === "availability" && this.availabilityQuery.date && this.availabilityQuery.serviceId) {
        this.fetchAvailability();
      }
    },
    openChatFromAppointment(appt) {
      if (!appt || !appt.studentId) return;
      this.pendingProfessorChat = {
        studentId: appt.studentId,
        studentName: appt.studentName || "Aluno"
      };
      this.goToTab("messages");
    },
    toggleClientSidebar() {
      this.showClientSidebar = !this.showClientSidebar;
    },
    closeClientSidebar() {
      this.showClientSidebar = false;
    },
    goToClientTab(tab) {
      this.clientTab = tab;
      this.showClientSidebar = false;
      if (tab === "slots") {
        this.fetchClientAvailability();
      }
      if (tab === "bookings") {
        this.fetchClientBookings();
      }
    },
    goToSavedCompany() {
      if (!this.savedClientCompanyId) return;
      this.selectedCompanyId = this.savedClientCompanyId;
      this.selectedServiceId = "";
      this.fetchClientServices(this.savedClientCompanyId);
      this.clientTab = "services";
      this.showClientSidebar = false;
    },
    selectCompany(company) {
      this.selectedCompanyId = company.id;
      this.selectedServiceId = "";
      this.fetchClientServices(company.id);
      this.clientTab = "services";
    },
    saveClientCompany() {
      if (!this.selectedCompanyId) return;
      this.savedClientCompanyId = this.selectedCompanyId;
      saveStorage(STORAGE.CLIENT_COMPANY, this.selectedCompanyId);
    },
    selectService(service) {
      this.selectedServiceId = service.id;
      this.fetchClientAvailability();
      this.clientSlotsModalOpen = true;
    },
    closeClientSlotsModal() {
      this.clientSlotsModalOpen = false;
    },
    setClientScheduleDate(value) {
      this.clientScheduleDate = value;
    },
    openClientCheckout(slot) {
      this.clientCheckoutError = "";
      this.clientCheckoutSummary = {
        date: this.clientScheduleDate,
        time: slot,
        title: this.selectedService?.titulo || this.selectedService?.nome || "Servico",
        price: this.selectedService?.preco || this.selectedService?.valor || "-"
      };
      this.clientCheckoutOpen = true;
      this.clientSlotsModalOpen = false;
      this.resetClientCheckoutPix();
      this.fetchClientCheckoutAuth();
    },
    closeClientCheckout() {
      this.clientCheckoutOpen = false;
      this.clearClientCheckoutPixInterval();
    },
    confirmClientCheckout() {
      if (!this.validateClientCheckout()) return;
      if (this.clientCheckoutMethod === "pix") {
        this.generateClientPixPayment();
        return;
      }
      if (this.clientCheckoutMethod === "cartao") {
        this.processClientCardPayment();
        return;
      }
      this.finalizeClientCheckout();
    },
    setClientCheckoutMethod(value) {
      this.clientCheckoutMethod = value;
      if (value !== "pix") {
        this.resetClientCheckoutPix();
        this.clearClientCheckoutPixInterval();
      }
    },
    setClientCheckoutStatus(value) {
      this.clientCheckoutStatus = value;
    },
    setClientCheckoutCard(field, value) {
      this.clientCheckoutCard = {
        ...this.clientCheckoutCard,
        [field]: value
      };
    },
    normalizeEnabledPaymentMethods(data) {
      const enabled =
        data?.enabled_methods ||
        data?.enabledMethods ||
        data?.metodos ||
        data?.methods ||
        null;

      if (!enabled || typeof enabled !== "object") return null;

      return Object.entries(enabled)
        .filter(([_, value]) => {
          if (value === true) return true;
          if (value && typeof value === "object") {
            if (Object.prototype.hasOwnProperty.call(value, "enabled")) {
              return Boolean(value.enabled);
            }
            return Object.keys(value).length > 0;
          }
          return false;
        })
        .map(([key]) => key);
    },
    async fetchEnabledPaymentMethods(empresaId) {
      if (!empresaId) return null;

      const headers = {
        "Content-Type": "application/json",
        ...this.clientAuthHeaders()
      };

      const queryUrl = `${API_BASE}/api/empresa/tipopagamento/enabled?empresa_id=${encodeURIComponent(
        empresaId
      )}`;

      try {
        const response = await fetch(queryUrl, { headers });
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          return this.normalizeEnabledPaymentMethods(data);
        }
      } catch (error) {
        // Fall through to POST fallback.
      }

      try {
        const response = await fetch(`${API_BASE}/api/empresa/tipopagamento/enabled`, {
          method: "POST",
          headers,
          body: JSON.stringify({ empresa_id: empresaId })
        });
        if (!response.ok) return null;
        const data = await response.json().catch(() => ({}));
        return this.normalizeEnabledPaymentMethods(data);
      } catch (error) {
        return null;
      }
    },
    bookSlot(slot) {
      if (!this.selectedCompanyId || !this.selectedServiceId || !this.clientScheduleDate) return;
      const exists = this.clientBookings.some(
        (booking) =>
          booking.serviceId === this.selectedServiceId &&
          booking.date === this.clientScheduleDate &&
          booking.time === slot
      );
      if (exists) return;
      const newBooking = {
        id: Date.now(),
        companyId: this.selectedCompanyId,
        serviceId: this.selectedServiceId,
        date: this.clientScheduleDate,
        time: slot,
        status: "pendente"
      };
      this.clientBookings = [...this.clientBookings, newBooking];
      saveStorage(STORAGE.CLIENT_BOOKINGS, this.clientBookings);
    },
    removeClientBooking(id) {
      return fetch(`${API_BASE}/api/agendamento/destroy/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.clientAuthHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.success === false) {
            throw new Error(data.error || data.message || "Erro ao cancelar agendamento.");
          }
          this.clientBookings = this.clientBookings.filter((booking) => booking.id !== id);
          saveStorage(STORAGE.CLIENT_BOOKINGS, this.clientBookings);
          return true;
        })
        .catch(() => {
          // Mantem dados locais se a API falhar.
          return false;
        });
    },
    fetchWaitlistQueue(booking) {
      const date =
        booking?.date ||
        booking?.data_da_aula ||
        booking?.data ||
        booking?.data_agendamento ||
        booking?.data_aula ||
        "";
      if (!date) return Promise.resolve([]);
      const params = new URLSearchParams({
        data: date,
        status: "Espera"
      });
      return fetch(`${API_BASE}/api/agendamento/dia?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...this.clientAuthHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar lista de espera.");
          }
          const items = Array.isArray(data) ? data : data.agendamentos || data.data || [];
          return items.map((item) => this.normalizeClientBooking(item));
        })
        .catch(() => []);
    },
    saveClientProfile() {
      this.clientProfileSaved = false;
      saveStorage(STORAGE.CLIENT_PROFILE, this.clientProfile);
      this.clientProfileSaved = true;
    },
    handleLogin() {
      this.loginError = "";
      if (!this.loginForm.email || !this.loginForm.password) {
        this.loginError = "Informe email e senha.";
        return;
      }
      this.authLoading = true;
      fetch(API_BASE+"/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: this.loginForm.email,
          password: this.loginForm.password
        })
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Falha na autenticacao.");
          }
          if (!data.token) {
            throw new Error("Token nao recebido.");
          }
          localStorage.setItem(STORAGE.TOKEN, data.token);
          if (data.empresa_id) {
            localStorage.setItem(STORAGE.EMPRESA, data.empresa_id);
            this.serviceForm.empresa_id = data.empresa_id;
          }
          if (data.professor_id) {
            localStorage.setItem(STORAGE.PROFESSOR, data.professor_id);
          }
          this.isAuthenticated = true;
          this.activePortal = "professor";
          this.currentTab = "dashboard";
          this.teacher = { ...this.teacher, email: this.loginForm.email };
          this.fetchServices();
          this.fetchCategories();
          this.fetchAppointments();
          this.fetchStudents();
          this.loginForm.email = "";
          this.loginForm.password = "";
        })
        .catch((error) => {
          this.loginError = error.message || "Erro ao autenticar.";
        })
        .finally(() => {
          this.authLoading = false;
        });
    },
    handleClientLogin() {
      this.clientLoginError = "";
      if (!this.clientLoginForm.email || !this.clientLoginForm.password) {
        this.clientLoginError = "Informe email e senha.";
        return;
      }
      this.clientLoading = true;
      fetch(API_BASE + "/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: this.clientLoginForm.email,
          password: this.clientLoginForm.password
        })
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Falha na autenticacao.");
          }
          if (!data.token) {
            throw new Error("Token nao recebido.");
          }
          localStorage.setItem(STORAGE.CLIENT_TOKEN, data.token);
          const loginUserId =
            data.user_id ||
            data.userId ||
            data.usuario_id ||
            data.aluno_id ||
            data.alunoId ||
            "";
          if (loginUserId) {
            localStorage.setItem("user_id", loginUserId);
          }
          this.clientAuthenticated = true;
          this.activePortal = "cliente";
          if (this.savedClientCompanyId) {
            this.selectedCompanyId = this.savedClientCompanyId;
            this.clientTab = "services";
          }
            this.clientLoginForm.email = "";
            this.clientLoginForm.password = "";
            this.fetchClientCompanies();
            this.fetchClientProfile();
          })
        .catch((error) => {
          this.clientLoginError = error.message || "Erro ao autenticar.";
        })
        .finally(() => {
          this.clientLoading = false;
        });
    },
    logout() {
      this.isAuthenticated = false;
      localStorage.removeItem(STORAGE.TOKEN);
      localStorage.removeItem(STORAGE.EMPRESA);
      localStorage.removeItem(STORAGE.PROFESSOR);
      this.activePortal = this.clientAuthenticated ? "cliente" : "professor";
    },
    clientLogout() {
      this.clientAuthenticated = false;
      localStorage.removeItem(STORAGE.CLIENT_TOKEN);
      this.activePortal = this.isAuthenticated ? "professor" : "cliente";
    },
    authHeaders() {
      const token = localStorage.getItem(STORAGE.TOKEN);
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    clientAuthHeaders() {
      const token = localStorage.getItem(STORAGE.CLIENT_TOKEN);
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
    companyCityLabel(company) {
      const city =
        company.cidade ||
        company.endereco?.cidade ||
        company.endereco?.municipio ||
        "-";
      const categoria =
        company.categoria ||
        company.modalidade?.nome ||
        company.modalidade?.titulo ||
        "-";
      return `${city} - ${categoria}`;
    },
    companyImageUrl(company) {
      const avatar = company.avatar || "";
      const banner = company.banners || "";
      const value = avatar || banner;
      if (!value) return "";
      if (value.startsWith("http")) return value;
      const normalized = value.replace(/^\/+/, "");
      if (normalized.includes("/")) {
        return `${ASSET_BASE}/${normalized}`;
      }
      const folder = avatar ? "avatar" : "banner";
      return `${ASSET_BASE}/${folder}/${normalized}`;
    },
    companyDescricaoLabel(company) {
      return (
        company.endereco?.bairro ||
        company.bairro ||
        company.endereco?.logradouro ||
        ""
      );
    },
    resolveClientProfessorId() {
      if (this.selectedService?.professor_id) return this.selectedService.professor_id;
      if (this.selectedService?.professor?.id) return this.selectedService.professor.id;
      if (this.selectedService?.user_id) return this.selectedService.user_id;
      if (this.selectedCompany?.professor_id) return this.selectedCompany.professor_id;
      if (this.selectedCompany?.professor?.id) return this.selectedCompany.professor.id;
      if (this.selectedCompany?.user_id) return this.selectedCompany.user_id;
      return "";
    },

    fetchClientProfile() {
      const token = localStorage.getItem(STORAGE.CLIENT_TOKEN);
      if (!token) return;
      const headers = {
        "Content-Type": "application/json",
        ...this.clientAuthHeaders()
      };
        const parseUser = (data) => data?.user || data?.usuario || data;
        const applyUser = (user) => {
          if (!user) return;
          const updatedProfile = {
            ...this.clientProfile,
            id:
              user.id ||
              user.user_id ||
              user.usuario_id ||
              user.aluno_id ||
              user.alunoId ||
              this.clientProfile.id ||
              "",
            nome: user.nome || user.name || this.clientProfile.nome,
            email: user.email || this.clientProfile.email,
            telefone: user.telefone || user.phone || this.clientProfile.telefone,
            documento: user.documento || this.clientProfile.documento,
            foto: user.foto || user.avatar || this.clientProfile.foto
          };
          this.clientProfile = updatedProfile;
          saveStorage(STORAGE.CLIENT_PROFILE, this.clientProfile);
        };
      fetch(API_BASE + "/api/me", { headers })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (response.status === 404) {
            throw new Error("fallback");
          }
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar perfil do cliente.");
          }
          applyUser(parseUser(data));
        })
        .catch((error) => {
          if (error.message !== "fallback") return;
          fetch(API_BASE + "/api/user", { headers })
            .then(async (response) => {
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data.error || "Erro ao carregar perfil do cliente.");
              }
              applyUser(parseUser(data));
            })
            .catch(() => {
              // Mantem dados locais se a API falhar.
            });
        });
    },
    fetchClientCompanies() {
      this.clientCompaniesLoading = true;
      this.clientCompaniesError = "";
      fetch(API_BASE+"/api/search/empresa", {
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar empresas.");
          }
          this.clientCompanies = Array.isArray(data) ? data : [];
          if (this.selectedCompanyId) {
            const savedCompany = this.clientCompanies.find(
              (company) => String(company.id) === String(this.selectedCompanyId)
            );
            if (savedCompany) {
              this.fetchClientServices(this.selectedCompanyId);
              this.clientTab = "services";
              return;
            }
            this.selectedCompanyId = "";
          }
          if (!this.selectedCompanyId && this.clientCompanies.length) {
            this.selectedCompanyId = this.clientCompanies[0].id;
            this.fetchClientServices(this.selectedCompanyId);
          }
        })
        .catch((error) => {
          this.clientCompaniesError = error.message || "Erro ao carregar empresas.";
        })
        .finally(() => {
          this.clientCompaniesLoading = false;
        });
    },
    fetchClientBookings() {
      const token = localStorage.getItem(STORAGE.CLIENT_TOKEN);
      if (!token) return;
      fetch(API_BASE+"/api/alunoadmin/aulas", {
        headers: {
          "Content-Type": "application/json",
          ...this.clientAuthHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar agendamentos do cliente.");
          }
          const items = Array.isArray(data) ? data : data.agendamentos || data.data || [];
          this.clientBookings = items.map((item) => this.normalizeClientBooking(item));
          saveStorage(STORAGE.CLIENT_BOOKINGS, this.clientBookings);
        })
        .catch(() => {
          // Mantem dados locais se a API falhar.
        });
    },
    normalizeClientBooking(booking) {
      const date =
        booking.data_da_aula ||
        booking.data ||
        booking.date ||
        booking.data_agendamento ||
        booking.data_aula ||
        "";
      const rawTime =
        booking.horario ||
        booking.time ||
        booking.hora ||
        booking.horario_aula ||
        "";
      const time = rawTime ? rawTime.slice(0, 5) : "";
      const rawStatus =
        booking.status ||
        booking.situacao ||
        booking.estado ||
        "PENDING";
      const statusMap = {
        Espera: "PENDING",
        Confirmado: "CONFIRMED",
        Cancelado: "CANCELLED",
        Concluido: "COMPLETED",
        Pago: "RECEIVED"
      };
      const status = statusMap[rawStatus] || String(rawStatus).toUpperCase();
      const serviceId =
        booking.servico_id ||
        booking.servico?.id ||
        booking.serviceId ||
        booking.servicoId ||
        "";
      const companyId =
        booking.empresa_id ||
        booking.empresa?.id ||
        booking.companyId ||
        booking.empresaId ||
        booking.agenda_empresa_id ||
        "";
      const companyName =
        booking.empresa?.nome ||
        booking.professor?.usuario?.nome ||
        booking.empresa_nome ||
        booking.companyName ||
        "";
      const serviceName =
        booking.servico?.titulo ||
        booking.servico?.nome ||
        booking.modalidade?.nome ||
        booking.servico_titulo ||
        booking.servico_nome ||
        booking.serviceName ||
        "";
      const studentName =
        booking.aluno?.usuario?.nome ||
        booking.aluno?.nome ||
        booking.aluno_nome ||
        booking.studentName ||
        "";
      const id =
        booking.id ||
        booking.agendamento_id ||
        booking.aula_id ||
        `${companyId}-${serviceId}-${date}-${time}`;
      return {
        id,
        companyId,
        serviceId,
        companyName,
        serviceName,
        studentName,
        date,
        time,
        status
      };
    },
    fetchClientServices(empresaId) {
      if (!empresaId) return;
      this.clientServicesLoading = true;
      this.clientServicesError = "";
      fetch(API_BASE+`/api/servicos/empresa/${empresaId}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar servicos.");
          }
          this.clientServices = Array.isArray(data) ? data : [];
          if (!this.selectedServiceId && this.clientServices.length) {
            this.selectedServiceId = this.clientServices[0].id;
          }
        })
        .catch((error) => {
          this.clientServicesError = error.message || "Erro ao carregar servicos.";
        })
        .finally(() => {
          this.clientServicesLoading = false;
        });
    },
    fetchClientAvailability() {
      this.clientAvailabilityError = "";
      this.clientAvailableSlots = [];
      const date = this.clientScheduleDate;
      const serviceId = this.selectedServiceId;
      const professorId = this.resolveClientProfessorId();
      if (!date || !serviceId) {
        this.clientAvailabilityError = "Selecione data e servico.";
        return;
      }
      if (!professorId) {
        this.clientAvailabilityError = "Profissional nao encontrado para esta empresa.";
        return;
      }
      this.clientAvailabilityLoading = true;
      const params = new URLSearchParams({
        day: String(getDayNumber(date)),
        data_select: date,
        professor_id: String(professorId),
        servico_id: String(serviceId)
      });
      fetch(`${API_BASE}/api/disponibilidade?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar horarios.");
          }
          this.clientAvailableSlots = Array.isArray(data) ? data : [];
        })
        .catch((error) => {
          this.clientAvailabilityError = error.message || "Erro ao carregar horarios.";
        })
        .finally(() => {
          this.clientAvailabilityLoading = false;
        });
    },
    fetchClientCheckoutAuth() {
      const userId = this.selectedCompany?.user_id || this.resolveClientProfessorId();
      if (!userId) {
        this.clientCheckoutError = "Empresa nao encontrada para pagamento.";
        return;
      }
      this.clientCheckoutLoading = true;
      this.clientCheckoutError = "";
      fetch(`${API_BASE}/api/checkout-auth/${userId}`, {
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.message || "Erro ao carregar pagamento.");
          }
          let methods = Array.isArray(data.formasPagamento) ? data.formasPagamento : [];
          const empresaId =
            this.selectedCompany?.id ||
            this.selectedCompanyId ||
            data.empresa_id ||
            "";
          const enabledMethods = await this.fetchEnabledPaymentMethods(empresaId);
          if (Array.isArray(enabledMethods)) {
            methods = methods.filter((method) => enabledMethods.includes(method));
          }
          this.clientCheckoutMethods = methods;
          if (!methods.includes(this.clientCheckoutMethod)) {
            this.clientCheckoutMethod = methods[0] || "";
          }
          this.clientCheckoutProfessorId = data.professor?.id || "";
          this.clientCheckoutModalidadeId = data.professor?.modalidade_id || "";
          this.clientCheckoutTokenGateway = data.token_gateway || "";
          const storedUserId = localStorage.getItem("user_id") || "";
          this.clientCheckoutAlunoId = storedUserId || data.user_id || "";
        })
        .catch((error) => {
          this.clientCheckoutError = error.message || "Erro ao carregar pagamento.";
        })
        .finally(() => {
          this.clientCheckoutLoading = false;
        });
    },
    validateClientCheckout() {
      if (!this.clientCheckoutSummary.date || !this.clientCheckoutSummary.time) {
        this.clientCheckoutError = "Dados do agendamento incompletos.";
        return false;
      }
      if (!this.clientCheckoutMethod) {
        this.clientCheckoutError = "Selecione uma forma de pagamento.";
        return false;
      }
      if (this.clientCheckoutMethod === "cartao") {
        const { name, number, expiry, cvv, cpf } = this.clientCheckoutCard;
        if (!name || !number || !expiry || !cvv || !cpf) {
          this.clientCheckoutError = "Preencha todos os dados do cartao.";
          return false;
        }
      }
      return true;
    },
    generateClientPixPayment() {
      if (!this.clientCheckoutAlunoId) {
        this.clientCheckoutError = "Aluno nao encontrado para pagamento.";
        return;
      }
      this.clientCheckoutLoading = true;
      this.clientCheckoutError = "";
      const payload = {
        usuario_id: Number(this.clientCheckoutAlunoId),
        value: Number(this.clientCheckoutSummary.price || 0),
        description: `Pagamento de aula particular - ${this.clientCheckoutSummary.title}`,
        due_date: this.clientCheckoutSummary.date
      };
      fetch(API_BASE+"/api/pix-qrcode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Erro ao gerar PIX.");
          }
          this.clientCheckoutPixData = data;
          this.clientCheckoutPixMessage = "Aguardando pagamento via PIX.";
          this.clientCheckoutPixExpiration = data.qr_code?.expiration_date || "";
          this.clientCheckoutPixFinalizeReady = false;
          this.clearClientCheckoutPixInterval();
          this.clientCheckoutPixIntervalId = setInterval(() => {
            this.checkClientPixPaymentStatus();
          }, 20000);
        })
        .catch((error) => {
          this.clientCheckoutError = error.message || "Erro ao gerar PIX.";
        })
        .finally(() => {
          this.clientCheckoutLoading = false;
        });
    },
    checkClientPixPaymentStatus() {
      const paymentId = this.clientCheckoutPixData?.payment?.id;
      if (!paymentId) {
        this.clearClientCheckoutPixInterval();
        return;
      }
      fetch(API_BASE+"/api/pix-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ payment_id: paymentId })
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !data.success) {
            throw new Error(data.message || "Erro ao verificar PIX.");
          }
          if (data.status === "RECEIVED") {
            this.clientCheckoutPixMessage = "Pagamento confirmado!";
            this.clientCheckoutPixFinalizeReady = true;
            this.clearClientCheckoutPixInterval();
          } else {
            this.clientCheckoutPixMessage = "Aguardando pagamento via PIX.";
            this.clientCheckoutPixFinalizeReady = false;
          }
        })
        .catch((error) => {
          this.clientCheckoutPixMessage = error.message || "Erro ao verificar PIX.";
        });
    },
    processClientCardPayment() {
      if (!this.clientCheckoutAlunoId) {
        this.clientCheckoutError = "Aluno nao encontrado para pagamento.";
        return;
      }
      const [month, year] = String(this.clientCheckoutCard.expiry || "").split("/");
      const endereco = this.selectedCompany?.endereco?.endereco || this.selectedCompany?.endereco?.logradouro || "";
      const cidade = this.selectedCompany?.endereco?.cidade || "";
      const cep = this.selectedCompany?.endereco?.cep || "";
      const payload = {
        card_number: this.clientCheckoutCard.number.replace(/\s/g, ""),
        card_holder: this.clientCheckoutCard.name.trim(),
        card_expiry_month: month || "",
        card_expiry_year: year ? `20${year}` : "",
        card_ccv: this.clientCheckoutCard.cvv,
        value: Number(this.clientCheckoutSummary.price || 0),
        name: this.clientCheckoutCard.name.trim(),
        email: this.clientProfile.email || "cliente@email.com",
        phone: this.clientProfile.telefone || "",
        address: endereco || "Endereco nao informado",
        province: cidade || "Cidade",
        postalCode: String(cep).replace(/\D/g, ""),
        cpfCnpj: this.clientCheckoutCard.cpf.replace(/\D/g, ""),
        addressNumber: "0",
        aluno_id: this.clientCheckoutAlunoId,
        professor_id: this.clientCheckoutProfessorId,
        modalidade_id: this.clientCheckoutModalidadeId || 1,
        data_aula: this.clientCheckoutSummary.date,
        hora_aula: this.clientCheckoutSummary.time,
        titulo: this.clientCheckoutSummary.title,
        payment_method: "cartao",
        status: "RECEIVED",
        usuario_id: this.clientCheckoutAlunoId
      };
      this.clientCheckoutLoading = true;
      fetch(API_BASE+"/api/pagarComCartao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.success === false) {
            throw new Error(data.error || data.message || "Erro no pagamento.");
          }
          if (data.redirect_url) {
            window.location.href = `${data.redirect_url}?method=CARTAOC`;
            return;
          }
          this.finalizeClientCheckout();
        })
        .catch((error) => {
          this.clientCheckoutError = error.message || "Erro no pagamento.";
        })
        .finally(() => {
          this.clientCheckoutLoading = false;
        });
    },
    finalizeClientCheckout() {
      if (!this.clientCheckoutSummary.time) return;
      if (this.clientCheckoutMethod === "presencial") {
        this.submitPresencialPayment();
        return;
      }
      this.clientScheduleDate = this.clientCheckoutSummary.date || this.clientScheduleDate;
      this.clientCheckoutOpen = false;
      this.goToClientTab("bookings");
    },
    resetClientCheckoutPix() {
      this.clientCheckoutPixData = null;
      this.clientCheckoutPixMessage = "";
      this.clientCheckoutPixFinalizeReady = false;
      this.clientCheckoutPixExpiration = "";
    },
    clearClientCheckoutPixInterval() {
      if (this.clientCheckoutPixIntervalId) {
        clearInterval(this.clientCheckoutPixIntervalId);
        this.clientCheckoutPixIntervalId = null;
      }
    },
    submitPresencialPayment() {
      if (!this.clientCheckoutAlunoId || !this.clientCheckoutProfessorId) {
        this.clientCheckoutError = "Dados do aluno/professor incompletos.";
        return;
      }
      this.clientCheckoutLoading = true;
      this.clientCheckoutError = "";
      const payload = {
        aluno_id: this.clientCheckoutAlunoId,
        professor_id: this.clientCheckoutProfessorId,
        modalidade_id: this.clientCheckoutModalidadeId || 1,
        data_aula: this.clientCheckoutSummary.date,
        hora_aula: this.clientCheckoutSummary.time,
        valor_aula: this.clientCheckoutSummary.price,
        titulo: this.clientCheckoutSummary.title,
        servico_id: this.selectedServiceId,
        payment_method: "presencial",
        status: this.clientCheckoutStatus || "PENDING",
        usuario_id: this.clientCheckoutAlunoId
      };
      fetch(API_BASE+"/api/pagamento/presencial-api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok || data.success === false) {
            throw new Error(data.message || "Erro ao criar pagamento presencial.");
          }
          this.clientScheduleDate = this.clientCheckoutSummary.date || this.clientScheduleDate;
          this.clientCheckoutOpen = false;
          this.goToClientTab("bookings");
        })
        .catch((error) => {
          this.clientCheckoutError = error.message || "Erro ao criar pagamento presencial.";
        })
        .finally(() => {
          this.clientCheckoutLoading = false;
        });
    },
    normalizeStudent(student) {
      const user = student.usuario || student;
      return {
        id: user.id || student.id,
        nome: user.nome || student.nome || "",
        email: user.email || student.email || "",
        telefone: user.telefone || student.telefone || "",
        data_nascimento: user.data_nascimento || student.data_nascimento || ""
      };
    },
    normalizeAppointment(appt) {
      const date = appt.date || appt.data || appt.data_agendamento || "";
      const time = appt.time || appt.hora || appt.horario || "";
      const status = appt.status || appt.situacao || "confirmado";
      const serviceId = appt.serviceId || appt.servico_id || appt.servico?.id || "";
      const studentId = appt.studentId || appt.aluno_id || appt.aluno?.id || "";
      const serviceName =
        appt.servico?.titulo ||
        appt.servico?.nome ||
        appt.serviceName ||
        "Servico";
      const studentName =
        appt.aluno?.usuario?.nome ||
        appt.aluno?.nome ||
        appt.studentName ||
        "Aluno";
      return {
        ...appt,
        date,
        time,
        status,
        serviceId,
        studentId,
        studentName,
        serviceName
      };
    },
    fetchAppointments() {
      const empresaId = loadStorage(STORAGE.EMPRESA, "");
      if (!empresaId) return;
      this.appointmentsLoading = true;
      this.appointmentsError = "";
      fetch(`${API_BASE}/api/agendamento/empresa/${empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar agendamentos.");
          }
          this.appointments = Array.isArray(data) ? data : [];
          saveStorage(STORAGE.APPOINTMENTS, this.appointments);
        })
        .catch((error) => {
          this.appointmentsError = error.message || "Erro ao carregar agendamentos.";
        })
        .finally(() => {
          this.appointmentsLoading = false;
        });
    },
    fetchStudents() {
      const empresaId = loadStorage(STORAGE.EMPRESA, "");
      if (!empresaId) return;
      this.studentsLoading = true;
      this.studentsError = "";
      fetch(`${API_BASE}/api/alunos/empresa/${empresaId}`, {
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar alunos.");
          }
          this.students = Array.isArray(data) ? data : [];
          saveStorage(STORAGE.STUDENTS, this.students);
        })
        .catch((error) => {
          this.studentsError = error.message || "Erro ao carregar alunos.";
        })
        .finally(() => {
          this.studentsLoading = false;
        });
    },
    applyDashboardFilter() {
      this.activeDashboardStart = this.dashboardStart;
      this.activeDashboardEnd = this.dashboardEnd;
      this.activeDay = this.activeDashboardStart || todayISO();
    },
    setDashboardStart(value) {
      this.dashboardStart = value;
    },
    setDashboardEnd(value) {
      this.dashboardEnd = value;
    },
    openDaySchedule() {
      this.activeDay = this.activeDashboardStart || todayISO();
      this.currentTab = "daySchedule";
    },
    startNewAppointment() {
      this.resetAppointmentForm();
      this.appointmentModalOpen = true;
    },
    editAppointment(appt) {
      this.appointmentForm = {
        id: appt.id,
        date: appt.date,
        time: appt.time,
        studentId: appt.studentId,
        serviceId: appt.serviceId,
        status: appt.status
      };
      this.appointmentModalOpen = true;
    },
    saveAppointment() {
      if (!this.appointmentForm.date || !this.appointmentForm.time) return;
      if (!this.appointmentForm.studentId || !this.appointmentForm.serviceId) return;
      const updated = {
        ...this.appointmentForm,
        studentId: Number(this.appointmentForm.studentId),
        serviceId: Number(this.appointmentForm.serviceId)
      };
      if (updated.id) {
        this.appointments = this.appointments.map((appt) => (appt.id === updated.id ? updated : appt));
      } else {
        updated.id = Date.now();
        this.appointments = [...this.appointments, updated];
      }
      saveStorage(STORAGE.APPOINTMENTS, this.appointments);
      this.closeAppointmentModal();
    },
    cancelAppointment(id) {
      this.appointments = this.appointments.map((appt) =>
        appt.id === id ? { ...appt, status: "cancelado" } : appt
      );
      saveStorage(STORAGE.APPOINTMENTS, this.appointments);
    },
    resetAppointmentForm() {
      this.appointmentForm = {
        id: null,
        date: "",
        time: "",
        studentId: "",
        serviceId: "",
        status: "confirmado"
      };
    },
    closeAppointmentModal() {
      this.appointmentModalOpen = false;
      this.resetAppointmentForm();
    },
    fetchServices() {
      this.servicesLoading = true;
      this.servicesError = "";
      const empresaId = loadStorage(STORAGE.EMPRESA, "");
      const endpoint = empresaId ? API_BASE+`/api/servicos/empresa/${empresaId}` : API_BASE+"/api/servicos";
      fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar servicos.");
          }
          this.services = Array.isArray(data) ? data : [];
          if (!this.availabilityQuery.serviceId && this.services.length) {
            this.availabilityQuery.serviceId = this.services[0].id;
          }
          saveStorage(STORAGE.SERVICES, this.services);
        })
        .catch((error) => {
          this.servicesError = error.message || "Erro ao carregar servicos.";
        })
        .finally(() => {
          this.servicesLoading = false;
        });
    },
    fetchCategories() {
      this.categoriesLoading = true;
      this.categoriesError = "";
      fetch(API_BASE+"/api/financeiro-categorias", {
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar categorias.");
          }
          this.categories = Array.isArray(data) ? data : [];
        })
        .catch((error) => {
          this.categoriesError = error.message || "Erro ao carregar categorias.";
        })
        .finally(() => {
          this.categoriesLoading = false;
        });
    },
    startNewService() {
      this.resetServiceForm();
      this.serviceModalOpen = true;
    },
    editService(service) {
      this.serviceForm = {
        id: service.id,
        empresa_id: service.empresa_id || "",
        imagem: service.imagem || "",
        imagemFile: null,
        titulo: service.titulo || "",
        descricao: service.descricao || "",
        preco: service.preco || "",
        tempo_de_aula: service.tempo_de_aula || "",
        tipo_agendamento: service.tipo_agendamento || "HORARIO",
        vagas: service.vagas || "",
        categoria_id: service.categoria_id || ""
      };
      this.serviceModalOpen = true;
    },
    saveService() {
      const empresaId = this.serviceForm.empresa_id || loadStorage(STORAGE.EMPRESA, "");
      if (!this.serviceForm.titulo || !empresaId) return;
      if (!this.serviceForm.preco) return;
      if (!this.serviceForm.tipo_agendamento) return;
      const isEdit = Boolean(this.serviceForm.id);
      const url = isEdit ? `/api/servicos/${this.serviceForm.id}` : "/api/servicos";
      const formData = new FormData();
      formData.append("empresa_id", empresaId);
      formData.append("titulo", this.serviceForm.titulo);
      formData.append("descricao", this.serviceForm.descricao || "");
      formData.append("preco", this.serviceForm.preco);
      formData.append("tempo_de_aula", this.serviceForm.tempo_de_aula || "");
      formData.append("tipo_agendamento", this.serviceForm.tipo_agendamento);
      if (this.serviceForm.tipo_agendamento === "DIA") {
        formData.append("vagas", this.serviceForm.vagas || 1);
      }
      if (this.serviceForm.categoria_id) {
        formData.append("categoria_id", this.serviceForm.categoria_id);
      }
      if (this.serviceForm.imagemFile) {
        formData.append("imagem", this.serviceForm.imagemFile);
      }
      if (isEdit) {
        formData.append("_method", "PUT");
      }
      fetch(url, {
        method: "POST",
        headers: {
          ...this.authHeaders()
        },
        body: formData
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Erro ao salvar servico.");
          }
          if (isEdit) {
            this.services = this.services.map((item) => (item.id === data.id ? data : item));
          } else {
            this.services = [...this.services, data];
          }
          saveStorage(STORAGE.SERVICES, this.services);
          this.closeServiceModal();
        })
        .catch((error) => {
          this.servicesError = error.message || "Erro ao salvar servico.";
        });
    },
    removeService(id) {
      fetch(`${API_BASE}/api/servicos/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Erro ao remover servico.");
          }
          this.services = this.services.filter((item) => item.id !== id);
          saveStorage(STORAGE.SERVICES, this.services);
        })
        .catch((error) => {
          this.servicesError = error.message || "Erro ao remover servico.";
        });
    },
    closeServiceModal() {
      this.serviceModalOpen = false;
      this.resetServiceForm();
    },
    resetServiceForm() {
      this.serviceForm = {
        id: null,
        empresa_id: loadStorage(STORAGE.EMPRESA, ""),
        imagem: "",
        imagemFile: null,
        titulo: "",
        descricao: "",
        preco: "",
        tempo_de_aula: "",
        tipo_agendamento: "HORARIO",
        vagas: "",
        categoria_id: ""
      };
    },
    onServiceImageChange(event) {
      const file = event.target.files && event.target.files[0];
      this.serviceForm.imagemFile = file || null;
    },
    serviceImageUrl(filename) {
      if (!filename) return "";
      if (filename.startsWith("http")) return filename;
      return `${ASSET_BASE}/servico/${filename}`;
    },
    startNewStudent() {
      this.resetStudentForm();
      this.studentModalOpen = true;
    },
    editStudent(student) {
      const nome = student.nome || "";
      const parts = nome.trim().split(/\s+/);
      const primeiroNome = parts.shift() || "";
      const ultimoNome = parts.join(" ");
      this.studentForm = {
        id: student.id,
        primeiro_nome: primeiroNome,
        ultimo_nome: ultimoNome,
        email: student.email || "",
        telefone: student.telefone || "",
        data_nascimento: student.data_nascimento || "",
        password: ""
      };
      this.studentModalOpen = true;
    },
    saveStudent() {
      if (!this.studentForm.primeiro_nome || !this.studentForm.email) return;
      const isEdit = Boolean(this.studentForm.id);
      const url = isEdit ? `/api/aluno/${this.studentForm.id}/update` : "/api/aluno/store";
      const payload = isEdit
        ? {
            primeiro_nome: this.studentForm.primeiro_nome,
            ultimo_nome: this.studentForm.ultimo_nome,
            data_nascimento: this.studentForm.data_nascimento,
            email: this.studentForm.email,
            telefone: this.studentForm.telefone
          }
        : {
            professor_id: loadStorage(STORAGE.PROFESSOR, ""),
            nome: `${this.studentForm.primeiro_nome} ${this.studentForm.ultimo_nome}`.trim(),
            email: this.studentForm.email,
            password: this.studentForm.password,
            tipo_usuario: "aluno",
            data_nascimento: this.studentForm.data_nascimento,
            telefone: this.studentForm.telefone
          };
      if (!isEdit && !this.studentForm.password) return;
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders()
        },
        body: JSON.stringify(payload)
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Erro ao salvar aluno.");
          }
          if (isEdit) {
            this.students = this.students.map((item) => (item.id === data.id ? data : item));
          } else {
            this.students = [...this.students, data];
          }
          saveStorage(STORAGE.STUDENTS, this.students);
          this.closeStudentModal();
          this.fetchStudents();
        })
        .catch((error) => {
          this.studentsError = error.message || "Erro ao salvar aluno.";
        });
    },
    removeStudent(id) {
      const professorId = loadStorage(STORAGE.PROFESSOR, "");
      if (!professorId) {
        this.studentsError = "Professor nao encontrado para excluir aluno.";
        return;
      }
      fetch(`/api/aluno/${id}/destroy/${professorId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...this.authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Erro ao remover aluno.");
          }
          this.students = this.students.filter((item) => item.id !== id);
          saveStorage(STORAGE.STUDENTS, this.students);
        })
        .catch((error) => {
          this.studentsError = error.message || "Erro ao remover aluno.";
        });
    },
    closeStudentModal() {
      this.studentModalOpen = false;
      this.resetStudentForm();
    },
    resetStudentForm() {
      this.studentForm = {
        id: null,
        primeiro_nome: "",
        ultimo_nome: "",
        email: "",
        telefone: "",
        data_nascimento: "",
        password: ""
      };
    },
    setAvailabilityMode(value) {
      this.availabilityMode = value;
    },
    mapContractedSlots(items) {
      if (!Array.isArray(items)) return [];
      return items.map((item, index) => {
        if (typeof item === "string") {
          return {
            key: `${item}-${index}`,
            time: item,
            label: "Agendado",
            studentId: "",
            studentName: "",
            studentEmail: ""
          };
        }
        const rawDate =
          item.data_da_aula ||
          item.data ||
          item.data_aula ||
          item.data_agendamento ||
          "";
        const timeMatch = String(rawDate).match(/(\d{2}):(\d{2})/);
        const time =
          item.horario ||
          item.time ||
          item.hora ||
          (timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : "-");
        const aluno =
          item.aluno_nome ||
          item.alunoNome ||
          item.aluno?.nome ||
          item.aluno?.usuario?.nome ||
          item.studentName ||
          "Aluno";
        const alunoId =
          item.aluno_id ||
          item.alunoId ||
          item.aluno?.id ||
          item.aluno?.usuario?.id ||
          item.studentId ||
          "";
        const alunoEmail =
          item.aluno_email ||
          item.alunoEmail ||
          item.aluno?.email ||
          item.aluno?.usuario?.email ||
          item.studentEmail ||
          "";
        const status = item.status || item.situacao || "Agendado";
        return {
          key: `${time}-${index}`,
          time,
          label: status,
          studentId: alunoId,
          studentName: aluno,
          studentEmail: alunoEmail
        };
      });
    },
    fetchAvailability() {
      this.availabilityError = "";
      this.availabilitySlots = [];
      this.contractedError = "";
      this.contractedSlots = [];
      const date = this.availabilityQuery.date;
      const serviceId = this.availabilityQuery.serviceId;
      const professorId = loadStorage(STORAGE.PROFESSOR, "");
      if (!date || !serviceId) {
        this.availabilityError = "Selecione data e servico.";
        return;
      }
      if (!professorId) {
        this.availabilityError = "Professor nao encontrado.";
        return;
      }
      const shouldLoadAvailable = this.availabilityMode === "available" || this.availabilityMode === "all";
      const shouldLoadBooked = this.availabilityMode === "booked" || this.availabilityMode === "all";
      const baseParams = new URLSearchParams({
        day: String(getDayNumber(date)),
        data_select: date,
        professor_id: String(professorId),
        servico_id: String(serviceId)
      });
      const requests = [];
      if (shouldLoadAvailable) {
        this.availabilityLoading = true;
        const availableReq = fetch(`${API_BASE}/api/disponibilidade?${baseParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            ...this.authHeaders()
          }
        })
          .then(async (response) => {
            const data = await response.json().catch(() => []);
            if (!response.ok) {
              throw new Error(data.error || "Erro ao carregar disponibilidade.");
            }
            this.availabilitySlots = Array.isArray(data) ? data : [];
          })
          .catch((error) => {
            this.availabilityError = error.message || "Erro ao carregar disponibilidade.";
          })
          .finally(() => {
            this.availabilityLoading = false;
          });
        requests.push(availableReq);
      } else {
        this.availabilitySlots = [];
      }
      if (shouldLoadBooked) {
        this.contractedLoading = true;
        const bookedParams = new URLSearchParams({
          data_select: date,
          professor_id: String(professorId),
          servico_id: String(serviceId)
        });
        const bookedReq = (async () => {
          try {
            const headers = {
              "Content-Type": "application/json",
              ...this.authHeaders()
            };
            const primaryUrl = `${API_BASE}/api/agendamentos/com-cliente?${bookedParams.toString()}`;
            const primaryRes = await fetch(primaryUrl, { headers });
            const primaryData = await primaryRes.json().catch(() => []);
            if (!primaryRes.ok) {
              throw new Error(primaryData.error || "Erro ao carregar horarios contratados.");
            }
            let slots = this.mapContractedSlots(primaryData);
            if (!slots.length) {
              const fallbackUrl = `${API_BASE}/api/disponibilidade/horarios-contratados?${bookedParams.toString()}`;
              const fallbackRes = await fetch(fallbackUrl, { headers });
              const fallbackData = await fallbackRes.json().catch(() => []);
              if (fallbackRes.ok) {
                slots = this.mapContractedSlots(fallbackData);
              }
            }
            this.contractedSlots = slots;
          } catch (error) {
            this.contractedError = error.message || "Erro ao carregar horarios contratados.";
          } finally {
            this.contractedLoading = false;
          }
        })();
        requests.push(bookedReq);
      } else {
        this.contractedSlots = [];
      }
      if (!requests.length) {
        this.availabilityError = "Selecione um modo de exibicao.";
      }
    }
  }
};
</script>
