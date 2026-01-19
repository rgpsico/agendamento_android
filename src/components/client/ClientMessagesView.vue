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
            <p class="subtitle">Bate-papos do aluno</p>
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
        <p>Suas conversas com professores vao aparecer aqui</p>
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
              <h4 class="teacher-name">{{ conv.teacherName }}</h4>
              <span class="time" v-if="conv.lastMessageTime">{{ conv.lastMessageTime }}</span>
            </div>
            <p v-if="conv.teacherEmail" class="teacher-email">{{ conv.teacherEmail }}</p>
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
              <h4>{{ chatTeacherName }}</h4>
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
            <button class="send-btn" type="submit" :disabled="!chatDraft.trim() || chatLoading">
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
const PROD_API_BASE = "https://agendamento.rjpasseios.com.br";
const ENV_API_BASE = process.env.VUE_APP_API_BASE;
const API_BASE = ENV_API_BASE || (process.env.NODE_ENV === "development" ? "" : PROD_API_BASE);
const CLIENT_SEND_ENDPOINT = `${API_BASE}/api/conversations/professor/mensagem`;

const STORAGE = {
  TOKEN: "agenda_client_token",
  COMPANY: "agenda_client_company_id",
  EMPRESA: "agenda_empresa_id",
  PROFILE: "agenda_client_profile"
};

function authHeaders() {
  const token = localStorage.getItem(STORAGE.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveEmpresaId() {
  return localStorage.getItem(STORAGE.COMPANY) || localStorage.getItem(STORAGE.EMPRESA) || "";
}

function loadStoredProfile() {
  const raw = localStorage.getItem(STORAGE.PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function resolveClientId(profile) {
  const data = profile || loadStoredProfile() || {};
  return (
    data.id ||
    data.user_id ||
    data.usuario_id ||
    data.aluno_id ||
    data.alunoId ||
    ""
  );
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

function normalizeSender(from, studentId, msg) {
  if (from) {
    const value = String(from).toLowerCase();
    if (value === "me" || value === "aluno" || value === "student" || value === "cliente") {
      return "me";
    }
    if (value === "professor" || value === "teacher") {
      return "teacher";
    }
  }
  const senderId = String(
    msg.user_id ||
      msg.remetente_id ||
      msg.sender_id ||
      msg.usuario_id ||
      msg.author_id ||
      ""
  );
  if (studentId && senderId && senderId === String(studentId)) {
    return "me";
  }
  return "teacher";
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

function normalizeMessages(messages, studentId) {
  return messages
    .map((msg) => {
      const text = msg.text || msg.mensagem || msg.message || msg.conteudo || msg.body || "";
      const time = formatMessageTime(msg.time || msg.hora || msg.created_at || msg.data_hora);
      const from = normalizeSender(msg.from || msg.remetente || msg.autor, studentId, msg);
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
  const conversationId = extractConversationId(conv) || conv.id || "";
  const professor =
    conv.professor ||
    conv.teacher ||
    conv.professor_usuario ||
    conv.professorUser ||
    conv.professor_user ||
    {};
  const profUser = professor.usuario || professor.user || professor;
  const teacherId =
    profUser.id ||
    conv.professor_id ||
    conv.professorId ||
    conv.professor_user_id ||
    conv.professorUserId ||
    conv.teacher_id ||
    conv.teacherId ||
    conv.teacher_user_id ||
    conv.teacherUserId ||
    "";
  const teacherName =
    profUser.nome ||
    profUser.name ||
    conv.professorName ||
    conv.professor_nome ||
    conv.teacherName ||
    "Professor";
  const teacherEmail =
    profUser.email ||
    conv.professorEmail ||
    conv.professor_email ||
    conv.teacherEmail ||
    "";
  const last = conv.last_message || {};
  const lastMessage = last.body || last.mensagem || last.message || last.text || "-";
  const lastMessageTime = formatDateTimePtBr(last.created_at || last.data_hora || "");
  return {
    id: conv.id || conversationId,
    conversationId,
    teacherId,
    teacherName,
    teacherEmail,
    lastMessage,
    lastMessageTime
  };
}

export default {
  name: "ClientMessagesView",
  props: {
    clientProfile: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      error: "",
      conversations: [],
      chatModalOpen: false,
      chatTeacher: null,
      chatDraft: "",
      chatMessagesByTeacher: {},
      chatConversationIdByTeacher: {},
      chatLoading: false,
      chatError: ""
    };
  },
  computed: {
    chatTeacherName() {
      return this.chatTeacher ? this.chatTeacher.name || this.chatTeacher.nome || "" : "";
    },
    chatMessages() {
      if (!this.chatTeacher) return [];
      return this.chatMessagesByTeacher[this.chatTeacher.id] || [];
    }
  },
  created() {
    this.fetchConversations();
  },
  watch: {
    chatMessages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    }
  },
  methods: {
    scrollToBottom() {
      if (this.$refs.chatBox) {
        this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
      }
    },
    fetchConversations() {
      const empresaId = resolveEmpresaId();
      const studentId = resolveClientId(this.clientProfile);
      if (!empresaId || !studentId) {
        this.error = "Aluno nao encontrado.";
        this.conversations = [];
        return;
      }
      const params = new URLSearchParams({
        empresa_id: empresaId,
        user_id: String(studentId),
        aluno_id: String(studentId)
      });
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
            const key = conv.teacherId || conv.teacherEmail || conv.teacherName;
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
      if (!conv) {
        return;
      }
      this.chatTeacher = { id: conv.teacherId, name: conv.teacherName };
      this.chatModalOpen = true;
      this.chatDraft = "";
      this.chatError = "";
      this.fetchConversation(conv.teacherId, conv.conversationId || conv.id);
    },
    closeChatModal() {
      this.chatModalOpen = false;
      this.chatDraft = "";
    },
    fetchConversation(teacherId, conversationId) {
      const empresaId = resolveEmpresaId();
      const studentId = resolveClientId(this.clientProfile);
      if (!empresaId || !studentId) {
        this.chatError = "Aluno nao encontrado.";
        return;
      }
      this.chatLoading = true;
      this.chatError = "";
      const params = new URLSearchParams({
        empresa_id: empresaId,
        user_id: String(studentId)
      });
      if (teacherId) {
        params.set("professor_id", String(teacherId));
      }
      if (conversationId) {
        params.set("conversation_id", String(conversationId));
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
          const resolvedConversationId = extractConversationId(conversation) || conversationId;
          if (resolvedConversationId) {
            this.$set(this.chatConversationIdByTeacher, teacherId, resolvedConversationId);
          }
          const normalized = normalizeMessages(extractMessages(conversation), studentId);
          if (normalized.length || !resolvedConversationId) {
            this.$set(this.chatMessagesByTeacher, teacherId, normalized);
            return null;
          }
          const messageParams = new URLSearchParams({
            conversation_id: String(resolvedConversationId)
          });
          return fetch(`${API_BASE}/api/mensagensPorConversa?${messageParams.toString()}`, {
            headers: {
              "Content-Type": "application/json",
              ...authHeaders()
            }
          }).then(async (messageResponse) => {
            const messageData = await messageResponse.json().catch(() => ({}));
            if (!messageResponse.ok) {
              throw new Error(messageData.error || "Erro ao carregar conversa.");
            }
            const fallbackMessages = normalizeMessages(messageData.messages || [], studentId);
            this.$set(this.chatMessagesByTeacher, teacherId, fallbackMessages);
            return null;
          });
        })
        .catch((error) => {
          this.chatError = error.message || "Erro ao carregar conversa.";
          if (!this.chatMessagesByTeacher[teacherId]) {
            this.$set(this.chatMessagesByTeacher, teacherId, []);
          }
        })
        .finally(() => {
          this.chatLoading = false;
        });
    },
   sendChatMessage() {
    const message = this.chatDraft.trim();
    if (!message || !this.chatTeacher) return;

    const teacherId = this.chatTeacher.id;
    alert(teacherId);
    if (!teacherId) {
      this.chatError = "Professor nao encontrado.";
      return;
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    // UI otimista
    const existing = this.chatMessagesByTeacher[teacherId] || [];
    this.chatMessagesByTeacher[teacherId] = [
      ...existing,
      { from: "me", text: message, time }
    ];

    this.chatDraft = "";

    const payload = {
      mensagem: message,
      professor_id: teacherId
    };

    const conversationId = this.chatConversationIdByTeacher[teacherId];
    if (conversationId) {
      payload.conversation_id = conversationId;
    }

    const empresaId = resolveEmpresaId();
    if (empresaId) {
      payload.empresa_id = empresaId;
    }

    fetch(`${API_BASE}/api/conversations/aluno/mensagem`, {
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
          throw new Error(data.message || "Erro ao enviar mensagem.");
        }

        // Atualiza conversation_id se for nova
        if (data.conversation_id) {
          this.$set(
            this.chatConversationIdByTeacher,
            teacherId,
            data.conversation_id
          );
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
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
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
  border-top-color: #2563eb;
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
  border-color: #2563eb;
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.1);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
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

.teacher-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.teacher-email {
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
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.chat-text {
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
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
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.send-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
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
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
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
