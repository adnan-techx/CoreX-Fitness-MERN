require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/', (_req, res) => res.json({ status: 'OK', message: 'CoreX Fitness API is running.' }));
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/nutrition', require('./routes/nutrition'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/support', require('./routes/support'));
app.use('/api/admin', require('./routes/admin'));

app.use((_req, res) => res.status(404).json({ message: 'The requested API route was not found.' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Internal server error.' });
});

const port = process.env.PORT || 5000;
connectDB().then(() => app.listen(port, () => console.log(`CoreX Fitness API listening on http://localhost:${port}`)))
  .catch((error) => { console.error('Database connection failed:', error.message); process.exit(1); });
