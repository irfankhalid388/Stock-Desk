create database if not exists stockdesk_db;
use stockdesk_db;
create table users(
 id INT PRIMARY KEY AUTO_INCREMENT,
name varchar(100) not null,
email varchar (100) unique not null,
password_hash varchar(250) not null, 
role  ENUM('admin', 'staff') not null ,
is_active boolean default true,
 created_at timestamp default CURRENT_TIMESTAMP
);
-- REFRESH TOKENS////////////////////////////////////////////////
CREATE TABLE refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) on delete cascade
);
-- categories//////////////////////////////////////////////////
create table categories(
id int primary key auto_increment,
name varchar(100) unique not null,
created_at timestamp default CURRENT_TIMESTAMP
 
);
-- PRODUCTS/////////////////////////////////////////////////////////
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES categories(id)
);
-- CUSTOMERS////////////////////////////////////////////////////////////////
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(255),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- INVOICES////////////////////////////////////////////////////////
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_no VARCHAR(100) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    user_id INT NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('unpaid', 'paid', 'cancelled') NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
-- INVOICE_ITEMS////////////////////////////////////////////////////////////
CREATE TABLE invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (invoice_id) REFERENCES invoices(id) on delete cascade,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
-- STOCK_MOVEMENTS/////////////////////////////////////////////
CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    change_qty INT NOT NULL,
    reason ENUM('sale', 'purchase', 'adjustment', 'return') NOT NULL,
    reference_id INT,
    user_id INT NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
