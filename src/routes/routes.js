import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { User, Article, Tag, ArticleTag } from '../models/Relations.models.js';
import { authMiddleware, adminMiddleware } from '../middlewares/middlewares.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from '../controllers/tagController.js';
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
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userExists = async (value) => {
  const user = await User.findByPk(value);
  if (!user) throw new Error('El usuario no existe');
  return true;
};

const articleExists = async (value) => {
  const article = await Article.findByPk(value);
  if (!article) throw new Error('El artículo no existe');
  return true;
};

const tagExists = async (value) => {
  const tag = await Tag.findByPk(value);
  if (!tag) throw new Error('La etiqueta no existe');
  return true;
};

const articleTagExists = async (value) => {
  const relation = await ArticleTag.findByPk(value);
  if (!relation) throw new Error('La relación artículo-etiqueta no existe');
  return true;
};

router.get('/health', (req, res) => res.status(200).json({ ok: true }));

router.post('/api/auth/register', [
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
], validate, register);

router.post('/api/auth/login', [
  body('email').isEmail().withMessage('El email no tiene formato válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
], validate, login);

router.get('/api/auth/profile', authMiddleware, getProfile);
router.put('/api/auth/profile', authMiddleware, [
  body('first_name').optional().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres').matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
  body('last_name').optional().isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres').matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),
  body('biography').optional().isLength({ max: 500 }).withMessage('La biografía no puede superar 500 caracteres'),
  body('avatar_url').optional().isURL().withMessage('La URL del avatar no es válida'),
], validate, updateProfile);
router.post('/api/auth/logout', authMiddleware, logout);

router.get('/api/users', authMiddleware, adminMiddleware, getAllUsers);
router.get('/api/users/:id', authMiddleware, adminMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(userExists),
], validate, getUserById);
router.post('/api/users', authMiddleware, adminMiddleware, [
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
  body('profile.first_name').optional().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres').matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),
  body('profile.last_name').optional().isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres').matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/).withMessage('El apellido solo puede contener letras'),
  body('profile.biography').optional().isLength({ max: 500 }).withMessage('La biografía no puede superar 500 caracteres'),
  body('profile.avatar_url').optional().isURL().withMessage('La URL del avatar no es válida'),
], validate, createUser);
router.put('/api/users/:id', authMiddleware, adminMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(userExists),
  body('username').optional().isLength({ min: 3, max: 20 }).withMessage('El username debe tener entre 3 y 20 caracteres').matches(/^[a-zA-Z0-9]+$/).withMessage('El username solo puede contener letras y números'),
  body('email').optional().isEmail().withMessage('El email no tiene formato válido'),
  body('role').optional().isIn(['user', 'admin']).withMessage('El rol no es válido'),
], validate, updateUser);
router.delete('/api/users/:id', authMiddleware, adminMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(userExists),
], validate, deleteUser);

router.post('/api/tags', authMiddleware, adminMiddleware, [
  body('name')
    .isLength({ min: 2, max: 30 }).withMessage('El nombre debe tener entre 2 y 30 caracteres')
    .matches(/^[^\s]+$/).withMessage('El nombre no debe contener espacios')
    .custom(async (value) => {
      const tag = await Tag.findOne({ where: { name: value } });
      if (tag) throw new Error('La etiqueta ya existe');
      return true;
    }),
], validate, createTag);
router.get('/api/tags', authMiddleware, getAllTags);
router.get('/api/tags/:id', authMiddleware, adminMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(tagExists),
], validate, getTagById);
router.put('/api/tags/:id', authMiddleware, adminMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(tagExists),
  body('name')
    .isLength({ min: 2, max: 30 }).withMessage('El nombre debe tener entre 2 y 30 caracteres')
    .matches(/^[^\s]+$/).withMessage('El nombre no debe contener espacios'),
], validate, updateTag);
router.delete('/api/tags/:id', authMiddleware, adminMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(tagExists),
], validate, deleteTag);

router.post('/api/articles', authMiddleware, [
  body('title').isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('content').isLength({ min: 50 }).withMessage('El contenido debe tener mínimo 50 caracteres'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('El extracto no puede superar 500 caracteres'),
  body('status').optional().isIn(['published', 'archived']).withMessage('El estado no es válido'),
  body('user_id').optional().custom(async (value, { req }) => {
    if (req.user.role !== 'admin' && Number(value) !== Number(req.user.id)) {
      throw new Error('El user_id debe coincidir con el usuario autenticado');
    }
    await userExists(value);
    return true;
  }),
  body('tags').optional().isArray({ min: 1 }).withMessage('Los tags deben ser un arreglo'),
  body('tags.*').optional().isInt({ min: 1 }).withMessage('Cada tag debe ser un ID válido'),
], validate, createArticle);
router.get('/api/articles', authMiddleware, [
  query('status').optional().isIn(['published', 'archived']).withMessage('El status no es válido'),
], validate, getPublishedArticles);
router.get('/api/articles/:id', authMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(articleExists),
], validate, getArticleById);
router.get('/api/articles/user', authMiddleware, getUserArticles);
router.get('/api/articles/user/:id', authMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(async (value, { req }) => {
    if (req.user.role !== 'admin' && Number(value) !== Number(req.user.id)) {
      throw new Error('Solo puedes ver tus propios artículos');
    }
    await userExists(value);
    return true;
  }),
], validate, getUserArticleById);
router.put('/api/articles/:id', authMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(articleExists),
  body('title').optional().isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('content').optional().isLength({ min: 50 }).withMessage('El contenido debe tener mínimo 50 caracteres'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('El extracto no puede superar 500 caracteres'),
  body('status').optional().isIn(['published', 'archived']).withMessage('El estado no es válido'),
  body('tags').optional().isArray({ min: 1 }).withMessage('Los tags deben ser un arreglo'),
  body('tags.*').optional().isInt({ min: 1 }).withMessage('Cada tag debe ser un ID válido'),
], validate, updateArticle);
router.delete('/api/articles/:id', authMiddleware, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(async (value, { req }) => {
    const article = await Article.findByPk(value);
    if (!article) throw new Error('El artículo no existe');
    if (req.user.role !== 'admin' && Number(article.user_id) !== Number(req.user.id)) {
      throw new Error('Solo el autor o admin pueden eliminar este artículo');
    }
    return true;
  }),
], validate, deleteArticle);

router.post('/api/articles-tags', authMiddleware, [
  body('article_id').isInt({ min: 1 }).withMessage('article_id inválido').custom(articleExists),
  body('tag_id').isInt({ min: 1 }).withMessage('tag_id inválido').custom(tagExists),
  body('article_id').custom(async (value, { req }) => {
    const article = await Article.findByPk(value);
    if (!article) return true;
    if (req.user.role !== 'admin' && Number(article.user_id) !== Number(req.user.id)) {
      throw new Error('Solo el autor o admin pueden asociar etiquetas');
    }
    return true;
  }),
], validate, addTagToArticle);
router.delete('/api/articles-tags/:articleTagId', authMiddleware, [
  param('articleTagId').isInt({ min: 1 }).withMessage('ID inválido'),
  param('articleTagId').custom(async (value, { req }) => {
    const relation = await ArticleTag.findByPk(value, { include: [{ model: Article, as: 'article' }] });
    if (!relation) throw new Error('La relación artículo-etiqueta no existe');
    if (req.user.role !== 'admin' && Number(relation.article.user_id) !== Number(req.user.id)) {
      throw new Error('Solo el autor o admin pueden quitar etiquetas');
    }
    return true;
  }),
], validate, removeTagFromArticle);

export default router;
