const db = require('../db')

class ResalesController {


    async createResale(req, res) {
        try {
            const { creator_id, resale_title, resale_description, resale_price, resale_type, resale_tel } = req.body;
            const newEvent = await db.query(`INSERT INTO ad_post (creator_id, post_name, post_text, price, ad_product_type, ad_telephone) values ($1, $2, $3, $4, $5, $6) RETURNING *`, [creator_id, resale_title, resale_description, resale_price, resale_type, resale_tel])

            const lastValue = await db.query(`SELECT lastval()`)
            const newId = lastValue.rows[0].lastval;

            let filePathToGive = '';
            if (req.files !== null) {
                const file = req.files.file;
                const fileType = file.mimetype.slice(6)
                const filePathToAdd = "./public/ad_image/" + String(newId) + "." + fileType;
                file.mv(filePathToAdd)

                filePathToGive = "/ad_image/" + String(newId) + "." + fileType;
            } else {
                filePathToGive = "/ad_image/standard.jpeg"
            }

            await db.query(`UPDATE ad_post SET ad_image_path=$1 WHERE ad_post_id=$2`, [String(filePathToGive), newId])
            res.send('done');
        } catch (e) {
            console.log(e)
        }
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