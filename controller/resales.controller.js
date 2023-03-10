const db = require('../db')

class ResalesController {


    async createResale(req, res) {

    }

    async getResales(req, res) {
        try {
            const events = await db.query(`SELECT * FROM ad_post`)
            res.header({
                'Access-Control-Allow-Origin': '*'
            });

            res.send(events.rows);
        } catch (e) {
            console.log(e)
        }
    }

    async getOneResale(req, res) {

    }
    async updateResale(req, res) {

    }
    async deleteResale(req, res) {

    }
}

module.exports = new ResalesController();