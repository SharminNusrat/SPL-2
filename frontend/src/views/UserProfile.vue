<!-- <template>
    <div class="container mt-5">
      <h2 class="text-center">User Profile</h2>
      
      <div v-if="loading" class="text-center">Loading...</div>
      <div v-else>
        <div v-if="!editing">
          <p><strong>First Name:</strong> {{ profile.fname }}</p>
          <p><strong>Last Name:</strong> {{ profile.lname }}</p>
          <p><strong>Phone Number:</strong> {{ profile.phn_no }}</p>
          <p><strong>Email:</strong> {{ profile.email }}</p>
          <div v-for="(value, key) in profile.roleData" :key="key">
            <p><strong>{{ key }}:</strong> {{ value }}</p>
          </div>
          <button @click="editing = true" class="btn btn-primary">Edit Profile</button>
        </div>
        
        <form v-else @submit.prevent="updateProfile">
          <div class="mb-3">
            <label class="form-label">First Name</label>
            <input type="text" v-model="profile.fname" class="form-control" />
          </div>
          
          <div class="mb-3">
            <label class="form-label">Last Name</label>
            <input type="text" v-model="profile.lname" class="form-control" />
          </div>
          
          <div class="mb-3">
            <label class="form-label">Phone Number</label>
            <input type="text" v-model="profile.phn_no" class="form-control" />
          </div>
          
          <div class="mb-3">
            <label class="form-label">Email</label>
            <input type="email" v-model="profile.email" class="form-control" disabled />
          </div>
          
          <div v-for="(value, key) in profile.roleData" :key="key" class="mb-3">
            <label class="form-label">{{ key }}</label>
            <input type="text" v-model="profile.roleData[key]" class="form-control" />
          </div>
          
          <button type="submit" class="btn btn-primary">Update Profile</button>
          <button type="button" @click="editing = false" class="btn btn-secondary ms-2">Cancel</button>
        </form>
      </div>
    </div>
  </template> -->
  


  <template>
    <div class="profile-container">
      <div class="profile-header">
        <h2>Profile</h2>
      </div>
  
      <div v-if="loading" class="text-center">Loading...</div>
  
      <div v-else class="profile-content">
        <div v-if="!editing" class="profile-view">
          <div class="profile-avatar">
            <div class="avatar-circle">
              <!-- <i class="avatar-icon">👤</i> -->
              <i class="fa-solid fa-user avatar-icon"></i>
            </div>
            <h3 class="profile-name"><strong>{{ profile.fname }} {{ profile.lname }}</strong></h3>
          </div>
  
          <div class="profile-info">
            <div class="info-item">
              <label><strong>Email:</strong></label>
              <p>{{ profile.email }}</p>
            </div>
            
            <div class="info-item">
              <label><strong>Phone Number:</strong></label>
              <p>{{ profile.phn_no }}</p>
            </div>
            
            <div 
              v-for="(value, key) in profile.roleData" 
              :key="key" 
              class="info-item">
              <label><strong>{{ key }}:</strong></label>
              <p>{{ value }}</p>
            </div>
          </div>
  
          <button @click="editing = true" class="edit-btn">Edit Profile</button>
        </div>
  
        <form v-else @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" v-model="profile.fname" required />
          </div>
          
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" v-model="profile.lname" required />
          </div>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="profile.email" disabled />
          </div>
          
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" v-model="profile.phn_no" required />
          </div>
          
          <div 
            v-for="(value, key) in profile.roleData" 
            :key="key" 
            class="form-group">
            <label>{{ key }}</label>
            <input type="text" v-model="profile.roleData[key]" />
          </div>
          
          <div class="button-group">
            <button type="submit" class="update-btn">Update Profile</button>
            <button type="button" @click="editing = false" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </template>


  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        profile: {
          fname: "",
          lname: "",
          phn_no: "",
          email: "",
          roleData: {},
        },
        loading: true,
        editing: false,
      };
    },
    methods: {
      async fetchProfile() {
        try {
          const token = localStorage.getItem("accessToken");
          const res = await axios.get("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.status === "success") {
            this.profile = res.data.profile;
          } else {
            alert("Failed to fetch profile data");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          alert("Could not fetch profile");
        } finally {
          this.loading = false;
        }
      },
      async updateProfile() {
        try {
          const token = localStorage.getItem("accessToken");
          await axios.put(
            "/api/user/profile/update",
            { ...this.profile },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("Profile updated successfully!");
          this.editing = false;
        } catch (error) {
          console.error("Error updating profile:", error);
          alert("Failed to update profile");
        }
      },
    },
    mounted() {
      this.fetchProfile();
    },
  };
  </script>
  
  <!-- <style>
  .container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
    border-radius: 10px;
  }
  </style> -->


  <style scoped>
.profile-container {
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px;
  background-color: #435b74;
  color: white;
}

.profile-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.profile-content {
  padding: 0;
}

.profile-view {
  display: flex;
  flex-direction: column;
}

.profile-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  background-color: #f8f9fa;
}

.avatar-circle {
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background-color: #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.avatar-icon {
  font-size: 30px;
  font-style: normal;
}

.profile-name {
  margin: 0;
  font-size: 1.2rem;
  text-align: center;
}

.profile-info {
  padding: 15px;
  background-color: #f8f9fa;
}

.info-item {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
}

.info-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.info-item label {
  font-weight: bold;
  color: #495057;
  display: block;
  margin-bottom: 5px;
  font-size: 1 rem;
}

.info-item p {
  margin: 0;
  color: #212529;
  font-size: 1rem;
}

.edit-btn {
  margin: 15px;
  padding: 8px 20px;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  align-self: center;
}

.edit-btn:hover {
  background-color: #0b5ed7;
}

/* Edit Form Styles */
.profile-form {
  padding: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #495057;
}

.form-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.update-btn {
  padding: 8px 20px;
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
}

.cancel-btn {
  padding: 8px 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
}

.update-btn:hover {
  background-color: #0b5ed7;
}

.cancel-btn:hover {
  background-color: #5a6268;
}
</style>