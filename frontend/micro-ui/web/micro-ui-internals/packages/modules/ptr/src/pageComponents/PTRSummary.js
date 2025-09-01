// import React from "react";
// import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
// import { useLocation, useHistory } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { SET_PTRNewApplication_STEP } from "../redux/action/PTRNewApplicationActions";

// function PTRSummary({ formData, t }) {
//   const { pathname: url } = useLocation();
//   const history = useHistory();
//   const dispatch = useDispatch();

//   console.log("formData", formData);

//   return (
//     <div className="application-summary">
//       <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2>

//       {/* Step 1: Owner Details */}
//       <Card className="summary-section" style={{ padding: "2px" }}>
//         <div className="section-header">
//           <h3>{t("Owner Details")}</h3>
//           <label onClick={() => dispatch(SET_PTRNewApplication_STEP(1))}>{t("EDIT")}</label>
//         </div>
//         <div className="section-content">
//           <LabelFieldPair>
//             <CardLabel>{t("First Name")}</CardLabel>
//             <div>{formData?.ownerDetails?.firstName || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Last Name")}</CardLabel>
//             <div>{formData?.ownerDetails?.lastName || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Father's Name")}</CardLabel>
//             <div>{formData?.ownerDetails?.fatherOrHusbandName || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Mobile Number")}</CardLabel>
//             <div>{formData?.ownerDetails?.mobileNumber || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Email ID")}</CardLabel>
//             <div>{formData?.ownerDetails?.emailId || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Address")}</CardLabel>
//             <div>{formData?.ownerDetails?.address || "NA"}</div>
//           </LabelFieldPair>
//         </div>
//       </Card>

//       {/* Step 2: Pet Details */}
//       <Card className="summary-section">
//         <div className="section-header">
//           <h3>{t("Pet Details")}</h3>
//           <label onClick={() => dispatch(SET_PTRNewApplication_STEP(2))}>{t("EDIT")}</label>
//         </div>
//         <div className="section-content">
//           <LabelFieldPair>
//             <CardLabel>{t("Pet Name")}</CardLabel>
//             <div>{formData?.petDetails?.petName || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Pet Type")}</CardLabel>
//             <div>{formData?.petDetails?.petType?.i18nKey || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Breed Type")}</CardLabel>
//             <div>{formData.petDetails?.breedType?.i18nKey || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Pet Gender")}</CardLabel>
//             <div>{formData?.petDetails?.petGender?.i18nKey || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Color")}</CardLabel>
//             <div>{formData?.petDetails?.color || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Vaccination Number")}</CardLabel>
//             <div>{formData?.petDetails?.vaccinationNumber || "NA"}</div>
//           </LabelFieldPair>
//           <LabelFieldPair>
//             <CardLabel>{t("Last Vaccine Date")}</CardLabel>
//             <div>{formData?.petDetails?.lastVaccineDate || "NA"}</div>
//           </LabelFieldPair>
//         </div>
//       </Card>

//       {/* Step 3: Document Details */}
//       <Card className="summary-section">
//         <div className="section-header">
//           <h3>{t("Documents")}</h3>
//           <label onClick={() => dispatch(SET_PTRNewApplication_STEP(3))}>{t("EDIT")}</label>
//         </div>
//         <div className="section-content">
//           {formData?.documents?.documents?.documents?.map((doc, index) => (
//             <div key={index}>
//               <LabelFieldPair>
//                 <CardLabel>{t("Document Type")}</CardLabel>
//                 <div>{t(doc?.documentType) || "NA"}</div>
//               </LabelFieldPair>
//               <LabelFieldPair>
//                 <CardLabel>{t("Document UID")}</CardLabel>
//                 <div>{doc?.documentUid || "NA"}</div>
//               </LabelFieldPair>
//             </div>
//           ))}
//         </div>
//       </Card>
//     </div>
//   );
// }

// export default PTRSummary;

import React, { useState, useEffect } from "react";
import { Card, CardLabel, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { useDispatch, useSelector } from "react-redux";
import { SET_PTRNewApplication_STEP } from "../redux/action/PTRNewApplicationActions";
import PTRDocument from "../pageComponents/PTRDocument";
function PTRSummary({ t }) {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.ptr.PTRNewApplicationFormReducer.formData || {});
  const owner = formData?.ownerDetails || {};
  const pet = formData?.petDetails || {};
  const docs = formData?.documents?.documents?.documents || [];
  // const [getData, setData] = useState();
  // const tenantId = window.localStorage.getItem("Citizen.tenant-id");
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  console.log("formData11", formData);

  // http://localhost:3000/digit-ui/citizen/payment/collect/PTR/PB-PTR-2025-08-26-000389/null

  // console.log("getData11", getData);

  // const fetchCalculations = async () => {
  //   // const payload = {
  //   //   CalculationCriteria: [
  //   //     {
  //   //       applicationNumber: formData?.CreatedResponse?.applicationNumber,
  //   //       tenantId: tenantId,
  //   //     },
  //   //   ],
  //   // };
  //   //  const response = await Digit.NDCService.NDCCalculator({ tenantId, filters: { getCalculationOnly: true }, details: payload });
  //   // const response = await Digit.PTRService.paymentsearch({ tenantId, filters: { getCalculationOnly: true }, auth: true });
  //   // console.log("response", response?.Calculation?.[0]?.totalAmount);
  //   // setData(response?.Calculation?.[0]);
  // };

  // useEffect(() => {
  //   fetchCalculations();
  // }, []);

  return (
    <div className="application-summary">
      <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>{t("Application Summary")}</h2>

      <Card className="summary-section" style={{ padding: "2px" }}>
        <div className="section-header">
          <h3>{t("Owner Details")}</h3>
          <label onClick={() => dispatch(SET_PTRNewApplication_STEP(1))}>{t("EDIT")}</label>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{t("First Name")}</CardLabel>
            <div>{owner?.firstName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Last Name")}</CardLabel>
            <div>{owner?.lastName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Father's Name")}</CardLabel>
            <div>{owner?.fatherOrHusbandName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Mobile Number")}</CardLabel>
            <div>{owner?.mobileNumber || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Email ID")}</CardLabel>
            <div>{owner?.emailId || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Address")}</CardLabel>
            <div>{owner?.address || "NA"}</div>
          </LabelFieldPair>
          {/* <LabelFieldPair>
            <CardLabel>{t("Amount")}</CardLabel>
            <div>{getData?.totalAmount || "NA"}</div>
          </LabelFieldPair> */}
        </div>
      </Card>

      <Card className="summary-section">
        <div className="section-header">
          <h3>{t("Pet Details")}</h3>
          <label onClick={() => dispatch(SET_PTRNewApplication_STEP(2))}>{t("EDIT")}</label>
        </div>
        <div className="section-content">
          <LabelFieldPair>
            <CardLabel>{t("Pet Name")}</CardLabel>
            <div>{pet?.petName || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Pet Type")}</CardLabel>
            <div>{pet?.petType?.i18nKey || pet?.petType?.name || pet?.petType?.code || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Breed Type")}</CardLabel>
            <div>{pet?.breedType?.i18nKey || pet?.breedType?.name || pet?.breedType?.code || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Pet Gender")}</CardLabel>
            <div>{pet?.petGender?.i18nKey || pet?.petGender?.name || pet?.petGender?.code || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Color")}</CardLabel>
            <div>{pet?.petColor || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Vaccination Number")}</CardLabel>
            <div>{pet?.vaccinationNumber || "NA"}</div>
          </LabelFieldPair>
          <LabelFieldPair>
            <CardLabel>{t("Last Vaccine Date")}</CardLabel>
            <div>{pet?.lastVaccineDate || "NA"}</div>
          </LabelFieldPair>
        </div>
      </Card>

      <Card className="summary-section">
        <div className="section-header">
          <h3>{t("Documents")}</h3>
          <label onClick={() => dispatch(SET_PTRNewApplication_STEP(3))}>{t("EDIT")}</label>
        </div>
        <div className="section-content">
          {Array.isArray(docs) && docs.length > 0 ? (
            docs.map((doc, index) => (
              <div key={index}>
                <LabelFieldPair>
                  <CardLabel>{t("Document Type")}</CardLabel>
                  <div>{t(doc?.documentType?.replaceAll?.(".", "_") || doc?.documentType) || "NA"}</div>
                </LabelFieldPair>
                {/* <LabelFieldPair>
                  <CardLabel>{t("Document UID")}</CardLabel>
                  <div>{doc?.documentUid || doc?.filestoreId || doc?.fileStoreId || "NA"}</div>
                </LabelFieldPair> */}

                {/* 🖼️ Thumbnail Preview */}
                <PTRDocument
                  petdetail={{
                    documents: [doc], // Pass single document
                    applicationNumber: formData?.CreatedResponse?.applicationNumber,
                  }}
                />
              </div>
            ))
          ) : (
            <div>{t("No documents uploaded")}</div>
          )}
        </div>
        {/* <div>
          <PTRDocument
            petdetail={{
              documents: docs,
              applicationNumber: formData?.CreatedResponse?.applicationNumber,
            }}
          />
        </div> */}
      </Card>
    </div>
  );
}

export default PTRSummary;
