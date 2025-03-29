const { createScraper } = require('israeli-bank-scrapers');
const path = require('path');
const { credentials } = require('./config');
async function scrape(companyId, startDate) {
    try {
        const options = {
            companyId: companyId,
            startDate: startDate,
            combineInstallments: false,
            showBrowser: false,
            verbose: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--headless', // מפעיל את הדפדפן במצב headless ללא ממשק גרפי
                '--disable-gpu', // מבטל את השימוש ב-GPU
                '--remote-debugging-port=9222' // פותח פורט לבדיקת בעיות בדפדפן
              ],
            //executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            //userDataDir: "C:\\Users\\Israel\\AppData\\Local\\Google\\Chrome\\User Data\\israel",
            // coockiesPath: "./cookies.txt",
            // headless: true,
            storeFailureScreenShotPath: path.resolve("./", 'screenshots/failure.jpg'),
        };
        const compeny = credentials.find((c) => c.name === companyId);
        if (!compeny) {
            throw new Error(`No credentials found for company ${companyId}`);
        }
        const cred = {
            userCode: compeny.userCode,
            password: compeny.password,
            username: compeny.username
        };
        // const credentials: ScraperCredentials = {
        //   username: 'ISGENZEL',
        //   password: 'urielgen1'
        // };
        const scraper = createScraper(options);
        const scrapeResult = await scraper.scrape(cred);
        if (scrapeResult.success) {
            scrapeResult.accounts?.forEach((account) => {
                console.log(`found ${account.txns.length} transactions for account number ${account.accountNumber}`);
                console.log(account.balance);
            });
            return scrapeResult;
        }
        else {
            throw new Error(scrapeResult.errorType);
        }
    }
    catch (e) {
        console.error(`Scraping failed for the following reason: ${e}`);
        return undefined;
    }
}
// ייצוא הפונקציה
module.exports.scrape = scrape;

