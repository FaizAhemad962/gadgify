import serverless from "serverless-http";
import app, { initializeApp } from "../src/server";

let initialized = false;
let initializingPromise: Promise<void> | null = null;
let handler: any = null;

const initializeServerlessApp = async () => {
  if (initialized && handler) {
    return;
  }

  if (!initializingPromise) {
    initializingPromise = initializeApp()
      .then(() => {
        handler = serverless(app as any);
        initialized = true;
      })
      .catch((error) => {
        initializingPromise = null;
        throw error;
      });
  }

  await initializingPromise;
};

export default async function vercelHandler(req: any, res: any) {
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
