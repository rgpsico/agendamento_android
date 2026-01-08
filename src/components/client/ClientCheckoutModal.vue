<template>
  <div v-if="checkoutOpen" class="modal-overlay" @click.self="closeCheckout">
    <div class="modal-card">
      <!-- Header fixo -->
      <div class="view-header">
        <button class="back-btn" @click="closeCheckout" aria-label="Voltar">
          <span class="back-icon">←</span>
        </button>
        <h4>Pagamento</h4>
        <div class="header-spacer"></div>
      </div>

      <!-- Loading state -->
      <div v-if="checkoutLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Carregando pagamento...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="checkoutError" class="error-container">
        <span class="error-icon">⚠️</span>
        <p>{{ checkoutError }}</p>
        <button class="retry-btn" @click="closeCheckout">Tentar novamente</button>
      </div>

      <!-- Conteúdo principal -->
      <div v-else class="content-wrapper">
        <!-- Resumo do agendamento -->
        <div class="summary-section">
          <div class="summary-header">
            <span class="summary-icon">📋</span>
            <h3>Resumo do Agendamento</h3>
          </div>
          
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">📅 Data</span>
              <span class="summary-value">{{ checkoutSummary.date || "-" }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">🕐 Horário</span>
              <span class="summary-value">{{ checkoutSummary.time || "-" }}</span>
            </div>
            <div class="summary-item full-width">
              <span class="summary-label">✂️ Serviço</span>
              <span class="summary-value">{{ checkoutSummary.title || "-" }}</span>
            </div>
          </div>

          <div class="total-price">
            <span>Total</span>
            <span class="price-value">R$ {{ checkoutSummary.price || "0,00" }}</span>
          </div>
        </div>

        <!-- Métodos de pagamento -->
        <div class="payment-section">
          <h3 class="section-title">💳 Forma de Pagamento</h3>

          <div v-if="!checkoutMethods.length" class="empty-state">
            <span class="empty-icon">💰</span>
            <p>Nenhuma forma de pagamento disponível</p>
          </div>

          <div v-else class="payment-methods">
            <!-- PIX -->
            <div 
              v-if="checkoutMethods.includes('pix')" 
              class="payment-option"
              :class="{ active: checkoutMethod === 'pix' }"
            >
              <label class="payment-radio">
                <input
                  type="radio"
                  name="payment"
                  value="pix"
                  :checked="checkoutMethod === 'pix'"
                  @change="setCheckoutMethod('pix')"
                />
                <div class="radio-content">
                  <div class="radio-header">
                    <span class="payment-icon">🔷</span>
                    <div class="radio-text">
                      <strong>PIX</strong>
                      <span class="radio-description">Pagamento instantâneo</span>
                    </div>
                  </div>
                  <span class="radio-check">✓</span>
                </div>
              </label>

              <!-- Detalhes PIX -->
              <div v-if="checkoutMethod === 'pix'" class="payment-details">
                <div v-if="!checkoutPixData" class="pix-waiting">
                  <span class="info-icon">ℹ️</span>
                  <p>Clique em "Confirmar Agendamento" para gerar o código PIX</p>
                </div>

                <div v-else class="pix-content">
                  <p class="pix-instruction">{{ checkoutPixMessage || "Escaneie o QR Code ou copie o código abaixo" }}</p>
                  
                  <div class="qr-container">
                    <img
                      v-if="checkoutPixData.qr_code?.encoded_image"
                      :src="`data:image/png;base64,${checkoutPixData.qr_code.encoded_image}`"
                      alt="QR Code PIX"
                      class="qr-image"
                    />
                    <span v-else class="qr-placeholder">QR Code</span>
                  </div>

                  <div v-if="checkoutPixData.qr_code?.payload" class="pix-code-container">
                    <div class="pix-code">{{ checkoutPixData.qr_code.payload }}</div>
                    <button class="copy-btn" @click="copyPixCode">
                      <span>📋</span>
                      Copiar código
                    </button>
                  </div>

                  <p v-if="checkoutPixExpiration" class="pix-expiry">
                    ⏱️ Válido até: {{ checkoutPixExpiration }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Cartão de Crédito -->
            <div 
              v-if="checkoutMethods.includes('cartao')" 
              class="payment-option"
              :class="{ active: checkoutMethod === 'cartao' }"
            >
              <label class="payment-radio">
                <input
                  type="radio"
                  name="payment"
                  value="cartao"
                  :checked="checkoutMethod === 'cartao'"
                  @change="setCheckoutMethod('cartao')"
                />
                <div class="radio-content">
                  <div class="radio-header">
                    <span class="payment-icon">💳</span>
                    <div class="radio-text">
                      <strong>Cartão de Crédito</strong>
                      <span class="radio-description">Pagamento seguro</span>
                    </div>
                  </div>
                  <span class="radio-check">✓</span>
                </div>
              </label>

              <!-- Detalhes Cartão -->
              <div v-if="checkoutMethod === 'cartao'" class="payment-details">
                <div class="card-form">
                  <label class="form-field">
                    <span class="field-label">Nome no Cartão</span>
                    <input
                      type="text"
                      :value="checkoutCard.name"
                      @input="setCheckoutCard('name', $event.target.value)"
                      placeholder="João Silva"
                      class="field-input"
                    />
                  </label>

                  <label class="form-field">
                    <span class="field-label">Número do Cartão</span>
                    <input
                      type="text"
                      :value="checkoutCard.number"
                      @input="setCheckoutCard('number', $event.target.value)"
                      placeholder="0000 0000 0000 0000"
                      maxlength="19"
                      class="field-input"
                    />
                  </label>

                  <div class="field-row">
                    <label class="form-field">
                      <span class="field-label">Validade</span>
                      <input
                        type="text"
                        :value="checkoutCard.expiry"
                        @input="setCheckoutCard('expiry', $event.target.value)"
                        placeholder="MM/AA"
                        maxlength="5"
                        class="field-input"
                      />
                    </label>

                    <label class="form-field">
                      <span class="field-label">CVV</span>
                      <input
                        type="text"
                        :value="checkoutCard.cvv"
                        @input="setCheckoutCard('cvv', $event.target.value)"
                        placeholder="123"
                        maxlength="4"
                        class="field-input"
                      />
                    </label>
                  </div>

                  <label class="form-field">
                    <span class="field-label">CPF do Portador</span>
                    <input
                      type="text"
                      :value="checkoutCard.cpf"
                      @input="setCheckoutCard('cpf', $event.target.value)"
                      placeholder="000.000.000-00"
                      class="field-input"
                    />
                  </label>
                </div>
              </div>
            </div>

            <!-- Pagamento Presencial -->
            <div 
              v-if="checkoutMethods.includes('presencial')" 
              class="payment-option"
              :class="{ active: checkoutMethod === 'presencial' }"
            >
              <label class="payment-radio">
                <input
                  type="radio"
                  name="payment"
                  value="presencial"
                  :checked="checkoutMethod === 'presencial'"
                  @change="setCheckoutMethod('presencial')"
                />
                <div class="radio-content">
                  <div class="radio-header">
                    <span class="payment-icon">💵</span>
                    <div class="radio-text">
                      <strong>Pagamento no Dia</strong>
                      <span class="radio-description">Pague presencialmente</span>
                    </div>
                  </div>
                  <span class="radio-check">✓</span>
                </div>
              </label>

              <!-- Detalhes Presencial -->
              <div v-if="checkoutMethod === 'presencial'" class="payment-details">
                <div class="presencial-info">
                  <div class="info-box">
                    <span class="info-icon">ℹ️</span>
                    <p>Você pagará diretamente ao professor no dia da aula</p>
                  </div>

                  <label class="form-field">
                    <span class="field-label">Status do Pagamento</span>
                    <select 
                      :value="checkoutStatus" 
                      @change="setCheckoutStatus($event.target.value)"
                      class="field-select"
                    >
                      <option value="PENDING">Pendente (pagar no dia)</option>
                      <option value="RECEIVED">Confirmado (pago agora)</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botões de ação -->
        <div class="actions-section">
          <button class="primary-btn" @click="confirmCheckout">
            <span class="btn-icon">✓</span>
            Confirmar Agendamento
          </button>

          <button 
            v-if="checkoutMethod === 'pix' && checkoutPixFinalizeReady" 
            class="secondary-btn"
            @click="finalizeCheckout"
          >
            <span class="btn-icon">🎉</span>
            Finalizar Agendamento
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClientCheckoutModal",
  props: {
    checkoutOpen: { type: Boolean, required: true },
    checkoutLoading: { type: Boolean, required: true },
    checkoutError: { type: String, default: "" },
    checkoutSummary: { type: Object, required: true },
    checkoutMethods: { type: Array, required: true },
    checkoutMethod: { type: String, required: true },
    checkoutStatus: { type: String, required: true },
    checkoutCard: { type: Object, required: true },
    checkoutPixData: { type: Object, default: null },
    checkoutPixMessage: { type: String, default: "" },
    checkoutPixFinalizeReady: { type: Boolean, required: true },
    checkoutPixExpiration: { type: String, default: "" },
    setCheckoutMethod: { type: Function, required: true },
    setCheckoutStatus: { type: Function, required: true },
    setCheckoutCard: { type: Function, required: true },
    closeCheckout: { type: Function, required: true },
    confirmCheckout: { type: Function, required: true },
    finalizeCheckout: { type: Function, required: true }
  },
  methods: {
    copyPixCode() {
      const payload = this.checkoutPixData?.qr_code?.payload;
      if (payload && navigator.clipboard) {
        navigator.clipboard.writeText(payload);
        alert('Código PIX copiado!');
      }
    }
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.25s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 100%;
  max-height: 95vh;
  border-radius: 24px 24px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Header */
.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
  flex-shrink: 0;
}

.view-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  flex: 1;
  text-align: center;
}

.back-btn {
  background: transparent;
  border: none;
  padding: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s;
}

.back-btn:active {
  background: #f3f4f6;
}

.back-icon {
  font-size: 24px;
  color: #6b7280;
}

.header-spacer {
  width: 40px;
}

/* Content */
.content-wrapper {
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-bottom: 20px;
}

/* Loading & Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px 20px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p,
.error-container p {
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
  margin: 0;
}

.error-icon {
  font-size: 48px;
}

.error-container p {
  color: #dc2626;
}

.retry-btn {
  margin-top: 8px;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:active {
  transform: scale(0.97);
  background: #2563eb;
}

/* Summary Section */
.summary-section {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  padding: 24px 20px;
  border-bottom: 8px solid #f9fafb;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.summary-icon {
  font-size: 24px;
}

.summary-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  background: white;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item.full-width {
  grid-column: 1 / -1;
}

.summary-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.total-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 18px;
  border-radius: 14px;
  border: 2px solid #3b82f6;
  margin-top: 12px;
}

.total-price span:first-child {
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
}

.price-value {
  font-size: 24px;
  font-weight: 800;
  color: #3b82f6;
  letter-spacing: -0.5px;
}

/* Payment Section */
.payment-section {
  padding: 24px 20px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.payment-option {
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  transition: all 0.2s ease;
}

.payment-option.active {
  border-color: #3b82f6;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.12);
}

.payment-radio {
  display: block;
  cursor: pointer;
  padding: 16px;
}

.payment-radio input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.radio-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.payment-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.radio-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.radio-text strong {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.radio-description {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.radio-check {
  width: 24px;
  height: 24px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: transparent;
  transition: all 0.2s;
  flex-shrink: 0;
}

.payment-option.active .radio-check {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

/* Payment Details */
.payment-details {
  padding: 0 16px 16px;
  animation: slideDown 0.3s ease-out;
}

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

/* PIX */
.pix-waiting {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #eff6ff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.info-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.pix-waiting p {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

.pix-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pix-instruction {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
}

.qr-container {
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.qr-image {
  max-width: 200px;
  width: 100%;
  height: auto;
  display: block;
}

.qr-placeholder {
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
}

.pix-code-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pix-code {
  background: #f3f4f6;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  word-break: break-all;
  color: #1f2937;
  line-height: 1.6;
}

.copy-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.copy-btn:active {
  transform: scale(0.97);
  background: #2563eb;
}

.pix-expiry {
  text-align: center;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  background: #fef2f2;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #fecaca;
}

/* Card Form */
.card-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.field-input,
.field-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  background: #ffffff;
  color: #1f2937;
  transition: all 0.2s;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* Presencial */
.presencial-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #eff6ff;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}

.info-box p {
  margin: 0;
  font-size: 14px;
  color: #1f2937;
  line-height: 1.5;
}

/* Actions */
.actions-section {
  padding: 20px;
  background: linear-gradient(to top, #ffffff, #fafbfc);
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
}

.primary-btn,
.secondary-btn {
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.primary-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.primary-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.secondary-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.secondary-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-icon {
  font-size: 18px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.6;
}

.empty-state p {
  color: #6b7280;
  font-size: 15px;
  margin: 0;
}

/* Responsive */
@media (min-width: 640px) {
  .modal-overlay {
    align-items: center;
    padding: 20px;
  }

  .modal-card {
    max-width: 640px;
    max-height: 92vh;
    border-radius: 24px;
  }

  .summary-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .summary-item.full-width {
    grid-column: 1 / -1;
  }
}

@media (min-width: 768px) {
  .modal-card {
    max-width: 720px;
  }

  .payment-option:hover {
    border-color: #93c5fd;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.08);
  }

  .back-btn:hover {
    background: #f3f4f6;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-card,
  .payment-details,
  .spinner {
    animation: none;
  }

  * {
    transition: none !important;
  }
}
</style>