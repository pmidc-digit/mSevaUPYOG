// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// const ReservationTimer = ({ t }) => {
//   const expiry = useSelector((state) => state.ads.ADSNewApplicationFormReducer.formData.reservationExpiry);
//   const [remaining, setRemaining] = useState(expiry ? expiry - Date.now() : 0);

//   useEffect(() => {
//     if (!expiry) return;
//     const interval = setInterval(() => {
//       setRemaining(expiry - Date.now());
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [expiry]);

//   // 🛡️ Guard 1: no expiry set
//   if (!expiry) return null;

//   // 🛡️ Guard 2: expired
//   if (remaining <= 0) {
//     return (
//       <span
//         style={{
//           fontSize: "16px",
//           color: "red",
//           fontWeight: 800,
//         }}
//       >
//         {t("ADS_SLOTS_EXPIRED")}
//       </span>
//     );
//   }

//   // Format countdown
//   const minutes = Math.floor(remaining / 60000);
//   const seconds = Math.floor((remaining % 60000) / 1000)
//     .toString()
//     .padStart(2, "0");

//   // 🛡️ Guard 3: highlight if < 1 min left
//   const isCritical = remaining <= 60 * 1000;

//   return (
//     <span
//       style={{
//         color: isCritical ? "red" : "#2947a3",
//         fontWeight: 600,
//         fontSize: "14px",
//         marginLeft: "8px",
//       }}
//     >
//       {t("ADS_PAYMENT_TIMER")}
//       <span
//         style={{
//           fontSize: "16px",
//           fontWeight: 900,
//           color: "red",
//           marginLeft: "4px",
//         }}
//       >
//         {minutes}:{seconds}
//       </span>
//     </span>
//   );
// };

// export default ReservationTimer;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ReservationTimer = ({ t }) => {
  const expiry = useSelector(
    (state) => state?.ads?.ADSNewApplicationFormReducer?.formData?.reservationExpiry
  );

  console.log('expiry', expiry)
  // Start as null so we don’t render “expired” immediately
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiry) return;

    const update = () => {
      const diff = expiry - Date.now();
      setRemaining(diff);
    };

    update(); // run immediately once
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiry]);

  // 🛡️ Guard 1: no expiry set
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
