<template>
  <section class="view client-bookings">
    <div class="view-header">
      <h3>📅 Meus Agendamentos</h3>
    </div>

      <p v-if="cancelFeedback" class="feedback" :class="cancelFeedback.type">
        {{ cancelFeedback.message }}
      </p>

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
            <button class="waitlist-btn" type="button" @click="openWaitlist(booking)" v-if="isTodayBooking(booking)">
              <span class="btn-icon">
                <svg viewBox="0 0 24 24" class="waitlist-icon" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
                  <path d="M12 7v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              Lista de espera
            </button>
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
  
    <!-- Modal de Lista de Espera -->
    <div
      v-if="showWaitlistModal"
      class="modal-overlay"
      @click.self="closeWaitlistModal"
    >
      <div class="waitlist-modal">
        <div class="modal-icon">
          <svg viewBox="0 0 24 24" class="waitlist-icon modal-icon-svg" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" />
            <path d="M12 7v6l4 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h4>Lista de espera</h4>
        <p v-if="waitlistBooking">
          Agendamentos do dia {{ waitlistBooking.dateLabel || "-" }}
        </p>
  
        <p v-if="waitlistLoading" class="hint">Carregando lista de espera...</p>
        <p v-if="waitlistError" class="error">{{ waitlistError }}</p>

        <div v-if="!waitlistLoading && !waitlistError && waitlistMeta" class="waitlist-summary">
          <div class="summary-item">
            <span class="summary-label">Sua posicao</span>
            <span class="summary-value">#{{ waitlistMeta.position }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Pessoas na sua frente</span>
            <span class="summary-value">{{ waitlistMeta.peopleAhead }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Tempo estimado</span>
            <span class="summary-value">{{ formatMinutes(waitlistMeta.estimatedMinutes) }}</span>
          </div>
        </div>
  
        <div v-if="!waitlistLoading && !waitlistError && waitlistQueue.length" class="waitlist-list">
          <div
            v-for="(item, index) in waitlistQueue"
            :key="item.id"
            class="waitlist-row"
            :class="{ highlight: waitlistBooking && item.id === waitlistBooking.id }"
          >
            <span class="waitlist-position">{{ index + 1 }}</span>
            <div class="waitlist-info">
              <span class="waitlist-name">
                {{
                  item.id === waitlistBooking?.id
                    ? (clientProfile?.nome || "Voce")
                    : (item.studentName || "Pessoa na fila")
                }}
              </span>
              <span class="waitlist-time">{{ item.time || "-" }}</span>
            </div>
          </div>
        </div>
  
        <p v-if="!waitlistLoading && !waitlistError && !waitlistQueue.length" class="hint">
          Nenhum agendamento encontrado para o dia.
        </p>
  
        <div class="modal-actions">
          <button class="modal-btn cancel-close" @click="closeWaitlistModal">
            Fechar
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
    clientProfile: {
      type: Object,
      required: true
    },
    fetchWaitlistQueue: {
      type: Function,
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
      bookingToCancel: null,
      showWaitlistModal: false,
      waitlistBooking: null,
      waitlistQueue: [],
      waitlistMeta: null,
      waitlistLoading: false,
      waitlistError: "",
      cancelFeedback: null,
      cancelFeedbackTimeout: null
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
    async executeCancellation() {
      if (this.bookingToCancel) {
        const success = await this.removeClientBooking(this.bookingToCancel.id);
        this.setCancelFeedback(
          success ? "success" : "error",
          success ? "Cancelado com sucesso." : "Erro ao cancelar agendamento."
        );
        this.closeCancelModal();
      }
    },
    async openWaitlist(booking) {
      this.waitlistBooking = booking;
      this.waitlistQueue = [];
      this.waitlistMeta = null;
      this.waitlistError = "";
      this.waitlistLoading = true;
      this.showWaitlistModal = true;
      try {
        const queue = await this.fetchWaitlistQueue(booking);
        this.waitlistQueue = this.buildWaitlistQueue(booking, queue);
        this.waitlistMeta = this.buildWaitlistMeta(booking, this.waitlistQueue);
      } catch (error) {
        this.waitlistError = error?.message || "Erro ao carregar lista de espera.";
      } finally {
        this.waitlistLoading = false;
      }
    },
    setCancelFeedback(type, message) {
      this.cancelFeedback = { type, message };
      if (this.cancelFeedbackTimeout) {
        clearTimeout(this.cancelFeedbackTimeout);
      }
      this.cancelFeedbackTimeout = setTimeout(() => {
        this.cancelFeedback = null;
        this.cancelFeedbackTimeout = null;
      }, 4000);
    },
    closeWaitlistModal() {
      this.showWaitlistModal = false;
      this.waitlistBooking = null;
      this.waitlistQueue = [];
      this.waitlistMeta = null;
      this.waitlistError = "";
      this.waitlistLoading = false;
    },
    buildWaitlistQueue(booking, queueItems) {
      const targetDate = booking.date || "";
      const targetServiceId = booking.serviceId || "";
      const targetCompanyId = booking.companyId || "";
      const queue = (queueItems || []).filter((item) => {
        if (targetDate && item.date && item.date !== targetDate) return false;
        if (targetServiceId && item.serviceId && String(item.serviceId) !== String(targetServiceId)) {
          return false;
        }
        if (targetCompanyId && item.companyId && String(item.companyId) !== String(targetCompanyId)) {
          return false;
        }
        return true;
      });
      return queue
        .map((item) => ({
          ...item,
          _timeValue: this.timeToMinutes(item.time)
        }))
        .sort((a, b) => a._timeValue - b._timeValue);
    },
    buildWaitlistMeta(booking, queue) {
      const positionIndex = queue.findIndex((item) => item.id === booking.id);
      const position = positionIndex >= 0 ? positionIndex + 1 : queue.length + 1;
      const peopleAhead = positionIndex >= 0 ? positionIndex : queue.length;
      const duration = this.getBookingDuration(booking);
      const estimatedMinutes = Math.max(peopleAhead * duration, 0);
      return { position, peopleAhead, estimatedMinutes };
    },
    getBookingDuration(booking) {
      const raw =
        booking.serviceDuration ||
        booking.tempo_de_aula ||
        booking.duracao ||
        20;
      const duration = Number(raw);
      return Number.isFinite(duration) && duration > 0 ? duration : 20;
    },
    timeToMinutes(time) {
      if (!time || typeof time !== "string") return 9999;
      const parts = time.split(":");
      if (parts.length < 2) return 9999;
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 9999;
      return hours * 60 + minutes;
    },
    formatMinutes(totalMinutes) {
      if (!Number.isFinite(totalMinutes)) return "-";
      if (totalMinutes < 60) return `${totalMinutes} min`;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
    },
    isTodayBooking(booking) {
      if (!booking?.date) return false;
      const today = new Date().toISOString().slice(0, 10);
      return booking.date === today;
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

.feedback {
  margin: 12px 20px 0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.feedback.success {
  background: #ecfdf3;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.feedback.error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.error {
  margin: 10px 20px 0;
  color: #b91c1c;
  font-weight: 600;
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.waitlist-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #bfdbfe;
  border-radius: 10px;
  color: #1d4ed8;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.waitlist-btn:active {
  transform: scale(0.98);
  background: #dbeafe;
  border-color: #93c5fd;
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

.waitlist-icon {
  width: 16px;
  height: 16px;
  display: block;
}

.modal-icon-svg {
  width: 56px;
  height: 56px;
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

.waitlist-modal {
  background: white;
  border-radius: 20px;
  padding: 28px 24px 24px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: scaleIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  text-align: center;
}

.waitlist-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 20px 0;
}

.summary-item {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 12px 8px;
}

.summary-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  display: block;
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin-top: 6px;
}

.waitlist-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

.waitlist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.waitlist-row.highlight {
  border-color: #60a5fa;
  background: #eff6ff;
}

.waitlist-position {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  color: #374151;
}

.waitlist-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.waitlist-name {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.waitlist-time {
  font-size: 12px;
  color: #6b7280;
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

  .waitlist-btn:hover {
    background: #dbeafe;
    border-color: #60a5fa;
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
  .waitlist-modal,
  .booking-card {
    animation: none;
  }

  * {
    transition: none !important;
  }
}
</style>
