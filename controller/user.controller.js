const db = require('../db')

class UserController {
    async createUser(req, res) {
        const { name, s_name, user_hash_password} = req.body;
        const newPerson = await db.query(`INSERT INTO users_list (name, s_name, user_hash_password) values ($1, $2, $3) RETURNING *`, [name, s_name, user_hash_password])
        res.json(newPerson.rows)
    }
    async getUsers(req, res) {
        const users = await db.query(`SELECT * FROM users_list`)
        res.send(users.rows);
    }
    async getOneUser(req, res) {

    }
    async updateUser(req, res) {

    }
    async deleteUser(req, res) {

    }
}

module.exports = new UserController();