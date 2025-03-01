<template>
    <div class="container mt-4">
      <h2>My Tickets</h2>
  
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Serial</th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th v-if="userRole.toLowerCase() !== 'technician'">Assigned To</th>
            <th v-else>Created By</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tickets.length === 0">
            <td colspan="7" class="text-center">No tickets found</td>
          </tr>
          <tr v-for="(ticket, index) in tickets" :key="ticket.id">
            <td>{{ index + 1 }}</td>
            <td>{{ ticket.title }}</td>
            <td>{{ ticket.category_name || 'Unknown' }}</td>
            <td>{{ ticket.ticket_status }}</td>
            <td v-if="userRole.toLowerCase() !== 'technician'">{{ ticket.assigned_to_name || 'Unassigned' }}</td>
            <td v-else>{{ ticket.created_by_name }}</td>
            <td>{{ formatDate(ticket.created_at) }}</td>
            <td>
              <button @click="viewTicketDetails(ticket.id)" class="btn btn-primary">View Details</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        tickets: [],
        userRole: ""
      };
    },
    methods: {
      async fetchUserNames() {
        try {
          const userIds = new Set();
          const assignedIds = new Set();

          // Collect all unique user IDs from tickets
          this.tickets.forEach(ticket => {
            if (ticket.user_id) userIds.add(ticket.user_id);
            if (ticket.assigned_to) assignedIds.add(ticket.assigned_to);
          });

          const userPromises = [...userIds].map(async id => {
            const res = await fetch(`/api/user/user/${id}`);
            return { id, data: await res.json() };
          });

          const assignedPromises = [...assignedIds].map(async id => {
            const res = await fetch(`/api/user/user/${id}`);
            return { id, data: await res.json() };
          });

          const userResults = await Promise.all(userPromises);
          const assignedResults = await Promise.all(assignedPromises);

          // Create mapping of user IDs to names
          const userMap = {};
          userResults.forEach(({ id, data }) => {
            userMap[id] = data.fname + " " + data.lname;
          });

          const assignedMap = {};
          assignedResults.forEach(({ id, data }) => {
            assignedMap[id] = data.fname + " " + data.lname;
          });

          // Update tickets with names
          this.tickets = this.tickets.map(ticket => ({
            ...ticket,
            created_by_name: userMap[ticket.user_id] || "Unknown",
            assigned_to_name: assignedMap[ticket.assigned_to] || "Unassigned"
          }));

          console.log("Updated Tickets with Names:", this.tickets);
        } catch (error) {
          console.error("Error fetching user names:", error);
        }
      },
      async fetchCategoryNames() {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await fetch("/api/tickets/categories", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          const data = await response.json();
          console.log("Fetched Categories:", data);

          const categoryMap = {};
          data.categorie.forEach(category => {
            categoryMap[category.id] = category.name;
          });

          this.tickets = this.tickets.map(ticket => ({
            ...ticket,
            category_name: categoryMap[ticket.category_id] || "Unknown"
          }));

          console.log("Updated Tickets with Categories:", this.tickets);
        } 
        catch(error) {
          console.error("Error fetching categories:", error);
        }
      },
      async fetchUserTickets() {
        try {
          const token = localStorage.getItem("accessToken");
          this.userRole = localStorage.getItem("userRole");

          //Fetch tickets
          const response = await fetch("/api/tickets/userTickets", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
          });
          const data = await response.json();
          console.log("User Tickets API Response:", data);
          this.tickets = Array.isArray(data.tickets) ? data.tickets : [];
          await this.fetchUserNames();
          await this.fetchCategoryNames();
        } catch (error) {
          console.error("Error fetching user tickets:", error);
        }
      },
      viewTicketDetails(ticketId) {
        this.$router.push(`/ticket/${ticketId}`);
      },
      formatDate(dateString) {
        return dateString ? new Date(dateString).toLocaleDateString() : "No Date";
      }
    },
    mounted() {
      this.fetchUserTickets();
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 900px;
  }
  </style>  