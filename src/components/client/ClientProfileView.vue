<template>
  <section class="view client-profile">
    <div class="view-header">
      <div class="header-content">
        <h3>Meu Perfil</h3>
        <p class="header-subtitle">Gerencie suas informações pessoais</p>
      </div>
    </div>

    <div class="profile-content">
      <!-- Photo Section -->
      <div class="photo-section">
        <div class="photo-container">
          <div class="photo-wrapper">
            <img 
              v-if="clientProfile.foto" 
              :src="clientProfile.foto" 
              alt="Foto do perfil" 
              class="profile-photo"
            />
            <div v-else class="photo-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="photo-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            Foto do perfil
          </div>
        </div>
      </div>

      <!-- Form Card -->
      <div class="form-card">
        <div class="form-section">
          <h4 class="section-title">Informações Pessoais</h4>
          
          <div class="form-grid">
            <label class="field">
              <span class="field-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Nome completo
              </span>
              <input 
                type="text" 
                v-model.trim="clientProfile.nome" 
                placeholder="Digite seu nome completo"
              />
            </label>

            <label class="field">
              <span class="field-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                Email
              </span>
              <input 
                type="email" 
                v-model.trim="clientProfile.email" 
                placeholder="seu@email.com"
              />
            </label>

            <label class="field">
              <span class="field-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Telefone
              </span>
              <input 
                type="tel" 
                v-model.trim="clientProfile.telefone" 
                placeholder="(00) 00000-0000"
              />
            </label>

            <label class="field">
              <span class="field-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Documento (CPF/RG)
              </span>
              <input 
                type="text" 
                v-model.trim="clientProfile.documento" 
                placeholder="000.000.000-00"
              />
            </label>

            <label class="field field-full">
              <span class="field-label">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                URL da foto
              </span>
              <input 
                type="url" 
                v-model.trim="clientProfile.foto" 
                placeholder="https://exemplo.com/minha-foto.jpg"
              />
            </label>
          </div>
        </div>

        <!-- Success Message -->
        <transition name="fade">
          <div v-if="clientProfileSaved" class="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Perfil atualizado com sucesso!
          </div>
        </transition>

        <!-- Action Button -->
        <div class="actions">
          <button class="primary-btn" @click="saveClientProfile">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Salvar alterações
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ClientProfileView",
  props: {
    clientProfile: {
      type: Object,
      required: true
    },
    clientProfileSaved: {
      type: Boolean,
      required: true
    },
    saveClientProfile: {
      type: Function,
      required: true
    }
  }
};
</script>

<style scoped>
.client-profile {
  padding: 0;
  min-height: 100vh;
  background: #f8fafc;
}

/* Header */
.view-header {
  padding: 20px 16px 24px;
  background: linear-gradient(135deg, #1f5fbf 0%, #1a4d99 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-content h3 {
  margin: 0 0 6px 0;
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

/* Profile Content */
.profile-content {
  padding: 0 0 32px 0;
}

/* Photo Section */
.photo-section {
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.photo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.photo-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
}

.photo-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.photo-label svg {
  color: #94a3b8;
}

/* Form Card */
.form-card {
  margin: 0 16px;
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.3px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #1f5fbf 0%, #1a4d99 100%);
  border-radius: 2px;
}

/* Form Grid */
.form-grid {
  display: grid;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-full {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  letter-spacing: -0.1px;
}

.field-label svg {
  color: #64748b;
  flex-shrink: 0;
}

.field input {
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.field input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.field input:focus {
  outline: none;
  border-color: #1f5fbf;
  box-shadow: 0 0 0 3px rgba(31, 95, 191, 0.1);
}

/* Success Message */
.success-message {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1.5px solid #6ee7b7;
  color: #065f46;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
}

.success-message svg {
  flex-shrink: 0;
  color: #059669;
}

/* Fade Transition */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Actions */
.actions {
  margin-top: 0;
}

.primary-btn {
  width: 100%;
  padding: 15px 24px;
  background: linear-gradient(135deg, #1f5fbf 0%, #1a4d99 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(31, 95, 191, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: -0.2px;
  -webkit-tap-highlight-color: transparent;
}

.primary-btn svg {
  flex-shrink: 0;
}

.primary-btn:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(31, 95, 191, 0.3);
}

/* Responsive */
@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .photo-wrapper {
    width: 140px;
    height: 140px;
  }
}

@media (min-width: 768px) {
  .profile-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .form-card {
    margin: 0;
    padding: 32px;
  }

  .primary-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(31, 95, 191, 0.3);
  }

  .primary-btn:active {
    transform: translateY(0);
  }
}

@media (min-width: 1024px) {
  .view-header {
    padding: 28px 32px;
  }

  .photo-section {
    padding: 32px 24px;
  }
}
</style>