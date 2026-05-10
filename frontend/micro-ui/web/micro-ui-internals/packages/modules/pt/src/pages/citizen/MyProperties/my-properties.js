import { Card } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MyProperty = ({ application }) => {
  const { t } = useTranslation();
  const tenantId = application?.tenantId;
  const address = application?.address;
  const owners = application?.owners;
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const fetchBillData = async () => {
    setLoading(true);
    const result = await Digit.PaymentService.fetchBill(tenantId, {
      businessService: "PT",
      consumerCode: application.propertyId,
    });
    setBillData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchBillData();
  }, [application.tenantId, application.propertyId]);

  sessionStorage.removeItem("type");
  sessionStorage.removeItem("pincode");
  sessionStorage.removeItem("tenantId");
  sessionStorage.removeItem("localityCode");
  sessionStorage.removeItem("landmark");
  sessionStorage.removeItem("propertyid");

  const ownersSequences =
    owners?.additionalDetails !== null
      ? owners.sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
      : owners;

  const ownerNamesDisplay = ownersSequences.map((o) => o?.name).filter(Boolean).join(", ");
  const addressDisplay =
    `${t(address?.locality?.name)}, ${t(address?.city)}${address?.pincode ? `, ${address.pincode}` : ""}`.trim() ||
    t("CS_NA");

  const statusColor =
    application.status === "ACTIVE" ? "#16a34a" :
    application.status === "INACTIVE" ? "#dc2626" : "#d97706";

  return (
    <Card
      style={{
        padding: "14px 16px",
        margin: 0,
        border: isHovered ? "1px solid #2947A3" : "1px solid #e5e7eb",
        borderRadius: "10px",
        boxShadow: isHovered
          ? "0 4px 16px rgba(41, 71, 163, 0.1)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "box-shadow 0.2s, border-color 0.2s",
        cursor: "default",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ID + status */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b", margin: 0, wordBreak: "break-all", flex: 1, marginRight: "8px", lineHeight: 1.4 }}>
          {application.propertyId}
        </p>
        <span style={{ fontSize: "11px", fontWeight: 600, color: statusColor, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "3px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: statusColor, display: "inline-block", flexShrink: 0 }} />
          {t("PT_COMMON_" + application.status)}
        </span>
      </div>

      <div style={{ borderTop: "1px solid #f1f5f9", marginBottom: "10px" }} />

      {/* Info rows */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, minWidth: "52px", flexShrink: 0, paddingTop: "1px" }}>
            {t("PT_COMMON_TABLE_COL_OWNER_NAME")}
          </span>
          <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500, lineHeight: 1.4, wordBreak: "break-word" }}>
            {ownerNamesDisplay || "—"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, minWidth: "52px", flexShrink: 0, paddingTop: "1px" }}>
            {t("PT_COMMON_COL_ADDRESS")}
          </span>
          <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500, lineHeight: 1.4, wordBreak: "break-word" }}>
            {addressDisplay || "—"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "8px", marginTop: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "10px", flexWrap: "wrap" }}>
        <Link to={`/digit-ui/citizen/pt/property/my-property/${application.propertyId}`} style={{ textDecoration: "none" }}>
          <button style={{
            fontSize: "12px", fontWeight: 600, color: "#2947A3",
            background: "#EEF2FF", border: "none", borderRadius: "6px",
            padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            {t("PT_VIEW_DETAILS")}
          </button>
        </Link>
        {billData?.Bill?.length > 0 && (
          <Link to={`/digit-ui/citizen/payment/my-bills/PT/${application?.propertyId}`} style={{ textDecoration: "none" }}>
            <button style={{
              fontSize: "12px", fontWeight: 600, color: "#16a34a",
              background: "#F0FDF4", border: "none", borderRadius: "6px",
              padding: "5px 12px", cursor: "pointer", whiteSpace: "nowrap",
            }}>
              {t("COMMON_MAKE_PAYMENT")}
            </button>
          </Link>
        )}
      </div>
    </Card>
  );
};

export default MyProperty;
