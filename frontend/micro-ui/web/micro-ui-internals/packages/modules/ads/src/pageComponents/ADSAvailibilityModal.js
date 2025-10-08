import React, { useMemo, useState } from "react";
import { Table } from "@mseva/digit-ui-react-components";

const AvailabilityModal = ({ ad, tenantId, onClose, onSelectSlot, dateRange, t, cartSlots }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Build payload for API
  const slotPayload = useMemo(
    () => ({
      advertisementSlotSearchCriteria: [
        {
          advertisementId: ad?.id,
          bookingId: "",
          addType: ad.adType,
          bookingStartDate: dateRange?.startDate,
          bookingEndDate: dateRange?.endDate,
          faceArea: `${ad?.adType}_${ad?.width}_X_${ad?.height}`,
          tenantId,
          location: ad.locationCode,
          nightLight: ad?.light === "With Light" ? "true" : "false",
          isTimerRequired: false,
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
  const existingForAd = cartSlots.find((item) => item.ad.id === ad.id)?.slots || [];

  // Handle checkbox toggle
  const handleCheckboxChange = (slot, checked) => {
    if (checked) {
      // add to local selection
      setSelectedSlots((prev) => [
        ...prev.filter((s) => s.bookingDate !== slot.bookingDate), // remove any _remove
        slot,
      ]);
    } else {
      // mark as removal
      setSelectedSlots((prev) => [...prev.filter((s) => s.bookingDate !== slot.bookingDate), { ...slot, _remove: true }]);
    }
  };

  // Commit changes to parent
  const handleAddToCart = () => {
    if (selectedSlots.length > 0) {
      onSelectSlot(selectedSlots, {
        ...ad,
        faceArea: `${ad?.adType}_${ad?.width}_X_${ad?.height}`,
        location: ad?.name,
        addType: ad?.adType,
        bookingDate: dateRange?.startDate,
        nightLight: ad?.light === "With Light" ? true : false,
        bookingStartDate: dateRange?.startDate,
        bookingEndDate: dateRange?.endDate,
      });
      setSelectedSlots([]);
      onClose();
    }
  };

  // Table columns
  const columns = [
    {
      Header: t("ADS_SELECT"),
      accessor: "select",
      Cell: ({ row }) => {
        const slot = row.original;
        const isInCart = existingForAd.some((s) => s.bookingDate === slot.bookingDate);
        const isChecked =
          (isInCart && !selectedSlots.some((s) => s.bookingDate === slot.bookingDate && s._remove)) ||
          selectedSlots.some((s) => s.bookingDate === slot.bookingDate && !s._remove);

        return (
          <input
            type="checkbox"
            checked={isChecked}
            disabled={slot.slotStaus !== "AVAILABLE"}
            onChange={(e) => handleCheckboxChange(slot, e.target.checked)}
            style={{
              cursor: slot.slotStaus === "AVAILABLE" ? "pointer" : "not-allowed",
              width: "18px",
              height: "18px",
              accentColor: "#0b74de",
            }}
          />
        );
      },
    },
    { Header: t("ADS_DATE"), accessor: "bookingDate" },
    { Header: t("ADS_LOCATION"), accessor: "location" },
    { Header: t("ADS_FACE_AREA"), accessor: "faceArea" },
    { Header: t("ADS_TYPE"), accessor: "addType" },
    {
      Header: t("ADS_NIGHT_LIGHT"),
      accessor: (row) => (row.nightLight ? t("ADS_YES") : t("ADS_NO")),
    },
    {
      Header: t("ADS_STATUS"),
      accessor: "slotStaus",
      Cell: ({ row }) => {
        const status = row.original.slotStaus;
        const isAvailable = status === "AVAILABLE";
        return (
          <span
            style={{
              display: "inline-block",
              padding: "5px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: 600,
              color: isAvailable ? "#155724" : "#721c24",
              backgroundColor: isAvailable ? "#d4edda" : "#f8d7da",
              border: `1px solid ${isAvailable ? "#c3e6cb" : "#f5c6cb"}`,
              textTransform: "capitalize",
            }}
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Header note: all booked
  const allBooked = slots.length > 0 && slots.every((s) => s.slotStaus !== "AVAILABLE");

  return (
    <div
      style={{
        position: "fixed",
        top: "70px", // below navbar
        left: 0,
        width: "100vw",
        height: "calc(100vh - 70px)",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: "1100px",
          height: "70vh",
          background: "#fff",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            borderBottom: "1px solid #eee",
            paddingBottom: "8px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#333" }}>
            {t("ADS_AVAILIBILITY_FOR")} {ad?.name}{" "}
            {allBooked && <span style={{ color: "#c62828", fontSize: "14px", marginLeft: "8px" }}>{t("ADS_ALL_SLOTS_BOOKED")}</span>}
          </h2>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "22px",
              cursor: "pointer",
              color: "#666",
            }}
          >
            ✖
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          {isLoading ? (
            <div style={{ fontSize: "24px", color: "#555", textAlign: "center" }}>{t("ADS_LOADING_SLOTS")}</div>
          ) : slots.length === 0 ? (
            <div style={{ fontSize: "24px", color: "#555", textAlign: "center" }}>{t("ADS_NO_SLOTS_AVAILABLE")}</div>
          ) : (
            <Table
              t={t}
              data={slots}
              columns={columns}
              disableSort={true}
              isPaginationRequired={false}
              getCellProps={(cell) => ({
                style: {
                  padding: "12px 14px",
                  fontSize: "14px",
                  borderBottom: "1px solid #f0f0f0",
                  textAlign: "left",
                  backgroundColor: cell.row.index % 2 === 0 ? "#fafafa" : "#fff",
                },
              })}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f5f5f5",
              cursor: "pointer",
            }}
          >
            {t ? t("Cancel") : "Cancel"}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={selectedSlots.length === 0}
            style={{
              padding: "10px 18px",
              borderRadius: "6px",
              border: "none",
              background: selectedSlots.length > 0 ? "#2947a3" : "#ccc",
              color: "#fff",
              fontWeight: 600,
              cursor: selectedSlots.length > 0 ? "pointer" : "not-allowed",
              transition: "background 0.2s",
            }}
          >
            🛒 {existingForAd?.length > 0 ? t("Update Cart") : t("Add To Cart")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;
