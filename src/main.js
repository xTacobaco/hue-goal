import { createApp } from "vue";
import { createPinia } from "pinia";

import "@/utils/config";
import "@/scss/main.scss";

import App from "@/App.vue";
import emitter from "@/utils/eventbus";
import i18n from "@/i18n";
import { useUserStore } from "@/datastores/user.js";

const app = createApp(App);
const pinia = createPinia();

app.config.globalProperties.emitter = emitter;
app.use(i18n);
app.use(pinia);

useUserStore().listen();

app.mount("#app");
