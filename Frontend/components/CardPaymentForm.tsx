// Card Payment Component - Handle credit card payments with Stripe
import React, { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
  LinkAuthenticationElement,
} from "@stripe/react-stripe-js";
import { useApi } from "@/contexts/api";

interface CardPaymentProps {
  amount: number; // Amount in cents
  currency?: string;
  description?: string;
  productType?: "nfc_card" | "ring" | "subscription" | "other";
  reference?: string;
  planName?: string;
  onSuccess?: (paymentId: string, paymentIntentId: string) => void;
  onError?: (error: string) => void;
  onLoading?: (loading: boolean) => void;
}

export const CardPaymentForm: React.FC<CardPaymentProps> = ({
  amount,
  currency = "usd",
  description,
  productType = "other",
  reference,
  planName,
  onSuccess,
  onError,
  onLoading,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { apiClient } = useApi();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create payment intent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.post("/api/payment/card/intent", {
          amount,
          currency,
          description,
        });

        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
        }
      } catch (err) {
        setError((err as Error).message || "Failed to initialize payment");
        onError?.((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, currency, description, apiClient, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe not loaded");
      return;
    }

    setIsLoading(true);
    onLoading?.(true);
    setError(null);

    try {
      // Process the payment
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message || "Payment failed");
        onError?.(submitError.message || "Payment failed");
        return;
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          clientSecret: clientSecret || "",
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`,
            receipt_email: email || undefined,
          },
        });

      if (confirmError) {
        setError(confirmError.message || "Payment confirmation failed");
        onError?.(confirmError.message || "Payment confirmation failed");
      } else if (paymentIntent?.status === "succeeded") {
        onSuccess?.(reference || "", paymentIntent.id);
      }
    } catch (err) {
      const errorMsg = (err as Error).message || "Unexpected error occurred";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>

        <div className="mb-4">
          <LinkAuthenticationElement
            onChange={(e) => setEmail(e.value.email)}
          />
        </div>

        <PaymentElement />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition"
      >
        {isLoading ? "Processing..." : `Pay $${(amount / 100).toFixed(2)}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is secure and processed by Stripe
      </p>
    </form>
  );
};

// Saved Card Selection Component
interface SavedCardProps {
  onCardSelect: (paymentMethodId: string) => void;
  onAddNew?: () => void;
}

export const SavedCardSelector: React.FC<SavedCardProps> = ({
  onCardSelect,
  onAddNew,
}) => {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { apiClient } = useApi();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await apiClient.get("/api/payment/card/methods");
        setCards(response.methods || []);
      } catch (err) {
        console.error("Failed to fetch saved cards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [apiClient]);

  if (loading) {
    return <div className="text-center py-4">Loading saved cards...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Payment Method</h3>

      {cards.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No saved cards</p>
          <button
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Add New Card
          </button>
        </div>
      ) : (
        <>
          {cards.map((card) => (
            <div
              key={card.id}
              className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition"
              onClick={() => onCardSelect(card.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold capitalize">
                    {card.brand} •••• {card.last4}
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires {card.expMonth}/{card.expYear}
                  </p>
                </div>
                <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  Select
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={onAddNew}
            className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 py-3 px-4 rounded text-gray-600 hover:text-blue-600 transition"
          >
            + Add New Card
          </button>
        </>
      )}
    </div>
  );
};

// Payment Success Component
interface PaymentSuccessProps {
  paymentIntentId: string;
  amount: number;
  onClose?: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  paymentIntentId,
  amount,
  onClose,
}) => {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">✓</div>
      <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful</h2>
      <p className="text-gray-600 mb-4">
        Your payment of ${(amount / 100).toFixed(2)} has been processed.
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Transaction ID: {paymentIntentId}
      </p>
      {onClose && (
        <button
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded"
        >
          Close
        </button>
      )}
    </div>
  );
};

// Payment Error Component
interface PaymentErrorProps {
  error: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export const PaymentError: React.FC<PaymentErrorProps> = ({
  error,
  onRetry,
  onClose,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="text-4xl mb-4">⚠</div>
      <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h2>
      <p className="text-gray-600 mb-6">{error}</p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
          >
            Retry
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
