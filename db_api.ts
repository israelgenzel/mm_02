
import { ScraperScrapingResult } from 'israeli-bank-scrapers';
import { pool } from './db.js';



async function insertNewTransactions(scrapeResult: ScraperScrapingResult): Promise<void> {
  console.log('Inserting new transactions...');
  if (!scrapeResult.success) {
    console.error("Scraping failed:", scrapeResult.errorType);
    return;
  }
  // חיבור לבסיס הנתונים  
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // נתחיל טרנזקציה

    // יצירת מערכים להכנסת הנתונים לטבלאות
    const pendingInserts: (string | number | null)[][] = [];
    let transactionsInserts: (string | number | null)[][] = [];

    // בדיקה שיש חשבונות בתוך התוצאה
    if (!scrapeResult.accounts) {
      console.error("No accounts found in scrape result");
      return;
    }

    // עבור כל חשבון ועבור כל עסקה בחשבון, הכנס את הנתונים למערכים
    for (const account of scrapeResult.accounts) {
      const { accountNumber } = account;
      for (const txn of account.txns) {
        const {
          identifier, type, status, date, processedDate,
          originalAmount, originalCurrency, chargedAmount,
          chargedCurrency, description, memo, category
        } = txn;

        if (status === "pending") {
          pendingInserts.push([
            identifier ?? null, type ?? null, status ?? null, date ?? null, processedDate ?? null,
            originalAmount ?? null, originalCurrency ?? null, chargedAmount ?? null,
            chargedCurrency ?? null, description ?? null, memo ?? null, category ?? null,
            accountNumber ?? null
          ]);
        } else {
          transactionsInserts.push([
            identifier ?? null, type ?? null, status ?? null, date ?? null, processedDate ?? null,
            originalAmount ?? null, originalCurrency ?? null, chargedAmount ?? null,
            chargedCurrency ?? null, description ?? null, memo ?? null, category ?? null,
            accountNumber ?? null
          ]);
        }
      }
    }



    // הכנסת כל העסקאות בפנדינג במכה אחת
    if (pendingInserts.length > 0) {
      const query = `
        INSERT INTO pending_trx 
        (identifier, type, status, transaction_date, processed_date, original_amount, original_currency, 
         charged_amount, charged_currency, description, memo, category, account_number)
        VALUES ${pendingInserts.map((_, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, 
          $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, 
          $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`).join(", ")}
        ON CONFLICT DO NOTHING`;


      await client.query(query, pendingInserts.flat());

      console.log(`Inserted ${pendingInserts.length} pending transactions`);
    }

    // הכנסת כל העסקאות לטבלה הראשית במכה אחת
    if (transactionsInserts.length > 0) {
      function generateShortId(text) {
        return Buffer.from(text, 'utf8').toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    }
    
    transactionsInserts = transactionsInserts.map(t => {
        let identifier = String(t[0]); // מזהה העסקה
        if (t[1] === "installments") { // אם זו עסקה בתשלומים
            const memo = String(t[10]); // לדוגמה: "3 מתוך 3 - סכום העסקה ₪431.60"
            const description = String(t[9]); // תיאור העסקה
            const match = memo.match(/(\d+)\sמתוך\s(\d+)/); // חילוץ מספר תשלום ומספר כולל
            
            let currentInstallment = "?";
            let totalInstallments = "?";
            if (match) {
                currentInstallment = match[1]; // מספר התשלום הנוכחי
                totalInstallments = match[2]; // מספר התשלומים הכולל
            }
    
            // יצירת מזהה קצר מהתיאור
            let shortDesc = generateShortId(description);
    
            // יצירת מזהה ייחודי
            identifier = `${identifier}_${shortDesc}_i${currentInstallment}f${totalInstallments}`;
        }
    
        return [identifier, ...t.slice(1)]; // מחליף את ה-ID ושומר את כל השאר
    });


      const query = `
        INSERT INTO transactions 
        (identifier, type, status, transaction_date, processed_date, original_amount, original_currency, 
         charged_amount, charged_currency, description, memo, category, account_number)
        VALUES ${transactionsInserts.map((_, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, 
          $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, 
          $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`).join(", ")}
        ON CONFLICT DO NOTHING RETURNING *`;

      const categoryValues = transactionsInserts.map((t) => t[11]);
      const businessValues = transactionsInserts.map((t) => t[9]);

      const categoryQuery = `INSERT INTO categories (name) VALUES ${categoryValues.map((_, i) => `($${i + 1})`).join(", ")}
        ON CONFLICT DO NOTHING`;

      const businessQuery = `INSERT INTO businesses (name) VALUES ${businessValues.map((_, i) => `($${i + 1})`).join(", ")}
        ON CONFLICT DO NOTHING`;


      const result = await client.query(query, transactionsInserts.flat());
      await client.query(categoryQuery, categoryValues.flat());
      await client.query(businessQuery, businessValues.flat());
      console.log(result.rowCount);
      console.log(`Inserted ${transactionsInserts.length} transactions`);


      
    }

    // מחיקת עסקאות מטבלת הפנדינג שכבר קיימות בטבלת העסקאות
    if (transactionsInserts.length > 0) {
      const query = `
        DELETE FROM pending_trx 
        WHERE (DATE(transaction_date), account_number, charged_amount, description) IN (${transactionsInserts.map((_, i) =>
        `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`
      ).join(", ")})
        RETURNING *`;

      const values = transactionsInserts.flatMap(txn => [
        typeof txn[3] === "string"
          ? txn[3].split("T")[0]  // אם זה string, חתוך את השעה
          : new Date(txn[3]).toISOString().split("T")[0], // אם זה מספר, המר אותו לתאריך
        txn[12], // account_number
        txn[7],  // charge_amount (אינדקס 5 לדוגמה - ודא שזה האינדקס הנכון)
        txn[9]   // description (אינדקס 8 לדוגמה - ודא שזה האינדקס הנכון)
      ]);

      // console.log("Deleting from pending:", values);
      const result = await client.query(query, values);
      console.log(`Removed ${result.rowCount} transactions from pending`);
    }

    await client.query('COMMIT'); // שמירה ל-DB
  } catch (error) {
    await client.query('ROLLBACK'); // במקרה של תקלה, ביטול השינויים
    console.error("Error inserting transactions:", error);
  } finally {
    client.release();
  }
}

export { insertNewTransactions };
