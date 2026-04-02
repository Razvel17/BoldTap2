"use strict";
// Loyalty Card Controller
// HTTP request handlers for loyalty card endpoints
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLoyaltyBusiness = createLoyaltyBusiness;
exports.getUserLoyaltyBusinesses = getUserLoyaltyBusinesses;
exports.getLoyaltyBusinessBySlug = getLoyaltyBusinessBySlug;
exports.createLoyaltyCard = createLoyaltyCard;
exports.getLoyaltyCard = getLoyaltyCard;
exports.getUserLoyaltyCards = getUserLoyaltyCards;
exports.addPointsToCard = addPointsToCard;
exports.getBusinessLoyaltyCards = getBusinessLoyaltyCards;
exports.deleteLoyaltyCard = deleteLoyaltyCard;
exports.updateLoyaltyBusiness = updateLoyaltyBusiness;
const errors_1 = require("../utils/errors");
const loyaltyService = __importStar(require("../services/loyaltyCardService"));
// Create loyalty business
async function createLoyaltyBusiness(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const { slug, name, description, maxPoints } = req.body;
        const validationError = (0, errors_1.validateRequiredFields)({ slug, name }, [
            "slug",
            "name",
        ]);
        if (validationError) {
            return (0, errors_1.sendError)(res, validationError);
        }
        const result = await loyaltyService.createLoyaltyBusiness(req.user.userId, {
            slug,
            name,
            description,
            maxPoints,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to create business", 400);
        }
        return (0, errors_1.sendCreated)(res, result.data);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get user's loyalty businesses
async function getUserLoyaltyBusinesses(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const businesses = await loyaltyService.getUserLoyaltyBusinesses(req.user.userId);
        return (0, errors_1.sendSuccess)(res, { businesses });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get loyalty business by slug
async function getLoyaltyBusinessBySlug(req, res) {
    try {
        const { slug } = req.params;
        if (!slug) {
            return (0, errors_1.sendError)(res, "Slug is required", 400);
        }
        const business = await loyaltyService.getLoyaltyBusinessBySlug(slug);
        if (!business) {
            return (0, errors_1.sendError)(res, "Business not found", 404);
        }
        return (0, errors_1.sendSuccess)(res, { business });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Create loyalty card (init card)
async function createLoyaltyCard(req, res) {
    try {
        const { businessId, userId } = req.body;
        const validationError = (0, errors_1.validateRequiredFields)({ businessId, userId }, [
            "businessId",
            "userId",
        ]);
        if (validationError) {
            return (0, errors_1.sendError)(res, validationError);
        }
        const result = await loyaltyService.createLoyaltyCard({
            businessId,
            userId,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to create card", 400);
        }
        return (0, errors_1.sendCreated)(res, result.data);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get loyalty card
async function getLoyaltyCard(req, res) {
    try {
        const { cardId } = req.params;
        if (!cardId) {
            return (0, errors_1.sendError)(res, "Card ID is required", 400);
        }
        const card = await loyaltyService.getLoyaltyCard(cardId);
        if (!card) {
            return (0, errors_1.sendError)(res, "Card not found", 404);
        }
        return (0, errors_1.sendSuccess)(res, { card });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get user's loyalty cards
async function getUserLoyaltyCards(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const cards = await loyaltyService.getUserLoyaltyCards(req.user.userId);
        return (0, errors_1.sendSuccess)(res, { cards });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Add points to card
async function addPointsToCard(req, res) {
    try {
        const { cardId } = req.params;
        const { points } = req.body;
        if (!cardId || typeof points !== "number") {
            return (0, errors_1.sendError)(res, "Card ID and points are required", 400);
        }
        const result = await loyaltyService.addPointsToCard(cardId, points);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to add points", 400);
        }
        return (0, errors_1.sendSuccess)(res, result.data, "Points added successfully");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get business loyalty cards (admin)
async function getBusinessLoyaltyCards(req, res) {
    try {
        const { businessId } = req.params;
        if (!businessId) {
            return (0, errors_1.sendError)(res, "Business ID is required", 400);
        }
        const cards = await loyaltyService.getBusinessLoyaltyCards(businessId);
        return (0, errors_1.sendSuccess)(res, { cards });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Delete loyalty card
async function deleteLoyaltyCard(req, res) {
    try {
        const { cardId } = req.params;
        if (!cardId) {
            return (0, errors_1.sendError)(res, "Card ID is required", 400);
        }
        const result = await loyaltyService.deleteLoyaltyCard(cardId);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to delete card", 400);
        }
        return (0, errors_1.sendSuccess)(res, null, "Card deleted successfully");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Update loyalty business
async function updateLoyaltyBusiness(req, res) {
    try {
        const { businessId } = req.params;
        const { name, description, maxPoints } = req.body;
        if (!businessId) {
            return (0, errors_1.sendError)(res, "Business ID is required", 400);
        }
        const result = await loyaltyService.updateLoyaltyBusiness(businessId, {
            name,
            description,
            maxPoints,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to update business", 400);
        }
        return (0, errors_1.sendSuccess)(res, result.data, "Business updated successfully");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
//# sourceMappingURL=loyaltyCardController.js.map