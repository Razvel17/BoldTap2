"use strict";
// NFC Business Profile Controller
// HTTP request handlers for NFC business profile endpoints
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
exports.createNfcProfile = createNfcProfile;
exports.getNfcProfileBySlug = getNfcProfileBySlug;
exports.getUserNfcProfile = getUserNfcProfile;
exports.updateNfcProfile = updateNfcProfile;
exports.deleteNfcProfile = deleteNfcProfile;
exports.checkSlugAvailability = checkSlugAvailability;
const errors_1 = require("../utils/errors");
const nfcService = __importStar(require("../services/nfcBusinessService"));
// Create NFC business profile
async function createNfcProfile(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const { slug, name, title, phone, email, website, bio } = req.body;
        const validationError = (0, errors_1.validateRequiredFields)({ slug, name, title }, [
            "slug",
            "name",
            "title",
        ]);
        if (validationError) {
            return (0, errors_1.sendError)(res, validationError);
        }
        const result = await nfcService.createNfcBusinessProfile(req.user.userId, {
            slug,
            name,
            title,
            phone,
            email,
            website,
            bio,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to create profile", 400);
        }
        return (0, errors_1.sendCreated)(res, result.data);
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get NFC profile by slug
async function getNfcProfileBySlug(req, res) {
    try {
        const { slug } = req.params;
        if (!slug) {
            return (0, errors_1.sendError)(res, "Slug is required", 400);
        }
        const profile = await nfcService.getNfcProfileBySlug(slug);
        if (!profile) {
            return (0, errors_1.sendError)(res, "Profile not found", 404);
        }
        return (0, errors_1.sendSuccess)(res, { profile });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Get user's NFC profile
async function getUserNfcProfile(req, res) {
    try {
        if (!req.user || !req.user.userId) {
            return (0, errors_1.sendError)(res, "User not authenticated", 401);
        }
        const profile = await nfcService.getUserNfcProfile(req.user.userId);
        if (!profile) {
            return (0, errors_1.sendError)(res, "Profile not found", 404);
        }
        return (0, errors_1.sendSuccess)(res, { profile });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Update NFC profile
async function updateNfcProfile(req, res) {
    try {
        const { profileId } = req.params;
        const { name, title, phone, email, website, bio } = req.body;
        if (!profileId) {
            return (0, errors_1.sendError)(res, "Profile ID is required", 400);
        }
        const result = await nfcService.updateNfcProfile(profileId, {
            name,
            title,
            phone,
            email,
            website,
            bio,
        });
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to update profile", 400);
        }
        return (0, errors_1.sendSuccess)(res, result.data, "Profile updated successfully");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Delete NFC profile
async function deleteNfcProfile(req, res) {
    try {
        const { profileId } = req.params;
        if (!profileId) {
            return (0, errors_1.sendError)(res, "Profile ID is required", 400);
        }
        const result = await nfcService.deleteNfcProfile(profileId);
        if (!result.success) {
            return (0, errors_1.sendError)(res, result.error || "Failed to delete profile", 400);
        }
        return (0, errors_1.sendSuccess)(res, null, "Profile deleted successfully");
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
// Check slug availability
async function checkSlugAvailability(req, res) {
    try {
        const { slug } = req.query;
        if (!slug || typeof slug !== "string") {
            return (0, errors_1.sendError)(res, "Slug is required", 400);
        }
        const available = await nfcService.isSlugAvailable(slug);
        return (0, errors_1.sendSuccess)(res, { available, slug });
    }
    catch (error) {
        return (0, errors_1.sendError)(res, error);
    }
}
//# sourceMappingURL=nfcBusinessController.js.map