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
          <th>Status</th>
          <th>Assigned To</th>
          <th>Created By</th>
          <th>Created Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="filteredTickets.length === 0">
          <td colspan="6" class="text-center">No tickets found</td>
        </tr>
        <tr v-for="ticket in paginatedTickets" :key="ticket.id">
          <td>{{ ticket.id }}</td>
          <td>{{ ticket.title }}</td>
          <td>{{ ticket.status }}</td>
          <td>{{ ticket.assigned_to ? ticket.assigned_to : 'Unassigned' }}</td>
          <td>{{ ticket.created_by }}</td>
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
      filterStatus: "",  // Default: Show all tickets
      sortOrder: "asc",  // Default: Ascending order
      currentPage: 1,
      itemsPerPage: 5 // Show 5 tickets per page
    };
  },
  computed: {
    filteredTickets() {
      let filtered = this.tickets;
      if (this.filterStatus) {
        filtered = filtered.filter(ticket => ticket.status === this.filterStatus);
      }
      return filtered;
    },
    sortedTickets() {
      return this.filteredTickets.sort((a, b) => {
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
    async fetchTickets() {
      try {
        const response = await fetch("/api/tickets");
        const data = await response.json();
        this.tickets = data;
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
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
