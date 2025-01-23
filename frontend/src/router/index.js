import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
// import EmailVerificationPage from '../views/EmailVerificationPage.vue';
// import DashboardPage from '../views/DashboardPage.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
//   { path: '/verify-email', component: EmailVerificationPage },
//   { path: '/dashboard', component: DashboardPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
