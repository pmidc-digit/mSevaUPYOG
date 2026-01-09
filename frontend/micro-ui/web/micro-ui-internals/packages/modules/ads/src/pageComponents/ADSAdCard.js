import React from "react";
import { Controller } from "react-hook-form";
import { getMinDateForType } from "../utils";

const AdCard = ({
  ad,
  idx,
  control,
  watch,
  t,
  onViewAvailability = () => {},
  cartSlots = [], // 👈 pass this from parent
  openCart,
  scheduleType,
}) => {
  // const todayISO = new Date().toISOString().split("T")[0];
  const startDateVal = watch(`ads.${idx}.startDate`) || "";
  const minDate = getMinDateForType(scheduleType);
  // check if this ad is already in cart
  const isAdded = cartSlots?.some((item) => item?.ad?.id === ad?.id && item?.slots?.length > 0);

  return (
    <div className="ads-card">
      {/* Image */}
      <div className="ads-card-image">
        {ad.imageSrc || ad.photoURL ? (
          <img
            src={ad?.imageSrc || ad?.photoURL}
            alt={ad?.name || `Ad ${ad?.id}`}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="ads-card-noimage">{t("ADS_NO_IMAGE")}</div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, color: "#444" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span>{t(ad.name)}</span>
          <span style={{ color: "#222" }}>₹{ad?.amount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{t(ad?.locationCode)}</span>
          <span>Pole {ad.poleNo}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{t(ad?.adType)}</span>
          <span style={{ color: "green", fontWeight: 600 }}>{ad?.light}</span>
        </div>
      </div>

      {/* Date Range Row */}
      <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#666" }}>{t("ADS_START_DATE_TIME")}</div>
          <Controller
            control={control}
            name={`ads.${idx}.startDate`}
            render={(props) => (
              <input
                type="date"
                min={minDate}
                value={props.value || ""}
                onChange={(e) => props.onChange(e.target.value)}
                className="ads-card-input"
              />
            )}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#666" }}>{t("ADS_END_DATE_TIME")}</div>
          <Controller
            control={control}
            name={`ads.${idx}.endDate`}
            render={(props) => (
              <input
                type="date"
                min={startDateVal || minDate}
                value={props.value || ""}
                onChange={(e) => props.onChange(e.target.value)}
                className="ads-card-input"
              />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button
          type="button"
          onClick={() =>
            onViewAvailability(ad, {
              startDate: watch(`ads.${idx}.startDate`),
              endDate: watch(`ads.${idx}.endDate`),
            })
          }
          className="ads-btn-primary"
        >
          {t("ADS_VIEW_AVAILABILITY")}👁️
        </button>

        {isAdded && (
          <button type="button" onClick={openCart} className="ads-btn-success">
            <span style={{ color: "black" }}>🛒</span>
            {t("ADS_IN_CART")}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdCard;
