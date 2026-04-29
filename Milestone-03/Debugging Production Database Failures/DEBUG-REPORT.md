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
