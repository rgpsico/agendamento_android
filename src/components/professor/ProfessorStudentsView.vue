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
  }
};
</script>
