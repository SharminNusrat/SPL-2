<template>
  <div class="dashboard">
    <Sidebar />
    <div class="content">
      <h1>Student/Teacher Dashboard</h1>
      <p>Manage tickets, check status, and upload files.</p>
      <button @click="$router.push('/dashboard/create-ticket')">Create Ticket</button>
      <button @click="$router.push('/dashboard/tickets')">View Tickets</button>
    </div>
  </div>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";

export default {
  components: { Sidebar },
};
</script>

<style>
.dashboard {
  display: flex;
}
.content {
  margin-left: 260px;
  padding: 20px;
}
</style>
