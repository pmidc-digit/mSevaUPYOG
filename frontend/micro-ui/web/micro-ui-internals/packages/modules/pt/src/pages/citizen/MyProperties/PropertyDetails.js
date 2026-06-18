import { EditIcon, Header, LinkLabel, Loader, Modal,CardSectionHeader ,MultiLink,InfoIcon} from "@mseva/digit-ui-react-components";
import _, { property, values } from "lodash";
import React, { useEffect, useState,Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";
import PropertyOwnerHistory from "./propertyOwnerHistory";
import { TransferOwnership } from "../../../pageComponents/TransferOwnership";
import getPTAcknowledgementData from "../../../getPTAcknowledgementData";
import UpdateSurveyId from "../../employee/updateSurveyId";
//import usePropertyAPI from "../../../../../libraries/src/hooks/pt/usePropertyAPI"

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
  const { id:applicationNumber } = useParams(); 
  
  console.log("application Number",applicationNumber)
  const [showToast, setShowToast] = useState(null);
  const [appDetailsToShow, setAppDetailsToShow] = useState({});
  const [enableAudit, setEnableAudit] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  const [showDuesPopup, setShowDuesPopup] = useState(false);
  const [showUpdateNo, setShowUpdateNo] = useState(false);
  const [showUpdateSurveyId, setShowUpdateSurveyId] = useState(null);
  const PT_CEMP = Digit.UserService.hasAccess(["PT_CEMP"]) || false;
  const [businessService, setBusinessService] = useState("PT.CREATE");
  const history = useHistory();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  sessionStorage.setItem("propertyIdinPropertyDetail", applicationNumber);
  
  // const isMobile = window.Digit.Utils.browser.isMobile();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 780);

  let { isLoading, isError, data: applicationDetails, error } = Digit.Hooks.pt.useApplicationDetail(t, 'pb', applicationNumber);
  const { data: fetchBillData, isLoading: fetchBillLoading, revalidate } = Digit.Hooks.useFetchBillsForBuissnessService({
    businessService: "PT",
    consumerCode: applicationNumber,
  });
  // useEffect(()=>{
  //   let consumerCodes=applicationNumber
  //   try{
  //   Digit.PTService.fetchPaymentDetails({tenantId,consumerCodes})
  //   .then(
  //     (response) =>
  //     {
  //       console.log("response",response)
  //     }
  //   )
  //   }
  //   catch(error){
  //    console.log(error)
  //   }
  // },[])
  console.log("fetchBillData",fetchBillData)
console.log("applicationDetails",applicationDetails)
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
console.log("mutation",mutation)
  const { data: UpdateNumberConfig } = Digit.Hooks.useCommonMDMS(Digit.ULBService.getStateId(), "PropertyTax", ["UpdateNumber"], {
    select: (data) => {
      return data?.PropertyTax?.UpdateNumber?.[0];
    },
    retry: false,
    enable: false,
  });
console.log("auditData",auditData)
console.log("updateNumberConfig",UpdateNumberConfig)
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
        console.log("hi")
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
        console.log("hello")
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
console.log("workflowDetails",workflowDetails)
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
          console.log("holla")
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
                    style={{ cursor: "pointer", display: "inline-flex", paddingLeft: "20px" }}
                  >
                    <EditIcon />
                  </span>
                );
              }
            });
          });
        }
        return {
          ...e,
          Component: () => (
            <>
            <LinkLabel
              onClick={() => {
                setShowModal((prev) => !prev);
              }}
              style={{ display: "inline", marginLeft: "25px",border:'1px solid',padding:'8px',minWidth:'100px',borderRadius:'8px' }}
            >
              {t("PT_VIEW_HISTORY")}
            </LinkLabel>
             <LinkLabel
              onClick={() => {
                const amount = fetchBillData?.Bill?.[0]?.totalAmount || 0;
                if (amount > 0) {
                  setShowDuesPopup(true);
                } else {
                  setShowOwnershipModal((prev) => !prev);
                }
              }}
              style={{ display: "inline", marginLeft: "25px",border:'1px solid',padding:'8px',minWidth:'150px',borderRadius:'8px',backgroundColor:'#2947a3',color:'white' }}
            >
              {t("PT_OWNERSHIP_TRANSFER")}
            </LinkLabel>
            </>
          ),
        };
      }
      return e;
    });
  }
  useEffect(() => {
    // if (appDetailsToShow?.applicationDetails?.[0]?.values?.[1].title !== "PT_TOTAL_DUES") {
     if (fetchBillData && fetchBillData?.Bill?.length>0) {
      let dateString=fetchBillData?.Bill?.[0]?.billDetails?.map(detail => {
    const fromYear = new Date(detail.fromPeriod).getFullYear();
    const toYear = new Date(detail.toPeriod).getFullYear();
    return `${fromYear}-${toYear}(Rs.${detail.amount})`;
  }).join(',');

      appDetailsToShow?.applicationDetails?.unshift({
       title:" ",
        asSectionHeader: true,
       // additionalDetails:{billingInfo:fetchBillData?.Bill},
        belowComponent: () => (
          <LinkLabel
            onClick={() => history.push({ pathname: `/digit-ui/citizen/pt/payment-details/${applicationNumber}`})}
            style={isMobile ? { marginTop: "15px", marginLeft: "0px" } : { marginTop: "15px" }}
          >
            {t("PT_VIEW_PAYMENT")}
          </LinkLabel>
        ),
        values: [
          // {
          //   title: "PT_PROPERTY_PTUID",
          //   value: applicationNumber,
          // },
          {
            title:"PT_TOTAL_DUES",
            labelComp: <span style={{

  marginLeft: "8px",
  cursor: "pointer",
  fontSize: "16px",
  color: "#555",
  hoverColor:'#000'
}}><InfoIcon /></span>,
            value: fetchBillData?.Bill?.[0]?.totalAmount ? `₹ ${fetchBillData?.Bill[0]?.totalAmount}` : "N/A",

          },
          {
            title:"",
            value:dateString

          
          }

        ],
      });
    }
    return () => {
      if (appDetailsToShow?.applicationDetails?.[0]?.values?.[1].title == "PT_TOTAL_DUES" && !(sessionStorage.getItem("revalidateddone") === "done")) {
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
          nextActions: 
          // PT_CEMP
          //   ?
             [
              {
                action: "ASSESS_PROPERTY",
                forcedName: "PT_ASSESS",
                showFinancialYearsModal: true,
                customFunctionToExecute: (data) => {
                  delete data.customFunctionToExecute;
                  if(window.location.href.includes("/citizen")){
                     history.replace({ pathname: `/digit-ui/citizen/pt/property/assessment-details/${applicationNumber}`, state: { ...data,submitLabel:t("PT_ASSESS_PROPERTY_BUTTON") } });
                  }
                  else{
                  history.replace({ pathname: `/digit-ui/employee/pt/ptsearch/assessment-details/${applicationNumber}`, state: { ...data } });
                  }
                },
                tenantId: Digit.ULBService.getStateId(),
              },
              // {
              //   action: !fetchBillData?.Bill[0]?.totalAmount ? "MUTATE_PROPERTY" : "PT_TOTALDUES_PAY",
              //   forcedName: "PT_OWNERSHIP_TRANSFER",
              //   AmountDueForPay: fetchBillData?.Bill[0]?.totalAmount,
              //   isWarningPopUp: !fetchBillData?.Bill[0]?.totalAmount ? false : true,
              //   redirectionUrl: {
              //     pathname: !fetchBillData?.Bill[0]?.totalAmount
              //       ? `/digit-ui/employee/pt/property-mutate-docs-required/${applicationNumber}`
              //       : `/digit-ui/employee/payment/collect/PT/${applicationNumber}`,
              //     // state: { workflow: { action: "OPEN", moduleName: "PT", businessService } },
              //     state: null,
              //   },
              //   tenantId: Digit.ULBService.getStateId(),
              // },
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
            // : [],
        },
      },
    };
  }
console.log("workflow details",workflowDetails)
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
    
  console.log("appDetailsToShow",appDetailsToShow)
  const handleDownloadPdf = async () => {
    try {
      const Property = appDetailsToShow?.applicationData || applicationDetails?.applicationData;
      const tenantInfo = tenants?.find((tenant) => tenant.code === Property?.tenantId);

      if (!Property || !tenantInfo) {
        setShowToast({ key: "error", error: { message: t("ERR_PDF_GEN_FAILED") } });
        setTimeout(closeToast, 5000);
        return;
      }

      const data = await getPTAcknowledgementData({ ...Property }, tenantInfo, t);
      Digit.Utils.pdf.generate(data);
    } catch (error) {
      setShowToast({ key: "error", error: { message: error?.message || t("ERR_PDF_GEN_FAILED") } });
      setTimeout(closeToast, 5000);
    }
  };

  const handlePrintPdf = async () => {
    try {
      const Property = appDetailsToShow?.applicationData || applicationDetails?.applicationData;
      const tenantInfo = tenants?.find((tenant) => tenant.code === Property?.tenantId);

      if (!Property || !tenantInfo) {
        setShowToast({ key: "error", error: { message: t("ERR_PDF_GEN_FAILED") } });
        setTimeout(closeToast, 5000);
        return;
      }

      const data = await getPTAcknowledgementData({ ...Property }, tenantInfo, t);
      Digit.Utils.pdf.generate({ ...data, isPrint: true });
    } catch (error) {
      setShowToast({ key: "error", error: { message: error?.message || t("ERR_PDF_GEN_FAILED") } });
      setTimeout(closeToast, 5000);
    }
  };

  return (
    <div>
      {/* <Header>{t("PT_PROPERTY_INFORMATION")}</Header> */}
         <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',gap:'10px'}}>
      <CardSectionHeader>{t("PT_PROPERTY_INFORMATION")}</CardSectionHeader>
      <h1 style={{fontSize:'18px',border:'1px solid grey',padding:'8px',backgroundColor:'grey',color:'white'}}>Application No: {applicationNumber}</h1>
     </div>
    <div className="button-group" style={{display:'flex',gap:'10px'}}>
          <button onClick={handleDownloadPdf} style={{display:"flex",borderRadius:'8px',backgroundColor:'#2947a3',padding:'10px',color:'white',cursor:'pointer'}} >Download</button>
          <button onClick={handlePrintPdf} style={{display:"flex",borderRadius:'8px',border:'1px solid red',padding:'10px',cursor:'pointer'}}>Print</button>
        </div>
      </div>
   
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
      />
      {showModal ? (
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
          popupStyles={showUpdateNo || showUpdateSurveyId ? { width: isMobile ? "473px" : "50%"} : { width: "75%"}}
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
                newProp.workflow = null;
                let newDocObj = { ...data };
                delete newDocObj.mobileNumber;
                newProp.documents = [
                  ...newProp.documents,
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
                    onError: {},
                    onSuccess: async (successRes) => {
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

      {showDuesPopup ? (
        <Modal
          headerBarMain={<h1 className="heading-m">{t("Pending Amount Due")}</h1>}
          headerBarEnd={<CloseBtn onClick={() => setShowDuesPopup(false)} />}
          actionCancelLabel={t("CORE_COMMON_CANCEL")}
          actionCancelOnSubmit={() => setShowDuesPopup(false)}
          actionSaveLabel={t("PAY NOW")}
          actionSaveOnSubmit={() => {
            setShowDuesPopup(false);
            history.push(`/digit-ui/citizen/payment/collect/PT/${applicationNumber}/${tenantId}`);
          }}
          formId="pt-citizen-transfer-dues"
          popupStyles={{ width: isMobile ? "90%" : "520px" }}
        >
          <div style={{ padding: "8px 0 16px" }}>
            <p style={{ fontSize: "16px", color: "#505a5f", margin: "0 0 20px", lineHeight: "1.5" }}>
              {t("Inorder to transfer property you must clear all your dues.")}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
              <span style={{ fontSize: "15px", color: "#656565", fontWeight: "500" }}>{t("Property Due")}</span>
              <span style={{ fontSize: "24px", fontWeight: "700", color: "#0b0c0c" }}>Rs {fetchBillData?.Bill?.[0]?.totalAmount || 0}</span>
            </div>
          </div>
        </Modal>
      ) : null}


       {showOwnershipModal ? (
        // <Modal
        //   headerBarMain={<h1 className="heading-m">{ t("PT_REQIURED_DOC_TRANSFER_OWNERSHIP")}</h1>}
        //   headerBarEnd={
        //     <CloseBtn
        //       onClick={() => {
        //         setShowOwnershipModal(false);
               
        //       }}
        //     />
        //   }
        //   hideSubmit={true}
        //   isDisabled={false}
        //   popupStyles={showUpdateNo ? { width: isMobile ? "473px" : "50%"} : { width: "75%"}}
        // >
        <TransferOwnership property={appDetailsToShow?.applicationData} />
        // </Modal>
       ):null}
    </div>
  );
};

export default PropertyDetails;
