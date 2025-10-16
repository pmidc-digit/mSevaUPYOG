

import React, { useEffect, useState } from "react";

const ReservationTimer = ({ t, createTime, onExpire }) => {
  // expiry = createTime + 30 minutes
  const expiry = createTime ? new Date(createTime).getTime() + 30 * 60 * 1000 : null;

  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiry) return;

    const update = () => {
      const diff = expiry - Date.now();
      setRemaining(diff);

      // 🔔 Notify parent once when expired
      if (diff <= 0 && typeof onExpire === "function") {
        onExpire(true);
      }
    };

    update(); // run immediately once
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiry, onExpire]);

  // 🛡️ Guard 1: no createTime supplied
  if (!expiry) return null;

  // 🛡️ Guard 2: expired
  if (remaining !== null && remaining <= 0) {
    return (
      <span
        style={{
          fontSize: "16px",
          color: "red",
          fontWeight: 800,
        }}
      >
        {t("ADS_SLOTS_EXPIRED")}
      </span>
    );
  }

  // 🛡️ Guard 3: still counting down
  if (remaining === null) return null;

  // Format countdown
  const minutes = Math?.floor(remaining / 60000);
  const seconds = Math?.floor((remaining % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  // Highlight if < 1 min left
  const isCritical = remaining <= 60 * 1000;

  return (
    <span
      style={{
        color: isCritical ? "red" : "#2947a3",
        fontWeight: 600,
        fontSize: "14px",
        marginLeft: "8px",
      }}
    >
      {t("ADS_PAYMENT_TIMER")}
      <span
        style={{
          fontSize: "16px",
          fontWeight: 900,
          color: "red",
          marginLeft: "4px",
        }}
      >
        {minutes}:{seconds}
      </span>
    </span>
  );
};

export default ReservationTimer;
