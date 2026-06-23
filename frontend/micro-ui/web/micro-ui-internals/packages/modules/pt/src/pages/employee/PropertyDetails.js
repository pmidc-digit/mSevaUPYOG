import { EditIcon, Header, LinkLabel, Loader, Modal, LinkButton } from "@mseva/digit-ui-react-components";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import ApplicationDetailsTemplate from "../../../../templates/ApplicationDetails";
import PropertyOwnerHistory from "../citizen/MyProperties/propertyOwnerHistory";
import usePropertyAPI from "../../../../../libraries/src/hooks/pt/usePropertyAPI";
import UpdateSurveyId from "./updateSurveyId";

const Close = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF">
    <path d="M0 0h24v24H0V0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
  </svg>
);

const CloseBtn = (props) => {
  return (
    <div className="icon-bg-secondary" onClick={props.onClick}>
      <Close />
    </div>
  );
};

const PropertyDetails = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const { id: applicationNumber } = useParams();
  const [showToast, setShowToast] = useState(null);
  const [appDetailsToShow, setAppDetailsToShow] = useState({});
  const [enableAudit, setEnableAudit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showUpdateNo, setShowUpdateNo] = useState(false);
  const [showUpdateSurveyId, setShowUpdateSurveyId] = useState(null);
  const [showDuesPopup, setShowDuesPopup] = useState(false);

  const [showDocsPopup, setShowDocsPopup] = useState(false);
  
  const stateId = Digit.ULBService.getStateId();
  const { isLoading: docsLoading, data: Documentsob } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", ["MutationDocuments"]);
  const docs = Documentsob?.PropertyTax?.MutationDocuments || [];
  const PT_CEMP = Digit.UserService.hasAccess(["PT_CEMP"]) || false;
  const [businessService, setBusinessService] = useState("PT.CREATE");
  const history = useHistory();
  sessionStorage.setItem("propertyIdinPropertyDetail", applicationNumber);
  // const isMobile = window.Digit.Utils.browser.isMobile();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 780);

  let { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.pt.useApplicationDetail(t, tenantId, applicationNumber);
  const { data: fetchBillData, isLoading: fetchBillLoading, revalidate } = Digit.Hooks.useFetchBillsForBuissnessService({
    businessService: "PT",
    consumerCode: applicationNumber,
  });

  const { isLoading: auditDataLoading, isError: isAuditError, data: auditData } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { propertyIds: applicationNumber, audit: true },
    },
    {
      enabled: enableAudit,
      select: (data) =>
        data.Properties.filter((e) => e.status === "ACTIVE")?.sort((a, b) => b.auditDetails.lastModifiedTime - a.auditDetails.lastModifiedTime),
    }
  );
  const mutation = Digit.Hooks.pt.usePropertyAPI(tenantId, false);

  const { data: UpdateNumberConfig } = Digit.Hooks.useCommonMDMS(Digit.ULBService.getStateId(), "PropertyTax", ["UpdateNumber"], {
    select: (data) => {
      return data?.PropertyTax?.UpdateNumber?.[0];
    },
    retry: false,
    enable: false,
  });

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= 780 && !isMobile) {
        setIsMobile(true);
      } else if (window.innerWidth > 780 && isMobile) {
        setIsMobile(false);
      }
    }

    window.addEventListener("resize", () => {
      onResize();
    });

    return () => {
      window.removeEventListener("resize", () => {
        onResize()
      });
    };
  });


  useEffect(() => {
    if (applicationDetails && !enableAudit) {
      if(applicationDetails?.applicationDetails[1].title =="PT_ASSESMENT_INFO_SUB_HEADER")
      {
      if (applicationDetails?.applicationDetails[1].values.length ==4)
      {
        let obj = {
          "title": "PT_ASSESMENT_ELECTRICITY",
          "value": applicationDetails?.additionalDetails?.electricity || "NA"
        }
        applicationDetails?.applicationDetails[1].values.push(obj)
      }
      if (applicationDetails?.applicationDetails[1].values.length ==5)
      {
        let obj = {
          "title": "PT_ASSESMENT_ELECTRICITY_UID",
          "value": applicationDetails?.additionalDetails?.uid || "NA"
        }
        applicationDetails?.applicationDetails[1].values.push(obj)
      }
    }
      setAppDetailsToShow(_.cloneDeep(applicationDetails));
      if (applicationDetails?.applicationData?.status !== "ACTIVE") {
        setEnableAudit(true);
      }
    }
  }, [applicationDetails]);

  useEffect(() => {
    if (enableAudit && auditData?.length && Object.keys(appDetailsToShow).length) {
      const lastActiveProperty = auditData?.[0];
      lastActiveProperty.owners = lastActiveProperty?.owners?.filter((owner) => owner.status == "ACTIVE");
      if (lastActiveProperty) {
        let applicationDetails = appDetailsToShow?.transformToAppDetailsForEmployee({ property: lastActiveProperty, t });

        setAppDetailsToShow({ ...appDetailsToShow, applicationDetails });
      }
    }
  }, [auditData, enableAudit, applicationDetails]);

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: applicationDetails?.tenantId || tenantId,
    id: applicationDetails?.applicationData?.acknowldgementNumber,
    moduleCode: "PT.UPDATE",
    role: "PT_CEMP",
  });

  const closeToast = () => {
    setShowToast(null);
  };

  useEffect(() => {
    if (workflowDetails?.data?.applicationBusinessService) {
      setBusinessService(workflowDetails?.data?.applicationBusinessService);
    }
  }, [workflowDetails.data]);

  if (appDetailsToShow?.applicationDetails) {
    appDetailsToShow.applicationDetails = appDetailsToShow?.applicationDetails?.map((e) => {
      if (e.title === "PT_PROPERTY_ADDRESS_SUB_HEADER") {
        if (["ACTIVE", "INWORKFLOW"].includes(applicationDetails?.applicationData?.status)) {
          e.values.map((value) => {
            if (value.title === "Survey Id/UID") {
              value.textStyle = { display: "flex", alignItems: "center", wordBreak: "revert" };
              value.caption = (
                <span
                  onClick={() => {
                    setShowModal((prev) => !prev);
                    setShowUpdateSurveyId({
                      existingSurveyId: appDetailsToShow?.applicationData?.surveyId || "NA",
                      propertyId: appDetailsToShow?.applicationData?.propertyId,
                    });
                  }}
                  style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", marginLeft: "8px", verticalAlign: "middle" }}
                >
                  <EditIcon style={{ width: "16px", height: "16px" }} />
                </span>
              );
            }
          });
        }
      }
      if (e.title === "PT_OWNERSHIP_INFO_SUB_HEADER") {
        if (applicationDetails?.applicationData?.status === "ACTIVE") {
          e.additionalDetails.owners.map((owner, ind) => {
            owner.values.map((value) => {
              if (value.title == "PT_OWNERSHIP_INFO_MOBILE_NO") {
                value.textStyle = { display: "flex", wordBreak:"revert" };
                value.caption = (
                  <span
                    onClick={() => {
                      setShowModal((prev) => !prev);
                      setShowUpdateNo({
                        name: appDetailsToShow?.applicationData?.owners[ind]?.name,
                        mobileNumber: appDetailsToShow?.applicationData?.owners[ind]?.mobileNumber,
                        index: ind,
                      });
                    }}
                    style={{ cursor: "pointer", display: "inline-flex", paddingLeft: "20px", transform: "scale(1.5)", transformOrigin: "left center" }}
                  >
                    <EditIcon />
                  </span>
                );
              }
            });
          });

          return {
            ...e,
            Component: () => (
              <div style={{ display: "inline-flex", gap: "16px", marginLeft: "25px", alignItems: "center" }}>
                <LinkButton label={t("PT_VIEW_HISTORY")} style={{ color: "#A52A2A" }} onClick={() => setShowModal((prev) => !prev)}></LinkButton>
                <LinkButton
                  label={t("PT_OWNERSHIP_TRANSFER")}
                  style={{ color: "#A52A2A" }}
                  onClick={() => {
                    const amount = fetchBillData?.Bill?.[0]?.totalAmount || 0;
                    if (amount > 0) {
                      setShowDuesPopup(true);
                    } else {
                      setShowDocsPopup(true);
                    }
                  }}
                ></LinkButton>
              </div>
            ),
          };
        }
        return {
          ...e,
          Component: () => (
            <LinkButton
              label={t("PT_VIEW_HISTORY")}
              style={{ color: "#A52A2A", display: "inline", marginLeft: "25px" }}
              onClick={() => {
                setShowModal((prev) => !prev);
              }}
            ></LinkButton>
          ),
        };
      }
      return e;
    });
  }


  useEffect(() => {
    if (appDetailsToShow?.applicationDetails && !appDetailsToShow?.applicationDetails?.some(x => x.isDuesSection)) {
      const amount = fetchBillData?.Bill?.[0]?.totalAmount;
      const billDetails = fetchBillData?.Bill?.[0]?.billDetails || [];
      
      let dateString = billDetails?.map(detail => {
        const fromYear = new Date(detail.fromPeriod).getFullYear();
        const toYear = new Date(detail.toPeriod).getFullYear();
        return `${fromYear}-${toYear}(Rs.${detail.amount})`;
      }).join(', ') || "";

      if (amount > 0) {
        appDetailsToShow?.applicationDetails?.unshift({
          title: " ",
          asSectionHeader: true,
          isDuesSection: true,
          belowComponent: () => (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              background: "#ffffff",
              padding: "16px 20px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              marginBottom: "20px",
              border: "1px solid #f0f0f0",
              fontFamily: "Roboto, sans-serif"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#656565", fontSize: "15px", fontWeight: "500" }}>
                  <span>{t("Total Dues")}</span>
                  <span style={{ cursor: "pointer", color: "#656565", display: "inline-flex" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  </span>
                  <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#a6a6a6", display: "inline-block" }}></span>
                </div>
                <div style={{ fontSize: "22px", fontWeight: "700", color: "#0b0c0c", marginTop: "4px" }}>
                  Rs {amount}
                </div>
                {dateString && (
                  <div style={{ fontSize: "14px", color: "#505a5f", marginTop: "4px" }}>
                    {dateString}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => history.push(`/digit-ui/employee/payment/collect/pt/${applicationNumber}/${tenantId}`)}
                style={{
                  background: "#003C71",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 32px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#002554"}
                onMouseLeave={(e) => e.target.style.background = "#003C71"}
              >
                {t("PAY")}
              </button>
            </div>
          ),
          values: [
            {
              title: "PT_PROPERTY_PTUID",
              value: applicationNumber,
            }
          ]
        });
      } else {
        appDetailsToShow?.applicationDetails?.unshift({
          title: " ",
          asSectionHeader: true,
          isDuesSection: true,
          belowComponent: () => (
            <LinkLabel
              onClick={() => {
                const element = document.getElementById("payment-history");
                if (element) {
                  const header = element.querySelector(".accordion-header");
                  const body = element.querySelector(".accordion-body");
                  if (header && !body) {
                    header.click();
                  }
                  setTimeout(() => {
                    element.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                } else {
                  history.push({ pathname: `/digit-ui/employee/pt/payment-details/${applicationNumber}`});
                }
              }}
              style={isMobile ? { marginTop: "15px", marginLeft: "0px" } : { marginTop: "15px" }}
            >
              {t("PT_VIEW_PAYMENT")}
            </LinkLabel>
          ),
          values: [
            {
              title: "PT_PROPERTY_PTUID",
              value: applicationNumber,
            },
            {
              title: "PT_TOTAL_DUES",
              value: fetchBillData?.Bill?.[0]?.totalAmount ? `₹ ${fetchBillData?.Bill[0]?.totalAmount}` : "N/A",
            },
          ],
        });
      }
    }
    return () => {
      if (appDetailsToShow?.applicationDetails?.[0]?.isDuesSection && !(sessionStorage.getItem("revalidateddone") === "done")) {
        appDetailsToShow?.applicationDetails.shift();
        sessionStorage.setItem("revalidateddone", "done");
        revalidate();
      }
    };
  }, [fetchBillData, appDetailsToShow]);

  if (applicationDetails?.applicationData?.status === "ACTIVE") {
    workflowDetails = {
      ...workflowDetails,
      data: {
        ...workflowDetails?.data,
        actionState: {
          nextActions: PT_CEMP
            ? [
              {
                action: "ASSESS_PROPERTY",
                forcedName: "PT_ASSESS",
                showFinancialYearsModal: true,
                customFunctionToExecute: (data) => {
                  delete data.customFunctionToExecute;
                  history.replace({ pathname: `/digit-ui/employee/pt/ptsearch/assessment-details/${applicationNumber}`, state: { ...data } });
                },
                tenantId: Digit.ULBService.getStateId(),
              },
              {
                action: !fetchBillData?.Bill?.[0]?.totalAmount ? "MUTATE_PROPERTY" : "PT_TOTALDUES_PAY",
                forcedName: "PT_OWNERSHIP_TRANSFER",
                AmountDueForPay: fetchBillData?.Bill?.[0]?.totalAmount || 0,
                isWarningPopUp: false,
                customFunctionToExecute: () => {
                  const amount = fetchBillData?.Bill?.[0]?.totalAmount || 0;
                  if (amount > 0) {
                    setShowDuesPopup(true);
                  } else {
                    setShowDocsPopup(true);
                  }
                },
                redirectionUrl: null,
                tenantId: Digit.ULBService.getStateId(),
              },
              {
                action: "INACTIVE_PROPERTY",
                forcedName: "PT_INACTIVE_PROPERTY",
                showInactiveYearModel: true,
                customFunctionToExecute: (data) => {
                history.push("/digit-ui/employee/pt/response", { Property: data.Property, key: "UPDATE", action: "SUBMIT" });
                },
                // redirectionUrl: {
                 
                //   state: { workflow: { action: "OPEN", moduleName: "PT", businessService: "PT.CREATE" } },
                // },
               // AmountDueForPay: fetchBillData?.Bill[0]?.totalAmount,
                //isWarningPopUp: !fetchBillData?.Bill[0]?.totalAmount ? true : true,
                // redirectionUrl: {
                //   pathname: !fetchBillData?.Bill[0]?.totalAmount
                //     ? `/digit-ui/employee/pt/property-mutate-docs-required/${applicationNumber}`
                //     : `/digit-ui/employee/payment/collect/PT/${applicationNumber}`,
                //   // state: { workflow: { action: "OPEN", moduleName: "PT", businessService } },
                //   state: null,
                // },
                tenantId: Digit.ULBService.getStateId(),
              },
            ]
            : [],
        },
      },
    };
  }

  if (appDetailsToShow?.applicationData?.status === "ACTIVE" && PT_CEMP) {
    if (businessService == "PT.CREATE") setBusinessService("PT.UPDATE");
    if (!workflowDetails?.data?.actionState?.nextActions?.find((e) => e.action === "UPDATE")) {
      workflowDetails?.data?.actionState?.nextActions?.push({
        action: "UPDATE",
        redirectionUrl: {
          pathname: `/digit-ui/employee/pt/modify-application/${applicationNumber}`,
          state: { workflow: { action: "OPEN", moduleName: "PT", businessService: "PT.UPDATE" } },
        },
        tenantId: Digit.ULBService.getStateId(),
      });
    }
  }

  if (fetchBillLoading) {
    return <Loader />;
  }
  const UpdatePropertyNumberComponent = Digit?.ComponentRegistryService?.getComponent("EmployeeUpdateOwnerNumber");
 
    appDetailsToShow?.applicationData?.owners.sort((item, item2) => { return item?.additionalDetails?.ownerSequence - item2?.additionalDetails?.ownerSequence })
    
  
  return (
    <div>
      <Header>{t("PT_PROPERTY_INFORMATION")}</Header>
      <ApplicationDetailsTemplate
        applicationDetails={appDetailsToShow}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={appDetailsToShow?.applicationData}
        mutate={null}
        workflowDetails={appDetailsToShow?.applicationData?.status === "ACTIVE" ? workflowDetails : {}}
        businessService="PT"
        moduleCode="PT"
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        showTimeLine={false}
        timelineStatusPrefix={"ES_PT_COMMON_STATUS_"}
        forcedActionPrefix={"WF_EMPLOYEE_PT.CREATE"}
        propertyId={applicationNumber}
      />      {showModal ? (
   
          <Modal
            headerBarMain={
              <h1 className="heading-m">
                {showUpdateSurveyId
                  ? `PropertiesId${showUpdateSurveyId.propertyId} Existing Survey Id/UID: ${showUpdateSurveyId.existingSurveyId}`
                  : showUpdateNo
                  ? t("PTUPNO_HEADER")
                  : t("PT_OWNER_HISTORY")}
              </h1>
            }
            headerBarEnd={
              <CloseBtn
                onClick={() => {
                  setShowModal(false);
                  setShowUpdateNo(false);
                  setShowUpdateSurveyId(null);
                }}
              />
            }
            hideSubmit={true}
            isDisabled={false}
            popupStyles={
              showUpdateNo || showUpdateSurveyId
                ? { width: isMobile ? "473px" : "50%", zIndex: 100001, overflow: "visible" }
                : { width: "75%", zIndex: 100001, overflow: "visible" }
            }
          >
          {showUpdateNo && (
            <UpdatePropertyNumberComponent
              showPopup={setShowModal}
              name={showUpdateNo?.name}
              UpdateNumberConfig={UpdateNumberConfig}
              mobileNumber={showUpdateNo?.mobileNumber}
              t={t}
              onValidation={(data, showToast) => {
                let newProp = { ...appDetailsToShow?.applicationData };
                newProp.owners[showUpdateNo?.index].mobileNumber = data.mobileNumber;
                newProp.creationReason = "UPDATE";
                newProp.tenantId = tenantId;
                let newDocObj = { ...data };
                delete newDocObj.mobileNumber;
                newProp.documents = [
                  ...(newProp.documents || []),
                  ...Object.keys(newDocObj).map((key) => ({
                    documentType: key,
                    documentUid: newDocObj[key],
                    fileStoreId: newDocObj[key],
                  })),
                ];
                mutation.mutate(
                  {
                    Property: newProp,
                  },
                  {
                    onError: (error) => {
                      console.error("Property update failed:", error);
                      setShowToast({ key: "error", message: "Failed to update property", type: "error" });
                    },
                    onSuccess: async (successRes) => {
                      console.log("Property updated successfully", successRes);
                      showToast();
                      setTimeout(() => {
                        window.location.reload();
                      }, 3000);
                    },
                  }
                );
              }}
            ></UpdatePropertyNumberComponent>
          )}
          {showUpdateSurveyId && (
            <UpdateSurveyId
              t={t}
              propertyId={showUpdateSurveyId.propertyId}
              existingSurveyId={showUpdateSurveyId.existingSurveyId}
              showPopup={setShowModal}
              onValidation={(data) => {
                let newProp = { ...appDetailsToShow?.applicationData };
                newProp.surveyId = data.surveyId;
                newProp.creationReason = "UPDATE";
                newProp.tenantId = tenantId;
                newProp.workflow = null;
                mutation.mutate(
                  {
                    Property: newProp,
                  },
                  {
                    onError: (error) => {
                      console.error("Property update failed:", error);
                      setShowToast({ key: "error", message: "Failed to update property survey ID", type: "error" });
                    },
                    onSuccess: async (successRes) => {
                      console.log("Property updated successfully", successRes);
                      setShowToast({ key: "success", message: t("PT_SURVEY_ID_UPDATED_SUCCESS") || "Survey ID updated successfully!", type: "success" });
                      setShowModal(false);
                      setShowUpdateSurveyId(null);
                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    },
                  }
                );
              }}
            />
          )}
          {!showUpdateNo && !showUpdateSurveyId && <PropertyOwnerHistory propertyId={applicationNumber} userType={"employee"} />}
          </Modal>
       
      ) : null}
      {showDuesPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          fontFamily: "Roboto, sans-serif"
        }}>
          <div style={{
            background: "#ffffff",
            width: "90%",
            maxWidth: "600px",
            borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            position: "relative",
            padding: "24px 32px"
          }}>
            {/* Close Button */}
            <div 
              onClick={() => setShowDuesPopup(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                cursor: "pointer",
                color: "#656565"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
              </svg>
            </div>

            {/* Modal Body */}
            <div>
              <h2 style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#0b0c0c",
                margin: "0 0 16px 0",
                textAlign: "left"
              }}>
                {t("Pending Amount Due")}
              </h2>
              
              <p style={{
                fontSize: "16px",
                color: "#505a5f",
                margin: "0 0 32px 0",
                textAlign: "left",
                lineHeight: "1.5"
              }}>
                {t("Inorder to transfer property you must clear all your dues.")}
              </p>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderTop: "1px solid #f0f0f0",
                paddingTop: "20px"
              }}>
                <div>
                  <div style={{
                    fontSize: "15px",
                    color: "#656565",
                    fontWeight: "500",
                    marginBottom: "4px"
                  }}>
                    {t("Property Due")}
                  </div>
                  <div style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#0b0c0c"
                  }}>
                    Rs {fetchBillData?.Bill?.[0]?.totalAmount}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDuesPopup(false);
                    history.push(`/digit-ui/employee/payment/collect/pt/${applicationNumber}/${tenantId}`);
                  }}
                  style={{
                    background: "transparent",
                    color: "#003C71",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "700",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    padding: "8px 16px",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.color = "#002554"}
                  onMouseLeave={(e) => e.target.style.color = "#003C71"}
                >
                  {t("PAY NOW")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDocsPopup && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 99999,
          fontFamily: "Roboto, sans-serif"
        }}>
          <div style={{
            background: "#ffffff",
            width: "90%",
            maxWidth: "650px",
            maxHeight: "85vh",
            borderRadius: "4px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            position: "relative",
            padding: "24px 32px",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Close Button */}
            <div 
              onClick={() => setShowDocsPopup(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                cursor: "pointer",
                color: "#656565"
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
              </svg>
            </div>

            {/* Modal Header */}
            <div style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}>
              <h2 style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#0b0c0c",
                margin: 0,
                textAlign: "left"
              }}>
                {t("PT_REQIURED_DOC_TRANSFER_OWNERSHIP")}
              </h2>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{
              overflowY: "auto",
              padding: "16px 0",
              flex: 1,
              textAlign: "left"
            }}>
              {docsLoading && <Loader />}
              {!docsLoading && docs.map((doc, index) => {
                const splitValues = doc.code.split(".");
                const dd = doc.dropdownData;
                return (
                  <div key={index} style={{ marginBottom: "24px" }}>
                    <h3 style={{
                      fontSize: "17px",
                      fontWeight: "700",
                      color: "#003C71",
                      marginBottom: "12px",
                      marginTop: index === 0 ? "0px" : "16px"
                    }}>
                      {t(`${splitValues[0]}.${splitValues[1]}`)}
                    </h3>
                    {dd.map((e, ind) => (
                      <div key={ind} style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#0b0c0c",
                        marginBottom: "6px"
                      }}>
                        {ind + 1 + ". " + t(e.code)}
                      </div>
                    ))}
                    <p style={{
                      fontSize: "14px",
                      color: "#505a5f",
                      marginTop: "8px",
                      lineHeight: "1.4"
                    }}>
                      {t(`${splitValues[0]}.${splitValues[1]}.${splitValues[1]}_DESCRIPTION`)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: "16px",
              display: "flex",
              justifyContent: "flex-end"
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowDocsPopup(false);
                  history.push(`/digit-ui/employee/pt/property-mutate/${applicationNumber}`);
                }}
                style={{
                  background: "#003C71",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "10px 24px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.background = "#002554"}
                onMouseLeave={(e) => e.target.style.background = "#003C71"}
              >
                {t("PT_TRANSFER_OWNERSHIP")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;