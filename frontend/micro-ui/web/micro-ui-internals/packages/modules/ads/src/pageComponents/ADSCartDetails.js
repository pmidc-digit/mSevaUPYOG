import React, { useState } from "react";
import { Table } from "@mseva/digit-ui-react-components";

const ADSCartDetails = ({ cartDetails, t }) => {
  // Build a unique key for each cart entry
  const getKey = (ad) => `${ad?.id}_${ad?.bookingStartDate}_${ad?.bookingEndDate}`;

  // Default expanded: all open
  const [expanded, setExpanded] = useState(() => cartDetails?.map((item) => getKey(item?.ad)));

  const toggleExpand = (key) => {
    setExpanded((prev) => (prev?.includes(key) ? prev?.filter((id) => id !== key) : [...prev, key]));
  };

  const makeColumns = () => [
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
  ];

  return (
    <div className="ads-cart-details">
      {cartDetails?.length === 0 ? (
        <p className="ads-cart-empty">{t("ADS_NO_ADVERTISMENT_DETAILS")}</p>
      ) : (
        cartDetails?.map((item, idx) => {
          const key = getKey(item?.ad);
          const isOpen = expanded?.includes(key);
          return (
            <div key={idx} className="ads-cart-item">
              {/* Ad Header (clickable) */}
              <div onClick={() => toggleExpand(key)} className="ads-cart-item-header ads-cart-item-header--clickable">
                <span>
                  {/* {item?.ad?.name} — ₹{item?.ad?.amount * item?.slots?.length} */}
                  {/* {item?.ad?.amount ? ` — ₹${(item.ad.amount * 0.09 * 0.09 * item.slots?.length).toFixed(2)}` : ""} */}
                  {t(item?.ad?.name ?? item?.ad?.location)}
                  {/*  Apply 9% tax + 9% service (18%) on each slot amount, then multiply by number of slots */}
                  {item?.ad?.amount ? ` — ₹${(item?.ad?.amount * 1.18 * item?.slots?.length).toFixed(2)}` : ""}
                  {/* Apply 9% tax + 9% service (18%) once on base amount, then add base × slots */}
                  {/* {item?.ad?.amount ? ` — ₹${(item?.ad?.amount * item?.slots?.length + item?.ad?.amount * 0.18).toFixed(2)}` : ""} */}
                </span>
                <span className="ads-cart-item-toggle">{isOpen ? "▾" : "▸"}</span>
              </div>

              {/* Slots Table (collapsible) */}
              {isOpen && (
                <div className="ads-cart-table">
                  <Table
                    t={t}
                    data={item.slots}
                    columns={makeColumns()}
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
  );
};

export default ADSCartDetails;
