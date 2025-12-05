import { Card, CardLabel, LabelFieldPair, SubmitBar, Loader, ActionBar, BackButton, Menu } from "@mseva/digit-ui-react-components";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import Timeline from "../../../components/Timeline";
import OBPSDocument from "../../../pageComponents/OBPSDocuments";
import { pad } from "lodash";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { useParams } from "react-router-dom";
import BPADocuments from "../../../pageComponents/BPADocuments";

const CheckPage = ({ onSubmit, value, selectedWorkflowAction }) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { pathname: url } = useLocation();
  const history = useHistory();
  const match = useRouteMatch();
  const user = Digit.UserService.getUser();

  const [displayMenu, setDisplayMenu] = useState(false);
  const menuRef = useRef();

  const tenantId = window.localStorage.getItem("CITIZEN.CITY");  
  const tenant = Digit.ULBService.getStateId();


  const isopenlink = window.location.href.includes("/openlink/");
  const isMobile = window.Digit.Utils.browser.isMobile();
  const isCitizenUrl = Digit.Utils.browser.isMobile() ? true : false;
  const storedData = Digit.SessionStorage.get("Digit.BUILDING_PERMIT");

  const safeValue = value && Object.keys(value).length > 0 ? value : storedData || {};
  const { result, formData, documents, LicneseType } = safeValue;
  const isArchitect = formData?.LicneseType?.LicenseType?.code?.includes("Architect") || formData?.formData?.LicneseType?.LicenseType?.code?.includes("Architect") || LicneseType?.LicenseType?.code?.includes("Architect");
  
console.log("FormData in CheckPage", result, formData, safeValue, value);
console.log('result here', result)
console.log('formData', formData)
  const status = value?.result?.Licenses?.[0]?.status;  
  const isCitizenEditable = status === "CITIZEN_ACTION_REQUIRED";

  const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
  const userInfoData = userInfos ? JSON.parse(userInfos) : {};
  const userInfo = userInfoData?.value;
  const requestor = userInfo?.info?.mobileNumber;


  const userRoles = user?.info?.roles?.map((e) => e.code);
  const {data: bparegData, isLoading: isBPAREGLoading} = Digit.Hooks.obps.useBPAREGSearch(isArchitect? "pb.punjab" : tenantId, {}, { mobileNumber: requestor }, { cacheTime: 0 });  

  const tradeType = bparegData?.Licenses?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType;
  const moduleCode = tradeType ? tradeType.split(".")[0] : null;
  const applicationNo = bparegData?.Licenses?.[0]?.applicationNumber;
  const getDocs = JSON.parse(sessionStorage.getItem("FinalDataDoc"));
  const finalDoc = getDocs?.result?.Licenses?.[0];

  const tradeTypeVal = finalDoc?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType;
  const [LicenseType, setLicenseType] = useState({});
  const mainType = tradeTypeVal?.split(".")[0];
  const { data: EmployeeStatusData, isLoading: mdmsLoading } = Digit.Hooks.useCustomMDMS(tenant, "StakeholderRegistraition", [{ name: "TradeTypetoRoleMapping" }]);
  const formattedData = EmployeeStatusData?.StakeholderRegistraition?.TradeTypetoRoleMapping;
console.log('bparegData', bparegData)
  function getLicenseType() {
    const list = [];
    const found = false;

    formattedData?.forEach((item) => {
      if (item?.isActive === "true") {
        console.log("item=====", item);
        const mainType = item?.tradeType?.split(".")[0];
        const i18nKey = `TRADELICENSE_TRADETYPE_${mainType}`;

        const alreadyExists = list.some((el) => el.i18nKey === i18nKey);

        if (!alreadyExists) {
          list.push({
            role: item.role,
            i18nKey,
            tradeType: item.tradeType,
            code: item?.code,
          });
        }
      }
    });

    return list;
  }

  function mapQualificationToLicense(qualification) {
    
    let qualificationCode = EmployeeStatusData?.BPA?.QualificationType?.find((type) => type.name?.includes(qualification?.trim()))?.role;
    console.log("qualification", qualification,EmployeeStatusData, qualificationCode, getLicenseType());
    let license = getLicenseType().find((type) => type.i18nKey.includes(qualificationCode));

    if (license) {
      setLicenseType(license);
    }
  }

  useEffect(() => {
    console.log("EmployeeStatusData", EmployeeStatusData);
    mapQualificationToLicense(result?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.qualificationType);
  }, [EmployeeStatusData, mdmsLoading])

  useEffect(() => {
    if(!isBPAREGLoading && bparegData){
      const sessionData = JSON.parse(sessionStorage.getItem("Digit.BUILDING_PERMIT"));
      const updatedFinalData = {
        ...sessionData,
        value: {
          ...sessionData?.value,
          result: bparegData,
        },
      };
      sessionStorage.setItem("Digit.BUILDING_PERMIT", JSON.stringify(updatedFinalData));
    }
  },[bparegData, isBPAREGLoading])
  

  const checkTenant = mainType == "ARCHITECT" ? "pb.punjab" : tenantId;

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: checkTenant,
    id: finalDoc?.applicationNumber || id,
    moduleCode: mainType || "ENGINEER",
  });

  const consumerCode = result?.Licenses?.[0]?.applicationNumber;

  const fetchBillParams = { consumerCode };

  const { data: paymentDetails, isLoading } = Digit.Hooks.obps.useBPAREGgetbill(
    // { businessService: "BPAREG", ...fetchBillParams, tenantId: tenant || tenantId.split(".")[0] },
    { businessService: "BPAREG", ...fetchBillParams, tenantId: checkTenant },
    {
      enabled: consumerCode ? true : false,
      retry: false,
    }
  );  



   const { data: reciept_data, isLoading: recieptDataLoading } =
  Digit.Hooks.useRecieptSearch(
    {
      businessService: "BPAREG",
      ...{consumerCodes: consumerCode},
      tenantId: mainType === "ARCHITECT" ? "pb.punjab" : (tenantId)
    },
    {
      enabled: consumerCode ? true : false,
      retry: false,
    }
  );

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);



  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  const actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });


  function onActionSelect(action) {
    setDisplayMenu(false);
    sessionStorage.setItem("selectedWorkflowAction", action.action);
    if (onSubmit) {
      onSubmit(action);
    }
  }



  // ---------------- UI Styles ----------------
  const pageStyle = {
    padding: "2rem",
    backgroundColor: "#f1f1f1ff",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    paddingBottom: "5rem",
  };

  const sectionStyle = {
    backgroundColor: "#ffffff",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  };

  const headingStyle = {
    fontSize: "1.5rem",
    borderBottom: "2px solid #ccc",
    paddingBottom: "0.3rem",
    color: "#2e4a66",
    marginTop: "2rem",
    marginBottom: "1rem",
  };

  const labelFieldPairStyle = {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px dashed #e0e0e0",
    padding: "0.5rem 0",
    color: "#333",
  };

  const documentsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "1rem",
  };

  const documentCardStyle = {
    flex: isCitizenUrl ? "1 1 18%" : "1 1 22%",
    minWidth: "200px",
    maxWidth: "250px",
    backgroundColor: "#fdfdfd",
    padding: "0.75rem",
    border: "1px solid #e0e0e0",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    justifyContent: "center",
    display: "flex",
  };

  const boldLabelStyle = { fontWeight: "bold", color: "#555" };

  const renderLabel = (label, value) => (
    <div style={labelFieldPairStyle}>
      <CardLabel style={boldLabelStyle}>{label}</CardLabel>
      <div>{value || t("CS_NA")}</div>
    </div>
  );

  const getFormattedULBName = (ulbCode = "") => {
    if (!ulbCode) return t("BPA_ULB_NOT_AVAILABLE");

    const parts = ulbCode.split(".");
    if (parts.length < 2) return ulbCode.charAt(0).toUpperCase() + ulbCode.slice(1);

    const namePart = parts[1];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  // Usage:
  const ulbName = getFormattedULBName(result?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.Ulb);

  const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp));

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

  const dob = typeof result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.dob === "string" ? result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.dob : formatDate(result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.dob)

  return (
    <div style={pageStyle}>
      {/* {isopenlink && <div onClick={() => history.goBack()}>{t("CS_COMMON_BACK")}</div>} */}
      {isMobile && <Timeline currentStep={4} flow="STAKEHOLDER" />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={headingStyle}>{t("BPA_STEPPER_SUMMARY_HEADER")}</h2>

        {(() => {
          const passportPhoto = documents?.documents?.find((doc) => doc.documentType === "APPL.BPAREG_PASS_PORT_SIZE_PHOTO");

          if (!passportPhoto) return null;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1rem" }}>
      <img
        src={`${window.location.origin}/filestore/v1/files/id?tenantId=pb&fileStoreId=${passportPhoto.fileStoreId}`}
        alt="Owner Photograph"
        style={{
          maxWidth: "100px",
          maxHeight: "100px",
          border: "2px solid #e0e0e0",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom:"10px"
        }}
        onError={(e) => {
          e.target.style.display = "none"
        }}
      />
      <CardLabel style={boldLabelStyle}>{formData?.LicneseDetails?.name}</CardLabel>
      </div>
    )
  })()}
</div>

      {/* Application Details */}
      <div style={sectionStyle}>
        {renderLabel(t("BPA_APPLICATION_NUMBER_LABEL"), result?.Licenses?.[0]?.applicationNumber)}
      </div>


      {/* License Type */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_LICENSE_TYPE")}</h2>
        {renderLabel(
          t("BPA_QUALIFICATION_TYPE"),
          t(
            result?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.qualificationType
          )
        )}
        {renderLabel(t("BPA_LICENSE_TYPE"), t(LicenseType?.i18nKey))}
        {LicenseType?.i18nKey?.includes("ARCHITECT") &&
          renderLabel(t("BPA_COUNCIL_NUMBER"), result?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo)}
        {LicenseType?.i18nKey?.includes("TOWNPLANNER") &&
          renderLabel(t("BPA_ASSOCIATE_OR_FELLOW_NUMBER"), result?.Licenses?.[0]?.tradeLicenseDetail?.additionalDetail?.counsilForArchNo)}
        {LicenseType?.i18nKey?.includes("ARCHITECT")
          ? renderLabel(t("BPA_SELECTED_ULB"), t("BPA_ULB_SELECTED_MESSAGE"))
          : renderLabel(t("BPA_SELECTED_ULB"), ulbName || "NA")}
           {LicenseType?.i18nKey?.includes("ARCHITECT") &&
         renderLabel(
    t("BPA_CERTIFICATE_EXPIRY_DATE"), 
    (() => {
      const validTo = result?.Licenses?.[0]?.validTo;
      if (!validTo) return "";
      
      // Check if it's a number (epoch timestamp) or a numeric string
      const isEpoch = !isNaN(Number(validTo)) && Number(validTo) > 1000000000;
      
      // If it's epoch, format it; otherwise, return as-is
      return isEpoch ? formatDate(validTo) : validTo;
    })())}
      </div>

      {/* Applicant Details */}
      {mdmsLoading ? <Loader /> : <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_LICENSE_DET_CAPTION")}</h2>
        {renderLabel(t("BPA_APPLICANT_NAME_LABEL"), [result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.name])}
        {renderLabel(t("BPA_APPLICANT_GENDER_LABEL"), t(result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.gender))}
        {renderLabel(t("BPA_OWNER_MOBILE_NO_LABEL"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.mobileNumber)}
        {renderLabel(t("BPA_APPLICANT_EMAIL_LABEL"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.emailId)}
        {renderLabel(t("BPA_APPLICANT_DOB_LABEL"), dob)}
        {/* {renderLabel(t("BPA_DETAILS_PIN_LABEL"), formData?.LicneseDetails?.Pincode)} */}
      </div>}

      {/* Permanent Address */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_PERMANANT_ADDRESS_LABEL")}</h2>
        {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.permanentAddress)}
        {renderLabel(t("BPA_STATE_TYPE"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.permanentState)}
        {renderLabel(t("BPA_DISTRICT_TYPE"), t(result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.permanentDistrict))}
        {renderLabel(t("BPA_DETAILS_PIN_LABEL"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.permanentPinCode)}
      </div>

      {/* Communication Address */}
      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_COMMUNICATION_ADDRESS_HEADER_DETAILS")}</h2>
        {renderLabel(t("BPA_APPLICANT_ADDRESS_LABEL"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.correspondenceAddress)}
        {renderLabel(t("BPA_STATE_TYPE"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.correspondenceState)}
        {renderLabel(t("BPA_DISTRICT_TYPE"), t(result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.correspondenceDistrict))}
        {renderLabel(t("BPA_DETAILS_PIN_LABEL"), result?.Licenses?.[0]?.tradeLicenseDetail?.owners?.[0]?.correspondencePinCode)}
      </div>

  

      <div style={sectionStyle}>
        <h2 style={headingStyle}>{t("BPA_DOC_DETAILS_SUMMARY")}</h2>
        {documents?.documents?.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "1rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f5f5f5",
                    borderBottom: "2px solid #ddd",
                  }}
                >
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#2e4a66",
                      width: "100px",
                    }}
                  >
                    {t("BPA_SL_NO")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#2e4a66",
                    }}
                  >
                    {t("BPA_DOCUMENT_TYPE")}
                  </th>
                  <th
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#2e4a66",
                      width: "150px",
                    }}
                  >
                    {t("BPA_ACTION")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(documents?.documents || result?.Licenses?.[0]?.tradeLicenseDetail?.applicationDocuments).map((doc, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                        color: "#333",
                        fontWeight: "500",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {/* <CHANGE> Display OBPSDocument to show proper document name like "Identity Proof" */}
                      <div style={{ pointerEvents: "none" }}>
                        <OBPSDocument value={safeValue} Code={doc?.documentType} index={index} isNOC={false} svgStyles={{}} isStakeHolder={true} />
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => {
                          // <CHANGE> Trigger the OBPSDocument preview functionality
                          const row = document.querySelectorAll("tbody tr")[index];
                          const docElement = row?.querySelector('[data-testid], a, [role="button"]');
                          if (docElement) {
                            const clickEvent = new MouseEvent("click", {
                              bubbles: true,
                              cancelable: true,
                              view: window,
                            });
                            docElement.dispatchEvent(clickEvent);
                          }
                        }}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#2e4a66",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                        }}
                      >
                        {t("BPA_VIEW")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>{t("BPA_NO_DOCUMENTS_MSG")}</div>
        )}
      </div>


 
      <div style={sectionStyle}>

        <h2 style={headingStyle}>{t("BPA_SUMMARY_FEE_DETAILS")}</h2>

          {mainType === "ARCHITECT" ? (
            <div>
              
              {paymentDetails?.billResponse?.Bill[0]?.billDetails[0]?.billAccountDetails.map((bill, index) =>
                renderLabel(t(bill.taxHeadCode), `₹ ${bill?.amount}`)
              )}

              {renderLabel(t("BPA_COMMON_TOTAL_AMT"), `₹ 0`)}

              {renderLabel(
                t("BPA_STATUS_LABEL"),
                isCitizenEditable === true ? t("Paid") : t("Pending")
              )}
            </div>
          ) : (
           
  <div>
    {recieptDataLoading ? (
      <Loader message={"Loading Fee..."} />
    ) : (
      <React.Fragment>
        {/* <CHANGE> Conditionally use reciept_data or paymentDetails based on isCitizenEditable */}
        {(isCitizenEditable === true 
          ? reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.bill?.billDetails?.[0]?.billAccountDetails
          : paymentDetails?.billResponse?.Bill[0]?.billDetails[0]?.billAccountDetails
        )?.map((bill, index) =>
          renderLabel(t(bill.taxHeadCode), `₹ ${bill?.amount}`)
        )}

        {/* <CHANGE> Conditionally get totalAmount from reciept_data or paymentDetails */}
        {renderLabel(
          t("BPA_COMMON_TOTAL_AMT"),
          `₹ ${
            isCitizenEditable === true
              ? reciept_data?.Payments?.[0]?.paymentDetails?.[0]?.bill?.totalAmount || 0
              : paymentDetails?.billResponse?.Bill?.[0]?.totalAmount || 0
          }`
        )}

        {renderLabel(
          t("BPA_STATUS_LABEL"),
          isCitizenEditable === true ? t("Paid") : t("Pending")
        )}
      </React.Fragment>
    )}
  </div>



          )}



      </div>


      {actions && actions.length > 0 ? (
        <ActionBar>
          {displayMenu ? (
            <Menu localeKeyPrefix={`WF_EMPLOYEE_BPAREG`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
          ) : null}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      ) : (
        <ActionBar>
          <SubmitBar
            label={t("CS_COMMON_SUBMIT")}
            onSubmit={() => {
              onSubmit();
            }}
            disabled={
              value?.result?.Licenses?.[0]?.status !== "CITIZEN_ACTION_REQUIRED" &&
              (typeof paymentDetails?.billResponse?.Bill?.[0]?.billDetails[0]?.amount !== "number" ||
                paymentDetails?.billResponse?.Bill?.[0]?.billDetails[0]?.amount < 0)
            }
          />
        </ActionBar>
      )}
    </div>
  );
};

export default CheckPage;
