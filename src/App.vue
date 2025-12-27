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
        <button class="primary-btn" :disabled="authLoading" @click="handleLogin">
          {{ authLoading ? "Entrando..." : "Entrar" }}
        </button>
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
            <p v-if="appointmentsLoading" class="hint">Carregando agendamentos...</p>
            <p v-if="appointmentsError" class="error">{{ appointmentsError }}</p>
            <div class="filter-row">
              <label class="field small">
                <span>Data Inicio</span>
                <input type="date" v-model="appointmentsFilter.start" />
              </label>
              <label class="field small">
                <span>Data Fim</span>
                <input type="date" v-model="appointmentsFilter.end" />
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
            <div class="table-wrap" v-if="filteredAppointments.length">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Aluno</th>
                    <th>Servico</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appt in filteredAppointments" :key="appt.id">
                    <td>{{ appt.date }}</td>
                    <td>{{ appt.time }}</td>
                    <td>{{ appt.studentName }}</td>
                    <td>{{ appt.serviceName }}</td>
                    <td>
                      <span class="status" :class="appt.status">{{ appt.status }}</span>
                    </td>
                    <td>
                      <div class="actions">
                        <button class="text-btn" @click="editAppointment(appt)">Editar</button>
                        <button class="text-btn danger" @click="cancelAppointment(appt.id)">Cancelar</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="!filteredAppointments.length" class="hint">Nenhum agendamento encontrado.</p>
          </section>

          <div v-if="appointmentModalOpen" class="modal-overlay" @click.self="closeAppointmentModal">
            <div class="modal-card">
              <div class="view-header">
                <h4>{{ appointmentForm.id ? "Editar Agendamento" : "Novo Agendamento" }}</h4>
                <button class="text-btn" @click="closeAppointmentModal">Fechar</button>
              </div>
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
                      {{ service.titulo || service.name }}
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
          </div>

          <section v-if="currentTab === 'services'" class="view">
            <div class="view-header">
              <h3>Servicos</h3>
              <button class="primary-btn" @click="startNewService">Novo</button>
            </div>
            <p v-if="servicesLoading" class="hint">Carregando servicos...</p>
            <p v-if="servicesError" class="error">{{ servicesError }}</p>
            <div class="table-wrap" v-if="services.length">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Titulo</th>
                    <th>Descricao</th>
                    <th>Preco</th>
                    <th>Tempo</th>
                    <th>Tipo</th>
                    <th>Categoria</th>
                    <th>Imagem</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="service in services" :key="service.id">
                    <td>{{ service.titulo || "Servico" }}</td>
                    <td>{{ service.descricao }}</td>
                    <td>R$ {{ service.preco }}</td>
                    <td>{{ service.tempo_de_aula }} min</td>
                    <td>{{ service.tipo_agendamento }}</td>
                    <td>{{ service.categoria_id || "-" }}</td>
                    <td>
                      <img
                        v-if="service.imagem"
                        class="service-thumb"
                        :src="serviceImageUrl(service.imagem)"
                        alt="Imagem do servico"
                      />
                      <span v-else>-</span>
                    </td>
                    <td>
                      <div class="actions">
                        <button class="text-btn" @click="editService(service)">Editar</button>
                        <button class="text-btn danger" @click="removeService(service.id)">Excluir</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="!services.length && !servicesLoading" class="hint">Nenhum servico encontrado.</p>
          </section>

          <div v-if="serviceModalOpen" class="modal-overlay" @click.self="closeServiceModal">
            <div class="modal-card">
              <div class="view-header">
                <h4>{{ serviceForm.id ? "Editar Servico" : "Novo Servico" }}</h4>
                <button class="text-btn" @click="closeServiceModal">Fechar</button>
              </div>
              <p v-if="categoriesLoading" class="hint">Carregando categorias...</p>
              <p v-if="categoriesError" class="error">{{ categoriesError }}</p>
              <div class="form-grid">
                <label class="field">
                  <span>Titulo</span>
                  <input type="text" v-model.trim="serviceForm.titulo" />
                </label>
                <label class="field">
                  <span>Descricao</span>
                  <input type="text" v-model.trim="serviceForm.descricao" />
                </label>
                <label class="field">
                  <span>Preco (R$)</span>
                  <input type="number" v-model.number="serviceForm.preco" />
                </label>
                <label class="field">
                  <span>Tempo de Aula (min)</span>
                  <input type="number" v-model.number="serviceForm.tempo_de_aula" />
                </label>
                <label class="field">
                  <span>Tipo de Agendamento</span>
                  <select v-model="serviceForm.tipo_agendamento">
                    <option value="HORARIO">HORARIO</option>
                    <option value="DIA">DIA</option>
                  </select>
                </label>
                <label v-if="serviceForm.tipo_agendamento === 'DIA'" class="field">
                  <span>Vagas por dia</span>
                  <input type="number" v-model.number="serviceForm.vagas" min="1" />
                </label>
                <label class="field">
                  <span>Categoria ID</span>
                  <select v-model.number="serviceForm.categoria_id">
                    <option :value="''">Selecione</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.nome || cat.id }}
                    </option>
                  </select>
                </label>
                <label class="field">
                  <span>Imagem (URL)</span>
                  <input type="file" accept="image/*" @change="onServiceImageChange" />
                  <small class="hint">PNG/JPG ate 2MB.</small>
                </label>
              </div>
              <div class="actions">
                <button class="primary-btn" @click="saveService">Salvar</button>
                <button class="text-btn" @click="resetServiceForm">Limpar</button>
              </div>
            </div>
          </div>

          <section v-if="currentTab === 'students'" class="view">
            <div class="view-header">
              <h3>Alunos</h3>
              <button class="primary-btn" @click="startNewStudent">Novo</button>
            </div>
            <p v-if="studentsLoading" class="hint">Carregando alunos...</p>
            <p v-if="studentsError" class="error">{{ studentsError }}</p>
            <div class="table-wrap" v-if="studentsDetailed.length">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Data Nascimento</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in studentsDetailed" :key="student.id">
                    <td>{{ student.nome }}</td>
                    <td>{{ student.email }}</td>
                    <td>{{ student.telefone }}</td>
                    <td>{{ student.data_nascimento }}</td>
                    <td>
                      <div class="actions">
                        <button class="text-btn" @click="editStudent(student)">Editar</button>
                        <button class="text-btn danger" @click="removeStudent(student.id)">Excluir</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="!studentsDetailed.length" class="hint">Nenhum aluno encontrado.</p>
          </section>

          <div v-if="studentModalOpen" class="modal-overlay" @click.self="closeStudentModal">
            <div class="modal-card">
              <div class="view-header">
                <h4>{{ studentForm.id ? "Editar Aluno" : "Novo Aluno" }}</h4>
                <button class="text-btn" @click="closeStudentModal">Fechar</button>
              </div>
              <div class="form-grid">
                <label class="field">
                  <span>Primeiro Nome</span>
                  <input type="text" v-model.trim="studentForm.primeiro_nome" />
                </label>
                <label class="field">
                  <span>Ultimo Nome</span>
                  <input type="text" v-model.trim="studentForm.ultimo_nome" />
                </label>
                <label class="field">
                  <span>Email</span>
                  <input type="email" v-model.trim="studentForm.email" />
                </label>
                <label class="field">
                  <span>Telefone</span>
                  <input type="text" v-model.trim="studentForm.telefone" />
                </label>
                <label class="field">
                  <span>Data de Nascimento</span>
                  <input type="date" v-model="studentForm.data_nascimento" />
                </label>
                <label v-if="!studentForm.id" class="field">
                  <span>Senha</span>
                  <input type="password" v-model.trim="studentForm.password" />
                </label>
              </div>
              <div class="actions">
                <button class="primary-btn" @click="saveStudent">Salvar</button>
                <button class="text-btn" @click="resetStudentForm">Limpar</button>
              </div>
            </div>
          </div>

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
const API_BASE = "https://agendamento.rjpasseios.com.br/api";

const STORAGE = {
  TOKEN: "agenda_token",
  EMPRESA: "agenda_empresa_id",
  PROFESSOR: "agenda_professor_id",
  TEACHER: "agenda_teacher",
  APPOINTMENTS: "agenda_appointments",
  SERVICES: "agenda_services",
  STUDENTS: "agenda_students",
  AVAILABILITY: "agenda_availability"
};

const seedTeacher = { name: "Prof. Ana Silva", email: "prof@escola.com" };
const seedServices = [];
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
      isAuthenticated: Boolean(localStorage.getItem(STORAGE.TOKEN)),
      authLoading: false,
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
      availabilityForm: {
        day: "",
        start: "",
        end: ""
      },
      weekDays: ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado"],
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
    }
  },
  created() {
    this.seedStorage();
    if (this.isAuthenticated) {
      this.fetchServices();
      this.fetchCategories();
      this.fetchAppointments();
      this.fetchStudents();
    }
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
    logout() {
      this.isAuthenticated = false;
      localStorage.removeItem(STORAGE.TOKEN);
      localStorage.removeItem(STORAGE.EMPRESA);
      localStorage.removeItem(STORAGE.PROFESSOR);
    },
    authHeaders() {
      const token = localStorage.getItem(STORAGE.TOKEN);
      return token ? { Authorization: `Bearer ${token}` } : {};
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
      fetch(`/api/agendamento/empresa/${empresaId}`, {
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
      fetch(`/api/alunos/empresa/${empresaId}`, {
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
      const endpoint = empresaId ? `/api/servicos/empresa/${empresaId}` : "/api/servicos";
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
      fetch("/api/financeiro-categorias", {
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
      fetch(`/api/servicos/${id}`, {
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
      return `https://agendamento.rjpasseios.com.br/servico/${filename}`;
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
