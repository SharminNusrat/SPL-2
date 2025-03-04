import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import VerifyMailPage from '../views/VerifyMailPage.vue';
import CreateTicket from '../views/CreateTicket.vue';
import TicketListPage from '../views/TicketListPage.vue';
import TicketDetailsPage from '../views/TicketDetailsPage.vue';
import UserTicketsPage from '../views/UserTicketsPage.vue';
import Dashboard from '../views/Dashboard.vue';
import StudentTeacherDashboard from '../views/StudentTeacherDashboard.vue';
import TechnicianDashboard from '../views/TechnicianDashboard.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import UserProfile from '../views/UserProfile.vue';
import TicketCategory from '../views/TicketCategory.vue';
import CategoryReport from '../views/CategoryReport.vue';
import TechnicianReport from '../views/TechnicianPerformance.vue';
import TechnicianSelfReport from '../views/TechnicianSelfReport.vue';
import ForgotPassword from '../views/ForgotPassword.vue';
import HomePage from '../views/HomePage.vue';

const routes = [
  { 
    path: '/', 
    name: 'home',
    component: HomePage
  },
  { 
    path: '/login', 
    name: 'login',
    component: LoginPage 
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component
    : ForgotPassword
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
  {
    path: '/my-tickets',
    name: 'my-tickets',
    component: UserTicketsPage,
    meta: { required: true }
  },
  {
    path: '/category',
    name: 'category',
    component: TicketCategory,
    meta: { requiresAuth: true }
  },
  {
    path: '/categoryReport',
    name: 'categoryReport',
    component: CategoryReport,
    meta: { requiresAuth: true }
  },
  {
    path: '/technicianReport',
    name: 'technicianReport',
    component: TechnicianReport,
    meta: { requiresAuth: true }
  },
  {
    path: '/technicianSelfReport/:id',
    name: 'technicianSelfReport',
    component: TechnicianSelfReport,
    meta: { requiresAuth: true }
  },
  
  { path: '/dashboard',
    name: 'dashboard', 
    component: Dashboard, 
    meta: { requiresAuth: true } 
  },
  { path: '/student-teacher',
    name: 'student-teacherDashboard',
    component: StudentTeacherDashboard, 
    meta: { requiresAuth: true } 
  },
  { path: '/technician',
    name: 'technicianDashboard',
    component: TechnicianDashboard, 
    meta: { requiresAuth: true } 
  },
  { path: '/admin',
    name: 'adminDashboard',
    component: AdminDashboard, 
    meta: { requiresAuth: true } 
  },
  { path: '/profile',
    name: 'profile',
    component: UserProfile, 
    meta: { requiresAuth: true } 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("accessToken"); // Check if user is logged in
  const userRole = localStorage.getItem("userRole"); // Get user role
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login'); // Redirect unauthenticated users to login
  } else if (to.path === '/dashboard' && isAuthenticated) {
    // Redirect users to their specific dashboard based on role
    if (userRole === "student" || userRole === "teacher") {
      next('/student-teacher');
    } else if (userRole === "technician") {
      next('/technician');
    } else if (userRole === "admin") {
      next('/admin');
    } else {
      next('/login');
    }
  } else {
    next();
  }
});


export default router;