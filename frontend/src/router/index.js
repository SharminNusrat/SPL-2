import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import VerifyMailPage from '../views/VerifyMailPage.vue';
//import DashboardPage from '../views/DashboardPage.vue';
import CreateTicket from '../views/CreateTicket.vue';
import TicketListPage from '../views/TicketListPage.vue';
import TicketDetailsPage from '../views/TicketDetailsPage.vue';

const routes = [
  { 
    path: '/', 
    redirect: '/login' 
  },
  { 
    path: '/login', 
    name: 'login',
    component: LoginPage 
  },
  { 
    path: '/register', 
    name: 'register',
    component: RegisterPage 
  },
  { 
    path: '/verify', 
    name: 'verify',
    component: VerifyMailPage 
  },
  
  // { 
  //   path: '/dashboard', 
  //   name: 'dashboard',
  //   component: DashboardPage,
  //   meta: { requiresAuth: true } // Add authentication requirement
  // }

  {
    path: '/create-ticket',
    name: 'create-ticket',
    component: CreateTicket,
    meta: { requiresAuth: true }
  },
  {
    path: '/tickets',
    name: 'ticket-list',
    component: TicketListPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/ticket/:id',
    name: 'ticket-details',
    component: TicketDetailsPage,
    meta: { required: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
// router.beforeEach((to, from, next) => {
//   const isAuthenticated = localStorage.getItem('user'); // Check if user is logged in
  
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     next('/login');
//   } else {
//     next();
//   }
// });

export default router;