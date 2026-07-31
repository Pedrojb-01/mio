const { register, login, logout } = require('../services/auth_service');
const { validateRequiredString, validateEmail, validatePassword } = require('../utils/validate');

async function registerController(req, res) {
  try {
    const { name, email, password } = req.body;

    const nameError     = validateRequiredString(name,     'Name',     64);
    const emailError    = validateEmail(email);
    const passwordError = validatePassword(password);

    if (nameError)     return res.status(400).json({ message: nameError });
    if (emailError)    return res.status(400).json({ message: emailError });
    if (passwordError) return res.status(400).json({ message: passwordError });

    const user = await register(name, email, password);
    return res.status(201).json({ message: 'User registered successfully', user });

  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { token, user } = await login(email, password);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict',
      maxAge: 2 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: 'Login successful', user });

  } catch (error) {
    if (error.isAppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function logoutController(req, res) {
  try {
    logout();

    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'strict'
    });

    return res.status(200).json({ message: 'Logout successful' });

  } catch {
    return res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = { registerController, loginController, logoutController };