const db = require('../db')

class CommentController {


    async addCommentToEvent(req, res) {
        try {
            const { creator_id, event_id, comment_text } = req.body;
            let today = new Date();
            const dd = String(today.getDate());
            const mm = String(today.getMonth() + 1);
            const yyyy = today.getFullYear();
            today = dd + '.' + (mm.length < 2 ? '0'+mm : mm) + '.' + yyyy;
            const newComment = await db.query(`INSERT INTO event_comment (creator_id, comment_date, comment_text) values ($1, $2, $3)`, [creator_id, today, comment_text]);
            const lastValue = await db.query(`SELECT * FROM event_comment WHERE event_comment_id = (SELECT max(event_comment_id) FROM event_comment)`)
            const newCommentId = lastValue.rows[0].event_comment_id;

            const newConnection = await db.query(`INSERT INTO event_comment_con (event_id, comment_id) values ($1, $2)`, [event_id, newCommentId]);
        } catch (e) {
            console.log(e)
        }
    }


    async getComments(req, res) {
        try {
            const event_id = req.params.event_id;
            const allCommentsToEvent = await db.query(`SELECT event_id, comment_id, creator_id, comment_date,comment_text, user_id, name, s_name FROM
        (SELECT * FROM event_comment_con t1 
        INNER JOIN event_comment t2 ON t1.comment_id = t2.event_comment_id
        INNER JOIN users_list t3 ON t2.creator_id = t3.user_id) AS newtable
        WHERE event_id = ${event_id} 
        `);
            res.send(allCommentsToEvent.rows)
        } catch (e) {
            console.log(e)
        }
    }
}

module.exports = new CommentController();