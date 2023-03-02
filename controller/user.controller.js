const db = require('../db');
const userService = require('../service/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

class UserController {
    async getUsers(req, res) {
        const users = await db.query(`SELECT * FROM users_list`)
        res.send(users.rows);
    }

    async registration(req, res, next) {
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return next(ApiError.BadRequest('Ошибка валидации', errors.array()))
        // }
        const {name, sname, email, password } = req.body;
        console.log(req.body)
        const userData = await userService.registration(name, sname, email, password);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        return res.json(userData)
    }

    async login(req, res, next) {
        console.log('Я тут')
        const { email, password } = req.body;
        const userData = await userService.login(email, password);
        console.log(userData.user)

        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        return res.json(userData)
    }

    async logout(req, res, next) {
        const { refreshToken } = req.cookies;
        const token = await userService.logout(refreshToken);
        res.clearCookie('refreshToken');
        return res.json(token);
    }

    async activate(req, res, next) {
        const activationLink = req.params.link;
        await userService.activate(activationLink);
        return res.redirect(process.env.CLIENT_URL)
    }

    async refresh(req, res, next) {
        const { refreshToken } = req.cookies;
        console.log(refreshToken)
        const userData = await userService.refresh(refreshToken);
        res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
        res.send(userData);
    }

    async getUsers(req, res, next) {

    }
}

module.exports = new UserController();