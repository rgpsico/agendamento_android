<template>
  <section class="view">
    <div class="view-header">
      <h3>Laboratorio Nativo</h3>
      <button class="secondary-btn" @click="clearLogs">Limpar logs</button>
    </div>

    <div class="cards">
      <div class="card">
        <p class="card-title">Ambiente</p>
        <p class="card-value">{{ platformLabel }}</p>
        <p class="card-subtitle">{{ nativeLabel }}</p>
      </div>
    </div>

    <div class="form-card">
      <div class="form-grid">
        <button class="primary-btn" @click="testLocalNotification">Testar notificacao</button>
        <button class="secondary-btn" @click="testHaptics">Testar haptics</button>
        <button class="secondary-btn" @click="testToast">Testar toast</button>
        <button class="secondary-btn" @click="getDeviceInfo">Info do dispositivo</button>
        <button class="secondary-btn" @click="getGeolocation">Localizacao</button>
        <button class="secondary-btn" @click="testClipboard">Clipboard</button>
        <button class="secondary-btn" @click="testShare">Compartilhar</button>
      </div>
      <p class="hint">
        Se algum recurso nao responder, o plugin pode nao estar instalado no app nativo.
      </p>
    </div>

    <div class="form-card">
      <p class="card-title">Logs</p>
      <div class="log-box">
        <p v-if="!logs.length" class="hint">Sem logs ainda.</p>
        <pre v-else>{{ logs.join("\n") }}</pre>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ProfessorCapacitorLabView",
  data() {
    return {
      logs: []
    };
  },
  computed: {
    platformLabel() {
      const cap = window && window.Capacitor ? window.Capacitor : null;
      if (!cap) return "Web";
      return cap.getPlatform ? cap.getPlatform() : "Web";
    },
    nativeLabel() {
      const cap = window && window.Capacitor ? window.Capacitor : null;
      if (!cap || !cap.isNativePlatform) return "Ambiente web";
      return cap.isNativePlatform() ? "Rodando nativo" : "Ambiente web";
    }
  },
  methods: {
    log(message) {
      this.logs = [...this.logs, message];
    },
    clearLogs() {
      this.logs = [];
    },
    getPlugin(name) {
      const cap = window && window.Capacitor ? window.Capacitor : null;
      if (!cap || !cap.Plugins) return null;
      return cap.Plugins[name] || null;
    },
    async testLocalNotification() {
      const LocalNotifications = this.getPlugin("LocalNotifications");
      if (!LocalNotifications) {
        this.log("LocalNotifications indisponivel. Instale @capacitor/local-notifications.");
        return;
      }
      try {
        await LocalNotifications.requestPermissions();
        const id = Date.now();
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title: "Teste de notificacao",
              body: "Notificacao local enviada pelo Capacitor.",
              schedule: { at: new Date(Date.now() + 2000) }
            }
          ]
        });
        this.log("Notificacao agendada (2s).");
      } catch (error) {
        this.log(`Erro notificacao: ${error.message || error}`);
      }
    },
    async testHaptics() {
      const Haptics = this.getPlugin("Haptics");
      if (!Haptics) {
        this.log("Haptics indisponivel. Instale @capacitor/haptics.");
        return;
      }
      try {
        await Haptics.impact({ style: "medium" });
        this.log("Haptics executado.");
      } catch (error) {
        this.log(`Erro haptics: ${error.message || error}`);
      }
    },
    async testToast() {
      const Toast = this.getPlugin("Toast");
      if (!Toast) {
        this.log("Toast indisponivel. Instale @capacitor/toast.");
        return;
      }
      try {
        await Toast.show({ text: "Toast do Capacitor" });
        this.log("Toast exibido.");
      } catch (error) {
        this.log(`Erro toast: ${error.message || error}`);
      }
    },
    async getDeviceInfo() {
      const Device = this.getPlugin("Device");
      if (!Device) {
        this.log("Device indisponivel. Instale @capacitor/device.");
        return;
      }
      try {
        const info = await Device.getInfo();
        this.log(`Device: ${JSON.stringify(info)}`);
      } catch (error) {
        this.log(`Erro device: ${error.message || error}`);
      }
    },
    async getGeolocation() {
      const Geolocation = this.getPlugin("Geolocation");
      if (!Geolocation) {
        this.log("Geolocation indisponivel. Instale @capacitor/geolocation.");
        return;
      }
      try {
        const pos = await Geolocation.getCurrentPosition();
        const coords = pos && pos.coords ? pos.coords : {};
        this.log(`GPS: lat=${coords.latitude} lng=${coords.longitude}`);
      } catch (error) {
        this.log(`Erro geolocation: ${error.message || error}`);
      }
    },
    async testClipboard() {
      const Clipboard = this.getPlugin("Clipboard");
      if (!Clipboard) {
        this.log("Clipboard indisponivel. Instale @capacitor/clipboard.");
        return;
      }
      try {
        await Clipboard.write({ string: "Teste do Capacitor" });
        const result = await Clipboard.read();
        this.log(`Clipboard: ${result.value || ""}`);
      } catch (error) {
        this.log(`Erro clipboard: ${error.message || error}`);
      }
    },
    async testShare() {
      const Share = this.getPlugin("Share");
      if (!Share) {
        this.log("Share indisponivel. Instale @capacitor/share.");
        return;
      }
      try {
        await Share.share({
          title: "Teste Compartilhar",
          text: "Compartilhando via Capacitor",
          url: "https://agendamento.rjpasseios.com.br",
          dialogTitle: "Compartilhar"
        });
        this.log("Compartilhamento aberto.");
      } catch (error) {
        this.log(`Erro share: ${error.message || error}`);
      }
    }
  }
};
</script>
