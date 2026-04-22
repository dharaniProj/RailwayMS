require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS: allow local dev + any production frontend URL set in CORS_ORIGIN env var
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/employees',     require('./routes/employee'));
app.use('/api/announcements', require('./routes/announcement'));
app.use('/api/salary',        require('./routes/salary'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/leaves',        require('./routes/leave'));
app.use('/api/transfers',     require('./routes/transfer'));
app.use('/api/documents',     require('./routes/document'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Railway Management System API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
