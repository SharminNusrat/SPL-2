<template>
  <div class="report-container">
    <h2>Technician Performance Report</h2>
    <div v-if="loading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="chart-container">
        <Chart type="bar" :data="chartData" :options="chartOptions" />
      </div>
      <div class="table-container mt-4">
        <table class="performance-table">
          <thead>
            <tr>
              <th>Technician Name</th>
              <th>Total Assigned</th>
              <th>Total Resolved</th>
              <th>Resolution Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tech in technicianData" :key="tech.technician_id">
              <td>{{ tech.technician_name }}</td>
              <td>{{ tech.total_assigned }}</td>
              <td>{{ tech.total_resolved }}</td>
              <td>{{ calculateResolutionRate(tech) }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
  name: 'TechnicianPerformanceReport',
  components: {
    Chart
  },
  data() {
    return {
      technicianData: [],
      loading: true,
      error: null,
      token: localStorage.getItem("accessToken"),
      userRole: localStorage.getItem("userRole") 
    };
  },
  mounted() {
    console.log("Current role:", this.userRole);  
    if (this.userRole === "admin") {
      this.fetchData();
    } else {
      this.error = "Only administrators can view this report";
    }
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        const response = await fetch('/api/tickets/report/technician-performance', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch technician performance data');
        }

        const data = await response.json();
        this.technicianData = data.report;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    calculateResolutionRate(tech) {
      if (tech.total_assigned === 0) return '0.00';
      return ((tech.total_resolved / tech.total_assigned) * 100).toFixed(2);
    }
  },
  computed: {
    chartData() {
      return {
        labels: this.technicianData.map(tech => tech.technician_name),
        datasets: [
          {
            label: 'Total Assigned',
            backgroundColor: '#36A2EB',
            data: this.technicianData.map(tech => tech.total_assigned)
          },
          {
            label: 'Total Resolved',
            backgroundColor: '#4CAF50',
            data: this.technicianData.map(tech => tech.total_resolved)
          }
        ]
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          title: { display: true, text: 'Technician Performance' }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'Number of Tickets' } },
          x: { title: { display: true, text: 'Technicians' } }
        }
      };
    }
  }
};
</script>


<style scoped>
.report-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container {
  height: 400px;
  margin-top: 20px;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-weight: bold;
}

.error {
  color: #d32f2f;
}

.performance-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.performance-table th, .performance-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.performance-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.performance-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.performance-table tr:hover {
  background-color: #f1f1f1;
}
</style>
