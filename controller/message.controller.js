const db = require('../db');

class MessageController {
    async getSenders(req, res) {
        try {
            const { creator_id } = req.body;
            const senders = await db.query(`SELECT user_id FROM chat WHERE creator_id=${creator_id} and user_id !=${creator_id} `);
            let users = '';
            for (let ind = 0; ind < senders.rowCount; ind++) {
                if (senders.rows[ind].user_id > 0) {
                    users = users + String(senders.rows[ind].user_id) + ',';
                }
            }
            const sendersFull = await db.query(`SELECT user_id, login, user_image_path FROM users_list WHERE user_id in (${users.slice(0, -1)})`)
            res.send(sendersFull.rows);
        } catch (e) {
            console.log(e)
        }
    }

    async getHistory(req, res) {
        try {
            const { creator, user } = req.body;
            const chat = await db.query(`SELECT chat_id FROM chat WHERE creator_id = ${creator} and user_id=${user}`)
            let historyData = []
            if (chat.rowCount > 0) {
                const history = await db.query(`SELECT message_id FROM chat_message_con WHERE chat_id = ${chat.rows[0].chat_id}`);
                if (history.rowCount > 0) {
                    for (let i = 0; i < history.rowCount; i++) {
                        const messageToSend = await db.query(`SELECT * FROM message WHERE message_id = ${history.rows[i].message_id}`);
                        historyData.push({
                            id: messageToSend.rows[0].message_id,
                            user: messageToSend.rows[0].sender_id,
                            message: messageToSend.rows[0].message
                        }
                        )
                    }
                }
            } else {
                await db.query(`INSERT into chat (creator_id, user_id) values ($1, $2)`, [creator, user])
            }
            console.log(historyData)
            res.send(historyData)
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = new MessageController();