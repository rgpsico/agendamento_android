<template>
  <section class="view client-companies">
    <div class="view-header">
      <div class="header-content">
        <h3>Empresas</h3>
        <p class="header-subtitle">Escolha uma empresa para agendar</p>
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
      </div>
    </div>

    <div v-if="clientCompaniesLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando empresas...</p>
    </div>

    <div v-if="clientCompaniesError" class="error-state">
      <div class="error-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p class="error-message">{{ clientCompaniesError }}</p>
      </div>
    </div>

    <div class="companies-list" v-if="filteredCompanies.length && !clientCompaniesLoading">
      <div
        v-for="company in filteredCompanies"
        :key="company.id"
        class="company-card"
        @click="selectCompany(company)"
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
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
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

              <div class="company-rating" aria-label="Avaliacao da empresa">
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
                <span class="rating-value">
                  {{ formatRating(companyRating(company)) }}
                </span>
                <span v-if="companyRatingCount(company)" class="rating-count">
                  ({{ companyRatingCount(company) }})
                </span>
              </div>
            </div>

            <p class="company-description">
              {{ company.descricao || companyDescricaoLabel(company) }}
            </p>
          </div>

          <div class="company-footer">
            <span class="action-text">Ver serviços</span>
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!filteredCompanies.length && !clientCompaniesLoading && !clientCompaniesError" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
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
.client-companies {
  padding: 0;
  min-height: 100vh;
  background: #f8fafc;
}

/* Header */
.view-header {
  padding: 10px 14px 10px;
  background: linear-gradient(135deg, #1f5fbf 0%, #1a4d99 100%);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  margin-bottom: 8px;
}

.view-header h3 {
  margin: 0 0 3px 0;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

/* Search */
.company-search {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  z-index: 1;
}

.company-search input {
  width: 100%;
  padding: 9px 14px 9px 40px;
  border-radius: 12px;
  border: none;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.company-search input::placeholder {
  color: #94a3b8;
}

.company-search input:focus {
  outline: none;
  box-shadow: 0 4px 16px rgba(31, 95, 191, 0.15);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 20px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e2e8f0;
  border-top-color: #1f5fbf;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
  font-size: 15px;
  font-weight: 500;
}

/* Error State */
.error-state {
  padding: 20px 16px;
}

.error-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  padding: 18px;
  border-radius: 14px;
}

.error-card svg {
  flex-shrink: 0;
  color: #dc2626;
}

.error-message {
  color: #991b1b;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  line-height: 1.5;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
}

.empty-icon {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon svg {
  color: #94a3b8;
}

.empty-title {
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
}

.empty-subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
  max-width: 280px;
}

/* Companies List */
.companies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 16px 24px;
}

.company-card {
  display: flex;
  gap: 14px;
  background: #ffffff;
  border-radius: 18px;
  padding: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.company-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(31, 95, 191, 0.03) 0%, rgba(31, 95, 191, 0.01) 100%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.company-card:active {
  transform: scale(0.97);
  box-shadow: 0 8px 24px rgba(31, 95, 191, 0.15);
}

.company-card:active::before {
  opacity: 1;
}

/* Company Visual */
.company-visual {
  flex-shrink: 0;
}

.company-image-wrapper {
  width: 90px;
  height: 90px;
  border-radius: 14px;
  overflow: hidden;
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
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
  gap: 6px;
}

.company-name {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.3px;
  line-height: 1.3;
}

.company-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.company-location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.company-location svg {
  flex-shrink: 0;
  color: #94a3b8;
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
  font-size: 12px;
  color: #cbd5f5;
}

.star.filled {
  color: #f59e0b;
}

.rating-value {
  font-size: 12px;
  color: #475569;
  font-weight: 700;
}

.rating-count {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.company-description {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 400;
}

.company-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
}

.action-text {
  font-size: 14px;
  font-weight: 700;
  color: #1f5fbf;
  letter-spacing: -0.2px;
}

.chevron-icon {
  color: #1f5fbf;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 360px) {
  .company-image-wrapper {
    width: 76px;
    height: 76px;
  }

  .company-name {
    font-size: 16px;
  }

  .company-description {
    font-size: 12.5px;
  }
}

@media (min-width: 768px) {
  .companies-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .company-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(31, 95, 191, 0.12);
  }

  .company-card:hover::before {
    opacity: 1;
  }
}

@media (min-width: 1024px) {
  .companies-list {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1280px) {
  .view-header {
    padding: 24px 24px 28px;
  }

  .companies-list {
    padding: 28px 24px 32px;
    gap: 18px;
  }
}
</style>
