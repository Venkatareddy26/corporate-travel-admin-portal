import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM destinations ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, country, city, latitude, longitude, riskLevel } = req.body;
    const result = await pool.query(
      'INSERT INTO destinations (name, country, city, latitude, longitude, risk_level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, country, city, latitude, longitude, riskLevel]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
