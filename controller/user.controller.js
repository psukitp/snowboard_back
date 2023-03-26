const db = require('../db');
const userService = require('../service/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw ApiError.BadRequest('Почта должна быть в формате ***@***.**, а пароль длиной не менее 5 символов')
            }
            const { login, name, email, password } = req.body;

            const userData = await userService.registration(login, name, email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })

            return res.json(userData)
        } catch (e) {
            res.json({
                code: e.status,
                message: e.message
            })
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password);

            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData)
        } catch (e) {
            return res.json(e)
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch {
            console.log(e);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            console.log(e);
        }
    }

    async refresh(req, res, next) {
        try {
            const { token } = req.body;
            const userData = await userService.refresh(token);
            res.send(userData);
        } catch (e) {
            console.log(e);
        }
    }

    async updateUser(req, res, next) {
        try {
            const { name, login, status } = req.body;
            const id = req.params.id;
            const newUser = await userService.updateUser(id, name, login, status);
            res.status(newUser.code)
            res.send(newUser);
        } catch (e) {
            console.log(e);
        }
    }

    async updateUserPhoto(req, res, next) {
        try {
            const id = req.params.id;
            const file = req.files.file;
            const updatedUser = await userService.updateUserPhoto(id, file);
            res.send(updatedUser);
        } catch (e) {
            console.log(e);
        }
    }

    async getUsers(req, res, next) {

    }
}

module.exports = new UserController();