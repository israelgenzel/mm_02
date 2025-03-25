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


const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
});

module.exports = pool;
