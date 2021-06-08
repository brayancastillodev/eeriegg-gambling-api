const {
  IS_PRODUCTION,
  NGROK_URL,
  PUBLIC_URL,
  PUBLIC_URL_CLIENT,
} = require("../js/global/env");

module.exports = {
  settings: {
    cors: {
      origin: [
        "http://localhost:5005",
        "http://localhost:8080",
        "http://localhost:8081",
        "https://eeriegg-test.herokuapp.com",
        "https://eeriegg-test.web.app",
        "https://eeriegg-test.firebaseapp.com",
        NGROK_URL,
      ],
    },
  },
};
