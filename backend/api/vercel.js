"use strict";
const serverless = require("serverless-http");
const { default: app, initializeApp } = require("../src/server");

let initialized = false;
let handler;

async function vercelHandler(req, res) {
  if (!initialized) {
    initialized = true;
    try {
      await initializeApp();
      handler = serverless(app);
      console.log("App initialized for serverless function");
    } catch (err) {
      console.error("Serverless initialization failed:", err);
      res.statusCode = 500;
      res.end("Server initialization error");
      return;
    }
  }
  return handler(req, res);
}

module.exports = vercelHandler;
