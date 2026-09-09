import express from 'express';
import { authMiddleware } from '../middlewares/middlewares.js';
import { validate } from '../validations/validate.js';
import {
  createArticleValidation,
  listArticlesValidation,
  articleIdValidation,
  userArticlesValidation,
  updateArticleValidation,
  deleteArticleValidation,
  addTagValidation,
  removeTagValidation,
} from '../validations/article.validation.js';
import {
  createArticle,
  getPublishedArticles,
  getArticleById,
  getUserArticles,
  getUserArticleById,
  updateArticle,
  deleteArticle,
  addTagToArticle,
  removeTagFromArticle,
} from '../controllers/articleController.js';

const router = express.Router();
export const articleTagRouter = express.Router();

router.post('/', authMiddleware, createArticleValidation, validate, createArticle);
router.get('/', authMiddleware, listArticlesValidation, validate, getPublishedArticles);
router.get('/user', authMiddleware, getUserArticles);
router.get('/user/:id', authMiddleware, userArticlesValidation, validate, getUserArticleById);
router.get('/:id', authMiddleware, articleIdValidation, validate, getArticleById);
router.put('/:id', authMiddleware, updateArticleValidation, validate, updateArticle);
router.delete('/:id', authMiddleware, deleteArticleValidation, validate, deleteArticle);

articleTagRouter.post('/', authMiddleware, addTagValidation, validate, addTagToArticle);
articleTagRouter.delete('/:articleTagId', authMiddleware, removeTagValidation, validate, removeTagFromArticle);

export default router;
