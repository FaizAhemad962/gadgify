# Gadgify - Setup & Usage Instructions

## 🔐 Admin Account Setup

Since all seed credentials have been removed, you need to create accounts manually:

### Creating Admin Account

1. **Start the application**:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

2. **Sign Up as Admin**:
   - Go to: `http://localhost:5173/signup`
   - Fill in the form:
     - **Email**: Your admin email (e.g., `admin@gadgify.com`)
     - **Password**: Your secure password
     - **Name**: Your full name
     - **Phone**: Your phone number
     - **State**: Must be "Maharashtra" (required)
     - **City**: Any city in Maharashtra (e.g., Mumbai, Pune, Nagpur)
     - **Address**: Your address
     - **Pincode**: Valid pincode

3. **Change Role to ADMIN** (Database):
   - After signup, manually update the user role in the database:
   
   ```sql
   -- Using SQL Server Management Studio or sqlcmd:
   UPDATE users 
   SET role = 'ADMIN' 
   WHERE email = 'admin@gadgify.com';
   ```

   OR using Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   # Find your user and change role from 'USER' to 'ADMIN'
   ```

4. **Login as Admin**:
   - Go to: `http://localhost:5173/login`
   - Login with your credentials
   - You'll now have access to Admin Dashboard

---

## 👥 How Users Will Use the Application

### 1. **User Registration & Login**

**Registration** (`/signup`):
- Users must sign up with Maharashtra address (enforced)
- Required fields:
  - Email
  - Password
  - Full Name
  - Phone Number
  - **State**: MUST be "Maharashtra"
  - City (Maharashtra cities only)
  - Address
  - Pincode
- After successful signup, users are automatically logged in

**Login** (`/login`):
- Enter email and password
- System validates credentials
- Redirects to products page

---

### 2. **Product Browsing** (`/products`)

Users can:
- **View all products** with images, prices, and stock status
- **Search products** by name/description
- **Filter by category**: Smartphones, Laptops, Tablets, Audio, Wearables, etc.
- **View product details**: Click on any product
- **Add to cart**: Click "Add to Cart" button
- **Buy now**: Direct checkout for single item

**Language Support**:
- Switch between English (मर), Marathi (मर), Hindi (हि)
- All UI text translates automatically

---

### 3. **Product Details** (`/products/:id`)

Users can:
- View detailed product information
- See customer ratings and reviews
- **Write reviews**: Rate 1-5 stars and add comments
- **Edit/Delete own reviews**
- Add product to cart
- Buy immediately

---

### 4. **Shopping Cart** (`/cart`)

Users can:
- View all cart items
- **Increase/Decrease quantity**
- **Remove items**
- See subtotal
- **Proceed to checkout**

**Location Enforcement**:
- Cart access requires Maharashtra address
- Non-Maharashtra users cannot proceed

---

### 5. **Checkout Process** (`/checkout`)

**Step 1: Confirm Shipping Address**
- Pre-filled with user's registered address
- Can modify if needed
- **Must be Maharashtra address** (strictly validated)

**Step 2: Order Summary**
- Review cart items
- Subtotal calculation
- Fixed shipping: ₹50
- Total amount

**Step 3: Payment** (Test Mode)
- **Razorpay Integration** (Test Mode)
- Click "Place Order"
- Razorpay payment modal opens
- Test cards:
  - Success: Use Razorpay test card numbers
  - Failure: Test with insufficient balance
- After payment:
  - Success: Redirected to order confirmation
  - Failure: Error message shown

---

### 6. **Order Management** (`/orders`)

Users can:
- **View all orders**: Past and current
- **Order details**:
  - Order ID
  - Order date
  - Items ordered
  - Shipping address
  - Payment status (Pending/Completed/Failed)
  - Order status (Pending/Processing/Shipped/Delivered/Cancelled)
  - Total amount
- **Track orders**: See current status

---

### 7. **Navigation**

**Header/Navbar**:
- Logo: Home
- Products: Browse all products
- Cart: View shopping cart (with item count badge)
- Orders: View order history
- Language selector: English/Marathi/Hindi
- Account dropdown:
  - Admin Dashboard (admin only)
  - Logout

**Search** (in Products):
- Dropdown search in navbar
- Shows product results with images
- Click to view product details

---

## 🔧 Admin Dashboard (`/admin`)

### Admin Access Required
- Only users with role='ADMIN' can access
- Regular users get access denied

### Admin Features:

#### 1. **Dashboard** (`/admin`)
- **Statistics**:
  - Total Products
  - Total Orders
  - Pending Orders
  - Total Revenue
- **Recent Orders**: Latest 5 orders

#### 2. **Manage Products** (`/admin/products`)
- **View all products**: Table view with images
- **Add new product**:
  - Name, Description
  - Price, Stock
  - Category selection (translated)
  - **Image upload**: Upload image file
  - **Video upload** (optional): Upload video file
  - Available colors (comma-separated)
- **Edit product**: Modify any field
- **Delete product**: Remove from catalog
- **Preview**: See uploaded images/videos before saving

#### 3. **Manage Orders** (`/admin/orders`)
- **View all orders**: Complete order list
- **Order details**:
  - Customer information
  - Order items
  - Payment status
  - Shipping address
- **Update order status**:
  - Pending → Processing → Shipped → Delivered
  - Or mark as Cancelled
- **Update payment status**:
  - Pending → Completed → Failed

---

## 🌍 Maharashtra-Only Restriction

### Where It's Enforced:
1. **Signup**: Must select "Maharashtra" as state
2. **Checkout**: Validates shipping address is in Maharashtra
3. **Backend APIs**: Order creation blocked if not Maharashtra
4. **Frontend**: Error message shown: "This service is currently available only in Maharashtra"

### Why:
- Business requirement: Service limited to Maharashtra region
- Location-based service restriction

---

## 💳 Payment Integration (Razorpay Test Mode)

### Test Mode Details:
- Uses Razorpay test keys
- No real money transactions
- Test card numbers work

### Test Payment Flow:
1. Complete checkout
2. Click "Place Order"
3. Razorpay modal opens
4. Use test card (provided by Razorpay docs)
5. Payment succeeds/fails based on test scenario
6. Order status updated accordingly

### Configuration:
- Backend: `RAZORPAY_KEY_ID` and `RAZORPAY_SECRET` in `.env`
- Frontend: Razorpay script loaded automatically

---

## 🎨 Multi-Language Support

### Languages Available:
1. **English** (Default)
2. **Marathi** (मराठी)
3. **Hindi** (हिंदी)

### How to Switch:
- Click language dropdown in navbar (मर)
- Select language
- Entire UI updates instantly

### What's Translated:
- All UI labels and buttons
- Form fields
- Error messages
- Success messages
- Product categories
- Admin panel
- Cart, Checkout, Orders

---

## 📊 Database Structure

### Tables:
- **users**: User accounts (role: USER/ADMIN)
- **products**: Product catalog
- **carts**: Shopping carts (one per user)
- **cart_items**: Items in cart
- **orders**: Order records
- **order_items**: Products in each order
- **ratings**: Product reviews and ratings

### Relationships:
- User → Cart (1:1)
- User → Orders (1:N)
- Product → CartItems (1:N)
- Product → OrderItems (1:N)
- Product → Ratings (1:N)
- Order → OrderItems (1:N)

---

## 🚀 Running the Application

### Backend:
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Database:
```bash
cd backend
npx prisma db push    # Sync schema
npm run seed          # Clear database (no seed data now)
npx prisma studio     # View/edit database
```

---

## 📝 Summary for Users

### Regular User Journey:
1. **Sign up** → Must be Maharashtra resident
2. **Browse products** → View, search, filter
3. **Add to cart** → Select products
4. **Checkout** → Confirm address (Maharashtra only)
5. **Payment** → Razorpay test mode
6. **Track order** → View order status

### Admin Journey:
1. **Sign up** → Then change role to ADMIN in database
2. **Access admin dashboard** → Manage products & orders
3. **Add/Edit products** → Upload images/videos
4. **Manage orders** → Update status & payment
5. **View statistics** → Monitor business metrics

---

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- CSRF protection
- Rate limiting
- Input validation (Joi/Zod)
- SQL injection protection
- Secure payment handling
- Role-based access control (RBAC)

---

## ⚠️ Important Notes

1. **Maharashtra Only**: This is strictly enforced - users outside Maharashtra cannot use the service
2. **Admin Creation**: Must manually change role in database after signup
3. **Test Mode**: Payments are in test mode - no real transactions
4. **Image Uploads**: Images are uploaded as files (not URLs)
5. **Language Preference**: Saved in browser, persists across sessions
