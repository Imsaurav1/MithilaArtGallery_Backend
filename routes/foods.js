const express = require('express');
const router = express.Router();
const fetch = require('../middleware/fetchdetails');
const initializeDatabase = require('../db');

router.post('/foodData', async (req, res) => {
    try {
        const { foodItems, categories } = await initializeDatabase();
        res.json([foodItems, categories]);
    } catch (error) {
        console.error('Failed to fetch food data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
