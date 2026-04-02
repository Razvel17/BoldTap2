// Loyalty Card Controller
// HTTP request handlers for loyalty card endpoints

import type { Response } from "express";
import {
  sendSuccess,
  sendError,
  sendCreated,
  validateRequiredFields,
} from "../utils/errors";
import * as loyaltyService from "../services/loyaltyCardService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

// Create loyalty business
export async function createLoyaltyBusiness(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { slug, name, description, maxPoints } = req.body;

    const validationError = validateRequiredFields({ slug, name }, [
      "slug",
      "name",
    ]);
    if (validationError) {
      return sendError(res, validationError);
    }

    const result = await loyaltyService.createLoyaltyBusiness(req.user.userId, {
      slug,
      name,
      description,
      maxPoints,
    });

    if (!result.success) {
      return sendError(res, result.error || "Failed to create business", 400);
    }

    return sendCreated(res, result.data);
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get user's loyalty businesses
export async function getUserLoyaltyBusinesses(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const businesses = await loyaltyService.getUserLoyaltyBusinesses(
      req.user.userId,
    );
    return sendSuccess(res, { businesses });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get loyalty business by slug
export async function getLoyaltyBusinessBySlug(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { slug } = req.params as { slug: string };

    if (!slug) {
      return sendError(res, "Slug is required", 400);
    }

    const business = await loyaltyService.getLoyaltyBusinessBySlug(slug);

    if (!business) {
      return sendError(res, "Business not found", 404);
    }

    return sendSuccess(res, { business });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Create loyalty card (init card)
export async function createLoyaltyCard(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { businessId, userId } = req.body;

    const validationError = validateRequiredFields({ businessId, userId }, [
      "businessId",
      "userId",
    ]);
    if (validationError) {
      return sendError(res, validationError);
    }

    const result = await loyaltyService.createLoyaltyCard({
      businessId,
      userId,
    });

    if (!result.success) {
      return sendError(res, result.error || "Failed to create card", 400);
    }

    return sendCreated(res, result.data);
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get loyalty card
export async function getLoyaltyCard(req: AuthenticatedRequest, res: Response) {
  try {
    const { cardId } = req.params as { cardId: string };

    if (!cardId) {
      return sendError(res, "Card ID is required", 400);
    }

    const card = await loyaltyService.getLoyaltyCard(cardId);

    if (!card) {
      return sendError(res, "Card not found", 404);
    }

    return sendSuccess(res, { card });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get user's loyalty cards
export async function getUserLoyaltyCards(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const cards = await loyaltyService.getUserLoyaltyCards(req.user.userId);
    return sendSuccess(res, { cards });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Add points to card
export async function addPointsToCard(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { cardId } = req.params as { cardId: string };
    const { points } = req.body;

    if (!cardId || typeof points !== "number") {
      return sendError(res, "Card ID and points are required", 400);
    }

    const result = await loyaltyService.addPointsToCard(cardId, points);

    if (!result.success) {
      return sendError(res, result.error || "Failed to add points", 400);
    }

    return sendSuccess(res, result.data, "Points added successfully");
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get business loyalty cards (admin)
export async function getBusinessLoyaltyCards(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { businessId } = req.params as { businessId: string };

    if (!businessId) {
      return sendError(res, "Business ID is required", 400);
    }

    const cards = await loyaltyService.getBusinessLoyaltyCards(businessId);
    return sendSuccess(res, { cards });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Delete loyalty card
export async function deleteLoyaltyCard(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { cardId } = req.params as { cardId: string };

    if (!cardId) {
      return sendError(res, "Card ID is required", 400);
    }

    const result = await loyaltyService.deleteLoyaltyCard(cardId);

    if (!result.success) {
      return sendError(res, result.error || "Failed to delete card", 400);
    }

    return sendSuccess(res, null, "Card deleted successfully");
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Update loyalty business
export async function updateLoyaltyBusiness(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { businessId } = req.params as { businessId: string };
    const { name, description, maxPoints } = req.body;

    if (!businessId) {
      return sendError(res, "Business ID is required", 400);
    }

    const result = await loyaltyService.updateLoyaltyBusiness(businessId, {
      name,
      description,
      maxPoints,
    });

    if (!result.success) {
      return sendError(res, result.error || "Failed to update business", 400);
    }

    return sendSuccess(res, result.data, "Business updated successfully");
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}
