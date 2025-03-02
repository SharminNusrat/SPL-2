const router = require('express').Router();
const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware');

const technicianPerformance= (req, res) => {
    const query = `
       SELECT 
    t.assigned_to AS technician_id,
    u.fname AS technician_name,
    COUNT(t.id) AS total_assigned,
    SUM(CASE WHEN t.ticket_status IN ('Closed', 'Resolved') THEN 1 ELSE 0 END) AS total_resolved
FROM 
    ticket t
JOIN 
    users u ON t.assigned_to = u.id
WHERE 
    t.assigned_to IS NOT NULL
GROUP BY 
    t.assigned_to, u.fname;

    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error fetching technician report.' });
        }
        return res.status(200).json({
            report: results
        });
    });
};

const categoryBasedReport= (req, res) => {
    const totalQuery = `SELECT COUNT(*) AS total_tickets FROM ticket`;
    const categoryQuery = `
        SELECT 
            c.id AS category_id,
            c.name AS category_name,
            COUNT(t.id) AS category_count
        FROM 
            ticket t
        JOIN 
            category c ON t.category_id = c.id
        GROUP BY 
            c.id, c.name
    `;

    db.query(totalQuery, (err, totalResult) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error fetching total tickets.' });
        }
        const totalTickets = totalResult[0].total_tickets;
        db.query(categoryQuery, (err, categoryResults) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error fetching category report.' });
            }
            const report = categoryResults.map(category => ({
                category_id: category.category_id,
                category_name: category.category_name,
                count: category.category_count,
                percentage: ((category.category_count / totalTickets) * 100).toFixed(2)
            }));

            return res.status(200).json({
                total_tickets: totalTickets,
                category_report: report
            });
        });
    });
};
const technicianSelfReport = (req, res) => {
    const technicianId = req.params.id;
    const range = req.query.range || '30d'; // Default to 30 days
    
    let daysToFetch;
    switch(range) {
      case '3m': daysToFetch = 90; break;
      case '6m': daysToFetch = 180; break;
      case '1y': daysToFetch = 365; break;
      default: daysToFetch = 30; // Default '30d'
    }
    
    // Query to get daily data for assigned vs resolved tickets
    const query = `
      SELECT 
        DATE(t.created_at) AS ticket_date,
        COUNT(CASE WHEN t.assigned_to = ? THEN 1 END) AS assigned,
        COUNT(CASE WHEN t.assigned_to = ? AND t.ticket_status IN ('Closed', 'Resolved') AND DATE(t.updated_at) = DATE(t.created_at) THEN 1 END) AS resolved
      FROM 
        ticket t
      WHERE 
        t.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY 
        DATE(t.created_at)
      ORDER BY 
        ticket_date ASC
    `;
    
    db.query(query, [technicianId, technicianId, daysToFetch], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error fetching technician self report.' });
      }
      
      // Format the data for the frontend
      const report = results.map(day => ({
        date: day.ticket_date.toISOString().split('T')[0], // Format: YYYY-MM-DD
        assigned: day.assigned || 0,
        resolved: day.resolved || 0
      }));
      
      return res.status(200).json({ report });
    });
  };
module.exports = {technicianPerformance,categoryBasedReport,technicianSelfReport};