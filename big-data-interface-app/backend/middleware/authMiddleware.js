const jwt = require('jsonwebtoken');

module.exports = (roles = []) => {
  return (req, res, next) => {
    // 1. Get Token
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    // 2. Verify Token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;

      // 3. Check Role (if roles are specified)
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: 'Access denied for this user role' });
      }

      next();
    } catch (err) {
      res.status(401).json({ msg: 'Token is not valid' });
    }
  };
};