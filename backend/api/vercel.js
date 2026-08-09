"use strict";
const serverless = require("serverless-http");
const { default: app, initializeApp } = require("../src/server");

let initialized = false;
let initializingPromise = null;
let handler = null;

const normalizePath = (value) => {
  if (!value) {
    return null;
  }

  const raw = Array.isArray(value) ? value[0] : String(value);
  if (!raw) {
    return null;
  }

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path === "/health" || path.startsWith("/api/")) {
    return path;
  }

  return `/api${path}`;
};

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

  const forwardedPath = normalizePath(
    req.query?.path ||
      req.query?.pathname ||
      req.headers?.["x-vercel-original-url"] ||
      req.headers?.["x-original-url"] ||
      req.headers?.["x-invoke-path"] ||
      req.headers?.["x-matched-path"] ||
      req.headers?.["x-forwarded-uri"],
  );

  if (forwardedPath) {
    req.url = forwardedPath;
    req.originalUrl = forwardedPath;
    console.log(`Restored forwarded path: ${forwardedPath}`);
  }

  return handler(req, res);
}

module.exports = vercelHandler;
