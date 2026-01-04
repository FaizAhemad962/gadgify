# ⚡ Razorpay Quick Start (3 Steps)

## Step 1: Get Your Keys (2 minutes)

1. Login: https://dashboard.razorpay.com/
2. Settings → API Keys
3. Click "Generate Test Key"
4. Copy both:
   - Key ID (rzp_test_xxxxx)
   - Key Secret (click "Show" to see)

---

## Step 2: Update .env File (1 minute)

Open `backend/.env` and replace:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_SECRET_HERE
```

Paste your actual keys from Step 1.

---

## Step 3: Restart & Test (2 minutes)

**Restart Backend:**
```bash
cd backend
npm run dev
```

**Test Payment:**
1. Login to app
2. Add product to cart
3. Go to checkout
4. Fill form (State: Maharashtra)
5. Click "Place Order"
6. Use test card: `4111 1111 1111 1111`
7. CVV: `123`, Expiry: `12/25`
8. Pay!

---

## ✅ Done!

Payment integration is working! 🎉

**Need help?** Check [RAZORPAY_COMPLETE_GUIDE.md](./RAZORPAY_COMPLETE_GUIDE.md)

---

## 🧪 Test Credentials

**Card Success:**
```
4111 1111 1111 1111
CVV: 123
Expiry: 12/25
```

**UPI Success:**
```
success@razorpay
```

**Card Failure:**
```
4000 0000 0000 0002
```

---

## 🔥 Payment Methods Available

✅ Cards (Visa, Mastercard, RuPay)  
✅ UPI (PhonePe, GPay, Paytm)  
✅ Net Banking (All banks)  
✅ Wallets (Paytm, PhonePe, etc.)
