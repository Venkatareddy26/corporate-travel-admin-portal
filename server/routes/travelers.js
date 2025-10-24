import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM travelers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, optIn } = req.body;
    const result = await pool.query(
      'INSERT INTO travelers (name, email, phone, opt_in) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, phone, optIn]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/checkin', async (req, res, next) => {
  try {
    const result = await pool.query(
      'UPDATE travelers SET last_check_in = CURRENT_TIMESTAMP, sos_active = false WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
