const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role-based access control middleware
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const userRole = req.user.role || 'Citizen';
    // Match case-insensitively or exact match
    const hasRole = allowedRoles.some(role => 
      role.toLowerCase() === userRole.toLowerCase() ||
      (role.toLowerCase() === 'investigator' && userRole.toLowerCase().includes('investigator')) ||
      (role.toLowerCase() === 'admin' && userRole.toLowerCase().includes('admin'))
    );

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${userRole}' is not authorized to access this resource. Allowed roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};

// Sensitive data masking utility
const maskString = (str, visibleEnd = 4) => {
  if (!str || typeof str !== 'string') return str;
  if (str.length <= visibleEnd) return str;
  return 'XXXX-'.repeat(Math.max(1, Math.floor((str.length - visibleEnd) / 4))) + str.slice(-visibleEnd);
};

module.exports = {
  authenticate,
  authorizeRoles,
  maskString
};
