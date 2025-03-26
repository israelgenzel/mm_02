"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertNewTransactions = insertNewTransactions;
exports.InsertRows = InsertRows;
exports.DeleteRows = DeleteRows;
exports.updateRows = updateRows;
var db_js_1 = require("./db.js");
var client = await db_js_1.pool.connect();
var TablesColumns = {
    accounts: ["id", "account_id", "compeny_name", "balance", "status", "descraption"],
    business_categories: ["business_id", "category_id"],
    business_mappings: ["id", "original_business", "mapped_business_id"],
    businesses: ["id", "name", "status"],
    categories: ["id", "name", "status"],
    category_mappings: ["id", "original_category", "mapped_category_id"],
    companies: ["id", "name", "encrypted_username", "encrypted_password"],
    notifications: ["id", "message", "created_at", "type", "buttons"],
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
    ],
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
    ],
    user_changes: ["id", "change_type", "original_value", "new_value", "count"]
};
function getColumns(table, selectedColumns, excludedColumns) {
    var columns = selectedColumns !== null && selectedColumns !== void 0 ? selectedColumns : __spreadArray([], TablesColumns[table], true);
    if (excludedColumns) {
        columns = columns.filter(function (col) { return !excludedColumns.includes(col); });
    }
    return columns;
}
// פונקציה להכנסת נתונים לטבלה
// הפונקציה מקבלת את הקליינט, שם הטבלה, ערכים להכנסה, עמודות נבחרות להכנסה ועמודות שלא יכנסו
function InsertRows(table, values, // ערכים בפורמט קי ואליו
selectedColumns, excludedColumns) {
    return __awaiter(this, void 0, void 0, function () {
        var columns, valuesPlaceholders, quotedColumns, query, flatValues, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (values.length === 0) {
                        return [2 /*return*/, { status: "failure", error: "No values to insert." }]; // אין ערכים להוספה
                    }
                    columns = getColumns(table, selectedColumns, excludedColumns !== null && excludedColumns !== void 0 ? excludedColumns : ["id"]);
                    console.log("columns", columns);
                    if (columns.length === 0) {
                        return [2 /*return*/, { status: "failure", error: "No valid columns to insert." }]; // אם אין עמודות תקפות
                    }
                    console.log("valuesType", typeof values);
                    valuesPlaceholders = values
                        .map(function (_, rowIndex) {
                        return "(".concat(columns
                            .map(function (column, colIndex) { return "$".concat(rowIndex * columns.length + colIndex + 1); })
                            .join(", "), ")");
                    })
                        .join(", ");
                    quotedColumns = columns.map(function (col) { return "\"".concat(col, "\""); }).join(", ");
                    query = "\n      INSERT INTO ".concat(table, " (").concat(quotedColumns, ")\n      VALUES ").concat(valuesPlaceholders, "\n      ON CONFLICT DO NOTHING\n      RETURNING *;\n  ");
                    flatValues = values.flatMap(function (row) {
                        return columns.map(function (column) { var _a; return (_a = row[column]) !== null && _a !== void 0 ? _a : null; });
                    } // המרה לערכים לפי המפתחות (עמודות)
                    );
                    console.log("flatValues", flatValues);
                    console.log("Inserting into", table, "with", flatValues.length, "values by", query);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.query(query, flatValues)];
                case 2:
                    result = _a.sent();
                    console.log("Inserted ".concat(result.rowCount, " records into ").concat(table));
                    return [2 /*return*/, { status: "success", rowCount: result.rowCount, result: result }]; // ורשימת התוצאות החזרת סטטוס הצלחה עם כמות רשומות שהוזנו
                case 3:
                    error_1 = _a.sent();
                    console.error("Error inserting into ".concat(table, ":"), error_1);
                    return [2 /*return*/, { status: "failure", error: error_1.message }]; // החזרת כישלון עם הודעת השגיאה
                case 4: return [2 /*return*/];
            }
        });
    });
}
function DeleteRows(table, values, // ערכים בפורמט קי ואליו
selectedColumns, excludedColumns) {
    return __awaiter(this, void 0, void 0, function () {
        var columns, valuesPlaceholders, quotedColumns, query, flatValues, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (values.length === 0) {
                        return [2 /*return*/, { status: "failure", error: "No values to delete." }];
                    }
                    columns = getColumns(table, selectedColumns, excludedColumns !== null && excludedColumns !== void 0 ? excludedColumns : ["id"]);
                    if (columns.length === 0) {
                        return [2 /*return*/, { status: "failure", error: "No valid columns to delete." }];
                    }
                    valuesPlaceholders = values
                        .map(function (_, rowIndex) {
                        return "(".concat(columns.map(function (_, colIndex) { return "$".concat(rowIndex * columns.length + colIndex + 1); }).join(", "), ")");
                    })
                        .join(", ");
                    quotedColumns = "(".concat(columns.map(function (col) { return "\"".concat(col, "\""); }).join(", "), ")");
                    query = "\n    DELETE FROM ".concat(table, " \n    WHERE ").concat(quotedColumns, " IN (").concat(valuesPlaceholders, ")\n    RETURNING *;\n  ");
                    flatValues = values.flatMap(function (row) { return columns.map(function (column) { var _a; return (_a = row[column]) !== null && _a !== void 0 ? _a : null; }); });
                    console.log("Deleting from", table, "with", flatValues.length, "values by", query);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.query(query, flatValues)];
                case 2:
                    result = _a.sent();
                    console.log("Deleted ".concat(result.rowCount, " records from ").concat(table));
                    return [2 /*return*/, { status: "success", rowCount: result.rowCount, result: result }];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error deleting from ".concat(table, ":"), error_2);
                    return [2 /*return*/, { status: "failure", error: error_2.message }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function updateRows(table, oldValues, // ערכים בפורמט קי ואליו
updateValues, // ערכים בפורמט קי ואליו
selectedColumns, excludedColumns, selectedColumns_where, excludedColumns_where) {
    return __awaiter(this, void 0, void 0, function () {
        var columns, columns_where, valuesPlaceholders, valuesPlaceholders_update, quotedColumns, quotedColumns_where, query, flatValues, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (oldValues.length === 0) {
                        return [2 /*return*/, { status: "failure", error: "No values to update." }]; // אין ערכים לעדכון
                    }
                    columns = getColumns(table, selectedColumns, excludedColumns !== null && excludedColumns !== void 0 ? excludedColumns : ["id"]);
                    if (columns.length === 0) {
                        return [2 /*return*/, { status: "failure", error: "No valid columns to update." }]; // אם אין עמודות תקפות
                    }
                    columns_where = getColumns(table, selectedColumns_where, excludedColumns_where !== null && excludedColumns_where !== void 0 ? excludedColumns_where : ["id"]);
                    if (columns_where.length === 0) {
                        return [2 /*return*/, { status: "failure", error: "No valid columns to where." }]; // אם אין עמודות תקפות
                    }
                    valuesPlaceholders = oldValues // יצירת פלייסהולדרים לערכים הקודמים
                        .map(function (_, rowIndex) {
                        return "(".concat(columns_where // יצירת מערך חדש של פלייסהולדרים לפי העמודות של השורה
                            .map(function (column, colIndex) { return "$".concat(rowIndex * columns_where.length + colIndex + 1); }) // יצירת מערך חדש של פלייסהולדרים לפי המספר של העמודה  
                            .join(", "), ")");
                    } // המרה למחרוזת
                    )
                        .join(", ");
                    valuesPlaceholders_update = updateValues
                        .map(function (_, rowIndex) {
                        return "(".concat(columns
                            .map(function (column, colIndex) { return "$".concat(rowIndex * columns.length + colIndex + 1); })
                            .join(", "), ")");
                    })
                        .join(", ");
                    quotedColumns = columns.map(function (col) { return "\"".concat(col, "\""); }).join(", ");
                    quotedColumns_where = columns_where.map(function (col) { return "\"".concat(col, "\""); }).join(", ");
                    query = "UPDATE ".concat(table, "\n                  SET (").concat(quotedColumns, ") = (").concat(valuesPlaceholders_update, ")\n                  WHERE (").concat(quotedColumns_where, ") = (").concat(valuesPlaceholders, ")\n                  RETURNING *;");
                    flatValues = oldValues.flatMap(function (row) {
                        return columns_where.map(function (column) { var _a; return (_a = row[column]) !== null && _a !== void 0 ? _a : null; });
                    }).concat(updateValues.flatMap(function (row) {
                        return columns.map(function (column) { var _a; return (_a = row[column]) !== null && _a !== void 0 ? _a : null; });
                    }));
                    console.log("flatValues", flatValues);
                    console.log("Updating from", table, "with", flatValues.length, "values by", query);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, client.query(query, flatValues)];
                case 2:
                    result = _a.sent();
                    console.log("Updated ".concat(result.rowCount, " records from ").concat(table));
                    return [2 /*return*/, { status: "success", rowCount: result.rowCount, result: result }]; // ורשימת התוצאות החזרת סטטוס הצלחה עם כמות רשומות שהוזנו
                case 3:
                    error_3 = _a.sent();
                    console.error("Error updating from ".concat(table, ":"), error_3); // החזרת כישלון עם הודעת השגיאה
                    return [2 /*return*/, { status: "failure", error: error_3.message }]; // החזרת כישלון עם הודעת השגיאה  
                case 4: return [2 /*return*/];
            }
        });
    });
}
function BEGIN() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query('BEGIN')];
                case 1:
                    _a.sent(); // נתחיל טרנזקציה
                    return [2 /*return*/];
            }
        });
    });
}
function COMMIT() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.query('COMMIT')];
                case 1:
                    _a.sent(); // שמירה ל-DB
                    return [2 /*return*/];
            }
        });
    });
}
// הפונקציה מקבלת את התוצאות של הסקראפינג ומכניסה אותן לבסיס הנתונים
function insertNewTransactions(scrapeResult) {
    return __awaiter(this, void 0, void 0, function () {
        // יצירת מזהה קצר מהתיאור
        function generateShortId(text) {
            return Buffer.from(text, 'utf8').toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
        }
        var client, transactionRecords, pendingRecords, _i, _a, account, accountNumber, _b, _c, txn, installmentNumber, installmentTotal, match, transactionRecord, transactions_result, categoryRecords, businessRecords, new_categorys_notification, new_businesses_notification, allNotifoctions, new_categorys, new_businesses, error_4;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    console.log('Inserting new transactions...');
                    if (!scrapeResult.success) {
                        console.error("Scraping failed:", scrapeResult.errorType);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, db_js_1.pool.connect()];
                case 1:
                    client = _d.sent();
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 11, 13, 14]);
                    return [4 /*yield*/, client.query('BEGIN')];
                case 3:
                    _d.sent(); // נתחיל טרנזקציה
                    // בדיקה שיש חשבונות בתוך התוצאה
                    if (!scrapeResult.accounts) {
                        console.error("No accounts found in scrape result");
                        return [2 /*return*/];
                    }
                    transactionRecords = [];
                    pendingRecords = [];
                    // עבור כל חשבון בתוך התוצאה  
                    for (_i = 0, _a = scrapeResult.accounts; _i < _a.length; _i++) {
                        account = _a[_i];
                        accountNumber = account.accountNumber;
                        for (_b = 0, _c = account.txns; _b < _c.length; _b++) {
                            txn = _c[_b];
                            installmentNumber = null;
                            installmentTotal = null;
                            if (txn.type === "installments" && txn.memo) {
                                match = txn.memo.match(/(\d+)\sמתוך\s(\d+)/);
                                if (match) {
                                    installmentNumber = match[1]; // מספר התשלום הנוכחי
                                    installmentTotal = match[2]; // מספר התשלומים הכולל
                                }
                            }
                            transactionRecord = __assign(__assign({}, txn), { accountNumber: accountNumber !== null && accountNumber !== void 0 ? accountNumber : null, installmentNumber: installmentNumber !== null && installmentNumber !== void 0 ? installmentNumber : null, installmentTotal: installmentTotal !== null && installmentTotal !== void 0 ? installmentTotal : null // הוספת הערך אם נדרש
                             });
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
                    if (!(transactionRecords.length > 0)) return [3 /*break*/, 9];
                    transactionRecords.forEach(function (t) {
                        if (t.type === "installments") { // אם זו עסקה בתשלומים 
                            // יצירת מזהה קצר מהתיאור 
                            var shortDesc = generateShortId(t.description);
                            // יצירת מזהה ייחודי
                            t.identifier = "".concat(t.identifier, "_").concat(shortDesc, "_i").concat(t.installmentNumber, "f").concat(t.installmentTotal);
                        }
                    });
                    return [4 /*yield*/, InsertRows('transactions', transactionRecords, undefined, ["id", "businessId", "manualCategoryId"])];
                case 4:
                    transactions_result = (_d.sent()).result.rows;
                    categoryRecords = transactionRecords
                        .filter(function (t) { return t.category; })
                        .map(function (t) { return ({ name: t.category }); });
                    businessRecords = transactionRecords
                        .filter(function (t) { return t.description; })
                        .map(function (t) { return ({ name: t.description }); });
                    new_categorys_notification = [];
                    new_businesses_notification = [];
                    allNotifoctions = [];
                    if (!(categoryRecords.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, InsertRows('categories', categoryRecords, ["name"])];
                case 5:
                    new_categorys = (_d.sent()).result;
                    if (new_categorys.rowCount > 0) {
                        new_categorys_notification = [{
                                type: 'added_pending_values',
                                message: "Inserted ".concat(new_categorys.rowCount, " categorys, please check to approve or change."),
                                created_at: new Date().toISOString(),
                                buttons: [({ 'go to categories': new_categorys.rows.map(function (c) { return c.name; }) })],
                            }];
                        allNotifoctions.push.apply(allNotifoctions, new_categorys_notification);
                    }
                    _d.label = 6;
                case 6:
                    if (!(businessRecords.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, InsertRows('businesses', businessRecords, ["name"])];
                case 7:
                    new_businesses = (_d.sent()).result;
                    if (new_businesses.rowCount > 0) {
                        new_businesses_notification = [{
                                type: 'added_pending_values',
                                message: "Inserted ".concat(new_businesses.rowCount, " businesses, please check to approve or change."),
                                created_at: new Date().toISOString(),
                                buttons: [({ 'go to businesses': new_businesses.rows.map(function (b) { return b.name; }) })],
                            }];
                        allNotifoctions.push.apply(allNotifoctions, new_businesses_notification);
                    }
                    console.log("new_businesses_notification", new_businesses_notification);
                    _d.label = 8;
                case 8:
                    // הכנסת כל ההתראות לטבלת ההתראות במכה אחת
                    InsertRows('notifications', allNotifoctions, undefined, ["id"]);
                    // מטבלת הפנדינג מחיקת כל העסקאות  שהועברו לטבלת העסקאות
                    DeleteRows('pending_trx', transactions_result, ["date", "accountNumber", "chargedAmount", "description"]);
                    _d.label = 9;
                case 9: return [4 /*yield*/, client.query('COMMIT')];
                case 10:
                    _d.sent(); // שמירה ל-DB
                    console.log("Transactions inserted successfully");
                    return [2 /*return*/];
                case 11:
                    error_4 = _d.sent();
                    return [4 /*yield*/, client.query('ROLLBACK')];
                case 12:
                    _d.sent(); // במקרה של תקלה, ביטול השינויים
                    console.error("Error inserting transactions:", error_4);
                    return [3 /*break*/, 14];
                case 13:
                    client.release();
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
