-- PRODUCT QUERIES
-- These queries work with the normalized 3NF schema.

-- Query 1
-- Get all products with supplier and inventory details
SELECT
    p.product_id,
    p.product_name,
    p.price,
    s.supplier_name,
    s.supplier_phone,
    s.supplier_email,
    w.warehouse_location,
    i.stock_quantity
FROM products p
JOIN suppliers s ON s.supplier_id = p.supplier_id
LEFT JOIN inventory i ON i.product_id = p.product_id
LEFT JOIN warehouses w ON w.warehouse_id = i.warehouse_id
ORDER BY p.product_id, w.warehouse_location;

-- Query 2
-- Find products under a specific category
SELECT
    p.product_id,
    p.product_name,
    p.price,
    c.category_name
FROM products p
JOIN product_categories pc ON pc.product_id = p.product_id
JOIN categories c ON c.category_id = pc.category_id
WHERE c.category_name = 'Electronics'
ORDER BY p.product_id;

-- Query 3
-- Find supplier details for each product
SELECT
    p.product_name,
    s.supplier_name,
    s.supplier_phone,
    s.supplier_email
FROM products p
JOIN suppliers s ON s.supplier_id = p.supplier_id
ORDER BY p.product_name;

-- Query 4
-- Find products with low stock
SELECT
    p.product_name,
    i.stock_quantity,
    w.warehouse_location
FROM products p
JOIN inventory i ON i.product_id = p.product_id
JOIN warehouses w ON w.warehouse_id = i.warehouse_id
WHERE i.stock_quantity < 10
ORDER BY i.stock_quantity, p.product_name;
