<template>
  <div id="app">
    <Header />
    <!-- Main layout that wraps Sidebar and Content -->
    <div class="app-container">
      <!-- Sidebar for authenticated users -->
      <Sidebar v-if="showSidebar" />

      <!-- Main content area with conditional sidebar -->
      <main :class="{ 'content-with-sidebar': showSidebar, 'full-content': !showSidebar }">
        <router-view />
      </main>
    </div>
    <Footer />
  </div>
</template>

<script>
import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import Sidebar from './components/Sidebar.vue';
import { computed, ref, onMounted } from "vue";
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

    // Routes where sidebar shouldn't appear
    const hideSidebarRoutes = ["/", "/login", "/register", "/verify", "/forgot-password"];

    onMounted(() => {
      userRole.value = localStorage.getItem("userRole"); // Get user role from local storage
    });

    return {
      showSidebar: computed(() => !hideSidebarRoutes.includes(route.path) && userRole.value),
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
  margin-left: 250px; /* Sidebar width */
  overflow-y: auto; /* Only this part will scroll */
  height: calc(100vh - 120px); /* Adjust for header and footer height */
}

/* Full content when no sidebar */
.full-content {
  width: 100%;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 120px); /* Adjust for header and footer height */
}
</style>
