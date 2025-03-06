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
// const technicianSelfReport = (req, res) => {
//     const technicianId = req.params.id;
//     const range = req.query.range || '30d'; // Default to 30 days
    
//     let daysToFetch;
//     switch(range) {
//       case '3m': daysToFetch = 90; break;
//       case '6m': daysToFetch = 180; break;
//       case '1y': daysToFetch = 365; break;
//       default: daysToFetch = 30; // Default '30d'
//     }
    
//     // Query to get daily data for assigned vs resolved tickets
//     const query = `
//       SELECT 
//         DATE(t.created_at) AS ticket_date,
//         COUNT(CASE WHEN t.assigned_to = ? THEN 1 END) AS assigned,
//         COUNT(CASE WHEN t.assigned_to = ? AND t.ticket_status IN ('Closed', 'Resolved') AND DATE(t.updated_at) = DATE(t.created_at) THEN 1 END) AS resolved
//       FROM 
//         ticket t
//       WHERE 
//         t.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
//       GROUP BY 
//         DATE(t.created_at)
//       ORDER BY 
//         ticket_date ASC
//     `;
    
//     db.query(query, [technicianId, technicianId, daysToFetch], (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ error: 'Database error fetching technician self report.' });
//       }
      
//       // Format the data for the frontend
//       const report = results.map(day => ({
//         ticket_date: day.ticket_date.toISOString().split('T')[0], // Format: YYYY-MM-DD
//         assigned: day.assigned || 0,
//         resolved: day.resolved || 0
//     }));
//       console.log("Technician ID:", technicianId);
//       console.log("Date Range:", range);
//       console.log("Query Results:", results);
//       return res.status(200).json({ report });
//     });
//   };
const technicianSelfReport = (req, res) => {
    const userId = req.user.id;

    const query = `
        SELECT 
            DATE(created_at) as date,
            SUM(CASE WHEN ticket_status IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS resolved_closed,
            COUNT(*) AS assigned
        FROM ticket
        WHERE assigned_to = ?
        GROUP BY DATE(created_at)
        HAVING assigned > 0
        ORDER BY date;
    `;

    db.query(query, [userId], (error, rows) => {
        if (error) {
            console.error("Error fetching technician report:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        // Format response
        const reportData = rows.map(row => ({
            date: row.date,
            ratio: row.assigned > 0 ? row.resolved_closed / row.assigned : null
        }));

        res.json({ success: true, data: reportData });
    });
  };
  const technicianSummary = (req, res) => {
    const userId = req.user.id;

    console.log("Fetching summary data for technician ID:", userId);

    // First check if the technician exists
    const userCheckQuery = "SELECT id, fname FROM users WHERE id = ? AND role = 'technician'";
    
    db.query(userCheckQuery, [userId], (checkError, userRows) => {
        if (checkError) {
            console.error("Error checking technician:", checkError);
            return res.status(500).json({ success: false, message: "Server error while checking technician." });
        }
        
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: "Technician not found or user is not a technician." });
        }
        
        const technicianName = userRows[0].fname;
        
        // Now fetch the summary data
        const query = `
            SELECT 
                COUNT(id) AS total_assigned,
                SUM(CASE WHEN LOWER(ticket_status) IN ('closed', 'resolved') THEN 1 ELSE 0 END) AS total_resolved
            FROM ticket
            WHERE assigned_to = ?;
        `;

        db.query(query, [userId], (error, rows) => {
            if (error) {
                console.error("Error fetching technician summary:", error);
                return res.status(500).json({ success: false, message: "Server error while fetching summary." });
            }

            // Even if no tickets, we can still return the technician info
            const totalAssigned = rows[0]?.total_assigned || 0;
            const totalResolved = rows[0]?.total_resolved || 0;
            
            // Calculate resolution rate (avoid division by zero)
            const resolutionRate = totalAssigned > 0 
                ? ((totalResolved / totalAssigned) * 100).toFixed(2) 
                : 0;

            // Format the response
            const summaryData = {
                technicianName: technicianName,
                totalAssigned: totalAssigned,
                totalResolved: totalResolved,
                resolutionRate: resolutionRate,
            };

            res.json({ success: true, data: summaryData });
        });
    });
};

module.exports = {technicianPerformance,categoryBasedReport,technicianSelfReport,technicianSummary};