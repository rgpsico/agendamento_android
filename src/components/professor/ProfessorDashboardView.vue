<template>
  <section class="dashboard-view">
    <!-- Header com gradiente -->
    <div class="dashboard-header">
      <div class="header-content">
        <h3 class="dashboard-title">Dashboard</h3>
        <p class="dashboard-subtitle">Visão geral dos seus agendamentos</p>
      </div>
      <div class="header-decoration"></div>
    </div>

    <!-- Filtros com design moderno -->
    <div class="filters-card">
      <div class="filters-header">
        <div class="header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <span>Filtrar Período</span>
      </div>
      
      <div class="filters-grid">
        <label class="field">
          <span class="field-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Data Início
          </span>
          <input 
            type="date" 
            :value="dashboardStart" 
            @input="setDashboardStart($event.target.value)"
            class="field-input"
          />
        </label>
        <label class="field">
          <span class="field-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Data Final
          </span>
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

    <!-- Cards de Métricas com animações -->
    <div class="metrics-grid">
      <!-- Agendamentos do Dia -->
      <div class="metric-card today-card clickable" @click="openDaySchedule">
        <div class="metric-glow today-glow"></div>
        <div class="metric-header">
          <div class="metric-icon today">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      <div class="metric-card month-card">
        <div class="metric-glow month-glow"></div>
        <div class="metric-header">
          <div class="metric-icon month">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <h4 class="chart-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            Agendamentos por Período
          </h4>
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
        <div v-for="(item, index) in groupedByDate" :key="item.date" class="chart-item" :style="{ animationDelay: `${index * 0.05}s` }">
          <div class="chart-item-header">
            <span class="chart-date">
              <span class="date-dot"></span>
              {{ item.label }}
            </span>
            <span class="chart-count">{{ item.count }}</span>
          </div>
          <div class="chart-bar-container">
            <div 
              class="chart-bar" 
              :style="{ width: getBarWidth(item.count) + '%' }"
            >
              <span class="chart-bar-label" v-if="item.count > 0">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="chart-empty">
        <div class="empty-icon">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
        </div>
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
      const minWidth = 8;
      const calculatedWidth = (count / this.maxCount) * 100;
      return Math.max(calculatedWidth, count > 0 ? minWidth : 0);
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-view {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  min-height: 100vh;
}

/* Header com decoração */
.dashboard-header {
  margin-bottom: 28px;
  position: relative;
  padding: 24px 0;
}

.header-content {
  position: relative;
  z-index: 1;
}

.header-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.dashboard-title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
}

.dashboard-subtitle {
  margin: 0;
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
}

/* Filtros modernos */
.filters-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: all 0.3s ease;
}

.filters-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.filters-grid {
  display: grid;
  gap: 16px;
  margin-bottom: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 6px;
}

.field-label svg {
  color: #64748b;
}

.field-input {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f8fafc;
  color: #0f172a;
}

.field-input:hover {
  border-color: #cbd5e1;
  background: white;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.filter-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  letter-spacing: 0.3px;
}

.filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
}

.filter-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Métricas com efeitos */
.metrics-grid {
  display: grid;
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.metric-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.today-glow {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
}

.month-glow {
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%);
}

.metric-card:hover .metric-glow {
  opacity: 1;
}

.metric-card.clickable {
  cursor: pointer;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.1), 0 8px 16px -4px rgba(0, 0, 0, 0.06);
}

.metric-card.clickable:active {
  transform: translateY(-2px);
}

.metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.metric-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  position: relative;
  transition: transform 0.3s ease;
}

.metric-card:hover .metric-icon {
  transform: scale(1.05) rotate(-5deg);
}

.metric-icon.today {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 8px 16px rgba(16, 185, 129, 0.35);
}

.metric-icon.month {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.35);
}

.metric-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: #dcfce7;
  color: #166534;
}

.metric-badge.month {
  background: #ede9fe;
  color: #5b21b6;
}

.metric-content {
  margin-bottom: 20px;
}

.metric-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-value {
  margin: 0 0 12px 0;
  font-size: 42px;
  font-weight: 900;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: -2px;
}

.metric-subtitle {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.metric-subtitle svg {
  color: #94a3b8;
}

.metric-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
  font-size: 14px;
  font-weight: 700;
  color: #10b981;
  transition: gap 0.3s ease;
}

.metric-card.clickable:hover .metric-action {
  gap: 8px;
}

.metric-action svg {
  transition: transform 0.3s ease;
}

.metric-card.clickable:hover .metric-action svg {
  transform: translateX(6px);
}

/* Gráfico melhorado */
.chart-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.chart-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-title svg {
  color: #3b82f6;
}

.chart-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.chart-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  min-width: 80px;
}

.summary-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 900;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-item {
  animation: slideIn 0.5s ease forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chart-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.chart-date {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-dot {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.chart-count {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 8px;
  min-width: 40px;
  text-align: center;
}

.chart-bar-container {
  height: 40px;
  background: #f8fafc;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  border: 2px solid #f1f5f9;
}

.chart-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 14px;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.chart-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
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
  font-size: 13px;
  font-weight: 800;
  color: white;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Empty State aprimorado */
.chart-empty {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #e2e8f0;
}

.empty-icon svg {
  color: #cbd5e1;
}

.empty-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 700;
  color: #334155;
}

.empty-description {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto;
}

/* Responsivo - Tablet */
@media (min-width: 640px) {
  .dashboard-view {
    padding: 24px;
  }

  .dashboard-header {
    padding: 32px 0;
  }

  .dashboard-title {
    font-size: 40px;
  }

  .dashboard-subtitle {
    font-size: 16px;
  }

  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filter-btn {
    width: auto;
    min-width: 200px;
  }
}

/* Responsivo - Desktop */
@media (min-width: 1024px) {
  .dashboard-view {
    padding: 40px;
  }

  .filters-card {
    padding: 32px;
  }

  .chart-card {
    padding: 36px;
  }

  .metric-card {
    padding: 28px;
  }

  .chart-bar-container {
    height: 48px;
  }

  .header-decoration {
    width: 300px;
    height: 300px;
  }
}

/* Responsivo - Mobile pequeno */
@media (max-width: 380px) {
  .dashboard-title {
    font-size: 26px;
  }

  .metric-value {
    font-size: 36px;
  }

  .chart-title {
    font-size: 16px;
  }

  .filters-card,
  .metric-card,
  .chart-card {
    padding: 20px;
  }
}

/* Animações adicionais */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-header,
.filters-card,
.metric-card,
.chart-card {
  animation: fadeIn 0.6s ease forwards;
}

.filters-card {
  animation-delay: 0.1s;
}

.metric-card:nth-child(1) {
  animation-delay: 0.2s;
}

.metric-card:nth-child(2) {
  animation-delay: 0.3s;
}

.chart-card {
  animation-delay: 0.4s;
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

/* Focus visible para navegação por teclado */
.filter-btn:focus-visible,
.field-input:focus-visible,
.metric-card.clickable:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

/* Hover states aprimorados para desktop */
@media (hover: hover) {
  .chart-item:hover .chart-bar {
    filter: brightness(1.1);
  }

  .chart-item:hover .date-dot {
    transform: scale(1.3);
    transition: transform 0.3s ease;
  }
}

/* Dark mode support (opcional) */
@media (prefers-color-scheme: dark) {
  .dashboard-view {
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  }

  .filters-card,
  .metric-card,
  .chart-card {
    background: #1e293b;
    border-color: #334155;
  }

  .dashboard-title,
  .metric-value,
  .chart-title,
  .chart-date,
  .chart-count {
    background: linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .field-input {
    background: #0f172a;
    border-color: #334155;
    color: #f8fafc;
  }

  .field-input:hover {
    background: #1e293b;
    border-color: #475569;
  }

  .field-input:focus {
    background: #1e293b;
  }

  .chart-bar-container {
    background: #0f172a;
    border-color: #334155;
  }

  .empty-icon {
    background: #0f172a;
    border-color: #334155;
  }

  .chart-summary {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-color: #334155;
  }
}
</style>