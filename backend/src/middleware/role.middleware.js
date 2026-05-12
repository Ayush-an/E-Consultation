/**
 * Middleware to restrict route access to specific user roles.
 * @param {...string} allowedRoles - List of roles permitted to access the route (e.g. 'DOCTOR', 'ADMIN').
 */
module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ status: 'error', message: 'Forbidden. Role not verified.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'Forbidden. Access restricted to authorized roles.' });
    }

    next();
  };
};
