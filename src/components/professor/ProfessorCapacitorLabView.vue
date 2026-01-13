<template>
  <section class="view">
    <div class="view-header">
      <div>
        <h3>Bate-papo</h3>
        <p class="subtitle">Selecione com quem deseja conversar e envie mensagens.</p>
      </div>
      <button class="secondary-btn" @click="clearMessages" :disabled="!currentMessages.length">
        Limpar conversa
      </button>
    </div>

    <div class="chat-layout">
      <aside class="contact-panel">
        <p class="panel-title">Contatos</p>
        <button
          v-for="contact in contacts"
          :key="contact.id"
          class="contact-card"
          :class="{ active: contact.id === currentContactId }"
          @click="selectContact(contact.id)"
        >
          <div class="contact-info">
            <span class="contact-name">{{ contact.name }}</span>
            <span class="contact-role">{{ contact.role }}</span>
          </div>
          <span class="status-dot" :class="contact.status"></span>
        </button>
        <p class="panel-hint">Clique em um contato para abrir a conversa.</p>
      </aside>

      <div class="chat-panel">
        <div class="chat-header">
          <div>
            <p class="chat-with">Conversando com</p>
            <h4>{{ currentContact.name }}</h4>
            <p class="chat-role">{{ currentContact.role }}</p>
          </div>
          <div class="chat-actions">
            <button class="ghost-btn" @click="markAsHuman">
              Controle humano
            </button>
          </div>
        </div>

        <div class="chat-messages">
          <p v-if="!currentMessages.length" class="empty-state">
            Nenhuma mensagem ainda. Envie a primeira mensagem.
          </p>
          <div
            v-for="(msg, index) in currentMessages"
            :key="index"
            class="message"
            :class="msg.from === 'me' ? 'outgoing' : 'incoming'"
          >
            <span class="message-text">{{ msg.text }}</span>
            <span class="message-time">{{ msg.time }}</span>
          </div>
        </div>

        <form class="chat-input" @submit.prevent="sendMessage">
          <input
            v-model="draft"
            type="text"
            placeholder="Digite sua mensagem"
            @focus="markAsHuman"
          />
          <button class="primary-btn" type="submit" :disabled="!draft.trim()">
            Enviar
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ProfessorCapacitorLabView",
  data() {
    return {
      currentContactId: "cliente",
      draft: "",
      contacts: [
        { id: "cliente", name: "Cliente", role: "Cliente", status: "online" },
        { id: "professor", name: "Professor / Empresario", role: "Professor", status: "away" }
      ],
      messagesByContact: {
        cliente: [
          { from: "cliente", text: "Ola, preciso de ajuda.", time: "09:12" },
          { from: "me", text: "Claro! Como posso ajudar?", time: "09:13" }
        ],
        professor: [
          { from: "professor", text: "Posso falar com voce agora?", time: "11:05" }
        ]
      }
    };
  },
  computed: {
    currentContact() {
      return this.contacts.find((contact) => contact.id === this.currentContactId) || this.contacts[0];
    },
    currentMessages() {
      return this.messagesByContact[this.currentContactId] || [];
    }
  },
  methods: {
    selectContact(contactId) {
      this.currentContactId = contactId;
    },
    sendMessage() {
      const message = this.draft.trim();
      if (!message) return;

      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      if (!this.messagesByContact[this.currentContactId]) {
        this.$set(this.messagesByContact, this.currentContactId, []);
      }

      this.messagesByContact[this.currentContactId] = [
        ...this.messagesByContact[this.currentContactId],
        { from: "me", text: message, time }
      ];
      this.draft = "";
    },
    markAsHuman() {
      // Placeholder para integracao do controle humano do chat.
      console.log("Controle humano ativado");
    },
    clearMessages() {
      this.messagesByContact[this.currentContactId] = [];
    }
  }
};
</script>

<style scoped>
.view {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.subtitle {
  margin: 4px 0 0;
  color: #6d6d6d;
}

.chat-layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 24px;
}

.contact-panel {
  background: #f5f6f8;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-title {
  font-weight: 600;
  margin: 0 0 4px;
}

.contact-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: #ffffff;
  cursor: pointer;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}

.contact-card.active {
  border-color: #2c6ee8;
  box-shadow: 0 8px 20px rgba(44, 110, 232, 0.15);
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.contact-name {
  font-weight: 600;
}

.contact-role {
  font-size: 12px;
  color: #6d6d6d;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #d0d0d0;
}

.status-dot.online {
  background: #2ecc71;
}

.status-dot.away {
  background: #f5a623;
}

.panel-hint {
  font-size: 12px;
  color: #8a8a8a;
  margin-top: auto;
}

.chat-panel {
  background: #ffffff;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 420px;
  border: 1px solid #eeeeee;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.chat-with {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #999999;
  margin: 0;
}

.chat-role {
  margin: 4px 0 0;
  color: #6d6d6d;
  font-size: 13px;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f8f9fb;
  border-radius: 16px;
  overflow-y: auto;
}

.empty-state {
  color: #8a8a8a;
  text-align: center;
  margin: auto 0;
}

.message {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message.incoming {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #e6e6e6;
}

.message.outgoing {
  align-self: flex-end;
  background: #2c6ee8;
  color: #ffffff;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.chat-input {
  display: flex;
  gap: 12px;
}

.chat-input input {
  flex: 1;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #dcdcdc;
  font-size: 14px;
}

.primary-btn,
.secondary-btn,
.ghost-btn {
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.primary-btn {
  background: #2c6ee8;
  color: #ffffff;
}

.secondary-btn {
  background: #f0f2f5;
  color: #333333;
}

.ghost-btn {
  background: transparent;
  color: #2c6ee8;
}

@media (max-width: 960px) {
  .chat-layout {
    grid-template-columns: 1fr;
  }
}
</style>
