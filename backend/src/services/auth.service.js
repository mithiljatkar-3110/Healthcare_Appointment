const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const BCRYPT_ROUNDS = 12;

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toSafeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  ...(user.patient && { patient: { id: user.patient.id } }),
});

const registerPatient = async ({ name, email, password }) => {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const user = await prisma.$transaction(
      (tx) =>
        tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            role: 'PATIENT',
            patient: { create: {} },
          },
        }),
      { maxWait: 5_000, timeout: 10_000 },
    );

    return toSafeUser(user);
  } catch (error) {
    if (error.code === 'P2002') {
      throw createError('An account with this email already exists.', 409);
    }

    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { patient: { select: { id: true } } },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw createError('Invalid email or password.', 401);
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your_super_secret_jwt_key_change_this') {
    throw createError('JWT_SECRET is not securely configured.', 500);
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
  );

  return { token, user: toSafeUser(user) };
};

module.exports = { registerPatient, login };
