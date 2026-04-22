require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// CORS — allow localhost, production Vercel URL, and all Vercel preview deployments
const PRODUCTION_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
];

// Regex: matches all Vercel preview + production URLs for this project
// e.g. railway-ms.vercel.app  OR  railway-abc123-dharaniprojs-projects.vercel.app
const VERCEL_PATTERN = /^https:\/\/(railway-ms|railway-[a-z0-9]+-dharaniprojs-projects)\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow no-origin requests (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);
    // Allow localhost
    if (PRODUCTION_ORIGINS.includes(origin)) return callback(null, true);
    // Allow all Vercel preview/production URLs for this project
    if (VERCEL_PATTERN.test(origin)) return callback(null, true);
    // Allow any extra origins set via CORS_ORIGIN env var (comma-separated)
    if (process.env.CORS_ORIGIN) {
      const extra = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
      if (extra.includes(origin)) return callback(null, true);
    }
    console.log('[CORS] Blocked:', origin);
    callback(new Error('CORS: origin not allowed'));
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
app.use('/api/railwayPass',   require('./routes/railwayPass'));
app.use('/api/meetings',      require('./routes/meeting'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Railway Management System API' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
