const { register, login, logout } = require('../services/auth_service');

async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const user = await register(name, email, password);
    return res.status(201).json({ message: 'User registered successfully', user });

  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message });
  }
}

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { token, user } = await login(email, password);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
    });

    return res.status(200).json({ message: 'Login successful', user });

  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({ message: error.message });
  }
}

async function logoutController(req, res) {
  try {
    logout();

    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({ message: 'Logout successful' });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

module.exports = { registerController, loginController, logoutController };