const argon2 = require('argon2');
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/app_error');

let dummyHash = null;
argon2.hash('dummy_password_for_timing_protection' + process.env.PEPPER, {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
}).then(hash => {
  dummyHash = hash;
});

// Register a new user
async function register(name, email, password) {

  // Check if email is already in use
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('Invalid credentials', 409);
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
  const passwordToCheck = user ? user.passwordHash : dummyHash;
  const isValid = await argon2.verify(passwordToCheck, password + process.env.PEPPER);

  if (!user || !isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.status === 'blocked') {
    throw new AppError('Invalid credentials', 403);
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
  return true;
}

module.exports = { register, login, logout };