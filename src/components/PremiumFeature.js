import React, { useState, useEffect } from "react";
import PaymentService from "../services/PaymentService";
import PaywallView from "./PaywallView";

/**
 * Paywall Controller - Manages premium feature access
 * Usage: Wrap content that requires premium subscription
 */
export function PremiumFeature({ children, requiredFeature = "premium", fallback }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      const isSubscribed = await PaymentService.checkSubscriptionStatus();
      setHasAccess(isSubscribed);
      setLoading(false);
    } catch (err) {
      console.error("Error checking subscription:", err);
      setLoading(false);
    }
  };

  const handleSubscribeSuccess = async (purchase) => {
    setHasAccess(true);
    setShowPaywall(false);
    // Optional: Show success toast
  };

  if (loading) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>Loading...</div>;
  }

  if (!hasAccess) {
    if (showPaywall) {
      return (
        <PaywallView
          onSubscribeSuccess={handleSubscribeSuccess}
          onClose={() => setShowPaywall(false)}
        />
      );
    }

    return (
      fallback || (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔒</div>
          <p>This feature requires Premium</p>
          <button onClick={() => setShowPaywall(true)}>Upgrade Now</button>
        </div>
      )
    );
  }

  return children;
}

/**
 * Premium Badge - Show next to restricted features
 */
export function PremiumBadge() {
  return (
    <span
      style={{
        display: "inline-block",
        background: "linear-gradient(135deg, #FFE66D, #FDCB6E)",
        color: "#333",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: "bold",
        marginLeft: "4px",
      }}
    >
      PRO
    </span>
  );
}

/**
 * Upgrade Prompt - Show in-app prompts
 */
export function UpgradePrompt({ onUpgrade }) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #FF6B6B22, #FD79A822)",
        border: "1px solid #FF6B6B44",
        borderRadius: 14,
        padding: 14,
        marginBottom: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontFamily: "'Fredoka One',cursive", color: "#FF6B6B", fontSize: 14 }}>
          ✨ Unlock All Features
        </div>
        <div style={{ fontSize: 12, color: "#ffffffcc", marginTop: 2 }}>
          Go Premium for unlimited access
        </div>
      </div>
      <button
        onClick={onUpgrade}
        style={{
          background: "#FF6B6B",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "8px 14px",
          fontFamily: "'Fredoka One',cursive",
          cursor: "pointer",
          fontSize: 12,
        }}
      >
        Upgrade
      </button>
    </div>
  );
}

/**
 * Feature Limit Checker - Limit free tier features
 */
export const FEATURE_LIMITS = {
  FREE: {
    gamesPerDay: 2,
    quizzesPerDay: 3,
    notesPerSubject: 1,
    audiobooks: 0, // disabled
    maxReelsPerSession: 10,
  },
  PREMIUM: {
    gamesPerDay: Infinity,
    quizzesPerDay: Infinity,
    notesPerSubject: Infinity,
    audiobooks: Infinity,
    maxReelsPerSession: Infinity,
  },
};

export function checkFeatureLimit(feature, hasSubscription) {
  const limits = hasSubscription ? FEATURE_LIMITS.PREMIUM : FEATURE_LIMITS.FREE;
  return limits[feature] || Infinity;
}
