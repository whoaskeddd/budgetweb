const pool = require('../config/db');

exports.createTransaction = async (req, res) => {
  const { amount, date, description, category_id } = req.body;
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'INSERT INTO transactions (amount, date, description, category_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [amount, date || new Date(), description, category_id, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.getTransactions = async (req, res) => {
  const userId = req.user.userId;
  const { startDate, endDate } = req.query;  // Опциональные фильтры
  let query = 'SELECT * FROM transactions WHERE user_id = $1';
  const params = [userId];
  if (startDate && endDate) {
    query += ' AND date BETWEEN $2 AND $3';
    params.push(startDate, endDate);
  }
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { amount, date, description, category_id } = req.body;
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'UPDATE transactions SET amount = $1, date = $2, description = $3, category_id = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [amount, date, description, category_id, id, userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  try {
    const result = await pool.query('DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTransactionSummary = async (req, res) => {
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      `SELECT c.name AS category_name, SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
       GROUP BY c.name`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};