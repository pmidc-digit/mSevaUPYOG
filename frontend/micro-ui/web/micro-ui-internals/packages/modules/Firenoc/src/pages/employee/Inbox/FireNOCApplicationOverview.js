import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header, Loader, Card, CardSubHeader, StatusTable, Row } from "@mseva/digit-ui-react-components";

const formatDate = (epoch) => {
  if (!epoch) return "NA";
  const d = new Date(Number(epoch));
  if (isNaN(d.getTime())) return "NA";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const DOCUMENT_LABELS = {
  "OWNER.PROPERTY.OWNERSHIPPROOF": "Proof of Ownership",
  "OWNER.IDENTITYPROOF": "Identity Proof",
  "OWNER.IDENTITYPROOF.AADHAAR": "Aadhaar Card",
  "OWNER.IDENTITYPROOF.DRIVING": "Driving License",
  "OWNER.IDENTITYPROOF.VOTERID": "Voter ID",
  "OWNER.IDENTITYPROOF.PASSPORT": "Passport",
  "OWNER.PROPERTY.FIREDRAWING": "Fire Drawing",
  "OWNER.PROPERTY.OWNERSHIPCHECKLIST": "Owner Checklist",
};

const SectionCard = ({ title, children }) => (
  <Card style={{ marginTop: "16px" }}>
    <CardSubHeader style={{ fontSize: "20px", marginBottom: "16px" }}>{title}</CardSubHeader>
    {children}
  </Card>
);

const FieldGrid = ({ fields }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px 24px", padding: "8px 0" }}>
    {fields.map((f, i) => (
      <div key={i}>
        <span style={{ fontSize: "13px", color: "#B1461A", display: "block", marginBottom: "4px" }}>{f.label}</span>
        <span style={{ fontSize: "16px", fontWeight: "bold", color: "#0B0C0C" }}>{f.value || "NA"}</span>
      </div>
    ))}
  </div>
);

const SectionDivider = ({ title }) => (
  <div style={{ borderBottom: "2px solid #F47738", display: "inline-block", marginTop: "16px", marginBottom: "12px" }}>
    <span style={{ color: "#F47738", fontSize: "16px", fontWeight: "500" }}>{title}</span>
  </div>
);

const FireNOCApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  const { isLoading, data: fireNOC } = Digit.Hooks.firenoc.useFIRENOCApplicationDetails({
    tenantId,
    applicationNumber: id,
  });

  const [payment, setPayment] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [docUrls, setDocUrls] = useState({});

  // Fetch payment info
  useEffect(() => {
    if (!id || !tenantId) return;
    const authToken = Digit.UserService.getUser()?.access_token || "";
    fetch(
      `/collection-services/payments/FIRENOC/_search?tenantId=${encodeURIComponent(tenantId)}&consumerCodes=${encodeURIComponent(id)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          RequestInfo: { apiId: "Rainmaker", ver: ".01", action: "", did: "1", key: "", msgId: `${Date.now()}|en_IN`, requesterId: "", authToken },
        }),
      }
    )
      .then((r) => r.json())
      .then((data) => setPayment(data?.Payments?.[0] || null))
      .catch(() => {});
  }, [id, tenantId]);

  // Fetch latest workflow status
  useEffect(() => {
    if (!id || !tenantId) return;
    const authToken = Digit.UserService.getUser()?.access_token || "";
    fetch(
      `/egov-workflow-v2/egov-wf/process/_search?businessIds=${encodeURIComponent(id)}&history=true&tenantId=${encodeURIComponent(tenantId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          RequestInfo: { apiId: "Mihy", ver: ".01", action: "", did: "1", key: "", msgId: `${Date.now()}|en_IN`, requesterId: "", authToken },
        }),
      }
    )
      .then((r) => r.json())
      .then((data) => {
        const instances = data?.ProcessInstances || [];
        setWorkflow(instances.length > 0 ? instances[0] : null);
      })
      .catch(() => {});
  }, [id, tenantId]);

  // Fetch document URLs from fileStoreIds
  useEffect(() => {
    if (!fireNOC) return;
    const docs = fireNOC?.fireNOCDetails?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [];
    const fileStoreIds = docs.map((d) => d.fileStoreId).filter(Boolean);
    if (fileStoreIds.length === 0) return;

    Digit.UploadServices.Filefetch(fileStoreIds, tenantId)
      .then((res) => {
        const urlMap = {};
        if (res?.data) {
          Object.entries(res.data).forEach(([fsId, urls]) => {
            urlMap[fsId] = urls?.[0]?.url?.split(",")[0] || "";
          });
        }
        setDocUrls(urlMap);
      })
      .catch(() => {});
  }, [fireNOC, tenantId]);

  if (isLoading) return <Loader />;
  if (!fireNOC) return <Card style={{ textAlign: "center", marginTop: "40px" }}>{t("COMMON_NO_DATA_FOUND")}</Card>;

  const details = fireNOC.fireNOCDetails;
  const building = details?.buildings?.[0];
  const address = details?.propertyDetails?.address;
  const owner = details?.applicantDetails?.owners?.[0];
  const documents = details?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [];

  // UOM map
  const uomMap = {};
  building?.uoms?.filter((u) => u.active)?.forEach((u) => { uomMap[u.code] = u.value; });

  // Payment
  const paymentDetail = payment?.paymentDetails?.[0];
  const billDetail = paymentDetail?.bill?.billDetails?.[0];
  const totalAmount = paymentDetail?.totalAmountPaid ?? billDetail?.totalAmount;
  const isPaid = payment?.paymentStatus === "DEPOSITED" || !!paymentDetail;

  // Workflow
  const wfDate = workflow?.auditDetails?.createdTime;
  const wfUpdatedBy = workflow?.assigner?.name || "NA";
  const wfStatus = details?.status || "NA";
  const wfComment = workflow?.comment || "NA";

  // Status display map
  const statusDisplayMap = {
    INITIATED: "Initiated",
    PENDINGPAYMENT: "Pending for Payment",
    DOCUMENTVERIFY: "Pending for Document Verification",
    FIELDVERIFICATION: "Pending for Field Verification",
    PENDINGAPPROVAL: "Pending for Approval",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  return (
    <React.Fragment>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 24px 0" }}>
        <Header>
          {t("NOC_APPLICATION_DETAILS")}
          <span style={{ background: "#505A5F", color: "#fff", padding: "4px 16px", borderRadius: "4px", fontSize: "16px", marginLeft: "16px" }}>
            Application No. {details?.applicationNumber}
          </span>
        </Header>
      </div>

      <div style={{ padding: "0 24px 24px" }}>

        {/* Task Status */}
        <SectionCard title="Task Status">
          <FieldGrid fields={[
            { label: "Date", value: formatDate(wfDate) },
            { label: "Updated By", value: wfUpdatedBy },
            { label: "Status", value: statusDisplayMap[wfStatus] || wfStatus },
            { label: "Current Owner", value: "NA" },
            { label: "Comments", value: wfComment },
          ]} />
        </SectionCard>

        {/* Fee Estimate */}
        {totalAmount != null && (
          <SectionCard title="Fee Estimate">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <StatusTable>
                  <Row label="NOC Fees" text={String(totalAmount)} />
                </StatusTable>
                <hr style={{ margin: "8px 0" }} />
                <StatusTable>
                  <Row label={<b>Total Amount</b>} text={<b>{String(totalAmount)}</b>} />
                </StatusTable>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: "#F47738", fontSize: "14px" }}>Total Amount</span>
                <div style={{ fontSize: "28px", fontWeight: "bold" }}>Rs {totalAmount}</div>
                {isPaid && <span style={{ color: "#00703c", fontWeight: "600" }}>Paid Successfully</span>}
              </div>
            </div>
          </SectionCard>
        )}

        {/* NOC Details */}
        <SectionCard title="NOC Details">
          <FieldGrid fields={[
            { label: "NOC Type", value: details?.fireNOCType },
            { label: "Provisional fire NoC number", value: fireNOC?.fireNOCNumber || "NA" },
            { label: "Validity Year", value: details?.additionalDetail?.validityYears ? String(details.additionalDetail.validityYears) : "NA" },
          ]} />
        </SectionCard>

        {/* Property Details */}
        <SectionCard title="Property Details">
          <SectionDivider title="Property Details" />
          <FieldGrid fields={[
            { label: "Property Type", value: details?.noOfBuildings === "SINGLE" ? "SINGLE" : "MULTIPLE" },
            { label: "Name Of Building", value: building?.name },
            { label: "Building Usage Type as per NBC", value: building?.usageType },
            { label: "Building Usage Subtype as per NBC", value: building?.usageSubType },
            { label: "Land Area(in Sq meters)", value: building?.landArea != null ? String(building.landArea) : "NA" },
            { label: "Total Covered Area(in Sq meters)", value: building?.totalCoveredArea != null ? String(building.totalCoveredArea) : "NA" },
            { label: "Parking Area (in Sq meters)", value: building?.parkingArea != null ? String(building.parkingArea) : "NA" },
            { label: "Left surrounding", value: "NA" },
            { label: "Right surrounding", value: "NA" },
            { label: "Front surrounding", value: "NA" },
            { label: "Back surrounding", value: "NA" },
          ]} />

          <SectionDivider title="Property Location Details" />
          <FieldGrid fields={[
            { label: "Property ID", value: details?.propertyDetails?.propertyId },
            { label: "Area Type", value: address?.areaType },
            { label: "District Name", value: address?.subDistrict },
            { label: "City", value: address?.city?.split(".")?.[1] ? address.city.split(".")[1].charAt(0).toUpperCase() + address.city.split(".")[1].slice(1) : address?.city },
            { label: "Door/House No.", value: address?.doorNo },
            { label: "Street Name", value: address?.street },
            { label: "Landmark Name", value: "NA" },
            { label: "Mohalla", value: address?.locality?.code || address?.locality?.name || "NA" },
            { label: "Pincode", value: address?.pincode || "NA" },
            { label: "Locate on Map", value: "NA" },
            { label: "Applicable Fire Station", value: details?.firestationId ? details.firestationId.replace(/_/g, " ").replace(/FS /i, "").trim() + " Firestation" : "NA" },
          ]} />
        </SectionCard>

        {/* Applicant Details */}
        <SectionCard title="Applicant Details">
          <FieldGrid fields={[
            { label: "Mobile Number", value: owner?.mobileNumber },
            { label: "Name", value: owner?.name },
            { label: "Gender", value: owner?.gender ? owner.gender.charAt(0).toUpperCase() + owner.gender.slice(1).toLowerCase() : "NA" },
            { label: "Father/Husband's Name", value: owner?.fatherOrHusbandName },
            { label: "Relationship", value: owner?.relationship },
            { label: "Date Of Birth", value: formatDate(owner?.dob) },
            { label: "Email", value: owner?.emailId || "NA" },
            { label: "PAN No.", value: owner?.pan || "NA" },
            { label: "Correspondence Address", value: owner?.correspondenceAddress },
          ]} />
        </SectionCard>

        {/* Documents */}
        {documents.length > 0 && (
          <SectionCard title="Documents">
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {documents.map((doc, idx) => {
                const label = DOCUMENT_LABELS[doc.documentType] || doc.documentType?.replace(/\./g, " ") || `Document`;
                const url = docUrls[doc.fileStoreId];
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px",
                      padding: "12px 20px",
                      minWidth: "200px",
                      flex: "1",
                      maxWidth: "250px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "8px" }}>{label}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "13px", color: "#505A5F" }}>Document - {idx + 1}</span>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "#F47738", fontWeight: "600", fontSize: "14px", textDecoration: "none" }}>
                          VIEW
                        </a>
                      ) : (
                        <span style={{ color: "#888", fontSize: "14px" }}>Loading...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

      </div>
    </React.Fragment>
  );
};

export default FireNOCApplicationOverview;
