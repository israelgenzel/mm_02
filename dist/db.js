// const pg = require('pg');
// const { Pool } = pg;
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'mm_db',
//     password: 'igll3573',
//     port: 5432, // ברירת מחדל של PostgreSQL
// });
// module.exports = { pool };


const pg = require('pg');
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});
module.exports = { pool };
