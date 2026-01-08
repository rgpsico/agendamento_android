<template>
  <div v-if="showSlotsModal" class="modal-overlay" @click.self="closeSlotsModal">
    <div class="modal-card">
      <div class="view-header">
        <h4>Horários Disponíveis</h4>
        <button class="text-btn close-btn" @click="closeSlotsModal">
          <span class="close-icon">×</span>
        </button>
      </div>
      
      <div v-if="!selectedService" class="hint empty-state">
        <span class="empty-icon">📅</span>
        <p>Selecione um serviço para ver os horários disponíveis</p>
      </div>
      
      <div v-else class="content-wrapper">
        <div class="filter-section">
          <label class="field">
            <span class="field-label">Data</span>
            <input 
              type="date" 
              :value="clientScheduleDate" 
              @input="setClientScheduleDate($event.target.value)"
              class="date-input"
            />
          </label>
          
          <div class="selection-info">
            <div class="info-item">
              <span class="info-label">Empresa</span>
              <span class="info-value">{{ selectedCompanyLabel }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Serviço</span>
              <span class="info-value">{{ selectedServiceLabel }}</span>
            </div>
          </div>
        </div>

        <div class="slots-section">
          <p v-if="clientAvailabilityLoading" class="loading-state">
            <span class="spinner"></span>
            Carregando horários...
          </p>
          
          <p v-if="clientAvailabilityError" class="error-state">
            {{ clientAvailabilityError }}
          </p>
          
          <div v-if="clientAvailableSlots.length" class="slots-grid">
            <button 
              v-for="slot in clientAvailableSlots" 
              :key="slot" 
              class="slot-card"
              @click="openCheckout(slot)"
            >
              <span class="slot-time">{{ slot }}</span>
              <span class="slot-status">Disponível</span>
            </button>
          </div>
          
          <div v-else-if="!clientAvailabilityLoading && !clientAvailabilityError" class="empty-state">
            <span class="empty-icon">🕐</span>
            <p>Nenhum horário disponível para esta data</p>
          </div>
        </div>
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
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding: 0;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: white;
  width: 100%;
  max-width: 100%;
  max-height: 90vh;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 20px 20px 0 0;
}

.view-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  padding: 4px;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 0.2s;
}

.close-btn:active {
  background: #f3f4f6;
}

.close-icon {
  font-size: 28px;
  line-height: 1;
  color: #6b7280;
}

.content-wrapper {
  overflow-y: auto;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.filter-section {
  padding: 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.date-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  color: #111827;
  transition: all 0.2s;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.selection-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.slots-section {
  padding: 20px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #6b7280;
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  padding: 16px;
  background: #fef2f2;
  color: #dc2626;
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
  border: 1px solid #fecaca;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.slot-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 80px;
  justify-content: center;
}

.slot-card:active {
  transform: scale(0.97);
  border-color: #3b82f6;
  background: #eff6ff;
}

.slot-time {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.slot-status {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-state p {
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.hint {
  padding: 20px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

/* Tablets e telas maiores */
@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
    padding: 20px;
  }

  .modal-card {
    max-width: 600px;
    max-height: 85vh;
    border-radius: 20px;
  }

  .view-header {
    border-radius: 20px 20px 0 0;
  }

  .slots-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .slot-card:hover {
    border-color: #3b82f6;
    background: #eff6ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .slot-card:active {
    transform: translateY(0);
  }
}

/* Melhorias de acessibilidade */
@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-card,
  .slot-card,
  .spinner {
    animation: none;
  }

  .slot-card {
    transition: none;
  }
}
</style>