<template>
  <div class="container mt-4">
    <h2>All Submitted Tickets</h2>

    <!-- Filters & Sorting -->
    <div class="d-flex justify-content-between mb-3">
      <select v-model="filterStatus" class="form-select w-25" @change="applyFilters">
        <option value="">All Status</option>
        <option value="Open">Open</option>
        <option value="In-Progress">In-Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      <select v-model="sortOrder" class="form-select w-25" @change="applySorting">
        <option value="asc">Created Date: Ascending</option>
        <option value="desc">Created Date: Descending</option>
      </select>
    </div>

    <!-- Ticket Table -->
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Title</th>
          <th>Category</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Created By</th>
          <th>Created Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredTickets.length === 0">
          <td colspan="7" class="text-center">No tickets found</td>
        </tr>
        <tr v-for="ticket in paginatedTickets" :key="ticket.id">
          <td>{{ ticket.id }}</td>
          <td>{{ ticket.title }}</td>
          <td>{{ ticket.category_name }}</td>
          <td>{{ ticket.ticket_status }}</td>
          <td>{{ ticket.assigned_to_name ? ticket.assigned_to_name : 'Unassigned' }}</td>
          <td>{{ ticket.created_by_name }}</td>
          <td>{{ formatDate(ticket.created_at) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div class="d-flex justify-content-center mt-3">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-secondary me-2">Previous</button>
      <span>Page {{ currentPage }} of {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages" class="btn btn-secondary ms-2">Next</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tickets: [],
      assignedToName: "",
      createdByName: "",
      filterStatus: "",  
      sortOrder: "asc",
      currentPage: 1,
      itemsPerPage: 5 
    };
  },
  computed: {
    filteredTickets() {
      let filtered = this.tickets;
      if (this.filterStatus) {
        filtered = filtered.filter(ticket => ticket.ticket_status === this.filterStatus);
      }
      return Array.isArray(filtered) ? filtered : [];
    },
    sortedTickets() {
      return [...this.filteredTickets].sort((a, b) => {
        return this.sortOrder === "asc"
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      });
    },
    totalPages() {
      return Math.ceil(this.sortedTickets.length / this.itemsPerPage);
    },
    paginatedTickets() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.sortedTickets.slice(start, start + this.itemsPerPage);
    }
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
    async fetchTickets() {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/tickets/tickets", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log("Fetched Tickets API Response:", data); 
        this.tickets = Array.isArray(data.ticket) ? data.ticket : [];
        console.log("Updated Tickets in Vue:", this.tickets);
        await this.fetchUserNames();
        await this.fetchCategoryNames();
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    },
    formatDate(dateString) {
      return dateString ? new Date(dateString).toLocaleDateString() : "No Date";
    },
    applyFilters() {
      this.currentPage = 1; // Reset pagination when filtering
    },
    applySorting() {
      this.currentPage = 1; // Reset pagination when sorting
    },
    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },
    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    }
  },
  mounted() {
    this.fetchTickets();
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
}
</style>
