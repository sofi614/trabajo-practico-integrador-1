import { body } from 'express-validator';
import { User } from '../models/Relations.models.js';

export const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 20 }).withMessage('El username debe tener entre 3 y 20 caracteres')
    .matches(/^[a-zA-Z0-9]+$/).withMessage('El username solo puede contener letras y números')
    .custom(async (value) => {
      const user = await User.findOne({ where: { username: value } });
      if (user) throw new Error('El username ya está en uso');
      return true;
    }),
  body('email')
    .isEmail().withMessage('El email no tiene formato válido')
    .custom(async (value) => {
      const user = await User.findOne({ where: { email: value } });
      if (user) throw new Error('El email ya está registrado');
      return true;
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe incluir mayúscula, minúscula y número'),
  body('role').optional().isIn(['user', 'admin']).withMessage('El rol no es válido'),
  body('profile').optional().isObject().withMessage('El perfil debe ser un objeto'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('El email no tiene formato válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

export const updateProfileValidation = [
  body('first_name').optional().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres').matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
  body('last_name').optional().isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres').matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),
  body('biography').optional().isLength({ max: 500 }).withMessage('La biografía no puede superar 500 caracteres'),
  body('avatar_url').optional().isURL().withMessage('La URL del avatar no es válida'),
];
