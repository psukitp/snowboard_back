const db = require('../db')

class EventController {


    async createEvent(req, res) {
        try {
            const { creator_id, event_title, event_description, event_date } = req.body;
            const newEvent = await db.query(`INSERT INTO event (creator_id, event_title, event_description, event_date) values ($1, $2, $3, $4) RETURNING *`, [creator_id, event_title, event_description, event_date])


            const lastValue = await db.query(`SELECT lastval()`)
            const newId = lastValue.rows[0].lastval;

            let filePathToGive = '';
            if (req.files !== null) {
                const file = req.files.file;
                const fileType = file.mimetype.slice(6)
                const filePathToAdd = "./public/event_image/" + String(newId) + "." + fileType;
                file.mv(filePathToAdd)

                filePathToGive = "/event_image/" + String(newId) + "." + fileType;
            } else {
                filePathToGive = "/event_image/standard.jpeg"
            }

            await db.query(`UPDATE event SET event_image_path=$1 WHERE event_id=$2`, [String(filePathToGive), newId])
            res.send('done');
        } catch (e) {
            console.log(e)
        }

    }
    async getEvents(req, res) {
        try {
            const events = await db.query(`SELECT * FROM event`)
            res.header({
                'Access-Control-Allow-Origin': '*'
            });

            res.send(events.rows);
        } catch (e) {
            console.log(e)
        }
    }

    async getOneEvent(req, res) {
        try {
            const eventId = req.params.id;
            const event = await db.query(`SELECT * FROM event WHERE event_id=${eventId}`);
            const event_creator_id = event.rows[0].creator_id;
            const event_creator_name = await db.query(`SELECT name, s_name FROM users_list WHERE user_id=${event_creator_id}`);
            event.rows[0].name = event_creator_name.rows[0].name;
            event.rows[0].s_name = event_creator_name.rows[0].s_name;
            res.send(event.rows[0]);
        } catch (e) {
            console.log(e);
        }
    }
    async updateEvent(req, res) {
        try {
            const eventId = req.params.id;
            const { title, description } = req.body;
            await db.query(`UPDATE event SET event_title='${title}', event_description='${description}' WHERE event_id = ${eventId}`)
            const event = await db.query(`SELECT * FROM event WHERE event_id=${eventId}`)
            const event_creator_id = event.rows[0].creator_id;
            const event_creator_name = await db.query(`SELECT name, s_name FROM users_list WHERE user_id=${event_creator_id}`);
            event.rows[0].name = event_creator_name.rows[0].name;
            event.rows[0].s_name = event_creator_name.rows[0].s_name;
            res.send(event.rows[0]);
        } catch (e) {
            console.log(e);
        }
    }

    async getDateStatisticEvent(req, res) {
        try {
            const events = await db.query(`SELECT event_date, count(event_date) as event_count
            FROM event WHERE NOT event_date IS NULL AND NOT event_date = ''
            GROUP BY event_date`);
            res.send(events.rows)
        } catch (e) {
            console.log(e);
        }
    }

    async deleteEvent(req, res) {

    }
}

module.exports = new EventController();