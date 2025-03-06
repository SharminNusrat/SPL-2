<template>
  <div class="home-container">
    <header class="header">
      <h1>LabHelp - IIT Lab Ticketing System</h1>
      <p>A centralized platform for IIT students and faculty to report and resolve lab issues efficiently.</p>
    </header>

    <section class="features">
      <h2>Key Features</h2>
      <div class="feature-list">
        <div class="feature">
          <i class="fas fa-bug"></i>
          <h3>Issue Reporting</h3>
          <p>Students and teachers can easily submit tickets for lab-related technical problems, such as computer malfunctions and network issues.</p>
        </div>
        <div class="feature">
          <i class="fas fa-tasks"></i>
          <h3>Real-Time Ticket Tracking</h3>
          <p>Monitor ticket status updates and receive notifications when issues are resolved.</p>
        </div>
        <div class="feature">
          <i class="fas fa-user-cog"></i>
          <h3>Technician Assignment</h3>
          <p>Technicians get assigned tickets based on their expertise and can update the resolution progress.</p>
        </div>
        <div class="feature">
          <i class="fas fa-chart-line"></i>
          <h3>Analytics & Reports</h3>
          <p>Admins can generate reports on ticket statistics and technician performance.</p>
        </div>
        <div class="feature">
          <i class="fas fa-comments"></i>
          <h3>File Attachments & Comments</h3>
          <p>Attach screenshots or error logs and collaborate via comments to provide more details about issues.</p>
        </div>
        <div class="feature">
          <i class="fas fa-tachometer-alt"></i>
          <h3>Role-Based Dashboard</h3>
          <p>Dedicated dashboards for students, teachers, technicians, and admins for streamlined issue management.</p>
        </div>
      </div>
    </section>

    <!-- Footer Section -->
    <!-- <footer class="footer">
      <p>Empowering IIT labs with an efficient issue management system.</p>
      <div class="social-links">
        <a href="#"><i class="fab fa-facebook"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
        <a href="#"><i class="fas fa-envelope"></i></a>
      </div>
    </footer> -->
  </div>
</template>

<script>
export default {
  name: "HomePage",
};
</script>

<style scoped>
/* Global Styles */
.home-container {
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

/* Header Styles */
.header {
  background: linear-gradient(135deg, #4a90e2, #6a11cb);
  color: white;
  padding: 60px 20px;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.header p {
  font-size: 1.2rem;
  margin-bottom: 20px;
}

/* .cta-button {
  padding: 12px 24px;
  background: #ff6f61;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.cta-button:hover {
  background: #e65a50;
} */

/* Features Section Styles */
.features {
  margin: 40px 0;
}

.features h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.feature-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 0 20px;
}

.feature {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.feature i {
  font-size: 2rem;
  color: #4a90e2;
  margin-bottom: 10px;
}

.feature h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.feature p {
  font-size: 1rem;
  color: #555;
}

/* Footer Styles */
/* .footer {
  background: #333;
  color: white;
  padding: 20px;
  margin-top: 40px;
}

.footer p {
  margin-bottom: 10px;
} */

.social-links a {
  color: white;
  margin: 0 10px;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: #4a90e2;
}
</style>