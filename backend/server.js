require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS — open to all if CORS_ORIGIN not set (initial setup), restricted once set
const corsOptions = process.env.CORS_ORIGIN
  ? {
      origin: (origin, callback) => {
        const allowed = [
          'http://localhost:5173',
          'http://localhost:3000',
          ...process.env.CORS_ORIGIN.split(',').map(o => o.trim()),
        ];
        // Allow requests with no origin (Postman, curl, server-to-server)
        if (!origin || allowed.includes(origin)) return callback(null, true);
        console.log('[CORS] Blocked origin:', origin, '| Allowed:', allowed.join(', '));
        callback(new Error('CORS: origin not allowed'));
      },
      credentials: true,
    }
  : { origin: true, credentials: true }; // Allow all when not configured

app.use(cors(corsOptions));

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
