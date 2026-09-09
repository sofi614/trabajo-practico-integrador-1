import { Article, Tag, User, ArticleTag } from '../models/Relations.models.js';

export const createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, status, tags } = req.body;
    const userId = req.user.id;

    const article = await Article.create({
      title,
      content,
      excerpt,
      status,
      user_id: userId,
    });

    if (tags && tags.length > 0) {
      const tagRecords = await Tag.findAll({ where: { id: tags } });

      if (tagRecords.length > 0) {
        await article.addTags(tagRecords);
      }
    }

    const createdArticle = await Article.findByPk(article.id, {
      include: [{ model: Tag, as: 'tags' }],
    });

    return res.status(201).json(createdArticle);
  } catch (error) {
    return res.status(400).json({ message: 'Error al crear artículo', error: error.message });
  }
};

export const getPublishedArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'published' },
      include: [
        { model: User, as: 'author', attributes: { exclude: ['password'] } },
        { model: Tag, as: 'tags' },
      ],
    });

    return res.status(200).json(articles);
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar artículos', error: error.message });
  }
};

export const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id, {
      include: [
        { model: User, as: 'author', attributes: { exclude: ['password'] } },
        { model: Tag, as: 'tags' },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    return res.status(200).json(article);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener artículo', error: error.message });
  }
};

export const getUserArticles = async (req, res) => {
  try {
    const userId = req.user.id;

    const articles = await Article.findAll({
      where: { user_id: userId, status: 'published' },
      include: [{ model: Tag, as: 'tags' }],
    });

    return res.status(200).json(articles);
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar artículos del usuario', error: error.message });
  }
};

export const getUserArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const article = await Article.findOne({
      where: { id, user_id: userId },
      include: [{ model: Tag, as: 'tags' }],
    });

    if (!article) {
      return res.status(404).json({ message: 'Artículo no encontrado para este usuario' });
    }

    return res.status(200).json(article);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener artículo del usuario', error: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, status, tags } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    if (req.user.role !== 'admin' && Number(article.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'No tienes permisos para editar este artículo' });
    }

    await article.update({ title, content, excerpt, status });

    if (tags) {
      const tagRecords = await Tag.findAll({ where: { id: tags } });
      await article.setTags(tagRecords);
    }

    const updatedArticle = await Article.findByPk(id, {
      include: [{ model: Tag, as: 'tags' }],
    });

    return res.status(200).json(updatedArticle);
  } catch (error) {
    return res.status(400).json({ message: 'Error al actualizar artículo', error: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    if (req.user.role !== 'admin' && Number(article.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'No tienes permisos para eliminar este artículo' });
    }

    await article.destroy();
    return res.status(200).json({ message: 'Artículo eliminado lógicamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar artículo', error: error.message });
  }
};

export const addTagToArticle = async (req, res) => {
  try {
    const { article_id, tag_id } = req.body;
    const article = await Article.findByPk(article_id);

    if (!article) {
      return res.status(404).json({ message: 'Artículo no encontrado' });
    }

    if (req.user.role !== 'admin' && Number(article.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Solo el autor o admin pueden asignar etiquetas' });
    }

    const tag = await Tag.findByPk(tag_id);
    if (!tag) {
      return res.status(404).json({ message: 'Etiqueta no encontrada' });
    }

    const [relation, created] = await ArticleTag.findOrCreate({
      where: { article_id, tag_id },
      defaults: { article_id, tag_id },
    });

    return res.status(created ? 201 : 200).json(relation);
  } catch (error) {
    return res.status(400).json({ message: 'Error al asociar etiqueta', error: error.message });
  }
};

export const removeTagFromArticle = async (req, res) => {
  try {
    const { articleTagId } = req.params;
    const relation = await ArticleTag.findByPk(articleTagId, {
      include: [{ model: Article, as: 'article' }],
    });

    if (!relation) {
      return res.status(404).json({ message: 'Relación no encontrada' });
    }

    if (req.user.role !== 'admin' && Number(relation.article.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: 'Solo el autor o admin pueden quitar etiquetas' });
    }

    await relation.destroy();
    return res.status(200).json({ message: 'Etiqueta removida del artículo' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al remover etiqueta', error: error.message });
  }
};
