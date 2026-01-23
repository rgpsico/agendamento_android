<template>
  <section class="availability-view">
    <!-- Header -->
    <div class="view-header">
      <div>
        <h3 class="view-title">Disponibilidade de Horários</h3>
        <p class="view-subtitle">Gerencie e visualize os horários disponíveis e contratados</p>
      </div>
      <div class="view-actions">
        <button
          class="secondary-btn add-slot-btn"
          @click="openAddSlot"
          :disabled="!canSearch"
          :class="{ disabled: !canSearch }"
        >
          Adicionar horario
        </button>
        <button 
                class="primary-btn" 
                @click="fetchAvailability"
                :disabled="!canSearch"
                :class="{ disabled: !canSearch }"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                Buscar Horários
              </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filters-grid">
        <label class="field">
          <span class="field-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Data
          </span>
          <input 
            type="date" 
            v-model="availabilityQuery.date"
            class="field-input"
            :class="{ 'field-required': !availabilityQuery.date }"
          />
        </label>

        <label class="field">
          <span class="field-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            Serviço
          </span>
          <select 
            v-model="availabilityQuery.serviceId"
            class="field-input"
            :class="{ 'field-required': !availabilityQuery.serviceId }"
          >
            <option disabled value="">Selecione um serviço</option>
            <option v-for="service in services" :key="service.id" :value="service.id">
              {{ service.titulo || service.name || "Serviço" }}
            </option>
          </select>
        </label>

        <label class="field">
          <span class="field-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Dia da Semana
          </span>
          <input 
            type="text" 
            :value="availabilityDayLabel || 'Selecione uma data'" 
            disabled
            class="field-input field-disabled"
          />
        </label>

        <label class="field">
          <span class="field-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Mostrar
          </span>
          <select 
            :value="availabilityMode" 
            @change="setAvailabilityMode($event.target.value)"
            class="field-input"
          >
            <option value="available">Apenas Disponíveis</option>
            <option value="booked">Apenas Contratados</option>
            <option value="all">Todos os Horários</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Loading States -->
    <div v-if="availabilityLoading || contractedLoading" class="loading-container">
      <div class="skeleton-list">
        <div v-for="i in 6" :key="i" class="skeleton-item">
          <div class="skeleton-line skeleton-time"></div>
          <div class="skeleton-line skeleton-status"></div>
        </div>
      </div>
    </div>

    <!-- Error States -->
    <div v-if="availabilityError || contractedError" class="error-container">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p class="error-message">{{ availabilityError || contractedError }}</p>
    </div>

    <!-- Results -->
    <div v-if="!availabilityLoading && !contractedLoading && !availabilityError && !contractedError">
      <!-- Available Slots -->
      <div v-if="(availabilityMode === 'available' || availabilityMode === 'all') && availableSlotsToShow.length" class="slots-section">
        <div class="section-header">
          <h4 class="section-title">
            <span class="badge badge-available">Disponíveis</span>
            {{ availableSlotsToShow.length }} {{ availableSlotsToShow.length === 1 ? 'horário' : 'horários' }}
          </h4>
        </div>
        <div class="slots-grid">
          <div v-for="slot in availableSlotsToShow" :key="slot" class="slot-card available">
            <div class="slot-time">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ slot }}
            </div>
            <div class="slot-status">
              <span class="status-dot available"></span>
              Disponível para agendamento
            </div>
          </div>
        </div>
      </div>

      <!-- Contracted Slots -->
      <div v-if="(availabilityMode === 'booked' || availabilityMode === 'all') && contractedSlots.length" class="slots-section">
        <div class="section-header">
          <h4 class="section-title">
            <span class="badge badge-booked">Contratados</span>
            {{ contractedSlots.length }} {{ contractedSlots.length === 1 ? 'horário' : 'horários' }}
          </h4>
        </div>
        <div class="slots-grid">
          <div
            v-for="slot in contractedSlots"
            :key="slot.key"
            class="slot-card booked"
            :class="{ clickable: slot.studentId }"
            @click="openChatFromSlot(slot)"
          >
            <div class="slot-time">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {{ slot.time }}
            </div>
            <div class="slot-status">
              <span class="status-dot booked"></span>
              {{ slot.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Empty States -->
      <div v-if="showEmptyState" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <h4 class="empty-title">{{ emptyStateTitle }}</h4>
        <p class="empty-description">{{ emptyStateDescription }}</p>
      </div>
    </div>
    <div v-if="addSlotOpen" class="modal-overlay" @click.self="closeAddSlot">
      <div class="modal-card add-slot-modal">
        <div class="view-header">
          <div>
            <h4>Adicionar horario</h4>
            <p class="view-subtitle">Data selecionada: {{ availabilityQuery.date || "-" }}</p>
          </div>
          <button class="text-btn" @click="closeAddSlot">Fechar</button>
        </div>
        <label class="field">
          <span class="field-label">Horario</span>
          <input type="time" v-model="newSlotTime" class="field-input" />
        </label>
        <p v-if="addSlotError" class="error-message">{{ addSlotError }}</p>
        <div class="actions">
          <button class="primary-btn" @click="confirmAddSlot" :disabled="!canSearch">Adicionar</button>
          <button class="secondary-btn" @click="closeAddSlot">Cancelar</button>
        </div>
      </div>
    </div>

    <div v-if="chatModalOpen" class="modal-overlay" @click.self="closeChatModal">
      <div class="modal-card chat-modal">
        <div class="view-header">
          <div>
            <h4>Conversar com {{ chatStudentName }}</h4>
            <p class="view-subtitle">Mensagens diretas com o cliente.</p>
          </div>
          <button class="text-btn" @click="closeChatModal">Fechar</button>
        </div>

        <div class="chat-box">
          <p v-if="chatLoading" class="hint">Carregando conversa...</p>
          <p v-else-if="chatError" class="error">{{ chatError }}</p>
          <p v-else-if="!chatMessages.length" class="hint">Nenhuma mensagem ainda.</p>
          <div
            v-for="(msg, index) in chatMessages"
            :key="index"
            class="chat-message"
            :class="msg.from === 'me' ? 'outgoing' : 'incoming'"
          >
            <span class="chat-text">{{ msg.text }}</span>
            <span class="chat-time">{{ msg.time }}</span>
          </div>
        </div>

        <form class="chat-input" @submit.prevent="sendChatMessage">
          <input v-model="chatDraft" type="text" placeholder="Digite sua mensagem" />
          <button class="primary-btn" type="submit" :disabled="!chatDraft.trim()">Enviar</button>
        </form>
      </div>
    </div>

  </section>
</template>

<script>
const PROD_API_BASE = "https://agendamento.rjpasseios.com.br";
const ENV_API_BASE = process.env.VUE_APP_API_BASE;
const API_BASE = ENV_API_BASE || PROD_API_BASE;

const STORAGE = {
  TOKEN: "agenda_token",
  EMPRESA: "agenda_empresa_id",
  PROFESSOR: "agenda_professor_id"
};

function authHeaders() {
  const token = localStorage.getItem(STORAGE.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveEmpresaId() {
  return localStorage.getItem(STORAGE.EMPRESA) || localStorage.getItem(STORAGE.PROFESSOR) || "";
}

function resolveProfessorId() {
  return localStorage.getItem(STORAGE.PROFESSOR) || "";
}

function normalizeSender(from) {
  if (!from) return "";
  const value = String(from).toLowerCase();
  if (value === "me" || value === "professor" || value === "teacher") return "me";
  if (value === "aluno" || value === "student" || value === "cliente") return "student";
  return "";
}

function formatMessageTime(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function extractMessages(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.last_message) return [payload.last_message];
  if (Array.isArray(payload.messages)) return payload.messages;
  if (Array.isArray(payload.mensagens)) return payload.mensagens;
  if (Array.isArray(payload.conversation?.messages)) return payload.conversation.messages;
  if (Array.isArray(payload.conversation?.mensagens)) return payload.conversation.mensagens;
  if (Array.isArray(payload.conversa?.mensagens)) return payload.conversa.mensagens;
  if (Array.isArray(payload.data?.messages)) return payload.data.messages;
  if (Array.isArray(payload.data?.mensagens)) return payload.data.mensagens;
  return [];
}

function normalizeMessages(messages) {
  const professorId = resolveProfessorId();
  return messages
    .map((msg) => {
      const text = msg.text || msg.mensagem || msg.message || msg.conteudo || msg.body || "";
      const time = formatMessageTime(msg.time || msg.hora || msg.created_at || msg.data_hora);
      const from =
        normalizeSender(msg.from || msg.remetente || msg.autor) ||
        (String(
          msg.user_id ||
            msg.remetente_id ||
            msg.sender_id ||
            msg.usuario_id ||
            msg.author_id ||
            ""
        ) === String(professorId)
          ? "me"
          : "student");
      if (!text) return null;
      return { from, text, time };
    })
    .filter(Boolean);
}

function extractConversationId(payload) {
  if (!payload) return "";
  return (
    payload.conversation_id ||
    payload.conversation?.id ||
    payload.conversa?.id ||
    payload.data?.conversation_id ||
    payload.data?.conversation?.id ||
    ""
  );
}

export default {
  name: "ProfessorAvailabilityView",
  props: {
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
    services: {
      type: Array,
      required: true
    },
    fetchAvailability: {
      type: Function,
      required: true
    },
    setAvailabilityMode: {
      type: Function,
      required: true
    }
  },
  computed: {
    canSearch() {
      return this.availabilityQuery.date && this.availabilityQuery.serviceId;
    },
    availableSlotsToShow() {
      const combined = [...this.availabilitySlots, ...this.pendingSlots].filter(Boolean);
      const unique = Array.from(new Set(combined));
      return unique.sort((a, b) => this.timeToMinutes(a) - this.timeToMinutes(b));
    },
    hasAvailableSlots() {
      return this.availableSlotsToShow.length > 0;
    },
    hasBookedSlots() {
      return this.contractedSlots.length > 0;
    },
    showEmptyState() {
      if (this.availabilityMode === 'available') {
        return !this.hasAvailableSlots;
      } else if (this.availabilityMode === 'booked') {
        return !this.hasBookedSlots;
      } else if (this.availabilityMode === 'all') {
        return !this.hasAvailableSlots && !this.hasBookedSlots;
      }
      return false;
    },

    emptyStateTitle() {
      if (this.availabilityMode === 'available') {
        return 'Nenhum horário disponível';
      } else if (this.availabilityMode === 'booked') {
        return 'Nenhum horário contratado';
      }
      return 'Nenhum horário encontrado';
    },
    emptyStateDescription() {
      if (!this.availabilityQuery.date || !this.availabilityQuery.serviceId) {
        return 'Selecione uma data e um serviço para buscar os horários.';
      }
      if (this.availabilityMode === 'available') {
        return 'Não há horários disponíveis para a data e serviço selecionados.';
      } else if (this.availabilityMode === 'booked') {
        return 'Não há horários contratados para a data e serviço selecionados.';
      }
      return 'Tente ajustar os filtros de busca.';
    },
    chatStudentName() {
      return this.chatStudent ? this.chatStudent.nome : "";
    },
    chatMessages() {
      if (!this.chatStudent) return [];
      return this.chatMessagesByStudent[this.chatStudent.id] || [];
    }
  },
  data() {
    return {
      addSlotOpen: false,
      newSlotTime: "",
      addSlotError: "",
      pendingSlots: [],
      chatModalOpen: false,
      chatStudent: null,
      chatDraft: "",
      chatMessagesByStudent: {},
      chatConversationIdByStudent: {},
      chatLoading: false,
      chatError: ""
    };
  },
  watch: {
    "availabilityQuery.date"() {
      this.resetPendingSlots();
    },
    "availabilityQuery.serviceId"() {
      this.resetPendingSlots();
    }
  },
  methods: {
    openAddSlot() {
      this.addSlotError = "";
      this.addSlotOpen = true;
    },
    closeAddSlot() {
      this.addSlotOpen = false;
      this.newSlotTime = "";
      this.addSlotError = "";
    },
    confirmAddSlot() {
      if (!this.canSearch) {
        this.addSlotError = "Selecione data e servico primeiro.";
        return;
      }
      const time = this.normalizeTime(this.newSlotTime);
      if (!time) {
        this.addSlotError = "Informe um horario valido (HH:MM).";
        return;
      }
      const existing = new Set([...this.availabilitySlots, ...this.pendingSlots]);
      if (existing.has(time)) {
        this.addSlotError = "Este horario ja existe na lista.";
        return;
      }
      this.pendingSlots = [...this.pendingSlots, time];
      this.closeAddSlot();
    },
    normalizeTime(value) {
      if (!value) return "";
      const match = String(value).match(/^(\d{2}):(\d{2})$/);
      if (!match) return "";
      const hours = Number(match[1]);
      const minutes = Number(match[2]);
      if (hours > 23 || minutes > 59) return "";
      return `${match[1]}:${match[2]}`;
    },
    timeToMinutes(value) {
      if (!value) return 0;
      const match = String(value).match(/^(\d{2}):(\d{2})$/);
      if (!match) return 0;
      return Number(match[1]) * 60 + Number(match[2]);
    },
    resetPendingSlots() {
      this.pendingSlots = [];
    },

    openChatFromSlot(slot) {
      if (!slot || !slot.studentId) return;
      this.chatStudent = {
        id: slot.studentId,
        nome: slot.studentName || "Cliente"
      };
      this.chatModalOpen = true;
      this.chatError = "";
      this.fetchConversation(slot.studentId);
    },
    closeChatModal() {
      this.chatModalOpen = false;
      this.chatDraft = "";
    },
    fetchConversation(studentId) {
      const empresaId = resolveEmpresaId();
      if (!studentId || !empresaId) {
        this.chatError = "Professor nao encontrado.";
        return;
      }
      this.chatLoading = true;
      const params = new URLSearchParams({
        empresa_id: empresaId,
        user_id: String(studentId)
      });
      const professorId = resolveProfessorId();
      if (professorId) {
        params.set("professor_id", professorId);
      }
      fetch(`${API_BASE}/api/conversations?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar conversa.");
          }
          const conversation = Array.isArray(data) ? data[0] : data;
          const conversationId = extractConversationId(conversation);
          if (conversationId) {
            this.$set(this.chatConversationIdByStudent, studentId, conversationId);
          }
          const normalized = normalizeMessages(extractMessages(conversation));
          this.$set(this.chatMessagesByStudent, studentId, normalized);
        })
        .catch((error) => {
          this.chatError = error.message || "Erro ao carregar conversa.";
          if (!this.chatMessagesByStudent[studentId]) {
            this.$set(this.chatMessagesByStudent, studentId, []);
          }
        })
        .finally(() => {
          this.chatLoading = false;
        });
    },
    sendChatMessage() {
      const message = this.chatDraft.trim();
      if (!message || !this.chatStudent) return;

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const studentId = this.chatStudent.id;
      const existing = this.chatMessagesByStudent[studentId] || [];
      this.chatMessagesByStudent[studentId] = [...existing, { from: "me", text: message, time }];
      this.chatDraft = "";

      const payload = {
        mensagem: message,
        aluno_user_id: studentId
      };
      const conversationId = this.chatConversationIdByStudent[studentId];
      if (conversationId) {
        payload.conversation_id = conversationId;
      }
      const professorId = resolveProfessorId();
      if (professorId) {
        payload.professor_user_id = professorId;
      }
      const empresaId = resolveEmpresaId();
      if (empresaId) {
        payload.empresa_id = empresaId;
      }

      fetch(`${API_BASE}/api/conversations/professor/mensagem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        },
        body: JSON.stringify(payload)
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Erro ao enviar mensagem.");
          }
          const newConversationId = extractConversationId(data);
          if (newConversationId) {
            this.$set(this.chatConversationIdByStudent, studentId, newConversationId);
          }
        })
        .catch((error) => {
          this.chatError = error.message || "Erro ao enviar mensagem.";
        });
    }
}
};
</script>

<style scoped>
.availability-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header */
.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

.view-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}

.view-title {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.view-subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.primary-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.primary-btn:hover:not(.disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.primary-btn.disabled {
  background: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.add-slot-modal .actions {
  justify-content: flex-end;
}

/* Filters */
.filters-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.field-input {
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.field-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.field-input.field-required {
  border-color: #fbbf24;
  background: #fffbeb;
}

.field-disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

/* Loading */
.loading-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-list {
  display: grid;
  gap: 12px;
}

.skeleton-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.skeleton-line {
  height: 16px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-time {
  width: 80px;
  height: 20px;
}

.skeleton-status {
  width: 140px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Error */
.error-container {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  color: #dc2626;
}

.error-container svg {
  margin-bottom: 12px;
}

.error-message {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

/* Slots Section */
.slots-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-available {
  background: #d1fae5;
  color: #065f46;
}

.badge-booked {
  background: #dbeafe;
  color: #1e40af;
}

/* Slots Grid */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.slot-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.2s;
  border: 2px solid;
}

.slot-card.available {
  background: #f0fdf4;
  border-color: #86efac;
}

.slot-card.available:hover {
  background: #dcfce7;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.slot-card.booked {
  background: #eff6ff;
  border-color: #93c5fd;
}

.slot-card.booked:hover {
  background: #dbeafe;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.slot-card.clickable {
  cursor: pointer;
}

.slot-card.clickable:hover {
  border-color: #60a5fa;
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.slot-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.available {
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.status-dot.booked {
  background: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.chat-modal {
  width: min(720px, 94vw);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8f9fb;
  min-height: 240px;
  max-height: 420px;
  overflow-y: auto;
}

.chat-message {
  max-width: 70%;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-message.incoming {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #e6e6e6;
}

.chat-message.outgoing {
  align-self: flex-end;
  background: #2c6ee8;
  color: #ffffff;
}

.chat-time {
  font-size: 11px;
  opacity: 0.7;
}

.chat-input {
  display: flex;
  gap: 12px;
}

.chat-input input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
}
/* Empty State */
.empty-state {
  background: white;
  border-radius: 12px;
  padding: 64px 24px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-state svg {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.empty-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  max-width: 400px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .availability-view {
    padding: 16px;
  }

  .view-header {
    flex-direction: column;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .slots-grid {
    grid-template-columns: 1fr;
  }

  .view-title {
    font-size: 20px;
  }
}
</style>
