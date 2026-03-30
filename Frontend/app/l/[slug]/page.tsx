"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import LoyaltyCard from "@/components/LoyaltyCard";
import { getPublicLoyaltyCardBySlug } from "@/contexts/lib/loyaltyCard";
import {
  addCustomer,
  getCustomer,
  getStoredVisitorCustomerId,
  setStoredVisitorCustomerId,
} from "@/contexts/lib/loyaltyCustomers";
import { findUserIdByLoyaltySlug } from "@/contexts/lib/userRegistry";

export default function PublicLoyaltyPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [refresh, setRefresh] = useState(0);

  const merchantId = useMemo(
    () => (slug ? findUserIdByLoyaltySlug(slug) : null),
    [slug],
  );

  const pack = useMemo(() => {
    if (!slug) return null;
    return getPublicLoyaltyCardBySlug(slug);
  }, [slug, refresh]);

  const visitor = useMemo(() => {
    if (!merchantId || typeof window === "undefined") return null;
    const vid = getStoredVisitorCustomerId(merchantId);
    if (!vid) return null;
    return getCustomer(merchantId, vid);
  }, [merchantId, refresh]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    if (!merchantId || !name.trim()) return;
    const c = addCustomer(merchantId, {
      name: name.trim(),
      phone: phone.trim() || undefined,
    });
    setStoredVisitorCustomerId(merchantId, c.id);
    setRefresh((x) => x + 1);
  };

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Invalid link</p>
      </div>
    );
  }

  if (!pack || !merchantId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-100">
        <p className="text-gray-800 font-semibold mb-2">Program not found</p>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </div>
    );
  }

  const displayCard = pack.card;
  if (!displayCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-100">
        <p className="text-gray-600 mb-4">This loyalty program is not set up yet.</p>
        <Link href="/" className="text-sm underline">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {!visitor ? (
          <form
            onSubmit={handleJoin}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4"
          >
            <h1 className="text-lg font-bold text-black">
              {displayCard.businessName}
            </h1>
            <p className="text-sm text-gray-600">{displayCard.description}</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your name
              </label>
              <input
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                name="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-black text-white font-semibold rounded-lg"
            >
              Save my card
            </button>
          </form>
        ) : (
          <LoyaltyCard
            card={displayCard}
            stampCount={visitor.stamps}
            interactive={false}
          />
        )}

        <p className="text-center text-xs text-gray-500">
          <Link href="/" className="underline">
            BoldTap
          </Link>
        </p>
      </div>
    </div>
  );
}
