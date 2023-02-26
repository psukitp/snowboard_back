const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    password: 'Qweasdzxcrfv22',
    host: 'localhost',
    port: 5432,
    database: 'snowboard_db'
})

module.exports = pool;