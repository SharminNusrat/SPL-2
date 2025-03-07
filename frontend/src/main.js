import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios'; // Import Axios
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const app = createApp(App);

// Axios Interceptor to Auto-Logout on Deactivation
axios.interceptors.response.use(
    response => response, 
    error => {
        if (error.response && error.response.status === 403) {
            if (error.response.data.error === "Your account has been deactivated!") {
                alert("Your account has been deactivated! Logging out...");
                localStorage.clear();
                router.push("/login");
            }
        }
        return Promise.reject(error);
    }
);

app.use(router);
app.mount('#app');
