<template>
  <section class="view messages-view">
    <div class="view-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h3>Mensagens</h3>
            <p class="subtitle">Converse com seus alunos</p>
          </div>
        </div>
        <button class="refresh-btn" @click="fetchConversations" :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Atualizar
        </button>
      </div>
    </div>

    <div class="conversations-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando conversas...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
        <button class="secondary-btn" @click="fetchConversations">Tentar novamente</button>
      </div>

      <div v-else-if="!conversations.length" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <h4>Nenhuma conversa ainda</h4>
        <p>Suas conversas com alunos aparecerão aqui</p>
      </div>

      <div v-else class="conversations-grid">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-card"
          @click="openConversation(conv)"
        >
          <div class="avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="conversation-info">
            <div class="conversation-header">
              <h4 class="student-name">{{ conv.studentName }}</h4>
              <span class="time" v-if="conv.lastMessageTime">{{ conv.lastMessageTime }}</span>
            </div>
            <p v-if="conv.studentEmail" class="student-email">{{ conv.studentEmail }}</p>
            <p class="last-message">{{ conv.lastMessage }}</p>
          </div>
          <div class="conversation-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="chatModalOpen" class="modal-overlay" @click.self="closeChatModal">
      <div class="modal-card chat-modal">
        <div class="chat-header">
          <div class="chat-header-left">
            <div class="avatar large">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h4>{{ chatStudentName }}</h4>
              <p class="status">Mensagens diretas</p>
            </div>
          </div>
          <button class="close-btn" @click="closeChatModal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="chat-box" ref="chatBox">
          <div v-if="chatLoading" class="chat-loading">
            <div class="spinner small"></div>
            <p>Carregando conversa...</p>
          </div>

          <div v-else-if="chatError" class="chat-error">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{{ chatError }}</p>
          </div>

          <div v-else-if="!chatMessages.length" class="chat-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Nenhuma mensagem ainda</p>
            <span>Inicie a conversa enviando uma mensagem</span>
          </div>

          <div v-else class="messages-container">
            <div
              v-for="(msg, index) in chatMessages"
              :key="index"
              class="chat-message"
              :class="msg.from === 'me' ? 'outgoing' : 'incoming'"
            >
              <div class="message-bubble">
                <span class="chat-text">{{ msg.text }}</span>
                <span class="chat-time">{{ msg.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <form class="chat-input" @submit.prevent="sendChatMessage">
          <div class="input-wrapper">
            <input
              v-model="chatDraft"
              type="text"
              placeholder="Digite sua mensagem..."
              @keydown.enter.exact.prevent="sendChatMessage"
            />
            <button
              class="send-btn"
              type="submit"
              :disabled="!chatDraft.trim()"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
import { io } from "socket.io-client";

const PROD_API_BASE = "https://agendamento.rjpasseios.com.br";
const API_BASE = process.env.NODE_ENV === "production" ? PROD_API_BASE : "";
const SOCKET_URL = "https://www.comunidadeppg.com.br:3000";
const socket = io(SOCKET_URL, {
  reconnection: true,
  reconnectionAttempts: 5,
  timeout: 10000
});

socket.on("connect", () => console.log("Socket conectado:", socket.id));
socket.on("connect_error", (err) => console.error("Erro de conexao socket:", err));
socket.on("disconnect", (reason) => console.log("Socket desconectou:", reason));

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

function formatDateTimePtBr(value) {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
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

function normalizeConversation(conv) {
  const user = conv.user || conv.aluno?.usuario || conv.aluno || {};
  const studentId = user.id || conv.user_id || conv.aluno_id || "";
  const studentName =
    user.name ||
    user.nome ||
    conv.studentName ||
    conv.aluno_nome ||
    conv.alunoNome ||
    "Aluno";
  const studentEmail =
    user.email ||
    user.email_address ||
    user.emailAddress ||
    conv.studentEmail ||
    conv.aluno_email ||
    conv.alunoEmail ||
    "";
  const last = conv.last_message || {};
  const lastMessage = last.body || last.mensagem || last.message || last.text || "-";
  const lastMessageTime = formatDateTimePtBr(last.created_at || last.data_hora || "");
  return {
    id: conv.id,
    studentId,
    studentName,
    studentEmail,
    lastMessage,
    lastMessageTime
  };
}

export default {
  name: "ProfessorMessagesView",
  data() {
    return {
      loading: false,
      error: "",
      conversations: [],
      chatModalOpen: false,
      chatStudent: null,
      chatDraft: "",
      chatMessagesByStudent: {},
      chatConversationIdByStudent: {},
      chatLoading: false,
      chatError: "",
      socketUserChannel: "",
      socketConversationChannel: "",
      socketUserHandler: null,
      socketConversationHandler: null
    };
  },
  computed: {
    chatStudentName() {
      return this.chatStudent ? this.chatStudent.name || this.chatStudent.nome || "" : "";
    },
    chatMessages() {
      if (!this.chatStudent) return [];
      return this.chatMessagesByStudent[this.chatStudent.id] || [];
    }
  },
  created() {
    this.fetchConversations();
  },
  mounted() {
    this.subscribeToProfessorChannel();
  },
  beforeDestroy() {
    this.unsubscribeSocketChannels();
  },
  watch: {
    chatMessages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  },
  methods: {
    initSocketSubscriptions(conversationId) {
      this.subscribeToProfessorChannel();
      if (conversationId) {
        this.subscribeToConversation(conversationId);
      }
    },
    subscribeToProfessorChannel() {
      const professorId = resolveProfessorId();
      if (!professorId) return;

      const channel = `enviarmensagem${professorId}`;
      if (this.socketUserChannel === channel) return;

      this.unsubscribeUserChannel();

      this.socketUserChannel = channel;
      this.socketUserHandler = (payload) => this.handleIncomingMessage(payload);
      socket.on(channel, this.socketUserHandler);
      console.log("Socket inscrito no canal:", channel);
    },
    subscribeToConversation(conversationId) {
      const cleanId = String(conversationId || "").trim();
      if (!cleanId) return;

      this.unsubscribeConversationChannel();

      const channel = `conversa_${cleanId}`;
      this.socketConversationChannel = channel;

      socket.emit("join", channel);
      socket.emit("join_conversation", cleanId);

      this.socketConversationHandler = (payload) => this.handleIncomingMessage(payload);
      socket.on(channel, this.socketConversationHandler);
      console.log("Socket inscrito no canal:", channel);
    },
    unsubscribeUserChannel() {
      if (this.socketUserChannel && this.socketUserHandler) {
        socket.off(this.socketUserChannel, this.socketUserHandler);
        console.log("Socket saiu do canal:", this.socketUserChannel);
        this.socketUserChannel = "";
        this.socketUserHandler = null;
      }
    },
    unsubscribeConversationChannel() {
      if (this.socketConversationChannel && this.socketConversationHandler) {
        socket.off(this.socketConversationChannel, this.socketConversationHandler);
        console.log("Socket saiu do canal:", this.socketConversationChannel);
        this.socketConversationChannel = "";
        this.socketConversationHandler = null;
      }
    },
    unsubscribeSocketChannels() {
      this.unsubscribeUserChannel();
      this.unsubscribeConversationChannel();
    },
    handleIncomingMessage(payload) {
      if (!payload) return;

      console.log("Mensagem recebida via socket:", payload);

      const text = String(
        payload.mensagem || payload.body || payload.text || payload.message || ""
      ).trim();
      if (!text) return;

      const conversationId = String(
        payload.conversation_id || payload.conversationId || ""
      ).trim();
      const professorId = resolveProfessorId();
      const senderId = String(
        payload.user_id ||
          payload.usuario_id ||
          payload.aluno_id ||
          payload.alunoId ||
          payload.sender_id ||
          payload.remetente_id ||
          payload.professor_id ||
          payload.professorId ||
          ""
      );
      if (professorId && senderId && String(senderId) === String(professorId)) {
        return;
      }
      const candidateStudentId =
        payload.aluno_id ||
        payload.alunoId ||
        (payload.user_id && String(payload.user_id) !== String(professorId)
          ? payload.user_id
          : "") ||
        (payload.remetente_id && String(payload.remetente_id) !== String(professorId)
          ? payload.remetente_id
          : "");
      const studentId = String(candidateStudentId || this.chatStudent?.id || "");
      if (!studentId) return;

      const from = String(senderId) === String(professorId) ? "me" : "student";
      const time = formatMessageTime(
        payload.created_at || payload.createdAt || payload.hora || payload.time || new Date()
      );

      const messageObj = { from, text, time };
      const existing = this.chatMessagesByStudent[studentId] || [];
      const duplicate = existing.some(
        (msg) => msg.text === messageObj.text && msg.time === messageObj.time && msg.from === messageObj.from
      );
      if (!duplicate) {
        this.$set(this.chatMessagesByStudent, studentId, [...existing, messageObj]);
      }

      if (conversationId) {
        this.$set(this.chatConversationIdByStudent, studentId, conversationId);
        if (this.chatStudent && String(this.chatStudent.id) === String(studentId)) {
          this.subscribeToConversation(conversationId);
        }
      }
    },
    scrollToBottom() {
      if (this.$refs.chatBox) {
        this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
      }
    },
    fetchConversations() {
      const empresaId = resolveEmpresaId();
      if (!empresaId) {
        this.error = "Empresa não encontrada.";
        this.conversations = [];
        return;
      }
      const params = new URLSearchParams({
        empresa_id: empresaId
      });
      const professorId = resolveProfessorId();
      if (professorId) {
        params.set("professor_id", professorId);
      }
      this.loading = true;
      this.error = "";
      fetch(`${API_BASE}/api/conversations/lista?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar conversas.");
          }
          const list = Array.isArray(data) ? data : data.data || [];
          const normalized = list.map((conv) => normalizeConversation(conv));
          const seen = new Set();
          const deduped = [];
          normalized.forEach((conv) => {
            const key = conv.studentId || conv.studentEmail || conv.studentName;
            if (!key || seen.has(key)) return;
            seen.add(key);
            deduped.push(conv);
          });
          this.conversations = deduped;
        })
        .catch((error) => {
          this.error = error.message || "Erro ao carregar conversas.";
          this.conversations = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openConversation(conv) {
      if (!conv || !conv.studentId) {
        return;
      }
      this.chatStudent = { id: conv.studentId, name: conv.studentName };
      this.chatModalOpen = true;
      this.chatDraft = "";
      this.chatError = "";
      if (conv.id) {
        this.$set(this.chatConversationIdByStudent, conv.studentId, conv.id);
      }
      this.initSocketSubscriptions(conv.id);
      this.fetchConversation(conv.studentId, conv.id);
    },
    closeChatModal() {
      this.chatModalOpen = false;
      this.chatDraft = "";
      this.unsubscribeSocketChannels();
    },
    fetchConversation(studentId, conversationId) {

      const empresaId = resolveEmpresaId();
      if (!studentId || !empresaId) {
        this.chatError = "Professor não encontrado.";
        return;
      }
      this.chatLoading = true;
      const params = new URLSearchParams({
        empresa_id: empresaId
      });
      if (conversationId) {
        params.set("conversation_id", String(conversationId));
      }
      const professorId = resolveProfessorId();
      if (professorId) {
        params.set("user_id", professorId);
      }
      fetch(`https://agendamento.rjpasseios.com.br/api/listarmensagembyidconversaprof?${params.toString()}`, {
        headers: {
           Accept: "application/json",  
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
.messages-view {
  max-width: 1200px;
  margin: 0 auto;
}

.view-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2c6ee8 0%, #1d4ed8 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(44, 110, 232, 0.25);
}

.header-left h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748b;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.conversations-container {
  min-height: 400px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2c6ee8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner.small {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.error-state svg {
  color: #ef4444;
  opacity: 0.8;
}

.empty-state svg {
  color: #cbd5e1;
}

.empty-state h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

.conversations-grid {
  display: grid;
  gap: 12px;
}

.conversation-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversation-card:hover {
  border-color: #2c6ee8;
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(44, 110, 232, 0.1);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar.large {
  width: 44px;
  height: 44px;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.student-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.student-email {
  margin: 0 0 6px;
  font-size: 13px;
  color: #94a3b8;
  word-break: break-word;
}

.time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.last-message {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
}

.chat-modal {
  width: min(820px, 95vw);
  height: min(700px, 90vh);
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.2);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.chat-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.status {
  margin: 2px 0 0;
  font-size: 13px;
  color: #64748b;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.chat-box {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f8fafc;
}

.chat-loading,
.chat-error,
.chat-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
}

.chat-empty {
  gap: 8px;
}

.chat-empty svg {
  color: #cbd5e1;
  margin-bottom: 8px;
}

.chat-empty p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #475569;
}

.chat-empty span {
  font-size: 14px;
  color: #94a3b8;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chat-message {
  display: flex;
  max-width: 75%;
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message.incoming {
  align-self: flex-start;
}

.chat-message.outgoing {
  align-self: flex-end;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.incoming .message-bubble {
  background: white;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.outgoing .message-bubble {
  background: linear-gradient(135deg, #2c6ee8 0%, #1d4ed8 100%);
  color: rgb(24, 21, 21);
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(44, 110, 232, 0.3);
}

.chat-text {
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
  color:#000;
}

.chat-time {
  font-size: 11px;
  opacity: 0.7;
  align-self: flex-end;
}

.chat-input {
  padding: 20px 24px;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-wrapper input {
  flex: 1;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: #f8fafc;
  transition: all 0.2s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #2c6ee8;
  background: white;
  box-shadow: 0 0 0 3px rgba(44, 110, 232, 0.1);
}

.send-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: linear-gradient(135deg, #2c6ee8 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(44, 110, 232, 0.35);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.secondary-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .conversation-card {
    padding: 14px;
  }

  .chat-modal {
    width: 100%;
    height: 100%;
    border-radius: 0;
  }

  .chat-message {
    max-width: 85%;
  }
}
</style>
