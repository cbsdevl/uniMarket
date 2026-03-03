# TODO - Profit Calculation with Full Payment Discount

## Task: Add logic in profit calculation when make discount on full payment and basing on supplier price

### Steps:

1. [x] Update CheckoutPage.jsx
   - [x] Pass discount information (discount amount) to order creation

2. [x] Update OrderContext.jsx
   - [x] Modify createOrder to accept discountAmount and store discount information
   - [x] Calculate discount per item proportionally
   - [x] Update profit calculation to account for discount:
     - Profit = (selling_price - discount - supplier_price) * quantity

3. [x] Create database migration (discount-migration.sql)
   - [x] Add discount_amount column to orders table
   - [x] Add discount_amount column to order_items table

### Note:
Run the SQL migration (discount-migration.sql) in Supabase SQL Editor to add the required database columns.
