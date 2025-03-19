import { CompanyTypes, createScraper } from 'israeli-bank-scrapers';
async function scrape() {
    try {
        const options = {
            companyId: CompanyTypes.visaCal,
            startDate: new Date('2025-01-01'),
            combineInstallments: false,
            showBrowser: true,
            verbose: true,
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        };
        const credentials = {
            username: 'ISGENZEL',
            password: 'urielgen1'
        };
        const scraper = createScraper(options);
        const scrapeResult = await scraper.scrape(credentials);
        if (scrapeResult.success) {
            scrapeResult.accounts?.forEach((account) => {
                console.log(`found ${account.txns.length} transactions for account number ${account.accountNumber}`);
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
export { scrape };
