<template>
  <section class="view">
    <div class="view-header">
      <h3>Alunos</h3>
      <button class="primary-btn" @click="startNewStudent">Novo</button>
    </div>
    <p v-if="studentsLoading" class="hint">Carregando alunos...</p>
    <p v-if="studentsError" class="error">{{ studentsError }}</p>
    <div class="table-wrap" v-if="studentsDetailed.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Data Nascimento</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in studentsDetailed" :key="student.id">
            <td>{{ student.nome }}</td>
            <td>{{ student.email }}</td>
            <td>{{ student.telefone }}</td>
            <td>{{ formatDatePtBr(student.data_nascimento) }}</td>
            <td>
              <div class="actions">
                <button class="text-btn" @click="editStudent(student)">Editar</button>
                <button class="text-btn" @click="openChat(student)">Conversar</button>
                <button class="text-btn danger" @click="removeStudent(student.id)">Excluir</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!studentsDetailed.length" class="hint">Nenhum aluno encontrado.</p>

    <div v-if="studentModalOpen" class="modal-overlay" @click.self="closeStudentModal">
      <div class="modal-card">
        <div class="view-header">
          <h4>{{ studentForm.id ? "Editar Aluno" : "Novo Aluno" }}</h4>
          <button class="text-btn" @click="closeStudentModal">Fechar</button>
        </div>
        <div class="form-grid">
          <label class="field">
            <span>Primeiro Nome</span>
            <input type="text" v-model.trim="studentForm.primeiro_nome" />
          </label>
          <label class="field">
            <span>Ultimo Nome</span>
            <input type="text" v-model.trim="studentForm.ultimo_nome" />
          </label>
          <label class="field">
            <span>Email</span>
            <input type="email" v-model.trim="studentForm.email" />
          </label>
          <label class="field">
            <span>Telefone</span>
            <input type="text" v-model.trim="studentForm.telefone" />
          </label>
          <label class="field">
            <span>Data de Nascimento</span>
            <input type="date" v-model="studentForm.data_nascimento" />
          </label>
          <label v-if="!studentForm.id" class="field">
            <span>Senha</span>
            <input type="password" v-model.trim="studentForm.password" />
          </label>
        </div>
        <div class="actions">
          <button class="primary-btn" @click="saveStudent">Salvar</button>
          <button class="text-btn" @click="resetStudentForm">Limpar</button>
        </div>
      </div>
    </div>

    <ProfessorAvailabilityChatModal
      v-if="chatModalOpen"
      :open="chatModalOpen"
      :student-name="chatStudentName"
      :messages="chatMessages"
      :loading="chatLoading"
      :error="chatError"
      v-model="chatDraft"
      @close="closeChatModal"
      @send="sendChatMessage"
    />
  </section>
</template>

<script>
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { io } from "socket.io-client";
import ProfessorAvailabilityChatModal from "./ProfessorAvailabilityChatModal.vue";

const PROD_API_BASE = "https://agendamento.rjpasseios.com.br";
const API_BASE = PROD_API_BASE;
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
  name: "ProfessorStudentsView",
  components: {
    ProfessorAvailabilityChatModal
  },
  props: {
    studentsLoading: {
      type: Boolean,
      required: true
    },
    studentsError: {
      type: String,
      default: ""
    },
    studentsDetailed: {
      type: Array,
      required: true
    },
    studentModalOpen: {
      type: Boolean,
      required: true
    },
    studentForm: {
      type: Object,
      required: true
    },
    startNewStudent: {
      type: Function,
      required: true
    },
    editStudent: {
      type: Function,
      required: true
    },
    removeStudent: {
      type: Function,
      required: true
    },
    closeStudentModal: {
      type: Function,
      required: true
    },
    saveStudent: {
      type: Function,
      required: true
    },
    resetStudentForm: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
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
      socketConversationHandler: null,
      notificationsReady: false
    };
  },
  computed: {
    chatStudentName() {
      return this.chatStudent ? this.chatStudent.nome : "";
    },
    chatMessages() {
      if (!this.chatStudent) return [];
      return this.chatMessagesByStudent[this.chatStudent.id] || [];
    }
  },
  mounted() {
    this.subscribeToProfessorChannel();
    this.ensureNotificationsReady();
  },
  beforeDestroy() {
    this.unsubscribeSocketChannels();
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

      this.triggerLocalNotification({
        studentId,
        conversationId,
        text,
        studentName:
          String(this.chatStudent?.id || "") === String(studentId) ? this.chatStudent?.nome : ""
      });

      if (conversationId) {
        this.$set(this.chatConversationIdByStudent, studentId, conversationId);
        if (this.chatStudent && String(this.chatStudent.id) === String(studentId)) {
          this.subscribeToConversation(conversationId);
        }
      }
    },
    async ensureNotificationsReady() {
      if (this.notificationsReady) return;
      if (!Capacitor.isNativePlatform()) return;

      try {
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== "granted") {
          const requested = await LocalNotifications.requestPermissions();
          if (requested.display !== "granted") return;
        }

        await LocalNotifications.createChannel({
          id: "mensagens",
          name: "Mensagens",
          description: "Notificacoes de novas mensagens",
          importance: 4,
          visibility: 1,
          vibration: true
        });
      } catch (error) {
        console.warn("LocalNotifications indisponivel:", error);
        return;
      }

      this.notificationsReady = true;
    },
    async triggerLocalNotification({ studentId, conversationId, text, studentName }) {
      await this.ensureNotificationsReady();
      if (!this.notificationsReady) return;

      const title = studentName ? `Nova mensagem de ${studentName}` : "Nova mensagem";
      const body = text.length > 180 ? `${text.slice(0, 177)}...` : text;
      const safeId = Number(Date.now() % 2147483647);

      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: safeId,
              title,
              body,
              channelId: "mensagens",
              extra: {
                studentId,
                conversationId
              }
            }
          ]
        });
      } catch (error) {
        console.warn("Falha ao enviar notificacao local:", error);
      }
    },
    formatDatePtBr(value) {
      if (!value) {
        return "";
      }

      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }

      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        return value;
      }

      return parsed.toLocaleDateString("pt-BR");
    },
    openChat(student) {
      this.chatStudent = student;
      this.chatModalOpen = true;
      this.chatError = "";
      const existingConversationId =
        student?.usuario?.last_conversation_with_empresa?.id ||
        student?.last_conversation_with_empresa?.id ||
        student?.conversation_id ||
        this.chatConversationIdByStudent[student.id] ||
        "";
      if (existingConversationId) {
        this.$set(this.chatConversationIdByStudent, student.id, existingConversationId);
      }
      this.initSocketSubscriptions(existingConversationId);
      this.fetchConversation(student.id, existingConversationId);
    },
    closeChatModal() {
      this.chatModalOpen = false;
      this.chatDraft = "";
      this.unsubscribeSocketChannels();
    },
    fetchConversation(studentId, conversationId) {
      const empresaId = resolveEmpresaId();
      if (!studentId || !empresaId) {
        this.chatError = "Professor nao encontrado.";
        return;
      }
      this.chatLoading = true;
      const resolveConversationId = async () => {
        if (conversationId) return conversationId;
        const params = new URLSearchParams({
          empresa_id: empresaId,
          user_id: String(studentId)
        });
        const response = await fetch(
          `${API_BASE}/api/conversations/aberta?${params.toString()}`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...authHeaders()
            }
          }
        );
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || "Erro ao verificar conversa.");
        }
        return data.conversation_id || extractConversationId(data) || "";
      };

      const loadConversation = async () => {
        try {
          const resolvedId = await resolveConversationId();
          if (resolvedId) {
            this.$set(this.chatConversationIdByStudent, studentId, resolvedId);
            this.initSocketSubscriptions(resolvedId);
          } else {
            this.$set(this.chatMessagesByStudent, studentId, []);
            return;
          }

          const params = new URLSearchParams({
            empresa_id: empresaId,
            conversation_id: String(resolvedId)
          });
          const professorId = resolveProfessorId();
          if (professorId) {
            params.set("user_id", professorId);
          }
          const response = await fetch(
            `${API_BASE}/api/listarmensagembyidconversaprof?${params.toString()}`,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...authHeaders()
              }
            }
          );
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar conversa.");
          }
          const conversation = Array.isArray(data) ? data[0] : data;
          const normalized = normalizeMessages(extractMessages(conversation));
          this.$set(this.chatMessagesByStudent, studentId, normalized);
        } catch (error) {
          this.chatError = error.message || "Erro ao carregar conversa.";
          if (!this.chatMessagesByStudent[studentId]) {
            this.$set(this.chatMessagesByStudent, studentId, []);
          }
        } finally {
          this.chatLoading = false;
        }
      };

      loadConversation();
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
