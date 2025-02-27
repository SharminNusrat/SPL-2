// File: src/views/TechnicianDashboard.vue
<template>
  <div class="dashboard">
    <Sidebar />
    <div class="content">
      <h1>Technician Dashboard</h1>
      <p>View assigned tickets and update ticket status.</p>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";

export default {
  components: { Sidebar },
};
</script>
