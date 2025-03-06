<template>
    <div class="availability-container">
      <h3>Your Availability</h3>
      <div class="toggle-container">
        <button 
          @click="toggleAvailability" 
          :class="[isAvailable ? 'btn-available' : 'btn-unavailable', isLoading ? 'loading' : '']"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Updating...' : (isAvailable ? 'Available' : 'Unavailable') }}
        </button>
      </div>
      <p class="status-message">
        {{ isAvailable 
          ? 'You are currently available to receive new tickets.' 
          : 'You are currently unavailable. No new tickets will be assigned to you.'
        }}
      </p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'AvailabilityToggle',
    data() {
      return {
        isAvailable: true,
        isLoading: false,
        token: localStorage.getItem("accessToken"),
        userId: localStorage.getItem("userId"),
        userRole: localStorage.getItem("userRole"),
      };
    },
    mounted() {
      // Fetch current availability status when component mounts
      this.fetchAvailabilityStatus();
    },
    methods: {
      async fetchAvailabilityStatus() {
        try {
          const response = await axios.get('/api/user/availability', {
            headers: {
              Authorization: `Bearer ${this.token}`
            }
          });
          this.isAvailable = response.data.availability === 'available';
        } catch (error) {
          console.error('Error fetching availability status:', error);
          // Default to available if error occurs
          this.isAvailable = true;
        }
      },
      async toggleAvailability() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const newStatus = this.isAvailable ? 'unavailable' : 'available';
        
        try {
          const response = await axios.post('/api/user/availability', {
            availability: newStatus
          }, {
            headers: {
              Authorization: `Bearer ${this.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.status === 200) {
            this.isAvailable = !this.isAvailable;
            this.$notify({
              type: 'success',
              title: 'Status Updated',
              text: `Your availability status is now ${newStatus}`
            });
          }
        } catch (error) {
          console.error('Error updating availability:', error);
          this.$notify({
            type: 'error',
            title: 'Update Failed',
            text: error.response?.data?.error || 'Failed to update availability status'
          });
        } finally {
          this.isLoading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .availability-container {
    padding: 1rem;
    border-radius: 8px;
    background-color: #f8f9fa;
    margin-bottom: 1rem;
  }
  
  .toggle-container {
    margin: 1rem 0;
  }
  
  button {
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
  }
  
  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .btn-available {
    background-color: #28a745;
    color: white;
  }
  
  .btn-unavailable {
    background-color: #dc3545;
    color: white;
  }
  
  .loading {
    background-color: #6c757d !important;
    position: relative;
  }
  
  .status-message {
    font-size: 0.9rem;
    color: #6c757d;
  }
  </style>