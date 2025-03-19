import { Pool } from 'pg';
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mm_db',
    password: 'igll3573',
    port: 5432, // ברירת מחדל של PostgreSQL
});
export { pool };
