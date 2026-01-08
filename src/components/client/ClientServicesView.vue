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
        <div class="service-image-wrapper">
          <img
            v-if="service.imagem && serviceImageUrl"
            :src="serviceImageUrl(service.imagem)"
            alt="Imagem do servico"
            class="service-image"
          />
          <div v-else class="service-image-placeholder">Sem imagem</div>
        </div>
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
    serviceImageUrl: {
      type: Function,
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

<style scoped>
.service-image-wrapper {
  width: 100%;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--background);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}

.service-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.service-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background: linear-gradient(135deg, #f0f4f8 0%, #e7eef5 100%);
  font-size: 13px;
}
</style>
