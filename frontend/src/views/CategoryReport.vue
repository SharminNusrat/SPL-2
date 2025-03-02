<template>
  <div class="report-container">
    <h2>Ticket Category Distribution</h2>
    <div v-if="loading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="report-content">
      <div class="chart-container">
        <Chart type="pie" :data="chartData" :options="chartOptions" />
      </div>
      <div class="stats-container">
        <div class="total-tickets">
          <h3>Total Tickets: {{ totalTickets }}</h3>
        </div>
        <div class="categories-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="category in categoryData" :key="category.category_id">
                <td>{{ category.category_name }}</td>
                <td>{{ category.count }}</td>
                <td>{{ category.percentage }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Chart } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

export default defineComponent({
  name: 'CategoryReport',
  components: {
    Chart
  },
  setup() {
    const categoryData = ref([]);
    const totalTickets = ref(0);
    const loading = ref(true);
    const error = ref(null);

    const fetchData = async () => {
      try {
        loading.value = true;
        const response = await fetch('/api/tickets/report/category-distribution', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch category data');
        }
        
        const data = await response.json();
        categoryData.value = data.category_report;
        totalTickets.value = data.total_tickets;
        loading.value = false;
      } catch (err) {
        error.value = err.message;
        loading.value = false;
      }
    };

    const generateColors = (count) => {
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 137) % 360;
        colors.push(`hsl(${hue}, 70%, 60%)`);
      }
      return colors;
    };

    const chartData = computed(() => {
      const labels = categoryData.value.map(cat => cat.category_name);
      const data = categoryData.value.map(cat => cat.count);
      const backgroundColor = generateColors(labels.length);
      
      return {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor
        }]
      };
    });

    const chartOptions = computed(() => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 15,
            padding: 15
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const percentage = categoryData.value.find(
                cat => cat.category_name === label
              )?.percentage || '0';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }));

    onMounted(() => {
      fetchData();
    });

    return {
      categoryData,
      totalTickets,
      loading,
      error,
      chartData,
      chartOptions
    };
  }
});
</script>

<style scoped>
.report-container {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container {
  height: 400px;
  margin-top: 20px;
}

.stats-container {
  margin-top: 20px;
}

.total-tickets {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: bold;
}

.categories-table table {
  width: 100%;
  border-collapse: collapse;
}

.categories-table th, .categories-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.categories-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.categories-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.loading, .error {
  text-align: center;
  padding: 20px;
  font-weight: bold;
}

.error {
  color: #d32f2f;
}

@media (min-width: 768px) {
  .report-content {
    flex-direction: row;
  }
  
  .chart-container {
    flex: 1;
  }
  
  .stats-container {
    flex: 1;
    margin-top: 0;
  }
}
</style>
