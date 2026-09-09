import { verifyToken } from '../helpers/jwt.helper.js';

export const authMiddleware = (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'acceso denegado' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token expirado' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'No tienes permisos de administrador' });
  }

  next();
};

export const authorOrAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (String(req.user.id) === String(req.params.userId || req.body.user_id)) {
    return next();
  }

  return res.status(403).json({ message: 'No tienes permisos para esta acción' });
};