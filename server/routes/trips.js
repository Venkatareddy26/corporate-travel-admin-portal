import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get all trips with filters
router.get('/', async (req, res, next) => {
  try {
    const { status, department, destination, requester } = req.query;
    
    let query = 'SELECT * FROM trips WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status && status !== 'all') {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (department) {
      query += ` AND department ILIKE $${paramCount}`;
      params.push(`%${department}%`);
      paramCount++;
    }

    if (destination) {
      query += ` AND destination ILIKE $${paramCount}`;
      params.push(`%${destination}%`);
      paramCount++;
    }

    if (requester) {
      query += ` AND requester ILIKE $${paramCount}`;
      params.push(`%${requester}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    // Get timeline and comments for each trip
    const tripsWithDetails = await Promise.all(
      result.rows.map(async (trip) => {
        const timeline = await pool.query(
          'SELECT * FROM trip_timeline WHERE trip_id = $1 ORDER BY created_at DESC',
          [trip.id]
        );
        
        const comments = await pool.query(
          'SELECT * FROM trip_comments WHERE trip_id = $1 ORDER BY created_at DESC',
          [trip.id]
        );
        
        const attachments = await pool.query(
          'SELECT * FROM trip_attachments WHERE trip_id = $1',
          [trip.id]
        );

        return {
          ...trip,
          timeline: timeline.rows,
          comments: comments.rows,
          attachments: attachments.rows
        };
      })
    );

    res.json(tripsWithDetails);
  } catch (error) {
    next(error);
  }
});

// Get single trip by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [id]);
    
    if (trip.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const timeline = await pool.query(
      'SELECT * FROM trip_timeline WHERE trip_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    const comments = await pool.query(
      'SELECT * FROM trip_comments WHERE trip_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    const attachments = await pool.query(
      'SELECT * FROM trip_attachments WHERE trip_id = $1',
      [id]
    );

    res.json({
      ...trip.rows[0],
      timeline: timeline.rows,
      comments: comments.rows,
      attachments: attachments.rows
    });
  } catch (error) {
    next(error);
  }
});

// Create new trip
router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const {
      requester,
      requesterEmail,
      department,
      destination,
      start,
      end,
      purpose,
      costEstimate,
      riskLevel
    } = req.body;

    const tripResult = await client.query(
      `INSERT INTO trips (
        requester, requester_email, department, destination,
        start_date, end_date, purpose, cost_estimate, risk_level, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [requester, requesterEmail, department, destination, start, end, purpose, costEstimate, riskLevel, 'pending']
    );

    const trip = tripResult.rows[0];

    // Add initial timeline entry
    await client.query(
      'INSERT INTO trip_timeline (trip_id, status, user_name) VALUES ($1, $2, $3)',
      [trip.id, 'requested', requester]
    );

    await client.query('COMMIT');

    res.status(201).json(trip);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Update trip
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = Object.values(updates);

    const result = await pool.query(
      `UPDATE trips SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Approve trip
router.post('/:id/approve', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { approverName, comment } = req.body;

    await client.query(
      'UPDATE trips SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['approved', id]
    );

    await client.query(
      'INSERT INTO trip_timeline (trip_id, status, user_name) VALUES ($1, $2, $3)',
      [id, 'approved', approverName || 'Manager']
    );

    if (comment) {
      await client.query(
        'INSERT INTO trip_comments (trip_id, user_name, comment) VALUES ($1, $2, $3)',
        [id, approverName || 'Manager', comment]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Trip approved' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Reject trip
router.post('/:id/reject', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { approverName, reason } = req.body;

    await client.query(
      'UPDATE trips SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['rejected', id]
    );

    await client.query(
      'INSERT INTO trip_timeline (trip_id, status, user_name) VALUES ($1, $2, $3)',
      [id, 'rejected', approverName || 'Manager']
    );

    if (reason) {
      await client.query(
        'INSERT INTO trip_comments (trip_id, user_name, comment) VALUES ($1, $2, $3)',
        [id, approverName || 'Manager', reason]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Trip rejected' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

// Add comment to trip
router.post('/:id/comments', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userName, comment } = req.body;

    const result = await pool.query(
      'INSERT INTO trip_comments (trip_id, user_name, comment) VALUES ($1, $2, $3) RETURNING *',
      [id, userName, comment]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete trip
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM trips WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ success: true, message: 'Trip deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
