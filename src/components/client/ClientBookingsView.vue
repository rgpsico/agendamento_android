<template>
  <section class="view client-bookings">
    <div class="view-header">
      <h3>📅 Meus Agendamentos</h3>
    </div>

    <div v-if="clientBookingsDetailed.length" class="bookings-container">
      <p class="bookings-count">
        {{ clientBookingsDetailed.length }} agendamento{{ clientBookingsDetailed.length > 1 ? 's' : '' }}
      </p>

      <div class="bookings-list">
        <div 
          v-for="booking in clientBookingsDetailed" 
          :key="booking.id" 
          class="booking-card"
          :class="booking.status"
        >
          <!-- Header do card -->
          <div class="booking-header">
            <div class="date-badge">
              <span class="date-icon">📆</span>
              <span class="date-text">{{ booking.dateLabel }}</span>
            </div>
            <span 
              class="status-badge" 
              :class="booking.status"
            >
              {{ getStatusLabel(booking.status) }}
            </span>
          </div>

          <!-- Informações principais -->
          <div class="booking-info">
            <div class="info-row">
              <span class="info-icon">🕐</span>
              <div class="info-content">
                <span class="info-label">Horário</span>
                <span class="info-value">{{ booking.time }}</span>
              </div>
            </div>

            <div class="info-row">
              <span class="info-icon">🏢</span>
              <div class="info-content">
                <span class="info-label">Empresa</span>
                <span class="info-value">{{ booking.companyName }}</span>
              </div>
            </div>

            <div class="info-row">
              <span class="info-icon">✂️</span>
              <div class="info-content">
                <span class="info-label">Serviço</span>
                <span class="info-value">{{ booking.serviceName }}</span>
              </div>
            </div>
          </div>

          <!-- Ações -->
          <div class="booking-actions">
            <button 
              class="cancel-btn" 
              @click="confirmCancel(booking)"
            >
              <span class="btn-icon">🗑️</span>
              Cancelar Agendamento
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="empty-icon">📅</span>
      <h4>Nenhum agendamento</h4>
      <p>Você ainda não tem horários agendados</p>
      <p class="empty-hint">Navegue pelos serviços disponíveis e faça seu primeiro agendamento</p>
    </div>

    <!-- Modal de Confirmação -->
    <div 
      v-if="showCancelModal" 
      class="modal-overlay" 
      @click.self="closeCancelModal"
    >
      <div class="cancel-modal">
        <div class="modal-icon">⚠️</div>
        <h4>Cancelar Agendamento?</h4>
        <p>Tem certeza que deseja cancelar este agendamento?</p>
        
        <div v-if="bookingToCancel" class="cancel-details">
          <div class="cancel-info">
            <strong>{{ bookingToCancel.dateLabel }} às {{ bookingToCancel.time }}</strong>
            <span>{{ bookingToCancel.serviceName }}</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="modal-btn cancel-confirm" @click="executeCancellation">
            Sim, cancelar
          </button>
          <button class="modal-btn cancel-close" @click="closeCancelModal">
            Não, manter
          </button>
        </div>
      </div>
    </div>
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
  },
  data() {
    return {
      showCancelModal: false,
      bookingToCancel: null
    };
  },
  methods: {
    getStatusLabel(status) {
      const statusMap = {
        'PENDING': '⏳ Pendente',
        'CONFIRMED': '✓ Confirmado',
        'RECEIVED': '✓ Pago',
        'CANCELLED': '✕ Cancelado',
        'COMPLETED': '✓ Concluído'
      };
      return statusMap[status] || status;
    },
    confirmCancel(booking) {
      this.bookingToCancel = booking;
      this.showCancelModal = true;
    },
    closeCancelModal() {
      this.showCancelModal = false;
      this.bookingToCancel = null;
    },
    executeCancellation() {
      if (this.bookingToCancel) {
        this.removeClientBooking(this.bookingToCancel.id);
        this.closeCancelModal();
      }
    }
  }
};
</script>

<style scoped>
.view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f9fafb;
}

.view-header {
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.view-header h3 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #1f2937;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bookings-container {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 20px;
}

.bookings-count {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-align: center;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.booking-card {
  background: white;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.booking-card:active {
  transform: scale(0.99);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Status colors */
.booking-card.CONFIRMED,
.booking-card.RECEIVED,
.booking-card.COMPLETED {
  border-left: 4px solid #10b981;
}

.booking-card.PENDING {
  border-left: 4px solid #f59e0b;
}

.booking-card.CANCELLED {
  border-left: 4px solid #ef4444;
  opacity: 0.7;
}

/* Header do card */
.booking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  gap: 12px;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 8px 14px;
  border-radius: 10px;
  flex: 1;
}

.date-icon {
  font-size: 18px;
}

.date-text {
  font-size: 14px;
  font-weight: 700;
  color: #1e40af;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.PENDING {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.CONFIRMED,
.status-badge.RECEIVED,
.status-badge.COMPLETED {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.CANCELLED {
  background: #fee2e2;
  color: #991b1b;
}

/* Informações */
.booking-info {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
}

/* Ações */
.booking-actions {
  padding: 12px 16px 16px;
  border-top: 1px solid #f3f4f6;
}

.cancel-btn {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 2px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.cancel-btn:active {
  background: #fef2f2;
  border-color: #dc2626;
  transform: scale(0.98);
}

.btn-icon {
  font-size: 16px;
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
  gap: 12px;
}

.empty-icon {
  font-size: 72px;
  opacity: 0.5;
  margin-bottom: 8px;
}

.empty-state h4 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.empty-state p {
  margin: 0;
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

.empty-hint {
  margin-top: 8px;
  font-size: 13px;
  color: #9ca3af;
  max-width: 280px;
}

/* Modal de Cancelamento */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.cancel-modal {
  background: white;
  border-radius: 20px;
  padding: 28px 24px 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  text-align: center;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.cancel-modal h4 {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
}

.cancel-modal > p {
  margin: 0 0 20px 0;
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

.cancel-details {
  background: #fef2f2;
  border: 2px solid #fecaca;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.cancel-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.cancel-info strong {
  font-size: 15px;
  font-weight: 700;
  color: #991b1b;
}

.cancel-info span {
  font-size: 14px;
  color: #dc2626;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.modal-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-confirm {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.cancel-confirm:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.cancel-close {
  background: #f3f4f6;
  color: #374151;
}

.cancel-close:active {
  transform: scale(0.98);
  background: #e5e7eb;
}

/* Responsivo */
@media (min-width: 640px) {
  .bookings-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .booking-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .cancel-btn:hover {
    background: #fef2f2;
    border-color: #dc2626;
  }

  .modal-btn:hover {
    opacity: 0.9;
  }
}

@media (min-width: 768px) {
  .bookings-container {
    padding: 32px;
  }

  .bookings-list {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .cancel-modal,
  .booking-card {
    animation: none;
  }

  * {
    transition: none !important;
  }
}
</style>