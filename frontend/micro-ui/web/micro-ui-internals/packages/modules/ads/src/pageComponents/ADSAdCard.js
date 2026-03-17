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
          <img src={ad?.imageSrc || ad?.photoURL} alt={ad?.name || `Ad ${ad?.id}`} loading="lazy" className="ads-ad-card-image-img" />
        ) : (
          <div className="ads-card-noimage">{t("ADS_NO_IMAGE")}</div>
        )}
      </div>

      {/* Info Section */}
      <div className="ads-ad-card-info">
        <div className="ads-ad-card-info-row ads-ad-card-info-row--bold">
          <span>{t(ad.name)}</span>
          <span className="ads-ad-card-amount">₹{ad?.amount}</span>
        </div>
        <div className="ads-ad-card-info-row">
          <span>{t(ad?.locationCode)}</span>
          <span>Pole {ad.poleNo}</span>
        </div>
        <div className="ads-ad-card-info-row">
          <span>{t(ad?.adType)}</span>
          <span className="ads-ad-card-light">{ad?.light}</span>
        </div>
      </div>

      {/* Date Range Row */}
      <div className="ads-ad-card-date-row">
        <div className="ads-ad-card-date-field">
          <div className="ads-ad-card-date-label">{t("ADS_START_DATE_TIME")}</div>
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
        <div className="ads-ad-card-date-field">
          <div className="ads-ad-card-date-label">{t("ADS_END_DATE_TIME")}</div>
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
      <div className="ads-ad-card-actions">
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
            <span className="ads-ad-card-cart-icon">🛒</span>
            {t("ADS_IN_CART")}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdCard;
