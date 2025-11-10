// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Настройка CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Разрешаем запросы без origin (например, из Postman)
        if (!origin) return callback(null, true);
        
        // Разрешенные домены
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://localhost:8080',
            'http://127.0.0.1:8080'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Разрешить cookies и авторизационные заголовки
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Разрешенные методы
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Accept'
    ], // Разрешенные заголовки
    optionsSuccessStatus: 200 // Для старых браузеров
};

// Middleware
app.use(cors(corsOptions)); // Используем настройки CORS
app.use(express.json()); // Парсинг JSON-запросов

// Логирование CORS для отладки
app.use((req, res, next) => {
    console.log(`[CORS] ${req.method} ${req.path} from origin: ${req.headers.origin}`);
    next();
});

// Подключение маршрутов
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/auth', require('./routes/authRoutes')); // Добавьте эту строку


// Обработка ошибок CORS
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ 
            error: 'CORS policy violation', 
            message: 'Доступ с этого домена запрещен' 
        });
    }
    next(err);
});

// Общая обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Server error' });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS enabled for: ${corsOptions.origin}`);
});