<template>
    <div class="main-container">
      <!-- Header Section -->
      <header class="header">
        <div class="logo">
          <img src="/images/logo.png" alt="Ticketing System Logo" />
          <h1>TicketPro</h1>
        </div>
        <nav class="navigation">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/features" class="nav-link">Features</router-link>
          <router-link to="/pricing" class="nav-link">Pricing</router-link>
          <router-link to="/contact" class="nav-link">Contact</router-link>
        </nav>
        <div class="auth-buttons">
          <router-link to="/login" class="btn btn-login">Login</router-link>
          <router-link to="/registration" class="btn btn-signup">Sign Up</router-link>
        </div>
      </header>
  
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h2>The Best Ticketing System for Your Support Needs</h2>
          <p>Easily manage tickets, improve customer support, and grow your business</p>
          <div class="hero-buttons">
            <router-link to="/registration" class="btn btn-primary">Get Started Free</router-link>
            <router-link to="/demo" class="btn btn-secondary">View Demo</router-link>
          </div>
        </div>
        <div class="hero-image">
          <img src="/images/hero-image.png" alt="Ticketing System Dashboard" />
        </div>
      </section>
  
      <!-- Features Section -->
      <section class="features">
        <h2 class="section-title">Our Key Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/ticket-management.png" alt="Ticket Management" />
            </div>
            <h3>Ticket Management</h3>
            <p>Easily create, track, and resolve tickets</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/automation.png" alt="Automation" />
            </div>
            <h3>Automation</h3>
            <p>Save time by automating routine tasks</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/analytics.png" alt="Analytics" />
            </div>
            <h3>Real-Time Analytics</h3>
            <p>Data-driven insights for decision making</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <img src="/images/collaboration.png" alt="Collaboration" />
            </div>
            <h3>Team Collaboration</h3>
            <p>Improve cooperation within your team</p>
          </div>
        </div>
      </section>
  
      <!-- How It Works Section -->
      <section class="how-it-works">
        <h2 class="section-title">How Our System Works</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <h3>Submit Ticket</h3>
            <p>Client submits question or issue</p>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <h3>Assignment</h3>
            <p>Ticket is assigned to the right agent</p>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <h3>Resolution</h3>
            <p>Agent resolves the problem</p>
          </div>
          <div class="step">
            <div class="step-number">4</div>
            <h3>Close</h3>
            <p>Ticket is closed after satisfaction</p>
          </div>
        </div>
      </section>
  
      <!-- Testimonials Section -->
      <section class="testimonials">
        <h2 class="section-title">What Our Clients Say</h2>
        <div class="testimonial-slider">
          <div class="testimonial">
            <p class="quote">"This ticketing system has completely transformed our customer support process. Response time has decreased by 40%!"</p>
            <div class="author">
              <img src="/images/testimonial1.png" alt="Client 1" />
              <div class="author-info">
                <h4>John Smith</h4>
                <p>Tech Solutions Ltd.</p>
              </div>
            </div>
          </div>
          <div class="testimonial">
            <p class="quote">"Easy to use and effective. We've completely changed our customer support system with this platform."</p>
            <div class="author">
              <img src="/images/testimonial2.png" alt="Client 2" />
              <div class="author-info">
                <h4>Sarah Johnson</h4>
                <p>E-Commerce Pro</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Call to Action Section -->
      <section class="cta">
        <div class="cta-content">
          <h2>Start Using Our Ticketing System Today</h2>
          <p>14-day free trial - No credit card required</p>
          <router-link to="/registration" class="btn btn-primary">Sign Up For Free</router-link>
        </div>
      </section>
  
      <!-- Footer Section -->
      <footer class="footer">
        <div class="footer-grid">
          <div class="footer-section">
            <h3>TicketPro</h3>
            <p>The best ticketing solution for your business</p>
            <div class="social-icons">
              <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-icon"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          <div class="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><router-link to="/features">Features</router-link></li>
              <li><router-link to="/pricing">Pricing</router-link></li>
              <li><router-link to="/blog">Blog</router-link></li>
              <li><router-link to="/faq">FAQ</router-link></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Support</h3>
            <ul>
              <li><router-link to="/contact">Contact</router-link></li>
              <li><router-link to="/help">Help Center</router-link></li>
              <li><router-link to="/docs">Documentation</router-link></li>
              <li><router-link to="/status">System Status</router-link></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Company</h3>
            <ul>
              <li><router-link to="/about">About Us</router-link></li>
              <li><router-link to="/careers">Careers</router-link></li>
              <li><router-link to="/privacy">Privacy Policy</router-link></li>
              <li><router-link to="/terms">Terms of Service</router-link></li>
            </ul>
          </div>
        </div>
        <div class="copyright">
          <p>&copy; {{ new Date().getFullYear() }} TicketPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomePage',
    data() {
      return {
        // Any data properties can go here
      }
    },
    methods: {
      // Methods can be defined here
    }
  }
  </script>
  
  <style scoped>
  /* Base Styles */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
  }
  
  .main-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  /* Header Styles */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #eee;
  }
  
  .logo {
    display: flex;
    align-items: center;
  }
  
  .logo img {
    height: 40px;
    margin-right: 10px;
  }
  
  .logo h1 {
    font-size: 24px;
    font-weight: 700;
    color: #3a86ff;
  }
  
  .navigation {
    display: flex;
  }
  
  .nav-link {
    margin: 0 15px;
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
  }
  
  .nav-link:hover {
    color: #3a86ff;
  }
  
  .auth-buttons {
    display: flex;
    gap: 15px;
  }
  
  .btn {
    padding: 10px 20px;
    border-radius: 5px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s;
    text-align: center;
  }
  
  .btn-login {
    color: #3a86ff;
    border: 1px solid #3a86ff;
  }
  
  .btn-login:hover {
    background-color: #f0f5ff;
  }
  
  .btn-signup {
    background-color: #3a86ff;
    color: white;
  }
  
  .btn-signup:hover {
    background-color: #2a75e8;
  }
  
  /* Hero Section */
  .hero {
    display: flex;
    align-items: center;
    padding: 80px 0;
    gap: 40px;
  }
  
  .hero-content {
    flex: 1;
  }
  
  .hero-content h2 {
    font-size: 36px;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.2;
    color: #1e293b;
  }
  
  .hero-content p {
    font-size: 18px;
    margin-bottom: 30px;
    color: #64748b;
  }
  
  .hero-buttons {
    display: flex;
    gap: 15px;
  }
  
  .btn-primary {
    background-color: #3a86ff;
    color: white;
    padding: 12px 24px;
  }
  
  .btn-primary:hover {
    background-color: #2a75e8;
  }
  
  .btn-secondary {
    background-color: #f8fafc;
    color: #3a86ff;
    border: 1px solid #e2e8f0;
    padding: 12px 24px;
  }
  
  .btn-secondary:hover {
    background-color: #f0f5ff;
  }
  
  .hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .hero-image img {
    max-width: 100%;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  /* Features Section */
  .features {
    padding: 80px 0;
    background-color: #f8fafc;
  }
  
  .section-title {
    text-align: center;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 50px;
    color: #1e293b;
  }
  
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
  }
  
  .feature-card {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
  }
  
  .feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  }
  
  .feature-icon {
    margin-bottom: 20px;
  }
  
  .feature-icon img {
    width: 60px;
    height: 60px;
  }
  
  .feature-card h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #1e293b;
  }
  
  .feature-card p {
    color: #64748b;
  }
  
  /* How It Works Section */
  .how-it-works {
    padding: 80px 0;
  }
  
  .steps {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .step {
    flex: 1;
    min-width: 200px;
    text-align: center;
    padding: 30px;
    position: relative;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    background-color: #3a86ff;
    color: white;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    font-weight: 700;
    margin: 0 auto 20px;
  }
  
  .step h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #1e293b;
  }
  
  .step p {
    color: #64748b;
  }
  
  /* Testimonials Section */
  .testimonials {
    padding: 80px 0;
    background-color: #f8fafc;
  }
  
  .testimonial-slider {
    display: flex;
    gap: 30px;
    overflow-x: auto;
    padding: 20px 0;
  }
  
  .testimonial {
    flex: 0 0 calc(50% - 15px);
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .quote {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 20px;
    font-style: italic;
  }
  
  .author {
    display: flex;
    align-items: center;
  }
  
  .author img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-right: 15px;
  }
  
  .author-info h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 5px;
    color: #1e293b;
  }
  
  .author-info p {
    font-size: 14px;
    color: #64748b;
  }
  
  /* Call to Action Section */
  .cta {
    padding: 80px 0;
    background-color: #3a86ff;
    color: white;
    text-align: center;
  }
  
  .cta-content {
    max-width: 700px;
    margin: 0 auto;
  }
  
  .cta h2 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 20px;
  }
  
  .cta p {
    font-size: 18px;
    margin-bottom: 30px;
    opacity: 0.9;
  }
  
  .cta .btn-primary {
    background-color: white;
    color: #3a86ff;
    font-weight: 600;
    padding: 15px 30px;
    font-size: 18px;
  }
  
  .cta .btn-primary:hover {
    background-color: #f0f5ff;
  }
  
  /* Footer Section */
  .footer {
    background-color: #1e293b;
    color: white;
    padding: 80px 0 30px;
  }
  
  .footer-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 40px;
    margin-bottom: 50px;
  }
  
  .footer-section h3 {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    color: white;
  }
  
  .footer-section p {
    margin-bottom: 20px;
    color: #cbd5e1;
  }
  
  .footer-section ul {
    list-style: none;
  }
  
  .footer-section ul li {
    margin-bottom: 10px;
  }
  
  .footer-section ul li a {
    color: #cbd5e1;
    text-decoration: none;
    transition: color 0.3s;
  }
  
  .footer-section ul li a:hover {
    color: white;
  }
  
  .social-icons {
    display: flex;
    gap: 15px;
  }
  
  .social-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border-radius: 50%;
    text-decoration: none;
    transition: background-color 0.3s;
  }
  
  .social-icon:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .copyright {
    text-align: center;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    color: #cbd5e1;
  }
  
  /* Responsive Design */
  @media (max-width: 991px) {
    .hero {
      flex-direction: column;
      text-align: center;
    }
    
    .hero-buttons {
      justify-content: center;
    }
  }
  
  @media (max-width: 768px) {
    .header {
      flex-direction: column;
      gap: 20px;
    }
    
    .navigation {
      width: 100%;
      justify-content: center;
      margin: 20px 0;
    }
    
    .testimonial {
      flex: 0 0 100%;
    }
  }
  
  @media (max-width: 576px) {
    .nav-link {
      margin: 0 10px;
    }
    
    .hero-content h2 {
      font-size: 28px;
    }
    
    .feature-grid {
      grid-template-columns: 1fr;
    }
    
    .steps {
      flex-direction: column;
    }
  }
  </style>