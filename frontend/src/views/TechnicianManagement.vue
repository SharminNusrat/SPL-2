<template>
    <div class="technician-management">
      <div class="header">
        <h1>Technician Management</h1>
        <div class="search-container">
          <input 
            v-model="searchText" 
            type="text" 
            placeholder="Search technicians..." 
            class="search-input"
          >
        </div>
      </div>
  
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading technicians...</p>
      </div>
  
      <div v-else class="table-container">
        <table class="technician-table">
          <thead>
            <tr>
              <th @click="sortBy('name')">
                Name
                <span v-if="sortKey === 'name'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th>Email</th>
              <th>Phone</th>
              <th>Expertise</th>
              <th>Availability</th>
              <th @click="sortBy('status')">
                Status
                <span v-if="sortKey === 'status'" class="sort-indicator">
                  {{ sortOrder === 'asc' ? '▲' : '▼' }}
                </span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tech in filteredTechnicians" :key="tech.id">
              <td>{{ tech.fname }} {{ tech.lname }}</td>
              <td>{{ tech.email }}</td>
              <td>{{ tech.phn_no }}</td>
              <td>
                <span 
                  class="tag"
                  :class="tech.expertise ? 'tag-blue' : 'tag-gray'"
                >
                  {{ tech.expertise || 'Not specified' }}
                </span>
              </td>
              <td>
                <span 
                  class="tag"
                  :class="tech.availability ? 'tag-green' : 'tag-gray'"
                >
                  {{ tech.availability || 'Not specified' }}
                </span>
              </td>
              <td>
                <span 
                  class="tag"
                  :class="tech.is_active ? 'tag-green' : 'tag-red'"
                >
                  {{ tech.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button 
                  :class="tech.is_active ? 'btn-danger' : 'btn-primary'"
                  @click="confirmStatusChange(tech)"
                >
                  {{ tech.is_active ? 'Deactivate' : 'Activate' }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredTechnicians.length === 0">
              <td colspan="7" class="no-data">No technicians found</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div v-if="showModal" class="modal">
        <div class="modal-content">
          <h3>Confirmation</h3>
          <p>Are you sure you want to {{ selectedTech && selectedTech.is_active ? 'deactivate' : 'activate' }} 
             this technician?</p>
          <p>{{ selectedTech && selectedTech.fname }} {{ selectedTech && selectedTech.lname }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showModal = false">Cancel</button>
            <button 
              :class="selectedTech && selectedTech.is_active ? 'btn-danger' : 'btn-primary'"
              @click="changeStatus"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'TechnicianManagement',
    data() {
      return {
        technicians: [],
        loading: true,
        searchText: '',
        showModal: false,
        selectedTech: null,
        sortKey: 'name',
        sortOrder: 'asc'
      }
    },
    computed: {
      filteredTechnicians() {
        let result = this.technicians;
        
        if (this.searchText) {
          const searchLower = this.searchText.toLowerCase();
          result = result.filter(tech => 
            `${tech.fname} ${tech.lname}`.toLowerCase().includes(searchLower) ||
            tech.email.toLowerCase().includes(searchLower) ||
            (tech.expertise && tech.expertise.toLowerCase().includes(searchLower))
          );
        }
        
        result = [...result].sort((a, b) => {
          let compareA, compareB;
          
          if (this.sortKey === 'name') {
            compareA = `${a.fname} ${a.lname}`.toLowerCase();
            compareB = `${b.fname} ${b.lname}`.toLowerCase();
          } else if (this.sortKey === 'status') {
            compareA = a.is_active;
            compareB = b.is_active;
          }
          
          if (compareA < compareB) return this.sortOrder === 'asc' ? -1 : 1;
          if (compareA > compareB) return this.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
        
        return result;
      }
    },
    methods: {
      async fetchTechnicians() {
        try {
          this.loading = true;
          const token = localStorage.getItem('accessToken');
        
          const response = await axios.get('/api/technicians', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.status === 'success') {
            this.technicians = response.data.technicians;
          } else {
            this.showToast('Failed to fetch technicians', 'error');
          }
        } catch (error) {
          this.showToast(`Error: ${error.message}`, 'error');
        } finally {
          this.loading = false;
        }
      },
      
      confirmStatusChange(tech) {
        this.selectedTech = tech;
        this.showModal = true;
      },
      
      async changeStatus() {
        if (!this.selectedTech) return;
        
        const techId = this.selectedTech.id;
        const action = this.selectedTech.is_active ? 'deactivate' : 'activate';
        
        try {
          const token = localStorage.getItem('accessToken');
          
          const response = await axios.put(`/api/technicians/${techId}/${action}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.status === 'success') {
            this.showToast(`Technician ${action}d successfully`, 'success');
            this.fetchTechnicians(); 
          } else {
            this.showToast(`Failed to ${action} technician`, 'error');
          }
        } catch (error) {
          this.showToast(`Error: ${error.message}`, 'error');
        } finally {
          this.showModal = false;
          this.selectedTech = null;
        }
      },
      
      sortBy(key) {
        if (this.sortKey === key) {
          this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortKey = key;
          this.sortOrder = 'asc';
        }
      },
      
      showToast(message, type = 'info') {
        alert(message);
      }
    },
    created() {
      this.fetchTechnicians();
    }
  }
  </script>
  
  <style scoped>
  .technician-management {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .search-input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 300px;
    font-size: 14px;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .technician-table {
    width: 100%;
    border-collapse: collapse;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .technician-table th, 
  .technician-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .technician-table th {
    background-color: #f8f9fa;
    cursor: pointer;
    user-select: none;
  }
  
  .technician-table tr:hover {
    background-color: #f5f5f5;
  }
  
  .sort-indicator {
    margin-left: 5px;
  }
  
  .tag {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
  }
  
  .tag-blue {
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    color: #1890ff;
  }
  
  .tag-green {
    background-color: #f6ffed;
    border: 1px solid #b7eb8f;
    color: #52c41a;
  }
  
  .tag-red {
    background-color: #fff2f0;
    border: 1px solid #ffccc7;
    color: #ff4d4f;
  }
  
  .tag-gray {
    background-color: #f5f5f5;
    border: 1px solid #d9d9d9;
    color: #666;
  }
  
  button {
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    border: none;
  }
  
  .btn-primary {
    background-color: #1890ff;
    color: white;
  }
  
  .btn-danger {
    background-color: #ff4d4f;
    color: white;
  }
  
  .btn-secondary {
    background-color: #f5f5f5;
    border: 1px solid #d9d9d9;
    color: rgba(0, 0, 0, 0.65);
  }
  
  .no-data {
    text-align: center;
    color: #999;
    padding: 20px 0;
  }
  
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 50px 0;
  }
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border-left-color: #1890ff;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Modal styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }
  </style>