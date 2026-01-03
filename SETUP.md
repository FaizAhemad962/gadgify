# 🚀 Gadgify - Quick Setup Guide

## Step 1: Install PostgreSQL

### Windows:
1. Download from https://www.postgresql.org/download/windows/
2. Install and remember your password
3. Or use Docker: `docker run --name gadgify-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=gadgify -p 5432:5432 -d postgres:14`

### Mac:
```bash
brew install postgresql@14
brew services start postgresql@14
createdb gadgify
```

### Linux:
```bash
sudo apt-get install postgresql-14
sudo -u postgres createdb gadgify
```

## Step 2: Configure Environment Variables

### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and update:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/gadgify?schema=public"
JWT_SECRET="change_this_to_a_long_random_string_minimum_32_characters"
STRIPE_SECRET_KEY="sk_test_your_stripe_key_from_stripe_dashboard"
```

### Frontend (.env)
```bash
cd frontend
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

## Step 3: Setup Database

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed with sample data (admin + products)
npm run seed
```

## Step 4: Start Application

### Option 1: Two Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running on http://localhost:3000

### Option 2: Single Terminal (Windows)
```powershell
# In project root
Start-Process powershell -ArgumentList "cd backend; npm run dev"
Start-Process powershell -ArgumentList "cd frontend; npm run dev"
```

## Step 5: Test the Application

1. **Visit**: http://localhost:3000
2. **Login as Admin**:
   - Email: `admin@gadgify.com`
   - Password: `admin123`
3. **Go to Admin Dashboard**: http://localhost:3000/admin
4. **Test User Flow**:
   - Logout
   - Signup as new user (use Maharashtra address)
   - Browse products
   - Add to cart
   - Checkout
   - Use test card: `4242 4242 4242 4242`

## 🔧 Troubleshooting

### Database Connection Error
```bash
# Check if PostgreSQL is running
# Windows: Check Services
# Mac/Linux: ps aux | grep postgres

# Test connection
psql -U postgres -h localhost

# Recreate database
dropdb gadgify
createdb gadgify
cd backend
npx prisma migrate dev --name init
```

### Port Already in Use
```bash
# Kill port 5000 (backend)
npx kill-port 5000

# Kill port 3000 (frontend)
npx kill-port 3000
```

### Prisma Client Error
```bash
cd backend
rm -rf node_modules
npm install
npx prisma generate
```

### Frontend Build Error
```bash
cd frontend
rm -rf node_modules
npm install
```

## 📦 Prisma Studio (Database GUI)

```bash
cd backend
npx prisma studio
```
Opens at http://localhost:5555

## 🧪 API Testing

### Using curl:
```bash
# Health check
curl http://localhost:5000/health

# Get products
curl http://localhost:5000/api/products

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gadgify.com","password":"admin123"}'
```

### Using Postman/Thunder Client:
Import endpoints from API section in main README.

## 🎯 Next Steps

1. ✅ Application is running
2. 🔑 Test login with provided credentials
3. 🛒 Add products to cart
4. 💳 Test checkout flow
5. 👨‍💼 Access admin panel
6. 🌐 Change language (EN/MR/HI)

## 📞 Need Help?

- Check main README.md for detailed documentation
- View API endpoints list
- Check error logs in terminal
- Open GitHub issue

---

**Happy Coding! 🚀**
