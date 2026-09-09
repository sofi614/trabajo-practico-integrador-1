import express from 'express';
import authRouter from './auth.routes.js';
import userRouter from './user.routes.js';
import tagRouter from './tag.routes.js';
import articleRouter, { articleTagRouter } from './article.routes.js';

const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ ok: true }));
router.use('/api/auth', authRouter);
router.use('/api/users', userRouter);
router.use('/api/tags', tagRouter);
router.use('/api/articles', articleRouter);
router.use('/api/articles-tags', articleTagRouter);

export default router;
