<template>
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
</template>

<script>
export default {
  name: "ClientCheckoutModal",
  props: {
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
    closeCheckout: {
      type: Function,
      required: true
    },
    confirmCheckout: {
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

<style scoped>
.payment-summary {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.payment-method {
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 12px;
  background: var(--card);
  display: grid;
  gap: 10px;
}

.payment-methods-scroll {
  padding-right: 6px;
}

.checkout-modal {
  max-height: 85vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.checkout-scroll {
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 6px;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.payment-details {
  padding-top: 6px;
}

.pix-qr {
  border: 1px dashed var(--border);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  color: var(--muted);
  background: #f7f9ff;
}

.pix-code {
  margin-top: 8px;
  padding: 10px;
  border-radius: 10px;
  background: #eef5ff;
  border: 1px solid var(--border);
  font-size: 12px;
  word-break: break-all;
}

.total-amount {
  font-weight: 700;
}

.text-muted {
  color: var(--muted);
}

.mb-0 {
  margin-bottom: 0;
}

.mb-3 {
  margin-bottom: 12px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.col-md-6 {
  flex: 1 1 220px;
}

.alert {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  background: #f7f9ff;
  color: var(--text);
}

.alert-info {
  background: #eef5ff;
}
</style>
