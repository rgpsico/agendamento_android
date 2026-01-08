<template>
  <section class="view client-bookings">
    <div class="view-header">
      <h3>Meus Horarios</h3>
    </div>
    <div v-if="clientBookingsDetailed.length" class="list">
      <div v-for="booking in clientBookingsDetailed" :key="booking.id" class="list-item">
        <div>
          <strong>{{ booking.time }} - {{ booking.dateLabel }}</strong>
          <p>{{ booking.companyName }} | {{ booking.serviceName }}</p>
        </div>
        <div class="actions">
          <span class="status" :class="booking.status">{{ booking.status }}</span>
          <button class="text-btn danger" @click="removeClientBooking(booking.id)">Cancelar</button>
        </div>
      </div>
    </div>
    <p v-else class="hint">Nenhum horario agendado.</p>
  </section>
</template>

<script>
export default {
  name: "ClientBookingsView",
  props: {
    clientBookingsDetailed: {
      type: Array,
      required: true
    },
    removeClientBooking: {
      type: Function,
      required: true
    }
  }
};
</script>
