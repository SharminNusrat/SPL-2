<template>
    <div class="login container d-flex justify-content-center align-items-center vh-100">
      <div class="row w-100">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h3 class="text-center mb-4">Forgot Password</h3>
              
              <div v-if="step === 1">
                <p class="text-center mb-4">Enter your email to receive a password reset OTP.</p>
                <form @submit.prevent="requestOTP">
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
                  <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                    {{ loading ? 'Sending...' : 'Send OTP' }}
                  </button>
                </form>
              </div>
  
              <div v-if="step === 2">
                <p class="text-center mb-4">Please enter the OTP sent to <strong>{{ email }}</strong>.</p>
                <form @submit.prevent="resetPassword">
                  <div class="mb-3">
                    <label for="otp" class="form-label">OTP</label>
                    <input
                      v-model="otp"
                      type="text"
                      id="otp"
                      class="form-control"
                      placeholder="Enter OTP"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="newPassword" class="form-label">New Password</label>
                    <input
                      v-model="newPassword"
                      type="password"
                      id="newPassword"
                      class="form-control"
                      placeholder="Enter new password"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <input
                      v-model="confirmPassword"
                      type="password"
                      id="confirmPassword"
                      class="form-control"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                    {{ loading ? 'Resetting...' : 'Reset Password' }}
                  </button>
                </form>
              </div>
  
              <p class="text-center mt-3">
                <router-link to="/login">Back to Login</router-link>
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
        step: 1,
        email: "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
        loading: false
      };
    },
    created() {
      // Check URL parameters
      if (this.$route.query.email) {
        this.email = this.$route.query.email;
      }
      if (this.$route.query.step === '2') {
        this.step = 2;
      }
      
      // Check localStorage
      const savedEmail = localStorage.getItem('resetEmail');
      if (savedEmail && !this.email) {
        this.email = savedEmail;
        this.step = 2;
      }
    },
    methods: {
      async requestOTP() {
        if (!this.email) {
          alert("Please enter your email address");
          return;
        }
        
        this.loading = true;
        
        try {
          const res = await axios.post("/api/user/recoverPassword/generateOTP", {
            email: this.email
          });
          
          if (res.data.status === 'success') {
            // Save email to localStorage
            localStorage.setItem('resetEmail', this.email);
            
            // Move to step 2 directly
            this.step = 2;
            
            // Update URL to preserve state on refresh
            this.$router.replace({ 
              path: '/forgot-password', 
              query: { email: this.email, step: 2 } 
            });
            
            alert(res.data.success || "OTP sent to your email!");
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Failed to send OTP. Please try again.";
          alert(errorMessage);
        } finally {
          this.loading = false;
        }
      },
      
      async resetPassword() {
        if (this.newPassword !== this.confirmPassword) {
          alert("Passwords do not match");
          return;
        }
        
        if (!this.otp) {
          alert("Please enter the OTP");
          return;
        }
        
        this.loading = true;
        
        try {
          const res = await axios.post("/api/user/recoverPassword/resetPass", {
            email: this.email, 
            otp: this.otp,
            newPassword: this.newPassword
          });
          
          if (res.data.status === 'success') {
            alert(res.data.success || "Password reset successful!");
            localStorage.removeItem('resetEmail');
            
            this.$router.push("/login");
          }
        } catch (error) {
          const errorMessage = error.response?.data?.error || "Failed to reset password. Please try again.";
          alert(errorMessage);
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style>
  .card {
    border-radius: 10px;
  }
  </style>