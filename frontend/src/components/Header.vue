<template>
  <header class="header">
    <div class="logo">LabHelp</div>
    <div v-if="!isLoggedIn" class="auth-buttons">
      <router-link to="/register" class="signup-btn">Sign Up</router-link>
      <router-link to="/login" class="login-btn">Log In</router-link>
    </div>
    <div v-else>
      <router-link to="/dashboard" class="login-btn">Dashboard</router-link>
      <button @click="logout" class="logout-btn">Log Out</button>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      isLoggedIn: false,
    };
  },
  mounted() {
    this.checkLoginStatus();
    this.interval = setInterval(() => {
      this.checkLoginStatus();
    }, 2000);
  },
  beforeUnmount() {
    clearInterval(this.interval); 
  },
  methods: {
    checkLoginStatus() {
      this.isLoggedIn = !!localStorage.getItem("accessToken");
    },
    logout() {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      this.isLoggedIn = false;
      this.$router.push("/login");

    },
  },
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: #9c9cb9;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

.auth-buttons {
  display: flex;
  gap: 10px;
}

.signup-btn,
.login-btn {
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
  text-align: center;
}

.signup-btn {
  background: #28a745;
  color: white;
}

.signup-btn:hover {
  background: #218838;
}

.login-btn {
  background: #e0e0e0;
  color: black;
}

.login-btn:hover {
  background: #d6d6d6;
}

.logout-btn {
  background: #dc3545;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
