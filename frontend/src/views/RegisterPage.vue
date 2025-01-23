<template>
  <div class="register container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white text-center">
            <h2>Register</h2>
          </div>
          <div class="card-body">
            <form @submit.prevent="handleRegister">
              <!-- First Name -->
              <div class="mb-3">
                <label for="fname" class="form-label">First Name</label>
                <input
                  id="fname"
                  v-model="fname"
                  type="text"
                  class="form-control"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <!-- Last Name -->
              <div class="mb-3">
                <label for="lname" class="form-label">Last Name</label>
                <input
                  id="lname"
                  v-model="lname"
                  type="text"
                  class="form-control"
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <!-- Phone Number -->
              <div class="mb-3">
                <label for="phn_no" class="form-label">Phone Number</label>
                <input
                  id="phn_no"
                  v-model="phn_no"
                  type="text"
                  class="form-control"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <!-- Email -->
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  class="form-control"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <!-- Password -->
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  class="form-control"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <!-- Role -->
              <div class="mb-3">
                <label for="role" class="form-label">Role</label>
                <input
                  id="role"
                  v-model="role"
                  type="text"
                  class="form-control"
                  placeholder="Enter your role"
                  required
                />
              </div>

              <!-- Submit Button -->
              <div class="d-grid">
                <button type="submit" class="btn btn-primary">Register</button>
              </div>
            </form>
          </div>
          <div class="card-footer text-center">
            <p>Already have an account? <router-link to="/login">Login</router-link></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      fname: '',
      lname: '',
      phn_no: '',
      email: '',
      password: '',
      role: '',
    };
  },
  methods: {
    async handleRegister() {
      try {
        const res = await axios.post('/api/auth/register', {
          fname: this.fname,
          lname: this.lname,
          phn_no: this.phn_no,
          email: this.email,
          password: this.password,
          role: this.role,
        });
        alert(res.data.success);
        this.$router.push('/verify-email'); // Redirect to email verification page
      } catch (error) {
        console.error(error.response.data);
        alert('Registration failed. Please try again.');
      }
    },
  },
};
</script>

<style>
.register {
  margin-top: 50px;
}
</style>
