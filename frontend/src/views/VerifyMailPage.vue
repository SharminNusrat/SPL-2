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
          localStorage.setItem("accessToken", res.data.token);
          localStorage.setItem("userRole", res.data.role);
          localStorage.setItem("userId", res.data.id);
          localStorage.setItem("is_active", res.data.is_active);
          this.$emit("verify-success", res.data.role);
          alert("Email verified successfully!");
          if (res.data.role === "technician" && res.data.is_active === 0) {
            this.$router.push("/waiting-approval");
          } else {
            this.$router.push("/dashboard");
          }
        } else {
          alert(res.data.error || "Verification failed!");
        }
      } catch (error) {
          console.error(error.response?.data || "Verification failed");
          const errorMessage = error.response?.data?.error || "Invalid verification code!";

          if (error.response && error.response.status === 403) {
            alert(errorMessage);
            return;
          }
          alert(errorMessage);
        }
    },

    async resendCode() {
      try {
          const res = await axios.post("/api/user/resendOTP", {
              email: this.email, 
          });

          alert("New verification code has been sent to your email!");
      } catch (error) {
          console.error(error.response?.data || "Failed to resend code");
          alert("Failed to resend verification code. Please try again!");
      }
    },

  },
};
</script>

<style>

.card {
  border-radius: 10px;
}
</style>