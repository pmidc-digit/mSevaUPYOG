import React from "react";
import { Controller } from "react-hook-form";
import { getMinDateForType } from "../utils";
import {
  card,
  dateInput,
  cardLabel,
  flexRow,
  flexColumn,
  primaryButton,
  successButton,
  cardImageContainer,
  cardImage,
  cardImagePlaceholder,
  cardInfoSection,
  cardInfoRow,
  cardInfoRowBold,
  textDark,
  textSuccess,
  blackText,
} from "../styles/commonStyles";

const AdCard = ({
  ad,
  idx,
  control,
  watch,
  t,
  onViewAvailability = () => {},
  cartSlots = [], // 👈 pass this from parent
  openCart,
  scheduleType
}) => {
  // const todayISO = new Date().toISOString().split("T")[0];
  const startDateVal = watch(`ads.${idx}.startDate`) || "";
  const minDate = getMinDateForType(scheduleType);
  // check if this ad is already in cart
  const isAdded = cartSlots?.some((item) => item?.ad?.id === ad?.id && item?.slots?.length > 0);
  

  return (
    <div style={card}>
      {/* Image */}
      <div style={cardImageContainer}>
        {ad.imageSrc || ad.photoURL ? (
          <img
            src={ad?.imageSrc || ad?.photoURL}
            alt={ad?.name || `Ad ${ad?.id}`}
            loading="lazy"
            style={cardImage}
          />
        ) : (
          <div style={cardImagePlaceholder}>
            {t("ADS_NO_IMAGE")}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={cardInfoSection}>
        <div style={cardInfoRowBold}>
          <span>{ad.name}</span>
          <span style={textDark}>₹{ad?.amount}</span>
        </div>
        <div style={cardInfoRow}>
          <span>{ad?.locationCode}</span>
          <span>Pole {ad.poleNo}</span>
        </div>
        <div style={cardInfoRow}>
          <span>{ad?.adType}</span>
          <span style={textSuccess}>{ad?.light}</span>
        </div>
      </div>

      {/* Date Inputs Row */}
      <div style={flexRow}>
        {/* Start Date */}
        <div style={flexColumn}>
          <div style={cardLabel}>{t("ADS_START_DATE_TIME")}</div>
          <Controller
            control={control}
            name={`ads.${idx}.startDate`}
            render={(props) => (
              <input
                type="date"
                min={minDate}
                value={props.value || ""}
                onChange={(e) => props.onChange(e.target.value)}
                style={dateInput}
              />
            )}
          />
        </div>

        {/* End Date */}
        <div style={flexColumn}>
          <div style={cardLabel}>{t("ADS_END_DATE_TIME")}</div>
          <Controller
            control={control}
            name={`ads.${idx}.endDate`}
            render={(props) => (
              <input
                type="date"
                min={startDateVal || minDate}
                value={props.value || ""}
                onChange={(e) => props.onChange(e.target.value)}
                style={dateInput}
              />
            )}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={flexRow}>
        <button
          type="button"
          onClick={() =>
            onViewAvailability(ad, {
              startDate: watch(`ads.${idx}.startDate`),
              endDate: watch(`ads.${idx}.endDate`),
            })
          }
          style={{ ...primaryButton, flex: 1 }}
        >
           {t("ADS_VIEW_AVAILABILITY")}👁️
        </button>

        {isAdded && (
          <button
            type="button"
            onClick={openCart}
            style={{
              ...successButton,
              width: 110,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={blackText}>🛒</span>{t("ADS_IN_CART")}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdCard;



