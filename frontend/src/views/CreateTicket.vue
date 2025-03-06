<template>
    <div class="container mt-4">
      <h2>Create a New Ticket</h2>
  
      <form @submit.prevent="submitTicket">
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input v-model="ticket.title" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea v-model="ticket.description" class="form-control" required></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Category</label>
          <select v-model="ticket.category_id" class="form-select" required>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>

        </div>
        <div class="mb-3">
          <label class="form-label">Room Number</label>
          <input v-model="ticket.roomNumber" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Computer ID</label>
          <input v-model="ticket.computer_id" type="text" class="form-control" required />
        </div>
  
        <div class="mb-3">
          <label class="form-label">Attach File (Optional)</label>
          <input type="file" class="form-control" @change="handleFileUpload" />
        </div>
  
        <button type="submit" class="btn btn-success" :disabled="isSubmitting">{{ isSubmitting ? "Submitting..." : "Submit Ticket" }}</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        ticket: {
          title: "",
          description: "",
          category_id: "",
          roomNumber: "",
          computer_id: ""
        },
        categories: [],
        file: null,
        ticketCreated: false,
        createdTicketId: null,
        isSubmitting: false,
      };
    },
    methods: {
      async fetchCategories() {
        try {
          const token = localStorage.getItem('accessToken');

          const response = await fetch("/api/tickets/categories", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
        //   console.log("Categories API Response:", data); // for debugging
          this.categories = data.categorie;
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      },
      handleFileUpload(event) {
        this.file = event.target.files[0];
      },
      async submitTicket() {
        if(this.isSubmitting) return; 

        this.isSubmitting = true;

        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch("/api/tickets/ticket", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(this.ticket)
          });
          const data = await response.json();
          console.log("Ticket Creation Response:", data);
  
          if (data.error) {
            alert(data.error);
          } else {
            this.ticketCreated = true;
            this.createdTicketId = data.ticket_id;
            alert("Ticket created successfully!");
  
            if (this.file) {
              this.uploadFile();
            }
            this.resetForm();
          }
        } catch (error) {
          console.error("Error submitting ticket:", error);
        } finally {
          this.isSubmitting = false;
        }
      },
      async uploadFile() {
        const formData = new FormData();
        formData.append("file", this.file);
        formData.append("ticket_id", this.createdTicketId);
  
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch("/api/tickets/upload", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          const data = await response.json();
          if (data.error) {
            alert("File upload failed.");
          } else {
            alert("File uploaded successfully!");
          }
        } catch (error) {
          console.error("Error uploading file:", error);
        }
      },
      resetForm() {
        this.ticket = {
          title: "",
          description: "",
          category_id: "",
          roomNumber: "",
          computer_id: ""
        };
        this.file = null;
        this.ticketCreated = false;
        this.createdTicketId = null;
      },
      formatDate(dateString) {
        return new Date(dateString).toLocaleString();
      }
    },
    mounted() {
      this.fetchCategories();
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 700px;
  }
  </style>
  