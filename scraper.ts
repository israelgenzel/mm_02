import { CompanyTypes, createScraper, ScraperOptions, ScraperCredentials ,ScaperScrapingResult} from 'israeli-bank-scrapers';
import { credentials } from "./config.ts"; // נתיב הייבוא לפי המיקום של `config.ts`
async function scrape(companyId:CompanyTypes,startDate : Date): Promise<ScaperScrapingResult | undefined> {
  
  
  try {
    const options: ScraperOptions = {
      companyId: companyId,
      startDate: startDate,
      combineInstallments: false,
      showBrowser: true,
      verbose: true,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
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

// ייצוא הפונקציה
export { scrape };
