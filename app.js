"use strict";
const path = require("path");
const fastify = require("fastify");
const autoload = require("@fastify/autoload");


function build(options = {}) {
  const app = fastify(options);


  app.register(autoload, {
    dir: path.join(__dirname, "plugins"),
  });

  app.register(autoload, {
    dir: path.join(__dirname, "routes"),
    dirNameRoutePrefix: true,
    options: { prefix: "/api" },
  });

  return app;
}

module.exports = build;
