<template>
  <div class="app-layout client-layout">
    <div class="app-main">
      <header class="topbar">
        <div class="topbar-spacer"></div>
        <div class="topbar-info">
          <p class="label">Cliente</p>
          <h2>{{ clientProfile.nome || "Cliente" }}</h2>
        </div>
        <button class="secondary-btn" :disabled="!isClientCompanySaved" @click="goToSavedCompany">
          Minha empresa
        </button>
        <button class="secondary-btn" @click="clientLogout">Logout</button>
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

    <nav class="bottom-nav" aria-label="Menu principal">
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'companies' }"
        @click="goToClientTab('companies')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2"></path>
          <polyline points="9 22 9 12 15 12 15 22" fill="none" stroke="currentColor" stroke-width="2"></polyline>
        </svg>
        <span>Empresas</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'bookings' }"
        @click="goToClientTab('bookings')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="16" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"></rect>
          <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" stroke-width="2"></line>
          <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" stroke-width="2"></line>
          <line x1="3" y1="11" x2="21" y2="11" stroke="currentColor" stroke-width="2"></line>
        </svg>
        <span>Horarios</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'profile' }"
        @click="goToClientTab('profile')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"></circle>
          <path d="M4 20c2-4 6-6 8-6s6 2 8 6" fill="none" stroke="currentColor" stroke-width="2"></path>
        </svg>
        <span>Perfil</span>
      </button>
      <button
        class="bottom-nav-btn"
        :class="{ active: clientTab === 'messages' }"
        @click="goToClientTab('messages')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2"></path>
        </svg>
        <span>Mensagens</span>
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
  }
};
</script>
