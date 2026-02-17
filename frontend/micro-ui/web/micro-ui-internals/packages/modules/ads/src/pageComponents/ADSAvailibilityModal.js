import React, { useMemo, useState, useEffect } from "react";
import { Table } from "@mseva/digit-ui-react-components";
import { areSlotsEqual } from "../utils";

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


  // Header note: all booked
  const allBooked = slots?.length > 0 && slots?.every((s) => s?.slotStaus !== "AVAILABLE");
  // Find slots already in cart for this ad

  // All available slots for this ad/date range
  const allAvailableSlots = slots?.filter((s) => s?.slotStaus === "AVAILABLE");

  // True if every available slot is already in the cart
  const allInCart =
    allAvailableSlots?.length > 0 && allAvailableSlots?.every((slot) => existingForAd?.some((s) => s?.bookingDate === slot?.bookingDate));

  // Handle select all toggle
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      const allAvailable = slots?.filter((s) => s?.slotStaus === "AVAILABLE");
      setSelectedSlots(allAvailable);
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
          disabled={allBooked}
          // checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className={`ads-checkbox ${allBooked ? "ads-checkbox--disabled" : "ads-checkbox--active"}`}
        />
      ),
      accessor: "select",
      Cell: ({ row }) => {
        const slot = row?.original;
        // const isChecked = allInCart || (selectAll && slot?.slotStaus === "AVAILABLE");
        const isChecked = selectAll && slot?.slotStaus === "AVAILABLE";
        return (
          <input
            type="checkbox"
            checked={isChecked}
            disabled={true} // always disabled
            className="ads-checkbox ads-checkbox--disabled"
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
        const status = row?.original?.slotStaus;
        const isAvailable = status === "AVAILABLE";
        return (
          <span
            className={`ads-status ${
      isAvailable ? "ads-status--available" : "ads-status--unavailable"
    }`}
          >
            {status}
          </span>
        );
      },
    },
  ];

  return (
    <div className="ads-cart-overlay">
      <div className="ads-cart-modal">
        {/* Header */}
        <div className="ads-cart-header">
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#333" }}>
            {t("ADS_AVAILIBILITY_FOR")} {ad?.name} {allBooked && <span className="ads-header-note">{t("ADS_ALL_SLOTS_BOOKED")}</span>}
          </h2>
          <button onClick={onClose} className="ads-cart-close">
            ✖
          </button>
        </div>

        {/* Table */}
        <div className="ads-cart-table-wrapper">
          {isLoading ? (
            <div className="ads-cart-table-message ">{t("ADS_LOADING_SLOTS")}</div>
          ) : slots?.length === 0 ? (
            <div className="ads-cart-table-message ">{t("ADS_NO_SLOTS_AVAILABLE")}</div>
          ) : (
            <Table
              t={t}
              data={slots}
              columns={columns}
              disableSort={true}
              isPaginationRequired={false}
              getCellProps={(cell) => ({ className: "ads-cart-table-cell" })}
              getRowProps={(row) => ({ className: row.index % 2 === 0 ? "ads-table-row--even" : "ads-table-row--odd" })}
            />
          )}
        </div>

        {/* Footer */}
        <div
          className="ads-modal-footer"
        >
          <button
            onClick={onClose}
            className="ads-btn-cancel"
          >
            {t ? t("Cancel") : "Cancel"}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!hasChanges}
            className={`ads-btn-cart ${!hasChanges ? "ads-btn-cart--disabled" : ""}`}
          >
            🛒 {existingForAd?.length > 0 ? t("COMMON_REMOVE_LABEL") : t("ADS_ADD_TO_CART")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
