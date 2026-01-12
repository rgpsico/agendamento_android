<template>
  <section class="view">
    <h3>Dashboard</h3>
    <div class="filter-row">
      <label class="field small">
        <span>Data Inicio</span>
        <input type="date" :value="dashboardStart" @input="setDashboardStart($event.target.value)" />
      </label>
      <label class="field small">
        <span>Data Final</span>
        <input type="date" :value="dashboardEnd" @input="setDashboardEnd($event.target.value)" />
      </label>
      <button class="primary-btn" @click="applyDashboardFilter">Filtrar</button>
    </div>

    <div class="cards">
      <div class="card clickable" @click="openDaySchedule">
        <p class="card-title">Agendamentos do Dia</p>
        <p class="card-value">{{ dayAppointments.length }}</p>
        <p class="card-subtitle">{{ activeDayLabel }}</p>
      </div>
      <div class="card">
        <p class="card-title">Numero de Agendamentos no Mes</p>
        <p class="card-value">{{ monthAppointments.length }}</p>
        <p class="card-subtitle">{{ activeMonthLabel }}</p>
      </div>
      <div class="card">
        <p class="card-title">Agendamentos por Periodo</p>
        <div class="mini-chart">
          <div v-for="item in groupedByDate" :key="item.date" class="chart-row">
            <span>{{ item.label }}</span>
            <div class="bar">
              <span :style="{ width: item.count * 12 + 'px' }"></span>
            </div>
            <strong>{{ item.count }}</strong>
          </div>
          <p v-if="!groupedByDate.length" class="hint">Sem dados no periodo.</p>
        </div>
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
  }
};
</script>
