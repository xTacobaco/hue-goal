import { createApp } from "vue";
import { createPinia } from "pinia";

import "@/utils/config";
import "@/scss/main.scss";

import App from "@/App.vue";
import emitter from "@/utils/eventbus";
import { useUserStore } from "@/datastores/user.js";

const app = createApp(App);
const pinia = createPinia();

app.config.globalProperties.emitter = emitter;
app.use(pinia);

useUserStore().listen();

app.mount("#app");
