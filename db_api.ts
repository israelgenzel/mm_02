
import { ScraperScrapingResult } from 'israeli-bank-scrapers';
import { pool } from './db.js';
import { PoolClient } from 'pg';


const client: PoolClient = await pool.connect();

const TablesColumns = {
  accounts: ["id", "account_id", "compeny_name", "balance", "status", "descraption"] as const,
  business_categories: ["business_id", "category_id"] as const,
  business_mappings: ["id", "original_business", "mapped_business_id"] as const,
  businesses: ["id", "name", "status"] as const,
  categories: ["id", "name", "status"] as const,
  category_mappings: ["id", "original_category", "mapped_category_id"] as const,
  companies: ["id", "name", "encrypted_username", "encrypted_password"] as const,
  notifications: ["id", "message", "created_at", "type", "buttons"] as const,
  pending_trx: [
    "id",
    "identifier",
    "accountNumber",
    "type",
    "status",
    "date",
    "processedDate",
    "originalAmount",
    "originalCurrency",
    "chargedAmount",
    "chargedCurrency",
    "description",
    "memo",
    "businessId",
    "manualCategoryId",
    "installmentNumber",
    "installmentTotal",
    "category"
  ] as const,
  transactions: [
    "id",
    "identifier",
    "accountNumber",
    "type",
    "status",
    "date",
    "processedDate",
    "originalAmount",
    "originalCurrency",
    "chargedAmount",
    "chargedCurrency",
    "description",
    "memo",
    "businessId",
    "manualCategoryId",
    "installmentNumber",
    "installmentTotal",
    "category"
  ] as const,
  user_changes: ["id", "change_type", "original_value", "new_value", "count"] as const
} as const;

type TableName = keyof typeof TablesColumns;


function getColumns<T extends TableName>(
  table: T,
  selectedColumns?: (typeof TablesColumns[T][number])[],
  excludedColumns?: (typeof TablesColumns[T][number])[]
): (typeof TablesColumns[T][number])[] {
  let columns = selectedColumns ?? [...TablesColumns[table]];

  if (excludedColumns) {
    columns = columns.filter(col => !excludedColumns.includes(col));
  }

  return columns;
}

// פונקציה להכנסת נתונים לטבלה
// הפונקציה מקבלת את הקליינט, שם הטבלה, ערכים להכנסה, עמודות נבחרות להכנסה ועמודות שלא יכנסו
async function InsertRows<T extends TableName>(

  table: T,
  values: Record<string, any>[], // ערכים בפורמט קי ואליו
  selectedColumns?: (typeof TablesColumns[T][number])[],
  excludedColumns?: (typeof TablesColumns[T][number])[]
): Promise<{ status: string; rowCount?: number; error?: string; result?: any }> {
  if (values.length === 0) {
    return { status: "failure", error: "No values to insert." }; // אין ערכים להוספה
  }

  // קבלת עמודות חוקיות להכנסה
  const columns = getColumns(table, selectedColumns, excludedColumns ?? ["id"]);
  console.log("columns", columns);

  if (columns.length === 0) {
    return { status: "failure", error: "No valid columns to insert." }; // אם אין עמודות תקפות
  }
  console.log("valuesType", typeof values);

  // יצירת פלייסהולדרים (למניעת SQL Injection) עם מיפוי לפי קי
  const valuesPlaceholders = values
    .map((_, rowIndex) =>
      `(${columns
        .map((column, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
        .join(", ")})`
    )
    .join(", ");

  // console.log("*****************valuesPlaceholders", valuesPlaceholders);

  // עטיפת שמות העמודות במרכאות כפולות כדי לשמור על האותיות כפי שהוגדרו
  const quotedColumns = columns.map(col => `"${col}"`).join(", ");

  // יצירת השאילתה
  const query = `
      INSERT INTO ${table} (${quotedColumns})
      VALUES ${valuesPlaceholders}
      ON CONFLICT DO NOTHING
      RETURNING *;
  `;

  // יצירת מערך שטוח של הערכים מתוך המערך של קי ואליו
  const flatValues = values.flatMap(row =>
    columns.map(column => row[column] ?? null) // המרה לערכים לפי המפתחות (עמודות)
  );

  console.log("flatValues", flatValues);

  console.log("Inserting into", table, "with", flatValues.length, "values by", query);
  try {
    const result = await client.query(query, flatValues);
    console.log(`Inserted ${result.rowCount} records into ${table}`);
    return { status: "success", rowCount: result.rowCount, result: result }; // ורשימת התוצאות החזרת סטטוס הצלחה עם כמות רשומות שהוזנו
  } catch (error) {
    console.error(`Error inserting into ${table}:`, error);
    return { status: "failure", error: (error as Error).message }; // החזרת כישלון עם הודעת השגיאה
  }
}

async function DeleteRows<T extends TableName>(

  table: T,
  values: Record<string, any>[], // ערכים בפורמט קי ואליו
  selectedColumns?: (typeof TablesColumns[T][number])[],
  excludedColumns?: (typeof TablesColumns[T][number])[]
): Promise<{ status: string; rowCount?: number; error?: string; result?: any }> {
  if (values.length === 0) {
    return { status: "failure", error: "No values to delete." };
  }

  // קבלת עמודות למחיקה
  const columns = getColumns(table, selectedColumns, excludedColumns ?? ["id"]);

  if (columns.length === 0) {
    return { status: "failure", error: "No valid columns to delete." };
  }

  // יצירת פלייסהולדרים לשאילתה
  const valuesPlaceholders = values
    .map((_, rowIndex) =>
      `(${columns.map((_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`).join(", ")})`
    )
    .join(", ");

  // עטיפת שמות העמודות במרכאות כפולות
  const quotedColumns = `(${columns.map(col => `"${col}"`).join(", ")})`;

  // בניית השאילתה
  const query = `
    DELETE FROM ${table} 
    WHERE ${quotedColumns} IN (${valuesPlaceholders})
    RETURNING *;
  `;

  // המרת המערך לערכים שטוחים
  const flatValues = values.flatMap(row => columns.map(column => row[column] ?? null));

  console.log("Deleting from", table, "with", flatValues.length, "values by", query);

  try {
    const result = await client.query(query, flatValues);
    console.log(`Deleted ${result.rowCount} records from ${table}`);
    return { status: "success", rowCount: result.rowCount, result: result };
  } catch (error) {
    console.error(`Error deleting from ${table}:`, error);
    return { status: "failure", error: (error as Error).message };
  }
}

async function updateRows<T extends TableName>(

  table: T,
  oldValues: Record<string, any>[], // ערכים בפורמט קי ואליו
  updateValues: Record<string, any>[], // ערכים בפורמט קי ואליו
  selectedColumns?: (typeof TablesColumns[T][number])[],
  excludedColumns?: (typeof TablesColumns[T][number])[],
  selectedColumns_where?: (typeof TablesColumns[T][number])[],
  excludedColumns_where?: (typeof TablesColumns[T][number])[],)
  : Promise<{ status: string; rowCount?: number; error?: string; result?: any }> {
  if (oldValues.length === 0) {
    return { status: "failure", error: "No values to update." }; // אין ערכים לעדכון
  }

  // קבלת עמודות חוקיות לעדכון
  const columns = getColumns(table, selectedColumns, excludedColumns ?? ["id"]);

  if (columns.length === 0) {
    return { status: "failure", error: "No valid columns to update." }; // אם אין עמודות תקפות
  }

  // קבלת עמודות חוקיות לבדיקה
  const columns_where = getColumns(table, selectedColumns_where, excludedColumns_where ?? ["id"]);

  if (columns_where.length === 0) {
    return { status: "failure", error: "No valid columns to where." }; // אם אין עמודות תקפות
  }

  // יצירת פלייסהולדרים (למניעת SQL Injection) עם מיפוי לפי קי
  const valuesPlaceholders = oldValues // יצירת פלייסהולדרים לערכים הקודמים
    .map((_, rowIndex) => // יצירת מערך חדש של פלייסהולדרים לפי המספר של השורה
      `(${columns_where // יצירת מערך חדש של פלייסהולדרים לפי העמודות של השורה
        .map((column, colIndex) => `$${rowIndex * columns_where.length + colIndex + 1}`) // יצירת מערך חדש של פלייסהולדרים לפי המספר של העמודה  
        .join(", ")})` // המרה למחרוזת
    )
    .join(", "); // המרה למחרוזת


  // יצירת פלייסהולדרים לערכים החדשים
  const valuesPlaceholders_update = updateValues
    .map((_, rowIndex) =>
      `(${columns
        .map((column, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`)
        .join(", ")})`
    )
    .join(", ");

  // עטיפת שמות העמודות במרכאות כפולות כדי לשמור על האותיות כפי שהוגדרו
  const quotedColumns = columns.map(col => `"${col}"`).join(", ");
  const quotedColumns_where = columns_where.map(col => `"${col}"`).join(", ");
  // יצירת השאילתה
  const query = `UPDATE ${table}
                  SET (${quotedColumns}) = (${valuesPlaceholders_update})
                  WHERE (${quotedColumns_where}) = (${valuesPlaceholders})
                  RETURNING *;`; // יצירת השאילתה

  // יצירת מערך שטוח של הערכים מתוך המערך של קי ואליו
  const flatValues = oldValues.flatMap(row =>  // המרה לערכים לפי המפתחות (עמודות)
    columns_where.map(column => row[column] ?? null)
  ).concat(updateValues.flatMap(row =>  // המרה לערכים לפי המפתחות (עמודות)
    columns.map(column => row[column] ?? null)
  ));

  console.log("flatValues", flatValues);

  console.log("Updating from", table, "with", flatValues.length, "values by", query);
  try {
    const result = await client.query(query, flatValues); // יצירת השאילתה
    console.log(`Updated ${result.rowCount} records from ${table}`);
    return { status: "success", rowCount: result.rowCount, result: result }; // ורשימת התוצאות החזרת סטטוס הצלחה עם כמות רשומות שהוזנו
  }
  catch (error) {
    console.error(`Error updating from ${table}:`, error);  // החזרת כישלון עם הודעת השגיאה
    return { status: "failure", error: (error as Error).message }; // החזרת כישלון עם הודעת השגיאה  
  }
}

async function BEGIN(): Promise<void> {
  await client.query('BEGIN'); // נתחיל טרנזקציה
}

async function COMMIT(): Promise<void> {
  await client.query('COMMIT'); // שמירה ל-DB
}

// הפונקציה מקבלת את התוצאות של הסקראפינג ומכניסה אותן לבסיס הנתונים
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


    // בדיקה שיש חשבונות בתוך התוצאה
    if (!scrapeResult.accounts) {
      console.error("No accounts found in scrape result");
      return;
    }

    // המערכים יוכנסו לטבלאות במכה אחת
    let transactionRecords: Record<string, any>[] = [];
    let pendingRecords: Record<string, any>[] = [];


    // עבור כל חשבון בתוך התוצאה  
    for (const account of scrapeResult.accounts) {
      const { accountNumber } = account;
      for (const txn of account.txns) {
        let installmentNumber: string | null = null;
        let installmentTotal: string | null = null;

        if (txn.type === "installments" && txn.memo) {
          const match = txn.memo.match(/(\d+)\sמתוך\s(\d+)/); // חילוץ מספר תשלום ומספר כולל
          if (match) {
            installmentNumber = match[1]; // מספר התשלום הנוכחי
            installmentTotal = match[2]; // מספר התשלומים הכולל
          }
        }
        const transactionRecord: Record<string, any> = {
          ...txn, // אם המפתחות והערכים הפוכים, זה כבר בסדר
          accountNumber: accountNumber ?? null,
          installmentNumber: installmentNumber ?? null,
          installmentTotal: installmentTotal ?? null  // הוספת הערך אם נדרש
        };

        if (txn.status === "pending") {
          pendingRecords.push(transactionRecord);
        }
        else {
          transactionRecords.push(transactionRecord);
        }
      }
    }
    console.log("pendingRecords", pendingRecords);

    // הכנסת כל העסקאות בפנדינג במכה אחת
    InsertRows('pending_trx', pendingRecords, undefined, ["id", "businessId", "manualCategoryId"]);

    // הכנסת כל העסקאות לטבלה הראשית במכה אחת
    if (transactionRecords.length > 0) {

      // יצירת מזהה קצר מהתיאור
      function generateShortId(text) {
        return Buffer.from(text, 'utf8').toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
      }

      transactionRecords.forEach(t => {
        if (t.type === "installments") { // אם זו עסקה בתשלומים 
          // יצירת מזהה קצר מהתיאור 
          let shortDesc = generateShortId(t.description);
          // יצירת מזהה ייחודי
          t.identifier = `${t.identifier}_${shortDesc}_i${t.installmentNumber}f${t.installmentTotal}`;
        }
      });

      // הכנסת כל העסקאות לטבלה הראשית במכה אחת
      const transactions_result = (await InsertRows('transactions', transactionRecords, undefined, ["id", "businessId", "manualCategoryId"])).result.rows;


      // יצירת מערך קטגוריות ועסקים חדשים
      const categoryRecords = transactionRecords
        .filter(t => t.category)
        .map(t => ({ name: t.category }));
      const businessRecords = transactionRecords
        .filter(t => t.description)
        .map(t => ({ name: t.description }));


      let new_categorys_notification: Record<string, any>[] = [];
      let new_businesses_notification: Record<string, any>[] = [];
      const allNotifoctions: Record<string, any>[] = [];


      if (categoryRecords.length > 0) {
        const new_categorys = (await InsertRows('categories', categoryRecords, ["name"])).result;
        if (new_categorys.rowCount > 0) {
          new_categorys_notification = [{
            type: 'added_pending_values',
            message: `Inserted ${new_categorys.rowCount} categorys, please check to approve or change.`,
            created_at: new Date().toISOString(),
            buttons: [({ 'go to categories': new_categorys.rows.map((c) => c.name) })],
          }];
          allNotifoctions.push(...new_categorys_notification);
        }

      }

      if (businessRecords.length > 0) {
        const new_businesses = (await InsertRows('businesses', businessRecords, ["name"])).result;
        if (new_businesses.rowCount > 0) {
          new_businesses_notification = [{
            type: 'added_pending_values',
            message: `Inserted ${new_businesses.rowCount} businesses, please check to approve or change.`,
            created_at: new Date().toISOString(),
            buttons: [({ 'go to businesses': new_businesses.rows.map((b) => b.name) })],
          }];
          allNotifoctions.push(...new_businesses_notification);
        }

        console.log("new_businesses_notification", new_businesses_notification);
      }


      // הכנסת כל ההתראות לטבלת ההתראות במכה אחת
      InsertRows('notifications', allNotifoctions, undefined, ["id"]);

      // מטבלת הפנדינג מחיקת כל העסקאות  שהועברו לטבלת העסקאות
      DeleteRows('pending_trx', transactions_result, ["date", "accountNumber", "chargedAmount", "description"]);


    }

    await client.query('COMMIT'); // שמירה ל-DB
    console.log("Transactions inserted successfully");
    return

  } catch (error) {
    await client.query('ROLLBACK'); // במקרה של תקלה, ביטול השינויים
    console.error("Error inserting transactions:", error);
  } finally {

    client.release();
  }
}




export { insertNewTransactions, InsertRows, DeleteRows, updateRows };
