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

async function register(name, email, password) {

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('Invalid credentials', 409);
  }

  const passwordHash = await argon2.hash(password + process.env.PEPPER, {
    memoryCost: 65536, 
    timeCost: 3,
    parallelism: 4
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  });

  return { id: user.id, name: user.name, email: user.email };
}


async function login(email, password) {
    
  const user = await prisma.user.findUnique({
    where: { email }
  });

  const passwordToCheck = user ? user.passwordHash : dummyHash;
  const isValid = await argon2.verify(passwordToCheck, password + process.env.PEPPER);

  if (!user || !isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.status === 'blocked') {
    throw new AppError('Invalid credentials', 403);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email } };
}

function logout() {
  return true;
}

module.exports = { register, login, logout };