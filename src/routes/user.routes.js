import express from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/middlewares.js';
import { validate } from '../validations/validate.js';
import { userIdValidation, createUserValidation, updateUserValidation, deleteUserValidation } from '../validations/user.validation.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getAllUsers);
router.get('/:id', authMiddleware, adminMiddleware, userIdValidation, validate, getUserById);
router.post('/', authMiddleware, adminMiddleware, createUserValidation, validate, createUser);
router.put('/:id', authMiddleware, adminMiddleware, userIdValidation, updateUserValidation, validate, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUserValidation, validate, deleteUser);

export default router;
