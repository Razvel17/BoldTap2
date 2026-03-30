import { Star, Gift, Trash2 } from "lucide-react";
import type { LoyaltyCardData } from "@/contexts/lib/loyaltyCard";

interface LoyaltyCardProps {
  card: LoyaltyCardData | null | undefined;
  /** When set (e.g. customer view), overrides card.stamps.length for display */
  stampCount?: number;
  interactive?: boolean;
  onAddStamp?: () => void;
  onRemoveStamp?: (stampId: string) => void;
  className?: string;
}

export default function LoyaltyCard({
  card,
  stampCount: stampCountOverride,
  interactive = false,
  onAddStamp,
  onRemoveStamp,
  className = "",
}: LoyaltyCardProps) {
  if (!card) {
    return (
      <div className="text-center text-gray-500 py-8">
        No loyalty card found
      </div>
    );
  }

  const filled =
    stampCountOverride !== undefined
      ? stampCountOverride
      : card.stamps.length;
  const progress = Math.min(filled, card.stampGoal);
  const isComplete = progress >= card.stampGoal;

  return (
    <div
      className={`mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-2xl ${className}`}
    >
      {/* Header */}
      <div className="relative bg-black/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white text-lg font-bold">{card.businessName}</h3>
            <p className="text-white/80 text-sm">{card.cardName}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <Gift className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="px-6 py-3 bg-black/10">
        <p className="text-white/90 text-sm text-center">{card.description}</p>
      </div>

      {/* Stamps Grid */}
      <div className="px-6 py-8">
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: card.stampGoal }).map((_, index) => {
            const hasStamp = index < filled;
            const isNextStamp =
              index === filled && interactive && !isComplete && stampCountOverride === undefined;

            return (
              <div
                key={index}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-300 ${
                  hasStamp
                    ? "bg-yellow-400 shadow-lg shadow-yellow-400/50 scale-105"
                    : "bg-white/20 backdrop-blur-sm"
                } ${
                  isNextStamp
                    ? "cursor-pointer hover:bg-white/40 hover:scale-110 ring-2 ring-white/50"
                    : ""
                }`}
                onClick={() => {
                  if (isNextStamp && onAddStamp) {
                    onAddStamp();
                  }
                }}
              >
                {hasStamp ? (
                  <div className="relative">
                    <Star className="h-6 w-6 text-white fill-white" />
                    {interactive &&
                      onRemoveStamp &&
                      stampCountOverride === undefined &&
                      card.stamps[index] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveStamp(card.stamps[index].id);
                        }}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                        type="button"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-white/40 font-bold text-lg">{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="mt-4 text-center">
          <p className="text-white font-semibold">
            {progress} / {card.stampGoal} stamps
          </p>
          {isComplete && (
            <p className="text-yellow-300 text-sm font-bold mt-1 animate-pulse">
              Reward Unlocked!
            </p>
          )}
        </div>
      </div>

      {/* Reward Section */}
      <div className="px-6 pb-6">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="h-5 w-5 text-white" />
            <h4 className="text-white font-bold">{card.rewardTitle}</h4>
          </div>
          <p className="text-white/80 text-sm">{card.rewardDescription}</p>
        </div>
      </div>

      {/* Add Stamp Button (for card owner) */}
      {interactive && onAddStamp && !isComplete && stampCountOverride === undefined && (
        <div className="px-6 pb-6">
          <button
            type="button"
            onClick={onAddStamp}
            className="w-full py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-white/90 transition-colors shadow-lg"
          >
            Add Stamp
          </button>
        </div>
      )}
    </div>
  );
}
