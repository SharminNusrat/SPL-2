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

            const totalAssigned = rows[0]?.total_assigned || 0;
            const totalResolved = rows[0]?.total_resolved || 0;
            
            const resolutionRate = totalAssigned > 0 
                ? ((totalResolved / totalAssigned) * 100).toFixed(2) 
                : 0;

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