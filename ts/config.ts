import dotenv from "dotenv";
dotenv.config();

export interface CompanyCredentials {
  name: string;
  username?: string;
  userCode?: string;
  password: string;
}

export const credentials: CompanyCredentials[] = [
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
