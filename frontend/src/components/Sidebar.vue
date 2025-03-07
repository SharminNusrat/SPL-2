<template>
  <aside class="sidebar">
    <h2>Dashboard</h2>
    <ul>
      <li><router-link to="/dashboard">Home</router-link></li>
      <li><router-link to="/profile">Profile</router-link></li>

      <template v-if="role === 'student' || role === 'teacher'">
        
        <li><router-link to="/create-ticket">Create Ticket</router-link></li>
        <li><router-link to="/my-tickets">Your Tickets</router-link></li>
        <li><router-link to="/categoryReport">Category Reports</router-link></li>
        
      </template>

      <template v-if="role === 'technician'">

        <li><router-link to="/my-tickets">Assigned Tickets</router-link></li>
        <li><router-link to="/categoryReport">Category Reports</router-link></li>
        <li><router-link to="/technicianAvailability">Availability Status</router-link></li>
        <li><router-link to="/technicianSelfReport/:id">Your Performance Report</router-link></li>

      </template>

      <template v-if="role === 'admin'">
        <li><router-link to="/tickets">All Tickets</router-link></li>
        <li><router-link to="/technicians">All Technicians</router-link></li>
        <li><router-link to="/category">Ticket Categories</router-link></li>
        <li><router-link to="/categoryReport">Category Reports</router-link></li>
        <li><router-link to="/technicianReport">Technician Reports</router-link></li>
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
      localStorage.removeItem("userId");
      localStorage.removeItem("is_active");
      localStorage.removeItem("isVerified");
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
