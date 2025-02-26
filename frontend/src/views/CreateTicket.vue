<template>
    <div class="container mt-4">
      <h2>Create a New Ticket</h2>
  
      <!-- Ticket Submission Form -->
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

          <!-- <p>Loaded Categories: {{ categories }}</p> -->

          <!-- <select v-model="ticket.category_id" class="form-select" required>
            <option value="1">Hardware Issue</option>
            <option value="2">Software Issue</option>
            <option value="3">Network Issue</option>
           </select> -->


        </div>
        <div class="mb-3">
          <label class="form-label">Room Number</label>
          <input v-model="ticket.roomNumber" type="text" class="form-control" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Computer ID</label>
          <input v-model="ticket.computer_id" type="text" class="form-control" required />
        </div>
  
        <!-- File Upload -->
        <div class="mb-3">
          <label class="form-label">Attach File (Optional)</label>
          <input type="file" class="form-control" @change="handleFileUpload" />
        </div>
  
        <button type="submit" class="btn btn-success">Submit Ticket</button>
      </form>
  
      <!-- Comment Section (Only Enabled After Ticket Creation) -->
      <div v-if="ticketCreated" class="mt-4">
        <h5>Comments</h5>
        <div v-if="comments.length > 0">
          <div v-for="comment in comments" :key="comment.id" class="border p-2 mb-2">
            <p><strong>{{ comment.author }}:</strong> {{ comment.text }}</p>
            <small>{{ formatDate(comment.created_at) }}</small>
          </div>
        </div>
        <p v-else>No comments yet.</p>
  
        <!-- Add Comment Form -->
        <form @submit.prevent="submitComment" class="mt-3">
          <div class="mb-3">
            <textarea v-model="newComment" class="form-control" placeholder="Add a comment..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit Comment</button>
        </form>
      </div>
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
        comments: [],
        newComment: ""
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
        try {
          const token = localStorage.getItem('accessToken');
          // Submit ticket details first
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
  
            // If file is uploaded, send it separately
            if (this.file) {
              this.uploadFile();
            }
  
            // Fetch comments for the created ticket
            this.fetchComments();
          }
        } catch (error) {
          console.error("Error submitting ticket:", error);
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
      async fetchComments() {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`/api/tickets/tickets/${this.createdTicketId}/comments`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          this.comments = data;
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      },
      async submitComment() {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`/api/tickets/tickets/${this.createdTicketId}/comments`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text: this.newComment })
          });
  
          const data = await response.json();
          if (data.error) {
            alert(data.error);
          } else {
            this.newComment = "";
            this.fetchComments(); 
          }
        } catch (error) {
          console.error("Error submitting comment:", error);
        }
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
  /* select.form-select {
    max-height: 200px; 
    overflow-y: auto;  
  }
  .form-select {
    position: relative;
    z-index: 1000; 
  } */

  </style>
  