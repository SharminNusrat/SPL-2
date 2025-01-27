const router = require('express').Router();
const db = require('../db-config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware');

const addCategory = (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
    }

    const insertQuery = `INSERT INTO category (name) VALUES (?)`;

    db.query(insertQuery, [name], (err, result) => {
        if (err) {
            console.error('Error adding category:', err);
            return res.status(500).json({ error: 'Database error while adding category.' });
        }

        return res.status(201).json({
            message: 'Category added successfully.',
            category_id: result.insertId,
            name: name
        });
    });
};

const updateExistingCategory = (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
    }

    const updateQuery = `UPDATE category SET name = ? WHERE id = ?`;

    db.query(updateQuery, [name, id], (err, result) => {
        if (err) {
            console.error('Error updating category:', err);
            return res.status(500).json({ error: 'Database error while updating category.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        return res.status(200).json({
            message: 'Category updated successfully.',
            category_id: id,
            updated_name: name
        });
    });
};

const deleteCategory = (req, res) => {
    const { id } = req.params;

    const deleteQuery = `DELETE FROM category WHERE id = ?`;

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({ error: 'Database error while deleting category.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Category not found.' });
        }

        return res.status(200).json({
            message: 'Category deleted successfully.',
            category_id: id
        });
    });
};

const getAllCategory= (req, res) => {
    const getQuery = `SELECT id, name FROM category`;

    db.query(getQuery, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({ error: 'Database error while fetching categories.' });
        }

        return res.status(200).json({
            categorie: results
        });
    });
};

module.exports = {addCategory,updateExistingCategory,deleteCategory,getAllCategory};