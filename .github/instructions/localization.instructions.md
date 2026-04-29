# Localization Instructions - Gadgify

## Objective
Ensure 100% localization coverage across English (`en`), Hindi (`hi`), and Marathi (`mr`) for all user-facing strings.

## Workflow for AI Assistants

### 1. Scanning for Missing Keys
When asked to check for missing translations:
1.  **Search the codebase** (specifically `frontend/src/`) for usages of the `t()` function from `react-i18next`.
2.  **Extract the keys** used (e.g., `t('common.add')`).
3.  **Read the locale files**:
    - `frontend/src/i18n/locales/en.json`
    - `frontend/src/i18n/locales/hi.json`
    - `frontend/src/i18n/locales/mr.json`
4.  **Identify discrepancies**:
    - Keys present in code but missing in one or more JSON files.
    - Keys present in `en.json` but missing in `hi.json` or `mr.json`.
    - Keys that appear as raw strings in the UI (e.g., `<Typography>Add to Cart</Typography>` instead of using `t()`).

### 2. Implementation Rules
- **No Hardcoding**: All user-facing text must use the `t()` hook.
- **Nested Keys**: Use a structured hierarchy in JSON (e.g., `common`, `auth`, `products`, `cart`).
- **Sync All Files**: When adding a new key, you MUST add it to all three files (`en.json`, `hi.json`, `mr.json`).
- **Professional Translation**: Use context-aware translations. For example, "Buy Now" should be translated as a call-to-action, not a literal dictionary definition.

## Localization Skill
For a deep audit, refer to `.github/skills/localization-audit/SKILL.md`.
