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
            <td>{{ student.data_nascimento }}</td>
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
          <p v-if="!chatMessages.length" class="hint">Nenhuma mensagem ainda.</p>
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
      chatMessagesByStudent: {}
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
    openChat(student) {
      this.chatStudent = student;
      this.chatModalOpen = true;
      if (!this.chatMessagesByStudent[student.id]) {
        this.$set(this.chatMessagesByStudent, student.id, []);
      }
    },
    closeChatModal() {
      this.chatModalOpen = false;
      this.chatDraft = "";
    },
    sendChatMessage() {
      const message = this.chatDraft.trim();
      if (!message || !this.chatStudent) return;

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      const existing = this.chatMessagesByStudent[this.chatStudent.id] || [];
      this.chatMessagesByStudent[this.chatStudent.id] = [
        ...existing,
        { from: "me", text: message, time }
      ];
      this.chatDraft = "";
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
