import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Tag = sequelize.define(
  'Tag',
  {
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [2, 30],
          msg: 'El nombre de la etiqueta debe tener entre 2 y 30 caracteres.',
        },
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    underscored: true,
  }
);