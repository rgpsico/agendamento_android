<template>
  <section class="view client-services">
    <div class="view-header">
      <h3>Servicos</h3>
      <div class="header-actions">
        <button class="text-btn" @click="goToClientTab('companies')">Trocar empresa</button>
        <button
          class="text-btn save-btn"
          :disabled="!selectedCompany || isCompanySaved"
          @click="saveClientCompany"
        >
          {{ isCompanySaved ? "Empresa salva" : "Salvar empresa" }}
        </button>
      </div>
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
        <div class="company-badge">
          <div class="company-logo">
            <img
              v-if="selectedCompany && companyImageUrl && companyImageUrl(selectedCompany)"
              :src="companyImageUrl(selectedCompany)"
              :alt="`Logo da empresa ${selectedCompany.nome || 'Empresa'}`"
            />
            <span v-else class="company-logo-fallback">Sem logo</span>
          </div>
          <span class="company-name">{{ selectedCompany?.nome || "Empresa" }}</span>
        </div>
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
    companyImageUrl: {
      type: Function,
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
    },
    saveClientCompany: {
      type: Function,
      required: true
    },
    isCompanySaved: {
      type: Boolean,
      required: true
    }
  }
};
</script>

<style scoped>
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

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

.company-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.company-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.company-logo-fallback {
  font-size: 10px;
  color: var(--muted);
}

.company-name {
  font-weight: 600;
  color: var(--text);
  font-size: 14px;
}
</style>
