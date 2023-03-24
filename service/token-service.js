const jwt = require('jsonwebtoken')
const db = require('../db')
require("dotenv").config();

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30d' })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' })
        return {
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData
        } catch (e) {
            return null
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData
        } catch (e) {
            console.log(e)
            return null
        }
    }

    async saveToken(userId, refreshToken) {
        const tokenData = await db.query(`SELECT * FROM token_model WHERE user_id = ${userId}`);
        if (tokenData) {
            tokenData.token = refreshToken;
        }
        const token = await db.query(`INSERT INTO token_model (user_id, token) values($1, $2)`, [userId, refreshToken])
        return token;
    }

    async removeToken(refreshToken) {
        const deleteToken = await db.query(`DELETE FROM token_model where token='${refreshToken}'`)
        return deleteToken;
    }

    async findToken(refreshToken) {
        const findedToken = await db.query(`SELECT * FROM token_model WHERE token='${refreshToken}'`)
        return findedToken;
    }
}

module.exports = new TokenService();