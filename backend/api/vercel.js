"use strict";
const serverless = require("serverless-http");
const { default: app, initializeApp } = require("../src/server");

let initialized = false;
let initializingPromise = null;
let handler = null;

const initializeServerlessApp = async () => {
  if (initialized && handler) {
    return;
  }

  if (!initializingPromise) {
    initializingPromise = initializeApp()
      .then(() => {
        handler = serverless(app);
        initialized = true;
      })
      .catch((error) => {
        initializingPromise = null;
        throw error;
      });
  }

  await initializingPromise;
};

async function vercelHandler(req, res) {
  try {
    await initializeServerlessApp();
  } catch (err) {
    console.error("Serverless initialization failed:", err);
    res.statusCode = 500;
    res.end("Server initialization error");
    return;
  }

  return handler(req, res);
}

module.exports = vercelHandler;
