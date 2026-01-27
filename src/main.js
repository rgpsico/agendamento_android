import Vue from "vue";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import App from "./App.vue";
import "./assets/styles.css";

Vue.config.productionTip = false;

async function setupPushNotifications() {
  if (!Capacitor.isNativePlatform()) return;

  const perm = await PushNotifications.requestPermissions();
  if (perm.receive !== "granted") {
    console.log("❌ Permissão de push negada");
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener("registration", async (token) => {
    console.log("🔥 FCM TOKEN:", token.value);

    try {
      await fetch("https://agendamento.rjpasseios.com.br/api/device/token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          fcm_token: token.value,
          platform: Capacitor.getPlatform()
        })
      });
    } catch (err) {
      console.error("❌ Erro ao salvar token:", err);
    }
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("❌ Erro no push:", err);
  });
}

setupPushNotifications();

new Vue({
  render: (h) => h(App)
}).$mount("#app");
