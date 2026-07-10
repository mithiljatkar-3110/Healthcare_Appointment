const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authorization = req.get('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === 'your_super_secret_jwt_key_change_this') {
    return res.status(500).json({ message: 'JWT_SECRET is not securely configured.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    if (!payload.userId || !payload.role || !payload.email) {
      return res.status(401).json({ message: 'Invalid authentication token.' });
    }

    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

module.exports = authenticate;
