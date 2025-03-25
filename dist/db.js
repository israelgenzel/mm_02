const pg = require('pg');
const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mm_db',
    password: 'igll3573',
    port: 5432, // ברירת מחדל של PostgreSQL
});
module.exports = { pool };
