const express = require('express');
const { getUserInfo, updateUserInfo } = require('../controllers/users');
const { updateUserInfoValidator } = require('../utils/validators');

const usersRouter = express.Router();

usersRouter.get('/me', getUserInfo);

usersRouter.patch('/me', updateUserInfoValidator, updateUserInfo);

module.exports = { usersRouter };
