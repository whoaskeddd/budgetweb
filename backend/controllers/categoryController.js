const pool = require('../config/db');

exports.createCategory = async (req, res) => {
  const { name, color, type = "expense" } = req.body;
  const userId = req.user.userId;

  try {
    // Валидация данных
    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    // Проверяем, нет ли уже категории с таким именем у этого пользователя
    const existingCategory = await pool.query(
      'SELECT * FROM categories WHERE name = $1 AND user_id = $2',
      [name, userId]
    );

    if (existingCategory.rows.length > 0) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }

    // Создаем новую категорию
    const result = await pool.query(
      'INSERT INTO categories (name, color, type, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, color, type, userId]
    );

    res.status(201).json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      color: result.rows[0].color,
      type: result.rows[0].type,
      user_id: result.rows[0].user_id
    });

  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCategories = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'SELECT id, name, color, type FROM categories WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, color, type } = req.body;
  const userId = req.user.userId;

  try {
    // Проверяем, существует ли категория и принадлежит ли пользователю
    const categoryCheck = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (categoryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Обновляем категорию
    const result = await pool.query(
      'UPDATE categories SET name = $1, color = $2, type = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, color, type, id, userId]
    );

    res.json({
      id: result.rows[0].id,
      name: result.rows[0].name,
      color: result.rows[0].color,
      type: result.rows[0].type
    });

  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    // Проверяем, есть ли транзакции с этой категорией
    const transactionsCheck = await pool.query(
      'SELECT id FROM transactions WHERE category_id = $1 AND user_id = $2 LIMIT 1',
      [id, userId]
    );

    if (transactionsCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category. There are transactions associated with it.' 
      });
    }

    // Проверяем, есть ли бюджеты с этой категорией
    const budgetsCheck = await pool.query(
      'SELECT id FROM budgets WHERE category_id = $1 AND user_id = $2 LIMIT 1',
      [id, userId]
    );

    if (budgetsCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category. There are budgets associated with it.' 
      });
    }

    // Удаляем категорию
    const result = await pool.query(
      'DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error' });
  }
};