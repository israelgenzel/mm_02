import express from 'express';
import { Request, Response } from 'express-serve-static-core';
import { scrape } from './scraper.js';
import { insertNewTransactions } from './db_api.js';
import { CompanyTypes, ScraperScrapingResult} from 'israeli-bank-scrapers';
import updateNotifier from 'update-notifier';
import pkg from './package.json' assert { type: "json" };



const app = express();
const port = 3000;

// דף ברוך הבא
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

app.get('/scrape', async (req: Request, res: Response) => {
  try {
    console.log('Scraping...');
    const data = await scrape(CompanyTypes.hapoalim,new Date('01-01-25')); // קריאה לפונקציה בסקריפט שלך
    console.log(data);
    console.log('json');
    
    if (data) {
      // await insertNewTransactions(data); // קריאה לפונקציה שמכניסה את הנתונים לבסיס הנתונים
      res.json(data);
    } else {
      res.status(500).send('No data returned from scraping');
    }
  } catch (error) {
    console.error('Error while scraping', error);
    res.status(500).send(`Error while scraping: ${(error as Error).message}`);
  }
});

// שרת שמאזין על הפורט 3000
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Check for updates
updateNotifier({ pkg }).notify();

const notifier = updateNotifier({ pkg });

if (notifier.update) {
    console.log(`*update*      ⚠️ יש עדכון זמין: ${notifier.update.latest}`);
    console.log("עדכן עם: npm update או npm install -g <package>");
}
else {
    console.log('*update*    אין עדכונים זמינים');
}

//main();
// just for testing
// import data  from './hapoalim_for_dev.json';
// const rs = data as ScraperScrapingResult;
// const status = await insertNewTransactions(rs);
// const data = await scrape(CompanyTypes.hapoalim,new Date('01-01-25')); // קריאה לפונקציה בסקריפט שלך
//     console.log(data);

