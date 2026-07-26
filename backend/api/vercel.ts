import serverless from "serverless-http";
import app, { initializeApp } from "../src/server";

let initialized = false;
const handler = serverless(app as any);

export default async function vercelHandler(req: any, res: any) {
  if (!initialized) {
    initialized = true;
    try {
      await initializeApp();
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
