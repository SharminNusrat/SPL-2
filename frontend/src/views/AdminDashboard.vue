<template>
    <div class="dashboard">
      <Sidebar />
      <div class="content">
        <h1>Admin Dashboard</h1>
        <p>Manage users, tickets, and reports.</p>
      </div>
    </div>
  </template>
  
  <script>
  import Sidebar from "../components/Sidebar.vue";
  
  export default {
    components: { Sidebar },
  };
  </script>
  
  <style scoped>
  .dashboard {
    display: flex;
  }
  .content {
    margin-left: 260px;
    padding: 20px;
  }
  </style>
  