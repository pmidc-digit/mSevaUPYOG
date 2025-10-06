import React from "react";
import { Controller } from "react-hook-form";

const AdCard = ({
  ad,
  idx,
  control,
  watch,
  t,
  onViewAvailability = () => {},
  cartSlots = [], // 👈 pass this from parent
  openCart,
}) => {
  const todayISO = new Date().toISOString().split("T")[0];
  const startDateVal = watch(`ads.${idx}.startDate`) || "";

  // check if this ad is already in cart
  const isAdded = cartSlots.some((item) => item.ad.id === ad.id && item.slots.length > 0);

  return (
    <div
      style={{
        width: 280,
        borderRadius: 8,
        padding: 9,
        background: "#fff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Image */}
      <div
        style={{
          width: "100%",
          height: 120,
          borderRadius: 8,
          overflow: "hidden",
          background: "#f5f5f5",
        }}
      >
        {ad.imageSrc || ad.photoURL ? (
          <img
            src={ad.imageSrc || ad.photoURL}
            alt={ad.name || `Ad ${ad.id}`}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
            }}
          >
            {t("ADS_NO_IMAGE")}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#444" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span>{ad.name}</span>
          <span style={{ color: "#222" }}>₹{ad.amount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{ad.locationCode}</span>
          <span>Pole {ad.poleNo}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{ad.adType}</span>
          <span style={{ color: "red", fontWeight: 500 }}>{ad.light}</span>
        </div>
      </div>

      {/* Start Date/Time */}
      <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{t("ADS_START_DATE_TIME")}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <Controller
          control={control}
          name={`ads.${idx}.startDate`}
          render={(props) => (
            <input
              type="date"
              min={todayISO}
              value={props.value || ""}
              onChange={(e) => props.onChange(e.target.value)}
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={`ads.${idx}.startTime`}
          render={(props) => (
            <input
              type="time"
              value={props.value || ""}
              onChange={(e) => props.onChange(e.target.value)}
              style={{
                width: 110,
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          )}
        />
      </div>

      {/* End Date/Time */}
      <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{t("ADS_END_DATE_TIME")}</div>
      <div style={{ display: "flex", gap: 8 }}>
        <Controller
          control={control}
          name={`ads.${idx}.endDate`}
          render={(props) => (
            <input
              type="date"
              min={startDateVal || todayISO}
              value={props.value || ""}
              onChange={(e) => props.onChange(e.target.value)}
              style={{
                flex: 1,
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          )}
        />
        <Controller
          control={control}
          name={`ads.${idx}.endTime`}
          render={(props) => (
            <input
              type="time"
              value={props.value || ""}
              onChange={(e) => props.onChange(e.target.value)}
              style={{
                width: 110,
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          )}
        />
      </div>

      {/* Actions */}
      {/* Action */}
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button
          type="button"
          onClick={() =>
            onViewAvailability(ad, {
              startDate: watch(`ads.${idx}.startDate`),
              endDate: watch(`ads.${idx}.endDate`),
              startTime: watch(`ads.${idx}.startTime`),
              endTime: watch(`ads.${idx}.endTime`),
            })
          }
          style={{
            flex: 1, // 👈 stretches like startDate input
            padding: "6px 12px",
            borderRadius: 6,
            background: "#2947a3",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
           {t("ADS_VIEW_AVAILABIITY")}👁️
        </button>

        {isAdded && (
          <button
            type="button"
            onClick={openCart}
            style={{
              width: 110, // 👈 fixed width like startTime input
              padding: "6px 12px",
              borderRadius: 6,
              background: "#28a745",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor:"pointer"
            }}
          >
            <span style={{color:"black"}}>🛒</span>{t("ADS_IN_CART")}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdCard;



