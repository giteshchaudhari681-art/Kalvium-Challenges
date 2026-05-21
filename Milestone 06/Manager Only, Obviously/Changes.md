# Changes

## Role Gap Audit
Pre-fix audit was run with the seeded `user@expenseapp.io` account before any RBAC code was added.

| Method | Endpoint | Pre-fix response | Why it was a gap |
| --- | --- | --- | --- |
| `GET` | `/api/expenses` | `200 OK` | A regular employee could view every employee's expenses. |
| `PUT` | `/api/expenses/:id/approve` | `200 OK` | A regular employee could approve expenses. |
| `PUT` | `/api/expenses/:id/reject` | `200 OK` | A regular employee could reject expenses. |
| `DELETE` | `/api/expenses/:id` | `200 OK` | A regular employee could delete another user's expense record. |
| `GET` | `/api/users` | `200 OK` | A regular employee could enumerate all users and roles. |
| `PUT` | `/api/users/:id/role` | `200 OK` | A regular employee could promote themself to `admin`. |
| `PUT` | `/api/users/:id/role` | `200 OK` | A regular employee could demote or alter colleagues' roles. |
| `PUT` | `/api/expenses/:id` | `200 OK` | A regular employee could edit another user's submitted expense. |

Pre-fix JWT audit result:

| Login | Decoded JWT payload fields |
| --- | --- |
| `user@expenseapp.io` | `userId`, `email`, `iat`, `exp` |

The `role` claim was missing from the JWT before the fix.

## Checkpoint 1
User role storage was already correct in [models/User.js](/d:/Challenges/challenge%206.10/Kalvium-Challenges/Milestone%2006/Manager%20Only,%20Obviously/models/User.js:4). The schema defines `role` as a string enum with allowed values `user`, `manager`, and `admin`, and defaults to `user`.

The JWT payload was incomplete before the fix in [controllers/authController.js](/d:/Challenges/challenge%206.10/Kalvium-Challenges/Milestone%2006/Manager%20Only,%20Obviously/controllers/authController.js:10). It signed `userId` and `email`, but not `role`.

Consequence:
In this codebase, `protect` reloads `req.user` from MongoDB in [middleware/authMiddleware.js](/d:/Challenges/challenge%206.10/Kalvium-Challenges/Milestone%2006/Manager%20Only,%20Obviously/middleware/authMiddleware.js:4), so route-level role checks can still work after hydration. But the token itself carried no role context, which means any middleware that relied only on decoded JWT claims would see `undefined` for `role`.

## Checkpoint 2
No role middleware existed before the fix. The only auth guard was `protect` in [middleware/authMiddleware.js](/d:/Challenges/challenge%206.10/Kalvium-Challenges/Milestone%2006/Manager%20Only,%20Obviously/middleware/authMiddleware.js:4), which only authenticated the caller and attached the user record.

What existed:
`protect` verified the JWT and loaded `req.user`.

What was missing:
No `requireRole(...)` middleware existed anywhere, and no route performed centralized role authorization.

## Checkpoint 3
Route protection coverage before the fix:

| Route | Sensitive? | Currently Restricted? | Should Be Restricted To |
| --- | --- | --- | --- |
| `GET /api/expenses` | Yes | `protect` only | `manager`, `admin` |
| `GET /api/expenses/mine` | No | `protect` only | `user`, `manager`, `admin` |
| `POST /api/expenses` | No | `protect` only | `user`, `manager`, `admin` |
| `PUT /api/expenses/:id` | Yes | `protect` only | Owner only |
| `PUT /api/expenses/:id/approve` | Yes | `protect` only | `manager`, `admin` |
| `PUT /api/expenses/:id/reject` | Yes | `protect` only | `manager`, `admin` |
| `DELETE /api/expenses/:id` | Yes | `protect` only | `admin` |
| `GET /api/users` | Yes | `protect` only | `admin` |
| `PUT /api/users/:id/role` | Yes | `protect` only | `admin` |
| `GET /api/users/me` | No | `protect` only | `user`, `manager`, `admin` |

## Checkpoint 4
The ownership gap was in the expense update path. Pre-fix `updateExpense` used `findByIdAndUpdate` directly with no ownership check, so User A could edit User B's expense record.

Pre-fix `deleteExpense` also had no ownership or role gate in the controller, but the final product access model for deletion is stricter: deletion is `admin` only. I enforced the table exactly by role-gating deletion at the route layer and keeping the controller focused on existence plus delete.

## Root Cause Analysis
| Gap | File and line | Missing control | Exploit impact |
| --- | --- | --- | --- |
| JWT omitted role | `controllers/authController.js:11-15`, `42-45` | `role` was not signed into the token payload | Any token-only authorization strategy would lack role context. |
| View all expenses open to every authenticated user | `routes/expenseRoutes.js:16` | `requireRole('manager', 'admin')` | A regular employee could read all expense records. |
| Approve expense open to every authenticated user | `routes/expenseRoutes.js:20` | `requireRole('manager', 'admin')` | A regular employee could approve their own expense or someone else's. |
| Reject expense open to every authenticated user | `routes/expenseRoutes.js:21` | `requireRole('manager', 'admin')` | A regular employee could reject expense records. |
| Delete expense open to every authenticated user | `routes/expenseRoutes.js:22` | `requireRole('admin')` | A regular employee could delete colleagues' records. |
| View all users open to every authenticated user | `routes/userRoutes.js:8` | `requireRole('admin')` | A regular employee could enumerate internal users and roles. |
| Change role open to every authenticated user | `routes/userRoutes.js:9` | `requireRole('admin')` | A regular employee could promote themself to admin or tamper with colleagues' roles. |
| Expense update lacked ownership enforcement | `controllers/expenseController.js:36-54` | Owner check before mutation | A regular employee could alter another employee's submitted expense content. |

## Access Model
| Action | Endpoint | Before fix | After fix |
| --- | --- | --- | --- |
| Submit an expense | `POST /api/expenses` | Any authenticated user | `user`, `manager`, `admin` |
| View own expenses | `GET /api/expenses/mine` | Any authenticated user | `user`, `manager`, `admin` |
| View all expenses | `GET /api/expenses` | Any authenticated user | `manager`, `admin` |
| Approve an expense | `PUT /api/expenses/:id/approve` | Any authenticated user | `manager`, `admin` |
| Reject an expense | `PUT /api/expenses/:id/reject` | Any authenticated user | `manager`, `admin` |
| Delete an expense | `DELETE /api/expenses/:id` | Any authenticated user | `admin` |
| View all users | `GET /api/users` | Any authenticated user | `admin` |
| Change a user's role | `PUT /api/users/:id/role` | Any authenticated user | `admin` |
| View own profile | `GET /api/users/me` | Any authenticated user | `user`, `manager`, `admin` |
| Edit an expense's content | `PUT /api/expenses/:id` | Any authenticated user | Owner only |

## What I Fixed
Added [middleware/roleMiddleware.js](/d:/Challenges/challenge%206.10/Kalvium-Challenges/Milestone%2006/Manager%20Only,%20Obviously/middleware/roleMiddleware.js:1) and applied it between `protect` and the controller on every sensitive route. I also updated JWT signing in [controllers/authController.js](/d:/Challenges/challenge%206.10/Kalvium-Challenges/Milestone%2006/Manager%20Only,%20Obviously/controllers/authController.js:11) and added an owner check in [controllers/expenseController.js](/d:/Challenges/challenge%206.10/Kalvium-Challenges/Milestone%2006/Manager%20Only,%20Obviously/controllers/expenseController.js:36).

Expense routes before:

```js
router.get('/', protect, getAllExpenses);
router.get('/mine', protect, getMyExpenses);
router.post('/', protect, createExpense);
router.put('/:id', protect, updateExpense);
router.put('/:id/approve', protect, approveExpense);
router.put('/:id/reject', protect, rejectExpense);
router.delete('/:id', protect, deleteExpense);
```

Expense routes after:

```js
router.get('/', protect, requireRole('manager', 'admin'), getAllExpenses);
router.get('/mine', protect, getMyExpenses);
router.post('/', protect, createExpense);
router.put('/:id', protect, updateExpense);
router.put('/:id/approve', protect, requireRole('manager', 'admin'), approveExpense);
router.put('/:id/reject', protect, requireRole('manager', 'admin'), rejectExpense);
router.delete('/:id', protect, requireRole('admin'), deleteExpense);
```

User routes before:

```js
router.get('/', protect, getAllUsers);
router.put('/:id/role', protect, updateUserRole);
router.get('/me', protect, getUserProfile);
```

User routes after:

```js
router.get('/', protect, requireRole('admin'), getAllUsers);
router.put('/:id/role', protect, requireRole('admin'), updateUserRole);
router.get('/me', protect, getUserProfile);
```

JWT payload before:

```js
jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)
```

JWT payload after:

```js
jwt.sign(
  { userId: user._id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)
```

Expense update before:

```js
const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
res.json(expense);
```

Expense update after:

```js
const expense = await Expense.findById(req.params.id);

if (!expense) {
  return res.status(404).json({ message: 'Expense not found' });
}

const isOwner = expense.submittedBy.toString() === req.user._id.toString();

if (!isOwner) {
  return res.status(403).json({ message: 'You can only modify your own expenses.' });
}
```

## Verification Results
| Scenario | Token used | Expected status | Actual status | Screenshot |
| --- | --- | --- | --- | --- |
| Regular user tries `PUT /api/expenses/:id/approve` | `user` | `403` | `403` | `screenshots/01-user-approve.png` |
| Regular user tries `DELETE /api/expenses/:id` | `user` | `403` | `403` | `screenshots/02-user-delete.png` |
| Regular user tries `PUT /api/users/:id/role` | `user` | `403` | `403` | `screenshots/03-user-role.png` |
| Regular user tries to edit another user's expense | `user` | `403` | `403` | `screenshots/04-user-edit-other.png` |
| Manager approves an expense | `manager` | `200` | `200` | `screenshots/05-manager-approve.png` |
| Manager tries to change a user's role | `manager` | `403` | `403` | `screenshots/06-manager-role.png` |
| Admin deletes an expense | `admin` | `200` | `200` | `screenshots/07-admin-delete.png` |
| Admin changes a user's role | `admin` | `200` | `200` | `screenshots/08-admin-role.png` |
