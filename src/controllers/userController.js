import { User, Profile, Article, ArticleTag, Tag } from '../models/Relations.models.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Profile,
        as: 'profile',
      }],
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar usuarios', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [
        { model: Profile, as: 'profile' },
        {
          model: Article,
          as: 'articles',
          include: [{ model: Tag, as: 'tags' }],
        },
      ],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener usuario', error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { username, email, password, role, profile } = req.body;

    const user = await User.create({ username, email, password, role });

    if (profile) {
      await Profile.create({
        user_id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        biography: profile.biography,
        avatar_url: profile.avatar_url,
        birth_date: profile.birth_date,
      });
    }

    const createdUser = await User.findByPk(user.id, {
      include: [{ model: Profile, as: 'profile' }],
      attributes: { exclude: ['password'] },
    });

    return res.status(201).json(createdUser);
  } catch (error) {
    return res.status(400).json({ message: 'Error al crear usuario', error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, profile } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.update({ username, email, role });

    if (profile) {
      await user.getProfile();
      const existingProfile = await user.getProfile();

      if (existingProfile) {
        await existingProfile.update(profile);
      } else {
        await Profile.create({ user_id: user.id, ...profile });
      }
    }

    const updatedUser = await User.findByPk(id, {
      include: [{ model: Profile, as: 'profile' }],
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(400).json({ message: 'Error al actualizar usuario', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await user.destroy();

    return res.status(200).json({ message: 'Usuario eliminado lógicamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};
