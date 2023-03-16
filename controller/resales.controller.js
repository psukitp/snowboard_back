const db = require('../db')

class ResalesController {


    async createResale(req, res) {
        try {
            const { creator_id, resale_title, resale_description, resale_price, resale_type, resale_tel } = req.body;
            await db.query(`INSERT INTO ad_post (creator_id, post_name, post_text, price, ad_product_type, ad_telephone) values ($1, $2, $3, $4, $5, $6) RETURNING *`, [Number(creator_id), resale_title, resale_description, resale_price, Number(resale_type), resale_tel])


            const lastValue = await db.query(`SELECT lastval()`)
            const newId = lastValue.rows[0].lastval;
            switch (Number(resale_type)) {
                case 1:
                    await db.query(`INSERT INTO board_property (ad_post_id, board_size, board_deflection, board_flex) values ($1, $2, $3, $4)`, [Number(newId), Number(req.body.length), req.body.deflection, Number(req.body.flex)])
                    break
                case 3:
                    await db.query(`INSERT INTO shoes_property (ad_post_id, shoe_size, shoe_flex) values ($1, $2, $3)`, [Number(newId), req.body.size, Number(req.body.flex)])
                    break
                case 4:
                    await db.query(`INSERT INTO binding_property (ad_post_id, binding_size, binding_flex) values ($1, $2, $3)`, [Number(newId), req.body.size, Number(req.body.flex)])
                    break
                case 5:
                    await db.query(`INSERT INTO clothes_property (ad_post_id, clothes_name, clothes_size) values ($1, $2, $3)`, [Number(newId), req.body.nameof, req.body.size])
                    break
                default:
                    break
            }

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
            let resales = await db.query(`SELECT ad_post_id, creator_id, post_name, post_text, ad_image_path, price, ad_product_type, ad_telephone, product_type_name FROM
            (SELECT * FROM ad_post t1 
            INNER JOIN product_type t2 ON t1.ad_product_type = t2.product_type_id ) AS newtable`)
            res.header({
                'Access-Control-Allow-Origin': '*'
            });

            let boardProp = await db.query(`SELECT * FROM board_property`);
            let bindingProp = await db.query(`SELECT * FROM binding_property`);
            let clothesProp = await db.query(`SELECT * FROM clothes_property`);
            let shoesProp = await db.query(`SELECT * FROM shoes_property`);

            for (let i = 0; i < resales.rowCount; i++) {
                let res = boardProp.rows.find(({ ad_post_id }) => ad_post_id === resales.rows[i].ad_post_id);
                if (res !== undefined) {
                    Object.assign(resales.rows[i], res)
                }
                res = bindingProp.rows.find(({ ad_post_id }) => ad_post_id === resales.rows[i].ad_post_id);
                if (res !== undefined) {
                    Object.assign(resales.rows[i], res)
                }
                res = clothesProp.rows.find(({ ad_post_id }) => ad_post_id === resales.rows[i].ad_post_id);
                if (res !== undefined) {
                    Object.assign(resales.rows[i], res)
                }
                res = shoesProp.rows.find(({ ad_post_id }) => ad_post_id === resales.rows[i].ad_post_id);
                if (res !== undefined) {
                    Object.assign(resales.rows[i], res)
                }
            }
            res.send(resales.rows);
        } catch (e) {
            console.log(e)
        }
    }

    async getProductTypes(req, res) {
        try {
            const types = await db.query(`SELECT * FROM product_type`)
            res.header({
                'Access-Control-Allow-Origin': '*'
            });
            res.send(types.rows);
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