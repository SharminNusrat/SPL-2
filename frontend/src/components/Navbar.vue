// File: src/components/Navbar.vue
<template>
  <nav class="navbar">
    <div class="container">
      <h1>LabHelp</h1>
      <ul>
        <li><router-link to="/dashboard">Home</router-link></li>
        <li v-if="role === 'student' || role === 'teacher'"><router-link to="/create-ticket">Create Ticket</router-link></li>
        <li v-if="role === 'technician'"><router-link to="/technician">Technician Dashboard</router-link></li>
        <li v-if="role === 'admin'"><router-link to="/admin">Admin Dashboard</router-link></li>
        <li><button @click="logout">Logout</button></li>
      </ul>
    </div>
  </nav>
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
.navbar {
  background: #343a40;
  color: white;
  padding: 15px;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
ul {
  list-style: none;
  display: flex;
  gap: 15px;
}
ul li {
  display: inline;
}
ul li a, button {
  color: white;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
ul li a:hover, button:hover {
  text-decoration: underline;
}
</style>
