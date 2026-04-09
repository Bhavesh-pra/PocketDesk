const requireAdmin = (req, res, next) => {
  // Assuming authMiddleware has already run and attached user info to req.user or req.role
  // Based on current backend, it seems userId is stored in req.userId by some middleware.
  // I need to check the existing auth middleware to see where role is stored.
  
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = { requireAdmin };
