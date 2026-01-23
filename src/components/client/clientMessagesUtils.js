const PROD_API_BASE = "https://agendamento.rjpasseios.com.br";
const API_BASE = PROD_API_BASE;

const STORAGE = {
  TOKEN: "agenda_client_token",
  COMPANY: "agenda_client_company_id",
  EMPRESA: "agenda_empresa_id",
  PROFILE: "agenda_client_profile"
};

function authHeaders() {
  const token = localStorage.getItem(STORAGE.TOKEN);
  return token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : {};
}

function resolveEmpresaId() {
  return localStorage.getItem(STORAGE.COMPANY) || localStorage.getItem(STORAGE.EMPRESA) || "";
}

function loadStoredProfile() {
  const raw = localStorage.getItem(STORAGE.PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function resolveClientId(profile) {
  const data = profile || loadStoredProfile() || {};
  const storedUserId = localStorage.getItem("user_id") || "";
  return (
    data.id ||
    data.user_id ||
    data.usuario_id ||
    data.aluno_id ||
    data.alunoId ||
    storedUserId ||
    ""
  );
}

function formatDateTimePtBr(value) {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(value);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function normalizeSender(from, studentId, msg) {
  if (from) {
    const value = String(from).toLowerCase();
    if (value === "me" || value === "aluno" || value === "student" || value === "cliente") {
      return "me";
    }
    if (value === "professor" || value === "teacher") {
      return "teacher";
    }
  }
  const senderId = String(
    msg.user_id ||
      msg.remetente_id ||
      msg.sender_id ||
      msg.usuario_id ||
      msg.author_id ||
      ""
  );
  if (studentId && senderId && senderId === String(studentId)) {
    return "me";
  }
  return "teacher";
}

function formatMessageTime(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) {
    return value.slice(0, 5);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function extractMessages(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.last_message) return [payload.last_message];
  if (Array.isArray(payload.messages)) return payload.messages;
  if (Array.isArray(payload.mensagens)) return payload.mensagens;
  if (Array.isArray(payload.conversation?.messages)) return payload.conversation.messages;
  if (Array.isArray(payload.conversation?.mensagens)) return payload.conversation.mensagens;
  if (Array.isArray(payload.conversa?.mensagens)) return payload.conversa.mensagens;
  if (Array.isArray(payload.data?.messages)) return payload.data.messages;
  if (Array.isArray(payload.data?.mensagens)) return payload.data.mensagens;
  return [];
}

function normalizeMessages(messages, studentId) {
  return messages
    .map((msg) => {
      const text = msg.text || msg.mensagem || msg.message || msg.conteudo || msg.body || "";
      const time = formatMessageTime(msg.time || msg.hora || msg.created_at || msg.data_hora);
      const from = normalizeSender(msg.from || msg.remetente || msg.autor, studentId, msg);
      if (!text) return null;
      return { from, text, time };
    })
    .filter(Boolean);
}

function extractConversationId(payload) {
  if (!payload) return "";
  return (
    payload.conversation_id ||
    payload.conversation?.id ||
    payload.conversa?.id ||
    payload.data?.conversation_id ||
    payload.data?.conversation?.id ||
    ""
  );
}

function normalizeConversation(conv) {
  if (!conv) {
    return {
      id: "",
      conversationId: "",
      teacherId: "",
      teacherName: "Professor",
      teacherEmail: "",
      lastMessage: "-",
      lastMessageTime: ""
    };
  }
  const conversationId = extractConversationId(conv) || conv.conversation_id || conv.id || "";
  const contato = conv.contato || conv.contact || {};
  const professor =
    conv.professor ||
    conv.teacher ||
    conv.professor_usuario ||
    conv.professorUser ||
    conv.professor_user ||
    {};
  const company =
    conv.empresa ||
    conv.company ||
    conv.empresa_usuario ||
    conv.company_user ||
    conv.companyUser ||
    {};
  const profUser = professor.usuario || professor.user || professor;
  const companyUser = company.usuario || company.user || company;
  const teacherId =
    contato.id ||
    profUser.id ||
    companyUser.id ||
    conv.professor_id ||
    conv.professorId ||
    conv.professor_user_id ||
    conv.professorUserId ||
    conv.teacher_id ||
    conv.teacherId ||
    conv.teacher_user_id ||
    conv.teacherUserId ||
    conv.empresa_id ||
    conv.empresaId ||
    conv.company_id ||
    conv.companyId ||
    "";
  const teacherName =
    contato.nome ||
    contato.name ||
    profUser.nome ||
    profUser.name ||
    companyUser.nome ||
    companyUser.name ||
    conv.empresa_nome ||
    conv.companyName ||
    conv.professorName ||
    conv.professor_nome ||
    conv.teacherName ||
    "Professor";
  const teacherEmail =
    contato.email ||
    profUser.email ||
    companyUser.email ||
    conv.professorEmail ||
    conv.professor_email ||
    conv.teacherEmail ||
    conv.empresa_email ||
    conv.companyEmail ||
    "";
  const last = conv.last_message || {};
  const lastMessage = last.body || last.mensagem || last.message || last.text || "-";
  const lastMessageTime = formatDateTimePtBr(last.created_at || last.data_hora || "");
  return {
    id: conv.id || conversationId,
    conversationId,
    empresaId: conv.empresa_id || conv.empresaId || conv.company_id || conv.companyId || "",
    teacherId,
    teacherName,
    teacherEmail,
    lastMessage,
    lastMessageTime
  };
}

export {
  API_BASE,
  STORAGE,
  authHeaders,
  resolveEmpresaId,
  resolveClientId,
  formatDateTimePtBr,
  normalizeSender,
  formatMessageTime,
  extractMessages,
  normalizeMessages,
  extractConversationId,
  normalizeConversation
};
