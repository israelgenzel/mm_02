"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
var pg_1 = require("pg");
var Pool = pg_1.default.Pool;
var pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'mm_db',
    password: 'igll3573',
    port: 5432, // ברירת מחדל של PostgreSQL
});
exports.pool = pool;
