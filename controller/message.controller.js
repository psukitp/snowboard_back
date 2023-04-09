const db = require('../db');

class MessageController {
    async getSenders(req, res) {
        try {
            const { creator_id } = req.body;
            const senders = await db.query(`SELECT user_id FROM chat WHERE creator_id=${creator_id} and user_id !=${creator_id} `);
            console.log(senders.rows[0].user_id)
            let users = '';
            for (let ind = 0; ind < senders.rowCount; ind++) {
                if (senders.rows[ind].user_id > 0) {
                    users = users + String(senders.rows[ind].user_id) + ',';
                }
            }
            const sendersFull = await db.query(`SELECT user_id, login, user_image_path FROM users_list WHERE user_id in (${users.slice(0,-1)})`)
            console.log(sendersFull.rows)
            res.send(sendersFull.rows);
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new MessageController();