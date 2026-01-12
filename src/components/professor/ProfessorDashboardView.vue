<template>
  <section class="dashboard-view">
    <!-- Header -->
    <div class="dashboard-header">
      <h3 class="dashboard-title">Dashboard</h3>
      <p class="dashboard-subtitle">Visão geral dos seus agendamentos</p>
    </div>

    <!-- Filtros -->
    <div class="filters-card">
      <div class="filters-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span>Filtrar Período</span>
      </div>
      
      <div class="filters-grid">
        <label class="field">
          <span class="field-label">Data Início</span>
          <input 
            type="date" 
            :value="dashboardStart" 
            @input="setDashboardStart($event.target.value)"
            class="field-input"
          />
        </label>
        <label class="field">
          <span class="field-label">Data Final</span>
          <input 
            type="date" 
            :value="dashboardEnd" 
            @input="setDashboardEnd($event.target.value)"
            class="field-input"
          />
        </label>
      </div>
      
      <button class="filter-btn" @click="applyDashboardFilter">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        Aplicar Filtro
      </button>
    </div>

    <!-- Cards de Métricas -->
    <div class="metrics-grid">
      <!-- Agendamentos do Dia -->
      <div class="metric-card clickable" @click="openDaySchedule">
        <div class="metric-header">
          <div class="metric-icon today">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="8" y1="14" x2="16" y2="14"></line>
              <line x1="8" y1="18" x2="12" y2="18"></line>
            </svg>
          </div>
          <span class="metric-badge">Hoje</span>
        </div>
        
        <div class="metric-content">
          <h4 class="metric-title">Agendamentos do Dia</h4>
          <p class="metric-value">{{ dayAppointments.length }}</p>
          <p class="metric-subtitle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ activeDayLabel }}
          </p>
        </div>

        <div class="metric-action">
          <span>Ver detalhes</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>

      <!-- Agendamentos do Mês -->
      <div class="metric-card">
        <div class="metric-header">
          <div class="metric-icon month">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <span class="metric-badge month">Mensal</span>
        </div>
        
        <div class="metric-content">
          <h4 class="metric-title">Total no Mês</h4>
          <p class="metric-value">{{ monthAppointments.length }}</p>
          <p class="metric-subtitle">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            {{ activeMonthLabel }}
          </p>
        </div>
      </div>
    </div>

    <!-- Gráfico de Agendamentos por Período -->
    <div class="chart-card">
      <div class="chart-header">
        <div>
          <h4 class="chart-title">Agendamentos por Período</h4>
          <p class="chart-subtitle">
            Distribuição dos agendamentos no período selecionado
          </p>
        </div>
        <div v-if="groupedByDate.length" class="chart-summary">
          <span class="summary-label">Total</span>
          <span class="summary-value">{{ totalAppointments }}</span>
        </div>
      </div>

      <div v-if="groupedByDate.length" class="chart-content">
        <div v-for="item in groupedByDate" :key="item.date" class="chart-item">
          <div class="chart-item-header">
            <span class="chart-date">{{ item.label }}</span>
            <span class="chart-count">{{ item.count }}</span>
          </div>
          <div class="chart-bar-container">
            <div 
              class="chart-bar" 
              :style="{ width: getBarWidth(item.count) + '%' }"
            >
              <span class="chart-bar-label">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="chart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
        </svg>
        <p class="empty-title">Nenhum agendamento encontrado</p>
        <p class="empty-description">
          Não há dados para exibir no período selecionado. Tente ajustar as datas do filtro.
        </p>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ProfessorDashboardView",
  props: {
    dashboardStart: {
      type: String,
      required: true
    },
    dashboardEnd: {
      type: String,
      required: true
    },
    dayAppointments: {
      type: Array,
      required: true
    },
    activeDayLabel: {
      type: String,
      required: true
    },
    monthAppointments: {
      type: Array,
      required: true
    },
    activeMonthLabel: {
      type: String,
      required: true
    },
    groupedByDate: {
      type: Array,
      required: true
    },
    setDashboardStart: {
      type: Function,
      required: true
    },
    setDashboardEnd: {
      type: Function,
      required: true
    },
    applyDashboardFilter: {
      type: Function,
      required: true
    },
    openDaySchedule: {
      type: Function,
      required: true
    }
  },
  computed: {
    totalAppointments() {
      return this.groupedByDate.reduce((sum, item) => sum + item.count, 0);
    },
    maxCount() {
      if (!this.groupedByDate.length) return 0;
      return Math.max(...this.groupedByDate.map(item => item.count));
    }
  },
  methods: {
    getBarWidth(count) {
      if (this.maxCount === 0) return 0;
      const minWidth = 5; // Largura mínima para barras com valores baixos
      const calculatedWidth = (count / this.maxCount) * 100;
      return Math.max(calculatedWidth, count > 0 ? minWidth : 0);
    }
  }
};
</script>

<style scoped>
.dashboard-view {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8fafc;
  min-height: 100vh;
}

/* Header */
.dashboard-header {
  margin-bottom: 20px;
}

.dashboard-title {
  margin: 0 0 4px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}

.dashboard-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* Filtros */
.filters-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 600;
  font-size: 15px;
  color: #334155;
}

.filters-header svg {
  color: #3b82f6;
}

.filters-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 16px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}

.field-input {
  padding: 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.2s;
  background: white;
  -webkit-appearance: none;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.filter-btn:active {
  transform: scale(0.98);
}

/* Métricas */
.metrics-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.metric-card.clickable {
  cursor: pointer;
  border: 2px solid transparent;
}

.metric-card.clickable:active {
  transform: scale(0.98);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.metric-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.metric-icon.today {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.metric-icon.month {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.metric-badge {
  padding: 4px 10px;
  background: #dcfce7;
  color: #166534;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-badge.month {
  background: #ede9fe;
  color: #5b21b6;
}

.metric-content {
  margin-bottom: 16px;
}

.metric-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.metric-value {
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -1px;
}

.metric-subtitle {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
}

.metric-subtitle svg {
  color: #94a3b8;
}

.metric-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.metric-action svg {
  transition: transform 0.2s;
}

.metric-card.clickable:hover .metric-action svg {
  transform: translateX(4px);
}

/* Gráfico */
.chart-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 12px;
}

.chart-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.chart-subtitle {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.chart-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-date {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.chart-count {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  padding: 2px 8px;
  background: #f1f5f9;
  border-radius: 6px;
}

.chart-bar-container {
  height: 32px;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.chart-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 12px;
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
  position: relative;
}

.chart-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  pointer-events: none;
}

.chart-bar-label {
  font-size: 12px;
  font-weight: 700;
  color: white;
  z-index: 1;
}

/* Empty State */
.chart-empty {
  text-align: center;
  padding: 48px 20px;
}

.chart-empty svg {
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
}

.empty-description {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
}

/* Responsivo - Tablet */
@media (min-width: 640px) {
  .dashboard-view {
    padding: 24px;
  }

  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-title {
    font-size: 32px;
  }
}

/* Responsivo - Desktop */
@media (min-width: 1024px) {
  .dashboard-view {
    padding: 32px;
  }

  .filters-card {
    padding: 24px;
  }

  .filter-btn {
    width: auto;
    align-self: flex-start;
    padding: 12px 32px;
  }

  .chart-card {
    padding: 28px;
  }

  .chart-item-header {
    margin-bottom: 4px;
  }
}
</style>