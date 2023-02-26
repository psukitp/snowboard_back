const db = require('../db')

class EventController {
    getDateNow() {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;
        return today;
    }

    async createEvent(req, res) {
        console.log(req.body);
        const { creator_id, event_title, event_description, event_date} = req.body;
        const newEvent = await db.query(`INSERT INTO event (creator_id, event_title, event_description, event_date) values ($1, $2, $3, $4) RETURNING *`, [creator_id, event_title, event_description, event_date])
        console.log('accepted')
        res.json(newEvent.rows)
    }
    async getEvents(req, res) {
        const events = await db.query(`SELECT * FROM event`)
        console.log('sended');
        res.header({
            'Access-Control-Allow-Origin': '*'
        });
        res.send(events.rows);
    }
    async getOneEvent(req, res) {

    }
    async updateEvent(req, res) {

    }
    async deleteEvent(req, res) {

    }
}

module.exports = new EventController();