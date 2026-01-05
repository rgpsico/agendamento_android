<template>
  <div class="app-layout">
    <div v-if="showSidebar" class="sidebar-backdrop" @click="closeSidebar"></div>
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
              <input type="date" :value="dashboardStart" @input="setDashboardStart($event.target.value)" />
            </label>
            <label class="field small">
              <span>Data Final</span>
              <input type="date" :value="dashboardEnd" @input="setDashboardEnd($event.target.value)" />
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
            <button class="text-btn" @click="goToTab('dashboard')">Voltar</button>
          </div>
          <p class="subtitle">{{ activeDayLabel }}</p>
          <div v-if="dayAppointments.length" class="list">
            <div v-for="appt in dayAppointments" :key="appt.id" class="list-item">
              <div>
                <strong>{{ appt.time }}</strong>
                <p>{{ appt.studentName }} Жњ {{ appt.serviceName }}</p>
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
            <h3>Disponibilidade</h3>
            <button class="primary-btn" @click="fetchAvailability">Buscar</button>
          </div>
          <div class="filter-row">
            <label class="field small">
              <span>Data</span>
              <input type="date" v-model="availabilityQuery.date" />
            </label>
            <label class="field small">
              <span>Servico</span>
              <select v-model="availabilityQuery.serviceId">
                <option disabled value="">Selecione</option>
                <option v-for="service in services" :key="service.id" :value="service.id">
                  {{ service.titulo || service.name || "Servico" }}
                </option>
              </select>
            </label>
            <label class="field small">
              <span>Dia da semana</span>
              <input type="text" :value="availabilityDayLabel" disabled />
            </label>
            <label class="field small">
              <span>Mostrar</span>
              <select :value="availabilityMode" @change="setAvailabilityMode($event.target.value)">
                <option value="available">Disponiveis</option>
                <option value="booked">Contratados</option>
                <option value="all">Todos</option>
              </select>
            </label>
          </div>
          <p v-if="availabilityLoading" class="hint">Carregando disponibilidade...</p>
          <p v-if="availabilityError" class="error">{{ availabilityError }}</p>
          <div v-if="availabilityMode !== 'booked' && availabilitySlots.length" class="list">
            <div v-for="slot in availabilitySlots" :key="slot" class="list-item">
              <div>
                <strong>{{ slot }}</strong>
                <p>Disponivel</p>
              </div>
            </div>
          </div>
          <p v-if="contractedLoading" class="hint">Carregando horarios contratados...</p>
          <p v-if="contractedError" class="error">{{ contractedError }}</p>
          <div v-if="availabilityMode !== 'available' && contractedSlots.length" class="list">
            <div v-for="slot in contractedSlots" :key="slot.key" class="list-item">
              <div>
                <strong>{{ slot.time }}</strong>
                <p>{{ slot.label }}</p>
              </div>
            </div>
          </div>
          <p v-else-if="availabilityMode === 'available' && !availabilityLoading" class="hint">
            Nenhum horario disponivel.
          </p>
          <p v-else-if="availabilityMode === 'booked' && !contractedLoading" class="hint">
            Nenhum horario contratado.
          </p>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfessorPortal",
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
