import Vue from 'vue'
import { firestorePlugin } from 'vuefire'

import App from './App.vue'
import './scss/main.scss'

Vue.config.productionTip = false
Vue.use(firestorePlugin)

new Vue({
  render: h => h(App),
}).$mount('#app')
