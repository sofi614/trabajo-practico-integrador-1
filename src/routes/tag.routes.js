import express from 'express';
import { authMiddleware, adminMiddleware } from '../middlewares/middlewares.js';
import { validate } from '../validations/validate.js';
import {
  createTagValidation,
  tagIdValidation,
  updateTagValidation,
  deleteTagValidation,
} from '../validations/tag.validation.js';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from '../controllers/tagController.js';

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createTagValidation, validate, createTag);
router.get('/', authMiddleware, getAllTags);
router.get('/:id', authMiddleware, adminMiddleware, tagIdValidation, validate, getTagById);
router.put('/:id', authMiddleware, adminMiddleware, updateTagValidation, validate, updateTag);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTagValidation, validate, deleteTag);

export default router;
