<template>
  <section class="view">
    <div class="view-header">
      <h3>Servicos</h3>
      <button class="primary-btn" @click="startNewService">Novo</button>
    </div>
    <p v-if="servicesLoading" class="hint">Carregando servicos...</p>
    <p v-if="servicesError" class="error">{{ servicesError }}</p>
    <div class="table-wrap" v-if="services.length">
      <table class="data-table">
        <thead>
          <tr>
            <th>Titulo</th>
            <th>Descricao</th>
            <th>Preco</th>
            <th>Tempo</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Imagem</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in services" :key="service.id">
            <td>{{ service.titulo || "Servico" }}</td>
            <td>{{ service.descricao }}</td>
            <td>R$ {{ service.preco }}</td>
            <td>{{ service.tempo_de_aula }} min</td>
            <td>{{ service.tipo_agendamento }}</td>
            <td>{{ service.categoria_id || "-" }}</td>
            <td>
              <img
                v-if="service.imagem"
                class="service-thumb"
                :src="serviceImageUrl(service.imagem)"
                alt="Imagem do servico"
              />
              <span v-else>-</span>
            </td>
            <td>
              <div class="actions">
                <button class="text-btn" @click="editService(service)">Editar</button>
                <button class="text-btn danger" @click="removeService(service.id)">Excluir</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!services.length && !servicesLoading" class="hint">Nenhum servico encontrado.</p>

    <div v-if="serviceModalOpen" class="modal-overlay" @click.self="closeServiceModal">
      <div class="modal-card">
        <div class="view-header">
          <h4>{{ serviceForm.id ? "Editar Servico" : "Novo Servico" }}</h4>
          <button class="text-btn" @click="closeServiceModal">Fechar</button>
        </div>
        <p v-if="categoriesLoading" class="hint">Carregando categorias...</p>
        <p v-if="categoriesError" class="error">{{ categoriesError }}</p>
        <div class="form-grid">
          <label class="field">
            <span>Titulo</span>
            <input type="text" v-model.trim="serviceForm.titulo" />
          </label>
          <label class="field">
            <span>Descricao</span>
            <input type="text" v-model.trim="serviceForm.descricao" />
          </label>
          <label class="field">
            <span>Preco (R$)</span>
            <input type="number" v-model.number="serviceForm.preco" />
          </label>
          <label class="field">
            <span>Tempo de Aula (min)</span>
            <input type="number" v-model.number="serviceForm.tempo_de_aula" />
          </label>
          <label class="field">
            <span>Tipo de Agendamento</span>
            <select v-model="serviceForm.tipo_agendamento">
              <option value="HORARIO">HORARIO</option>
              <option value="DIA">DIA</option>
            </select>
          </label>
          <label v-if="serviceForm.tipo_agendamento === 'DIA'" class="field">
            <span>Vagas por dia</span>
            <input type="number" v-model.number="serviceForm.vagas" min="1" />
          </label>
          <label class="field">
            <span>Categoria ID</span>
            <select v-model.number="serviceForm.categoria_id">
              <option :value="''">Selecione</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.nome || cat.id }}
              </option>
            </select>
          </label>
          <label class="field">
            <span>Imagem (URL)</span>
            <input type="file" accept="image/*" @change="onServiceImageChange" />
            <small class="hint">PNG/JPG ate 2MB.</small>
          </label>
        </div>
        <div class="actions">
          <button class="primary-btn" @click="saveService">Salvar</button>
          <button class="text-btn" @click="resetServiceForm">Limpar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ProfessorServicesView",
  props: {
    servicesLoading: {
      type: Boolean,
      required: true
    },
    servicesError: {
      type: String,
      default: ""
    },
    services: {
      type: Array,
      required: true
    },
    serviceModalOpen: {
      type: Boolean,
      required: true
    },
    serviceForm: {
      type: Object,
      required: true
    },
    categoriesLoading: {
      type: Boolean,
      required: true
    },
    categoriesError: {
      type: String,
      default: ""
    },
    categories: {
      type: Array,
      required: true
    },
    startNewService: {
      type: Function,
      required: true
    },
    editService: {
      type: Function,
      required: true
    },
    removeService: {
      type: Function,
      required: true
    },
    closeServiceModal: {
      type: Function,
      required: true
    },
    saveService: {
      type: Function,
      required: true
    },
    resetServiceForm: {
      type: Function,
      required: true
    },
    onServiceImageChange: {
      type: Function,
      required: true
    },
    serviceImageUrl: {
      type: Function,
      required: true
    }
  }
};
</script>
