"use strict";
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app")({
  // logger: true,
  ajv: {
    customOptions: {
      $data: true,
    },
  },
});

const start = async () => {
  try {
    await app.ready();

    await app.listen({
      port: process.env.PORT || 3000,
      host: process.env.HOST || "0.0.0.0",
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
