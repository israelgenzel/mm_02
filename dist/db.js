const pg = require('pg');
const { Pool } = pg;
const isPro = process.env.IS_PRO;
let pool ;
console.log(process.env.IS_PRO);
if (isPro==false) {
  console.log("Running locally");
  pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mm_db',
    password: 'igll3573',
    port: 5432, // ברירת מחדל של PostgreSQL
});
} else {
  console.log("Running on the server");
    pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});
}


module.exports = { pool };
