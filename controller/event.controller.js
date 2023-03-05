const db = require('../db')

class EventController {


    async createEvent(req, res) {
        const { creator_id, event_title, event_description, event_date } = req.body;
        const newEvent = await db.query(`INSERT INTO event (creator_id, event_title, event_description) values ($1, $2, $3) RETURNING *`, [creator_id, event_title, event_description])

        const lastValue = await db.query(`SELECT lastval()`)
        const newId = lastValue.rows[0].lastval;

        const file = req.files.file;
        const fileType = file.mimetype.slice(6)
        const filePathToAdd = "./public/event_image/" + String(newId) + "." + fileType;
        file.mv(filePathToAdd)

        const filePathToGive = "/event_image/" + String(newId) + "." + fileType;

        await db.query(`UPDATE event SET event_image_path=$1 WHERE event_id=$2`, [String(filePathToGive), newId])

    }
    async getEvents(req, res) {
        const events = await db.query(`SELECT * FROM event`)
        res.header({
            'Access-Control-Allow-Origin': '*'
        });

        res.send(events.rows);
    }

    async getOneEvent(req, res) {
        const eventId = req.params.id;
        const event = await db.query(`SELECT * FROM event WHERE event_id=${eventId}`);
        const event_creator_id = event.rows[0].creator_id;
        const event_creator_name = await db.query(`SELECT name, s_name FROM users_list WHERE user_id=${event_creator_id}`);
        event.rows[0].name = event_creator_name.rows[0].name;
        event.rows[0].s_name = event_creator_name.rows[0].s_name;
        res.send(event.rows[0]);
    }
    async updateEvent(req, res) {

    }
    async deleteEvent(req, res) {

    }
}

module.exports = new EventController();