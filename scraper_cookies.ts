
import { CompanyTypes, createScraper, ScraperOptions, ScraperCredentials ,ScaperScrapingResult } from 'israeli-bank-scrapers';

import path from 'path';
import fs from 'fs';
import { credentials } from "./config.ts"; // נתיב הייבוא לפי המיקום של `config.ts`
import puppeteer from 'puppeteer';
import { setTimeout } from 'timers/promises';

let options : ScraperOptions = {
  companyId: CompanyTypes.hapoalim, // replace with a valid CompanyTypes value
  startDate: new Date(),
  showBrowser: true,
};
async function scrape(companyId:CompanyTypes,startDate : Date): Promise<ScaperScrapingResult | undefined> {
  
  
  try {



    options = {
      companyId: companyId,
      startDate: startDate,
      combineInstallments: false,
      showBrowser: true,
      verbose: true,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      userDataDir: "C:\\Users\\Israel\\AppData\\Local\\Google\\Chrome\\User Data\\israel",
     // coockiesPath: "./cookies.txt",
      // headless: true,
      storeFailureScreenShotPath: path.resolve("./", 'screenshots/failure.jpg'),
       
     
      
    };
    const compeny = credentials.find((c) => c.name === companyId as string);
    if (!compeny) {
      throw new Error(`No credentials found for company ${companyId}`);
    }
    const cred: ScraperCredentials = {
      userCode: compeny.userCode,
      password: compeny.password,
      username: compeny.username
    };


    // const credentials: ScraperCredentials = {

    //   username: 'ISGENZEL',
    //   password: 'urielgen1'
    // };

    const scraper = createScraper(options);
   
    const scrapeResult: ScaperScrapingResult = await scraper.scrape(cred);

    if (scrapeResult.success) {
      scrapeResult.accounts?.forEach((account) => {
        console.log(`found ${account.txns.length} transactions for account number ${account.accountNumber}`);
      });
      return scrapeResult;
    } else {
      throw new Error(scrapeResult.errorType);
    }
  } catch (e) {
    console.error(`Scraping failed for the following reason: ${e}`);
    return undefined;
  }
}

async function loadCookies(page, cookiesFilePath) {
    const cookiesString = fs.readFileSync(cookiesFilePath);
    const cookies = JSON.parse(cookiesString.toString());
    await page.setCookie(...cookies);
  }
  
  async function main() {
    const cookiesFilePath = path.resolve("./", 'cookies.json'); // ציין את הנתיב לקובץ הקוקיז
    const browser = await puppeteer.launch({ headless: false, executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" });
    const page = await browser.newPage();
    await loadCookies(page, cookiesFilePath);
  
    const scraper = createScraper({
      ...options,
      preparePage: async (page) => {
        await loadCookies(page, cookiesFilePath);
      },
    });
  
    try {
      const compeny = credentials.find((c) => c.name === options.companyId as string);
      if (!compeny) {
        throw new Error(`No credentials found for company ${options.companyId}`);
      }
      const cred: ScraperCredentials = {
        userCode: compeny.userCode,
        password: compeny.password,
        username: compeny.username
      };
      const result = await scraper.scrape(cred);
      if (result.success) {
        console.log('Login successful.');
      } else {
        console.error('Login failed: ', result.errorType, result.errorMessage);
      }
    } catch (error) {
      console.error('Error during login: ', error);
    } finally {
      await browser.close();
    }
  }
  


// ייצוא הפונקציה
export { scrape,main };