<template>
  <div>
    <div class="view-header">
      <div class="header-content">
        <div class="header-left">
          <div class="icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h3>Mensagens</h3>
            <p class="subtitle">Bate-papos do aluno</p>
          </div>
        </div>
        <button class="refresh-btn" @click="$emit('refresh')" :disabled="loading">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: loading }">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          Atualizar
        </button>
      </div>
    </div>

    <div class="conversations-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando conversas...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
        <button class="secondary-btn" @click="$emit('refresh')">Tentar novamente</button>
      </div>

      <div v-else-if="!conversations.length" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <h4>Nenhuma conversa ainda</h4>
        <p>Suas conversas com professores vao aparecer aqui</p>
      </div>

      <div v-else class="conversations-grid">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conversation-card"
          @click="$emit('open', conv)"
        >
          <div class="avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div class="conversation-info">
            <div class="conversation-header">
              <h4 class="teacher-name">{{ conv.teacherName }}</h4>
              <span v-if="conv.teacherId" class="teacher-id">#{{ conv.teacherId }}</span>
              <span class="time" v-if="conv.lastMessageTime">{{ conv.lastMessageTime }}</span>
            </div>
            <p v-if="conv.teacherEmail" class="teacher-email">{{ conv.teacherEmail }}</p>
            <p class="last-message">{{ conv.lastMessage }}</p>
          </div>
          <div class="conversation-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ClientConversationList",
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ""
    },
    conversations: {
      type: Array,
      default: () => []
    }
  }
};
</script>

<style scoped>
.view-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
}

.header-left h3 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: #64748b;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.conversations-container {
  min-height: 400px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-state svg {
  color: #ef4444;
  opacity: 0.8;
}

.empty-state svg {
  color: #cbd5e1;
}

.empty-state h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

.conversations-grid {
  display: grid;
  gap: 12px;
}

.conversation-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.conversation-card:hover {
  border-color: #2563eb;
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.1);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.teacher-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.teacher-id {
  font-size: 12px;
  color: #94a3b8;
}

.teacher-email {
  margin: 0 0 6px;
  font-size: 13px;
  color: #94a3b8;
  word-break: break-word;
}

.time {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
}

.last-message {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-arrow {
  color: #cbd5e1;
  flex-shrink: 0;
}

.secondary-btn {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
  }

  .refresh-btn {
    width: 100%;
    justify-content: center;
  }

  .conversation-card {
    padding: 14px;
  }
}
</style>
