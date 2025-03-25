const express = require('express');
const { scrape } = require('./scraper.js');
const { CompanyTypes } = require('israeli-bank-scrapers');
// const updateNotifier = require('update-notifier');
// const pkg = require('./package.json');
const app = express();
const port = 3000;
// דף ברוך הבא
app.get('/', (req, res) => {
    res.send('Hello, world!');
});
app.get('/scrape', async (req, res) => {
    try {
        console.log('Scraping...');
        const data = await scrape(CompanyTypes.hapoalim, new Date('01-01-25')); // קריאה לפונקציה בסקריפט שלך
        console.log(data);
        console.log('json');
        if (data) {
            // await insertNewTransactions(data); // קריאה לפונקציה שמכניסה את הנתונים לבסיס הנתונים
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
// Check for updates
//updateNotifier.default.
// updateNotifier( pkg ).notify();
// const notifier = updateNotifier({ pkg });
// if (notifier.update) {
//     console.log(`*update*      ⚠️ יש עדכון זמין: ${notifier.update.latest}`);
//     console.log("עדכן עם: npm update או npm install -g <package>");
// }
// else {
//     console.log('*update*    אין עדכונים זמינים');
// }
//main();
// just for testing
// import data  from './hapoalim_for_dev.json';
// const rs = data as ScraperScrapingResult;
// const status = await insertNewTransactions(rs);
// const data = await scrape(CompanyTypes.hapoalim,new Date('01-01-25')); // קריאה לפונקציה בסקריפט שלך
//     console.log(data);
