<template>
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
          <button @click="editing = true" class="btn btn-link">Edit Profile</button>
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
  
  <style>
  .container {
    max-width: 600px;
    margin: auto;
    background: #f8f9fa;
    padding: 20px;
    border-radius: 10px;
  }
  </style>
  