const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access Denied: No Token Provided' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    const decoded = jwt.decode(token);
    console.error('JWT Verification Failed:', error.message);
    console.log('Decoded Payload (Unverified):', decoded);
    res.status(403).json({ error: 'Auth Failed', details: error.message });
  }
};

// Ensure User is ADMIN
const requireAdmin = (req, res, next) => {
  // Normalize role (handle Spring Security's ROLE_ prefix)
  const userRole = req.user && req.user.role ? req.user.role.replace('ROLE_', '') : null;
  
  if (userRole === 'ADMIN') {
    next();
  } else {
    console.error(`Admin access denied for role: ${req.user ? req.user.role : 'None'}`);
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

module.exports = { verifyToken, requireAdmin };
