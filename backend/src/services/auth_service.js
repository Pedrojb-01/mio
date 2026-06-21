const argon2 = require('argon2');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');

// Register a new user
async function register(name, email, password) {

  // Check if email is already in use
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  // Hash the password with pepper
  const passwordHash = await argon2.hash(password + process.env.PEPPER, {
    memoryCost: 65536, // 64MB
    timeCost: 3,
    parallelism: 4
  });

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  });

  return { id: user.id, name: user.name, email: user.email };
}


// Login user and return JWT
async function login(email, password) {
    
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  // Verify password even if user doesn't exist to prevent timing attacks
  const dummyHash = '$argon2id$v=19$m=65536,t=3,p=4$dummy$dummyhashfortimingprotection';
  const passwordToCheck = user ? user.passwordHash : dummyHash;
  const isValid = await argon2.verify(passwordToCheck, password + process.env.PEPPER);

  if (!user || !isValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  if (user.status === 'blocked') {
    const error = new Error('Account blocked');
    error.statusCode = 403;
    throw error;
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

// Logout user (stateless — clears the cookie on the client side)
function logout() {
  // No database interaction needed.
  // The actual cookie clearing happens in the controller.
  // Post-MVP: add token to a Redis blocklist here.
  return true;
}

module.exports = { register, login, logout };