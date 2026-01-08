<template>
  <section class="view client-services">
    <div class="view-header">
      <h3>Servicos</h3>
      <button class="text-btn" @click="goToClientTab('companies')">Trocar empresa</button>
    </div>
    <p v-if="clientServicesLoading" class="hint">Carregando servicos...</p>
    <p v-if="clientServicesError" class="error">{{ clientServicesError }}</p>
    <p v-if="!selectedCompany" class="hint">Selecione uma empresa para ver os servicos.</p>
    <div v-else class="cards">
      <div
        v-for="service in clientServicesForCompany"
        :key="service.id"
        class="card clickable"
        @click="selectService(service)"
      >
        <p class="card-title">{{ service.titulo || service.nome || "Servico" }}</p>
        <p class="card-subtitle">
          {{ service.tempo_de_aula || service.duracao || "-" }} min | R$ {{ service.preco || "-" }}
        </p>
        <p class="subtitle">{{ service.descricao }}</p>
        <button class="text-btn">Ver horarios</button>
      </div>
    </div>
    <p v-if="selectedCompany && !clientServicesForCompany.length" class="hint">
      Nenhum servico cadastrado.
    </p>
  </section>
</template>

<script>
export default {
  name: "ClientServicesView",
  props: {
    clientServicesLoading: {
      type: Boolean,
      required: true
    },
    clientServicesError: {
      type: String,
      default: ""
    },
    selectedCompany: {
      type: Object,
      default: null
    },
    clientServicesForCompany: {
      type: Array,
      required: true
    },
    selectService: {
      type: Function,
      required: true
    },
    goToClientTab: {
      type: Function,
      required: true
    }
  }
};
</script>
