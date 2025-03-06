import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const app = createApp(App);
app.use(router);
app.mount('#app');