# Razorpay Payment Integration Setup

## Get Razorpay Test Keys:

1. Go to https://razorpay.com/
2. Sign up for a free account
3. After login, go to Settings → API Keys
4. Generate Test Keys (NOT Live keys)
5. Copy the Key ID and Key Secret

## Update .env file:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxx
```

## Payment Methods Supported:

✅ Credit/Debit Cards (Visa, Mastercard, Rupay, Amex)
✅ UPI (PhonePe, Google Pay, Paytm, BHIM, etc.)
✅ Net Banking (All major banks)
✅ Wallets (Paytm, PhonePe, Mobikwik, etc.)
✅ EMI (Credit Card EMI)

## Test Cards for Testing:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4000 0000 0000 0002

## Test UPI IDs:
- success@razorpay
- failure@razorpay

## How it Works:

1. User adds products to cart
2. Goes to checkout and fills shipping details
3. Clicks "Place Order"
4. Razorpay payment popup opens
5. User selects payment method (Card/UPI/etc.)
6. Payment is processed
7. On success, order is confirmed
8. User redirected to order details page

## Important Notes:

- Always use TEST keys in development
- Switch to LIVE keys only in production
- Enable 2FA on Razorpay account for security
- Configure webhook URL for payment notifications (optional)
