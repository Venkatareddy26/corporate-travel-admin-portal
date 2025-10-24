import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM advisories ORDER BY created_at DESC LIMIT 50');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { destinationId, title, description, type, severity } = req.body;
    const result = await pool.query(
      'INSERT INTO advisories (destination_id, title, description, type, severity) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [destinationId, title, description, type, severity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
