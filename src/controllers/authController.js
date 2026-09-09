import { User, Profile } from '../models/Relations.models.js';
import { generateToken } from '../helpers/jwt.helper.js';
import { hashPassword, comparePassword } from '../helpers/bcrypt.helper.js';

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  try {
    const { username, email, password, role = 'user', profile } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: passwordHash,
      role,
    });

    if (profile) {
      await Profile.create({
        user_id: user.id,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        biography: profile.biography || null,
        avatar_url: profile.avatar_url || null,
        birth_date: profile.birth_date || null,
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    const responseUser = await User.findByPk(user.id, {
      include: [{ model: Profile, as: 'profile' }],
      attributes: { exclude: ['password'] },
    });

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: responseUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Profile, as: 'profile' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Profile, as: 'profile' }],
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener perfil', error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name, biography, avatar_url, birth_date } = req.body;

    const user = await User.findByPk(req.user.id, {
      include: [{ model: Profile, as: 'profile' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (!user.profile) {
      await Profile.create({
        user_id: user.id,
        first_name,
        last_name,
        biography,
        avatar_url,
        birth_date,
      });
    } else {
      await user.profile.update({
        first_name,
        last_name,
        biography,
        avatar_url,
        birth_date,
      });
    }

    const updatedUser = await User.findByPk(req.user.id, {
      include: [{ model: Profile, as: 'profile' }],
      attributes: { exclude: ['password'] },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar perfil', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    return res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
  }
};
