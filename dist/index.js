const express = require('express');
const { scrape } = require('./scraper.js');
const { CompanyTypes } = require('israeli-bank-scrapers');
const  { initializeDb}= require("./initDb.js");
const { insertNewTransactions } = require('./db_api.js');
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
        let comtype;
        const company = req.query.company; // מקבל את הפרמטר מה-URL

        if (company === "hapoalim") {
            comtype = CompanyTypes.hapoalim;
        } else if (company === "visaCal") {
            comtype = CompanyTypes.visaCal;
        } else {
            return res.status(400).json({ error: "Invalid company type" });
        }
        console.log('Scraping...');
        const data = await scrape(comtype, new Date('01-01-25')); // קריאה לפונקציה בסקריפט שלך
        insertNewTransactions(data);
        res.json({ message: "Scraping started for " + company });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    
   
});
app.get('/init' ,async (req,res)=>{

    try{
      await initializeDb();
      res.send("sucsesful!!")
    }
    catch(e){
        res.send(e);
    }
    //for
     
    
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
