<template>
  <div v-if="showSlotsModal" class="modal-overlay" @click.self="closeSlotsModal">
    <div class="modal-card">
      <div class="view-header">
        <h4>Horarios do servico</h4>
        <button class="text-btn" @click="closeSlotsModal">Fechar</button>
      </div>
      <div v-if="!selectedService" class="hint">Selecione um servico para ver horarios.</div>
      <div v-else>
        <div class="filter-row">
          <label class="field small">
            <span>Data</span>
            <input type="date" :value="clientScheduleDate" @input="setClientScheduleDate($event.target.value)" />
          </label>
          <label class="field small">
            <span>Empresa</span>
            <input type="text" :value="selectedCompanyLabel" disabled />
          </label>
          <label class="field small">
            <span>Servico</span>
            <input type="text" :value="selectedServiceLabel" disabled />
          </label>
        </div>
        <p v-if="clientAvailabilityLoading" class="hint">Carregando horarios...</p>
        <p v-if="clientAvailabilityError" class="error">{{ clientAvailabilityError }}</p>
        <div v-if="clientAvailableSlots.length" class="list slots-list">
          <div v-for="slot in clientAvailableSlots" :key="slot" class="list-item">
            <div>
              <strong>{{ slot }}</strong>
              <p>Disponivel</p>
            </div>
            <div class="actions">
              <button class="text-btn" @click="openCheckout(slot)">Agendar</button>
            </div>
          </div>
        </div>
        <p v-else class="hint">Nenhum horario disponivel.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClientSlotsModal",
  props: {
    showSlotsModal: {
      type: Boolean,
      required: true
    },
    selectedService: {
      type: Object,
      default: null
    },
    clientScheduleDate: {
      type: String,
      required: true
    },
    selectedCompanyLabel: {
      type: String,
      required: true
    },
    selectedServiceLabel: {
      type: String,
      required: true
    },
    clientAvailabilityLoading: {
      type: Boolean,
      required: true
    },
    clientAvailabilityError: {
      type: String,
      default: ""
    },
    clientAvailableSlots: {
      type: Array,
      required: true
    },
    setClientScheduleDate: {
      type: Function,
      required: true
    },
    openCheckout: {
      type: Function,
      required: true
    },
    closeSlotsModal: {
      type: Function,
      required: true
    }
  }
};
</script>

<style scoped>
.slots-list {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  max-height: 50vh;
  overflow-y: auto;
  padding-right: 6px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.slots-list .list-item {
  flex-direction: column;
  align-items: flex-start;
}

.slots-list .actions {
  width: 100%;
  justify-content: flex-end;
}
</style>
