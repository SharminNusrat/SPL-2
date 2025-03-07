<template>
  <div id="app">
    <Header />
    <div class="app-container">
      <Sidebar v-if="showSidebar && isActive" />
      <main :class="{ 'content-with-sidebar': showSidebar && isActive, 'full-content': !showSidebar || !isActive }">
        <router-view 
        @login-success="updateUserRole"
        @verify-success="updateUserRole" 
        />
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
    const isActive = ref(false);
    
    const hideSidebarRoutes = ["/", "/login", "/register", "/verify", "/forgot-password","/waiting-approval" ];

    userRole.value = localStorage.getItem("userRole");
    
    const checkUserActive = () => {
      const userActiveStatus = localStorage.getItem("is_active");
      isActive.value = userActiveStatus !== null && userActiveStatus !== "0";
    };
    
    checkUserActive();

    watchEffect(() => {
      showSidebar.value = !hideSidebarRoutes.includes(route.path) && userRole.value !== null && userRole.value !== undefined;
    });
    
    watch(userRole, () => {
      showSidebar.value = !hideSidebarRoutes.includes(route.path) && userRole.value;
      checkUserActive(); 
    });
    
    const updateUserRole = (role) => {
      userRole.value = role;
      checkUserActive(); 
    };

    return {
      showSidebar,
      isActive,
      updateUserRole
    };
      
  }
};
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex: 1; 
  overflow: hidden;
}

.content-with-sidebar {
  flex-grow: 1;
  padding: 20px;
  margin-left: 250px; 
  overflow-y: auto;  
  height: calc(100vh - 120px); 
}

.full-content {
  width: 100%;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 120px); 
}
</style>