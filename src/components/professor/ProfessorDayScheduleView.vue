<template>
  <section class="view">
    <div class="view-header">
      <h3>Agendamentos do Dia</h3>
      <button class="text-btn" @click="goToTab('dashboard')">Voltar</button>
    </div>
    <p class="subtitle">{{ activeDayLabel }}</p>
    <div v-if="dayAppointments.length" class="list">
      <div v-for="appt in dayAppointments" :key="appt.id" class="list-item">
        <div>
          <strong>{{ appt.time }}</strong>
          <p>{{ appt.studentName }} - {{ appt.serviceName }}</p>
        </div>
        <span class="status" :class="appt.status">{{ appt.status }}</span>
      </div>
    </div>
    <p v-else class="hint">Nenhum agendamento encontrado.</p>
  </section>
</template>

<script>
export default {
  name: "ProfessorDayScheduleView",
  props: {
    activeDayLabel: {
      type: String,
      required: true
    },
    dayAppointments: {
      type: Array,
      required: true
    },
    goToTab: {
      type: Function,
      required: true
    }
  }
};
</script>
