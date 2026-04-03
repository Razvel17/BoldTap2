"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProviderClient = createProviderClient;
exports.getConfiguredProviderNames = getConfiguredProviderNames;
// Mobile money provider registry for M-Pesa, Yas, and Airtel Money.
// Payload shapes are intentionally lightweight and may need adjustment once
// each provider's production onboarding documentation is available.
const env_1 = require("../config/env");
const providerConfigs = {
    mpesa: {
        provider: "mpesa",
        apiUrl: env_1.MPESA_API_URL,
        apiKey: env_1.MPESA_API_KEY,
        businessId: env_1.MPESA_BUSINESS_ID,
        statusUrl: env_1.MPESA_STATUS_URL,
    },
    yas: {
        provider: "yas",
        apiUrl: env_1.YAS_API_URL,
        apiKey: env_1.YAS_API_KEY,
        businessId: env_1.YAS_BUSINESS_ID,
        statusUrl: env_1.YAS_STATUS_URL,
    },
    airtel_money: {
        provider: "airtel_money",
        apiUrl: env_1.AIRTEL_MONEY_API_URL,
        apiKey: env_1.AIRTEL_MONEY_API_KEY,
        businessId: env_1.AIRTEL_MONEY_BUSINESS_ID,
        statusUrl: env_1.AIRTEL_MONEY_STATUS_URL,
    },
};
class HttpMobileMoneyProvider {
    constructor(config) {
        this.config = config;
    }
    async initiateCollection(input) {
        this.assertConfigured();
        const payload = this.buildCollectionPayload(input);
        const raw = await this.postJson(this.config.apiUrl, payload);
        return {
            providerTransactionId: this.readTransactionId(raw),
            status: this.readStatus(raw),
            raw,
        };
    }
    async getTransactionStatus(providerTransactionId) {
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
    assertConfigured() {
        if (!this.config.apiUrl ||
            !this.config.apiKey ||
            !this.config.businessId ||
            !this.config.statusUrl) {
            throw new Error(`${this.config.provider} mobile money integration is not fully configured`);
        }
    }
    buildCollectionPayload(input) {
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
    async postJson(url, body) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const raw = (await response.json().catch(() => ({})));
        if (!response.ok) {
            throw new Error(typeof raw.message === "string"
                ? raw.message
                : `Provider request failed with status ${response.status}`);
        }
        return raw;
    }
    readTransactionId(raw, fallback = "") {
        const candidates = [
            raw.transactionId,
            raw.providerTransactionId,
            raw.checkoutRequestId,
            raw.requestId,
            raw.externalId,
        ];
        return (candidates.find((value) => typeof value === "string") ||
            fallback ||
            `pending_${Date.now()}`);
    }
    readStatus(raw) {
        const value = [
            raw.status,
            raw.result,
            raw.transactionStatus,
        ].find((item) => typeof item === "string");
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
function createProviderClient(provider) {
    return new HttpMobileMoneyProvider(providerConfigs[provider]);
}
function getConfiguredProviderNames() {
    return (Object.values(providerConfigs).filter((config) => {
        return Boolean(config.apiUrl &&
            config.apiKey &&
            config.businessId &&
            config.statusUrl);
    }).map((config) => config.provider));
}
//# sourceMappingURL=mobileMoneyProviders.js.map