# DEBUG REPORT

## Bug 1 Reproduction

### Symptom
Some orders appear with a recorded `customer_id` but no matching customer record.

### Reproduction Query
```sql
SELECT
  o.id,
  o.customer_id,
  c.name AS customer_name,
  o.status,
  o.total
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE c.id IS NULL
ORDER BY o.id;
```

### Result Before Fix
```text
 id | customer_id | customer_name |  status   | total
----+-------------+---------------+-----------+-------
  3 |        9999 |               | completed | 50.00
  4 |        9999 |               | pending   | 75.00
```

## Bug 2 Reproduction

### Symptom
Some products have negative inventory counts.

### Reproduction Query
```sql
SELECT
  id,
  name,
  sku,
  inventory_count
FROM products
WHERE inventory_count < 0
ORDER BY id;
```

### Result Before Fix
```text
 id |       name       |   sku   | inventory_count
----+------------------+---------+-----------------
  2 | Wireless Mouse   | SKU-002 |              -3
  3 | USB-C Cable (1m) | SKU-003 |              -5
```

## Bug 3 Reproduction

### Symptom
Some orders have multiple payment rows and conflicting statuses.

### Reproduction Query
```sql
SELECT
  order_id,
  COUNT(*) AS payment_rows,
  STRING_AGG(status, ', ' ORDER BY created_at) AS statuses
FROM payments
GROUP BY order_id
HAVING COUNT(*) > 1
ORDER BY order_id;
```

### Result Before Fix
```text
 order_id | payment_rows |      statuses
----------+--------------+--------------------
        1 |            2 | pending, completed
```

## Bug 1 Investigation

### Data Flow Trace
`GET /orders` in `routes/orders.js` runs a `LEFT JOIN` from `orders` to `customers`.
The null `customer_name` in the API response comes from `orders.customer_id = 9999` on rows `3` and `4`.
Those rows were created by the `INSERT INTO orders` statement in `seed.sql`.
The same bad write is also possible through `POST /orders`, which inserts any `customer_id` it receives.
The schema allowed that write because `orders.customer_id` had no foreign key to `customers(id)`.

### Root Cause
Missing foreign key constraint on `orders.customer_id` referencing `customers(id)`.

### Fix Applied
```sql
ALTER TABLE orders
ADD CONSTRAINT orders_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES customers(id);
```

Why this fixes it: the database now rejects any order row whose `customer_id` does not exist in `customers`.

### Validation
Re-run of the reproduction query after rebuilding the database with valid seed data:
```sql
SELECT
  o.id,
  o.customer_id,
  c.name AS customer_name,
  o.status,
  o.total
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE c.id IS NULL
ORDER BY o.id;
```

```text
 id | customer_id | customer_name | status | total
----+-------------+---------------+--------+-------
(0 rows)
```

Attempted bad insert:
```sql
INSERT INTO orders (customer_id, status, total)
VALUES (9999, 'pending', 10.00);
```

```text
ERROR:  insert or update on table "orders" violates foreign key constraint
DETAIL:  Key (customer_id)=(9999) is not present in table "customers".
```

## Bug 2 Investigation

### Data Flow Trace
`GET /products` in `routes/products.js` returns rows directly from `products`.
The negative values shown in the API come from `products.inventory_count`.
Those invalid rows were inserted in `seed.sql`, and more could be created by two write paths:
`POST /order_items` in `routes/order_items.js` subtracts quantity from `products.inventory_count`,
and `PATCH /products/:id/inventory` in `routes/products.js` applies any adjustment value.
The schema allowed both write paths to persist invalid data because `products.inventory_count`
had no check constraint preventing values below zero.

### Root Cause
Missing check constraint on `products.inventory_count` to enforce `inventory_count >= 0`.

### Fix Applied
```sql
ALTER TABLE products
ADD CONSTRAINT products_inventory_count_check
CHECK (inventory_count >= 0);
```

Why this fixes it: the database now rejects inserts or updates that would make inventory negative.

### Validation
Re-run of the reproduction query after rebuilding the database with valid seed data:
```sql
SELECT
  id,
  name,
  sku,
  inventory_count
FROM products
WHERE inventory_count < 0
ORDER BY id;
```

```text
 id | name | sku | inventory_count
----+------+-----+-----------------
(0 rows)
```

Attempted bad insert:
```sql
INSERT INTO products (name, sku, inventory_count, price)
VALUES ('Broken Stock Item', 'SKU-NEG', -1, 9.99);
```

```text
ERROR:  new row for relation "products" violates check constraint "products_inventory_count_check"
DETAIL:  Failing row contains (6, Broken Stock Item, SKU-NEG, -1, 9.99).
```

## Bug 3 Investigation

### Data Flow Trace
`GET /payments/:orderId` in `routes/payments.js` selects all rows from `payments` for one order.
The ambiguous `pending` and `completed` statuses come from multiple rows sharing the same `payments.order_id`.
Those duplicate rows were inserted in `seed.sql`, and the same problem can happen through `POST /payments`,
which always inserts a new row instead of updating an existing one.
The schema allowed that write because `payments.order_id` had no uniqueness constraint.

### Root Cause
Missing unique constraint on `payments.order_id`, allowing multiple payment rows for the same order.

### Fix Applied
```sql
ALTER TABLE payments
ADD CONSTRAINT payments_order_id_key UNIQUE (order_id);
```

Why this fixes it: the database now enforces one payment row per order, so conflicting statuses cannot coexist.

### Validation
Re-run of the reproduction query after rebuilding the database with valid seed data:
```sql
SELECT
  order_id,
  COUNT(*) AS payment_rows,
  STRING_AGG(status, ', ' ORDER BY created_at) AS statuses
FROM payments
GROUP BY order_id
HAVING COUNT(*) > 1
ORDER BY order_id;
```

```text
 order_id | payment_rows | statuses
----------+--------------+----------
(0 rows)
```

Attempted bad insert:
```sql
INSERT INTO payments (order_id, amount, status)
VALUES (1, 114.99, 'pending');
```

```text
ERROR:  duplicate key value violates unique constraint "payments_order_id_key"
DETAIL:  Key (order_id)=(1) already exists.
```
