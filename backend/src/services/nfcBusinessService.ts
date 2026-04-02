// NFC Business Profile services
// Business logic for NFC business card operations

import { db } from "../config/db";
import type { NfcBusinessProfile } from "../types/index";

interface CreateNfcBusinessInput {
  slug: string;
  name: string;
  title: string;
  phone?: string;
  email?: string;
  website?: string;
  bio?: string;
}

// Create NFC business profile
export async function createNfcBusinessProfile(
  userId: string,
  input: CreateNfcBusinessInput,
): Promise<{ success: boolean; data?: NfcBusinessProfile; error?: string }> {
  try {
    // Check if slug is already taken
    const existing = await db.nfcBusinessProfiles.findBySlug(input.slug);
    if (existing) {
      return { success: false, error: "Business slug already exists" };
    }

    // Check if user already has an NFC profile
    const userProfile = await db.nfcBusinessProfiles.findByUserId(userId);
    if (userProfile) {
      return {
        success: false,
        error: "User already has an NFC business profile",
      };
    }

    const profile = await db.nfcBusinessProfiles.create({
      userId,
      slug: input.slug,
      name: input.name,
      title: input.title,
      phone: input.phone,
      email: input.email,
      website: input.website,
      bio: input.bio,
    });

    return { success: true, data: profile };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create NFC profile",
    };
  }
}

// Get NFC profile by slug
export async function getNfcProfileBySlug(
  slug: string,
): Promise<NfcBusinessProfile | null> {
  try {
    return await db.nfcBusinessProfiles.findBySlug(slug);
  } catch (error) {
    console.error("Error fetching NFC profile:", error);
    return null;
  }
}

// Get user's NFC profile
export async function getUserNfcProfile(
  userId: string,
): Promise<NfcBusinessProfile | null> {
  try {
    return await db.nfcBusinessProfiles.findByUserId(userId);
  } catch (error) {
    console.error("Error fetching user NFC profile:", error);
    return null;
  }
}

// Update NFC profile
export async function updateNfcProfile(
  profileId: string,
  data: Partial<CreateNfcBusinessInput>,
): Promise<{ success: boolean; data?: NfcBusinessProfile; error?: string }> {
  try {
    const updated = await db.nfcBusinessProfiles.update(profileId, {
      ...data,
      userId: "",
    });

    if (!updated) {
      return { success: false, error: "Profile not found" };
    }

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}

// Get NFC profile by ID
export async function getNfcProfileById(
  profileId: string,
): Promise<NfcBusinessProfile | null> {
  try {
    return await db.nfcBusinessProfiles.findById(profileId);
  } catch (error) {
    console.error("Error fetching NFC profile:", error);
    return null;
  }
}

// Delete NFC profile
export async function deleteNfcProfile(
  profileId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = await db.nfcBusinessProfiles.delete(profileId);
    if (!deleted) {
      return { success: false, error: "Profile not found" };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete profile",
    };
  }
}

// Check if slug is available
export async function isSlugAvailable(slug: string): Promise<boolean> {
  try {
    return !(await db.nfcBusinessProfiles.slugExists(slug));
  } catch (error) {
    console.error("Error checking slug availability:", error);
    return false;
  }
}
