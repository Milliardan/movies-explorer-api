const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { User } = require('../models/user');
const { ConflictError, NotFoundError, UnauthorizedError } = require('../errors');
const { handleMongooseError } = require('../utils/handleMongooseError');
const { ERROR_MESSAGES } = require('../utils/constants');

const configDefault = require('../utils/configDefault');

const { JWT_SECRET = configDefault.JWT_SECRET } = process.env;
const { SALT_LENGTH = configDefault.SALT_LENGTH } = process.env;

async function createUser(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const passwordHash = await bcrypt.hash(password, +SALT_LENGTH);

    let user = await User.create({
      email,
      password: passwordHash,
      name,
    });

    user = user.toObject();
    delete user.password;
    res.status(201).send(user);
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError(ERROR_MESSAGES.USER_CONFLICT));
      return;
    }

    if (err instanceof mongoose.Error) {
      next(handleMongooseError(err));
      return;
    }

    next(err);
  }
}

async function getUserInfo(req, res, next) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    res.send(user);
  } catch (err) {
    next(err);
  }
}

async function updateUserInfo(req, res, next) {
  try {
    const userId = req.user._id;
    const { email, name } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { email, name },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    res.send(user);
  } catch (err) {
    if (err.code === 11000) {
      next(new ConflictError(ERROR_MESSAGES.USER_CONFLICT));
      return;
    }

    if (err instanceof mongoose.Error) {
      next(handleMongooseError(err));
      return;
    }

    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError(ERROR_MESSAGES.WRONG_CREDENTIALS);
    }

    const hasRightPassword = await bcrypt.compare(password, user.password);

    if (!hasRightPassword) {
      throw new UnauthorizedError(ERROR_MESSAGES.WRONG_CREDENTIALS);
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: '7d',
      },
    );

    res.send({ token });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  return res.cookie('jwt', { expires: Date.now() }).send({ message: 'Token was deleted from cookies.' });
}

module.exports = {
  getUserInfo,
  updateUserInfo,
  createUser,
  login,
  logout,
};
