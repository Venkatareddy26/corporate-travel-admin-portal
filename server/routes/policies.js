import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM policies ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM policies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, category, version, effectiveDate } = req.body;
    const result = await pool.query(
      'INSERT INTO policies (title, description, category, version, effective_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, category, version, effectiveDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
