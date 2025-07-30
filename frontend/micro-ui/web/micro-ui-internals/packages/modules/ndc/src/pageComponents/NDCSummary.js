import React, { Fragment } from "react";
import { Card, CardSubHeader, CardLabel, LabelFieldPair, StatusTable } from "@mseva/digit-ui-react-components";
import { useLocation ,useHistory} from "react-router-dom";
import { useDispatch } from "react-redux";
import { setNDCStep } from "../redux/actions/NDCFormActions";
import NDCDocument from "../components/NDCDocument";

const NDCSummary = ({ formData, t}) => {
  console.log("form data in summary component", formData);
  const { pathname: url } = useLocation();
    const history = useHistory();
    const dispatch=useDispatch()
  const mutateScreen = url.includes("/property-mutate/");
  let docs = formData?.DocummentDetails?.documents?.documents;
  
  return (
    <>
      
        <div className="application-summary">
          <h2 style={{fontSize:'20px',fontWeight:'bold'}}>{t("Application Summary")}</h2>


          <div className="summary-section">
            <div className="section-header">
              <h3>{t("Property Details")}</h3>
              <label onClick={() =>
                
                dispatch(setNDCStep(1))
                 }>{t("EDIT")}</label>
            </div>
            <div className="section-content">
              <LabelFieldPair>
                <CardLabel>{t("First Name")}</CardLabel>
                <div>{formData?.NDCDetails?.PropertyDetails?.firstName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Last Name")}</CardLabel>
                <div>{formData?.NDCDetails?.PropertyDetails?.lastName || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Mobile Number")}</CardLabel>
                <div>{formData?.NDCDetails?.PropertyDetails?.mobileNumber || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Email ID")}</CardLabel>
                <div>{formData?.NDCDetails?.PropertyDetails?.email || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Address")}</CardLabel>
                <div>{formData?.NDCDetails?.PropertyDetails?.address || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("NDC Reason")}</CardLabel>
                <div>{t(formData?.NDCDetails?.NDCReason?.i18nKey) || "NA"}</div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Water Connection")}</CardLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {formData?.NDCDetails?.PropertyDetails?.waterConnection?.length > 0? 
                  formData?.NDCDetails?.PropertyDetails?.waterConnection?.map((item, index) => (<div key={item.connectionNo+index}>
                    {item.connectionNo}
                  </div>))
                : "NA"} 
                </div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Sewerage Connection")}</CardLabel>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {formData?.NDCDetails?.PropertyDetails?.sewerageConnection?.length > 0? 
                  formData?.NDCDetails?.PropertyDetails?.sewerageConnection?.map((item, index) => (<div key={item.connectionNo+index}>
                    {item.connectionNo}
                  </div>))
                : "NA"} 
                </div>
              </LabelFieldPair>
              <LabelFieldPair>
                <CardLabel>{t("Property ID")}</CardLabel>
                <div>{formData?.NDCDetails?.cpt?.id || "NA"}</div>
              </LabelFieldPair>
              
            </div>
          </div>


          
          <div className="summary-section">
            <div className="section-header">
              <h3>{t("Documents")}</h3>
              <label onClick={() =>
                
                dispatch(setNDCStep(2))
                 }>{t("EDIT")}</label>
            </div>
            <div className="section-content">
              {/* {formData?.DocummentDetails?.documents?.documents?.map((doc, index) => (
                <LabelFieldPair key={index}>
                  <CardLabel>{t("Document")}</CardLabel>
                  <div>{doc?.documentType || "NA"}</div>
                </LabelFieldPair>
              ))} */}
            <CardSubHeader style={{ fontSize: "24px" }}>{t("NDC_DOCUMENTS_DETAILS")}</CardSubHeader>
            <StatusTable>
              {docs?.map((doc, index) => (
                <NDCDocument value={docs} Code={doc?.documentType} index={index} formData={formData}/>
              ))}
            </StatusTable>
            </div>
          </div>
        </div>
      
    </>
  );
};

export default NDCSummary;