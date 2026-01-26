<template>
  <div class="app-layout client-layout" :class="{ 'theme-dark': isDark }">
    <div class="app-main">
      <header class="topbar">
        <div class="topbar-content">
          <div class="topbar-brand">
            <div class="brand-icon client-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 20c2-4 6-6 8-6s6 2 8 6"></path>
              </svg>
            </div>
            <div class="brand-info">
              <p class="brand-label">Cliente</p>
              <h2 class="brand-name">{{ clientProfile.nome || "Bem-vindo" }}</h2>
            </div>
          </div>
          
          <div class="topbar-actions">
            <button 
              class="action-btn company-btn" 
              :disabled="!isClientCompanySaved" 
              @click="goToSavedCompany"
              :title="isClientCompanySaved ? 'Ir para minha empresa' : 'Nenhuma empresa salva'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span class="company-text">Minha empresa</span>
            </button>
            
            <button class="action-btn theme-btn" @click="toggleTheme" :title="isDark ? 'Modo claro' : 'Modo escuro'">
              <svg v-if="!isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </button>
            
            <button class="action-btn logout-btn" @click="clientLogout">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span class="logout-text">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main class="content">
        <ClientCompaniesView
          v-if="clientTab === 'companies'"
          :client-companies="clientCompanies"
          :client-companies-loading="clientCompaniesLoading"
          :client-companies-error="clientCompaniesError"
          :select-company="selectCompany"
          :company-city-label="companyCityLabel"
          :company-descricao-label="companyDescricaoLabel"
          :company-image-url="companyImageUrl"
        />

        <ClientServicesView
          v-if="clientTab === 'services'"
          :client-services-loading="clientServicesLoading"
          :client-services-error="clientServicesError"
          :selected-company="selectedCompany"
          :client-services-for-company="clientServicesForCompany"
          :service-image-url="serviceImageUrl"
          :company-image-url="companyImageUrl"
          :select-service="selectService"
          :go-to-client-tab="goToClientTab"
          :is-company-saved="isClientCompanySaved"
          :save-client-company="saveClientCompany"
        />

        <ClientBookingsView
          v-if="clientTab === 'bookings'"
          :client-bookings-detailed="clientBookingsDetailed"
          :client-profile="clientProfile"
          :fetch-waitlist-queue="fetchWaitlistQueue"
          :remove-client-booking="removeClientBooking"
        />

        <ClientProfileView
          v-if="clientTab === 'profile'"
          :client-profile="clientProfile"
          :client-profile-saved="clientProfileSaved"
          :save-client-profile="saveClientProfile"
        />

        <ClientMessagesView
          v-if="clientTab === 'messages'"
          :client-profile="clientProfile"
        />
      </main>
    </div>

    <nav class="bottom-nav client-nav" aria-label="Menu principal">
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'companies' }"
        @click="goToClientTab('companies')"
        :aria-label="'Ir para Empresas' + (clientTab === 'companies' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"></path>
            <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" stroke-width="2"></polyline>
          </svg>
        </div>
        <span class="nav-label">Empresas</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'bookings' }"
        @click="goToClientTab('bookings')"
        :aria-label="'Ir para Horários' + (clientTab === 'bookings' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
            <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" stroke-width="2"></line>
            <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" stroke-width="2"></line>
            <line x1="3" y1="11" x2="21" y2="11" stroke="currentColor" stroke-width="2"></line>
          </svg>
        </div>
        <span class="nav-label">Horários</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'profile' }"
        @click="goToClientTab('profile')"
        :aria-label="'Ir para Perfil' + (clientTab === 'profile' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"></circle>
            <path d="M4 20c2-4 6-6 8-6s6 2 8 6" fill="none" stroke="currentColor" stroke-width="2"></path>
          </svg>
        </div>
        <span class="nav-label">Perfil</span>
      </button>
      
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'messages' }"
        @click="goToClientTab('messages')"
        :aria-label="'Ir para Mensagens' + (clientTab === 'messages' ? ' (ativo)' : '')"
      >
        <div class="nav-icon">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2"></path>
          </svg>
        </div>
        <span class="nav-label">Mensagens</span>
      </button>
    </nav>

    <ClientSlotsModal
      :show-slots-modal="showSlotsModal"
      :selected-service="selectedService"
      :client-schedule-date="clientScheduleDate"
      :selected-company-label="selectedCompanyLabel"
      :selected-service-label="selectedServiceLabel"
      :client-availability-loading="clientAvailabilityLoading"
      :client-availability-error="clientAvailabilityError"
      :client-available-slots="clientAvailableSlots"
      :set-client-schedule-date="setClientScheduleDate"
      :open-checkout="openCheckout"
      :close-slots-modal="closeSlotsModal"
    />

    <ClientCheckoutModal
      :checkout-open="checkoutOpen"
      :checkout-loading="checkoutLoading"
      :checkout-error="checkoutError"
      :checkout-summary="checkoutSummary"
      :checkout-methods="checkoutMethods"
      :checkout-method="checkoutMethod"
      :checkout-status="checkoutStatus"
      :checkout-card="checkoutCard"
      :checkout-pix-data="checkoutPixData"
      :checkout-pix-message="checkoutPixMessage"
      :checkout-pix-finalize-ready="checkoutPixFinalizeReady"
      :checkout-pix-expiration="checkoutPixExpiration"
      :set-checkout-method="setCheckoutMethod"
      :set-checkout-status="setCheckoutStatus"
      :set-checkout-card="setCheckoutCard"
      :close-checkout="closeCheckout"
      :confirm-checkout="confirmCheckout"
      :finalize-checkout="finalizeCheckout"
    />
  </div>
</template>

<script>
import ClientBookingsView from "./client/ClientBookingsView.vue";
import ClientCheckoutModal from "./client/ClientCheckoutModal.vue";
import ClientCompaniesView from "./client/ClientCompaniesView.vue";
import ClientProfileView from "./client/ClientProfileView.vue";
import ClientServicesView from "./client/ClientServicesView.vue";
import ClientSlotsModal from "./client/ClientSlotsModal.vue";
import ClientMessagesView from "./client/ClientMessagesView.vue";

const THEME_KEY = "agenda_theme";
const THEMES = { LIGHT: "light", DARK: "dark" };

function loadTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  return stored == THEMES.DARK ? THEMES.DARK : THEMES.LIGHT;
}

export default {
  name: "ClientPortal",
  components: {
    ClientBookingsView,
    ClientCheckoutModal,
    ClientCompaniesView,
    ClientProfileView,
    ClientMessagesView,
    ClientServicesView,
    ClientSlotsModal
  },
  props: {
    showClientSidebar: {
      type: Boolean,
      required: true
    },
    clientTab: {
      type: String,
      required: true
    },
    clientProfile: {
      type: Object,
      required: true
    },
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
    clientServices: {
      type: Array,
      required: true
    },
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
    selectedService: {
      type: Object,
      default: null
    },
    selectedCompanyLabel: {
      type: String,
      required: true
    },
    selectedServiceLabel: {
      type: String,
      required: true
    },
    clientScheduleDate: {
      type: String,
      required: true
    },
    clientAvailabilityLoading: {
      type: Boolean,
      required: true
    },
    clientAvailabilityError: {
      type: String,
      default: ""
    },
    clientAvailableSlots: {
      type: Array,
      required: true
    },
    clientBookingsDetailed: {
      type: Array,
      required: true
    },
    clientProfileSaved: {
      type: Boolean,
      required: true
    },
    isClientCompanySaved: {
      type: Boolean,
      required: true
    },
    goToSavedCompany: {
      type: Function,
      required: true
    },
    showSlotsModal: {
      type: Boolean,
      required: true
    },
    toggleClientSidebar: {
      type: Function,
      required: true
    },
    closeClientSidebar: {
      type: Function,
      required: true
    },
    goToClientTab: {
      type: Function,
      required: true
    },
    clientLogout: {
      type: Function,
      required: true
    },
    selectCompany: {
      type: Function,
      required: true
    },
    saveClientCompany: {
      type: Function,
      required: true
    },
    selectService: {
      type: Function,
      required: true
    },
    bookSlot: {
      type: Function,
      required: true
    },
    removeClientBooking: {
      type: Function,
      required: true
    },
    fetchWaitlistQueue: {
      type: Function,
      required: true
    },
    closeSlotsModal: {
      type: Function,
      required: true
    },
    saveClientProfile: {
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
    },
    serviceImageUrl: {
      type: Function,
      required: true
    },
    setClientScheduleDate: {
      type: Function,
      required: true
    },
    openCheckout: {
      type: Function,
      required: true
    },
    closeCheckout: {
      type: Function,
      required: true
    },
    confirmCheckout: {
      type: Function,
      required: true
    },
    checkoutOpen: {
      type: Boolean,
      required: true
    },
    checkoutLoading: {
      type: Boolean,
      required: true
    },
    checkoutError: {
      type: String,
      default: ""
    },
    checkoutSummary: {
      type: Object,
      required: true
    },
    checkoutMethods: {
      type: Array,
      required: true
    },
    checkoutMethod: {
      type: String,
      required: true
    },
    checkoutStatus: {
      type: String,
      required: true
    },
    checkoutCard: {
      type: Object,
      required: true
    },
    checkoutPixData: {
      type: Object,
      default: null
    },
    checkoutPixMessage: {
      type: String,
      default: ""
    },
    checkoutPixFinalizeReady: {
      type: Boolean,
      required: true
    },
    checkoutPixExpiration: {
      type: String,
      default: ""
    },
    setCheckoutMethod: {
      type: Function,
      required: true
    },
    setCheckoutStatus: {
      type: Function,
      required: true
    },
    setCheckoutCard: {
      type: Function,
      required: true
    },
    finalizeCheckout: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      theme: loadTheme()
    };
  },
  computed: {
    isDark() {
      return this.theme === THEMES.DARK;
    }
  },
  methods: {
    toggleTheme() {
      this.theme = this.isDark ? THEMES.LIGHT : THEMES.DARK;
      localStorage.setItem(THEME_KEY, this.theme);
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* Layout Principal */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8fafc;
  transition: background-color 0.3s ease;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Topbar Modernizada */
.topbar {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
}

.topbar-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.topbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: transform 0.3s ease;
}

.brand-icon.client-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.brand-icon:hover {
  transform: scale(1.05) rotate(-5deg);
}

.brand-info {
  min-width: 0;
  flex: 1;
}

.brand-label {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.brand-name {
  margin: 2px 0 0 0;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.5px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.action-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.company-btn {
  color: #10b981;
  border-color: #d1fae5;
  background: #ecfdf5;
}

.company-btn:hover:not(:disabled) {
  background: #d1fae5;
  border-color: #a7f3d0;
}

.company-text {
  display: none;
}

.theme-btn {
  padding: 10px;
}

.theme-btn svg {
  transition: transform 0.5s ease;
}

.theme-btn:hover svg {
  transform: rotate(20deg);
}

.logout-btn {
  color: #ef4444;
  border-color: #fee2e2;
  background: #fef2f2;
}

.logout-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

.logout-text {
  display: none;
}

/* Content Area */
.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Bottom Navigation */
.bottom-nav {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.bottom-nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  max-width: 100px;
}

.nav-icon {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nav-icon svg {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.nav-label {
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  transition: all 0.3s ease;
}

.bottom-nav-btn:hover {
  color: #10b981;
}

.bottom-nav-btn:hover .nav-icon {
  transform: translateY(-2px);
}

.bottom-nav-btn.active {
  color: #10b981;
}

.bottom-nav-btn.active .nav-icon {
  transform: scale(1.1);
}

.bottom-nav-btn.active .nav-icon::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

.bottom-nav-btn.active .nav-label {
  font-weight: 800;
}

/* Theme Dark */
.theme-dark {
  background: #0f172a;
}

.theme-dark .topbar {
  background: #1e293b;
  border-bottom-color: #334155;
}

.theme-dark .brand-label {
  color: #94a3b8;
}

.theme-dark .brand-name {
  color: #f8fafc;
}

.theme-dark .action-btn {
  background: #0f172a;
  border-color: #334155;
  color: #cbd5e1;
}

.theme-dark .action-btn:hover:not(:disabled) {
  background: #1e293b;
  border-color: #475569;
}

.theme-dark .company-btn {
  color: #6ee7b7;
  border-color: #064e3b;
  background: #022c22;
}

.theme-dark .company-btn:hover:not(:disabled) {
  background: #064e3b;
  border-color: #065f46;
}

.theme-dark .logout-btn {
  color: #fca5a5;
  border-color: #7f1d1d;
  background: #450a0a;
}

.theme-dark .logout-btn:hover {
  background: #7f1d1d;
  border-color: #991b1b;
}

.theme-dark .bottom-nav {
  background: #1e293b;
  border-top-color: #334155;
}

.theme-dark .bottom-nav-btn {
  color: #94a3b8;
}

.theme-dark .bottom-nav-btn:hover {
  color: #6ee7b7;
}

.theme-dark .bottom-nav-btn.active {
  color: #6ee7b7;
}

.theme-dark .bottom-nav-btn.active .nav-icon::before {
  background: #6ee7b7;
  box-shadow: 0 0 8px rgba(110, 231, 183, 0.6);
}

.theme-dark .content {
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
}

/* Responsivo - Tablet */
@media (min-width: 640px) {
  .topbar {
    padding: 16px 24px;
  }

  .brand-icon {
    width: 52px;
    height: 52px;
  }

  .brand-label {
    font-size: 12px;
  }

  .brand-name {
    font-size: 20px;
  }

  .company-text,
  .logout-text {
    display: inline;
  }

  .action-btn {
    padding: 10px 16px;
  }

  .bottom-nav {
    padding: 12px 0 max(12px, env(safe-area-inset-bottom));
  }

  .bottom-nav-btn {
    gap: 6px;
    padding: 10px 8px;
  }

  .nav-icon {
    width: 32px;
    height: 32px;
  }

  .nav-icon svg {
    width: 26px;
    height: 26px;
  }

  .nav-label {
    font-size: 12px;
  }
}

/* Responsivo - Desktop */
@media (min-width: 1024px) {
  .topbar {
    padding: 20px 32px;
  }

  .brand-icon {
    width: 56px;
    height: 56px;
  }

  .brand-name {
    font-size: 22px;
  }

  .action-btn {
    padding: 12px 20px;
    font-size: 15px;
  }

  .bottom-nav {
    padding: 14px 0 max(14px, env(safe-area-inset-bottom));
    gap: 8px;
  }

  .bottom-nav-btn {
    max-width: 120px;
    padding: 12px 8px;
    gap: 8px;
    border-radius: 12px;
  }

  .bottom-nav-btn:hover {
    background: #f8fafc;
  }

  .theme-dark .bottom-nav-btn:hover {
    background: #0f172a;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
  }

  .nav-icon svg {
    width: 28px;
    height: 28px;
  }

  .nav-label {
    font-size: 13px;
  }
}

/* Melhorias de Acessibilidade */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Focus visible */
.action-btn:focus-visible,
.bottom-nav-btn:focus-visible {
  outline: 3px solid #10b981;
  outline-offset: 2px;
  border-radius: 12px;
}

.theme-dark .action-btn:focus-visible,
.theme-dark .bottom-nav-btn:focus-visible {
  outline-color: #6ee7b7;
}

/* Animações de entrada */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.topbar {
  animation: slideDown 0.4s ease;
}

.bottom-nav {
  animation: slideUp 0.4s ease;
}

/* Estados de toque para mobile */
@media (hover: none) {
  .action-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .bottom-nav-btn:active {
    transform: scale(0.95);
  }
}

/* Scrollbar personalizada */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.theme-dark .content::-webkit-scrollbar-track {
  background: #0f172a;
}

.content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.theme-dark .content::-webkit-scrollbar-thumb {
  background: #334155;
}

.content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.theme-dark .content::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Safe area para dispositivos com notch */
@supports (padding-top: env(safe-area-inset-top)) {
  .topbar {
    padding-top: max(12px, env(safe-area-inset-top));
  }
}

/* Otimização para telas pequenas */
@media (max-width: 380px) {
  .brand-name {
    font-size: 16px;
  }

  .brand-icon {
    width: 44px;
    height: 44px;
  }

  .nav-label {
    font-size: 10px;
  }

  .nav-icon {
    width: 26px;
    height: 26px;
  }

  .nav-icon svg {
    width: 22px;
    height: 22px;
  }

  .action-btn {
    padding: 8px 10px;
    font-size: 13px;
  }

  .company-text,
  .logout-text {
    display: none;
  }
  
  .topbar-actions {
    gap: 6px;
  }
}

/* Hover effects aprimorados para desktop */
@media (hover: hover) {
  .brand-icon {
    cursor: pointer;
  }

  .bottom-nav-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, transparent 0%, rgba(16, 185, 129, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
    border-radius: 12px;
  }

  .bottom-nav-btn:hover::before {
    opacity: 1;
  }

  .theme-dark .bottom-nav-btn::before {
    background: linear-gradient(135deg, transparent 0%, rgba(110, 231, 183, 0.1) 100%);
  }
}

/* Loading state (opcional) */
.topbar.loading {
  pointer-events: none;
  opacity: 0.6;
}

/* Badge de empresa salva */
.company-btn.saved {
  position: relative;
}

.company-btn.saved::after {
  content: '';
  position: absolute;
  top: -4px;
  right: -4px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);
}

.theme-dark .company-btn.saved::after {
  border-color: #1e293b;
}

/* Efeitos de pulso para botões importantes */
@keyframes subtle-pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  50% {
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
  }
}

.brand-icon.client-icon {
  animation: subtle-pulse 3s ease-in-out infinite;
}

/* Transições suaves no tema */
.app-layout,
.topbar,
.bottom-nav,
.action-btn,
.bottom-nav-btn,
.brand-icon,
.content {
  transition: background-color 0.3s ease, 
              border-color 0.3s ease, 
              color 0.3s ease,
              box-shadow 0.3s ease;
}

/* Melhorias de performance */
.nav-icon svg,
.brand-icon svg {
  will-change: transform;
}

/* Estados de carregamento */
.action-btn.loading {
  pointer-events: none;
  position: relative;
}

.action-btn.loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: inherit;
  border-radius: inherit;
  opacity: 0.5;
}

/* Responsivo - Landscape mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .topbar {
    padding: 8px 16px;
  }

  .brand-icon {
    width: 40px;
    height: 40px;
  }

  .brand-name {
    font-size: 16px;
  }

  .bottom-nav {
    padding: 6px 0;
  }

  .bottom-nav-btn {
    padding: 6px 4px;
    gap: 2px;
  }

  .nav-icon {
    width: 24px;
    height: 24px;
  }

  .nav-icon svg {
    width: 20px;
    height: 20px;
  }

  .nav-label {
    font-size: 10px;
  }
}

/* Melhorias de contraste para acessibilidade */
@media (prefers-contrast: high) {
  .action-btn {
    border-width: 3px;
  }

  .bottom-nav {
    border-top-width: 2px;
  }

  .topbar {
    border-bottom-width: 2px;
  }
}

/* Suporte a impressão */
@media print {
  .topbar,
  .bottom-nav {
    display: none;
  }

  .content {
    overflow: visible;
  }
}
</style>