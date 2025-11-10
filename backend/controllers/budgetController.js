const pool = require('../config/db');

exports.createBudget = async (req, res) => {
  const { category_id, amount, period } = req.body;
  const userId = req.user.userId;
  
  console.log('💰 Creating budget:', { category_id, amount, period, userId });
  
  try {
    // Валидация
    if (!category_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Category and positive amount are required' });
    }

    // Проверяем существующий бюджет для этой категории и периода
    const existingBudget = await pool.query(
      'SELECT id FROM budgets WHERE category_id = $1 AND user_id = $2 AND period = $3',
      [category_id, userId, period || new Date().toISOString().slice(0, 7)]
    );

    if (existingBudget.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Budget for this category and period already exists. Use update instead.' 
      });
    }

    const result = await pool.query(
      'INSERT INTO budgets (category_id, amount, period, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [category_id, amount, period || new Date().toISOString().slice(0, 7), userId]
    );
    
    console.log('✅ Budget created with ID:', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Create budget error:', error);
    
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Category not found' });
    }
    
    res.status(400).json({ error: 'Invalid data' });
  }
};

exports.getBudgets = async (req, res) => {
  const userId = req.user.userId;
  
  console.log('📋 Getting budgets for user:', userId);
  
  try {
    const result = await pool.query(
      `SELECT b.*, c.name as category_name 
       FROM budgets b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.user_id = $1 
       ORDER BY b.period DESC, b.created_at DESC`,
      [userId]
    );
    
    console.log(`✅ Found ${result.rows.length} budgets for user ${userId}`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get budgets error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateBudget = async (req, res) => {
  const { id } = req.params;
  const { category_id, amount, period } = req.body;
  const userId = req.user.userId;
  
  console.log('✏️ Updating budget:', { id, category_id, amount, period, userId });
  
  try {
    const result = await pool.query(
      'UPDATE budgets SET category_id = $1, amount = $2, period = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [category_id, amount, period, id, userId]
    );
    
    if (result.rowCount === 0) {
      console.log('❌ Budget not found for update:', id);
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    console.log('✅ Budget updated:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Update budget error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteBudget = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  
  console.log('🗑️ Deleting budget:', { id, userId });
  
  try {
    const result = await pool.query(
      'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id', 
      [id, userId]
    );
    
    if (result.rowCount === 0) {
      console.log('❌ Budget not found for deletion:', id);
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    console.log('✅ Budget deleted:', id);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('❌ Delete budget error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};