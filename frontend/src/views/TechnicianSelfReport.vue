<template>
  <div>
    <h2>Technician Self Report</h2>
    <div v-if="loading">Loading report...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <canvas ref="reportChart"></canvas>

    <div v-if="summaryData" class="summary-table">
      <h3>Technician Summary</h3>
      <table>
        <thead>
          <tr>
            <th>Technician Name</th>
            <th>Total Assigned</th>
            <th>Total Resolved</th>
            <th>Resolution Rate</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{{ summaryData.technicianName }}</td>
            <td>{{ summaryData.totalAssigned }}</td>
            <td>{{ summaryData.totalResolved }}</td>
            <td>{{ summaryData.resolutionRate }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";
import axios from "axios";

export default {
  data() {
    return {
      reportData: [],
      summaryData: null,
      loading: true,
      error: null,
      token: localStorage.getItem("accessToken"),
      userId: localStorage.getItem("userId"),
      userRole: localStorage.getItem("userRole"),
      chart: null
    };
  },
  
  mounted() {
    console.log("userId from localStorage:", localStorage.getItem("userId"));
    console.log("userRole from localStorage:", localStorage.getItem("userRole"));
    console.log("token from localStorage:", localStorage.getItem("accessToken"));
  
    if (!this.token || this.userRole !== "technician") {
      console.error("Unauthorized access: Only technicians can view this report.");
      alert("You are not authorized to view this page.");
      this.$router.push("/"); 
      return;
    }
    
    this.fetchReportData();
    this.fetchSummaryData();
  },
  
  methods: {
    async fetchReportData() {
      try {
        console.log("Fetching report data for user ID:", this.userId);
        
        const response = await axios.get(`/api/tickets/technician-self-report/${this.userId}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (response.data.success) {
          this.reportData = response.data.data;
          this.renderChart();
        } else {
          this.error = response.data.message || "Failed to fetch report data.";
        }
      } catch (err) {
        console.error("Error fetching report:", err);
        this.error = err.response?.data?.message || "An error occurred while fetching the report.";
      }
    },
    
    async fetchSummaryData() {
      try {
        console.log("Fetching summary data for user ID:", this.userId);
        
        const response = await axios.get(`/api/tickets/technician-summary/${this.userId}`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        if (response.data.success) {
          this.summaryData = response.data.data;
        } else {
          this.error = response.data.message || "Failed to fetch summary data.";
        }
      } catch (err) {
        console.error("Error fetching summary:", err);
        this.error = err.response?.data?.message || "An error occurred while fetching the summary.";
      } finally {
        this.loading = false;
      }
    },
    
    renderChart() {
      if (!this.$refs.reportChart) {
        console.error("Chart reference not found");
        this.error = "Chart canvas not available.";
        return;
      }
      
      if (!this.reportData || !this.reportData.length) {
        console.error("No data available for chart", this.reportData);
        this.error = "No data available to render the chart.";
        return;
      }

      const ctx = this.$refs.reportChart.getContext("2d");
      
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.reportData.map(item => item.date),
          datasets: [
            {
              label: "Resolved/Closed vs Assigned",
              data: this.reportData.map(item => item.ratio),
              borderColor: "blue",
              backgroundColor: "rgba(0, 0, 255, 0.2)",
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: { title: { display: true, text: "Date" } },
            y: { title: { display: true, text: "Ratio" }, min: 0, max: 1 },
          },
        },
      });
    }
  }
};
</script>

<style scoped>
canvas {
  max-width: 800px;
  margin-top: 20px;
}
.error {
  color: red;
  font-weight: bold;
}
.summary-table {
  margin-top: 30px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
th {
  background-color: #f2f2f2;
}
</style>