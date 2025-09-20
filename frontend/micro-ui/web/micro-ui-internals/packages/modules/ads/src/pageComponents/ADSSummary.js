import React, { useState, useEffect } from "react";

import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useDispatch, useSelector } from "react-redux";
import { SET_ADSNewApplication_STEP } from "../redux/action/ADSNewApplicationActions";
import ADSDocument from "./ADSDocument";

function ADSSummary({ t }) {
  const dispatch = useDispatch();
  const TT = (key) => (t ? t(key) : key);

  const displayValue = (val) => {
    if (val === null || val === undefined || val === "") return "NA";
    if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") return String(val);
    // if it's an object, try common shape keys, otherwise JSON.stringify as fallback
    if (typeof val === "object") {
      // common patterns for address / city objects
      if (val.formattedAddress) return val.formattedAddress;
      if (val.addressLine1) return val.addressLine1;
      if (val.label) return val.label;
      if (val.name) return val.name;
      if (val.latitude && val.longitude) return `${val.latitude}, ${val.longitude}`;
      if (val.lat && val.lng) return `${val.lat}, ${val.lng}`;
      // safe fallback (shorten long JSON to avoid huge dumps)
      try {
        const s = JSON.stringify(val);
        return s.length > 120 ? s.slice(0, 117) + "..." : s;
      } catch (e) {
        return "NA";
      }
    }
    return String(val);
  };
  const displayGeo = (geo) => {
    if (!geo) return "NA";
    if (typeof geo === "string") return geo;
    return displayValue(geo);
  };

  const rawFormData = useSelector((state) => state.ads.ADSNewApplicationFormReducer.formData);

  const formData = React.useMemo(() => rawFormData || {}, [rawFormData]);
  console.log("formData :>> ", formData);

  const applicant = formData.CreatedResponse?.applicantDetail || {};
  const address = formData.address || formData.CreatedResponse?.address || {};
  const cartArray = Array.isArray(formData.CreatedResponse?.cartDetails) ? formData.CreatedResponse?.cartDetails : [];
  console.log("cartArray isss:>> ", cartArray);
  // const sgst = formData.applicantDetail.sgst || {};
  // const geolocation = formData.cartArray[0].geolocation || {};
  // const siteName = formData.cartArray[0].siteName || {};
  useEffect(() => {
    const isCitizen = window.location.href.includes("citizen");

    const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");

    // const tenantId = window.localStorage.getItem("Citizen.tenant-id");
    // const tenantId = "pb.testing";
    const bookingNo = formData?.CreatedResponse?.bookingNo || formData?.apiData?.Applications?.[0]?.bookingNo || formData?.bookingNo || "";

    if (!tenantId || !bookingNo) return;

    const payload = {
      CalculationCriteria: [{ bookingNo, tenantId }],
    };

    // Digit.ADSServices.estimateCreate(payload, tenantId)
    //   .then((resp) => {
    //     setCalcData(resp?.Calculation?.[0] || {});
    //   })
    //   .catch((err) => {
    //     console.error("ADS estimateCreate error:", err);
    //   });
  }, [formData]);

  const docs = Array.isArray(formData.documents?.documents?.documents)
    ? formData.documents.documents.documents
    : Array.isArray(formData.documents?.documents)
    ? formData.documents.documents
    : Array.isArray(formData.documents)
    ? formData.documents
    : [];

  return (
    <div className="application-summary">
      <h2 style={{ fontSize: 20, fontWeight: "bold" }}>{TT("Application Summary")}</h2>

      {/* Applicant Details */}
      <Card className="summary-section" style={{ padding: 2 }}>
        <div className="section-header">
          <h3>{TT("Applicant Details")}</h3>
          <button
            onClick={() => dispatch(SET_ADSNewApplication_STEP(2))}
            style={{ marginLeft: "10px", padding: "5px 10px", background: "none", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Edit
          </button>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{TT("Applicant Name")}</CardLabel>
            <div>{applicant.applicantName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Mobile Number")}</CardLabel>
            <div>{applicant.applicantMobileNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Email ID")}</CardLabel>
            <div>{applicant.applicantEmailId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("SGST")}</CardLabel>
            <div>{applicant.SGST || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Self Declaration")}</CardLabel>
            <div>{applicant.selfDeclaration ? TT("True") : TT("False")}</div>
            {/* <div>{TT("True")}</div> */}
          </LabelFieldPair>
        </div>
      </Card>

      {/* Address */}
      <Card className="summary-section" style={{ padding: 2 }}>
        <div className="section-header">
          <h3>{TT("Address")}</h3>
          <button
            onClick={() => dispatch(SET_ADSNewApplication_STEP(2))}
            style={{ marginLeft: "10px", padding: "5px 10px", background: "none", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Edit
          </button>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{TT("Address ID")}</CardLabel>
            <div>{address.addressId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Door No")}</CardLabel>
            <div>{address.doorNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("House No")}</CardLabel>
            <div>{address.houseNo || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("House Name")}</CardLabel>
            <div>{address.houseName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Street Name")}</CardLabel>
            <div>{address.streetName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Address Line 1")}</CardLabel>
            <div>{address.addressLine1 || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Address Line 2")}</CardLabel>
            <div>{address.addressLine2 || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Landmark")}</CardLabel>
            <div>{address.landmark || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("City")}</CardLabel>
            <div>{address.city?.label || address.city || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Locality")}</CardLabel>
            <div>{address.locality?.label || address.locality || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{TT("Pincode")}</CardLabel>
            <div>{address.pincode || "NA"}</div>
          </LabelFieldPair>
        </div>
      </Card>

      {/* Advertisement Details */}
      <Card className="summary-section">
        <div className="section-header">
          <h3>{TT("Advertisement Details")}</h3>
          <button
            onClick={() => dispatch(SET_ADSNewApplication_STEP(1))}
            style={{ marginLeft: "10px", padding: "5px 10px", background: "none", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Edit
          </button>
        </div>
        <div className="section-content">
          {cartArray.length ? (
            cartArray.map((sd, idx) => (
              <React.Fragment key={idx}>
                <LabelFieldPair>
                  <CardLabel>{TT("Site ID")}</CardLabel>
                  <div>{sd.advertisementId || "NA"}</div>
                </LabelFieldPair>
                <LabelFieldPair>
                  <CardLabel>{TT("Site Name")}</CardLabel>
                  <div>{sd.location || "NA"}</div>
                </LabelFieldPair>
                <LabelFieldPair>
                  <CardLabel>{TT("geolocation")}</CardLabel>
                  <div>{displayGeo(sd.geoLocation)}</div>
                </LabelFieldPair>

                <LabelFieldPair>
                  <CardLabel>{TT("Advertisement Type")}</CardLabel>
                  <div>{sd.addType || "NA"}</div>
                </LabelFieldPair>
                <LabelFieldPair>
                  <CardLabel>{TT("Booking Date")}</CardLabel>
                  <div>{sd.bookingDate || "NA"}</div>
                </LabelFieldPair>
                <LabelFieldPair>
                  <CardLabel>{TT("End Date")}</CardLabel>
                  <div>{sd.endDate || "NA"}</div>
                </LabelFieldPair>
                <LabelFieldPair>
                  <CardLabel>{TT("Address")}</CardLabel>
                  <div>{sd.location || "NA"}</div>
                </LabelFieldPair>
                {/* <LabelFieldPair>
                  <CardLabel>{TT("Cart ID")}</CardLabel>
                  <div>{sd.cartId || "NA"}</div>
                </LabelFieldPair> */}
                <LabelFieldPair>
                  <CardLabel>{TT("Face Area")}</CardLabel>
                  <div>{sd.faceArea || "NA"}</div>
                </LabelFieldPair>
              </React.Fragment>
            ))
          ) : (
            <div>NA</div>
          )}
        </div>
      </Card>

      {/* Documents */}
      <Card className="summary-section">
        <div className="section-header">
          <h3>{TT("Documents")}</h3>
          <button
            onClick={() => dispatch(SET_ADSNewApplication_STEP(3))}
            style={{ marginLeft: "10px", padding: "5px 10px", background: "none", border: "1px solid #ccc", cursor: "pointer" }}
          >
            Edit
          </button>
        </div>
        <div className="section-content">
          {docs.length > 0 ? (
            docs.map((doc, idx) => (
              <React.Fragment key={idx}>
                <LabelFieldPair>
                  <CardLabel>{TT("Document Type")}</CardLabel>
                  <div>{doc.documentType ? TT(doc.documentType).replace(/\./g, "_") : "NA"}</div>
                </LabelFieldPair>
                {/* <LabelFieldPair>
                  <CardLabel>{TT("Document UID")}</CardLabel>
                  <div>{doc.documentDetailId || doc.fileStoreId || doc.filestoreId || "NA"}</div>
                </LabelFieldPair> */}
                <ADSDocument value={docs} Code={doc?.documentType} index={idx} />{" "}
              </React.Fragment>
            ))
          ) : (
            <div>{TT("No documents uploaded")}</div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default ADSSummary;
