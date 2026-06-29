require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth_routes');
const onboardingRoutes = require('./src/routes/onboarding_routes');
const profileRoutes = require('./src/routes/profile_routes');
const sessionRoutes = require('./src/routes/session_routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Global middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/sessions', sessionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});