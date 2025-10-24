import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Get analytics summary
router.get('/summary', async (req, res, next) => {
  try {
    // Total trips
    const tripsCount = await pool.query('SELECT COUNT(*) as count FROM trips');
    
    // Total spend
    const totalSpend = await pool.query('SELECT SUM(amount) as total FROM expenses');
    
    // Incidents count
    const incidentsCount = await pool.query('SELECT COUNT(*) as count FROM advisories WHERE severity = $1', ['high']);
    
    // Trips by status
    const tripsByStatus = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM trips 
      GROUP BY status
    `);
    
    // Spend by category
    const spendByCategory = await pool.query(`
      SELECT category, SUM(amount) as total 
      FROM expenses 
      GROUP BY category
    `);
    
    // Trips by department
    const tripsByDepartment = await pool.query(`
      SELECT department, COUNT(*) as count 
      FROM trips 
      GROUP BY department
    `);

    res.json({
      totalTrips: parseInt(tripsCount.rows[0].count),
      totalSpend: parseFloat(totalSpend.rows[0].total || 0),
      incidents: parseInt(incidentsCount.rows[0].count),
      tripsByStatus: tripsByStatus.rows,
      spendByCategory: spendByCategory.rows,
      tripsByDepartment: tripsByDepartment.rows
    });
  } catch (error) {
    next(error);
  }
});

export default router;
