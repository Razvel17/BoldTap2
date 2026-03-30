"use client";

import { useMemo, type ComponentType } from "react";
import {
  Copy,
  Share2,
  Save,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";
import type { NfcProfileData } from "@/contexts/lib/nfcProfile";

function TikTokGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

/** Treat as empty (hidden on card) */
function hasText(s: string | undefined | null): boolean {
  if (!s) return false;
  const t = s.trim();
  if (!t) return false;
  if (t.toLowerCase() === "add your website url") return false;
  return true;
}

function pickSocials(links: NfcProfileData["socialLinks"]) {
  const order = ["instagram", "twitter", "tiktok", "linkedin"] as const;
  const out: {
    key: string;
    href: string;
    Icon: ComponentType<{ className?: string }>;
  }[] = [];
  for (const key of order) {
    const found = links.find((l) => {
      if (!l.url?.trim()) return false;
      return l.label.toLowerCase().includes(key);
    });
    if (found) {
      const href = found.url.startsWith("http")
        ? found.url
        : `https://${found.url}`;
      let Icon: ComponentType<{ className?: string }> = Linkedin;
      if (key === "instagram") Icon = Instagram;
      else if (key === "twitter") Icon = Twitter;
      else if (key === "tiktok") Icon = TikTokGlyph;
      else if (key === "linkedin") Icon = Linkedin;
      out.push({ key, href, Icon });
    }
  }
  return out;
}

function buildVCard(
  name: string,
  opts: {
    email?: string;
    phone?: string;
    website?: string;
    title?: string;
  },
): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCard(name)}`,
  ];
  if (opts.title) lines.push(`TITLE:${escapeVCard(opts.title)}`);
  if (opts.email) lines.push(`EMAIL:${escapeVCard(opts.email)}`);
  if (opts.phone) lines.push(`TEL:${escapeVCard(opts.phone)}`);
  if (opts.website) {
    const w = opts.website.startsWith("http") ? opts.website : `https://${opts.website}`;
    lines.push(`URL:${escapeVCard(w)}`);
  }
  lines.push("END:VCARD");
  return lines.join("\r\n");
}

function escapeVCard(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export interface NfcBusinessCardViewProps {
  profile: NfcProfileData | null;
  fallbackName: string;
  fallbackEmail?: string;
  /** Current page URL for sharing (public page sets this) */
  shareUrl?: string;
  /** Hide footer CTA on embedded preview */
  showFooterCta?: boolean;
  className?: string;
}

export default function NfcBusinessCardView({
  profile,
  fallbackName,
  fallbackEmail = "",
  shareUrl = typeof window !== "undefined" ? window.location.href : "",
  showFooterCta = true,
  className = "",
}: NfcBusinessCardViewProps) {
  const name = hasText(profile?.name) ? profile!.name.trim() : fallbackName;
  const title = hasText(profile?.title) ? profile!.title.trim() : "";
  const company = hasText(profile?.company) ? profile!.company.trim() : "";
  const websiteRaw = profile?.website?.trim() ?? "";
  const website =
    websiteRaw && !/^add your website/i.test(websiteRaw) ? websiteRaw : "";
  const about = hasText(profile?.about) ? profile!.about!.trim() : "";
  const bannerUrl = profile?.bannerImageUrl?.trim();
  const profileImg = profile?.profileImageUrl?.trim();

  const phones =
    profile?.phones?.map((p) => p.trim()).filter(Boolean) ?? [];
  const emails =
    profile?.emails?.map((e) => e.trim()).filter(Boolean) ?? [];
  const primaryPhone = phones[0] ?? "";
  // Only show email when the saved profile actually has it.
  const primaryEmail = profile ? (emails[0] ?? "") : fallbackEmail;

  const socials = useMemo(
    () => pickSocials(profile?.socialLinks ?? []),
    [profile],
  );

  const websiteHref = website
    ? website.startsWith("http")
      ? website
      : `https://${website}`
    : "";
  const websiteLabel = website
    ? (() => {
        try {
          const u = new URL(websiteHref);
          return u.hostname.replace(/^www\./, "");
        } catch {
          return website;
        }
      })()
    : "";

  const saveContact = () => {
    const vc = buildVCard(name, {
      email: primaryEmail || undefined,
      phone: primaryPhone || undefined,
      website: website || undefined,
      title: title || company || undefined,
    });
    const blob = new Blob([vc], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_") || "contact"}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (navigator.share) {
        await navigator.share({
          title: name,
          text: `${name}${title ? ` — ${title}` : ""}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
    }
  };

  const copyWebsite = async () => {
    if (!websiteHref) return;
    try {
      await navigator.clipboard.writeText(websiteHref);
    } catch {
      /* ignore */
    }
  };

  const showWebsite = !!websiteHref;
  const showAbout = !!about;
  const showPhoneLine = !!primaryPhone;
  const showContact = showPhoneLine || !!primaryEmail;

  return (
    <div
      className={`mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-[#fdf6f4] shadow-[0_8px_40px_rgba(0,0,0,0.12)] ${className}`}
    >
      <div className="relative">
        <div className="h-40 w-full overflow-hidden bg-gradient-to-br from-slate-400 via-slate-500 to-slate-700 sm:h-44">
          {bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={bannerUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>
        <div className="relative flex flex-col items-center px-5 pb-2 pt-0">
          <div className="-mt-14 z-10 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
            {profileImg ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImg}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-2xl font-bold text-white">
                {name
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "?"}
              </div>
            )}
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-black">
            {name}
          </h1>
          {title ? (
            <p className="mt-1 text-center text-sm text-gray-500">{title}</p>
          ) : null}
          {company ? (
            <p
              className={`text-center text-gray-500 ${title ? "mt-0.5 text-xs" : "mt-1 text-sm"}`}
            >
              {company}
            </p>
          ) : null}
        </div>
      </div>

      {showWebsite ? (
        <>
          <div className="relative px-5">
            <div className="absolute left-5 right-5 top-1/2 h-px bg-gray-200" />
            <div className="relative flex justify-center py-3">
              <div className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-sm">
                <button
                  type="button"
                  onClick={copyWebsite}
                  className="p-0.5 text-gray-600 hover:text-black"
                  aria-label="Copy website URL"
                >
                  <Copy className="h-4 w-4 shrink-0" />
                </button>
                <a
                  href={websiteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {websiteLabel || "Website"}
                </a>
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div className="space-y-4 px-5 pb-6 pt-2">
        {showAbout ? (
          <div className="text-center">
            <h2 className="text-base font-bold text-black">About</h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{about}</p>
          </div>
        ) : null}

        {showContact ? (
          <div className="space-y-1 text-center text-sm text-gray-700">
            {showPhoneLine ? (
              <a
                href={`tel:${primaryPhone.replace(/\s/g, "")}`}
                className="block hover:text-black"
              >
                {primaryPhone}
              </a>
            ) : null}
            {primaryEmail ? (
              <a
                href={`mailto:${primaryEmail}`}
                className="block break-all hover:text-black"
              >
                {primaryEmail}
              </a>
            ) : null}
          </div>
        ) : null}

        {socials.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {socials.map(({ key, href, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3d3d3d] text-white shadow-md transition hover:bg-[#2d2d2d]"
                aria-label={key}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        ) : null}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={saveContact}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3d3d3d] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#2d2d2d]"
          >
            <Save className="h-4 w-4" />
            Save Contact
          </button>
          <button
            type="button"
            onClick={share}
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[#3d3d3d] text-white shadow-md transition hover:bg-[#2d2d2d]"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showFooterCta ? (
        <p className="pb-4 text-center text-xs text-gray-400">
          BoldTap digital card
        </p>
      ) : null}
    </div>
  );
}
