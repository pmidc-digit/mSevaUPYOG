import React, { useState } from "react";
import { Table } from "@mseva/digit-ui-react-components";
import {
  modalOverlay,
  modalContent,
  modalHeader,
  modalTitle,
  modalCloseButton,
  noItemsMessage,
  cartItemContainer,
  cartAdHeader,
  removeButton,
  tableContainer,
  tableCellNowrap,
  statusBadgeAvailable,
  statusBadgeBooked,
  cartListContainer,
  cartAdTitle,
  expandIcon,
} from "../styles/commonStyles";

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
        return (
          <span
            style={isAvailable ? statusBadgeAvailable : statusBadgeBooked}
          >
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
          <h2 style={modalTitle}>{t("ADS_YOUR_CART")}</h2>
          <button
            onClick={onClose}
            style={modalCloseButton}
          >
            ✖
          </button>
        </div>

        {/* Cart grouped by Ad */}
        <div style={cartListContainer}>
          {cartSlots?.length === 0 ? (
            <p style={noItemsMessage}>{t("ADS_NO_ITEMS_IN_CART")}</p>
          ) : (
            cartSlots?.map((item, idx) => {
              // const isOpen = expanded?.includes(item.ad.id);
              const key = getKey(item?.ad);
              const isOpen = expanded?.includes(key);
              return (
                <div
                  key={key}
                  style={cartItemContainer}
                >
                  {/* Ad Header (clickable + remove button) */}
                  <div style={cartAdHeader}>
                    <div onClick={() => toggleExpand(key)} style={cartAdTitle}>
                      {item?.ad?.name}
                      {/*  Apply 9% tax + 9% service (18%) on each slot amount, then multiply by number of slots */}
                      {item?.ad?.amount ? ` — ₹${(item?.ad?.amount * 1.18 * item?.slots?.length).toFixed(2)}` : ""}
                      <span style={expandIcon}>{isOpen ? "▾" : "▸"}</span>
                    </div>
                    <button
                      onClick={() =>
                        onRemoveSlot(item?.ad, {
                          startDate: item?.ad?.bookingStartDate,
                          endDate: item?.ad?.bookingEndDate,
                        })
                      }
                      style={removeButton}
                    >
                      {t("ADS_REMOVE")}
                    </button>
                  </div>

                  {/* Slots Table (collapsible) */}
                  {isOpen && (
                    <div style={tableContainer}>
                      <Table
                        t={t}
                        data={item?.slots}
                        columns={makeColumns(item?.ad)}
                        disableSort={true}
                        isPaginationRequired={false}
                        getCellProps={(cell) => ({
                          style: tableCellNowrap,
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
