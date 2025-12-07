import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@mseva/digit-ui-react-components";
import { areSlotsEqual } from "../utils";
import {
  modalOverlay,
  modalContent,
  modalHeader,
  modalTitle,
  modalCloseButton,
  modalFooter,
  primaryButton,
  lightButton,
  disabledButton,
  checkboxInput,
  disabledCheckbox,
  statusBadgeAvailable,
  statusBadgeBooked,
  statusBadgeInCart,
  modalTableContainer,
  modalLoadingMessage,
  tableCellStyle,
  headerTextWarning,
  headerTextInfo,
} from "../styles/commonStyles";

const AvailabilityModal = ({ ad, tenantId, onClose, onSelectSlot, dateRange, t, cartSlots, onRemoveSlot }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Build payload for API
  const slotPayload = useMemo(
    () => ({
      advertisementSlotSearchCriteria: [
        {
          advertisementId: ad?.id,
          bookingId: "",
          addType: ad?.adType,
          bookingStartDate: dateRange?.startDate,
          bookingEndDate: dateRange?.endDate,
          faceArea: `${ad?.adType}_${ad?.width}_X_${ad?.height}`,
          tenantId,
          location: ad?.locationCode,
          nightLight: ad?.light === "With Light" ? "true" : "false",
          isTimerRequired: false,
          amount: ad?.amount,
        },
      ],
    }),
    [ad, tenantId, dateRange]
  );

  // Fetch slots
  const { data: slotResults = {}, isLoading } = Digit.Hooks.ads.useADSSlotSearch({
    tenantId,
    type: true,
    data: slotPayload,
  });
  const slots = slotResults?.advertisementSlotAvailabiltityDetails || [];

  // Already in cart for this ad
  const existingForAd =
  cartSlots?.find(
    (item) =>
      item?.ad?.id === ad?.id &&
      item?.ad?.bookingStartDate === dateRange?.startDate &&
      item?.ad?.bookingEndDate === dateRange?.endDate
  )?.slots || [];


  // Check if a slot is in the user's cart
  const isSlotInCart = (slot) => {
    return existingForAd?.some((s) => s?.bookingDate === slot?.bookingDate);
  };

  // Slots that are either available OR already in user's cart
  const selectableSlots = slots?.filter((s) => s?.slotStaus === "AVAILABLE" || isSlotInCart(s));

  // All available slots for this ad/date range
  const allAvailableSlots = slots?.filter((s) => s?.slotStaus === "AVAILABLE");

  // Check if all slots are booked by OTHERS (not by this user)
  const allBookedByOthers = slots?.length > 0 && slots?.every((s) => s?.slotStaus !== "AVAILABLE" && !isSlotInCart(s));

  // True if every available slot is already in the cart
  const allInCart =
    allAvailableSlots?.length > 0 && allAvailableSlots?.every((slot) => existingForAd?.some((s) => s?.bookingDate === slot?.bookingDate));

  // Handle select all toggle
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      // Select all slots that are either available OR in cart
      setSelectedSlots(selectableSlots);
    } else {
      setSelectedSlots([]);
    }
  };
// Commit changes to parent
  const handleAddToCart = () => {
  if (selectedSlots?.length > 0) {
// Add or update slots
    onSelectSlot(selectedSlots, {
      ...ad,
      faceArea: `${ad?.adType}_${ad?.width}_X_${ad?.height}`,
      location: ad?.name,
      addType: ad?.adType,
      amount: ad?.amount,
      bookingDate: dateRange?.startDate,
      nightLight: ad?.light === "With Light",
      bookingStartDate: dateRange?.startDate,
      bookingEndDate: dateRange?.endDate,
    }, dateRange); // 👈 pass dateRange explicitly
  } else if (existingForAd?.length > 0) {
    onRemoveSlot(ad, dateRange); // 👈 pass dateRange explicitly
  }
    setSelectedSlots([]);
    setSelectAll(false);
    onClose();
};

  // When modal opens, seed selectAll from allInCart
  useEffect(() => {
    if (allInCart) {
      setSelectAll(true);
    }
  }, [allInCart]);

  const hasChanges = !areSlotsEqual(selectedSlots, existingForAd);

  useEffect(() => {
  if (ad?.id && existingForAd?.length > 0) {
    setSelectAll(true);
    setSelectedSlots(existingForAd);
  } else {
    setSelectAll(false);
    setSelectedSlots([]);
  }
}, [ad, dateRange]);


  // Table columns
  const columns = [
    {
      Header: () => (
        <input
          type="checkbox"
          checked={selectAll}
          disabled={allBookedByOthers}
          onChange={(e) => handleSelectAll(e.target.checked)}
          style={allBookedByOthers ? disabledCheckbox : checkboxInput}
        />
      ),
      accessor: "select",
      Cell: ({ row }) => {
        const slot = row?.original;
        const isInCart = isSlotInCart(slot);
        const isSelectable = slot?.slotStaus === "AVAILABLE" || isInCart;
        const isChecked = selectAll && isSelectable;
        return (
          <input
            type="checkbox"
            checked={isChecked}
            disabled={true}
            style={disabledCheckbox}
          />
        );
      },
    },
    { Header: t("ADS_DATE"), accessor: "bookingDate" },
    // { Header: t("ADS_LOCATION"), accessor: "location" },
    // { Header: t("ADS_FACE_AREA"), accessor: "faceArea" },
    { Header: t("ADS_LOCATION"), accessor: "location", Cell: ({ value }) => t(value || "N/A") },
    { Header: t("ADS_FACE_AREA"), accessor: "faceArea", Cell: ({ value }) => t(value?.replaceAll("_", " ") || "N/A") },

    { Header: t("ADS_TYPE"), accessor: "addType" },
    {
      Header: t("ADS_NIGHT_LIGHT"),
      accessor: (row) => (row.nightLight ? t("ADS_YES") : t("ADS_NO")),
    },
    {
      Header: t("ADS_STATUS"),
      accessor: "slotStaus",
      Cell: ({ row }) => {
        const slot = row?.original;
        const status = slot?.slotStaus;
        const isInCart = isSlotInCart(slot);
        const isAvailable = status === "AVAILABLE";
        
        // If slot is in cart, show as "IN CART" with blue badge
        if (isInCart) {
          return (
            <span style={statusBadgeInCart}>
              {t("ADS_IN_CART") || "IN CART"}
            </span>
          );
        }
        
        return (
          <span style={isAvailable ? statusBadgeAvailable : statusBadgeBooked}>
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        {/* Header */}
        <div style={modalHeader}>
          <h2 style={modalTitle}>
            {t("ADS_AVAILIBILITY_FOR")} {ad?.name}{" "}
            {allBookedByOthers && <span style={headerTextWarning}>{t("ADS_ALL_SLOTS_BOOKED")}</span>}
            {existingForAd?.length > 0 && !allBookedByOthers && <span style={headerTextInfo}>({existingForAd.length} in cart)</span>}
          </h2>
          <button
            onClick={onClose}
            style={modalCloseButton}
          >
            ✖
          </button>
        </div>

        {/* Table */}
        <div style={modalTableContainer}>
          {isLoading ? (
            <div style={modalLoadingMessage}>{t("ADS_LOADING_SLOTS")}</div>
          ) : slots?.length === 0 ? (
            <div style={modalLoadingMessage}>{t("ADS_NO_SLOTS_AVAILABLE")}</div>
          ) : (
            <Table
              t={t}
              data={slots}
              columns={columns}
              disableSort={true}
              isPaginationRequired={false}
              getCellProps={(cell) => ({
                style: tableCellStyle(cell.row.index % 2 === 0),
              })}
            />
          )}
        </div>

        {/* Footer */}
        <div style={modalFooter}>
          <button
            onClick={onClose}
            style={lightButton}
          >
            {t ? t("Cancel") : "Cancel"}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!hasChanges}
            style={hasChanges ? primaryButton : disabledButton}
          >
            🛒 {existingForAd?.length > 0 ? t("COMMON_REMOVE_LABEL") : t("ADS_ADD_TO_CART")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
