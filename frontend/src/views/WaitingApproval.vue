<template>
    <div class="waiting-approval">
      <h1>Your Account is Pending Approval</h1>
      <p>Your email has been successfully verified! Your account is now waiting for admin approval. You will receive an email notification once your account is approved, after which you can access the dashboard.</p>
      <p>Thank you for your patience.</p>
      <!-- Logout button if needed -->
      <!-- <button @click="logout">Logout</button> -->
    </div>
  </template>
  
  <!-- <script>
  export default {
    name: 'WaitingApproval',
    methods: {
      logout() {
        // Logout logic
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userRole");
        localStorage.removeItem("isVerified");
        localStorage.removeItem("isActive");
        this.$router.push("/login");
      }
    }
  }
  </script> -->