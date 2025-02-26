<template>
    <div class="container mt-4">
      <h2>Ticket Details</h2>
  
      <div v-if="ticket">
        <div class="card p-3 mb-4">
          <h4>{{ ticket.title }}</h4>
          <p><strong>Status:</strong> {{ ticket.ticket_status }}</p>
          <p><strong>Assigned To:</strong> {{ assignedToName || "Unassigned" }}</p>
          <p><strong>Created By:</strong> {{ createdByName || "Unknown" }}</p>
          <p><strong>Created Date:</strong> {{ formatDate(ticket.created_at) }}</p>
        </div>

        <div v-if="attachments.length">
          <h4>Attachments:</h4>
          <!-- <p>Debug: {{ attachments }}</p>  -->
          <div v-for="file in attachments" :key="file.id">
            <a :href="getFileUrl(file.path)" target="_blank">
              <img :src="getFileUrl(file.path)" alt="Attachment" width="200" />
            </a>
          </div>
        </div>
  
        <!-- Comments Section -->
        <h5 class="mt-4">Comments</h5>
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
  
      <div v-else>
        <p>Loading ticket details...</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        ticket: null,
        comments: [],
        newComment: "",
        assignedToName: "",
        createdByName: "",
        attachments: []
      };
    },
    methods: {
      async fetchUserNames() {
        try {
          if(this.ticket.user_id) {
            const createdByRes = await fetch(`/api/user/${this.ticket.user_id}`);
            const createdByData = await createdByRes.json();
            console.log("Created By API Response:", createdByData);
            this.createdByName = createdByData.fname + " " + createdByData.lname;
          }

          if(this.ticket.assigned_to) {
            const assignedToRes = await fetch(`/api/user/${this.ticket.assigned_to}`);
            const assignedToData = await assignedToRes.json();
            console.log("Assigned To API Response:", assignedToData);
            this.assignedToName = assignedToData.fname + " " + assignedToData.lname;
          }
        } catch(error) {
          console.error("Error fetching user names:", error);
        }
      },
      getFileUrl(filePath) {
        return `http://localhost:3000/${filePath.replace(/\\/g, "/")}`; 
      },
      async fetchAttachments() {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`/api/tickets/files/ticket/${this.ticket.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          // console.log('Raw Attachment API Response:', data);
          this.attachments = data.files || [];
          // console.log("Updated Attachments in Vue:", this.attachments);
        } catch(error) {
          console.log('Error fetching attachments:', error);
          this.attachments = [];
        }
      },
      async fetchTicket() {
        const ticketId = this.$route.params.id;
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`/api/tickets/tickets/${ticketId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log("Ticket Details API Response:", data);
          this.ticket = data.ticket;
          this.fetchUserNames();
          this.fetchAttachments();
        } catch (error) {
          console.error("Error fetching ticket:", error);
        }
      },
      async fetchComments() {
        const ticketId = this.$route.params.id;
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`/api/tickets/tickets/${ticketId}/comments`, {
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
        const ticketId = this.$route.params.id;
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(`/api/tickets/tickets/${ticketId}/comments`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text: this.newComment })
          });
  
          const data = await response.json();
          if (data.error) {
            alert(data.error);
          } else {
            this.newComment = "";
            this.fetchComments(); // Reload comments
          }
        } catch (error) {
          console.error("Error submitting comment:", error);
        }
      },
      formatDate(dateString) {
        return new Date(dateString).toLocaleString();
      },
      isImage(filename) {
        return /\.(jpg|jpeg|png|gif)$/i.test(filename);
      }
    },
    mounted() {
      this.fetchTicket();
      this.fetchComments();
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 700px;
  }
  </style>
  