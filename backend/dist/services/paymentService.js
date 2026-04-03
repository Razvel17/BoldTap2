"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupportedProviders = getSupportedProviders;
exports.initiateCollection = initiateCollection;
exports.getPaymentStatus = getPaymentStatus;
exports.getCustomerPurchases = getCustomerPurchases;
exports.handleProviderCallback = handleProviderCallback;
// Payment Service - Mobile money integrations for M-Pesa, Yas, and Airtel Money
const database_1 = require("../config/database");
const CustomerPurchase_1 = require("../entities/CustomerPurchase");
const mobileMoneyProviders_1 = require("./mobileMoneyProviders");
const purchaseRepo = () => database_1.AppDataSource.getRepository(CustomerPurchase_1.CustomerPurchase);
function normalizePhoneNumber(phoneNumber) {
    const trimmed = phoneNumber.replace(/[^\d+]/g, "");
    if (trimmed.startsWith("+")) {
        return trimmed.slice(1);
    }
    if (trimmed.startsWith("0")) {
        return `255${trimmed.slice(1)}`;
    }
    return trimmed;
}
function getSupportedProviders() {
    return [
        {
            id: "mpesa",
            name: "M-Pesa",
            configured: (0, mobileMoneyProviders_1.getConfiguredProviderNames)().includes("mpesa"),
        },
        {
            id: "yas",
            name: "Yas / Mixx",
            configured: (0, mobileMoneyProviders_1.getConfiguredProviderNames)().includes("yas"),
        },
        {
            id: "airtel_money",
            name: "Airtel Money",
            configured: (0, mobileMoneyProviders_1.getConfiguredProviderNames)().includes("airtel_money"),
        },
    ];
}
async function initiateCollection(options) {
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
        const providerClient = (0, mobileMoneyProviders_1.createProviderClient)(options.provider);
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
        await purchaseRepo().update({ id: purchase.id }, {
            providerTransactionId: result.providerTransactionId,
            status: result.status,
            metadata: {
                ...(purchase.metadata || {}),
                initiationResponse: result.raw,
            },
        });
        return {
            success: true,
            paymentId: purchase.id,
            providerTransactionId: result.providerTransactionId,
            status: result.status,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Payment initiation failed",
        };
    }
}
async function getPaymentStatus(paymentId, customerId) {
    const where = customerId ? { id: paymentId, customerId } : { id: paymentId };
    return await purchaseRepo().findOne({ where });
}
async function getCustomerPurchases(customerId) {
    return await purchaseRepo().find({
        where: { customerId },
        order: { createdAt: "DESC" },
    });
}
async function handleProviderCallback(provider, payload) {
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
        await purchaseRepo().update({ id: purchase.id }, {
            status,
            metadata: {
                ...(purchase.metadata || {}),
                callbackPayload: payload,
            },
        });
        return { success: true };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Provider callback failed",
        };
    }
}
function findTransactionId(payload) {
    const candidates = [
        payload.transactionId,
        payload.providerTransactionId,
        payload.checkoutRequestId,
        payload.requestId,
        payload.externalId,
    ];
    return candidates.find((value) => typeof value === "string");
}
function findReference(payload) {
    const candidates = [
        payload.reference,
        payload.providerReference,
        payload.accountReference,
        payload.orderId,
    ];
    return candidates.find((value) => typeof value === "string");
}
function normalizeProviderStatus(payload) {
    const rawStatus = [
        payload.status,
        payload.result,
        payload.transactionStatus,
    ].find((value) => typeof value === "string");
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
//# sourceMappingURL=paymentService.js.map