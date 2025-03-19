import express from 'express';
import { scrape } from './scraper.ts';
import { insertNewTransactions } from './db_api.ts';
const app = express();
const port = 3000;
// דף ברוך הבא
app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.get('/scrape', async (req, res) => {
    try {
        console.log('Scraping...');
        const data = await scrape(); // קריאה לפונקציה בסקריפט שלך
        console.log(data);
        console.log('json');
        if (data) {
            await insertNewTransactions(data); // קריאה לפונקציה שמכניסה את הנתונים לבסיס הנתונים
            res.json(data);
        }
        else {
            res.status(500).send('No data returned from scraping');
        }
    }
    catch (error) {
        console.error('Error while scraping', error);
        res.status(500).send(`Error while scraping: ${error.message}`);
    }
});
// שרת שמאזין על הפורט 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
