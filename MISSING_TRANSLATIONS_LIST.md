# Missing Translations Report

## Summary

Comparing all three translation files: **en.json**, **hi.json**, and **mr.json**

---

## ✅ MATCHING KEYS (All languages have same structure)

- All top-level sections exist in all three files
- Basic structure is complete

---

## ⚠️ MISSING/INCOMPLETE TRANSLATIONS FOUND

### 1. **admin.productVideos & admin.productImages** (in mr.json)

**Status**: Marathi file has HINDI text instead of Marathi

```json
// mr.json currently has:
"productImages": "उत्पाद छवियाँ",  // ← This is HINDI
"productVideos": "उत्पाद वीडियो",   // ← This is HINDI

// Should be MARATHI:
"productImages": "उत्पाद चित्रे",
"productVideos": "उत्पाद व्हिडिओ",
```

### 2. **admin section** - missing translations

**Line 202-206 in mr.json:**

```json
"chooseImages": "छवियाँ चुनें",      // ← HINDI text, should be Marathi
"chooseVideos": "वीडियो चुनें",      // ← HINDI text, should be Marathi
"uploadVideos": "वीडियो अपलोड करें",  // ← HINDI text, should be Marathi
```

### 3. **common.newsletter** (in mr.json)

**Status**: Missing "newsletter" section completely

```json
// mr.json MISSING - should have:
"newsletter": {
    "unsubscribing": "....",
    "unsubscribeSuccess": "....",
    etc
}
```

---

## 🔴 SYNTAX ERRORS IN mr.json

### In "common" section - Hindi text mixed with Marathi:

- Lines 201-204: Hindi translations in Marathi file
- These keys have correct Marathi translations needed

---

## 📋 FIXES NEEDED

### Fix 1: Replace admin.productImages & productVideos in mr.json

```marathi
"productImages": "उत्पाद चित्रे",
"productVideos": "उत्पाद व्हिडिओ",
"chooseImages": "चित्रे निवडा",
"chooseVideos": "व्हिडिओ निवडा",
"uploadVideos": "व्हिडिओ अपलोड करा",
```

### Fix 2: Add missing newsletter section in mr.json

All other content is in Marathi file but newsletter section needs to be added.

---

## STATUS CHECK DETAILED

| Section    | en.json | hi.json | mr.json             |
| ---------- | ------- | ------- | ------------------- |
| app        | ✅      | ✅      | ✅                  |
| search     | ✅      | ✅      | ✅                  |
| nav        | ✅      | ✅      | ✅                  |
| auth       | ✅      | ✅      | ✅                  |
| products   | ✅      | ✅      | ✅                  |
| cart       | ✅      | ✅      | ✅                  |
| checkout   | ✅      | ✅      | ✅ (+ tax)          |
| orders     | ✅      | ✅      | ✅                  |
| errors     | ✅      | ✅      | ✅                  |
| success    | ✅      | ✅      | ✅                  |
| admin      | ✅      | ✅      | ⚠️ (has Hindi text) |
| wishlist   | ✅      | ✅      | ✅                  |
| compare    | ✅      | ✅      | ✅                  |
| address    | ✅      | ✅      | ✅                  |
| common     | ✅      | ✅      | ✅                  |
| newsletter | ✅      | ✅      | ❌ MISSING          |
| footer     | ✅      | ✅      | ✅                  |
| categories | ✅      | ✅      | ✅                  |
| payment    | ✅      | ✅      | ✅                  |
| months     | ✅      | ✅      | ✅                  |
| states     | ✅      | ✅      | ✅                  |
| cities     | ✅      | ✅      | ✅                  |
| legal      | ✅      | ✅      | ✅                  |
| notFound   | ✅      | ✅      | ✅                  |

---

## CRITICAL ISSUES TO FIX

1. **mr.json admin section has Hindi text (Lines 202-206)**
   - `chooseImages`, `chooseVideos`, `uploadVideos` are in Hindi

2. **mr.json completely missing newsletter section**

3. **mr.json - admin.productImages & productVideos** have Hindi translations

---

## RECOMMENDATION

Fix these 3 issues:

1. Translate Hindi text in admin section to Marathi
2. Add complete newsletter section in Marathi
3. Review for any other mixed-language content
