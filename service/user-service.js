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
        // await mailService.senActivationMail(email, `${process.env.API_URL}/activate/${activationLink}`);

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
        const { login, name, user_hash_password, email, user_id, is_activated, user_image_path, status } = user.rows[0]
        const isPassEquals = await bcrypt.compare(password, user_hash_password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        const userDto = new UserDto(login, name, email, user_id, is_activated, user_image_path, status);
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
            // throw ApiError.UnauthorizedError();
            return {message: 'Не пришел токен'}
        }
        const userData = tokenService.validateRefreshToken(refreshToken).id;
        const tokenFromDB = await tokenService.findToken(refreshToken);
        if (!tokenFromDB) {
            // throw ApiError.UnauthorizedError();
            return {message: 'не нашелся токен в дб'}
        }
        const user = await db.query(`SELECT * FROM users_list WHERE user_id=${userData}`)
        const { login, name, email, is_activated, user_image_path, status } = user.rows[0];
        const userDto = new UserDto(login, name, email, userData, is_activated, user_image_path, status);
        const tokens = tokenService.generateTokens({ ...userDto });
        await tokenService.removeToken(refreshToken);
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async updateUser(user_id, user_name, user_login, user_status) {
        try {
            if (user_login !== '') {
                const loginCheck = await db.query(`SELECT * FROM users_list WHERE login='${user_login}'`)
                if (loginCheck.rowCount > 0) {
                    throw ApiError.LoginExist();
                }
            }
            const currentUser = await db.query(`SELECT name, login, status FROM users_list WHERE user_id=${user_id}`)
            const user_name_exist = user_name === '' ? currentUser.rows[0].name : user_name;
            const user_status_exist = user_status === '' ? currentUser.rows[0].status : user_status;
            const user_login_exist = user_login === '' ? currentUser.rows[0].login : user_login;
            await db.query(`UPDATE users_list SET name='${user_name_exist}', login='${user_login_exist}', status='${user_status_exist}' WHERE user_id = ${user_id}`)
            const user = await db.query(`SELECT name, status, user_image_path, login FROM users_list WHERE user_id=${user_id}`)
            const { login, name, email, id, is_activated, user_image_path, status } = user.rows[0];

            const userDto = new UserDto(login, name, email, id, is_activated, user_image_path, status)

            return {
                ...userDto,
                code: 200
            };
        } catch (e) {
            return { code: e.status, message: e.message };
        }
    }

    async updateUserPhoto(id, file) {
        try {
            let filePathToGive = '';
            const fileType = file.mimetype.slice(6)
            const filePathToAdd = "./public/user_image/" + String(id) + "." + fileType;
            file.mv(filePathToAdd)
            filePathToGive = "/user_image/" + String(id) + "." + fileType;

            await db.query(`UPDATE users_list SET user_image_path=$1 WHERE user_id=$2`, [String(filePathToGive), id])

            const user = await db.query(`SELECT * FROM users_list WHERE user_id=${id}`);

            const { login, name, email, user_id, is_activated, user_image_path, status } = user.rows[0];

            const userDto = new UserDto(login, name, email, user_id, is_activated, user_image_path, status)

            return userDto;
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new UserService();