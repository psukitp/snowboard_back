require("dotenv").config();
const db = require('../db')
const bcrypt = require('bcrypt')
const uuid = require('uuid');
const mailService = require('./mail-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const { UnauthorizedError } = require("../exceptions/api-error");

class UserService {
    async registration(login, name, email, password) {
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()


        const user = await db.query(`INSERT INTO users_list (name, email, user_hash_password, activation_link, login) values ($1, $2, $3, $4, $5) RETURNING *`, [name, email, hashPassword, activationLink, login])
        await mailService.senActivationMail(email, `${process.env.API_URL}/activate/${activationLink}`);

        const lastValue = await db.query(`SELECT * FROM users_list WHERE user_id = (SELECT max(user_id) FROM users_list)`)
        const newId = lastValue.rows[0].user_id;
        const isActivated = lastValue.rows[0].is_activated;
        const userDto = new UserDto(login, name, email, newId, isActivated)

        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }


    async activate(activationLink) {
        const user = await db.query(`SELECT * FROM users_list WHERE activation_link='${activationLink}'`);
        if (!user) {
            throw ApiError.BadRequest('Некорректная ссылка активации')
        }
        const updateUser = await db.query(`UPDATE users_list SET is_activated=true WHERE activation_link='${activationLink}'`)
    }


    async login(emailin, password) {
        const user = await db.query(`SELECT * FROM users_list WHERE email='${emailin}'`)
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const {login, name, user_hash_password, email, user_id, is_activated, user_image_path} = user.rows[0]
        const isPassEquals = await bcrypt.compare(password, user_hash_password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        const userDto = new UserDto(login, name, email, user_id, is_activated, user_image_path);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken).id;
        const tokenFromDB = await tokenService.findToken(refreshToken);
        if (!tokenFromDB || !tokenFromDB) {
            throw ApiError.UnauthorizedError();
        }
        const user = await db.query(`SELECT * FROM users_list WHERE user_id=${userData}`)
        const {login, name, email, is_activated, user_image_path} = user.rows[0];
        const userDto = new UserDto(login, name, email, userData, is_activated, user_image_path);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.removeToken(refreshToken);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }

    }
}

module.exports = new UserService();