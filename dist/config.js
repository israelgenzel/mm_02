const dotenv = require("dotenv");
dotenv.config();
const credentials = [
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

module.exports = { credentials };
