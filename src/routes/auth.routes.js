import express from 'express';
import { authMiddleware } from '../middlewares/middlewares.js';
import { validate } from '../validations/validate.js';
import { registerValidation, loginValidation, updateProfileValidation } from '../validations/auth.validation.js';
import { register,login, getProfile, updateProfile, logout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfileValidation, validate, updateProfile);
router.post('/logout', authMiddleware, logout);

export default router;
