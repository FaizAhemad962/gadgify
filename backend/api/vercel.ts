import serverless from "serverless-http";
import app, { initializeApp } from "../src/server";

let initializationStarted = false;
let initialized = false;
const handler = serverless(app as any);

const startServerlessInitialization = () => {
  if (initializationStarted) {
    return;
  }

  initializationStarted = true;
  console.log("Serverless app initialization starting...");
  initializeApp()
    .then(() => {
      initialized = true;
      console.log("Serverless app initialization completed");
    })
    .catch((error) => {
      initializationStarted = false;
      console.error("Serverless initialization failed:", error);
    });
};

export default async function vercelHandler(req: any, res: any) {
  console.log(
    `Vercel handler invoked: initialized=${initialized}, initializationStarted=${initializationStarted}`,
  );

  startServerlessInitialization();

  return handler(req, res);
}
