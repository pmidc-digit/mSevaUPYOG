import React, { useEffect, useState } from "react";
import { Card, CardSubHeader, StatusTable, Row, Loader } from "@mseva/digit-ui-react-components";
import { useSelector } from "react-redux";


const NA = "N/A";

/* ─── Fee Estimate Card ─── */
function FeeEstimateCard({ applicationNo, tenantId, t }) {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!applicationNo || !tenantId) return;
    setLoading(true);
    // billing-service requires state-level tenantId (e.g. "pb" not "pb.amritsar")
    const billingTenantId = tenantId.split(".")[0];
    Digit.PaymentService.fetchBill(billingTenantId, {
      consumerCode: applicationNo,
      businessService: "FIRENOC",
    })
      .then((res) => setBill(res?.Bill?.[0] || null))
      .catch(() => setBill(null))
      .finally(() => setLoading(false));
  }, [applicationNo, tenantId]);

  const _nocFeesVal = bill?.billDetails?.[0]?.billAccountDetails?.find(
    (a) => a.taxHeadCode === "FIRENOC_FEES"
  )?.amount;
  const nocFees = _nocFeesVal != null ? _nocFeesVal : 0;
  const totalAmount = bill?.totalAmount != null ? bill.totalAmount : 0;
  const isPaid = bill?.status === "PAID";

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <CardSubHeader style={{ marginBottom: 0 }}>{t("Fee Estimate")}</CardSubHeader>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "12px", color: "#505A5F" }}>{t("Total Amount")}</div>
          <div style={{ fontSize: "26px", fontWeight: "700" }}>Rs {loading ? "…" : totalAmount}</div>
          <div style={{ color: isPaid ? "green" : "#e84646", fontWeight: "600" }}>
            {isPaid ? t("Paid") : t("Not Paid")}
          </div>
        </div>
      </div>
      <hr style={{ borderTop: "1px solid #D6D5D4", margin: "12px 0" }} />
      <StatusTable>
        <Row label={t("NOC Fees")} text={loading ? "…" : String(nocFees)} />
        <Row label={t("Total Amount")} text={loading ? "…" : String(totalAmount)} />
      </StatusTable>
    </Card>
  );
}

/* ─── Documents card grid ─── */
function DocCard({ doc, t }) {
  const label = t(doc.documentType?.replaceAll(".", "_") || "");
  const fileId = doc.filestoreId || doc.documentAttachment || doc.uuid;
  const fileName = fileId ? `${fileId.slice(0, 8)}…` : NA;
  return (
    <div
      style={{
        border: "1px solid #D6D5D4",
        borderRadius: "4px",
        padding: "12px 16px",
        minWidth: "200px",
        flex: "1 1 200px",
      }}
    >
      <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "8px", color: "#0b0c0c" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
        <span style={{ color: "#505A5F" }}>{fileName}</span>
        {fileId && (
          <a
            href={`/filestore/v1/files/url?tenantId=pb&fileStoreIds=${fileId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e84646", fontWeight: "600", textDecoration: "none" }}
          >
            VIEW
          </a>
        )}
      </div>
    </div>
  );
}

/* ─── Main Summary Component ─── */
function NOCSummary({ currentStepData: formData, t }) {
  const uploadedDocuments = useSelector(
    (state) => state?.noc?.NOCNewApplicationFormReducer?.formData?.uploadedDocuments?.documents || []
  );

  const nocDetails = formData?.nocDetails || {};
  const site = formData?.siteDetails || {};
  const appDetails = formData?.applicationDetails || {};
  // FIRENOCService.create stores response under FireNOCs (not Noc)
  const apiFireNOC = formData?.apiData?.FireNOCs?.[0];

  const applicationNo = apiFireNOC?.fireNOCDetails?.applicationNumber || "";
  const tenantId = apiFireNOC?.tenantId || site?.cityName?.code || "";

  const owners = appDetails?.owners || [];
  const primaryOwner = owners[0] || {};

  /* doc friendly name map */
  const docLabelMap = {
    "OWNER.PROPERTY.OWNERSHIPPROOF": "Proof of Ownership",
    "OWNER.IDENTITYPROOF": "Identity Proof",
    "OWNER.IDENTITYPROOF.AADHAAR": "Identity Proof (Aadhaar)",
    "OWNER.IDENTITYPROOF.DRIVING_LICENSE": "Identity Proof (Driving License)",
    "OWNER.IDENTITYPROOF.PASSPORT": "Identity Proof (Passport)",
    "OWNER.IDENTITYPROOF.PAN_CARD": "Identity Proof (PAN Card)",
    "OWNER.IDENTITYPROOF.VOTER_ID": "Identity Proof (Voter ID)",
    "OWNER.PROPERTY.FIREDRAWING": "Fire-Fighting Plan (Fire Drawing)",
    "OWNER.PROPERTY.OWNERSHIPCHECKLIST": "Owner Checklist",
    "OWNER.FIRENOC.OLDDOCUMENT": "Firenoc Old Document",
    "OWNER.PROPERTY.TAXRECEIPT": "Property Tax Receipt",
  };

  const formatDob = (dob) => {
    if (!dob) return NA;
    const d = new Date(dob);
    if (isNaN(d)) return dob;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const val = (v) => (v !== undefined && v !== null && v !== "" ? String(v) : NA);

  return (
    <div>
      {/* ── Fee Estimate ── */}
      <FeeEstimateCard applicationNo={applicationNo} tenantId={tenantId} t={t} />

      {/* ── NOC Details ── */}
      <Card>
        <CardSubHeader>{t("NOC Details")}</CardSubHeader>
        <StatusTable>
          <Row label={t("NOC Type")} text={val(nocDetails?.fireNOCType?.code)} />
          <Row label={t("Provisional fire NoC number")} text={val(apiFireNOC?.fireNOCDetails?.nocNo || applicationNo)} />
          <Row label={t("Validity Year")} text={val(nocDetails?.validityYear?.code || nocDetails?.validityYear)} />
        </StatusTable>
      </Card>

      {/* ── Property Details ── */}
      <Card>
        <CardSubHeader>{t("Property Details")}</CardSubHeader>
        <div style={{ borderBottom: "2px solid #e84646", marginBottom: "16px" }}>
          <span style={{ color: "#e84646", fontWeight: "600", paddingBottom: "4px", display: "inline-block" }}>
            {t("Property Details")}
          </span>
        </div>
        <StatusTable>
          <Row label={t("Property Type")} text={val(site?.noOfBuildings)} />
          {(site?.buildings || []).map((b, i) => (
            <React.Fragment key={i}>
              {(site?.buildings?.length > 1) && (
                <Row label={t(`Building ${i + 1}`)} text="" />
              )}
              <Row label={t("Name Of Building")} text={val(b?.name)} />
              <Row label={t("Building Usage Type as per NBC")} text={val(b?.buildingUsageType?.name || b?.buildingUsageType?.code)} />
              <Row label={t("Building Usage Subtype as per NBC")} text={val(b?.buildingUsageSubType?.name || b?.buildingUsageSubType?.code)} />
              <Row label={t("Land Area(in Sq meters)")} text={val(b?.landArea)} />
              <Row label={t("Total Covered Area(in Sq meters)")} text={val(b?.totalCoveredArea)} />
              <Row label={t("Parking Area (in Sq meters)")} text={val(b?.parkingArea)} />
              <Row label={t("Left surrounding")} text={val(b?.surroundingOnLeft?.name || b?.surroundingOnLeft)} />
              <Row label={t("Right surrounding")} text={val(b?.surroundingOnRight?.name || b?.surroundingOnRight)} />
              <Row label={t("Front surrounding")} text={val(b?.surroundingOnFront?.name || b?.surroundingOnFront)} />
              <Row label={t("Back surrounding")} text={val(b?.surroundingOnBack?.name || b?.surroundingOnBack)} />
              <Row label={t("Height of the Building from Ground level (in meters)")} text={val(b?.uomsMap?.HEIGHT_OF_BUILDING)} />
              <Row label={t("No of Floors")} text={val(b?.noOfFloors?.code || b?.noOfFloors)} />
              <Row label={t("Ground floor builtup area(in sq. meter)")} text={val(b?.totalCoveredArea)} />
            </React.Fragment>
          ))}
        </StatusTable>

        <div style={{ borderBottom: "2px solid #e84646", margin: "16px 0" }}>
          <span style={{ color: "#e84646", fontWeight: "600", paddingBottom: "4px", display: "inline-block" }}>
            {t("Property Location Details")}
          </span>
        </div>
        <StatusTable>
          <Row label={t("Property ID")} text={val(site.propertyId)} />
          <Row label={t("Area Type")} text={val(site.areaType?.name || site.areaType?.code)} />
          <Row label={t("District Name")} text={val(site.districtName?.name || site.districtName)} />
          <Row label={t("Sub District Name")} text={val(site.cityName?.name || site.cityName?.code)} />
          <Row label={t("Door/House No.")} text={val(site.doorHouseNo)} />
          <Row label={t("Street Name")} text={val(site.streetName)} />
          {site.areaType?.code === "URBAN"
            ? <Row label={t("Mohalla")} text={val(site.mohalla?.name || site.mohalla?.i18nkey || site.mohalla)} />
            : <Row label={t("Village Name")} text={val(site.villageName)} />
          }
          <Row label={t("Landmark Name")} text={val(site.landmarkName)} />
          <Row label={t("Pincode")} text={val(site.pincode)} />
          <Row label={t("Locate on Map")} text={
            site.geoLocation?.latitude
              ? `${site.geoLocation.latitude}, ${site.geoLocation.longitude}`
              : NA
          } />
          <Row label={t("Applicable Fire Station")} text={val(
            (() => {
              const stationCode = site.fireStationId;
              if (!stationCode) return null;
              return stationCode.replace(/_/g, " ").replace(/^FS /, "").replace(/\b\w/g, c => c.toUpperCase());
            })()
          )} />
        </StatusTable>
      </Card>

      {/* ── Applicant Details ── */}
      <Card>
        <CardSubHeader>{t("Applicant Details")}</CardSubHeader>
        <StatusTable>
          <Row label={t("Mobile Number")} text={val(primaryOwner.mobileNumber)} />
          <Row label={t("Name")} text={val(primaryOwner.ownerOrFirmName || primaryOwner.name)} />
          <Row label={t("Gender")} text={val(primaryOwner.gender?.code || primaryOwner.gender)} />
          <Row label={t("Father/Husband's Name")} text={val(primaryOwner.fatherOrHusbandName)} />
          <Row label={t("Relationship")} text={val(primaryOwner.relationship?.code || primaryOwner.relationship)} />
          <Row label={t("Date Of Birth")} text={formatDob(primaryOwner.dob || primaryOwner.dateOfBirth)} />
          <Row label={t("Email")} text={val(primaryOwner.emailId)} />
          <Row label={t("PAN No.")} text={val(primaryOwner.panNo || primaryOwner.pan)} />
          <Row label={t("Correspondence Address")} text={val(primaryOwner.address || primaryOwner.correspondenceAddress)} />
        </StatusTable>
      </Card>

      {/* ── Documents ── */}
      {uploadedDocuments.length > 0 && (
        <Card>
          <CardSubHeader>{t("Documents")}</CardSubHeader>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "8px" }}>
            {uploadedDocuments.map((doc, i) => {
              const label = docLabelMap[doc.documentType] || t(doc.documentType?.replaceAll(".", "_") || "");
              const fileId = doc.filestoreId || doc.documentAttachment || doc.uuid;
              return (
                <div
                  key={i}
                  style={{
                    border: "1px solid #D6D5D4",
                    borderRadius: "4px",
                    padding: "12px 16px",
                    minWidth: "200px",
                    flex: "1 1 200px",
                  }}
                >
                  <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>{label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                    <span style={{ color: "#505A5F" }}>acknowledgement</span>
                    {fileId && (
                      <a
                        href={`/filestore/v1/files/url?tenantId=pb&fileStoreIds=${fileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#e84646", fontWeight: "600", textDecoration: "none" }}
                      >
                        VIEW
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default NOCSummary;
