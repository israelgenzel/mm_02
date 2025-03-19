import { pool } from './db.js';
async function insertNewTransactions(scrapeResult) {
    console.log('Inserting new transactions...');
    if (!scrapeResult.success) {
        console.error("Scraping failed:", scrapeResult.errorType);
        return;
    }
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // נתחיל טרנזקציה
        const pendingInserts = [];
        const transactionsInserts = [];
        if (!scrapeResult.accounts) {
            console.error("No accounts found in scrape result");
            return;
        }
        for (const account of scrapeResult.accounts) {
            const { accountNumber } = account;
            for (const txn of account.txns) {
                const { identifier, type, status, date, processedDate, originalAmount, originalCurrency, chargedAmount, chargedCurrency, description, memo, category } = txn;
                if (status === "pending") {
                    pendingInserts.push([
                        identifier ?? null, type ?? null, status ?? null, date ?? null, processedDate ?? null,
                        originalAmount ?? null, originalCurrency ?? null, chargedAmount ?? null,
                        chargedCurrency ?? null, description ?? null, memo ?? null, category ?? null,
                        accountNumber ?? null
                    ]);
                }
                else {
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
            const query = `
        INSERT INTO transactions 
        (identifier, type, status, transaction_date, processed_date, original_amount, original_currency, 
         charged_amount, charged_currency, description, memo, category, account_number)
        VALUES ${transactionsInserts.map((_, i) => `($${i * 13 + 1}, $${i * 13 + 2}, $${i * 13 + 3}, $${i * 13 + 4}, 
          $${i * 13 + 5}, $${i * 13 + 6}, $${i * 13 + 7}, $${i * 13 + 8}, $${i * 13 + 9}, 
          $${i * 13 + 10}, $${i * 13 + 11}, $${i * 13 + 12}, $${i * 13 + 13})`).join(", ")}
        ON CONFLICT DO NOTHING`;
            await client.query(query, transactionsInserts.flat());
            console.log(`Inserted ${transactionsInserts.length} transactions`);
        }
        // מחיקת עסקאות מפנדינג שהועברו לטבלה הראשית
        if (transactionsInserts.length > 0) {
            const query = `
        DELETE FROM pending_trx 
        WHERE (transaction_date, account_number) IN (${transactionsInserts.map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`).join(", ")})
        RETURNING *`;
            const values = transactionsInserts.flatMap(txn => [
                txn[3], // transaction_date – אינדקס 3
                txn[12] // account_number – אינדקס 12
            ]);
            console.log("Deleting from pending:", values);
            const result = await client.query(query, values);
            console.log(`Removed ${result.rowCount} transactions from pending`);
        }
        await client.query('COMMIT'); // שמירה ל-DB
    }
    catch (error) {
        await client.query('ROLLBACK'); // במקרה של תקלה, ביטול השינויים
        console.error("Error inserting transactions:", error);
    }
    finally {
        client.release();
    }
}
export { insertNewTransactions };
