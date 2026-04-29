---
name: localization-audit
description: "Use when asked to check for missing translations, raw strings, or synchronization issues across i18n locale files. Keywords: check translations, missing keys, i18n audit, fix locales."
---

# Localization Audit Skill

## Objective
Audit the application to ensure every user-facing string is localized and synchronized across all supported languages.

## Workflow

1.  **Code Scan**:
    - Use `grep` or semantic search to find all instances of `t('...')` in `frontend/src`.
    - Find all hardcoded text in JSX/TSX files (e.g., text nodes inside `Typography`, `Button`, `Alert`).

2.  **Key Extraction**:
    - Build a list of all required translation keys found in the code.

3.  **JSON Comparison**:
    - Load `en.json`, `hi.json`, and `mr.json`.
    - Compare the extracted list against these files.
    - Identify missing keys or empty values.

4.  **Reporting**:
    - List all missing keys per file.
    - List all hardcoded strings that need to be converted to `t()` calls.

5.  **Fixing**:
    - Generate the missing JSON entries with appropriate translations.
    - Replace hardcoded strings in the code with the new keys.

## Guardrails
- Always maintain the existing JSON structure.
- Do not use machine translation for complex technical terms without verifying context.
- Ensure pluralization and interpolation (e.g., `{{count}}`) are handled correctly if present.
