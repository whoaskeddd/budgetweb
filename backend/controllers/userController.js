const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  
  console.log('📝 Register request received:', { username, email, password: password ? '***' : 'missing' });
  
  try {
    // Проверяем обязательные поля
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, email, username',
      [username || email, email, hashedPassword]
    );
    
    const newUser = result.rows[0];
    console.log('✅ User registered:', newUser.id);

    // Генерируем токен
    const token = jwt.sign(
      { userId: newUser.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Возвращаем в формате, который ожидает фронтенд
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    
    if (error.code === '23505') {  // Unique violation
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt for:', email);
  
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    console.log('✅ Login successful for user:', user.id);
    
    // Возвращаем в том же формате что и регистрация
    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};