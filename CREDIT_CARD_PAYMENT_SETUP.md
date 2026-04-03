# Credit Card Payment Implementation Guide

## Overview

Your BoldTap2 payment system now supports **credit card payments** (Visa, Mastercard, Amex, etc.) via **Stripe**, alongside existing mobile money payments (M-Pesa, Yas, Airtel Money).

## Features Added

### 1. **One-Time Card Payments**
- Accept Visa, Mastercard, American Express, and other cards
- Automatic currency and amount handling
- Payment status tracking

### 2. **Saved Payment Methods**
- Store cards securely with Stripe (PCI compliant)
- Quick recurring payments with saved cards
- Card management (add/remove/list)

### 3. **Subscriptions**
- Recurring billing for subscription plans (Starter, Pro, Enterprise)
- Automatic renewal with saved card
- Subscription status tracking

### 4. **Webhook Integration**
- Real-time payment status updates
- Automatic subscription lifecycle management
- Invoice payment tracking

## Environment Setup

Add these environment variables to your `.env` file:

```env
# Stripe API Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_PUBLIC_KEY=pk_test_xxxxx...
STRIPE_SECRET_KEY=sk_test_xxxxx...

# Stripe Webhook Secret (from Dashboard → Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# Stripe Price IDs (from https://dashboard.stripe.com/products)
STRIPE_PRICE_STARTER=price_xxxxx...
STRIPE_PRICE_PRO=price_xxxxx...
STRIPE_PRICE_ENTERPRISE=price_xxxxx...
```

## Backend Implementation

### New Services

**`stripeCardPaymentService.ts`** - Core Stripe integration
- `createPaymentIntent()` - Create payment intent for frontend
- `processCardPayment()` - Initiate card payment
- `confirmCardPayment()` - Confirm with payment method
- `savePaymentMethod()` - Save card for future use
- `getSavedPaymentMethods()` - List user's saved cards
- `createCardSubscription()` - Start recurring billing
- `getPaymentStatus()` - Check payment status

**`stripeWebhookService.ts`** - Webhook event handling
- Sync payment statuses
- Update subscriptions
- Handle failed payments
- Process invoices

### New Endpoints

#### Card Payments
```
POST   /api/payment/card/intent         - Create payment intent
POST   /api/payment/card/process        - Process card payment
POST   /api/payment/card/confirm        - Confirm payment
POST   /api/payment/card/retry          - Retry failed payment
GET    /api/payment/:paymentIntentId/status - Check payment status
```

#### Card Management
```
POST   /api/payment/card/save           - Save card for future use
GET    /api/payment/card/methods        - List saved cards
DELETE /api/payment/card/methods/:id    - Delete saved card
```

#### Subscriptions
```
POST   /api/payment/card/subscribe      - Create subscription
GET    /api/payment/merchant/subscription/plans - List available plans
```

#### Webhooks
```
POST   /api/payment/webhook/stripe      - Stripe webhook (no auth required)
```

## Frontend Implementation

### Installation

1. **Install Stripe packages**:
```bash
cd Frontend
npm install @stripe/react-stripe-js @stripe/js
```

2. **Wrap app with Stripe provider** in `app/layout.tsx`:
```tsx
import { loadStripe } from "@stripe/js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Elements stripe={stripePromise}>
          {children}
        </Elements>
      </body>
    </html>
  );
}
```

### New Component

**`CardPaymentForm.tsx`** - Complete payment flow
- `CardPaymentForm` - Card input & payment processing
- `SavedCardSelector` - Choose saved card or add new
- `PaymentSuccess` - Success confirmation
- `PaymentError` - Error handling with retry

### Usage Example

```tsx
import { CardPaymentForm } from "@/components/CardPaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function CheckoutPage() {
  const handlePaymentSuccess = (paymentId: string, intentId: string) => {
    console.log("Payment successful:", intentId);
    // Redirect or update UI
  };

  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);
  };

  return (
    <Elements stripe={stripePromise}>
      <CardPaymentForm
        amount={5000} // $50.00 in cents
        currency="usd"
        description="Premium plan subscription"
        productType="subscription"
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        planName="pro"
      />
    </Elements>
  );
}
```

## Database Changes

### Updated Entity: `CustomerPurchase`
- Added `"stripe"` to `PaymentProvider` type
- Added `"subscription"` to `ProductType` type

### Existing Entity: `MerchantSubscription`
- Works seamlessly with Stripe subscriptions
- Synced via webhooks

## Webhook Configuration

### Setup Stripe Webhook

1. Go to **Stripe Dashboard → Webhooks**
2. Add endpoint:
   - URL: `https://yourdomain.com/api/payment/webhook/stripe`
   - Events: Select all payment and subscription events
3. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Handled Events
- `payment_intent.succeeded` → Update purchase status
- `payment_intent.payment_failed` → Mark as failed
- `customer.subscription.created` → Create subscription record
- `customer.subscription.updated` → Sync subscription
- `invoice.paid` → Handle renewal
- `invoice.payment_failed` → Retry logic

## Security Checklist

✅ **PCI Compliance**
- Never handle raw card data (use Stripe Elements)
- Stripe handles tokenization
- Webhooks verify signature before processing

✅ **Payment Intent Flow**
- Server creates intent → Client confirms payment
- Prevents payment duplication
- Supports 3D Secure automatically

✅ **Environment Security**
- Public key safe to expose: `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
- Secret key: Keep in `.env` (never commit!)
- Webhook secret: Verify every webhook signature

## Payment Flow Diagrams

### One-Time Payment
```
Client → Create Intent → Server Creates PaymentIntent
   ↓
Client → Payment Form → Stripe (Elements handles card)
   ↓
Client → Confirm Payment → Confirm Intent with PaymentMethod
   ↓
Stripe → Webhook → Server Updates Status
```

### Subscriptions
```
Client → Select Plan + Card → Create Subscription
   ↓
Stripe → Creates Recurring Charge → Webhook
   ↓
Server → Updates MerchantSubscription Record
   ↓
Auto-renew on billing date (every month)
```

## API Response Examples

### Create Payment Intent
```json
{
  "clientSecret": "pi_1234_secret_5678",
  "paymentIntentId": "pi_1234",
  "amount": 5000,
  "currency": "usd",
  "status": "requires_payment_method"
}
```

### Payment Success
```json
{
  "success": true,
  "paymentId": "uuid-purchase-id",
  "paymentIntentId": "pi_1234",
  "status": "succeeded"
}
```

### Get Saved Cards
```json
{
  "methods": [
    {
      "id": "pm_1234",
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2025
    }
  ]
}
```

## Troubleshooting

### "Invalid signature" on webhook
- Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
- Ensure endpoint URL is publicly accessible
- Check for reverse proxy/firewall blocking

### Payment intent fails to create
- Verify `STRIPE_SECRET_KEY` is correct
- Check currency format (lowercase: "usd")
- Ensure amount > 0

### Card saved but not charged
- Verify `paymentMethodId` is attached to customer
- Check subscription plan has valid `priceId`
- Ensure card hasn't expired

## Testing

### Test Card Numbers
- Visa: `4242 4242 4242 4242`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`
- Declined: `4000 0000 0000 0002`

Use any future expiry date and any 3-digit CVC.

## Migration Checklist

- [ ] Add Stripe environment variables
- [ ] Install `@stripe/react-stripe-js` and `@stripe/js` in Frontend
- [ ] Update `app/layout.tsx` with Stripe Elements provider
- [ ] Add `CardPaymentForm` component
- [ ] Test payment flow in development
- [ ] Configure Stripe webhook in dashboard
- [ ] Test webhook endpoint with ngrok/expose
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Configure production Stripe keys
- [ ] Set up monitoring for failed payments
