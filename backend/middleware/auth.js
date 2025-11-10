const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
  
  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_for_development';
  
  let token = req.header('x-auth-token');
  if (!token && req.header('authorization')) {
    token = req.header('authorization').replace('Bearer ', '');
  }

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    console.log('Token received:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, jwtSecret);
    
    console.log('Decoded token:', decoded); // Добавьте это для отладки
    
    if (!decoded || typeof decoded !== 'object') {
      return res.status(401).json({ error: 'Invalid token structure' });
    }

    // Проверяем наличие userId в декодированном токене
    if (!decoded.userId) {
      return res.status(401).json({ error: 'Token missing user ID' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(500).json({ error: 'Token verification failed' });
    }
  }
};