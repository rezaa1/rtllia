const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Protect routes - verify token and set user in req
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['passwordHash'] }
      });

      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({ message: 'User account is inactive' });
      }

      // Set user and organization ID in request
      req.user = user;
      req.organizationId = user.organizationId;
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Check if user is admin (super admin)
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

// Check if user is organization admin
exports.organizationAdmin = (req, res, next) => {
  if (req.user && (req.user.isOrganizationAdmin || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an organization admin' });
  }
};

// Check if user has access to the organization
exports.organizationAccess = async (req, res, next) => {
  try {
    // Super admin can access any organization
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user belongs to the requested organization
    const organizationId = parseInt(req.params.id);
    
    if (req.user.organizationId === organizationId) {
      // User belongs to this organization
      return next();
    }

    res.status(403).json({ message: 'Not authorized to access this organization' });
  } catch (error) {
    console.error('Organization access middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to check tenant access based on domain or slug
exports.tenantResolver = async (req, res, next) => {
  try {
    let organization;
    
    // Check for custom domain in host header
    const host = req.headers.host;
    if (host) {
      // Extract domain from host (remove port if present)
      const domain = host.split(':')[0];
      
      // Find organization by custom domain
      organization = await Organization.findOne({
        where: { customDomain: domain }
      });
    }
    
    // If no organization found by domain, check for slug in subdomain or path
    if (!organization && req.params.slug) {
      organization = await Organization.findOne({
        where: { slug: req.params.slug }
      });
    }
    
    if (organization) {
      // Set organization in request
      req.organization = organization;
      req.organizationId = organization.id;
    }
    
    next();
  } catch (error) {
    console.error('Tenant resolver middleware error:', error);
    next(); // Continue even if tenant resolution fails
  }
};
