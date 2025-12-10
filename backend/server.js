require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// routes
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/admin.routes');

const app = express();
app.use(express.json());
app.use(cookieParser());

/* =======================================
   CORS CONFIG
======================================= */

const allowedOrigins = [
  "http://localhost:3000",
  "https://iam-college-portal.vercel.app",
  "https://iam-college-portal.onrender.com"
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow REST tools, curl
    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.log("❌ BLOCKED BY CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* =======================================
   HEALTH CHECK
======================================= */

app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

/* =======================================
   API ROUTES
======================================= */

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

/* =======================================
   STATIC FRONTEND (PRODUCTION ONLY)
======================================= */

if (process.env.NODE_ENV === "production") {
  // serve frontend build
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

/* =======================================
   GLOBAL ERROR HANDLER
======================================= */

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err.message);
  res.status(500).json({ error: err.message || 'Server error' });
});

/* =======================================
   START SERVER
======================================= */

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
