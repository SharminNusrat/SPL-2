<template>
  <div class="registration-page">
    <h2>Registration</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="fname">First Name</label>
        <input
          type="text"
          id="name"
          v-model="formData.fname"
          placeholder="Enter your first name"
          required
        />
      </div>
      <div class="form-group">
        <label for="lname">Last Name</label>
        <input
          type="text"
          id="name"
          v-model="formData.lname"
          placeholder="Enter your last name"
          required
        />
      </div>
      <div class="form-group">
        <label for="phn_no">Phone Number</label>
        <input
          type="text"
          id="name"
          v-model="formData.phn_no"
          placeholder="Enter your phone number"
          required
        />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          placeholder="Enter your email"
          required
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          placeholder="Enter your password"
          required
        />
      </div>

      <div class="form-group">
        <label for="role">Role</label>
        <select id="role" v-model="formData.role" @change="handleRoleChange" required>
          <option value="">Select your role</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="technician">Technician</option>
        </select>
      </div>

      <!-- Conditional Fields for Student -->
      <div v-if="formData.role === 'student'">
        <div class="form-group">
          <label for="roll">Roll</label>
          <input
            type="text"
            id="roll"
            v-model="formData.roleData.roll"
            placeholder="Enter your roll number"
            required
          />
        </div>

        <div class="form-group">
          <label for="registration">Registration Number</label>
          <input
            type="text"
            id="registration"
            v-model="formData.roleData.registration"
            placeholder="Enter your registration number"
            required
          />
        </div>

        <div class="form-group">
          <label for="batch">Batch</label>
          <input
            type="text"
            id="batch"
            v-model="formData.roleData.batch"
            placeholder="Enter your batch"
            required
          />
        </div>
      </div>

      <!-- Conditional Fields for Teacher -->
      <div v-if="formData.role === 'teacher'">
        <div class="form-group">
          <label for="designation">Designation</label>
          <input
            type="text"
            id="designation"
            v-model="formData.roleData.designation"
            placeholder="Enter your designation"
            required
          />
        </div>
      </div>

      <!-- Conditional Fields for Technician -->
      <div v-if="formData.role === 'technician'">
        <div class="form-group">
          <label for="expertise">Expertise</label>
          <select id="expertise" v-model="formData.roleData.expertise" required>
            <option value="">Select your expertise</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="networking">Networking</option>
          </select>
        </div>
      </div>

      <button type="submit">Register</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        name: "",
        email: "",
        password: "",
        role: "",
        roleData: {},
      },
    };
  },
  methods: {
    handleRoleChange() {
      // Reset role-specific data when role changes
      this.formData.roleData = {};
    },
    async handleSubmit() {
      try {
        const response = await fetch("/api/user/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.formData),
        });

        const result = await response.json();

        if (result.status === "success") {
          alert("Registration successful! Please check your email to verify.");
        } else {
          alert(result.error || "An error occurred during registration.");
        }
      } catch (error) {
        console.error("Error during registration:", error);
        alert("Failed to register. Please try again later.");
      }
    },
  },
};
</script>

<style scoped>
.registration-page {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {

  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input,
select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
</style>
