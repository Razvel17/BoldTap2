// Mobile money provider registry for M-Pesa, Yas, and Airtel Money.
// Payload shapes are intentionally lightweight and may need adjustment once
// each provider's production onboarding documentation is available.
import {
  AIRTEL_MONEY_API_KEY,
  AIRTEL_MONEY_API_URL,
  AIRTEL_MONEY_BUSINESS_ID,
  AIRTEL_MONEY_STATUS_URL,
  MPESA_API_KEY,
  MPESA_API_URL,
  MPESA_BUSINESS_ID,
  MPESA_STATUS_URL,
  YAS_API_KEY,
  YAS_API_URL,
  YAS_BUSINESS_ID,
  YAS_STATUS_URL,
} from "../config/env";

export type MobileMoneyProviderName = "mpesa" | "yas" | "airtel_money";

interface InitiateCollectionInput {
  phoneNumber: string;
  amount: number;
  reference: string;
  currency: string;
  customerName?: string;
  description?: string;
}

interface ProviderResult {
  providerTransactionId: string;
  status: "pending" | "succeeded" | "failed" | "cancelled";
  raw: unknown;
}

interface ProviderConfig {
  provider: MobileMoneyProviderName;
  apiUrl: string;
  apiKey: string;
  businessId: string;
  statusUrl: string;
}

export interface MobileMoneyProvider {
  initiateCollection(input: InitiateCollectionInput): Promise<ProviderResult>;
  getTransactionStatus(providerTransactionId: string): Promise<ProviderResult>;
}

const providerConfigs: Record<MobileMoneyProviderName, ProviderConfig> = {
  mpesa: {
    provider: "mpesa",
    apiUrl: MPESA_API_URL,
    apiKey: MPESA_API_KEY,
    businessId: MPESA_BUSINESS_ID,
    statusUrl: MPESA_STATUS_URL,
  },
  yas: {
    provider: "yas",
    apiUrl: YAS_API_URL,
    apiKey: YAS_API_KEY,
    businessId: YAS_BUSINESS_ID,
    statusUrl: YAS_STATUS_URL,
  },
  airtel_money: {
    provider: "airtel_money",
    apiUrl: AIRTEL_MONEY_API_URL,
    apiKey: AIRTEL_MONEY_API_KEY,
    businessId: AIRTEL_MONEY_BUSINESS_ID,
    statusUrl: AIRTEL_MONEY_STATUS_URL,
  },
};

class HttpMobileMoneyProvider implements MobileMoneyProvider {
  constructor(private config: ProviderConfig) {}

  async initiateCollection(input: InitiateCollectionInput): Promise<ProviderResult> {
    this.assertConfigured();

    const payload = this.buildCollectionPayload(input);
    const raw = await this.postJson(this.config.apiUrl, payload);

    return {
      providerTransactionId: this.readTransactionId(raw),
      status: this.readStatus(raw),
      raw,
    };
  }

  async getTransactionStatus(
    providerTransactionId: string,
  ): Promise<ProviderResult> {
    this.assertConfigured();

    const raw = await this.postJson(this.config.statusUrl, {
      businessId: this.config.businessId,
      provider: this.config.provider,
      transactionId: providerTransactionId,
    });

    return {
      providerTransactionId: this.readTransactionId(raw, providerTransactionId),
      status: this.readStatus(raw),
      raw,
    };
  }

  private assertConfigured(): void {
    if (
      !this.config.apiUrl ||
      !this.config.apiKey ||
      !this.config.businessId ||
      !this.config.statusUrl
    ) {
      throw new Error(
        `${this.config.provider} mobile money integration is not fully configured`,
      );
    }
  }

  private buildCollectionPayload(input: InitiateCollectionInput) {
    return {
      provider: this.config.provider,
      businessId: this.config.businessId,
      msisdn: input.phoneNumber,
      amount: input.amount,
      currency: input.currency,
      reference: input.reference,
      customerName: input.customerName,
      description: input.description,
    };
  }

  private async postJson(
    url: string,
    body: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = (await response.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;

    if (!response.ok) {
      throw new Error(
        typeof raw.message === "string"
          ? raw.message
          : `Provider request failed with status ${response.status}`,
      );
    }

    return raw;
  }

  private readTransactionId(
    raw: Record<string, unknown>,
    fallback = "",
  ): string {
    const candidates = [
      raw.transactionId,
      raw.providerTransactionId,
      raw.checkoutRequestId,
      raw.requestId,
      raw.externalId,
    ];

    return (
      candidates.find((value): value is string => typeof value === "string") ||
      fallback ||
      `pending_${Date.now()}`
    );
  }

  private readStatus(
    raw: Record<string, unknown>,
  ): "pending" | "succeeded" | "failed" | "cancelled" {
    const value = [
      raw.status,
      raw.result,
      raw.transactionStatus,
    ].find((item): item is string => typeof item === "string");

    const normalized = value?.toLowerCase() || "pending";

    if (["success", "successful", "completed", "succeeded", "paid"].includes(normalized)) {
      return "succeeded";
    }

    if (["failed", "declined", "error"].includes(normalized)) {
      return "failed";
    }

    if (["cancelled", "canceled"].includes(normalized)) {
      return "cancelled";
    }

    return "pending";
  }
}

export function createProviderClient(
  provider: MobileMoneyProviderName,
): MobileMoneyProvider {
  return new HttpMobileMoneyProvider(providerConfigs[provider]);
}

export function getConfiguredProviderNames(): MobileMoneyProviderName[] {
  return (Object.values(providerConfigs).filter((config) => {
    return Boolean(
      config.apiUrl &&
      config.apiKey &&
      config.businessId &&
      config.statusUrl,
    );
  }).map((config) => config.provider));
}
