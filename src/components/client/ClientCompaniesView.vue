<template>
  <section class="view client-companies">
    <div class="view-header">
      <div class="header-content">
        <div class="header-title-wrapper">
          <div class="header-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div>
            <h3>Empresas</h3>
            <p class="header-subtitle">Escolha uma empresa para agendar</p>
          </div>
        </div>
      </div>
      
      <div class="company-search">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          v-model.trim="companySearch"
          type="text"
          placeholder="Buscar empresa..."
          aria-label="Filtrar empresas por nome"
        />
        <div v-if="companySearch" class="clear-search" @click="companySearch = ''" role="button" tabindex="0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>

    <div v-if="clientCompaniesLoading" class="loading-state">
      <div class="spinner-container">
        <div class="spinner"></div>
      </div>
      <p class="loading-text">Carregando empresas...</p>
    </div>

    <div v-if="clientCompaniesError" class="error-state">
      <div class="error-card">
        <div class="error-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div class="error-content">
          <p class="error-title">Ops! Algo deu errado</p>
          <p class="error-message">{{ clientCompaniesError }}</p>
        </div>
      </div>
    </div>

    <div class="companies-list" v-if="filteredCompanies.length && !clientCompaniesLoading">
      <div
        v-for="(company, index) in filteredCompanies"
        :key="company.id"
        class="company-card"
        @click="selectCompany(company)"
        :style="{ animationDelay: `${index * 0.05}s` }"
      >
        <div class="company-visual">
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
          <div v-if="companyRating(company) > 0" class="company-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>{{ formatRating(companyRating(company)) }}</span>
          </div>
        </div>

        <div class="company-content">
          <div class="company-info">
            <h4 class="company-name">{{ company.nome }}</h4>
            
            <div class="company-meta">
              <span class="company-location">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ companyCityLabel(company) }}
              </span>

              <div v-if="companyRating(company) > 0" class="company-rating" aria-label="Avaliacao da empresa">
                <div class="stars" aria-hidden="true">
                  <span
                    v-for="index in 5"
                    :key="index"
                    class="star"
                    :class="{ filled: index <= Math.round(companyRating(company)) }"
                  >
                    ★
                  </span>
                </div>
                <span v-if="companyRatingCount(company)" class="rating-count">
                  ({{ companyRatingCount(company) }})
                </span>
              </div>
            </div>

            <p v-if="company.descricao || companyDescricaoLabel(company)" class="company-description">
              {{ company.descricao || companyDescricaoLabel(company) }}
            </p>
          </div>

          <div class="company-footer">
            <span class="action-text">Ver serviços</span>
            <div class="action-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!filteredCompanies.length && !clientCompaniesLoading && !clientCompaniesError" class="empty-state">
      <div class="empty-illustration">
        <div class="empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <div class="empty-rings"></div>
      </div>
      <p class="empty-title">Nenhuma empresa encontrada</p>
      <p class="empty-subtitle">
        {{ companySearch ? 'Tente buscar com outro termo' : 'Não há empresas cadastradas no momento' }}
      </p>
    </div>
  </section>
</template>

<script>
export default {
  name: "ClientCompaniesView",
  data() {
    return {
      companySearch: ""
    };
  },
  computed: {
    filteredCompanies() {
      if (!this.companySearch) return this.clientCompanies;
      const query = this.companySearch.toLowerCase();
      return this.clientCompanies.filter((company) =>
        String(company.nome || "").toLowerCase().includes(query)
      );
    }
  },
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
  },
  methods: {
    companyRating(company) {
      const ratingSource = company?.avaliacao ?? company?.rating ?? company?.nota;
      if (ratingSource == null) return 0;

      if (typeof ratingSource === "number") {
        return this.normalizeRating(ratingSource);
      }

      if (Array.isArray(ratingSource)) {
        if (!ratingSource.length) return 0;
        const values = ratingSource
          .map((item) => {
            if (typeof item === "number") return item;
            if (!item || typeof item !== "object") return null;
            return item.nota ?? item.avaliacao ?? item.rating ?? item.pontuacao ?? item.media ?? null;
          })
          .filter((value) => Number.isFinite(value));

        if (!values.length) return 0;
        const total = values.reduce((sum, value) => sum + value, 0);
        return this.normalizeRating(total / values.length);
      }

      if (typeof ratingSource === "object") {
        const value = ratingSource.media ?? ratingSource.nota ?? ratingSource.avaliacao ?? ratingSource.rating ?? 0;
        return this.normalizeRating(Number(value) || 0);
      }

      return 0;
    },
    companyRatingCount(company) {
      const ratingSource = company?.avaliacao;
      if (Array.isArray(ratingSource)) return ratingSource.length;
      return company?.avaliacao_count ?? company?.rating_count ?? 0;
    },
    normalizeRating(value) {
      if (!Number.isFinite(value)) return 0;
      return Math.max(0, Math.min(5, value));
    },
    formatRating(value) {
      const safeValue = Number.isFinite(value) ? value : 0;
      return safeValue ? safeValue.toFixed(1).replace(".", ",") : "0,0";
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.client-companies {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

/* Header Modernizado */
.view-header {
  padding: 20px 16px 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

.header-content {
  margin-bottom: 16px;
}

.header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.header-icon svg {
  color: white;
}

.view-header h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.8px;
}

.header-subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

/* Search com Clear Button */
.company-search {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  z-index: 1;
}

.company-search input {
  width: 100%;
  padding: 14px 44px 14px 44px;
  border-radius: 14px;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  color: #0f172a;
  font-size: 15px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.company-search input::placeholder {
  color: #94a3b8;
}

.company-search input:focus {
  outline: none;
  background: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
  transform: translateY(-1px);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.clear-search:hover {
  background: #e2e8f0;
  transform: translateY(-50%) scale(1.1);
}

.clear-search:active {
  transform: translateY(-50%) scale(0.95);
}

.clear-search svg {
  color: #64748b;
}

/* Loading State Aprimorado */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  gap: 24px;
}

.spinner-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: #64748b;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* Error State Melhorado */
.error-state {
  padding: 24px 16px;
}

.error-card {
  display: flex;
  gap: 16px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.error-icon {
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.error-icon svg {
  color: #dc2626;
}

.error-content {
  flex: 1;
}

.error-title {
  font-size: 16px;
  font-weight: 700;
  color: #991b1b;
  margin: 0 0 6px 0;
}

.error-message {
  color: #b91c1c;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
}

/* Empty State Criativo */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 24px;
  text-align: center;
}

.empty-illustration {
  position: relative;
  margin-bottom: 28px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.empty-icon svg {
  color: #94a3b8;
}

.empty-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  animation: pulse-ring 2s ease-in-out infinite;
}

.empty-rings::before,
.empty-rings::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #e2e8f0;
  border-radius: 50%;
}

.empty-rings::before {
  width: 160px;
  height: 160px;
  animation: pulse-ring 2s 0.3s ease-in-out infinite;
}

.empty-rings::after {
  width: 180px;
  height: 180px;
  animation: pulse-ring 2s 0.6s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.empty-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px 0;
  letter-spacing: -0.5px;
}

.empty-subtitle {
  font-size: 15px;
  color: #64748b;
  margin: 0;
  line-height: 1.6;
  max-width: 320px;
}

/* Companies List */
.companies-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 16px 32px;
}

.company-card {
  display: flex;
  gap: 16px;
  background: white;
  border-radius: 20px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  animation: slideIn 0.4s ease forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.company-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.company-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.2);
}

.company-card:hover::before {
  opacity: 1;
}

.company-card:active {
  transform: translateY(-2px);
}

/* Company Visual */
.company-visual {
  flex-shrink: 0;
  position: relative;
}

.company-image-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 16px;
  overflow: hidden;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.company-card:hover .company-image-wrapper {
  border-color: #10b981;
  transform: scale(1.05);
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
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.company-placeholder svg {
  color: #94a3b8;
}

.company-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  border: 2px solid white;
}

/* Company Content */
.company-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 4px 0;
}

.company-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.company-name {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.5px;
  line-height: 1.3;
}

.company-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.company-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.company-location svg {
  flex-shrink: 0;
  color: #10b981;
}

.company-rating {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.stars {
  display: inline-flex;
  gap: 2px;
  line-height: 1;
}

.star {
  font-size: 14px;
  color: #e2e8f0;
  transition: color 0.2s ease;
}

.star.filled {
  color: #f59e0b;
}

.rating-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.company-description {
  margin: 0;
  font-size: 14px;
  color: #475569;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
}

.company-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 2px solid #f1f5f9;
}

.action-text {
  font-size: 14px;
  font-weight: 800;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.3px;
}

.action-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-icon svg {
  color: #059669;
  transition: transform 0.3s ease;
}

.company-card:hover .action-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  transform: scale(1.1);
}

.company-card:hover .action-icon svg {
  color: white;
  transform: translateX(2px);
}

/* Responsive */
@media (max-width: 360px) {
  .company-image-wrapper {
    width: 84px;
    height: 84px;
  }

  .company-name {
    font-size: 16px;
  }

  .company-description {
    font-size: 13px;
  }
}

@media (min-width: 640px) {
  .view-header {
    padding: 24px 24px 28px;
  }

  .companies-list {
    padding: 28px 24px 36px;
  }
}

@media (min-width: 768px) {
  .companies-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .companies-list {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1280px) {
  .view-header {
    padding: 28px 32px 32px;
  }

  .companies-list {
    padding: 32px;
    max-width: 1400px;
    margin: 0 auto;
  }
}

/* Melhorias de acessibilidade */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Estados de foco */
.clear-search:focus-visible,
.company-card:focus-visible {
  outline: 3px solid #10b981;
  outline-offset: 2px;
}
</style>