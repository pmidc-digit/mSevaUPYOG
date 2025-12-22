import React, { useState } from "react";
import { Table } from "@mseva/digit-ui-react-components";

const CartModal = ({ cartSlots, onClose, onRemoveSlot, t }) => {
  // Track which ads are expanded
  // Build a unique key for each cart entry
  const getKey = (ad) => `${ad?.id}_${ad?.bookingStartDate}_${ad?.bookingEndDate}`;

  // Default expanded: all open
  const [expanded, setExpanded] = useState(() => cartSlots?.map((item) => getKey(item.ad)));

  const toggleExpand = (key) => {
    setExpanded((prev) => (prev?.includes(key) ? prev?.filter((id) => id !== key) : [...prev, key]));
  };

  // Columns no longer include "Remove"
  const makeColumns = (ad) => [
    { Header: t("ADS_DATE"), accessor: "bookingDate" },
    // { Header: t("ADS_LOCATION"), accessor: "location" },
    // { Header: t("ADS_FACE_AREA"), accessor: "faceArea" },
    { Header: t("ADS_LOCATION"), accessor: "location", Cell: ({ value }) => t(value || "N/A") },
    { Header: t("ADS_FACE_AREA"), accessor: "faceArea", Cell: ({ value }) => t(value?.replaceAll("_", " ") || "N/A") },
    { Header: t("ADS_TYPE"), accessor: "addType" },
    {
      Header: t("ADS_NIGHT_LIGHT"),
      accessor: (row) => (row?.nightLight ? t("ADS_YES") : t("ADS_NO")),
    },
    {
      Header: t("ADS_STATUS"),
      accessor: "slotStaus",
      Cell: ({ row }) => {
        const status = row?.original?.slotStaus;
        const isAvailable = status === "AVAILABLE";
        return <span className={`ads-status ${isAvailable ? "ads-status--available" : "ads-status--unavailable"}`}>{status}</span>;
      },
    },
  ];

  return (
    <div className="ads-cart-overlay">
      <div className="ads-cart-modal">
        {/* Header */}
        <div className="ads-cart-header">
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#333" }}>{t("ADS_YOUR_CART")}</h2>
          <button onClick={onClose} className="ads-cart-close">
            ✖
          </button>
        </div>

        {/* Cart grouped by Ad */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {cartSlots?.length === 0 ? (
            <p style={{ padding: "12px", color: "#666" }}>{t("ADS_NO_ITEMS_IN_CART")}</p>
          ) : (
            cartSlots?.map((item, idx) => {
              // const isOpen = expanded?.includes(item.ad.id);
              const key = getKey(item?.ad);
              const isOpen = expanded?.includes(key);
              return (
                <div key={key} className="ads-cart-item">
                  {/* Ad Header (clickable + remove button) */}
                  <div className="ads-cart-item-header">
                    <div onClick={() => toggleExpand(key)} style={{ cursor: "pointer", flex: 1 }}>
                      {item?.ad?.name}
                      {/*  Apply 9% tax + 9% service (18%) on each slot amount, then multiply by number of slots */}
                      {item?.ad?.amount ? ` — ₹${(item?.ad?.amount * 1.18 * item?.slots?.length).toFixed(2)}` : ""}
                      <span style={{ fontSize: "18px", marginLeft: "8px" }}>{isOpen ? "▾" : "▸"}</span>
                    </div>
                    <button
                      onClick={() =>
                        onRemoveSlot(item?.ad, {
                          startDate: item?.ad?.bookingStartDate,
                          endDate: item?.ad?.bookingEndDate,
                        })
                      }
                      className="ads-cart-remove"
                    >
                      {t("ADS_REMOVE")}
                    </button>
                  </div>

                  {/* Slots Table (collapsible) */}
                  {isOpen && (
                    <div className="ads-cart-table">
                      <Table
                        t={t}
                        data={item?.slots}
                        columns={makeColumns(item?.ad)}
                        disableSort={true}
                        isPaginationRequired={false}
                        getCellProps={(cell) => ({
                          className: "ads-cart-table-cell",
                        })}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
