require("dotenv").config();

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_TEST = process.env.NODE_ENV === "test";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const BLOCK_CYPHER_CHAIN = process.env.BLOCK_CYPHER_CHAIN;
const BLOCK_CYPHER_TOKEN = process.env.BLOCK_CYPHER_TOKEN;
const PORT = process.env.PORT;

const PUBLIC_URL_CLIENT = process.env.PUBLIC_URL_CLIENT;
const NGROK_URL = process.env.NGROK_URL;

if (IS_DEVELOPMENT && !PORT) {
  throw new Error("PORT not defined in .env");
}

if (IS_DEVELOPMENT && !NGROK_URL) {
  throw new Error("NGROK_URL not defined in .env");
}

const PUBLIC_URL = IS_PRODUCTION
  ? process.env.PUBLIC_URL
  : `http://localhost:${PORT}`;

export {
  PORT,
  PUBLIC_URL,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  IS_TEST,
  BLOCK_CYPHER_CHAIN,
  BLOCK_CYPHER_TOKEN,
  NGROK_URL,
  PUBLIC_URL_CLIENT
};
