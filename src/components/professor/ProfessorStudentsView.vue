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

    <div v-if="chatModalOpen" class="modal-overlay" @click.self="closeChatModal">
      <div class="modal-card chat-modal">
        <div class="view-header">
          <div>
            <h4>Conversar com {{ chatStudentName }}</h4>
            <p class="hint">Mensagens diretas com o aluno.</p>
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
const API_BASE = PROD_API_BASE;

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
      chatError: ""
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
  methods: {
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
      this.fetchConversation(student.id);
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
</style>
