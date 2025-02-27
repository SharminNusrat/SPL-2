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
            <br>
            <button @click="deleteAttachment(file.id, file.path)">🗑️ Delete</button>
          </div>
        </div>
  
        <div v-if="comments.length">
          <h4>Comments:</h4>
          <div v-for="comment in comments" :key="comment.id">
            <p><strong>{{ comment.author || "Unknown User" }}:</strong></p> 
            <p>{{ comment.content }}</p> 
            <p><em>{{ formatDate(comment.created_at) }}</em></p> 

            <div v-if="comment.user_id == loggedInUserId">
              <button @click="editComment(comment)">✏️ Edit</button>
              <button @click="deleteComment(comment.id)">🗑️ Delete</button>
            </div>
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
        loggedInUserId: localStorage.getItem('user_id') || null,
        comments: [],
        newComment: "",
        assignedToName: "",
        createdByName: "",
        attachments: []
      };
    },
    methods: {
      formatDate(dateString) {
        if (!dateString) return "No Date"; 
        return new Date(dateString).toLocaleString("en-US", { 
          year: "numeric", 
          month: "long", 
          day: "numeric", 
          hour: "2-digit", 
          minute: "2-digit", 
          second: "2-digit",
          hour12: true 
        });
      },
      async fetchUserNames() {
        try {
          if(this.ticket.user_id) {
            const createdByRes = await fetch(`/api/user/user/${this.ticket.user_id}`);
            const createdByData = await createdByRes.json();
            console.log("Created By API Response:", createdByData);
            this.createdByName = createdByData.fname + " " + createdByData.lname;
          }

          if(this.ticket.assigned_to) {
            const assignedToRes = await fetch(`/api/user/user/${this.ticket.assigned_to}`);
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
      async deleteAttachment(fileId, filePath) {
        if(!confirm("Are you sure you want to delete this attachment?")) return;

        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(`/api/tickets/files/${fileId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          const data = await response.json();
          console.log("File deletion response:", data);

          if(response.ok) {
            this.attachments = this.attachments.filter(file => file.id !== fileId);
          } 
          else {
            alert(data.error);
          }
        }
        catch(error) {
          console.error("Error deleting attachment:", error);
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
          this.comments = data.comments;
          console.log('Fetched comments: ', this.comments);
        } catch (error) {
          console.error("Error fetching comments:", error);
        }
      },
      async submitComment() {
        // const ticketId = this.$route.params.id;
        try {
          const token = localStorage.getItem("accessToken");
          const userId = localStorage.getItem('user_id');
          const commentText = this.newComment.trim();

          if(!commentText) {
            console.error("Cannot submit an empty comment");
          }
          const commentData = {
            content: commentText 
          };

          // console.log('Submitting Comment Data:', commentData);
          // console.log('Fetching API:', `/api/tickets/tickets/${this.ticket.id}/comments`);

          const response = await fetch(`/api/tickets/tickets/${this.ticket.id}/comments`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            // body: JSON.stringify({ text: this.newComment })
            body: JSON.stringify(commentData)
          });
  
          const data = await response.json();
          // console.log('Comment Submission Response:', data);

          if(response.ok) {
            this.comments.push({ id: data.comment_id, content: commentText, user_id: userId });
            this.newComment = "";
            this.fetchComments();
          } 
          else {
            console.error('Failed to submit comment:', data.error);
          }
        } catch (error) {
          console.error("Error submitting comment:", error);
        }
      },
      async editComment(comment) {
        const updatedContent = prompt("Edit your comment:", comment.content);
        if(!updatedContent || updatedContent.trim() === comment.content) return;

        try{
          const token = localStorage.getItem("accessToken");
          const response = await fetch(`/api/tickets/comments/${comment.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ content: updatedContent.trim() })
          });

          const data = await response.json();
          console.log("Edit Comment Response:", data);

          if(response.ok) {
            comment.content = updatedContent;
          }
          else {
            alert(data.error);
          }
        } 
        catch(error) {
          console.error("Error editing comment:", error);
        }
      },
      async deleteComment(commentId) {
        if(!confirm("Are you sure you want to delete this comment?")) return;

        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch(`/api/tickets/comments/${commentId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          const data = await response.json();
          console.log("Delete comment response:", data);

          if(response.ok) {
            this.comments = this.comments.filter(comment => comment.id !== commentId);
          } 
          else {
            alert(data.error);
          }
        }
        catch(error) {
          console.error("Error deleting comment:", error);
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
  /* .delete-btn {
    display: block;
    margin-top: 5px;
  } */
  </style>
  