import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { email } = req.query;
    let query = 'SELECT * FROM notifications';
    const params = [];
    
    if (email) {
      query += ' WHERE recipient_email = $1';
      params.push(email);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 100';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { recipientEmail, subject, body, type, relatedId } = req.body;
    const result = await pool.query(
      'INSERT INTO notifications (recipient_email, subject, body, type, related_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [recipientEmail, subject, body, type, relatedId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
