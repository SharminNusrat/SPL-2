<template>
  <div id="app">
    <Header />
    <div class="app-container">
      <Sidebar v-if="showSidebar" />
      <main :class="{ 'content-with-sidebar': showSidebar, 'full-content': !showSidebar }">
        <router-view @login-success="updateUserRole" />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Sidebar from './components/Sidebar.vue';
import { ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    Sidebar
  },
  setup() {
    const route = useRoute();
    const userRole = ref(null);
    const showSidebar = ref(false);
    

    // Routes where sidebar shouldn't appear
    const hideSidebarRoutes = ["/", "/login", "/register", "/verify", "/forgot-password"];

    // Get user role from local storage
    userRole.value = localStorage.getItem("userRole");

    // Watch for route or userRole changes
    watchEffect(() => {
      showSidebar.value = !hideSidebarRoutes.includes(route.path) && userRole.value !== null && userRole.value !== undefined;
    });
    
    watch(userRole, () => {
      showSidebar.value = !hideSidebarRoutes.includes(route.path) && userRole.value;
    });
    const updateUserRole = (role) => {
      userRole.value = role;
    };

    return {
      showSidebar,
      updateUserRole
    };
      
  }
};
</script>

<style>
/* Full height for the layout */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Main layout container */
.app-container {
  display: flex;
  flex: 1; /* This makes the content take all available space */
  overflow: hidden;
}

/* Sidebar + Content layout */
.content-with-sidebar {
  flex-grow: 1;
  padding: 20px;
  margin-left: 250px; 
  overflow-y: auto;  
  height: calc(100vh - 120px); 
}

/* Full content when no sidebar */
.full-content {
  width: 100%;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 120px); 
}
</style>
