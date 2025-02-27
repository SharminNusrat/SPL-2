
<template>
  <div>
    <h2>Redirecting...</h2>
  </div>
</template>

<script>
export default {
  mounted() {
    const role = localStorage.getItem("userRole");
    if (role === "student" || role === "teacher") {
      this.$router.push("/student-teacher");
    } else if (role === "technician") {
      this.$router.push("/technician");
    } else if (role === "admin") {
      this.$router.push("/admin");
    } else {
      this.$router.push("/login");
    }
  },
};
</script>
