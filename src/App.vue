<template>
  <div class="app-shell">
    <div v-if="!isAuthenticated" class="login-screen">
      <div class="login-card">
        <h1>Agenda Pro</h1>
        <p class="subtitle">Acesso do Professor</p>
        <label class="field">
          <span>Email</span>
          <input type="email" v-model.trim="loginForm.email" placeholder="prof@escola.com" />
        </label>
        <label class="field">
          <span>Senha</span>
          <input type="password" v-model="loginForm.password" placeholder="******" />
        </label>
        <button class="primary-btn" @click="handleLogin">Entrar</button>
        <button class="text-btn" @click="showForgot = !showForgot">Esqueci a senha</button>
        <p v-if="showForgot" class="hint">Funcionalidade em breve.</p>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </div>
    </div>

    <div v-else class="app-layout">
      <div v-if="showSidebar" class="sidebar-backdrop" @click="showSidebar = false"></div>
      <aside class="sidebar" :class="{ open: showSidebar }">
        <div class="sidebar-header">
          <h1>Agenda Pro</h1>
          <p class="subtitle">Menu Principal</p>
        </div>
        <nav class="sidebar-nav">
          <button :class="{ active: currentTab === 'dashboard' }" @click="goToTab('dashboard')">
            Dashboard
          </button>
          <button :class="{ active: currentTab === 'appointments' }" @click="goToTab('appointments')">
            Agendamentos
          </button>
          <button :class="{ active: currentTab === 'services' }" @click="goToTab('services')">
            Servicos
          </button>
          <button :class="{ active: currentTab === 'students' }" @click="goToTab('students')">
            Alunos
          </button>
          <button :class="{ active: currentTab === 'availability' }" @click="goToTab('availability')">
            Horarios
          </button>
        </nav>
      </aside>

      <div class="app-main">
        <header class="topbar">
          <button class="icon-btn" @click="toggleSidebar">Menu</button>
          <div class="topbar-info">
            <p class="label">Professor</p>
            <h2>{{ teacher.name }}</h2>
          </div>
          <button class="secondary-btn" @click="logout">Logout</button>
        </header>

        <main class="content">
          <section v-if="currentTab === 'dashboard'" class="view">
            <h3>Dashboard</h3>
            <div class="filter-row">
              <label class="field small">
                <span>Data Inicio</span>
                <input type="date" v-model="dashboardStart" />
              </label>
              <label class="field small">
                <span>Data Final</span>
                <input type="date" v-model="dashboardEnd" />
              </label>
              <button class="primary-btn" @click="applyDashboardFilter">Filtrar</button>
            </div>

            <div class="cards">
              <div class="card clickable" @click="openDaySchedule">
                <p class="card-title">Agendamentos do Dia</p>
                <p class="card-value">{{ dayAppointments.length }}</p>
                <p class="card-subtitle">{{ activeDayLabel }}</p>
              </div>
              <div class="card">
                <p class="card-title">Numero de Agendamentos no Mes</p>
                <p class="card-value">{{ monthAppointments.length }}</p>
                <p class="card-subtitle">{{ activeMonthLabel }}</p>
              </div>
              <div class="card">
                <p class="card-title">Agendamentos por Periodo</p>
                <div class="mini-chart">
                  <div v-for="item in groupedByDate" :key="item.date" class="chart-row">
                    <span>{{ item.label }}</span>
                    <div class="bar">
                      <span :style="{ width: item.count * 12 + 'px' }"></span>
                    </div>
                    <strong>{{ item.count }}</strong>
                  </div>
                  <p v-if="!groupedByDate.length" class="hint">Sem dados no periodo.</p>
                </div>
              </div>
            </div>
          </section>

          <section v-if="currentTab === 'daySchedule'" class="view">
            <div class="view-header">
              <h3>Agendamentos do Dia</h3>
              <button class="text-btn" @click="currentTab = 'dashboard'">Voltar</button>
            </div>
            <p class="subtitle">{{ activeDayLabel }}</p>
            <div v-if="dayAppointments.length" class="list">
              <div v-for="appt in dayAppointments" :key="appt.id" class="list-item">
                <div>
                  <strong>{{ appt.time }}</strong>
                  <p>{{ appt.studentName }} · {{ appt.serviceName }}</p>
                </div>
                <span class="status" :class="appt.status">{{ appt.status }}</span>
              </div>
            </div>
            <p v-else class="hint">Nenhum agendamento encontrado.</p>
          </section>

          <section v-if="currentTab === 'appointments'" class="view">
            <div class="view-header">
              <h3>Agendamentos</h3>
              <button class="primary-btn" @click="startNewAppointment">Novo</button>
            </div>
            <div class="filter-row">
              <label class="field small">
                <span>Data</span>
                <input type="date" v-model="appointmentsFilter.date" />
              </label>
              <label class="field small">
                <span>Status</span>
                <select v-model="appointmentsFilter.status">
                  <option value="">Todos</option>
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </label>
            </div>
            <div class="list">
              <div v-for="appt in filteredAppointments" :key="appt.id" class="list-item">
                <div>
                  <strong>{{ appt.date }} · {{ appt.time }}</strong>
                  <p>{{ appt.studentName }} · {{ appt.serviceName }}</p>
                </div>
                <div class="actions">
                  <button class="text-btn" @click="editAppointment(appt)">Editar</button>
                  <button class="text-btn danger" @click="cancelAppointment(appt.id)">Cancelar</button>
                </div>
              </div>
              <p v-if="!filteredAppointments.length" class="hint">Nenhum agendamento encontrado.</p>
            </div>

            <div class="form-card">
              <h4>{{ appointmentForm.id ? "Editar Agendamento" : "Novo Agendamento" }}</h4>
              <div class="form-grid">
                <label class="field">
                  <span>Data</span>
                  <input type="date" v-model="appointmentForm.date" />
                </label>
                <label class="field">
                  <span>Hora</span>
                  <input type="time" v-model="appointmentForm.time" />
                </label>
                <label class="field">
                  <span>Aluno</span>
                  <select v-model="appointmentForm.studentId">
                    <option disabled value="">Selecione</option>
                    <option v-for="student in students" :key="student.id" :value="student.id">
                      {{ student.name }}
                    </option>
                  </select>
                </label>
                <label class="field">
                  <span>Servico</span>
                  <select v-model="appointmentForm.serviceId">
                    <option disabled value="">Selecione</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">
                      {{ service.name }}
                    </option>
                  </select>
                </label>
                <label class="field">
                  <span>Status</span>
                  <select v-model="appointmentForm.status">
                    <option value="confirmado">Confirmado</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </label>
              </div>
              <div class="actions">
                <button class="primary-btn" @click="saveAppointment">Salvar</button>
                <button class="text-btn" @click="resetAppointmentForm">Limpar</button>
              </div>
            </div>
          </section>

          <section v-if="currentTab === 'services'" class="view">
            <div class="view-header">
              <h3>Servicos</h3>
              <button class="primary-btn" @click="startNewService">Novo</button>
            </div>
            <div class="list">
              <div v-for="service in services" :key="service.id" class="list-item">
                <div>
                  <strong>{{ service.name }}</strong>
                  <p>{{ service.description }}</p>
                  <p>{{ service.duration }} min · R$ {{ service.price }}</p>
                </div>
                <div class="actions">
                  <button class="text-btn" @click="editService(service)">Editar</button>
                  <button class="text-btn danger" @click="removeService(service.id)">Remover</button>
                </div>
              </div>
            </div>

            <div class="form-card">
              <h4>{{ serviceForm.id ? "Editar Servico" : "Novo Servico" }}</h4>
              <div class="form-grid">
                <label class="field">
                  <span>Nome</span>
                  <input type="text" v-model.trim="serviceForm.name" />
                </label>
                <label class="field">
                  <span>Descricao</span>
                  <input type="text" v-model.trim="serviceForm.description" />
                </label>
                <label class="field">
                  <span>Duracao (min)</span>
                  <input type="number" v-model.number="serviceForm.duration" />
                </label>
                <label class="field">
                  <span>Preco (R$)</span>
                  <input type="number" v-model.number="serviceForm.price" />
                </label>
              </div>
              <div class="actions">
                <button class="primary-btn" @click="saveService">Salvar</button>
                <button class="text-btn" @click="resetServiceForm">Limpar</button>
              </div>
            </div>
          </section>

          <section v-if="currentTab === 'students'" class="view">
            <div class="view-header">
              <h3>Alunos</h3>
              <button class="primary-btn" @click="startNewStudent">Novo</button>
            </div>
            <div class="list">
              <div v-for="student in students" :key="student.id" class="list-item">
                <div>
                  <strong>{{ student.name }}</strong>
                  <p>{{ student.email }} · {{ student.phone }}</p>
                  <p>Historico: {{ student.history }}</p>
                </div>
                <div class="actions">
                  <button class="text-btn" @click="editStudent(student)">Editar</button>
                  <button class="text-btn danger" @click="removeStudent(student.id)">Remover</button>
                </div>
              </div>
            </div>

            <div class="form-card">
              <h4>{{ studentForm.id ? "Editar Aluno" : "Novo Aluno" }}</h4>
              <div class="form-grid">
                <label class="field">
                  <span>Nome</span>
                  <input type="text" v-model.trim="studentForm.name" />
                </label>
                <label class="field">
                  <span>Email</span>
                  <input type="email" v-model.trim="studentForm.email" />
                </label>
                <label class="field">
                  <span>Telefone</span>
                  <input type="text" v-model.trim="studentForm.phone" />
                </label>
                <label class="field">
                  <span>Historico</span>
                  <input type="text" v-model.trim="studentForm.history" />
                </label>
              </div>
              <div class="actions">
                <button class="primary-btn" @click="saveStudent">Salvar</button>
                <button class="text-btn" @click="resetStudentForm">Limpar</button>
              </div>
            </div>
          </section>

          <section v-if="currentTab === 'availability'" class="view">
            <div class="view-header">
              <h3>Horarios</h3>
              <button class="primary-btn" @click="startNewAvailability">Novo</button>
            </div>
            <div class="list">
              <div v-for="slot in availability" :key="slot.id" class="list-item">
                <div>
                  <strong>{{ slot.day }} · {{ slot.start }} - {{ slot.end }}</strong>
                  <p>{{ slot.status === "livre" ? "Disponivel" : "Bloqueado" }}</p>
                </div>
                <div class="actions">
                  <button class="text-btn" @click="toggleAvailability(slot.id)">
                    {{ slot.status === "livre" ? "Bloquear" : "Liberar" }}
                  </button>
                  <button class="text-btn danger" @click="removeAvailability(slot.id)">Remover</button>
                </div>
              </div>
            </div>

            <div class="form-card">
              <h4>Novo Horario</h4>
              <div class="form-grid">
                <label class="field">
                  <span>Dia</span>
                  <select v-model="availabilityForm.day">
                    <option disabled value="">Selecione</option>
                    <option v-for="day in weekDays" :key="day">{{ day }}</option>
                  </select>
                </label>
                <label class="field">
                  <span>Inicio</span>
                  <input type="time" v-model="availabilityForm.start" />
                </label>
                <label class="field">
                  <span>Fim</span>
                  <input type="time" v-model="availabilityForm.end" />
                </label>
              </div>
              <div class="actions">
                <button class="primary-btn" @click="saveAvailability">Salvar</button>
                <button class="text-btn" @click="resetAvailabilityForm">Limpar</button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
const STORAGE = {
  AUTH: "agenda_auth",
  TEACHER: "agenda_teacher",
  APPOINTMENTS: "agenda_appointments",
  SERVICES: "agenda_services",
  STUDENTS: "agenda_students",
  AVAILABILITY: "agenda_availability"
};

const seedTeacher = { name: "Prof. Ana Silva", email: "prof@escola.com" };
const seedServices = [
  { id: 1, name: "Aula de Matematica", description: "Reforco escolar", duration: 60, price: 120 },
  { id: 2, name: "Mentoria de Redacao", description: "Preparacao para vestibular", duration: 45, price: 90 },
  { id: 3, name: "Consultoria Pedagogica", description: "Planejamento individual", duration: 90, price: 200 }
];
const seedStudents = [
  { id: 1, name: "Lucas Mendes", email: "lucas@email.com", phone: "(11) 99999-1111", history: "3 aulas" },
  { id: 2, name: "Mariana Costa", email: "mariana@email.com", phone: "(11) 99999-2222", history: "5 aulas" },
  { id: 3, name: "Pedro Santos", email: "pedro@email.com", phone: "(11) 99999-3333", history: "1 aula" }
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(baseDate, days) {
  const dt = new Date(baseDate);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

const seedAppointments = [
  {
    id: 1,
    date: todayISO(),
    time: "09:00",
    studentId: 1,
    serviceId: 1,
    status: "confirmado"
  },
  {
    id: 2,
    date: todayISO(),
    time: "11:30",
    studentId: 2,
    serviceId: 2,
    status: "pendente"
  },
  {
    id: 3,
    date: addDays(todayISO(), 2),
    time: "14:00",
    studentId: 3,
    serviceId: 1,
    status: "confirmado"
  },
  {
    id: 4,
    date: addDays(todayISO(), 6),
    time: "16:30",
    studentId: 2,
    serviceId: 3,
    status: "cancelado"
  }
];
const seedAvailability = [
  { id: 1, day: "Segunda", start: "08:00", end: "12:00", status: "livre" },
  { id: 2, day: "Quarta", start: "14:00", end: "18:00", status: "livre" },
  { id: 3, day: "Sexta", start: "09:00", end: "13:00", status: "bloqueado" }
];

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

export default {
  data() {
    return {
      loginForm: {
        email: "",
        password: ""
      },
      loginError: "",
      showForgot: false,
      isAuthenticated: loadStorage(STORAGE.AUTH, false),
      currentTab: "dashboard",
      teacher: loadStorage(STORAGE.TEACHER, seedTeacher),
      services: loadStorage(STORAGE.SERVICES, seedServices),
      students: loadStorage(STORAGE.STUDENTS, seedStudents),
      appointments: loadStorage(STORAGE.APPOINTMENTS, seedAppointments),
      availability: loadStorage(STORAGE.AVAILABILITY, seedAvailability),
      dashboardStart: "",
      dashboardEnd: "",
      activeDashboardStart: "",
      activeDashboardEnd: "",
      activeDay: "",
      appointmentsFilter: {
        date: "",
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
        name: "",
        description: "",
        duration: 60,
        price: 100
      },
      studentForm: {
        id: null,
        name: "",
        email: "",
        phone: "",
        history: ""
      },
      availabilityForm: {
        day: "",
        start: "",
        end: ""
      },
      weekDays: ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"],
      showSidebar: false
    };
  },
  computed: {
    appointmentsDetailed() {
      return this.appointments.map((appt) => {
        const student = this.students.find((item) => item.id === appt.studentId);
        const service = this.services.find((item) => item.id === appt.serviceId);
        return {
          ...appt,
          studentName: student ? student.name : "Aluno",
          serviceName: service ? service.name : "Servico"
        };
      });
    },
    filteredAppointments() {
      return this.appointmentsDetailed.filter((appt) => {
        const matchesDate = this.appointmentsFilter.date
          ? appt.date === this.appointmentsFilter.date
          : true;
        const matchesStatus = this.appointmentsFilter.status
          ? appt.status === this.appointmentsFilter.status
          : true;
        return matchesDate && matchesStatus;
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
    }
  },
  created() {
    this.seedStorage();
  },
  methods: {
    seedStorage() {
      if (!localStorage.getItem(STORAGE.TEACHER)) saveStorage(STORAGE.TEACHER, seedTeacher);
      if (!localStorage.getItem(STORAGE.SERVICES)) saveStorage(STORAGE.SERVICES, seedServices);
      if (!localStorage.getItem(STORAGE.STUDENTS)) saveStorage(STORAGE.STUDENTS, seedStudents);
      if (!localStorage.getItem(STORAGE.APPOINTMENTS)) saveStorage(STORAGE.APPOINTMENTS, seedAppointments);
      if (!localStorage.getItem(STORAGE.AVAILABILITY)) saveStorage(STORAGE.AVAILABILITY, seedAvailability);
    },
    toggleSidebar() {
      this.showSidebar = !this.showSidebar;
    },
    goToTab(tab) {
      this.currentTab = tab;
      this.showSidebar = false;
    },
    handleLogin() {
      this.loginError = "";
      if (this.loginForm.email === "prof@escola.com" && this.loginForm.password === "123456") {
        this.isAuthenticated = true;
        saveStorage(STORAGE.AUTH, true);
        this.currentTab = "dashboard";
        this.loginForm.email = "";
        this.loginForm.password = "";
      } else {
        this.loginError = "Credenciais invalidas. Use prof@escola.com / 123456.";
      }
    },
    logout() {
      this.isAuthenticated = false;
      saveStorage(STORAGE.AUTH, false);
    },
    applyDashboardFilter() {
      this.activeDashboardStart = this.dashboardStart;
      this.activeDashboardEnd = this.dashboardEnd;
      this.activeDay = this.activeDashboardStart || todayISO();
    },
    openDaySchedule() {
      this.activeDay = this.activeDashboardStart || todayISO();
      this.currentTab = "daySchedule";
    },
    startNewAppointment() {
      this.resetAppointmentForm();
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
      this.resetAppointmentForm();
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
    startNewService() {
      this.resetServiceForm();
    },
    editService(service) {
      this.serviceForm = { ...service };
    },
    saveService() {
      if (!this.serviceForm.name) return;
      if (this.serviceForm.id) {
        this.services = this.services.map((item) =>
          item.id === this.serviceForm.id ? { ...this.serviceForm } : item
        );
      } else {
        this.services = [...this.services, { ...this.serviceForm, id: Date.now() }];
      }
      saveStorage(STORAGE.SERVICES, this.services);
      this.resetServiceForm();
    },
    removeService(id) {
      this.services = this.services.filter((item) => item.id !== id);
      saveStorage(STORAGE.SERVICES, this.services);
    },
    resetServiceForm() {
      this.serviceForm = {
        id: null,
        name: "",
        description: "",
        duration: 60,
        price: 100
      };
    },
    startNewStudent() {
      this.resetStudentForm();
    },
    editStudent(student) {
      this.studentForm = { ...student };
    },
    saveStudent() {
      if (!this.studentForm.name) return;
      if (this.studentForm.id) {
        this.students = this.students.map((item) =>
          item.id === this.studentForm.id ? { ...this.studentForm } : item
        );
      } else {
        this.students = [...this.students, { ...this.studentForm, id: Date.now() }];
      }
      saveStorage(STORAGE.STUDENTS, this.students);
      this.resetStudentForm();
    },
    removeStudent(id) {
      this.students = this.students.filter((item) => item.id !== id);
      saveStorage(STORAGE.STUDENTS, this.students);
    },
    resetStudentForm() {
      this.studentForm = {
        id: null,
        name: "",
        email: "",
        phone: "",
        history: ""
      };
    },
    startNewAvailability() {
      this.resetAvailabilityForm();
    },
    toggleAvailability(id) {
      this.availability = this.availability.map((slot) =>
        slot.id === id ? { ...slot, status: slot.status === "livre" ? "bloqueado" : "livre" } : slot
      );
      saveStorage(STORAGE.AVAILABILITY, this.availability);
    },
    removeAvailability(id) {
      this.availability = this.availability.filter((slot) => slot.id !== id);
      saveStorage(STORAGE.AVAILABILITY, this.availability);
    },
    saveAvailability() {
      if (!this.availabilityForm.day || !this.availabilityForm.start || !this.availabilityForm.end) return;
      const newSlot = {
        id: Date.now(),
        day: this.availabilityForm.day,
        start: this.availabilityForm.start,
        end: this.availabilityForm.end,
        status: "livre"
      };
      this.availability = [...this.availability, newSlot];
      saveStorage(STORAGE.AVAILABILITY, this.availability);
      this.resetAvailabilityForm();
    },
    resetAvailabilityForm() {
      this.availabilityForm = {
        day: "",
        start: "",
        end: ""
      };
    }
  }
};
</script>
