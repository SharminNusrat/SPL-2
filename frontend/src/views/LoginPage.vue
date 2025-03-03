<template>
  <div class="login container d-flex justify-content-center align-items-center vh-100">
    <div class="row w-100">
      <div class="col-md-6 offset-md-3">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="text-center mb-4">Login</h3>
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  v-model="email"
                  type="email"
                  id="email"
                  class="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  v-model="password"
                  type="password"
                  id="password"
                  class="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div class="mb-3 text-end">
                <router-link to="/forgot-password">Forgot password?</router-link>
              </div>
              <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
            <p class="text-center mt-3">
              Don't have an account? <router-link to="/register">Register</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async handleLogin() {
      try {
        const res = await axios.post("/api/user/login", {
          email: this.email,
          password: this.password,
        },
        {
          withCredentials: true,
        });

        // Store token and redirect user
        localStorage.setItem("accessToken", res.data.token);
        localStorage.setItem("userId", res.data.id); 
        localStorage.setItem("userRole", res.data.role); // Save role
        alert("Login successful!");

        this.$router.replace("/dashboard");

      }catch (error) {
        console.error(error.response?.data || "Login failed");
        
        const errorMessage = error.response?.data || "Invalid email or password!";
        
        if (errorMessage.includes("Your account is not verified")) {
          alert("Redirecting to verification page...");
          this.$router.push({ path: "/verify", query: { email: this.email } });
        } else {
          alert(errorMessage);
        }
      }
    }
  },
};
</script>

<style>
.login {
  background-color: #f8f9fa;
}
.card {
  border-radius: 10px;
}
</style>