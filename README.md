# Gadgify - Maharashtra's Premier Electronics E-Commerce Platform

A full-stack, production-ready e-commerce application built with **React 19**, **Material UI**, **Node.js**, **Express**, **Prisma**, and **PostgreSQL**.

Exclusively available for customers in **Maharashtra, India** 🇮🇳

## ✨ Live Demo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Dashboard**: http://localhost:3000/admin

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@gadgify.com`
- Password: `admin123`

**Test User:**
- Email: `user@example.com`
- Password: `user123`

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- npm or yarn

### Installation

**1. Clone & Install**
```bash
git clone <repo-url>
cd gadgify-main

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

**2. Setup Database**
```bash
# Create PostgreSQL database
createdb gadgify

# Setup environment
cp backend/.env.example backend/.env
# Update DATABASE_URL in backend/.env

# Run migrations
cd backend
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

**3. Start Servers**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit http://localhost:3000

## 🛠️ Tech Stack

**Frontend:** React 19, TypeScript, Material UI, React Query, React Router, i18next, Vite  
**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL  
**Security:** JWT, Bcrypt, Helmet, Rate Limiting  
**Payments:** Stripe  

## 📝 Full Documentation

See complete setup guide, API docs, and features in the detailed README sections above.

---

**Built with ❤️ for Maharashtra** 
