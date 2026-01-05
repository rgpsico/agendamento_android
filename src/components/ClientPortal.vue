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
        <section v-if="clientTab === 'companies'" class="view">
          <div class="view-header">
            <h3>Empresas</h3>
          </div>
          <p v-if="clientCompaniesLoading" class="hint">Carregando empresas...</p>
          <p v-if="clientCompaniesError" class="error">{{ clientCompaniesError }}</p>
          <div class="cards" v-if="clientCompanies.length">
            <div
              v-for="company in clientCompanies"
              :key="company.id"
              class="card clickable"
              @click="selectCompany(company)"
            >
              <img
                v-if="companyImageUrl(company)"
                :src="companyImageUrl(company)"
                alt="Imagem da empresa"
                class="service-thumb"
              />
              <p class="card-title">{{ company.nome }}</p>
              <p class="card-subtitle">{{ companyCityLabel(company) }}</p>
              <p class="subtitle">{{ company.descricao || companyDescricaoLabel(company) }}</p>
              <button class="text-btn">Ver servicos</button>
            </div>
          </div>
          <p v-else class="hint">Nenhuma empresa cadastrada.</p>
        </section>

        <section v-if="clientTab === 'services'" class="view">
          <div class="view-header">
            <h3>Servicos</h3>
            <button class="text-btn" @click="goToClientTab('companies')">Trocar empresa</button>
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

        <section v-if="clientTab === 'bookings'" class="view">
          <div class="view-header">
            <h3>Meus Horarios</h3>
          </div>
          <div v-if="clientBookingsDetailed.length" class="list">
            <div v-for="booking in clientBookingsDetailed" :key="booking.id" class="list-item">
              <div>
                <strong>{{ booking.time }} - {{ booking.dateLabel }}</strong>
                <p>{{ booking.companyName }} | {{ booking.serviceName }}</p>
              </div>
              <div class="actions">
                <span class="status" :class="booking.status">{{ booking.status }}</span>
                <button class="text-btn danger" @click="removeClientBooking(booking.id)">Cancelar</button>
              </div>
            </div>
          </div>
          <p v-else class="hint">Nenhum horario agendado.</p>
        </section>

        <section v-if="clientTab === 'profile'" class="view">
          <div class="view-header">
            <h3>Perfil</h3>
          </div>
          <div class="form-card">
            <div class="form-grid">
              <label class="field">
                <span>Nome</span>
                <input type="text" v-model.trim="clientProfile.nome" />
              </label>
              <label class="field">
                <span>Email</span>
                <input type="email" v-model.trim="clientProfile.email" />
              </label>
              <label class="field">
                <span>Telefone</span>
                <input type="text" v-model.trim="clientProfile.telefone" />
              </label>
              <label class="field">
                <span>Documento</span>
                <input type="text" v-model.trim="clientProfile.documento" />
              </label>
              <label class="field">
                <span>Foto (URL)</span>
                <input type="text" v-model.trim="clientProfile.foto" placeholder="https://..." />
              </label>
            </div>
            <div v-if="clientProfile.foto" class="actions">
              <img :src="clientProfile.foto" alt="Foto do perfil" class="service-thumb" />
            </div>
            <div class="actions">
              <button class="primary-btn" @click="saveClientProfile">Salvar</button>
            </div>
            <p v-if="clientProfileSaved" class="hint">Perfil atualizado.</p>
          </div>
        </section>
      </main>
    </div>

    <div v-if="showSlotsModal" class="modal-overlay" @click.self="closeSlotsModal">
      <div class="modal-card">
        <div class="view-header">
          <h4>Horarios do servico</h4>
          <button class="text-btn" @click="closeSlotsModal">Fechar</button>
        </div>
        <div v-if="!selectedService" class="hint">Selecione um servico para ver horarios.</div>
        <div v-else>
          <div class="filter-row">
            <label class="field small">
              <span>Data</span>
              <input type="date" :value="clientScheduleDate" @input="setClientScheduleDate($event.target.value)" />
            </label>
            <label class="field small">
              <span>Empresa</span>
              <input type="text" :value="selectedCompanyLabel" disabled />
            </label>
            <label class="field small">
              <span>Servico</span>
              <input type="text" :value="selectedServiceLabel" disabled />
            </label>
          </div>
          <p v-if="clientAvailabilityLoading" class="hint">Carregando horarios...</p>
          <p v-if="clientAvailabilityError" class="error">{{ clientAvailabilityError }}</p>
          <div v-if="clientAvailableSlots.length" class="list slots-list">
            <div v-for="slot in clientAvailableSlots" :key="slot" class="list-item">
              <div>
                <strong>{{ slot }}</strong>
                <p>Disponivel</p>
              </div>
              <div class="actions">
                <button class="text-btn" @click="openCheckout(slot)">Agendar</button>
              </div>
            </div>
          </div>
          <p v-else class="hint">Nenhum horario disponivel.</p>
        </div>
      </div>
    </div>

    <div v-if="checkoutOpen" class="modal-overlay" @click.self="closeCheckout">
      <div class="modal-card checkout-modal">
        <div class="view-header">
          <h4>Pagamento</h4>
          <button class="text-btn" @click="closeCheckout">Fechar</button>
        </div>
        <p v-if="checkoutLoading" class="hint">Carregando pagamento...</p>
        <p v-if="checkoutError" class="error">{{ checkoutError }}</p>
        <div v-if="!checkoutLoading && !checkoutError">
          <div class="payment-summary">
            <h4 class="card-title mb-3">Resumo do Agendamento</h4>
            <div class="row">
              <div class="col-md-6">
                <p><strong>Data:</strong> {{ checkoutSummary.date || "-" }}</p>
                <p><strong>Hora:</strong> {{ checkoutSummary.time || "-" }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Servico:</strong> {{ checkoutSummary.title || "-" }}</p>
                <p class="total-amount">Total: R$ {{ checkoutSummary.price || "-" }}</p>
              </div>
            </div>
          </div>

          <div class="checkout-scroll">
            <h4 class="card-title mb-4">Forma de Pagamento</h4>
            <div v-if="!checkoutMethods.length" class="hint">Nenhuma forma de pagamento habilitada.</div>

            <div class="payment-methods-scroll">
              <div v-if="checkoutMethods.includes('pix')" class="payment-method" data-method="pix">
              <label class="d-flex align-items-center">
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="pix"
                  :checked="checkoutMethod === 'pix'"
                  @change="setCheckoutMethod('pix')"
                />
                <div>
                  <strong>PIX</strong>
                  <p class="mb-0 text-muted">Pagamento instantaneo via PIX</p>
                </div>
              </label>
              <div v-if="checkoutMethod === 'pix'" class="payment-details">
                <div class="pix-info">
                  <h5>Pagamento via PIX</h5>
                  <p v-if="!checkoutPixData">Clique em "Confirmar Agendamento" para gerar o pagamento.</p>
                  <p v-else class="hint">{{ checkoutPixMessage }}</p>
                  <div class="pix-qr">
                    <img
                      v-if="checkoutPixData && checkoutPixData.qr_code && checkoutPixData.qr_code.encoded_image"
                      :src="`data:image/png;base64,${checkoutPixData.qr_code.encoded_image}`"
                      alt="QR Code PIX"
                    />
                    <span v-else class="text-muted">QR Code sera gerado aqui</span>
                  </div>
                  <div v-if="checkoutPixData && checkoutPixData.qr_code && checkoutPixData.qr_code.payload" class="pix-code">
                    {{ checkoutPixData.qr_code.payload }}
                  </div>
                  <p v-if="checkoutPixExpiration" class="hint">
                    Valido ate: {{ checkoutPixExpiration }}
                  </p>
                </div>
              </div>
            </div>

            <div v-if="checkoutMethods.includes('cartao')" class="payment-method" data-method="card">
              <label class="d-flex align-items-center">
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="cartao"
                  :checked="checkoutMethod === 'cartao'"
                  @change="setCheckoutMethod('cartao')"
                />
                <div>
                  <strong>Cartao de Credito</strong>
                  <p class="mb-0 text-muted">Pagamento seguro com cartao</p>
                </div>
              </label>
              <div v-if="checkoutMethod === 'cartao'" class="payment-details card-form">
                <div class="form-grid">
                  <label class="field">
                    <span>Nome no Cartao</span>
                    <input type="text" :value="checkoutCard.name" @input="setCheckoutCard('name', $event.target.value)" />
                  </label>
                  <label class="field">
                    <span>Numero do Cartao</span>
                    <input
                      type="text"
                      :value="checkoutCard.number"
                      @input="setCheckoutCard('number', $event.target.value)"
                      maxlength="19"
                    />
                  </label>
                  <div class="form-grid">
                    <label class="field">
                      <span>Validade</span>
                      <input
                        type="text"
                        :value="checkoutCard.expiry"
                        @input="setCheckoutCard('expiry', $event.target.value)"
                        maxlength="5"
                      />
                    </label>
                    <label class="field">
                      <span>CVV</span>
                      <input
                        type="text"
                        :value="checkoutCard.cvv"
                        @input="setCheckoutCard('cvv', $event.target.value)"
                        maxlength="4"
                      />
                    </label>
                  </div>
                  <label class="field">
                    <span>CPF do Portador</span>
                    <input type="text" :value="checkoutCard.cpf" @input="setCheckoutCard('cpf', $event.target.value)" />
                  </label>
                </div>
              </div>
            </div>

            <div v-if="checkoutMethods.includes('presencial')" class="payment-method" data-method="presencial">
              <label class="d-flex align-items-center">
                <input
                  type="radio"
                  name="forma_pagamento"
                  value="presencial"
                  :checked="checkoutMethod === 'presencial'"
                  @change="setCheckoutMethod('presencial')"
                />
                <div>
                  <strong>Pagamento no Dia</strong>
                  <p class="mb-0 text-muted">Pague diretamente ao professor no dia da aula</p>
                </div>
              </label>
              <div v-if="checkoutMethod === 'presencial'" class="payment-details">
                <div class="alert alert-info">
                  <h5>Pagamento Presencial</h5>
                  <p>Voce pagara diretamente ao professor no dia da aula.</p>
                  <div class="form-grid">
                    <label class="field">
                      <span>Status do Pagamento</span>
                      <select :value="checkoutStatus" @change="setCheckoutStatus($event.target.value)">
                        <option value="PENDING">Pendente (pagar no dia)</option>
                        <option value="RECEIVED">Confirmado (pago agora)</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <div class="actions">
              <button class="primary-btn" @click="confirmCheckout">Confirmar Agendamento</button>
            </div>
            <div v-if="checkoutMethod === 'pix' && checkoutPixFinalizeReady" class="actions">
              <button class="secondary-btn" @click="finalizeCheckout">Finalizar Agendamento</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClientPortal",
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
