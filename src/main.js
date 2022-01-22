import { createApp } from "vue";

import "@/utils/config";
import "@/scss/main.scss";

import App from "@/App.vue";
const app = createApp(App);

import emitter from '@/utils/eventbus';
app.config.globalProperties.emitter = emitter;

import { createStore } from "vuex";
import user from "@/datastores/user.js";
import dates from "@/datastores/dates.js";
const store = createStore({
  modules: {
    user,
    dates,
  },
});
app.use(store);
app.mount("#app");
