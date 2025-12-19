/*const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};
*/

module.exports = authMiddleware;

const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // ✅ IMPORTANT: Allow CORS preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
