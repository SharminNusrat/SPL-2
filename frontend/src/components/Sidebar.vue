<template>
  <aside class="sidebar">
    <h2>Dashboard</h2>
    <ul>
      <li><router-link to="/dashboard">Home</router-link></li>

      <template v-if="role === 'student' || role === 'teacher'">
        
        <li><router-link to="/dashboard/create-ticket">Create Ticket</router-link></li>
        <li><router-link to="/dashboard/ticket/:id">Ticket Details</router-link></li>
      </template>

      <template v-if="role === 'technician'">
        <li><router-link to="/technician">Assigned Tickets</router-link></li>

      </template>

      <template v-if="role === 'admin'">
        <!-- <li><router-link to="/admin"></router-link></li> -->
        <li><router-link to="/dashboard/tickets">All Tickets</router-link></li>
        <!-- <li><router-link to="/users">Users</router-link></li> -->
        <!-- <li><router-link to="/technician-reports">Technician Reports</router-link></li> -->
        <!-- <li><router-link to="/category-reports">Category Reports</router-link></li> -->
      </template>

      <li><button @click="logout">Logout</button></li>
    </ul>
  </aside>
</template>

<script>
export default {
  data() {
    return {
      role: localStorage.getItem("userRole"),
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      this.$router.push("/login");
    },
  },
};
</script>

<style>
.sidebar {
  width: 250px;
  height: 100vh;
  background-color: #343a40;
  color: white;
  padding: 20px;
  position: fixed;
}
.sidebar ul {
  list-style: none;
}
.sidebar ul li a, .sidebar ul li button {
  color: white;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  display: block;
  padding: 10px;
}
.sidebar ul li a:hover, .sidebar ul li button:hover {
  background: #495057;
}
</style>
