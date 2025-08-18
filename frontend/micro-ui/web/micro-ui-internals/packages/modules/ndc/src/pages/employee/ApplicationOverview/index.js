import {
  CardSectionHeader,
  Header,
  MultiUploadWrapper,
  PDFSvg,
  Row,
  StatusTable,
  LabelFieldPair,
  CardLabel,
  Loader,
  Card,
  CardSubHeader,
  ActionBar,
  SubmitBar,
  Menu,
} from "@mseva/digit-ui-react-components";
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";
import { businessServiceList, convertEpochToDate, stringReplaceAll } from "../../../utils";
import { format } from "date-fns";
import NDCDocument from "../../../pageComponents/NDCDocument";
import NDCModal from "../../../pageComponents/NDCModal";
import { set } from "lodash";

const ApplicationOverview = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = window.localStorage.getItem("Employee.tenant-id");
  const state = tenantId?.split(".")[0];
  const [appDetails, setAppDetails] = useState({});
  const [showToast, setShowToast] = useState(null);

  // const filteredDocument = {};
  // const [uploadedFile,] = useState(() => filteredDocument?.fileStoreId || null);
  // const [error, setError] = useState(null);
  // const [nocTaxDocuments, setNocTaxDocuments] = useState([]);
  const [ndcDatils, setNdcDetails] = useState([]);
  const [displayData, setDisplayData] = useState({});
  // const [nocDocumentTypeMaping, setNocDocumentTypeMaping] = useState([]);
  // const [commonDocMaping, setCommonDocMaping] = useState([]);
  // const [nocDocuments, setNocDocuments] = useState([]);
  // const [pdfFiles, setPdfFiles] = useState({});
  // const [filesArray, setFilesArray] = useState(() => []);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const isMobile = window.Digit.Utils.browser.isMobile();

  // const { isLoading: nocDocsLoading, data: nocDocs } = Digit.Hooks.obps.useMDMS(state, "NDC", ["DocumentTypeMapping"]);
  const { isLoading: nocDocsLoading, data: nocDocs } = Digit.Hooks.pt.usePropertyMDMS(state, "NDC", ["Documents"]);
  // const { isLoading: commonDocsLoading, data: commonDocs } = Digit.Hooks.obps.useMDMS(state, "common-masters", ["DocumentType"]);

  // const { isLoading, data: applicationDetails } = Digit.Hooks.noc.useNOCDetails(t, tenantId, { applicationNo: id });
  const { isLoading, data: applicationDetails } = Digit.Hooks.ndc.useSearchEmployeeApplication({ uuid: id }, tenantId);

  // const {
  //   isLoading: updatingApplication,
  //   isError: updateApplicationError,
  //   data: updateResponse,
  //   error: updateError,
  //   mutate,
  // } = Digit.Hooks.noc.useNOCApplicationActions(tenantId);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "NDC",
  });

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  let workflowDetailsTemp = {
    data: {
      actionState: {
        nextActions: [
          {
            action: "APPROVE",
            roles: ["NDC_ADMIN"],
            tenantId: "pb",
            assigneeRoles: [],
            isTerminateState: false,
          },
          {
            action: "ASSIGN",
            roles: ["NDC_ADMIN"],
            tenantId: "pb",
            assigneeRoles: ["NDC_ADMIN"],
            isTerminateState: false,
          },
          {
            action: "REJECT",
            roles: ["NDC_ADMIN"],
            tenantId: "pb",
            assigneeRoles: [],
            isTerminateState: true,
          },
        ],
      },
    },
  };

  let user = Digit.UserService.getUser();
  const menuRef = useRef();
  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }
  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetailsTemp?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const closeMenu = () => {
    setDisplayMenu(false);
  };
  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  const closeToast = () => {
    setShowToast(null);
  };

  const removeDuplicatesByUUID = (arr) => {
    const seen = new Set();
    return arr.filter((item) => {
      if (seen.has(item.uuid)) {
        return false;
      } else {
        seen.add(item.uuid);
        return true;
      }
    });
  };

  useEffect(() => {
    const ndcObject = applicationDetails?.Applications?.[0];
    if (ndcObject) {
      const applicantData = {
        address: ndcObject?.owners?.[0]?.correspondenceAddress,
        email: ndcObject?.owners?.[0]?.emailId,
        mobile: ndcObject?.owners?.[0]?.mobileNumber,
        name: ndcObject?.owners?.[0]?.name,
        // createdDate: ndcObject?.owners?.[0]?.createdtime ? format(new Date(ndcObject?.owners?.[0]?.createdtime), "dd/MM/yyyy") : "",
        applicationNo: ndcObject?.uuid,
      };
      const Documents = removeDuplicatesByUUID(ndcObject?.Documents || []);
      const NdcDetails = removeDuplicatesByUUID(ndcObject?.NdcDetails || [])?.map((item) => ({
        businessService:
          item?.businessService === "WS"
            ? "NDC_WATER_SERVICE_CONNECTION"
            : item?.businessService === "SW"
            ? "NDC_SEWERAGE_SERVICE_CONNECTION"
            : item?.businessService === "PT"
            ? "NDC_PROPERTY_TAX"
            : item?.businessService,
        consumerCode: item?.consumerCode || "",
        status: item?.status || "",
        dueAmount: item?.dueAmount || 0,
        propertyType: item?.additionalDetails?.propertyType || "",
      }));

      setDisplayData({ applicantData, Documents, NdcDetails });
    }
  }, [applicationDetails?.Applications]);

  // useEffect(() => {
  //   setNocDocumentTypeMaping(nocDocs?.NOC?.DocumentTypeMapping);
  // }, [nocDocs]);

  // useEffect(() => {
  //   setCommonDocMaping(commonDocs?.["common-masters"]?.DocumentType);
  // }, [commonDocs]);

  // useEffect(() => {
  //   sessionStorage.setItem("NewNOCDocs", JSON.stringify(nocDocuments));
  // }, [nocDocuments]);

  // useEffect(() => {
  //   if (nocDatils?.length && nocDocumentTypeMaping?.length) {
  //     let documents = [];
  //     nocDatils.map(noc => {
  //       const filteredData = nocDocumentTypeMaping.filter(data => (data?.applicationType === noc?.applicationType && data?.nocType === noc?.nocType))
  //       if (filteredData?.[0]?.docTypes?.[0]) {
  //         filteredData[0].docTypes[0].nocType = filteredData[0].nocType;
  //         filteredData[0].docTypes[0].additionalDetails = {
  //           submissionDetails: noc.additionalDetails,
  //           applicationStatus: noc.applicationStatus,
  //           appNumberLink: noc.applicationNo,
  //           nocNo: noc.nocNo
  //         }
  //         documents.push(filteredData[0].docTypes[0]);
  //       }
  //     });

  //     let documentsList = [];
  //     if (documents && documents.length > 0) {
  //       documents.map(doc => {
  //         let code = doc.documentType;
  //         let nocType = doc.nocType;
  //         doc.dropdownData = [];
  //         commonDocMaping.forEach(value => {
  //           let values = value.code.slice(0, code.length);
  //           if (code === values) {
  //             doc.hasDropdown = true;
  //             doc.dropdownData.push(value);
  //           }
  //         });
  //         documentsList.push(doc);
  //       })
  //     }
  //     documentsList.forEach(data => {
  //       data.code = data.documentType;
  //       data.dropdownData.forEach(dpData => {
  //         dpData.i18nKey = dpData.code;
  //       })
  //     })
  //     setNocTaxDocuments(documentsList);
  //   }
  // }, [nocDatils, nocDocumentTypeMaping, commonDocMaping]);

  // useEffect(() => {
  //   let acc = [];
  //   nocDatils?.[0]?.documents?.forEach((element, index, array) => {
  //     acc.push(element?.fileStoreId)
  //   });
  //   setFilesArray(acc?.map((value) => value));
  // }, [nocDatils?.[0]?.documents]);

  // useEffect(() => {
  //   if (filesArray?.length) {
  //     Digit.UploadServices.Filefetch(filesArray, Digit.ULBService.getStateId()).then((res) => {
  //       setPdfFiles(res?.data);
  //     });
  //   }
  // }, [filesArray]);

  // const DocumentDetails = ({ t, data, nocDataDetails, nocDocumentsList }) => {
  //   if (nocDataDetails?.length && nocDocumentsList?.length && nocDataDetails?.[0] != undefined) {
  //     const status = `WF_${nocDataDetails?.[0]?.additionalDetails.workflowCode}_${nocDataDetails?.[0]?.applicationStatus}`;
  //     return (
  //       <Fragment>
  //         <div style={{
  //           border: "1px solid #D6D5D4",
  //           background: "#FAFAFA",
  //           boxSizing: "border-box",
  //           borderRadius: "4px",
  //           padding: "8px",
  //           maxWidth: "950px",
  //           minWidth: "280px"
  //         }}>
  //           <CardSectionHeader style={{ marginBottom: "16px", fontSize: "20px" }}>{`${t(`NOC_MAIN_${stringReplaceAll(nocDocumentsList?.[0]?.code, ".", "_")}_LABEL`)}`}</CardSectionHeader>
  //           <StatusTable style={{ position: "relative", marginTop: "19px" }}>
  //             <Row className="border-none" label={`${t(`NOC_${nocDataDetails?.[0]?.nocType}_APPLICATION_LABEL`)}`} text={t(nocDataDetails?.[0]?.applicationNo) || "NA"} />
  //             <Row className="border-none" label={`${t("NOC_STATUS_LABEL")}`} text={t(status) || "NA"} textStyle={nocDataDetails?.[0]?.applicationStatus == "APPROVED" || nocDataDetails?.[0]?.applicationStatus == "AUTO_APPROVED" ? {color : "#00703C"} : {color: "#D4351C"}}/>
  //             <Row className="border-none" label={`${t("NOC_SUBMITED_ON_LABEL")}`} text={nocDataDetails?.[0]?.additionalDetails?.SubmittedOn ? convertEpochToDate(Number(nocDataDetails?.[0]?.additionalDetails?.SubmittedOn)) : "NA"} />
  //             <Row className="border-none" label={`${t("NOC_APPROVAL_NO_LABEL")}`} text={nocDataDetails?.[0]?.nocNo || "NA"} />
  //             <Row className="border-none" label={`${t("NOC_APPROVED_ON_LABEL")}`} text={(status === "APPROVED" || status === "REJECTED" || status === "AUTO_APPROVED" || status === "AUTO_REJECTED") ? convertEpochToDate(Number(nocDataDetails?.[0]?.auditDetails?.lastModifiedTime)) : "NA"} />
  //             <Row className="border-none" label={`${t("Documents")}`} text={""} />
  //           </StatusTable>
  //           {nocDataDetails?.[0]?.documents && nocDataDetails?.[0]?.documents.length>0 ?
  //           <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-start" }}>
  //             {nocDataDetails?.[0]?.documents?.map((value, index) => (
  //               <a target="_" href={pdfFiles[value.fileStoreId]?.split(",")[0]} style={{ minWidth: "80px", marginRight: "10px", maxWidth: "100px", height: "auto" }} key={index}>
  //                 <div style={{ display: "flex", justifyContent: "center" }}>
  //                     <PDFSvg />
  //                   </div>
  //                 <p style={{ marginTop: "8px", fontWeight: "bold", textAlign: "center", width: "100px", color: "#505A5F" }}>{t(`NOC_MAIN_${stringReplaceAll(nocDocumentsList?.[0]?.code, ".", "_")}_LABEL`)/* t(value?.title ? value?.title : decodeURIComponent( pdfFiles[value.fileStoreId]?.split(",")?.[0]?.split("?")?.[0]?.split("/")?.pop()?.slice(13))) */}</p>
  //               </a>
  //             ))}
  //           </div> : <div><p>{t("BPA_NO_DOCUMENTS_UPLOADED_LABEL")}</p></div>}
  //             <div>
  //               {workflowDetails?.data?.nextActions?.length > 0 ? nocTaxDocuments?.map((document, index) => {
  //                 return (
  //                   <SelectDocument
  //                     key={index}
  //                     document={document}
  //                     t={t}
  //                     error={error}
  //                     setError={setError}
  //                     setNocDocuments={setNocDocuments}
  //                     nocDocuments={nocDocuments}
  //                   />
  //                 );
  //               }) : null}
  //             </div>
  //         </div>
  //       </Fragment>
  //     );
  //   } else return <Loader />
  // }
  // const getBuldingComponent = (details = []) => details.map(detail => ({
  //   title: detail.title, belowComponent: () => <Fragment>
  //     <div style={{maxWidth: "950px"}}>
  //     <StatusTable style={{ position: "relative", marginTop: "19px" }}>
  //       {detail.values.map(value => <Row className="border-none" label={`${t(value?.title)}`} text={value?.value || "NA"} />
  //       )}
  //     </StatusTable>
  //     </div>
  //   </Fragment>
  // }))

  useEffect(() => {
    console.log("applicationDetails", applicationDetails);
    if (applicationDetails) {
      setIsDetailsLoading(true);
      const { Applicant: details } = applicationDetails?.Applications?.[0];
      setAppDetails({ ...applicationDetails, applicationDetails: [{ title: "NOC_DETAILS_SUMMARY_LABEL" }] });
      setIsDetailsLoading(false);
    }
  }, [applicationDetails]);

  function onActionSelect(action) {
    setShowModal(true);
    setSelectedAction(action);
  }

  const submitAction = async (data) => {
    // setShowModal(false);
    // setSelectedAction(null);
    const payloadData = applicationDetails?.Applications[0];

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];
    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData?.assignee,
      comment: filtData?.comment,
      documents: null,
    };

    const finalPayload = {
      Applications: [updatedApplicant],
    };

    console.log("finalPayload", finalPayload);
    // return;

    const response = await Digit.NDCService.NDCUpdate({ tenantId, details: finalPayload });

    setSelectedAction(null);
    setShowModal(false);
    // if (updatingApplication) return;
    // const { isValid, error } = Digit.Utils.noc.validateNOCActionForm(data, action, nocData, t);
    // if (!isValid) {
    //   setError(error);
    //   return;
    // }
    // setError(null);
    // const response = await mutate({ action: action.action, data: data, applicationData: applicationDetails?.applicationData, tenantId: tenantId, id: id });
    // if (response?.status === "success") {
    //   setShowToast({ key: "success", message: t("NOC_ACTION_SUCCESS_MSG") });
    // } else {
    //   setShowToast({ key: "error", message: t("NOC_ACTION_ERROR_MSG") });
    // }
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  if (isLoading || isDetailsLoading) {
    return <Loader />;
  }

  return (
    <div className={"employee-main-application-details"}>
      <div>
        <Header styles={{ fontSize: "32px" }}>{t("NDC_APP_OVER_VIEW_HEADER")}</Header>
      </div>
      {/* <ApplicationDetailsTemplate
        applicationDetails={appDetails}
        isLoading={isLoading || isDetailsLoading}
        isDataLoading={isLoading}
        applicationData={applicationDetails}
        mutate={mutate}
        workflowDetails={workflowDetails}
        businessService={workflowDetails?.data?.applicationBusinessService ? workflowDetails?.data?.applicationBusinessService : applicationDetails?.applicationData?.businessService}
        moduleCode="NDC"
        ActionBarStyle={isMobile?{}:{paddingRight:"50px"}}
        MenuStyle={isMobile?{}:{right:"50px"}}
        showToast={showToast}
        setShowToast={setShowToast}
        closeToast={closeToast}
        timelineStatusPrefix={`WF_${applicationDetails?.applicationData?.additionalDetails?.workflowCode}_`}
      /> */}
      <Card>
        <CardSubHeader>{t("NDC_APPLICATION_DETAILS_OVERVIEW")}</CardSubHeader>
        <StatusTable>
          {console.log("displayData?.applicantData", displayData?.applicantData)}
          {displayData?.applicantData &&
            Object.entries(displayData?.applicantData)?.map(([key, value]) => (
              <Row
                key={key}
                label={t(`${key?.toUpperCase()}`)}
                text={
                  Array.isArray(value)
                    ? value.map((item) => (typeof item === "object" ? t(item?.code || "N/A") : t(item || "N/A"))).join(", ")
                    : typeof value === "object"
                    ? t(value?.code || "N/A")
                    : t(value || "N/A")
                }
              />
            ))}
        </StatusTable>
      </Card>
      <Card>
        <CardSubHeader>{t("NDC_APPLICATION_NDC_DETAILS_OVERVIEW")}</CardSubHeader>
        {displayData?.NdcDetails?.map((detail, index) => (
          <div key={index} style={{ marginBottom: "30px", background: "#FAFAFA", padding: "16px", borderRadius: "4px" }}>
            <StatusTable>
              <Row label={t("NDC_BUSINESS_SERVICE")} text={t(`${detail.businessService}`) || detail.businessService} />
              <Row label={t("NDC_CONSUMER_CODE")} text={detail.consumerCode || "N/A"} />
              <Row label={t("NDC_STATUS")} text={t(detail.status) || detail.status} />
              <Row label={t("NDC_DUE_AMOUNT")} text={detail.dueAmount?.toString() || "0"} />
              <Row label={t("NDC_PROPERTY_TYPE")} text={t(detail.propertyType) || detail.propertyType} />
            </StatusTable>
          </div>
        ))}
      </Card>

      <Card>
        <CardSubHeader>{t("NDC_APPLICATION_DOCUMENTS_OVERVIEW")}</CardSubHeader>
        <div style={{ display: "flex", gap: "16px" }}>
          {Array.isArray(displayData?.Documents) && displayData?.Documents?.length > 0 ? (
            <NDCDocument value={{ workflowDocs: displayData?.Documents }}></NDCDocument>
          ) : (
            <div>{t("TL_NO_DOCUMENTS_MSG")}</div>
          )}
        </div>
      </Card>

      <ActionBar>
        {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
          <Menu
            localeKeyPrefix={`WF_EMPLOYEE_${"NDC"}`}
            options={actions}
            optionKey={"action"}
            t={t}
            onSelect={onActionSelect}
            // style={MenuStyle}
          />
        ) : null}
        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>

      {showModal ? (
        <NDCModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={state}
          id={id}
          applicationDetails={applicationDetails}
          applicationData={applicationDetails?.applicationData}
          closeModal={closeModal}
          submitAction={submitAction}
          actionData={workflowDetails?.data?.timeline}
          workflowDetails={workflowDetails}
        />
      ) : null}
    </div>
  );
};

export default ApplicationOverview;
