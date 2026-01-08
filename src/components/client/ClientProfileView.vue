<template>
  <section class="view client-profile">
    <div class="view-header">
      <h3>Perfil</h3>
    </div>
    <div class="form-card">
      <div class="form-grid">
        <label class="field">
          <span>Nome</span>
          <input type="text" v-model.trim="clientProfile.nome" />
        </label>
        <label class="field">
          <span>Email</span>
          <input type="email" v-model.trim="clientProfile.email" />
        </label>
        <label class="field">
          <span>Telefone</span>
          <input type="text" v-model.trim="clientProfile.telefone" />
        </label>
        <label class="field">
          <span>Documento</span>
          <input type="text" v-model.trim="clientProfile.documento" />
        </label>
        <label class="field">
          <span>Foto (URL)</span>
          <input type="text" v-model.trim="clientProfile.foto" placeholder="https://..." />
        </label>
      </div>
      <div v-if="clientProfile.foto" class="actions">
        <img :src="clientProfile.foto" alt="Foto do perfil" class="service-thumb" />
      </div>
      <div class="actions">
        <button class="primary-btn" @click="saveClientProfile">Salvar</button>
      </div>
      <p v-if="clientProfileSaved" class="hint">Perfil atualizado.</p>
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
