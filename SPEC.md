# UniMarket - Smart Reselling E-Commerce Platform

## 1. Project Overview

**Project Name:** UniMarket
**Type:** Mobile-first E-commerce Web Application
**Core Functionality:** Order-driven e-commerce platform where students browse products, place orders without stock holding, and admins fulfill orders from suppliers after receiving payments.
**Target Users:** University students (customers), Store admin, Suppliers, Delivery personnel

---

## 2. UI/UX Specification

### 2.1 Layout Structure

**Mobile-First Design (375px base)**
- Bottom navigation bar (fixed)
- Header with menu toggle and cart icon
- Main content area with scroll
- Floating action buttons where needed

**Responsive Breakpoints:**
- Mobile: 375px - 767px (primary)
- Tablet: 768px - 1023px
- Desktop: 1024px+

### 2.2 Visual Design

**Color Palette:**
- Primary: `#2563EB` (Blue 600) - Main actions, headers
- Primary Dark: `#1D4ED8` (Blue 700) - Pressed states
- Secondary: `#10B981` (Emerald 500) - Success, profits
- Accent: `#F59E0B` (Amber 500) - Warnings, deposits
- Danger: `#EF4444` (Red 500) - Errors, cancel
- Background: `#F8FAFC` (Slate 50) - Page background
- Surface: `#FFFFFF` - Cards, modals
- Text Primary: `#1E293B` (Slate 800)
- Text Secondary: `#64748B` (Slate 500)
- Border: `#E2E8F0` (Slate 200)

**Typography:**
- Font Family: `Inter, system-ui, sans-serif`
- Headings: 
  - H1: 24px/700
  - H2: 20px/600
  - H3: 16px/600
- Body: 14px/400
- Small: 12px/400

**Spacing System:**
- Base unit: 4px
- Common: 8px, 12px, 16px, 24px, 32px

**Visual Effects:**
- Card shadows: `0 1px 3px rgba(0,0,0,0.1)`
- Elevated shadows: `0 4px 6px rgba(0,0,0,0.1)`
- Border radius: 8px (cards), 12px (buttons), 9999px (pills)
- Transitions: 150ms ease-in-out

### 2.3 Pages & Components

**Customer-Facing Pages:**

1. **Home/Products Page**
   - Product grid (2 columns on mobile)
   - Product card: Image, name, price, deposit info, "Add to Cart" button
   - Category filter chips
   - Search bar

2. **Product Detail Page**
   - Product image carousel
   - Name, description, price breakdown
   - Payment options display
   - Quantity selector
   - "Add to Cart" CTA

3. **Cart Page**
   - List of cart items with quantity controls
   - Subtotal per item
   - Total amount
   - Payment method selector
   - Checkout button

4. **Checkout Page**
   - Delivery address input (campus location)
   - Phone number input
   - Payment method selection (Deposit/COD/Full)
   - Order summary
   - Confirm button

5. **My Orders Page**
   - Order list with status badges
   - Order detail expansion
   - Track order button

6. **Order Detail Page**
   - Order items
   - Payment status
   - Delivery status
   - Timeline

**Admin-Facing Pages:**

7. **Admin Dashboard**
   - Stats cards: Total orders, Pending, Revenue, Profit
   - Recent orders list
   - Quick actions

8. **Products Management**
   - Product list with edit/delete
   - Add product form
   - Category management

9. **Orders Management**
   - Filterable order list
   - Order status controls
   - Supplier assignment

10. **Suppliers Management**
    - Supplier list
    - Add supplier form
    - Contact info

11. **Delivery Management**
    - Delivery queue
    - Delivery confirmation
    - Balance collection

12. **Reports/Analytics**
    - Revenue chart
    - Profit breakdown
    - Top products

**Authentication:**
- Login page
- Role-based redirects (Customer/Admin)

---

## 3. Functionality Specification

### 3.1 Core Features

**Product Management (Admin)**
- Create, read, update, delete products
- Set: name, description, image, price, deposit amount, supplier price
- Assign categories: Flash Disks, Chargers, Notes, Power Banks, Others
- Toggle product visibility

**Shopping Flow (Customer)**
- Browse products by category
- Search products
- Add to cart with quantity
- Remove from cart
- Update quantity in cart
- Select payment method at checkout

**Payment Methods:**
- **Deposit First:** Pay minimum deposit now, balance on delivery
- **Cash on Delivery:** Pay full amount on delivery (campus only)
- **Full Payment:** Pay complete amount upfront (with discount)

**Order Flow:**
1. Customer places order → Status: PENDING_PAYMENT
2. Customer confirms payment → Status: PENDING_CONFIRMATION
3. Admin confirms order → Status: CONFIRMED
4. Admin purchases from supplier → Status: SOURCED
5. Out for delivery → Status: OUT_FOR_DELIVERY
6. Delivered → Status: DELIVERED

**Order Management (Admin)**
- View all orders
- Filter by status
- Confirm orders (locks the order)
- Mark as sourced (purchased from supplier)
- Mark as out for delivery
- Confirm delivery and collect balance
- Calculate profit automatically

**Supplier Management (Admin)**
- Add/edit/delete suppliers
- Track supplier purchases
- Record supplier costs

### 3.2 Data Models (Supabase)

```
users
- id (uuid)
- email (text)
- role (enum: customer, admin, delivery)
- name (text)
- phone (text)
- created_at (timestamp)

products
- id (uuid)
- name (text)
- description (text)
- image_url (text)
- price (decimal)
- deposit_amount (decimal)
- supplier_price (decimal)
- category (text)
- is_active (boolean)
- created_at (timestamp)

orders
- id (uuid)
- user_id (uuid)
- status (enum: PENDING_PAYMENT, PENDING_CONFIRMATION, CONFIRMED, SOURCED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
- payment_method (enum: DEPOSIT, COD, FULL)
- total_amount (decimal)
- deposit_paid (decimal)
- balance_due (decimal)
- delivery_address (text)
- phone (text)
- profit (decimal)
- created_at (timestamp)

order_items
- id (uuid)
- order_id (uuid)
- product_id (uuid)
- quantity (integer)
- unit_price (decimal)
- subtotal (decimal)

suppliers
- id (uuid)
- name (text)
- contact_person (text)
- phone (text)
- email (text)
- address (text)
- created_at (timestamp)

payments
- id (uuid)
- order_id (uuid)
- amount (decimal)
- method (text)
- status (enum: PENDING, CONFIRMED, FAILED)
- transaction_id (text)
- created_at (timestamp)
```

### 3.3 User Interactions

- Swipe gestures for image carousel
- Pull-to-refresh on lists
- Bottom sheet for filters
- Toast notifications for actions
- Loading skeletons during data fetch
- Empty states with illustrations

---

## 4. Technical Stack

- **Frontend:** React 19 + Vite
- **Styling:** Tailwind CSS 3
- **Database:** Supabase
- **State Management:** React Context + useReducer
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **Charts:** Recharts (for admin reports)

---

## 5. Acceptance Criteria

### Must Have:
- [ ] Mobile-responsive UI works on 375px width
- [ ] Products display with images, prices, deposit info
- [ ] Cart functionality (add, remove, update quantity)
- [ ] Checkout with three payment options
- [ ] Order creation and status tracking
- [ ] Admin dashboard with order management
- [ ] Profit calculation per order
- [ ] Supplier management for admin
- [ ] Delivery management

### Visual Checkpoints:
- [ ] Bottom navigation visible on all customer pages
- [ ] Product cards have proper shadows and spacing
- [ ] Status badges use correct colors
- [ ] Forms have proper validation feedback
- [ ] Loading states show skeletons
- [ ] Empty states show helpful messages

---

## 6. File Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Modal.jsx
│   │   ├── Loader.jsx
│   │   └── EmptyState.jsx
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx
│   │   └── AdminSidebar.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   └── ProductForm.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   └── CartSummary.jsx
│   ├── orders/
│   │   ├── OrderCard.jsx
│   │   ├── OrderTimeline.jsx
│   │   └── OrderActions.jsx
│   └── admin/
│       ├── StatsCard.jsx
│       ├── OrdersTable.jsx
│       └── ProductsTable.jsx
├── pages/
│   ├── customer/
│   │   ├── HomePage.jsx
│   │   ├── ProductDetailPage.jsx
│   │   ├── CartPage.jsx
│   │   ├── CheckoutPage.jsx
│   │   ├── OrdersPage.jsx
│   │   └── OrderDetailPage.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminProducts.jsx
│   │   ├── AdminOrders.jsx
│   │   ├── AdminSuppliers.jsx
│   │   ├── AdminDelivery.jsx
│   │   └── AdminReports.jsx
│   └── auth/
│       └── LoginPage.jsx
├── context/
│   ├── AuthContext.jsx
│   ├── CartContext.jsx
│   └── OrderContext.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   └── useOrders.js
├── lib/
│   └── supabase.js
├── utils/
│   ├── constants.js
│   └── helpers.js
├── App.jsx
├── main.jsx
└── index.css
