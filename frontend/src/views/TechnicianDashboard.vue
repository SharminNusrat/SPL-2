<template>
  <div class="dashboard-main">
    <div class="dashboard-header">
      <h1>Technician Dashboard</h1>
      <p class="subtitle">View assign tickets,Category report and self-performance report and update availability status.</p>
    </div>
    
    <div class="dashboard-content">
      <div class="welcome-card">
        <div class="card-content">
          <h2>Welcome to LabHelp Technician Dashboard</h2>
          <p class="welcome-text">Your dedicated dashboard for handling support tickets efficiently</p>
          
          <div class="features-grid">
            <div class="feature-card">
              <div class="icon-container">
                <i class="icon ticket-icon"></i>
              </div>
              <h3>Ticket Management</h3>
              <p>View and update status for assigned tickets</p>
            </div>
            
            <div class="feature-card">
              <div class="icon-container">
                <i class="icon technician-icon"></i>
              </div>
              <h3>Update Availability</h3>
              <p>Update availability status</p>
            </div>
            <div class="feature-card">
              <div class="icon-container">
                <i class="icon report-icon"></i>
              </div>
              <h3>Comprehensive Reporting</h3>
              <p>View reports on ticket categories and technician self performance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-main {
  padding: 0;
  width: 100%;
  min-height: calc(100vh - 120px);
  background: linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url('/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.dashboard-header {
  padding: 20px 30px;
}

h1 {
  font-size: 32px;
  margin-bottom: 5px;
  color: #333;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-top: 0;
}

.dashboard-content {
  padding: 10px 30px 30px;
}

.welcome-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.card-content {
  padding: 25px;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.welcome-text {
  font-size: 16px;
  color: #555;
  margin-bottom: 25px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.icon-container {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #e9eeff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.icon {
  width: 24px;
  height: 24px;
  background-color: #4a6cfa;
  border-radius: 4px;
}

.ticket-icon {
  background-color: #4a6cfa;
}

.technician-icon {
  background-color: #6c5ce7;
}

.category-icon {
  background-color: #e67e22;
}

.report-icon {
  background-color: #27ae60;
}

h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.5;
  margin: 0;
}
</style>