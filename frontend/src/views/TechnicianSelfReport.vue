<template>
  <div class="report-container">
    <h2>Technician Performance Timeline</h2>
    <div v-if="loading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="time-range-controls">
        <button 
          v-for="range in timeRanges" 
          :key="range.value" 
          @click="setTimeRange(range.value)"
          :class="['range-btn', { active: currentRange === range.value }]"
        >
          {{ range.label }}
        </button>
      </div>

      <div class="chart-container">
        <line-chart 
          v-if="chartData.labels.length > 0"
          :chart-data="chartData"
          :options="chartOptions"
          :key="chartKey"
        ></line-chart>
        <p v-else>No data available for the selected range.</p>
      </div>


      <div class="stats-summary">
        <div class="stat-card">
          <h3>Total Assigned</h3>
          <div class="stat-value">{{ totalAssigned }}</div>
        </div>
        <div class="stat-card">
          <h3>Total Resolved</h3>
          <div class="stat-value">{{ totalResolved }}</div>
        </div>
        <div class="stat-card">
          <h3>Average Resolution Rate</h3>
          <div class="stat-value">{{ averageResolutionRate }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler);

export default {
  name: 'TechnicianSelfReport',
  components: {
    LineChart: Line
  },
  data() {
  return {
    technicianData: [],
    loading: true,
    error: null,
    token: localStorage.getItem("accessToken"),
    userRole: localStorage.getItem("userRole"),
    userId: localStorage.getItem("userId"),
    currentRange: '30d',
    chartKey: 0,
    timeRanges: [
      { label: '30 Days', value: '30d' },
      { label: '3 Months', value: '3m' },
      { label: '6 Months', value: '6m' },
      { label: '1 Year', value: '1y' }
    ],
    chartOptions: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxTicksLimit: 10
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  };
},

  computed: {
    totalAssigned() {
      return this.technicianData.reduce((sum, day) => sum + (day.assigned || 0), 0);
    },
    totalResolved() {
      return this.technicianData.reduce((sum, day) => sum + (day.resolved || 0), 0);
    },
    averageResolutionRate() {
      return this.totalAssigned === 0 ? 0 : ((this.totalResolved / this.totalAssigned) * 100).toFixed(2);
    },
    chartData() {
      if (!this.technicianData || this.technicianData.length === 0) {
    return { labels: [], datasets: [{ label: "No Data", data: [] }] };
  }
  const formattedData = this.technicianData.map(day => {
    let formattedDate = "Invalid Date";
    if (day.ticket_date) {
      try {
        formattedDate = new Date(day.ticket_date).toISOString().split("T")[0];
      } catch (error) {
        console.error("Date parsing error:", error);
      }
    }
    return { ...day, date: formattedDate };
  });

  return {
    labels: formattedData.map(day => day.date),
    datasets: [
      {
        label: "Tickets Assigned",
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        data: formattedData.map(day => day.assigned || 0),
      },
      {
        label: "Tickets Resolved",
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.2,
        data: formattedData.map(day => day.resolved || 0),
      },
    ],
  };
}
  },
  methods: {
    async fetchData(range = "30d") {
  try {
    this.loading = true;
    const response = await fetch(`/api/tickets/technician-self-report/${this.userId}?range=${range}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch technician performance data");

    const data = await response.json();
    this.technicianData = Array.isArray(data.report) ? data.report.map(item => ({
      ticket_date: item.ticket_date || null,
      assigned: item.assigned || 0,
      resolved: item.resolved || 0
    })) : [];

    this.error = null;
  } catch (err) {
    console.error("Fetch Error:", err);
    this.error = err.message;
    this.technicianData = []; // Ensure it's an empty array, not undefined
  } finally {
    this.loading = false;
    this.chartKey++; // Force re-render
  }
},

    setTimeRange(range) {
      this.currentRange = range;
      this.fetchData(range);
    }
  },
  mounted() {
    if (this.userRole === 'admin' || this.userId) {
      this.fetchData();
    } else {
      this.error = "You do not have permission to view this report";
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

.time-range-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.range-btn {
  padding: 8px 16px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.range-btn:hover {
  background-color: #e1e1e1;
}

.range-btn.active {
  background-color: #36A2EB;
  color: white;
  border-color: #36A2EB;
}

.chart-container {
  height: 400px;
  min-height: 400px;
  width: 100%;
  margin-top: 20px;
}

.stats-summary {
  display: flex;
  justify-content: space-around;
  margin-top: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.stat-card {
  flex: 1;
  min-width: 150px;
  background-color: white;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}
</style>
