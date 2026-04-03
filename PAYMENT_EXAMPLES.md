# Payment Implementation Examples

## Backend Examples

### Example 1: Simple One-Time Payment

```typescript
// In your route or service
import * as stripeCardService from "@/services/stripeCardPaymentService";

// User pays for an NFC card
const paymentResult = await stripeCardService.processCardPayment({
  userId: "user-123",
  amount: 2999, // $29.99 in cents
  currency: "usd",
  description: "NFC Business Card",
  productType: "nfc_card",
  reference: "nfc_order_456"
});

// Response:
// {
//   success: true,
//   paymentId: "purchase-uuid",
//   paymentIntentId: "pi_1234567890",
//   clientSecret: "pi_1234567890_secret_xxxxx",
//   status: "requires_payment_method"
// }
```

### Example 2: Save a Card

```typescript
import * as stripeCardService from "@/services/stripeCardPaymentService";

const result = await stripeCardService.savePaymentMethod(
  "user-123",
  "pm_1234567890" // From Stripe Elements on client
);

// Response:
// {
//   success: true,
//   paymentMethodId: "pm_1234567890",
//   message: "Card saved successfully"
// }
```

### Example 3: List Saved Cards

```typescript
import * as stripeCardService from "@/services/stripeCardPaymentService";

const methods = await stripeCardService.getSavedPaymentMethods("user-123");

// Response:
// [
//   {
//     id: "pm_1111111111",
//     brand: "visa",
//     last4: "4242",
//     expMonth: 12,
//     expYear: 2025
//   },
//   {
//     id: "pm_2222222222",
//     brand: "mastercard",
//     last4: "5555",
//     expMonth: 6,
//     expYear: 2026
//   }
// ]
```

### Example 4: Create Subscription

```typescript
import * as stripeCardService from "@/services/stripeCardPaymentService";

const subscription = await stripeCardService.createCardSubscription(
  "merchant-123",
  "pro",  // "starter" | "pro" | "enterprise"
  "pm_1234567890" // Saved payment method ID
);

// Response:
// {
//   success: true,
//   subscriptionId: "sub_1234567890",
//   status: "active"
// }

// Subscription now starts, will auto-renew monthly
// Webhook will sync status to database
```

### Example 5: Handle Payment in API Endpoint

```typescript
// api/payment/card/confirm
export async function confirmCardPayment(req: any, res: any) {
  try {
    const { paymentIntentId, paymentMethodId } = req.body;
    
    const result = await stripeCardService.confirmCardPayment(
      paymentIntentId,
      paymentMethodId
    );

    if (result.success) {
      // Payment succeeded
      return sendSuccess(res, {
        status: "succeeded",
        message: "Payment processed successfully"
      });
    } else {
      return sendError(res, "Payment failed", 400);
    }
  } catch (error) {
    return sendError(res, error as Error);
  }
}
```

## Frontend Examples

### Example 1: Basic Payment Form

```tsx
import { CardPaymentForm } from "@/components/CardPaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function BuyNFCCard() {
  const handleSuccess = async (ref: string, intentId: string) => {
    console.log("Payment successful!");
    // Redirect or fetch confirmation
    window.location.href = "/success?intent=" + intentId;
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Buy NFC Card</h1>
      <Elements stripe={stripePromise}>
        <CardPaymentForm
          amount={2999}
          currency="usd"
          description="NFC Business Card"
          productType="nfc_card"
          reference="nfc_order_456"
          onSuccess={handleSuccess}
          onError={(err) => alert("Payment failed: " + err)}
        />
      </Elements>
    </div>
  );
}
```

### Example 2: Subscription Purchase with Saved Card

```tsx
import { useStripe } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { useApi } from "@/contexts/api";
import { SavedCardSelector } from "@/components/CardPaymentForm";

export default function SubscriptionPage() {
  const stripe = useStripe();
  const [selectedCard, setSelectedCard] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { apiClient } = useApi();

  const handleSubscribe = async () => {
    if (!selectedCard) {
      setError("Please select a card");
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.post("/api/payment/card/subscribe", {
        planName: "pro",
        paymentMethodId: selectedCard
      });

      if (result.success) {
        alert("Subscription started!");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Upgrade to Pro</h1>
      
      <div className="bg-blue-50 p-4 rounded mb-6">
        <p className="font-semibold">$50/month</p>
        <ul className="text-sm mt-2 space-y-1">
          <li>✓ 10 Businesses</li>
          <li>✓ Unlimited Customers</li>
          <li>✓ API Access</li>
        </ul>
      </div>

      <SavedCardSelector 
        onCardSelect={setSelectedCard}
        onAddNew={() => alert("Add new card flow")}
      />

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <button
        onClick={handleSubscribe}
        disabled={loading || !selectedCard}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Subscribe Now"}
      </button>
    </div>
  );
}
```

### Example 3: Payment Status Check

```tsx
import { useEffect, useState } from "react";
import { useApi } from "@/contexts/api";
import { useSearchParams } from "next/navigation";

export default function PaymentStatus() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { apiClient } = useApi();

  useEffect(() => {
    const paymentIntentId = searchParams.get("intent");
    
    if (!paymentIntentId) return;

    const checkStatus = async () => {
      try {
        const result = await apiClient.get(
          `/api/payment/${paymentIntentId}/status`
        );
        setStatus(result);
      } catch (err) {
        console.error("Status check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Poll for updates
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [apiClient, searchParams]);

  if (loading) return <div>Checking payment status...</div>;

  const isSuccessful = status?.status === "succeeded";

  return (
    <div className="max-w-md mx-auto p-6">
      {isSuccessful ? (
        <div className="bg-green-50 p-6 rounded text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            ✓ Payment Successful
          </h1>
          <p className="text-gray-600">
            Transaction ID: {status.paymentIntentId}
          </p>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="mt-6 bg-green-600 text-white py-2 px-6 rounded"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="bg-red-50 p-6 rounded text-center">
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            ⚠ Payment Failed
          </h1>
          <p className="text-gray-600 mb-6">
            Status: {status?.status || "unknown"}
          </p>
          <button
            onClick={() => window.location.href = "/checkout"}
            className="bg-blue-600 text-white py-2 px-6 rounded"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Admin Dashboard - Payment History

```tsx
import { useEffect, useState } from "react";
import { useApi } from "@/contexts/api";

export default function PaymentHistory() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiClient } = useApi();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const result = await apiClient.get("/api/payment/customer/history");
        setPurchases(result.purchases || []);
      } catch (err) {
        console.error("Failed to fetch purchases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [apiClient]);

  if (loading) return <div>Loading payment history...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">Amount</th>
            <th className="border p-2 text-left">Type</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">ID</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase) => (
            <tr key={purchase.id}>
              <td className="border p-2">
                {new Date(purchase.createdAt).toLocaleDateString()}
              </td>
              <td className="border p-2">
                ${(purchase.amount / 100).toFixed(2)} {purchase.currency}
              </td>
              <td className="border p-2 capitalize">{purchase.productType}</td>
              <td className="border p-2">
                <span className={
                  purchase.status === "succeeded"
                    ? "bg-green-100 text-green-800 px-2 py-1 rounded"
                    : purchase.status === "failed"
                    ? "bg-red-100 text-red-800 px-2 py-1 rounded"
                    : "bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
                }>
                  {purchase.status}
                </span>
              </td>
              <td className="border p-2 text-sm text-gray-500">
                {purchase.id.slice(0, 8)}...
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {purchases.length === 0 && (
        <p className="text-center py-8 text-gray-500">
          No payment history found
        </p>
      )}
    </div>
  );
}
```

## Common Errors & Solutions

### Error: "Invalid Stripe Key"
```tsx
// ❌ Wrong
const stripe = loadStripe("sk_live_xxxxx"); // Secret key!

// ✅ Correct
const stripe = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
// Use .env.local, not sk_ keys
```

### Error: "Amount must be greater than 0"
```typescript
// ❌ Wrong
amount: 50 // $50, but Stripe expects cents!

// ✅ Correct
amount: 5000 // $50.00
```

### Error: "Payment method not found"
```typescript
// ❌ Wrong
const cardId = "visa_card"; // Not real

// ✅ Correct
const cardId = "pm_1234567890"; // From Stripe
```

### Error: "Webhook signature invalid"
```typescript
// ❌ Wrong
const event = JSON.parse(req.body); // Raw JSON parsing

// ✅ Correct
const event = stripe.webhooks.constructEvent(
  req.rawBody, // Raw buffer
  signature,
  webhookSecret
);
```
