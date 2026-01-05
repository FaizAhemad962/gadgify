# Razorpay Payment Integration - Complete Setup Guide

## 🚀 Step 1: Get Your Razorpay API Keys

### Login to Razorpay Dashboard:
1. Go to https://dashboard.razorpay.com/
2. Login with your KYC-verified account
3. You'll land on the Dashboard homepage

### Generate API Keys:
1. On the left sidebar, click on **Settings** (gear icon at bottom)
2. Click on **API Keys** (under "Configurations" section)
3. Click **Generate Test Key** or **Generate Live Key**
   - 🧪 **Test Mode**: Use for development/testing (no real money)
   - 💰 **Live Mode**: Use only for production (real payments)
4. After clicking, you'll see:
   - **Key ID**: Starts with `rzp_test_` (test) or `rzp_live_` (live)
   - **Key Secret**: Click "Show" and copy the secret key

> ⚠️ **IMPORTANT**: Never share your Key Secret publicly or commit it to GitHub!

---

## 🔧 Step 2: Configure Backend Environment

### Update `backend/.env` file:

Replace the placeholder values with your actual Razorpay keys:

```env
# Razorpay API Keys
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET_HERE
```

**Example:**
```env
RAZORPAY_KEY_ID=rzp_test_1A2B3C4D5E6F7G8H
RAZORPAY_KEY_SECRET=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

### Verify Backend Configuration:

Check that these files exist and have the correct code:
- ✅ `backend/src/config/razorpay.ts` - Razorpay instance
- ✅ `backend/src/controllers/orderController.ts` - Payment handlers
- ✅ `backend/src/routes/orderRoutes.ts` - Payment routes

---

## 🎨 Step 3: Frontend Configuration (Already Done!)

The frontend is already configured with Razorpay integration in:
- ✅ `frontend/src/pages/CheckoutPage.tsx` - Razorpay checkout UI
- ✅ `frontend/src/api/orders.ts` - Payment API calls
- ✅ `frontend/index.html` - Razorpay checkout script loaded

---

## 💳 Step 4: Test Payment Methods

### 🧪 Test Mode (Development)

Razorpay provides test credentials that work in Test Mode:

#### **Credit/Debit Cards:**

✅ **Successful Payment:**
```
Card Number: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25 (any future date)
```

❌ **Failed Payment:**
```
Card Number: 4000 0000 0000 0002
CVV: 123
Expiry: 12/25
```

#### **UPI IDs:**

✅ **Success**: `success@razorpay`
❌ **Failure**: `failure@razorpay`

#### **Net Banking:**
- Select any bank
- Use "Success" or "Failure" as credentials

#### **Wallets:**
- All wallets work in test mode
- Payments automatically succeed

---

## 🔍 Step 5: Testing the Complete Flow

### End-to-End Test:

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Flow:**
   - Login with user account
   - Add products to cart
   - Go to checkout
   - Fill shipping details (State: Maharashtra)
   - Click "Place Order"
   - Razorpay popup opens with payment options
   - Select payment method (Card/UPI/NetBanking/Wallet)
   - Enter test credentials
   - Complete payment
   - Order confirmation page appears

4. **Verify in Razorpay Dashboard:**
   - Go to Dashboard → Transactions
   - You'll see the test payment listed

---

## 🔐 Payment Methods Supported:

✅ **Cards**: Visa, Mastercard, RuPay, Amex, Diners  
✅ **UPI**: PhonePe, Google Pay, Paytm, BHIM, Amazon Pay  
✅ **Net Banking**: 50+ banks (SBI, HDFC, ICICI, Axis, etc.)  
✅ **Wallets**: Paytm, PhonePe, Mobikwik, Freecharge  
✅ **EMI**: Credit Card EMI (3, 6, 9, 12 months)  
✅ **Cardless EMI**: Zest Money, ePayLater, etc.

---

## 🎯 How It Works (Technical Flow):

### Order Creation & Payment:

```
1. User clicks "Place Order"
   ↓
2. Backend creates Order in database (status: PENDING)
   ↓
3. Backend calls Razorpay API to create payment order
   ↓
4. Backend returns Razorpay Order ID + Key ID to frontend
   ↓
5. Frontend opens Razorpay checkout popup
   ↓
6. User selects payment method and completes payment
   ↓
7. Razorpay sends payment response (payment_id, order_id, signature)
   ↓
8. Frontend sends response to backend for verification
   ↓
9. Backend verifies signature using HMAC-SHA256
   ↓
10. Backend updates order status to COMPLETED
    ↓
11. Frontend redirects to order details page
```

---

## 🚨 Troubleshooting:

### Issue: "Cannot read properties of undefined (reading 'Razorpay')"
**Solution**: Check that Razorpay script is loaded in `frontend/index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Issue: "Invalid API Key"
**Solution**: 
1. Verify keys in `.env` are correct
2. Restart backend server after updating `.env`
3. Make sure keys start with `rzp_test_` (test) or `rzp_live_` (live)

### Issue: "Payment signature verification failed"
**Solution**: 
- Make sure `RAZORPAY_KEY_SECRET` matches your dashboard secret
- Check backend logs for signature mismatch details

### Issue: Payments not showing in dashboard
**Solution**:
- Make sure you're using Test Mode keys for test payments
- Switch to "Test Mode" in dashboard (toggle at top)

---

## 🔄 Switching to Live Mode (Production):

### ⚠️ Only do this when ready for production:

1. Complete KYC verification on Razorpay (already done ✅)
2. Add bank account details for settlements
3. Generate **Live API Keys** in dashboard
4. Update `.env` with live keys:
   ```env
   RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
   RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET
   ```
5. Update `NODE_ENV=production` in `.env`
6. Test with small real payment first
7. Enable webhooks for payment notifications

---

## 📊 Monitoring Payments:

### Razorpay Dashboard:
- **Transactions**: View all payments
- **Orders**: Track order status
- **Settlements**: Money transferred to bank
- **Analytics**: Payment success rate, popular methods

### Webhooks (Optional but Recommended):
Configure webhook URL in Razorpay dashboard to receive real-time payment updates:
```
https://your-domain.com/api/webhooks/razorpay
```

---

## 🛡️ Security Best Practices:

✅ Never commit `.env` file to Git  
✅ Use Test keys in development  
✅ Enable 2FA on Razorpay account  
✅ Verify payment signature on backend (already implemented)  
✅ Use HTTPS in production  
✅ Implement rate limiting on payment endpoints  
✅ Log all payment transactions  
✅ Monitor for suspicious payment patterns  

---

## 📞 Support:

- **Razorpay Docs**: https://razorpay.com/docs/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-details/
- **Support**: support@razorpay.com
- **Dashboard**: https://dashboard.razorpay.com/

---

## ✅ Quick Checklist:

- [ ] Login to Razorpay Dashboard
- [ ] Generate Test API Keys
- [ ] Update `backend/.env` with actual keys
- [ ] Restart backend server
- [ ] Test with test card: 4111 1111 1111 1111
- [ ] Verify payment in Razorpay Dashboard
- [ ] Test UPI payment with success@razorpay
- [ ] Check order status updates correctly

**You're all set! 🎉**
