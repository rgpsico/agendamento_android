<template>
  <div class="login-screen">
    <div class="login-switch">
      <button class="text-btn" :class="{ active: activePortal === 'professor' }" @click="$emit('set-portal', 'professor')">
        Professor
      </button>
      <button class="text-btn" :class="{ active: activePortal === 'cliente' }" @click="$emit('set-portal', 'cliente')">
        Cliente
      </button>
    </div>
    <div v-if="activePortal === 'professor'" class="login-card">
      <h1>Agenda Pro</h1>
      <p class="subtitle">Acesso do Professor</p>
      <label class="field">
        <span>Email</span>
        <input type="email" v-model.trim="loginForm.email" placeholder="prof@escola.com" />
      </label>
      <label class="field">
        <span>Senha</span>
        <input type="password" v-model="loginForm.password" placeholder="******" />
      </label>
      <button class="primary-btn" :disabled="authLoading" @click="$emit('login')">
        {{ authLoading ? "Entrando..." : "Entrar" }}
      </button>
      <button class="text-btn" @click="$emit('toggle-forgot')">Esqueci a senha</button>
      <p v-if="showForgot" class="hint">Funcionalidade em breve.</p>
      <p v-if="loginError" class="error">{{ loginError }}</p>
    </div>
    <div v-else class="login-card">
      <h1>Agenda Pro</h1>
      <p class="subtitle">Acesso do Cliente</p>
      <label class="field">
        <span>Email</span>
        <input type="email" v-model.trim="clientLoginForm.email" placeholder="cliente@email.com" />
      </label>
      <label class="field">
        <span>Senha</span>
        <input type="password" v-model="clientLoginForm.password" placeholder="******" />
      </label>
      <button class="primary-btn" :disabled="clientLoading" @click="$emit('client-login')">
        {{ clientLoading ? "Entrando..." : "Entrar" }}
      </button>
      <p v-if="clientLoginError" class="error">{{ clientLoginError }}</p>
      <p class="hint">Painel cliente em modo front demo.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "LoginScreen",
  props: {
    activePortal: {
      type: String,
      required: true
    },
    loginForm: {
      type: Object,
      required: true
    },
    clientLoginForm: {
      type: Object,
      required: true
    },
    authLoading: {
      type: Boolean,
      required: true
    },
    clientLoading: {
      type: Boolean,
      required: true
    },
    loginError: {
      type: String,
      default: ""
    },
    clientLoginError: {
      type: String,
      default: ""
    },
    showForgot: {
      type: Boolean,
      required: true
    }
  }
};
</script>
<style scoped>
.login-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  background: linear-gradient(135deg, #e7f0ff 0%, #ffffff 100%);
  position: relative;
}

.login-switch {
  width: 100%;
  display: flex;
  gap: 0;
  background: #fff;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.login-switch .text-btn {
  flex: 1;
  padding: 16px;
  font-size: 15px;
  font-weight: 500;
  color: var(--muted);
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.login-switch .text-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: transparent;
  padding: 32px 24px;
  border-radius: 0;
  box-shadow: none;
  display: grid;
  gap: 16px;
  margin-top: 40px;
}

.login-card h1 {
  margin: 0;
  font-size: 28px;
  text-align: center;
  color: var(--text);
}

.subtitle {
  margin: 0 0 8px 0;
  color: var(--muted);
  text-align: center;
  font-size: 15px;
}

.field {
  display: grid;
  gap: 8px;
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.field input,
.field select {
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid var(--border);
  background: #fff;
  color: var(--text);
  font-size: 16px;
  transition: all 0.2s ease;
}

.field input:focus,
.field select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(31, 95, 191, 0.1);
}

.primary-btn,
.text-btn {
  border: none;
  cursor: pointer;
  font-size: 15px;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.primary-btn {
  background: var(--primary);
  color: #fff;
  padding: 16px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(31, 95, 191, 0.2);
}

.primary-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(31, 95, 191, 0.3);
}

.primary-btn:active {
  transform: translateY(0);
}

.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.text-btn {
  background: transparent;
  color: var(--primary);
  padding: 12px 0;
}

.hint {
  color: var(--muted);
  font-size: 13px;
  text-align: center;
  margin-top: 8px;
}

.error {
  color: var(--danger);
  font-size: 14px;
  background: rgba(239, 68, 68, 0.1);
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px 20px;
    margin-top: 24px;
  }

  .login-card h1 {
    font-size: 24px;
  }
}
</style>