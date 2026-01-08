<template>
  <div class="app-layout">
    <div v-if="showClientSidebar" class="sidebar-backdrop" @click="closeClientSidebar"></div>
    <aside class="sidebar" :class="{ open: showClientSidebar }">
      <div class="sidebar-header">
        <h1>Agenda Pro</h1>
        <p class="subtitle">Menu Cliente</p>
      </div>
      <nav class="sidebar-nav">
        <button :class="{ active: clientTab === 'companies' }" @click="goToClientTab('companies')">
          Empresas
        </button>
        <button :class="{ active: clientTab === 'services' }" @click="goToClientTab('services')">
          Servicos
        </button>
        <button :class="{ active: clientTab === 'bookings' }" @click="goToClientTab('bookings')">
          Meus Horarios
        </button>
        <button :class="{ active: clientTab === 'profile' }" @click="goToClientTab('profile')">
          Perfil
        </button>
      </nav>
    </aside>

    <div class="app-main">
      <header class="topbar">
        <button class="icon-btn" @click="toggleClientSidebar">Menu</button>
        <div class="topbar-info">
          <p class="label">Cliente</p>
          <h2>{{ clientProfile.nome || "Cliente" }}</h2>
        </div>
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
          :select-service="selectService"
          :go-to-client-tab="goToClientTab"
        />

        <ClientBookingsView
          v-if="clientTab === 'bookings'"
          :client-bookings-detailed="clientBookingsDetailed"
          :remove-client-booking="removeClientBooking"
        />

        <ClientProfileView
          v-if="clientTab === 'profile'"
          :client-profile="clientProfile"
          :client-profile-saved="clientProfileSaved"
          :save-client-profile="saveClientProfile"
        />
      </main>
    </div>

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

export default {
  name: "ClientPortal",
  components: {
    ClientBookingsView,
    ClientCheckoutModal,
    ClientCompaniesView,
    ClientProfileView,
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
