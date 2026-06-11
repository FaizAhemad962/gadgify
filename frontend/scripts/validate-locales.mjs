import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const localeDir = join(rootDir, "src", "i18n", "locales");
const localeFiles = ["en.json", "hi.json", "mr.json"];

const readJson = (fileName) => {
  const filePath = join(localeDir, fileName);
  const source = readFileSync(filePath, "utf8");
  const duplicateKeys = findDuplicateKeys(source, fileName);

  let data;
  try {
    data = JSON.parse(source);
  } catch (error) {
    throw new Error(`${fileName}: invalid JSON - ${error.message}`);
  }

  return { data, duplicateKeys };
};

const readString = (source, index) => {
  let value = "";
  let i = index + 1;

  while (i < source.length) {
    const char = source[i];

    if (char === "\\") {
      value += source.slice(i, i + 2);
      i += 2;
      continue;
    }

    if (char === "\"") {
      return { value, end: i + 1 };
    }

    value += char;
    i += 1;
  }

  throw new Error("Unterminated string in locale JSON");
};

const skipWhitespace = (source, index) => {
  let i = index;
  while (i < source.length && /\s/.test(source[i])) i += 1;
  return i;
};

function findDuplicateKeys(source, fileName) {
  const stack = [];
  const duplicates = [];
  let i = 0;
  let expectingKey = false;

  while (i < source.length) {
    const char = source[i];

    if (char === "\"") {
      const { value, end } = readString(source, i);
      const next = skipWhitespace(source, end);

      if (expectingKey && source[next] === ":" && stack.length > 0) {
        const current = stack[stack.length - 1];
        const normalized = value.toLowerCase();
        const existing = current.keys.get(normalized);

        if (existing) {
          duplicates.push(`${fileName}: ${current.path}.${value} duplicates ${existing}`);
        } else {
          current.keys.set(normalized, value);
        }

        current.pendingKey = value;
        expectingKey = false;
      }

      i = end;
      continue;
    }

    if (char === "{") {
      const parent = stack[stack.length - 1];
      const path = parent?.pendingKey
        ? `${parent.path}.${parent.pendingKey}`
        : "$";
      if (parent) parent.pendingKey = "";
      stack.push({ keys: new Map(), path, pendingKey: "" });
      expectingKey = true;
    } else if (char === "}") {
      stack.pop();
      expectingKey = false;
    } else if (char === ",") {
      const current = stack[stack.length - 1];
      if (current) current.pendingKey = "";
      expectingKey = stack.length > 0;
    }

    i += 1;
  }

  return duplicates;
}

const flattenKeys = (value, prefix = "") => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
};

const result = new Map(localeFiles.map((file) => [file, readJson(file)]));
const issues = [];

for (const [file, { duplicateKeys }] of result) {
  issues.push(...duplicateKeys);
}

const enKeys = new Set(flattenKeys(result.get("en.json").data));

for (const file of localeFiles.filter((fileName) => fileName !== "en.json")) {
  const localeKeys = new Set(flattenKeys(result.get(file).data));
  const missing = [...enKeys].filter((key) => !localeKeys.has(key));

  if (missing.length > 0) {
    issues.push(`${file}: missing keys:\n  ${missing.join("\n  ")}`);
  }
}

if (issues.length > 0) {
  console.error(issues.join("\n\n"));
  process.exit(1);
}

console.log("Locale files are valid.");
