<template>
    <div class="verify container d-flex justify-content-center align-items-center vh-100">
      <div class="row w-100">
        <div class="col-md-6 offset-md-3">
          <div class="card shadow">
            <div class="card-body">
              <h3 class="text-center mb-4">Email Verification</h3>
              <form @submit.prevent="handleVerification">
                <div class="mb-3">
                  <label for="otp" class="form-label">Verification Code</label>
                  <input
                    v-model="otp"
                    type="text"
                    id="otp"
                    class="form-control"
                    placeholder="Enter verification code"
                    required
                  />
                </div>
                <button type="submit" class="btn btn-primary w-100">Verify Email</button>
              </form>
              <p class="text-center mt-3">
                Didn't receive code? 
                <a href="#" @click.prevent="resendCode" class="text-decoration-none">
                  Resend Code
                </a>
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
        otp: "",
        email: this.$route.query.email || "", 
      };
    },
    methods: {
      async handleVerification() {
        try {
          const res = await axios.post("/api/user/register/verify", {
            email: this.email,
            otp: this.otp
          });
  
          if (res.data.status === "success") {
            localStorage.setItem("isVerified", "true");
            alert("Email verified successfully!");
            this.$router.push("/dashboard");
          } else {
            alert(res.data.error || "Verification failed!");
          }
        } catch (error) {
          console.error(error.response?.data || "Verification failed");
          alert(error.response?.data?.error || "Invalid verification code!");
        }
      },
  
      async resendCode() {
        try {
          const res = await axios.post("/api/user/resendOTP");
          alert("New verification code has been sent to your email!");
        } catch (error) {
          console.error(error.response?.data || "Failed to resend code");
          alert("Failed to resend verification code. Please try again!");
        }
      }
    },
  };
  </script>
  
  <style>
  .verify {
    background-color: #f8f9fa;
  }
  .card {
    border-radius: 10px;
  }
  </style>