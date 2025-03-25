const {pool} = require("./db.js");
const fs = require("fs");

async function initializeDb() {
    try {
        // טוען את קובץ ה-SQL
        const schema = fs.readFileSync("schema.sql", "utf8");
        
        const client = await pool.connect();
        client.query(schema)
        // מריץ את ה-SQL במסד הנתונים
        
        console.log("✅ Database schema initialized successfully!");

        // סוגר את החיבור
        await pool.end();
    } catch (error) {
        console.error("❌ Error initializing database:", error);
    }
}

module.exports = {initializeDb};
