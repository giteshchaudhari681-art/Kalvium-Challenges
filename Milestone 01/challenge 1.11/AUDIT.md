# Pre-Refactor Audit - Dev Confessions

> Move 1: Full audit written before any code was changed.

---

## 1. Meaningless Variable Names

| Location | Variable | Problem |
|---|---|---|
| app.js line 5 | `x` | Counter with no indication it tracks confession IDs |
| app.js line 7 | `d` | Holds request body; could mean anything |
| app.js line 8 | `r` | Holds request params; single letter tells nothing |
| app.js line 41 | `arr` | Holds sorted confessions array; name gives no context |
| app.js line 49 | `i` | Parsed integer ID; too short and ambiguous |
| app.js line 50 | `info` | Holds found confession; vague - "info" about what? |
| app.js line 65 | `x` (filter param) | Shadows outer `x` and communicates nothing |
| app.js line 80 | `i` | Duplicate of line 49's problem in a different branch |
| app.js line 81 | `handler` | Hold an array index; "handler" implies a function |
| app.js line 83 | `res2` | Holds splice result; collides visually with `res` (response) |
| app.js line 111 | `startStr` | Redundant variable just to hold a one-time log string |

---

## 2. Monolithic Function - Too Many Responsibilities

**`handleAll()` - app.js lines 6-96**  
A single 90-line function with a `t` (type) switch-parameter that handles:
1. Input validation (lines 10-39)
2. Database write / create (lines 18-26)
3. Fetching all records (lines 40-47)
4. Fetching a single record by ID (lines 48-60)
5. Filtering by category (lines 61-74)
6. Deleting a record (lines 75-92)

Six behaviours in one function - untestable, unreadable, violates Single Responsibility Principle.

---

## 3. No Folder / File Structure (Everything in One File)

`app.js` contains all of the following with no separation:
- Express app initialisation
- In-memory database (`confessions` array)
- All business logic
- All route definitions
- Server startup (`app.listen`)

No `routes/`, `controllers/`, or `services/` folders exist.

---

## 4. Hardcoded Values

| Line | Value | Problem |
|---|---|---|
| app.js line 16 | `["bug", "deadline", "imposter", "vibe-code"]` | Valid categories duplicated verbatim on line 63 |
| app.js line 63 | `["bug", "deadline", "imposter", "vibe-code"]` | Same array defined twice - two sources of truth |
| app.js line 76 | `'supersecret123'` | Delete token hardcoded directly in logic |
| app.js line 110 | `3000` | Port number hardcoded |

---

## 5. Inconsistent Error Response Format

| Line | Response |
|---|---|
| 11 | `{msg: 'bad'}` |
| 28 | Plain string `"category not in stuff"` |
| 31 | Plain string `"too short"` |
| 34 | `{ error: "text too big..."}` - different key (`error` vs `msg`) |
| 37 | `{msg: 'need text'}` |
| 56 | Plain string `"broken"` |
| 87 | `{msg: "not found buddy"}` (informal) |
| 90 | Plain string `"no id"` |

Eight different error shapes across one 117-line file.

---

## 6. Deeply Nested Conditionals

`handleAll` `create` branch (lines 10-38) has **5 levels of nesting** - classic arrow anti-pattern. Should use guard clauses / early returns instead.

---

## 7. Dead / Unreachable Code

- **app.js lines 114-116**: `if (confessions.length > 500)` check runs **once** at startup when the array is always empty. It will never log "too many".

---

## 8. No Comments or Documentation

Zero inline comments explaining *why* any decision was made. The delete token check, the 500-character limit, the category whitelist - none of these have explanatory comments.

---

## 9. Route Conflict (Express Bug)

- `GET /api/v1/confessions/:id` (line 99) and `GET /api/v1/confessions/category/:cat` (line 102) - Express will match `category` as an `:id` value before reaching the category route because the wildcard route is registered first. These two routes are in the wrong order.

---

## 10. `var` Instead of `const`/`let`

`var` is used throughout, giving function-scoped rather than block-scoped variables. `const` and `let` are the modern standard and prevent accidental re-declaration.

---

## Summary Count

| Category | Count |
|---|---|
| Meaningless variable names | 11 |
| Monolithic function responsibilities | 6 |
| Missing folder structure | 1 (entire project) |
| Hardcoded values | 4 |
| Inconsistent error shapes | 8 |
| Deeply nested conditional levels | 5 |
| Dead/unreachable code blocks | 1 |
| Missing comments | 0 of N (all) |
| Route ordering bugs | 1 |
| `var` misuse | 10+ |

> Everything on this list is fixed in the refactor below.
