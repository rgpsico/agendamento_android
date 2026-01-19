<template>
  <div v-if="open" class="modal-overlay" @click.self="handleClose">
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
        <button class="close-btn" @click="handleClose">
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
</template>
<script>
import { io } from "socket.io-client";
import {
  API_BASE,
  authHeaders,
  resolveEmpresaId,
  resolveClientId,
  normalizeSender,
  formatMessageTime,
  extractMessages,
  normalizeMessages,
  extractConversationId,
  normalizeConversation
} from "./clientMessagesUtils";

const SOCKET_URL = "https://www.comunidadeppg.com.br:3000";
const socket = io(SOCKET_URL);

socket.on("connect", () => console.log("socket conectado", socket.id));
socket.on("disconnect", () => console.log("socket desconectou"));

export default {
  name: "ClientChatModal",

  props: {
    open: {
      type: Boolean,
      default: false
    },
    teacher: {
      type: Object,
      default: null
    },
    conversationId: {
      type: [String, Number],
      default: ""
    },
    clientProfile: {
      type: Object,
      default: null
    }
  },

  data() {
    return {
      chatDraft: "",
      chatMessages: [],
      chatLoading: false,
      chatError: "",
      chatConversationId: "",           // ← sempre tenta manter o ID atual aqui
      socketUserChannel: "",
      socketConversationChannel: "",
      socketUserHandler: null,
      socketConversationHandler: null
    };
  },

  computed: {
    chatTeacherName() {
      return this.teacher?.name || this.teacher?.nome || "";
    },
    teacherId() {
      return this.teacher?.id || "";
    },
    effectiveConversationId() {
      // Prioridade: prop → data interna → vazio
      return String(this.conversationId || this.chatConversationId || "").trim();
    }
  },

  watch: {
    open(isOpen) {
      if (isOpen) {
        this.initChat();
      } else {
        this.unsubscribeSocketChannels();
      }
    },

    // Muito importante: reagir a mudanças na prop conversationId
    conversationId: {
      immediate: true,
      handler(newId) {
        const cleanId = String(newId || "").trim();
        if (!cleanId || !this.open) return;

        if (cleanId !== this.chatConversationId) {
          this.chatConversationId = cleanId;
          this.subscribeToConversation(cleanId);
          // Se já estamos abertos → recarrega mensagens
          if (this.open) {
            this.fetchConversation(this.teacherId, cleanId);
          }
        }
      }
    },

    chatMessages() {
      this.$nextTick(() => this.scrollToBottom());
    }
  },

  mounted() {
    this.subscribeToUserChannel();
    if (this.open) this.initChat();
  },

  beforeDestroy() {
    this.unsubscribeSocketChannels();
    // socket.disconnect();  ← só se quiser desconectar completamente (geralmente não)
  },

  methods: {
    initChat() {
      this.chatError = "";
      this.chatDraft = "";
      this.chatMessages = [];

      const initialConvId = this.effectiveConversationId;

      if (initialConvId) {
        this.chatConversationId = initialConvId;
        this.subscribeToConversation(initialConvId);
      }

      if (this.teacherId || initialConvId) {
        this.fetchConversation(this.teacherId, initialConvId);
      }
    },

    handleClose() {
      this.$emit("close");
    },

    scrollToBottom() {
      if (this.$refs.chatBox) {
        this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
      }
    },

    async fetchConversation(teacherId = "", convId = "") {
      const empresaId = resolveEmpresaId();
      const studentId = resolveClientId(this.clientProfile);

      if (!empresaId || !studentId) {
        this.chatError = "Aluno não encontrado.";
        this.chatLoading = false;
        return;
      }

      this.chatLoading = true;
      this.chatError = "";

      try {
        const params = new URLSearchParams({
          empresa_id: empresaId,
          user_id: String(studentId)
        });

        if (teacherId) params.set("professor_id", String(teacherId));
        if (convId)     params.set("conversation_id", String(convId));

        const res = await fetch(`${API_BASE}/api/conversations?${params}`, {
          headers: { "Content-Type": "application/json", ...authHeaders() }
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Erro ao carregar conversa");
        }

        const data = await res.json();
        const conversation = Array.isArray(data) ? data[0] : data;

        // Extrai ID com prioridade
        const resolvedId = extractConversationId(conversation) || convId || "";
        if (resolvedId && resolvedId !== this.chatConversationId) {
          this.chatConversationId = resolvedId;
          this.$emit("update-conversation-id", resolvedId);
          this.subscribeToConversation(resolvedId);
        }

        // Se descobriu professor novo
        const normConv = normalizeConversation(conversation);
        if (!this.teacherId && normConv.teacherId) {
          this.$emit("update-teacher", {
            id: normConv.teacherId,
            name: normConv.teacherName
          });
        }

        // Tenta carregar mensagens da conversa principal
        let messages = extractMessages(conversation);
        if (messages?.length) {
          this.chatMessages = normalizeMessages(messages, studentId);
          return;
        }

        // Caso contrário → busca mensagens separadamente
        if (resolvedId) {
          const msgParams = new URLSearchParams({ conversation_id: resolvedId });
          const msgRes = await fetch(`${API_BASE}/api/mensagensPorConversa?${msgParams}`, {
            headers: { "Content-Type": "application/json", ...authHeaders() }
          });

          if (!msgRes.ok) {
            const err = await msgRes.json().catch(() => ({}));
            throw new Error(err.error || "Erro ao carregar mensagens");
          }

          const msgData = await msgRes.json();
          this.chatMessages = normalizeMessages(msgData.messages || [], studentId);
        }
      } catch (err) {
        this.chatError = err.message || "Erro ao carregar conversa.";
        this.chatMessages = [];
      } finally {
        this.chatLoading = false;
      }
    },

    async sendChatMessage() {
      const message = this.chatDraft.trim();
      if (!message || !this.teacherId) return;

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // UI otimista
      this.chatMessages = [...this.chatMessages, { from: "me", text: message, time }];
      this.chatDraft = "";

      try {
        const payload = {
          mensagem: message,
          professor_id: this.teacherId,
          empresa_id: resolveEmpresaId() || undefined
        };

        if (this.chatConversationId) {
          payload.conversation_id = this.chatConversationId;
        }

        const res = await fetch(`${API_BASE}/api/conversations/aluno/mensagem`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || "Erro ao enviar mensagem");
        }

        const data = await res.json();

        // Muito importante: o backend retornou um novo conversation_id?
        if (data.conversation_id && data.conversation_id !== this.chatConversationId) {
          this.chatConversationId = String(data.conversation_id);
          this.$emit("update-conversation-id", this.chatConversationId);
          this.subscribeToConversation(this.chatConversationId);
        }
      } catch (err) {
        this.chatError = err.message || "Erro ao enviar mensagem.";
        // Opcional: remover mensagem otimista ou marcar como falha
      }
    },

    subscribeToUserChannel() {
      const studentId = resolveClientId(this.clientProfile);
      if (!studentId) return;

      const channel = `enviarmensagem${studentId}`;
      if (this.socketUserChannel === channel) return;

      this.unsubscribeUserChannel();
      this.socketUserChannel = channel;
      this.socketUserHandler = (payload) => this.handleIncomingMessage(payload);
      socket.on(channel, this.socketUserHandler);
    },

 subscribeToConversation(convId) {
      const cleanId = String(convId || "").trim();
      
      console.log("🔍 DEBUG subscribeToConversation:");
      console.log("  - convId recebido:", convId, "| tipo:", typeof convId);
      console.log("  - cleanId processado:", cleanId, "| length:", cleanId.length);
      
      if (!cleanId) {
        console.log("  ⚠️ cleanId vazio! Abortando subscription");
        return;
      }

      // ⚠️ ATENÇÃO: Use cleanId diretamente, sem nenhuma outra variável!
      const channel = `conversa_${cleanId}`;
      this.socketConversationChannel = channel;
      
      console.log("  - Canal construído:", channel);
      console.log("  - Canal atual:", this.socketConversationChannel);
      
      if (this.socketConversationChannel === channel) {
        console.log("  ✓ Já inscrito neste canal, pulando");
        return;
      }

      this.unsubscribeConversationChannel();
      console.log("  ✅ Inscrevendo no canal:", channel);


      
      // Tenta entrar na sala (se o servidor usar rooms)
      socket.emit('join_conversation', cleanId);
      socket.emit('join', channel);
      socket.emit('subscribe', channel);
      
      // Escuta o evento específico do canal
      this.socketConversationHandler = (payload) => {
        console.log(`📨 Mensagem via ${channel}:`, payload);
        this.handleIncomingMessage(payload);
      };
      socket.on(channel, this.socketConversationHandler);
      
      // Escuta eventos genéricos e filtra por conversation_id
      if (!this.genericMessageHandler) {
        this.genericMessageHandler = (payload) => {
          console.log("📨 Mensagem genérica recebida:", payload);
          
          const msgConvId = String(payload.conversation_id || payload.conversationId || "");
          if (msgConvId === cleanId) {
            console.log("✅ Mensagem para esta conversa!");
            this.handleIncomingMessage(payload);
          }
        };
        
        // Tenta vários nomes de eventos possíveis
        socket.on('mensagem', this.genericMessageHandler);
        socket.on('nova_mensagem', this.genericMessageHandler);
        socket.on('message', this.genericMessageHandler);
        socket.on('new_message', this.genericMessageHandler);
      }
    },

    unsubscribeUserChannel() {
      if (this.socketUserChannel && this.socketUserHandler) {
        socket.off(this.socketUserChannel, this.socketUserHandler);
        this.socketUserChannel = "";
      }
    },

    unsubscribeConversationChannel() {
      if (this.socketConversationChannel && this.socketConversationHandler) {
        socket.off(this.socketConversationChannel, this.socketConversationHandler);
        this.socketConversationChannel = "";
      }
    },

    unsubscribeSocketChannels() {
      this.unsubscribeUserChannel();
      this.unsubscribeConversationChannel();
    },

    handleIncomingMessage(payload) {
      if (!payload) return;

      console.log("mensagem chegou", payload);

      const studentId = resolveClientId(this.clientProfile);
      const text = payload.mensagem || payload.body || payload.text || payload.message || "";
      if (!text) return;

      const convIdFromPayload = payload.conversation_id || payload.conversationId || "";

      // Segurança extra: ignora mensagem de outra conversa
      if (this.chatConversationId && convIdFromPayload && 
          String(this.chatConversationId) !== String(convIdFromPayload)) {
        return;
      }

      const time = formatMessageTime(payload.created_at || payload.time || payload.hora || new Date());
      const from = normalizeSender(payload.from || payload.remetente || payload.autor, studentId, payload);

      this.chatMessages = [...this.chatMessages, { from, text, time }];

      // Se chegou mensagem e ainda não temos ID → atualiza
      if (convIdFromPayload && !this.chatConversationId) {
        this.chatConversationId = String(convIdFromPayload);
        this.$emit("update-conversation-id", this.chatConversationId);
        this.subscribeToConversation(this.chatConversationId);
      }
    }
  }
};
</script>

<style scoped>
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

.avatar.large {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.spinner.small {
  width: 24px;
  height: 24px;
  border: 2px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
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
