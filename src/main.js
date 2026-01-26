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

  PushNotifications.addListener("registration", (token) => {
    console.log("🔥 FCM TOKEN:", token.value);
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("❌ Erro no push:", err);
  });
}

setupPushNotifications();

new Vue({
  render: (h) => h(App)
}).$mount("#app");
