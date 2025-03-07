<template>
  <div class="profile-container">
    <div class="card shadow">
      <div class="card-header bg-primary text-white ">
        <h2 class="mb-0 text-center">User Profile</h2>
      </div>
      
      <div class="card-body">
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">Loading your profile...</p>
        </div>
        
        <div v-else>
          <!-- View Mode -->
          <div v-if="!editing" class="profile-view">
            <div class="row mb-4">
              <div class="col-md-3 text-center">
                <div class="avatar-placeholder bg-light rounded-circle mb-2">
                  <span>{{ getInitials() }}</span>
                </div>
              </div>
              <div class="col-md-9">
                <h4 class="mb-3">{{ profile.fname }} {{ profile.lname }}</h4>
                <div class="profile-info">
                  <div class="info-item">
                    <i class="bi bi-telephone"></i>
                    <span>{{ profile.phn_no }}</span>
                  </div>
                  <div class="info-item">
                    <i class="bi bi-envelope"></i>
                    <span>{{ profile.email }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <hr>
            
            <div class="additional-info">
              <h5 class="mb-3">Additional Information</h5>
              <div class="row" v-if="Object.keys(profile.roleData).length > 0">
                <div v-for="(value, key) in profile.roleData" :key="key" class="col-md-6 mb-2">
                  <div class="info-card">
                    <div class="info-label">{{ formatLabel(key) }}</div>
                    <div class="info-value">{{ value }}</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-muted">No additional information available</div>
            </div>
            
            <div class="text-center mt-4">
              <button @click="editing = true" class="btn btn-primary px-4">
                <i class="bi bi-pencil me-2"></i>Edit Profile
              </button>
            </div>
          </div>
          
          <!-- Edit Mode -->
          <form v-else @submit.prevent="updateProfile" class="profile-form">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">First Name</label>
                <input type="text" v-model="profile.fname" class="form-control" required />
              </div>
              
              <div class="col-md-6">
                <label class="form-label">Last Name</label>
                <input type="text" v-model="profile.lname" class="form-control" required />
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Phone Number</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                <input type="text" v-model="profile.phn_no" class="form-control" required />
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Email</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                <input type="email" v-model="profile.email" class="form-control" disabled />
              </div>
              <small class="text-muted">Email cannot be changed</small>
            </div>
            
            <h5 class="mb-3 mt-4">Additional Information</h5>
            <div v-for="(value, key) in profile.roleData" :key="key" class="mb-3">
              <label class="form-label">{{ formatLabel(key) }}</label>
              <input type="text" v-model="profile.roleData[key]" class="form-control" />
            </div>
            
            <div class="d-flex justify-content-center gap-3 mt-4">
              <button type="submit" class="btn btn-primary px-4">
                <i class="bi bi-check2 me-1"></i> Save Changes
              </button>
              <button type="button" @click="editing = false" class="btn btn-outline-secondary px-4">
                Cancel
              </button>
            </div>
          </form>
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
    getInitials() {
      if (this.profile.fname && this.profile.lname) {
        return (this.profile.fname[0] + this.profile.lname[0]).toUpperCase();
      }
      return "U";
    },
    formatLabel(key) {
      return key
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }
  },
  mounted() {
    this.fetchProfile();
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 30px auto;
  padding: 0 15px;
}
.bg-primary {
    background-color: rgb(76 80 86) !important;
}
.btn-primary {
    --bs-btn-color: #fff;
    --bs-btn-bg: #545960;
    --bs-btn-border-color: #131414;
    --bs-btn-hover-color: #fff;
    --bs-btn-hover-bg: #8a8e93;
    --bs-btn-hover-border-color: #080909;
    --bs-btn-focus-shadow-rgb: 49,132,253;
    --bs-btn-active-color: #fff;
    --bs-btn-active-bg: #7a8fae;
    --bs-btn-active-border-color: #1d1d1e;
    --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    --bs-btn-disabled-color: #fff;
    --bs-btn-disabled-bg: #899bb6;
    --bs-btn-disabled-border-color: #0b0b0b;
}
.card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.card-header {
  padding: 15px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 24px;
  font-weight: bold;
  color: #6c757d;
}

.profile-info {
  margin-top: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-item i {
  width: 25px;
  color: #6c757d;
}

.info-card {
  background-color: #f8f9fa;
  padding: 10px 15px;
  border-radius: 8px;
  height: 100%;
}

.info-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 5px;
}

.info-value {
  font-weight: 500;
}

.profile-form label {
  font-weight: 500;
}

.profile-view {
  padding: 10px;
}

@media (max-width: 767px) {
  .avatar-placeholder {
    margin-bottom: 20px;
  }
  
  .profile-info {
    text-align: center;
  }
  
}
</style>