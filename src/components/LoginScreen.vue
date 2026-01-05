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
