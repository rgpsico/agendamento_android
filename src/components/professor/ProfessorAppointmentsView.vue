<template>
  <section class="view">
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
  </section>
</template>

<script>
export default {
  name: "ProfessorAppointmentsView",
  props: {
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
    }
  }
};
</script>
