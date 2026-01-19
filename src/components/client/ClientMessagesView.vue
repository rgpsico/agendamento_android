<template>
  <section class="view messages-view">
    <ClientConversationList
      :loading="loading"
      :error="error"
      :conversations="conversations"
      @refresh="fetchConversations"
      @open="openConversation"
    />
    <ClientChatModal
      :open="chatModalOpen"
      :teacher="chatTeacher"
      :conversation-id="activeConversationId"
      :client-profile="clientProfile"
      @close="closeChatModal"
      @update-conversation-id="updateConversationId"
      @update-teacher="updateTeacher"
    />
  </section>
</template>

<script>
import ClientConversationList from "./ClientConversationList.vue";
import ClientChatModal from "./ClientChatModal.vue";
import {
  API_BASE,
  authHeaders,
  resolveEmpresaId,
  resolveClientId,
  normalizeConversation
} from "./clientMessagesUtils";

export default {
  name: "ClientMessagesView",
  components: {
    ClientConversationList,
    ClientChatModal
  },
  props: {
    clientProfile: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      error: "",
      conversations: [],
      chatModalOpen: false,
      chatTeacher: null,
      activeConversationId: ""
    };
  },
  created() {
    this.fetchConversations();
  },
  methods: {
    fetchConversations() {
      const empresaId = resolveEmpresaId();
      const studentId = resolveClientId(this.clientProfile);
      if (!empresaId || !studentId) {
        this.error = "Aluno nao encontrado.";
        this.conversations = [];
        return;
      }
      const params = new URLSearchParams({
        empresa_id: empresaId,
        user_id: String(studentId),
        aluno_id: String(studentId)
      });
      this.loading = true;
      this.error = "";
      fetch(`${API_BASE}/api/conversations/lista?${params.toString()}`, {
        headers: {
          "Content-Type": "application/json",
          ...authHeaders()
        }
      })
        .then(async (response) => {
          const data = await response.json().catch(() => []);
          if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar conversas.");
          }
          const list = Array.isArray(data) ? data : data.data || [];
          const normalized = list.filter(Boolean).map((conv) => normalizeConversation(conv));
          const seen = new Set();
          const deduped = [];
          normalized.forEach((conv) => {
            const key = conv.teacherId || conv.teacherEmail || conv.teacherName;
            if (!key || seen.has(key)) return;
            seen.add(key);
            deduped.push(conv);
          });
          this.conversations = deduped;
        })
        .catch((error) => {
          this.error = error.message || "Erro ao carregar conversas.";
          this.conversations = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    openConversation(conv) {
      if (!conv) {
        return;
      }
      this.chatTeacher = { id: conv.teacherId, name: conv.teacherName };
      this.chatModalOpen = true;
      this.activeConversationId = conv.conversationId || conv.id;
    },
    closeChatModal() {
      this.chatModalOpen = false;
      this.activeConversationId = "";
    },
    updateConversationId(conversationId) {
      this.activeConversationId = conversationId;
    },
    updateTeacher(teacher) {
      if (teacher && teacher.id) {
        this.chatTeacher = teacher;
      }
    }
  }
};
</script>

<style scoped>
.messages-view {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
