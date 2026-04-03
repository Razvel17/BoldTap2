// Payment Service - Mobile money integrations for M-Pesa, Yas, and Airtel Money
import { AppDataSource } from "../config/database";
import { CustomerPurchase } from "../entities/CustomerPurchase";
import {
  createProviderClient,
  getConfiguredProviderNames,
  type MobileMoneyProviderName,
} from "./mobileMoneyProviders";

const purchaseRepo = () => AppDataSource.getRepository(CustomerPurchase);

interface InitiateCollectionOptions {
  customerUserId: string;
  provider: MobileMoneyProviderName;
  phoneNumber: string;
  amount: number;
  currency?: string;
  reference: string;
  customerName?: string;
  description?: string;
  productType?: "nfc_card" | "ring" | "other";
}

function normalizePhoneNumber(phoneNumber: string): string {
  const trimmed = phoneNumber.replace(/[^\d+]/g, "");

  if (trimmed.startsWith("+")) {
    return trimmed.slice(1);
  }

  if (trimmed.startsWith("0")) {
    return `255${trimmed.slice(1)}`;
  }

  return trimmed;
}

export function getSupportedProviders() {
  return [
    {
      id: "mpesa" as const,
      name: "M-Pesa",
      configured: getConfiguredProviderNames().includes("mpesa"),
    },
    {
      id: "yas" as const,
      name: "Yas / Mixx",
      configured: getConfiguredProviderNames().includes("yas"),
    },
    {
      id: "airtel_money" as const,
      name: "Airtel Money",
      configured: getConfiguredProviderNames().includes("airtel_money"),
    },
  ];
}

export async function initiateCollection(
  options: InitiateCollectionOptions,
): Promise<{
  success: boolean;
  paymentId?: string;
  providerTransactionId?: string;
  status?: "pending" | "succeeded" | "failed" | "cancelled";
  error?: string;
}> {
  try {
    if (!options.provider || !options.phoneNumber || !options.reference) {
      return {
        success: false,
        error: "Provider, phone number, and reference are required",
      };
    }

    if (!options.amount || Number(options.amount) <= 0) {
      return {
        success: false,
        error: "Amount must be greater than zero",
      };
    }

    const providerClient = createProviderClient(options.provider);
    const normalizedPhoneNumber = normalizePhoneNumber(options.phoneNumber);

    const purchase = purchaseRepo().create({
      customerId: options.customerUserId,
      provider: options.provider,
      phoneNumber: normalizedPhoneNumber,
      providerReference: options.reference,
      productType: options.productType || "other",
      amount: options.amount,
      currency: options.currency || "TZS",
      status: "pending",
      metadata: {
        description: options.description,
        customerName: options.customerName,
      },
    });

    await purchaseRepo().save(purchase);

    const result = await providerClient.initiateCollection({
      phoneNumber: normalizedPhoneNumber,
      amount: options.amount,
      reference: options.reference,
      customerName: options.customerName,
      description: options.description,
      currency: options.currency || "TZS",
    });

    await purchaseRepo().update(
      { id: purchase.id },
      {
        providerTransactionId: result.providerTransactionId,
        status: result.status,
        metadata: {
          ...(purchase.metadata || {}),
          initiationResponse: result.raw,
        },
      },
    );

    return {
      success: true,
      paymentId: purchase.id,
      providerTransactionId: result.providerTransactionId,
      status: result.status,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Payment initiation failed",
    };
  }
}

export async function getPaymentStatus(
  paymentId: string,
  customerId?: string,
): Promise<CustomerPurchase | null> {
  const where = customerId ? { id: paymentId, customerId } : { id: paymentId };
  return await purchaseRepo().findOne({ where });
}

export async function getCustomerPurchases(customerId: string) {
  return await purchaseRepo().find({
    where: { customerId },
    order: { createdAt: "DESC" },
  });
}

export async function handleProviderCallback(
  provider: MobileMoneyProviderName,
  payload: Record<string, unknown>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const providerTransactionId = findTransactionId(payload);
    const providerReference = findReference(payload);
    const status = normalizeProviderStatus(payload);

    if (!providerTransactionId && !providerReference) {
      return {
        success: false,
        error: "Provider callback missing transaction identifiers",
      };
    }

    const purchase = await purchaseRepo().findOne({
      where: providerTransactionId
        ? { provider, providerTransactionId }
        : { provider, providerReference },
    });

    if (!purchase) {
      return {
        success: false,
        error: "Payment record not found for callback",
      };
    }

    await purchaseRepo().update(
      { id: purchase.id },
      {
        status,
        metadata: {
          ...(purchase.metadata || {}),
          callbackPayload: payload,
        },
      },
    );

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Provider callback failed",
    };
  }
}

function findTransactionId(payload: Record<string, unknown>): string | undefined {
  const candidates = [
    payload.transactionId,
    payload.providerTransactionId,
    payload.checkoutRequestId,
    payload.requestId,
    payload.externalId,
  ];

  return candidates.find((value): value is string => typeof value === "string");
}

function findReference(payload: Record<string, unknown>): string | undefined {
  const candidates = [
    payload.reference,
    payload.providerReference,
    payload.accountReference,
    payload.orderId,
  ];

  return candidates.find((value): value is string => typeof value === "string");
}

function normalizeProviderStatus(
  payload: Record<string, unknown>,
): "pending" | "succeeded" | "failed" | "cancelled" {
  const rawStatus = [
    payload.status,
    payload.result,
    payload.transactionStatus,
  ].find((value): value is string => typeof value === "string");

  const normalized = rawStatus?.toLowerCase() || "pending";

  if (["success", "successful", "completed", "succeeded", "paid"].includes(normalized)) {
    return "succeeded";
  }

  if (["failed", "error", "declined"].includes(normalized)) {
    return "failed";
  }

  if (["cancelled", "canceled"].includes(normalized)) {
    return "cancelled";
  }

  return "pending";
}

