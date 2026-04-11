# CHANGES.md - Refactor Decision Log

All changes made during the refactor of Dev Confessions. Every decision is documented here in the order the moves were applied.

---

## Section 1 - Variable Renames

| Old Name | New Name | Why |
|---|---|---|
| `x` (global counter) | `nextConfessionId` | `x` gave no hint it was an auto-incrementing ID counter |
| `d` | `confessionData` | `d` was the entire request body; name now matches its content |
| `r` | *(eliminated)* | Was only used to alias `req.params`; now accessed directly in each function |
| `arr` | `sortedConfessions` | Describes both the data type (array) and what it contains (sorted confessions) |
| `i` (getOne branch) | `confessionId` | `i` showed nothing about what integer was stored |
| `i` (del branch) | `confessionId` | Same problem; consistent rename across both usages |
| `info` | `confession` | `info` was vague; the variable holds a confession record |
| `x` (filter callback param) | `confession` | Shadowed outer `x` and communicated nothing |
| `handler` | `confessionIndex` | `handler` implies a function; this was an array index |
| `res2` | `deletedConfessions` | Visually identical to `res` (the response object); now clearly distinct |
| `startStr` | *(eliminated)* | Pointless intermediate variable for a one-line log string |
| `cats` | `VALID_CATEGORIES` | Moved to a named constant shared by both call sites |
| `categories` | `VALID_CATEGORIES` | Same constant; the duplicate definition is now removed |
| `stuff` | `filteredConfessions` | Describes both the type and what the filter produced |
| `tmp` | `newConfession` | `tmp` implied a throwaway object; this is the record being persisted |

---

## Section 2 - Function Splits

### `handleAll()` split into:

**Service layer (`services/confessionService.js`)**

- **`validateConfessionInput(confessionData)`** - validates the incoming body and returns a response descriptor when the request should fail. This keeps validation isolated while still preserving the original error payloads and content types.  
- **`saveConfession(confessionData)`** - assigns an ID, timestamps the record, pushes it to the store, and returns the new confession.  
- **`getAllConfessions()`** - returns a sorted newest-first copy of the store together with the total count.  
- **`getConfessionById(confessionId)`** - finds one record by ID. Returns `null` for not found and `undefined` for the original corrupt-record 500 branch.  
- **`getConfessionsByCategory(category)`** - validates the category whitelist, filters the store, and reverses the result for newest-first ordering.  
- **`deleteConfessionById(confessionId)`** - finds and splices the record, then returns the deleted confession or `null`.

**Controller layer (`controllers/confessionController.js`)**

- **`createConfession(req, res)`** - extracts the request body, delegates validation, and sends the exact original success or error payload.  
- **`listAllConfessions(req, res)`** - calls the service and returns the list response.  
- **`getConfessionById(req, res)`** - parses the ID, calls the service, and maps `null` and `undefined` to the original 404 and 500 responses.  
- **`getConfessionsByCategory(req, res)`** - extracts the category param, calls the service, and maps an invalid category to the original 400 response.  
- **`deleteConfession(req, res)`** - checks the delete token from `process.env`, parses the ID, calls the service, and preserves the original delete responses.

**Why:** The original `handleAll` mixed input validation, data persistence, result formatting, and authorization into one 90-line function controlled by a magic `t` parameter. That design made it impossible to test any single behaviour in isolation. Splitting into focused functions means each can be tested, replaced, or debugged independently.

---

## Section 3 - MVC Folder Structure

```
app.js                          <- entry point only (listen + middleware)
routes/confessionRoutes.js      <- HTTP verb + path -> controller
controllers/confessionController.js  <- extract request data, call service, send response
services/confessionService.js   <- all business logic + in-memory store
```

**Why:** The entire application lived in one 117-line file. Separating concerns by layer means each file has one reason to change. A route change only touches `routes/`. A business rule change only touches `services/`. A response format change only touches `controllers/`.

---

## Section 4 - Environment Variables

| Old (hardcoded) | New (env var) | File |
|---|---|---|
| `'supersecret123'` | `process.env.DELETE_SECRET_TOKEN` | `controllers/confessionController.js` |
| `3000` | `process.env.PORT \|\| 3000` | `app.js` |
| `["bug","deadline","imposter","vibe-code"]` (x2) | `VALID_CATEGORIES` constant (x1) | `services/confessionService.js` |

Added `.env` (git-ignored) and `.env.example` (committed) so any developer can see what variables are needed without exposing secrets.

---

## Section 5 - Bugs Fixed

| Bug | Fix |
|---|---|
| Route ordering: `GET /:id` registered before `GET /category/:cat` - Express matched `"category"` as an ID | Moved `/category/:cat` above `/:id` in `routes/confessionRoutes.js` |
| Dead code: `if (confessions.length > 500)` ran once at startup on an empty array and could never trigger | Removed entirely |
| `var` throughout - function-scoped, hoisted, prone to accidental re-declaration | Replaced with `const` and `let` everywhere |

---

## Section 6 - Inline Comments Added

Comments added in `services/confessionService.js` explain:
- Why `VALID_CATEGORIES` is a single named constant (single source of truth)
- Why `validateConfessionInput` is separate from `saveConfession` (testability)
- Why `.slice()` is used before `.sort()` (non-mutating - preserves store order)
- Why `undefined` vs `null` return values distinguish "not found" from "corrupt"
- Why the category route precedes the `:id` wildcard (Express greedy matching)
- Why the delete token comes from `process.env` (deployment secrets must not be in code)

## Section 7 - API Contract Preservation

- Preserved the original plain-text responses for `"category not in stuff"`, `"broken"`, and `"no id"` even after moving logic into MVC layers.
- Preserved the original JSON shapes for `{ msg: ... }` and `{ error: ... }` responses instead of normalizing everything to one schema.
- Preserved the original success payloads for create, list, get-by-id, category filter, and delete so the refactor does not break existing clients.
