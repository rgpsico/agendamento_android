<template>
  <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card chat-modal">
      <div class="view-header">
        <div>
          <h4>Conversar com {{ studentName || "-" }}</h4>
          <p class="view-subtitle">Mensagens diretas com o cliente.</p>
        </div>
        <button class="text-btn" @click="$emit('close')">Fechar</button>
      </div>

      <div class="chat-box" ref="chatBox">
        <p v-if="loading" class="hint">Carregando conversa...</p>
        <p v-else-if="error" class="error">{{ error }}</p>
        <p v-else-if="!messages.length" class="hint">Nenhuma mensagem ainda.</p>
        <div
          v-for="(msg, index) in messages"
          :key="index"
          class="chat-message"
          :class="msg.from === 'me' ? 'outgoing' : 'incoming'"
          :ref="index === messages.length - 1 ? 'lastMessage' : null"
        >
          <span class="chat-text">{{ msg.text }}</span>
          <span class="chat-time">{{ msg.time }}</span>
        </div>
      </div>

      <form class="chat-input" @submit.prevent="emitSend">
        <input
          :value="draftValue"
          type="text"
          placeholder="Digite sua mensagem"
          @input="$emit('input', $event.target.value)"
        />
        <button class="primary-btn" type="submit" :disabled="!draftValue.trim()">Enviar</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfessorAvailabilityChatModal",
  props: {
    open: {
      type: Boolean,
      default: false
    },
    studentName: {
      type: String,
      default: ""
    },
    messages: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ""
    },
    value: {
      type: String,
      default: ""
    }
  },
  computed: {
    draftValue() {
      return this.value || "";
    }
  },
  watch: {
    messages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    open(isOpen) {
      if (isOpen) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    }
  },
  methods: {
    emitSend() {
      if (!this.draftValue.trim()) return;
      this.$emit("send");
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const last = this.$refs.lastMessage;
        if (last && last.scrollIntoView) {
          last.scrollIntoView({ behavior: "smooth", block: "end" });
          return;
        }
        if (this.$refs.chatBox) {
          this.$refs.chatBox.scrollTop = this.$refs.chatBox.scrollHeight;
        }
      });
    }
  }
};
</script>

<style scoped>
.chat-modal {
  width: min(720px, 94vw);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8f9fb;
  min-height: 240px;
  max-height: 420px;
  overflow-y: auto;
}

.chat-message {
  max-width: 70%;
  padding: 10px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-message.incoming {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid #e6e6e6;
}

.chat-message.outgoing {
  align-self: flex-end;
  background: #2c6ee8;
  color: #ffffff;
}

.chat-time {
  font-size: 11px;
  opacity: 0.7;
}

.chat-input {
  display: flex;
  gap: 12px;
}

.chat-input input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #dcdcdc;
}
</style>
