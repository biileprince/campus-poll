import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify admin JWT token
 */
export const verifyAdminToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided',
        message: 'Authorization token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      message: error.message
    });
  }
};

/**
 * Generate JWT token for admin
 * @param {Object} adminData - Admin user data
 * @returns {string} JWT token
 */
export const generateAdminToken = (adminData) => {
  return jwt.sign(
    {
      id: adminData.id,
      username: adminData.username,
      role: 'admin'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export default verifyAdminToken;
