import React, { useState } from "react";
import { Table } from "@mseva/digit-ui-react-components";

const ADSCartDetails = ({ cartDetails, t }) => {
  const [expanded, setExpanded] = useState(
    () => cartDetails?.map((item) => item?.ad?.id)
  );
  const toggleExpand = (adId) => {
    setExpanded((prev) =>
      prev?.includes(adId) ? prev?.filter((id) => id !== adId) : [...prev, adId]
    );
  };

  const makeColumns = () => [
 { Header: t("ADS_DATE"), accessor: "bookingDate" },
    { Header: t("ADS_LOCATION"), accessor: "location" },
    { Header: t("ADS_FACE_AREA"), accessor: "faceArea" },
    { Header: t("ADS_TYPE"), accessor: "addType" },
    {
      Header: t("ADS_NIGHT_LIGHT"),
      accessor: (row) => (row.nightLight ? t("ADS_YES") : t("ADS_NO")),
    },
  ];

  return (
    <div style={{ marginTop: "1rem" }}>
      {cartDetails?.length === 0 ? (
        <p style={{ padding: "12px", color: "#666" }}>
          {t("ADS_NO_ADVERTISMENT_DETAILS")}
        </p>
      ) : (
        cartDetails?.map((item, idx) => {
          const isOpen = expanded?.includes(item.ad.id);
          return (
            <div
              key={idx}
              style={{
                marginBottom: "16px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              {/* Ad Header (clickable) */}
              <div
                onClick={() => toggleExpand(item?.ad?.id)}
                style={{
                  background: "#f9f9f9",
                  padding: "10px 14px",
                  fontWeight: 600,
                  fontSize: "14px",
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {item?.ad?.name} — ₹{item?.ad?.amount * item?.slots?.length}
                </span>
                <span style={{ fontSize: "18px" }}>{isOpen ? "▾" : "▸"}</span>
              </div>

              {/* Slots Table (collapsible) */}
              {isOpen && (
                <div style={{ overflowX: "auto" }}>
                  <Table
                    t={t}
                    data={item.slots}
                    columns={makeColumns()}
                    disableSort={true}
                    isPaginationRequired={false}
                    getCellProps={(cell) => ({
                      style: {
                        padding: "12px 14px",
                        fontSize: "14px",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      },
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
