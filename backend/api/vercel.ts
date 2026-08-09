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
    console.log("Serverless app initialization starting...");
    initializingPromise = initializeApp()
      .then(() => {
        handler = serverless(app as any);
        initialized = true;
        console.log("Serverless app initialization completed");
      })
      .catch((error) => {
        initializingPromise = null;
        throw error;
      });
  }

  await initializingPromise;
};

export default async function vercelHandler(req: any, res: any) {
  console.log(
    `Vercel handler invoked: initialized=${initialized}, initializingPromise=${Boolean(initializingPromise)}`,
  );

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
