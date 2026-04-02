// NFC Business Profile Controller
// HTTP request handlers for NFC business profile endpoints

import type { Response } from "express";
import {
  sendSuccess,
  sendError,
  sendCreated,
  validateRequiredFields,
} from "../utils/errors";
import * as nfcService from "../services/nfcBusinessService";
import type { AuthenticatedRequest } from "../middleware/authMiddleware";

// Create NFC business profile
export async function createNfcProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const { slug, name, title, phone, email, website, bio } = req.body;

    const validationError = validateRequiredFields({ slug, name, title }, [
      "slug",
      "name",
      "title",
    ]);
    if (validationError) {
      return sendError(res, validationError);
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
      return sendError(res, result.error || "Failed to create profile", 400);
    }

    return sendCreated(res, result.data);
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get NFC profile by slug
export async function getNfcProfileBySlug(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { slug } = req.params as { slug: string };

    if (!slug) {
      return sendError(res, "Slug is required", 400);
    }

    const profile = await nfcService.getNfcProfileBySlug(slug);

    if (!profile) {
      return sendError(res, "Profile not found", 404);
    }

    return sendSuccess(res, { profile });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Get user's NFC profile
export async function getUserNfcProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || !req.user.userId) {
      return sendError(res, "User not authenticated", 401);
    }

    const profile = await nfcService.getUserNfcProfile(req.user.userId);

    if (!profile) {
      return sendError(res, "Profile not found", 404);
    }

    return sendSuccess(res, { profile });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Update NFC profile
export async function updateNfcProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { profileId } = req.params as { profileId: string };
    const { name, title, phone, email, website, bio } = req.body;

    if (!profileId) {
      return sendError(res, "Profile ID is required", 400);
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
      return sendError(res, result.error || "Failed to update profile", 400);
    }

    return sendSuccess(res, result.data, "Profile updated successfully");
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Delete NFC profile
export async function deleteNfcProfile(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { profileId } = req.params as { profileId: string };

    if (!profileId) {
      return sendError(res, "Profile ID is required", 400);
    }

    const result = await nfcService.deleteNfcProfile(profileId);

    if (!result.success) {
      return sendError(res, result.error || "Failed to delete profile", 400);
    }

    return sendSuccess(res, null, "Profile deleted successfully");
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}

// Check slug availability
export async function checkSlugAvailability(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const { slug } = req.query as { slug: string };

    if (!slug || typeof slug !== "string") {
      return sendError(res, "Slug is required", 400);
    }

    const available = await nfcService.isSlugAvailable(slug);

    return sendSuccess(res, { available, slug });
  } catch (error: unknown) {
    return sendError(res, error as Error);
  }
}
