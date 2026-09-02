use stockdesk_db;
-- USERS/////////////////////////////////////////////
insert into users(name,email,password_hash, role, is_active)values
('irfan','example@gamil.com','placeholder_1','admin',TRUE),
('imran','example1@gamil.com','placeholder_2','staff',TRUE);
-- CATEGORIES////////////////////////////////////////
insert into categories(name)values
('shirts'),
('pants');
insert into categories(name)values
('T-Shirts'),
('jeans'),
('jackets');
-- PRODUCTS////////////////////////////////////////////////////////
INSERT INTO products
(sku, name, category_id, cost_price, sale_price, quantity, reorder_level)
VALUES
-- Shirts
('SH-001', 'White Formal Shirt', 1, 1800.00, 2500.00, 25, 5),
('SH-002', 'Black Formal Shirt', 1, 1900.00, 2700.00, 18, 5),
('SH-003', 'Blue Oxford Shirt', 1, 2100.00, 2900.00, 15, 4),
('SH-004', 'Grey Casual Shirt', 1, 1600.00, 2300.00, 20, 5),
('SH-005', 'Checked Cotton Shirt', 1, 1700.00, 2400.00, 12, 4),
('SH-006', 'Navy Blue Shirt', 1, 1800.00, 2600.00, 16, 5),
('SH-007', 'Maroon Casual Shirt', 1, 1650.00, 2350.00, 10, 3),
('SH-008', 'Light Blue Dress Shirt', 1, 2000.00, 2800.00, 14, 4),

-- Pants
('PA-001', 'Black Formal Pants', 2, 2000.00, 3000.00, 15, 5),
('PA-002', 'Grey Formal Pants', 2, 1900.00, 2800.00, 12, 4),
('PA-003', 'Navy Casual Pants', 2, 1800.00, 2700.00, 20, 5),
('PA-004', 'Khaki Cotton Pants', 2, 1700.00, 2500.00, 18, 5),
('PA-005', 'Beige Casual Pants', 2, 1750.00, 2600.00, 10, 3),
('PA-006', 'Olive Cargo Pants', 2, 2200.00, 3200.00, 14, 4),
('PA-007', 'Dark Grey Pants', 2, 1950.00, 2850.00, 9, 3),
('PA-008', 'Slim Fit Black Pants', 2, 2100.00, 3100.00, 13, 4),

-- T-Shirts
('TS-001', 'Plain White T-Shirt', 3, 800.00, 1300.00, 30, 8),
('TS-002', 'Plain Black T-Shirt', 3, 850.00, 1400.00, 28, 8),
('TS-003', 'Navy Polo T-Shirt', 3, 1100.00, 1700.00, 20, 5),
('TS-004', 'Grey Polo T-Shirt', 3, 1050.00, 1650.00, 18, 5),
('TS-005', 'Red Casual T-Shirt', 3, 750.00, 1200.00, 25, 7),
('TS-006', 'Green Printed T-Shirt', 3, 900.00, 1450.00, 16, 5),
('TS-007', 'Blue Graphic T-Shirt', 3, 950.00, 1500.00, 22, 6),
('TS-008', 'Maroon Polo T-Shirt', 3, 1150.00, 1750.00, 11, 4),

-- Jeans
('JN-001', 'Classic Blue Jeans', 4, 2500.00, 3500.00, 20, 5),
('JN-002', 'Black Slim Fit Jeans', 4, 2700.00, 3800.00, 14, 4),
('JN-003', 'Dark Blue Straight Jeans', 4, 2400.00, 3400.00, 16, 5),
('JN-004', 'Light Blue Relaxed Jeans', 4, 2300.00, 3300.00, 12, 4),
('JN-005', 'Grey Slim Jeans', 4, 2600.00, 3700.00, 10, 3),
('JN-006', 'Washed Blue Jeans', 4, 2450.00, 3500.00, 18, 5),
('JN-007', 'Dark Grey Jeans', 4, 2550.00, 3650.00, 8, 3),
('JN-008', 'Mid Blue Regular Jeans', 4, 2350.00, 3350.00, 15, 4),

-- Jackets
('JK-001', 'Black Denim Jacket', 5, 3000.00, 4500.00, 10, 3),
('JK-002', 'Blue Denim Jacket', 5, 2900.00, 4300.00, 8, 3),
('JK-003', 'Brown Casual Jacket', 5, 3500.00, 5000.00, 7, 2),
('JK-004', 'Black Bomber Jacket', 5, 3800.00, 5500.00, 9, 3),
('JK-005', 'Navy Winter Jacket', 5, 4000.00, 6000.00, 6, 2),
('JK-006', 'Grey Hooded Jacket', 5, 3200.00, 4800.00, 11, 3),
('JK-007', 'Olive Casual Jacket', 5, 3400.00, 4900.00, 5, 2),
('JK-008', 'Leather Look Jacket', 5, 4200.00, 6500.00, 4, 2);
-- CUSTOMERS///////////////////////////////////////////////////////////////////
insert into customers(name,phone,email,address)values
('ali','0303033','example3@gmail.com','xyz'),
('ahmed','0303033','example3@gmail.com','xyz'),
('luqman','0303033','example3@gmail.com','xyz'),
('raza','0303033','example3@gmail.com','xyz'),
('imran','0303033','example3@gmail.com','xyz'),
('adnan','0303033','example3@gmail.com','xyz'),
('hanan','0303033','example3@gmail.com','xyz'),
('shuaib','0303033','example3@gmail.com','xyz'),
('fawad','0303033','example3@gmail.com','xyz'),
('yasir','0303033','example3@gmail.com','xyz');
-- INVOICES////////////////////////////////////////////////////////////////////
INSERT INTO invoices
(invoice_no, customer_id, user_id, subtotal, discount, tax, total, status)
VALUES
('INV-001', 1, 1, 5000.00, 200.00, 240.00, 5040.00, 'paid'),
('INV-002', 2, 1, 7500.00, 500.00, 350.00, 7350.00, 'paid'),
('INV-003', 3, 2, 3200.00, 0.00, 160.00, 3360.00, 'unpaid'),
('INV-004', 4, 2, 8500.00, 500.00, 400.00, 8400.00, 'unpaid'),
('INV-005', 5, 1, 4200.00, 200.00, 200.00, 4200.00, 'paid'),
('INV-006', 6, 2, 10000.00, 1000.00, 450.00, 9450.00, 'unpaid'),
('INV-007', 7, 1, 6500.00, 300.00, 310.00, 6510.00, 'cancelled'),
('INV-008', 8, 2, 2800.00, 100.00, 135.00, 2835.00, 'paid'),
('INV-009', 9, 2, 5600.00, 300.00, 265.00, 5565.00, 'paid'),
('INV-010', 10, 1, 9200.00, 700.00, 425.00, 8925.00, 'unpaid'),
('INV-011', 1, 2, 6800.00, 300.00, 325.00, 6825.00, 'paid'),
('INV-012', 2, 1, 4500.00, 250.00, 215.00, 4465.00, 'paid'),
('INV-013', 4, 1, 7800.00, 600.00, 360.00, 7560.00, 'unpaid'),
('INV-014', 7, 2, 3500.00, 100.00, 170.00, 3570.00, 'paid'),
('INV-015', 10, 2, 11500.00, 1000.00, 525.00, 11025.00, 'unpaid');
-- INVOICE_ITEMS//////////////////////////////////////////////////////
insert into invoice_items(invoice_id,product_id,quantity,unit_price,line_total)values
(1,5,2,2400,4800),
(2,26,2,3800,7600);
-- STOCK_MOVEMENTS/////////////////////////////////////////////
insert into stock_movements(product_id,change_qty,reason,user_id,note)values
(5,-2,'sale',1,'sold via invoice inv001'),
(26,-2,'sale',2,'sold via invoice inv002');

