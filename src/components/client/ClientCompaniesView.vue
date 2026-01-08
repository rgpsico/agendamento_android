<template>
  <section class="view client-companies">
    <div class="view-header">
      <h3>Empresas</h3>
      <p class="header-subtitle">Escolha uma empresa para agendar</p>
    </div>

    <div v-if="clientCompaniesLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando empresas...</p>
    </div>

    <div v-if="clientCompaniesError" class="error-state">
      <p class="error">{{ clientCompaniesError }}</p>
    </div>

    <div class="companies-list" v-if="clientCompanies.length && !clientCompaniesLoading">
      <div
        v-for="company in clientCompanies"
        :key="company.id"
        class="company-card"
        @click="selectCompany(company)"
      >
        <div class="company-image-wrapper">
          <img
            v-if="companyImageUrl(company)"
            :src="companyImageUrl(company)"
            alt="Imagem da empresa"
            class="company-image"
          />
          <div v-else class="company-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
        </div>

        <div class="company-content">
          <div class="company-header">
            <h4 class="company-name">{{ company.nome }}</h4>
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
          
          <p class="company-location">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            {{ companyCityLabel(company) }}
          </p>

          <p class="company-description">
            {{ company.descricao || companyDescricaoLabel(company) }}
          </p>

          <div class="company-action">
            <span class="action-text">Ver serviços</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!clientCompanies.length && !clientCompaniesLoading && !clientCompaniesError" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      <p class="empty-title">Nenhuma empresa disponível</p>
      <p class="empty-subtitle">Não há empresas cadastradas no momento</p>
    </div>
  </section>
</template>

<script>
export default {
  name: "ClientCompaniesView",
  props: {
    clientCompanies: {
      type: Array,
      required: true
    },
    clientCompaniesLoading: {
      type: Boolean,
      required: true
    },
    clientCompaniesError: {
      type: String,
      default: ""
    },
    selectCompany: {
      type: Function,
      required: true
    },
    companyCityLabel: {
      type: Function,
      required: true
    },
    companyDescricaoLabel: {
      type: Function,
      required: true
    },
    companyImageUrl: {
      type: Function,
      required: true
    }
  }
};
</script>

<style scoped>
.client-companies {
  padding: 0;
}

.view-header {
  padding: 20px 20px 16px;
  background: #fff;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 5;
}

.view-header h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: var(--text);
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--muted);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--muted);
  font-size: 14px;
}

/* Error State */
.error-state {
  padding: 20px;
}

.error {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  font-size: 14px;
  margin: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  gap: 12px;
}

.empty-state svg {
  color: var(--muted);
  opacity: 0.3;
  margin-bottom: 8px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.empty-subtitle {
  font-size: 14px;
  color: var(--muted);
  margin: 0;
}

/* Companies List */
.companies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.company-card {
  display: flex;
  gap: 16px;
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  border: 2px solid var(--border);
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.company-card:active {
  transform: scale(0.98);
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(31, 95, 191, 0.15);
}

/* Company Image */
.company-image-wrapper {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--background);
  border: 1px solid var(--border);
}

.company-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background: linear-gradient(135deg, #f0f4f8 0%, #e7eef5 100%);
}

/* Company Content */
.company-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.company-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.company-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chevron-icon {
  flex-shrink: 0;
  color: var(--muted);
}

.company-location {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}

.company-location svg {
  flex-shrink: 0;
}

.company-description {
  margin: 0;
  font-size: 14px;
  color: var(--text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.company-action {
  margin-top: 4px;
}

.action-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary);
}

/* Responsive */
@media (max-width: 380px) {
  .company-image-wrapper {
    width: 70px;
    height: 70px;
  }

  .company-name {
    font-size: 16px;
  }

  .company-description {
    font-size: 13px;
  }
}

@media (min-width: 768px) {
  .companies-list {
    grid-template-columns: repeat(2, 1fr);
    display: grid;
  }
}

@media (min-width: 1024px) {
  .companies-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>