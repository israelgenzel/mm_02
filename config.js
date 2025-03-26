"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.credentials = void 0;
var dotenv_1 = require("dotenv");
dotenv_1.default.config();
exports.credentials = [
    {
        name: "visaCal",
        username: process.env.VISACAL_USER_NAME || "",
        userCode: null,
        password: process.env.VISACAL_PASS || "",
    },
    {
        name: "hapoalim",
        username: null,
        userCode: process.env.HAPOALIM_USER_CODE || "",
        password: process.env.HAPOALIM_PASS || "",
    }
];
