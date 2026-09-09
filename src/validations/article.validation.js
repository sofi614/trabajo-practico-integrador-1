import { body, param, query } from 'express-validator';
import { Article, ArticleTag, Tag, User } from '../models/Relations.models.js';

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

export const createArticleValidation = [
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
];

export const listArticlesValidation = [
  query('status').optional().isIn(['published', 'archived']).withMessage('El status no es válido'),
];

export const articleIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(articleExists),
];

export const userArticlesValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(async (value, { req }) => {
    if (req.user.role !== 'admin' && Number(value) !== Number(req.user.id)) {
      throw new Error('Solo puedes ver tus propios artículos');
    }
    await userExists(value);
    return true;
  }),
];

export const updateArticleValidation = [
  ...articleIdValidation,
  body('title').optional().isLength({ min: 3, max: 200 }).withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('content').optional().isLength({ min: 50 }).withMessage('El contenido debe tener mínimo 50 caracteres'),
  body('excerpt').optional().isLength({ max: 500 }).withMessage('El extracto no puede superar 500 caracteres'),
  body('status').optional().isIn(['published', 'archived']).withMessage('El estado no es válido'),
  body('tags').optional().isArray({ min: 1 }).withMessage('Los tags deben ser un arreglo'),
  body('tags.*').optional().isInt({ min: 1 }).withMessage('Cada tag debe ser un ID válido'),
];

export const deleteArticleValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(async (value, { req }) => {
    const article = await Article.findByPk(value);
    if (!article) throw new Error('El artículo no existe');
    if (req.user.role !== 'admin' && Number(article.user_id) !== Number(req.user.id)) {
      throw new Error('Solo el autor o admin pueden eliminar este artículo');
    }
    return true;
  }),
];

export const addTagValidation = [
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
];

export const removeTagValidation = [
  param('articleTagId').isInt({ min: 1 }).withMessage('ID inválido'),
  param('articleTagId').custom(async (value, { req }) => {
    const relation = await ArticleTag.findByPk(value, { include: [{ model: Article, as: 'article' }] });
    if (!relation) throw new Error('La relación artículo-etiqueta no existe');
    if (req.user.role !== 'admin' && Number(relation.article.user_id) !== Number(req.user.id)) {
      throw new Error('Solo el autor o admin pueden quitar etiquetas');
    }
    return true;
  }),
];
