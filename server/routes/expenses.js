import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { tripId, category, vendor, amount } = req.body;
    const result = await pool.query(
      'INSERT INTO expenses (trip_id, category, vendor, amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [tripId, category, vendor, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
