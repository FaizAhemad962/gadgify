import serverless from "serverless-http";
import app, { initializeApp } from "../src/server";

let initializationStarted = false;
let initialized = false;

const resolveForwardedPath = (req: any): string | null => {
  const normalize = (value: unknown): string | null => {
    if (!value) return null;
    const raw = Array.isArray(value) ? value[0] : String(value);
    if (!raw) return null;
    const path = raw.startsWith("/") ? raw : `/${raw}`;
    if (path === "/health" || path.startsWith("/api/")) {
      return path;
    }
    return `/api${path}`;
  };

  const queryPath = normalize(req.query?.path || req.query?.pathname);
  if (queryPath) return queryPath;

  const headers = [
    req.headers?.["x-vercel-original-url"],
    req.headers?.["x-original-url"],
    req.headers?.["x-invoke-path"],
    req.headers?.["x-matched-path"],
    req.headers?.["x-forwarded-uri"],
  ].filter(Boolean) as string[];

  for (const value of headers) {
    try {
      const parsed = value.startsWith("http")
        ? new URL(value)
        : new URL(value, "http://localhost");
      if (parsed.pathname && parsed.pathname !== "/") {
        return normalize(`${parsed.pathname}${parsed.search}`);
      }
    } catch {
      if (value.startsWith("/")) {
        return normalize(value);
      }
    }
  }

  return null;
};

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

  const forwardedPath = resolveForwardedPath(req);
  if ((!req.url || req.url === "/") && forwardedPath) {
    req.url = forwardedPath;
    req.originalUrl = forwardedPath;
    console.log(`Restored forwarded path: ${forwardedPath}`);
  }

  startServerlessInitialization();

  return handler(req, res);
}
