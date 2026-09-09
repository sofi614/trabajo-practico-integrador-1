import { body, param } from 'express-validator';
import { Tag } from '../models/Relations.models.js';

const tagExists = async (value) => {
  const tag = await Tag.findByPk(value);
  if (!tag) throw new Error('La etiqueta no existe');
  return true;
};

export const createTagValidation = [
  body('name')
    .isLength({ min: 2, max: 30 }).withMessage('El nombre debe tener entre 2 y 30 caracteres')
    .matches(/^[^\s]+$/).withMessage('El nombre no debe contener espacios')
    .custom(async (value) => {
      const tag = await Tag.findOne({ where: { name: value } });
      if (tag) throw new Error('La etiqueta ya existe');
      return true;
    }),
];

export const tagIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  param('id').custom(tagExists),
];

export const updateTagValidation = [
  ...tagIdValidation,
  body('name')
    .isLength({ min: 2, max: 30 }).withMessage('El nombre debe tener entre 2 y 30 caracteres')
    .matches(/^[^\s]+$/).withMessage('El nombre no debe contener espacios'),
];

export const deleteTagValidation = tagIdValidation;
