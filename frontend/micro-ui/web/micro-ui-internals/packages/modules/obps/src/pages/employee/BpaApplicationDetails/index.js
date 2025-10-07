import {
  ActionBar,
  BreakLine,
  Card,
  CardLabel,
  CardSectionHeader,
  CardSubHeader,
  CheckPoint,
  ConnectingCheckPoints,
  FormComposer,
  Header,
  LinkButton,
  Loader,
  MultiLink,
  PDFSvg,
  Row,
  StatusTable,
  SubmitBar,
  TextArea,
  TextInput,
  Toast,
  Table,
  CardHeader,
  Menu
} from "@mseva/digit-ui-react-components";
import React, { useState, Fragment, useEffect, useMemo, useRef } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
// import { FormComposer, Header, Card, CardSectionHeader, PDFSvg, Loader, StatusTable, Row, ActionBar, SubmitBar, MultiLink, LinkButton, CardSubHeader, CardLabel, TextInput, TextArea, BreakLine } from "@mseva/digit-ui-react-components";
import ApplicationDetailsTemplate from "../../../../../templates/ApplicationDetails";
import { newConfig as newConfigFI } from "../../../config/InspectionReportConfig";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import { getBusinessServices, convertDateToEpoch, downloadPdf, printPdf, getBPAFormData, getOrderDocuments, getDocsFromFileUrls, scrutinyDetailsData, } from "../../../utils";
import cloneDeep from "lodash/cloneDeep";
import ScruntinyDetails from "../../../../../templates/ApplicationDetails/components/ScruntinyDetails";
import BPADocuments from "../../../../../templates/ApplicationDetails/components/BPADocuments";
import SubOccupancyTable from "../../../../../templates/ApplicationDetails/components/SubOccupancyTable";
import DocumentsPreview from "../../../../../templates/ApplicationDetails/components/DocumentsPreview";
import TLCaption from "../../../../../templates/ApplicationDetails/components/TLCaption";
import PropertyOwners from "../../../../../templates/ApplicationDetails/components/PropertyOwners";
import BPAActionModal from "../../../../../templates/ApplicationDetails/Modal/BPAActionModal";
import FeeEstimation from "../../../pageComponents/FeeEstimation";

const BpaApplicationDetail = () => {

  const { id } = useParams();
  const { t } = useTranslation();
  // const tenantId = Digit.ULBService.getCurrentTenantId();
  const tenantId = localStorage.getItem('tenant-id')
  const [showToast, setShowToast] = useState(null);
  const [canSubmit, setSubmitValve] = useState(false);
  const defaultValues = {};
  const history = useHistory();
  // delete
  const [_formData, setFormData, _clear] = Digit.Hooks.useSessionStorage("store-data", null);
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_HAPPENED", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_MUTATION_SUCCESS_DATA", {});
  const [error, setError] = useState(null);
  const stateId = Digit.ULBService.getStateId();
  const isMobile = window.Digit.Utils.browser.isMobile();
  const { isLoading: bpaDocsLoading, data: bpaDocs } = Digit.Hooks.obps.useMDMS(stateId, "BPA", ["DocTypeMapping"]);
  const [viewTimeline, setViewTimeline] = useState(false);
  let { data: newConfig } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(tenantId, []);
  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const [isFileLoading, setIsFileLoading] = useState(false)
  const [fileUrls, setFileUrls] = useState({});
  const [ownerFileUrls, setOwnerFileUrls] = useState({});
  const [isOwnerFileLoading, setIsOwnerFileLoading] = useState(false);
  let user = Digit.UserService.getUser();
  const menuRef = useRef();
  if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
    const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
    const userInfo = userInfos ? JSON.parse(userInfos) : {};
    user = userInfo?.value;
  }
  const userRoles = user?.info?.roles?.map((e) => e.code);
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  let { id: applicationNumber } = useParams();
  const [isEnableLoader, setIsEnableLoader] = useState(false);


  const { isMdmsLoading, data: mdmsData } = Digit.Hooks.obps.useMDMS(stateId, "BPA", ["RiskTypeComputation"]);

  const { data = {}, isLoading } = Digit.Hooks.obps.useBPADetailsPage(tenantId, { applicationNo: id });
  const { isLoadingg, data: blockReason } = Digit.Hooks.obps.useMDMS(stateId, "BPA", ["BlockReason"]);

  console.log("fileUrls", fileUrls)

  const [development, setDevelopment] = useState(() => {
    return data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES || "";
  });


  const [otherCharges, setOtherCharges] = useState(() => {
    return data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES || "";
  });

  const [lessAdjusment, setLessAdjusment] = useState(() => {
    return data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT || "";
  });

  const [otherChargesDisc, setOtherChargesDisc] = useState(() => {
    return data?.applicationData?.additionalDetails?.otherFeesDiscription || "";
  });

  const [labourCess, setLabourCess] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_LABOUR_CESS || "");
  const [gaushalaFees, setGaushalaFees] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_GAUSHALA_CHARGES_CESS || "");
  const [malbafees, setMalbafees] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_MALBA_CHARGES || "");
  const [waterCharges, setWaterCharges] = useState(() => data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_WATER_CHARGES || "");
  const [adjustedAmounts, setAdjustedAmounts] = useState(() => data?.applicationData?.additionalDetails?.adjustedAmounts || []);
  console.log("DATA DATA", data);



  let improvedDoc = [];
  data?.applicationData?.documents?.map((appDoc) => {
    improvedDoc.push({ ...appDoc, module: "OBPS" });
  });
  data?.applicationData?.nocDocuments?.map((nocDoc) => {
    improvedDoc.push({ ...nocDoc, module: "NOC" });
  });

  const { data: pdfDetails, isLoading: pdfLoading, error: searchError } = Digit.Hooks.useDocumentSearch(improvedDoc, {
    enabled: improvedDoc?.length > 0 ? true : false,
  });
  const application = data?.BPA?.[0] || {};
  console.log(application, "YYY");
  let businessService = [];

  if (data?.applicationData?.businessService === "BPA_LOW") {
    businessService = ["BPA.LOW_RISK_PERMIT_FEE"]
  }
  else if (data?.applicationData?.businessService === "BPA") {
    businessService = ["BPA.NC_APP_FEE", "BPA.NC_SAN_FEE"];
  }
  else if (data?.applicationData?.businessService === "BPA_OC") {
    businessService = ["BPA.NC_OC_APP_FEE", "BPA.NC_OC_SAN_FEE"];
  }

  useEffect(() => {
    if (!isLoading && data?.applicationData?.additionalDetails) {
      const charges = data.applicationData.additionalDetails.selfCertificationCharges || {};

      setDevelopment(charges.BPA_DEVELOPMENT_CHARGES || "");
      setOtherCharges(charges.BPA_OTHER_CHARGES || "");
      setLessAdjusment(charges.BPA_LESS_ADJUSMENT_PLOT || "");
      setOtherChargesDisc(data.applicationData.additionalDetails.otherFeesDiscription || "");
      setLabourCess(charges.BPA_LABOUR_CESS || "");
      setGaushalaFees(charges.BPA_GAUSHALA_CHARGES_CESS || "");
      setMalbafees(charges.BPA_MALBA_CHARGES || "");
      setWaterCharges(charges.BPA_WATER_CHARGES || "");
      setAdjustedAmounts(data.applicationData.additionalDetails.adjustedAmounts || []);
    }
  }, [isLoading, data]);


  useEffect(() => {
    if (!bpaDocsLoading && !isLoading) {
      let filtredBpaDocs = [];
      if (bpaDocs?.BPA?.DocTypeMapping) {
        filtredBpaDocs = bpaDocs?.BPA?.DocTypeMapping?.filter(ob => (ob.WFState == "INPROGRESS" && ob.RiskType == data?.applicationData?.riskType && ob.ServiceType == data?.applicationData?.additionalDetails?.serviceType && ob.applicationType == data?.applicationData?.additionalDetails?.applicationType))
        let documents = data?.applicationDetails?.filter((ob) => ob.title === "BPA_DOCUMENT_DETAILS_LABEL")[0]?.additionalDetails?.obpsDocuments?.[0]?.values;
        let RealignedDocument = [];
        filtredBpaDocs && filtredBpaDocs?.[0]?.docTypes && filtredBpaDocs?.[0]?.docTypes.map((ob) => {
          documents && documents.filter(x => ob.code === x.documentType.slice(0, x.documentType.lastIndexOf("."))).map((doc) => {
            RealignedDocument.push(doc);
          })
        })
        const newApplicationDetails = data.applicationDetails && data.applicationDetails.map((obj) => {
          if (obj.title === "BPA_DOCUMENT_DETAILS_LABEL") {
            return { ...obj, additionalDetails: { obpsDocuments: [{ title: "", values: RealignedDocument }] } }
          }
          return obj;
        })
        data.applicationDetails = newApplicationDetails && newApplicationDetails.length > 0 ? [...newApplicationDetails] : data?.applicationDetails;
      }
    }
  }, [bpaDocs, data])

  useEffect(() => {
    const fetchFileUrls = async () => {
      if (!data?.applicationData?.additionalDetails) return;

      const fileKeys = ["ecbcCertificateFile", "greenuploadedFile", "uploadedFile", "lessAdjustmentFeeFiles"];

      // Collect valid fileStoreIds
      const validFileStoreIds = fileKeys
        .map((key) => {
          if (key === "lessAdjustmentFeeFiles") return data?.applicationData?.additionalDetails?.[key]?.[0]?.fileStoreId || null;
          return data?.applicationData?.additionalDetails?.[key]
        })
        .filter(
          (id) => id && id !== "NA" && id !== "" && id !== null && id !== undefined
        );

      if (validFileStoreIds.length === 0) return;

      try {
        setIsFileLoading(true);

        // Call Digit service
        const result = await Digit.UploadServices.Filefetch(validFileStoreIds, stateId);
        if (result?.data?.fileStoreIds) {
          const urls = {};
          fileKeys.forEach((key) => {
            const fileId = data?.applicationData?.additionalDetails?.[key];
            if (fileId && result.data?.[fileId]) {
              urls[key] = result.data?.[fileId];
            }
          });

          // Store URLs in state (example: object with keys)
          setFileUrls(urls);
        }
      } catch (error) {
        console.error("Error fetching file URLs", error);
      } finally {
        setIsFileLoading(false);
      }
    };

    fetchFileUrls();
  }, [data?.applicationData?.additionalDetails]);

  useEffect(() => {
    const fetchOwnerFileUrls = async () => {
      const owners = data?.applicationData?.landInfo?.owners || [];
      if (owners.length === 0) return;

      // Collect valid fileStoreIds from each owner
      const fileIdsMap = []; // keeps mapping of ownerIndex + propertyName to fileStoreId
      const validFileStoreIds = [];

      owners.forEach((owner, index) => {
        const docFile = owner?.additionalDetails?.documentFile;
        const photoFile = owner?.additionalDetails?.ownerPhoto;

        if (docFile && docFile !== "NA") {
          validFileStoreIds.push(docFile);
          fileIdsMap.push({ index, key: "documentFile", fileId: docFile });
        }
        if (photoFile && photoFile !== "NA") {
          validFileStoreIds.push(photoFile);
          fileIdsMap.push({ index, key: "ownerPhoto", fileId: photoFile });
        }
      });

      if (validFileStoreIds.length === 0) return;

      try {
        setIsOwnerFileLoading(true);

        // Fetch URLs
        const result = await Digit.UploadServices.Filefetch(validFileStoreIds, stateId);
        if (result?.data) {
          const urls = {};

          fileIdsMap.forEach(({ index, key, fileId }) => {
            if (result.data[fileId]) {
              if (!urls[index]) urls[index] = {};
              urls[index][key] = result.data[fileId];
            }
          });

          // Example final structure:
          // {
          //   0: { documentFile: "url1", ownerPhoto: "url2" },
          //   1: { documentFile: "url3" }
          // }
          setOwnerFileUrls(urls);
        }
      } catch (error) {
        console.error("Error fetching owner file URLs", error);
      } finally {
        setIsOwnerFileLoading(false);
      }
    };

    fetchOwnerFileUrls();
  }, [data?.applicationData?.landInfo?.owners]);

  async function getRecieptSearch({ tenantId, payments, ...params }) {
    let response = null;
    if (payments?.fileStoreId) {
      response = { filestoreIds: [payments?.fileStoreId] };
    }
    else {
      response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments }] }, "bpa-receipt");
    }
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

  async function getPermitOccupancyOrderSearch({ tenantId }, order, mode = "download") {
    let currentDate = new Date();
    data.applicationData.additionalDetails.runDate = convertDateToEpoch(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate());
    let requestData = { ...data?.applicationData, edcrDetail: [{ ...data?.edcrDetails }] }

    const state = Digit.ULBService.getStateId();
    let count = 0;

    for (let i = 0; i < workflowDetails?.data?.processInstances?.length; i++) {
      if ((workflowDetails?.data?.processInstances[i]?.action === "POST_PAYMENT_APPLY" || workflowDetails?.data?.processInstances[i]?.action === "PAY") && (workflowDetails?.data?.processInstances?.[i]?.state?.applicationStatus === "APPROVAL_INPROGRESS") && count == 0) {
        requestData.additionalDetails.submissionDate = workflowDetails?.data?.processInstances[i]?.auditDetails?.createdTime;
        count = 1;
      }
    }

    if (requestData?.additionalDetails?.approvedColony == "NO") {
      requestData.additionalDetails.permitData = "The plot has been officially regularized under No." + requestData?.additionalDetails?.NocNumber + "  dated dd/mm/yyyy, registered in the name of <name as per the NOC>. This regularization falls within the jurisdiction of " + state + ".Any form of misrepresentation of the NoC is strictly prohibited. Such misrepresentation renders the building plan null and void, and it will be regarded as an act of impersonation. Criminal proceedings will be initiated against the owner and concerned architect / engineer/ building designer / supervisor involved in such actions"
    }
    else if (requestData?.additionalDetails?.approvedColony == "YES") {
      requestData.additionalDetails.permitData = "The building plan falls under approved colony " + requestData?.additionalDetails?.nameofApprovedcolony
    }
    else {
      requestData.additionalDetails.permitData = "The building plan falls under Lal Lakir"
    }

    let response = await Digit.PaymentService.generatePdf(tenantId, { Bpa: [requestData] }, order);
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
    requestData["applicationType"] = data?.applicationData?.additionalDetails?.applicationType;
    let edcrResponse = await Digit.OBPSService.edcr_report_download({ BPA: { ...requestData } });
    const responseStatus = parseInt(edcrResponse.status, 10);
    if (responseStatus === 201 || responseStatus === 200) {
      mode == "print"
        ? printPdf(new Blob([edcrResponse.data], { type: "application/pdf" }))
        : downloadPdf(new Blob([edcrResponse.data], { type: "application/pdf" }), `edcrReport.pdf`);
    }
  }

  let applicationDocs = [],
    nocAppDocs = [];
  if (pdfDetails?.pdfFiles?.length > 0) {
    pdfDetails?.pdfFiles?.map((pdfAppDoc) => {
      if (pdfAppDoc?.module == "OBPS") applicationDocs.push(pdfAppDoc);
      if (pdfAppDoc?.module == "NOC") nocAppDocs.push(pdfAppDoc);
    });
  }

  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

  const documentsData = (getOrderDocuments(applicationDocs) || []).map((doc, index) => ({
    id: index,
    title: doc.title ? t(doc.title) : t("CS_NA"), // ✅ no extra BPA_
    fileUrl: doc.values?.[0]?.fileURL || null,
  }));
  const documentsColumns = [
    {
      Header: t("BPA_DOCUMENT_NAME"),
      accessor: "title",
      Cell: ({ value }) => value || t("CS_NA"),
    },
    {
      Header: t("BPA_DOCUMENT_FILE"),
      accessor: "fileUrl",
      Cell: ({ value }) =>
        value ? (
          <LinkButton style={{ float: "right", display: "inline", background: "#fff" }}
            label={t("View")}
            onClick={() => routeTo(value)}
          />
        ) : (
          t("CS_NA")
        ),
    },
  ];
  // const ecbcDocumentsData = useMemo(() => {
  //   return (getDocsFromFileUrls(fileUrls) || []).map((doc, index) => ({
  //     id: index,
  //     title: doc.title ? t(doc.title) : t("CS_NA"), // ✅ no extra BPA_
  //     fileUrl: doc.fileURL || null, // adjusted since `doc` already has fileURL
  //   }));
  // }, [fileUrls, t]);
    const ecbcDocumentsData = useMemo(() => {
    const docs = getDocsFromFileUrls(fileUrls) || [];
  
    if (docs.length === 0) {
      return [
        {
          id: 0,
          title: t("CS_NA"),
          fileUrl: null,
        },
      ];
    }
  
    return docs.map((doc, index) => ({
      id: index,
      title: doc.title ? t(doc.title) : t("CS_NA"),
      fileUrl: doc.fileURL || null,
    }));
  }, [fileUrls, t]);
  const ownerDocumentsData = useMemo(() => {
    // ownerFileUrls: { 0: { documentFile: 'url', ownerPhoto: 'url' }, 1: { ... } }
    if (!ownerFileUrls || typeof ownerFileUrls !== "object") return [];

    const ownersCount = Object.keys(ownerFileUrls).length;

    // Flatten into { "0_documentFile": "url", "1_ownerPhoto": "url", ... }
    const flatFileUrls = Object.entries(ownerFileUrls).reduce((acc, [ownerIdx, files]) => {
      if (files && typeof files === "object") {
        Object.entries(files).forEach(([prop, url]) => {
          if (url && url !== "NA" && url !== "" && url !== null && url !== undefined) {
            acc[`${ownerIdx}_${prop}`] = url;
          }
        });
      }
      return acc;
    }, {});

    const docs = getDocsFromFileUrls(flatFileUrls) || [];

    return docs.map((doc, index) => {
      // doc.id will be like "0_documentFile"
      const [ownerIdx, ...propParts] = String(doc.id).split("_");
      const prop = propParts.join("_"); // "documentFile" or "ownerPhoto"
      const baseTitle = (prop ? prop.toUpperCase() : (doc.title || "").toUpperCase());

      // Append index if more than 1 owner (ownerIdx is 0-based so +1)
      const title = ownersCount > 1 ? `${t(baseTitle)}_${parseInt(ownerIdx, 10) + 1}` : t(baseTitle);

      return {
        id: index,
        title,
        fileUrl: doc.fileURL || null,
      };
    });
  }, [ownerFileUrls, t]);
  async function getRevocationPDFSearch({ tenantId, ...params }) {
    let requestData = { ...data?.applicationData }
    let response = await Digit.PaymentService.generatePdf(tenantId, { Bpa: [requestData] }, "bpa-revocation");
    const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: response.filestoreIds[0] });
    window.open(fileStore[response?.filestoreIds[0]], "_blank");
  }

  const [showOptions, setShowOptions] = useState(false);


  const handleViewTimeline = () => {
    setViewTimeline(true);
    const timelineSection = document.getElementById('timeline');
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.obps.useApplicationActions(tenantId);

  const nocMutation = Digit.Hooks.obps.useObpsAPI(
    tenantId,
    true
  );
  let risType = "";
  sessionStorage.setItem("bpaApplicationDetails", true);


  function checkHead(head) {
    if (head === "ES_NEW_APPLICATION_LOCATION_DETAILS") {
      return "TL_CHECK_ADDRESS";
    } else if (head === "ES_NEW_APPLICATION_OWNERSHIP_DETAILS") {
      return "TL_OWNERSHIP_DETAILS_HEADER";
    } else {
      return head;
    }
  }


  const closeToast = () => {
    setShowToast(null);
    setError(null);
  };

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
  }, []);

  const onFormValueChange = (setValue, formData, formState) => {
    setSubmitValve(!Object.keys(formState.errors).length);
  };

  let configs = newConfig?.InspectionReportConfig ? newConfig?.InspectionReportConfig : newConfigFI;

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "BPA",
  });

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {


    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }
  if (mdmsData?.BPA?.RiskTypeComputation && data?.edcrDetails) {
    risType = Digit.Utils.obps.calculateRiskType(mdmsData?.BPA?.RiskTypeComputation, data?.edcrDetails?.planDetail?.plot?.area, data?.edcrDetails?.planDetail?.blocks);
    data?.applicationDetails?.map(detail => {
      if (detail?.isInsert) {
        detail.values?.forEach(value => {
          if (value?.isInsert) value.value = `WF_BPA_${risType}`
        })
      }
    })
  }

  const userInfo = Digit.UserService.getUser();
  const rolearray = userInfo?.info?.roles.filter(item => {
    if ((item.code == "CEMP" && item.tenantId === tenantId) || item.code == "CITIZEN") return true;
  });

  if (workflowDetails?.data?.processInstances?.length > 0) {
    let filteredActions = [];
    filteredActions = get(workflowDetails?.data?.processInstances[0], "nextActions", [])?.filter(
      item => item.action != "ADHOC"
    );
    let actions = orderBy(filteredActions, ["action"], ["desc"]);
    if ((!actions || actions?.length == 0) && workflowDetails?.data?.actionState) workflowDetails.data.actionState.nextActions = [];
  }

  if (workflowDetails?.data?.nextActions?.length > 0) {
    workflowDetails.data.nextActions = workflowDetails?.data?.nextActions?.filter(actn => actn.action !== "INITIATE");
    workflowDetails.data.nextActions = workflowDetails?.data?.nextActions?.filter(actn => actn.action !== "ADHOC");
  };

  if (rolearray) {
    workflowDetails?.data?.nextActions?.forEach(action => {
      if (action?.action === "PAY") {
        action.redirectionUrll = {
          pathname: `${getBusinessServices(data?.applicationData?.businessService, data?.applicationData?.status)}/${data?.applicationData?.applicationNo}/${tenantId}?tenantId=${tenantId}`,
          state: tenantId
        }
      }
    })
  };

  let dowloadOptions = [];

  if (data?.collectionBillDetails?.length > 0) {
    const bpaPayments = cloneDeep(data?.collectionBillDetails);
    bpaPayments.forEach(pay => {
      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_OC_APP_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_APP_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_OC_SAN_FEE") {
        dowloadOptions.push({
          order: 2,
          label: t("BPA_OC_DEV_PEN_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.LOW_RISK_PERMIT_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_APP_FEE") {
        dowloadOptions.push({
          order: 1,
          label: t("BPA_APP_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }

      if (pay?.paymentDetails[0]?.businessService === "BPA.NC_SAN_FEE") {
        dowloadOptions.push({
          order: 2,
          label: t("BPA_SAN_FEE_RECEIPT"),
          onClick: () => getRecieptSearch({ tenantId: data?.applicationData?.tenantId, payments: pay, consumerCodes: data?.applicationData?.applicationNo }),
        });
      }
    })
  }


  if (data && data?.applicationData?.businessService === "BPA_LOW" && data?.collectionBillDetails?.length > 0) {
    !(data?.applicationData?.status.includes("REVOCATION")) && dowloadOptions.push({
      order: 3,
      label: t("BPA_PERMIT_ORDER"),
      onClick: () => getPermitOccupancyOrderSearch({ tenantId: data?.applicationData?.tenantId }, "buildingpermit-low"),
    });
    (data?.applicationData?.status.includes("REVOCATION")) && dowloadOptions.push({
      order: 3,
      label: t("BPA_REVOCATION_PDF_LABEL"),
      onClick: () => getRevocationPDFSearch({ tenantId: data?.applicationData?.tenantId }),
    });

  } else if (data && data?.applicationData?.businessService === "BPA" && data?.collectionBillDetails?.length > 0) {
    if (data?.applicationData?.status === "APPROVED") {
      dowloadOptions.push({
        order: 3,
        label: t("BPA_PERMIT_ORDER"),
        onClick: () => getPermitOccupancyOrderSearch({ tenantId: data?.applicationData?.tenantId }, "buildingpermit"),
      });
    }
  } else {
    if (data?.applicationData?.status === "APPROVED") {
      dowloadOptions.push({
        order: 3,
        label: t("BPA_OC_CERTIFICATE"),
        onClick: () => getPermitOccupancyOrderSearch({ tenantId: data?.applicationData?.tenantId }, "occupancy-certificate"),
      });
    }
  }

  if (data?.comparisionReport && data && data?.applicationData?.businessService === "BPA_OC") {
    dowloadOptions.push({
      order: 4,
      label: t("BPA_COMPARISON_REPORT_LABEL"),
      onClick: () => window.open(data?.comparisionReport?.comparisonReport, "_blank"),
    });
  }

  dowloadOptions.sort(function (a, b) { return a.order - b.order; });

  if (workflowDetails?.data?.nextActions?.length > 0) {
    workflowDetails.data.nextActions = workflowDetails?.data?.nextActions?.filter(actn => actn.action !== "SKIP_PAYMENT");
  };

  if (workflowDetails?.data?.nextActions?.length > 0) {
    workflowDetails.data.nextActions = workflowDetails?.data?.nextActions?.filter(actn => actn.action !== "SKIP_PAYMENT");
  };

  const results = data?.applicationDetails?.filter(element => {
    if (Object.keys(element).length !== 0) {
      return true;
    }
    return false;
  });

  data.applicationDetails = results;

  const toggleTimeline = () => {
    setShowAllTimeline((prev) => !prev);
  };

  const getMainDivStyles = () => {
    if (
      window.location.href.includes("employee/obps") ||
      window.location.href.includes("employee/noc") ||
      window.location.href.includes("employee/ws")
    ) {
      return { lineHeight: "19px", maxWidth: "950px", minWidth: "280px" };
    } else if (true) {
      return { lineHeight: "19px", maxWidth: "600px", minWidth: "280px" };
    } else {
      return {};
    }
  };

  const getTableStyles = () => {
    if (window.location.href.includes("employee/obps") || window.location.href.includes("employee/noc")) {
      return { position: "relative", marginTop: "19px" };
    } else if (true) {
      return { position: "relative", marginTop: "19px" };
    } else {
      return {};
    }
  };

  const getTextValue = (value) => {
    if (value?.skip) return value.value;
    else if (value?.isUnit) return value?.value ? `${getTranslatedValues(value?.value, value?.isNotTranslated)} ${t(value?.isUnit)}` : t("N/A");
    else return value?.value ? getTranslatedValues(value?.value, value?.isNotTranslated) : t("N/A");
  };

  const getTranslatedValues = (dataValue, isNotTranslated) => {
    if (dataValue) {
      return !isNotTranslated ? t(dataValue) : dataValue;
    } else {
      return t("NA");
    }
  };

  const getRowStyles = () => {
    if (window.location.href.includes("employee/obps") || window.location.href.includes("employee/noc")) {
      return { justifyContent: "space-between", fontSize: "16px", lineHeight: "19px", color: "#0B0C0C" };
    } else if (checkLocation) {
      return { justifyContent: "space-between", fontSize: "16px", lineHeight: "19px", color: "#0B0C0C" };
    } else {
      return {};
    }
  };


  function setOtherChargesVal(value) {
    if (/^[0-9]*$/.test(value)) {
      setOtherCharges(value);
      sessionStorage.setItem("otherCharges", value);
    } else {
      alert(t("Please enter numbers"));
    }
  }

  function setDevelopmentVal(value) {
    if (/^\d{0,10}$/.test(value)) {
      setDevelopment(value);
      sessionStorage.setItem("development", value);
    } else {
      alert(t("Please enter numbers"));
    }
  }

  function setLessAdjusmentVal(value) {
    if (/^[0-9]*$/.test(value)) {
      if (
        parseInt(value) >
        (parseInt(development) ? parseInt(development) : 0) +
        (parseInt(otherCharges) ? parseInt(otherCharges) : 0) +
        parseInt(malbafees) +
        parseInt(labourCess) +
        parseInt(waterCharges) +
        parseInt(gaushalaFees)
      ) {
        alert(t("Less adjustment fees cannot be grater than Total of other P2 fees"));
      } else {
        setLessAdjusment(value);
        sessionStorage.setItem("lessAdjusment", value);
      }
    } else {
      alert(t("Please enter numbers"));
    }
  }

  function setOtherChargesDis(value) {
    setOtherChargesDisc(value);
    // sessionStorage.setItem("otherChargesDisc", value);
  }
  function OpenImage(imageSource, index, thumbnailsToShow) {
    window.open(thumbnailsToShow?.fullImage?.[0], "_blank");
  }

  const getTimelineCaptions = (checkpoint, index = 0, timeline) => {
    const privacy = {
      uuid: checkpoint?.assignes?.[0]?.uuid,
      fieldName: "mobileNumber",
      model: "User",
      showValue: false,
      loadData: {
        serviceName: "/egov-workflow-v2/egov-wf/process/_search",
        requestBody: {},
        requestParam: { tenantId: data?.tenantId, businessIds: data?.applicationNo, history: true },
        jsonPath: "ProcessInstances[0].assignes[0].mobileNumber",
        isArray: false,
        d: (res) => {
          let resultstring = "";
          resultstring = `+91 ${_.get(res, `ProcessInstances[${index}].assignes[0].mobileNumber`)}`;
          return resultstring;
        },
      },
    };
    const previousCheckpoint = timeline?.[index - 1];
    const caption = {
      date: checkpoint?.auditDetails?.lastModified,
      name: checkpoint?.assignes?.[0]?.name,
      // mobileNumber: applicationData?.processInstance?.assignes?.[0]?.uuid === checkpoint?.assignes?.[0]?.uuid && applicationData?.processInstance?.assignes?.[0]?.mobileNumber
      //     ? applicationData?.processInstance?.assignes?.[0]?.mobileNumber
      //     : checkpoint?.assignes?.[0]?.mobileNumber,
      comment: t(checkpoint?.comment),
      wfComment: previousCheckpoint ? previousCheckpoint?.wfComment : [],
      thumbnailsToShow: checkpoint?.thumbnailsToShow,
    };

    return <TLCaption data={caption} OpenImage={OpenImage} privacy={privacy} />;
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  function onActionSelect(action) {
    console.log("SelectedAction", action)
    if (action) {
      if (action?.action == "EDIT PAY 2" && window.location.href.includes("bpa")) {
        window.location.assign(window.location.href.split("bpa")[0] + "editApplication/bpa" + window.location.href.split("bpa")[1]);
      }
      else if (action?.redirectionUrll) {
        window.location.assign(`${window.location.origin}/digit-ui/employee/payment/collect/${action?.redirectionUrll?.pathname}`);
      } else if (!action?.redirectionUrl && action?.action != "EDIT PAY 2") {
        console.log("SelectedAction 2", action, !action?.redirectionUrl && action?.action != "EDIT PAY 2")
        setShowModal(true);
      } else {
        history.push({
          pathname: action.redirectionUrl?.pathname,
          state: { ...action.redirectionUrl?.state },
        });
      }
    }
    setSelectedAction(action);
    setDisplayMenu(false);
  }

  const submitAction = async (data, nocData = false, isOBPS = {}) => {
    console.log("SelectedActionData", data);
    if (data?.BPA?.comment?.length == 0) {
      alert(t("Please fill in the comments before submitting"))
    }
    else if (data?.BPA?.businessService == "BPA" && !data?.BPA?.additionalDetails?.blockingReason && data?.BPA?.workflow?.action == "BLOCK") {
      alert(t("Please select Blocking reason"))
    }
    else {
      setIsEnableLoader(true);
      if (typeof data?.customFunctionToExecute === "function") {
        data?.customFunctionToExecute({ ...data });
      }
      if (nocData !== false && nocMutation) {
        const nocPrmomises = nocData?.map((noc) => {
          return nocMutation?.mutateAsync(noc);
        });
        try {
          setIsEnableLoader(true);
          const values = await Promise.all(nocPrmomises);
          values &&
            values.map((ob) => {
              Digit.SessionStorage.del(ob?.Noc?.[0]?.nocType);
            });
        } catch (err) {
          setIsEnableLoader(false);
          let errorValue = err?.response?.data?.Errors?.[0]?.code
            ? t(err?.response?.data?.Errors?.[0]?.code)
            : err?.response?.data?.Errors?.[0]?.message || err;
          closeModal();
          setShowToast({ key: "error", error: { message: errorValue } });
          setTimeout(closeToast, 5000);
          return;
        }
      }
      if (mutate) {
        setIsEnableLoader(true);
        mutate({
          ...data,
          BPA: {
            ...data?.BPA,
            additionalDetails: {
              ...data?.BPA?.additionalDetails,
              otherFeesDiscription: otherChargesDisc || "",
              adjustedAmounts: adjustedAmounts || [],
              selfCertificationCharges: {
                ...data?.BPA?.additionalDetails?.selfCertificationCharges,
                BPA_MALBA_CHARGES: malbafees?.length > 0 ? malbafees : "0",
                BPA_LABOUR_CESS: labourCess?.length > 0 ? labourCess : "0",
                BPA_WATER_CHARGES: waterCharges?.length > 0 ? waterCharges : "0",
                BPA_GAUSHALA_CHARGES_CESS: gaushalaFees?.length > 0 ? gaushalaFees : "0",
                BPA_LESS_ADJUSMENT_PLOT: lessAdjusment?.length > 0 ? lessAdjusment : "0",
                BPA_DEVELOPMENT_CHARGES: development?.length > 0 ? development : "0",
                BPA_OTHER_CHARGES: otherCharges?.length > 0 ? otherCharges : "0"
              }
            }
          }
        }, {
          onError: (error, variables) => {
            setIsEnableLoader(false);
            setShowToast({ key: "error", error });
            setTimeout(closeToast, 5000);
          },
          onSuccess: (data, variables) => {
            sessionStorage.removeItem("WS_SESSION_APPLICATION_DETAILS");
            setIsEnableLoader(false);
            if (isOBPS?.bpa) {
              data.selectedAction = selectedAction;
              history.replace(`/digit-ui/employee/obps/response`, { data: data });
            }
            if (isOBPS?.isNoc) {
              history.push(`/digit-ui/employee/noc/response`, { data: data });
            }
            if (data?.Amendments?.length > 0) {
              if (variables?.AmendmentUpdate?.workflow?.action.includes("SEND_BACK")) {
                setShowToast({ key: "success", label: t("ES_MODIFYSWCONNECTION_SEND_BACK_UPDATE_SUCCESS") })
              } else if (variables?.AmendmentUpdate?.workflow?.action.includes("RE-SUBMIT")) {
                setShowToast({ key: "success", label: t("ES_MODIFYSWCONNECTION_RE_SUBMIT_UPDATE_SUCCESS") })
              } else if (variables?.AmendmentUpdate?.workflow?.action.includes("APPROVE")) {
                setShowToast({ key: "success", label: t("ES_MODIFYSWCONNECTION_APPROVE_UPDATE_SUCCESS") })
              }
              else if (variables?.AmendmentUpdate?.workflow?.action.includes("REJECT")) {
                setShowToast({ key: "success", label: t("ES_MODIFYWSCONNECTION_REJECT_UPDATE_SUCCESS") })
              }
              return
            }
            if (data?.Licenses?.length > 0 && data?.Licenses[0]?.applicationNumber) {
              if (data?.Licenses[0]?.businessService?.includes("BPAREG")) {
                setShowToast({ key: "success", action: selectedAction });
                data.selectedAction = selectedAction;
                history.push(`/digit-ui/employee/obps/stakeholder-response`, { data: data });
                return;
              }
              setShowToast({ key: "success", action: selectedAction });
              history.replace(`/digit-ui/employee/tl/application-details/${data?.Licenses[0]?.applicationNumber}`);
              return;
            }
            setShowToast({ key: "success", action: selectedAction });
            clearDataDetails && setTimeout(clearDataDetails, 3000);
            setTimeout(closeToast, 5000);
            queryClient.clear();
            queryClient.refetchQueries("APPLICATION_SEARCH");
            //push false status when reject

          },
        });
      }
      closeModal();
    }

  };

  let isSingleButton = false;
  let isMenuBotton = false;
  let actions = workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
    return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
  }) || workflowDetails?.data?.nextActions?.filter((e) => {
    return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
  });
  if (((window.location.href.includes("/obps") || window.location.href.includes("/noc")) && actions?.length == 1) || (actions?.[0]?.redirectionUrl?.pathname.includes("/pt/property-details/")) && actions?.length == 1) {
    isMenuBotton = false;
    isSingleButton = true;
  } else if (actions?.length > 0) {
    isMenuBotton = true;
    isSingleButton = false;
  }

  if (isLoading || bpaDocsLoading || isEnableLoader) return (<Loader />)

  const timelineStatusPrefix = workflowDetails?.data?.applicationBusinessService;
  const statusAttribute = "status"

  return (
    <Fragment>
      <div className={"employee-main-application-details"}>
        <div className={"employee-application-details"} style={{ marginBottom: "15px" }}>
          <Header styles={{ marginLeft: "0px", paddingTop: "10px", fontSize: "32px" }}>{t("CS_TITLE_APPLICATION_DETAILS")}</Header>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "nowrap" }}>
            <div style={{}}>
              {dowloadOptions && dowloadOptions.length > 0 && <MultiLink
                className="multilinkWrapper"
                onHeadClick={() => setShowOptions(!showOptions)}
                displayOptions={showOptions}
                options={dowloadOptions}
                downloadBtnClassName={"employee-download-btn-className"}
                optionsClassName={"employee-options-btn-className"}
              />}
            </div>
            <LinkButton label={t("VIEW_TIMELINE")} style={{ color: "#A52A2A" }} onClick={handleViewTimeline}></LinkButton>
          </div>
        </div>
        {/* <ApplicationDetailsTemplate
        applicationDetails={data}
        isLoading={isLoading}
        isDataLoading={isLoading}
        applicationData={data?.applicationData}
        nocMutation={nocMutation}
        mutate={mutate}
        id={"timeline"}
        workflowDetails={workflowDetails}
        businessService={workflowDetails?.data?.applicationBusinessService ? workflowDetails?.data?.applicationBusinessService : data?.applicationData?.businessService}
        moduleCode="BPA"
        showToast={showToast}
        ActionBarStyle={isMobile?{}:{paddingRight:"50px"}}
        MenuStyle={isMobile?{}:{right:"50px"}}
        setShowToast={setShowToast}
        closeToast={closeToast}
        statusAttribute={"state"}
        timelineStatusPrefix={`WF_${workflowDetails?.data?.applicationBusinessService ? workflowDetails?.data?.applicationBusinessService : data?.applicationData?.businessService}_`}
      /> */}

        <Card>
          {data?.applicationDetails?.map((detail, index) => (
            <React.Fragment key={index}>
              <div style={getMainDivStyles()}>
                {index === 0 && !detail.asSectionHeader ? (
                  <CardSubHeader style={{ marginBottom: "16px", fontSize: "24px" }}>{t(detail.title)}</CardSubHeader>
                ) : (
                  <React.Fragment>
                    <CardSectionHeader
                      style={
                        index == 0 && checkLocation
                          ? { marginBottom: "16px", fontSize: "24px" }
                          : { marginBottom: "16px", marginTop: "32px", fontSize: "24px" }
                      }
                    >
                      {t(detail?.title)}
                      {detail?.Component ? <detail.Component /> : null}
                    </CardSectionHeader>
                  </React.Fragment>
                )}
                {detail?.isTable && (
                  <table style={{ tableLayout: "fixed", width: "100%", borderCollapse: "collapse" }}>
                    <tr style={{ textAlign: "left" }}>
                      {detail?.headers.map((header) => (
                        <th style={{ padding: "10px", paddingLeft: "0px" }}>{t(header)}</th>
                      ))}
                    </tr>

                    {detail?.tableRows.map((row, index) => {
                      if (index === detail?.tableRows.length - 1) {
                        return (
                          <>
                            <hr style={{ width: "370%", marginTop: "15px" }} className="underline" />
                            <tr>
                              {row.map((element) => (
                                <td style={{ textAlign: "left" }}>{t(element)}</td>
                              ))}
                            </tr>
                          </>
                        );
                      }
                      return (
                        <tr>
                          {row.map((element) => (
                            <td style={{ paddingTop: "20px", textAlign: "left" }}>{t(element)}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </table>
                )}
                <StatusTable style={getTableStyles()}>
                  {detail?.title &&
                    !detail?.title.includes("NOC") &&
                    detail?.values?.map((value, index) => {
                      if (value.map === true && value.value !== "N/A") {
                        return (
                          <Row
                            labelStyle={{ wordBreak: "break-all" }}
                            textStyle={{ wordBreak: "break-all" }}
                            key={t(value.title)}
                            label={t(value.title)}
                            text={<img src={t(value.value)} alt="" privacy={value?.privacy} />}
                          />
                        );
                      }
                      if (value?.isLink == true) {
                        return (
                          <Row
                            key={t(value.title)}
                            label={
                              window.location.href.includes("tl") || window.location.href.includes("ws") ? (
                                <div style={{ width: "200%" }}>
                                  <Link to={value?.to}>
                                    <span className="link" style={{ color: "#a82227" }}>
                                      {t(value?.title)}
                                    </span>
                                  </Link>
                                </div>
                              ) : isNocLocation || isBPALocation ? (
                                `${t(value.title)}`
                              ) : (
                                t(value.title)
                              )
                            }
                            text={
                              <div>
                                <Link to={value?.to}>
                                  <span className="link" style={{ color: "#a82227" }}>
                                    {value?.value}
                                  </span>
                                </Link>
                              </div>
                            }
                            last={index === detail?.values?.length - 1}
                            caption={value.caption}
                            className="border-none"
                            rowContainerStyle={getRowStyles()}
                            labelStyle={{ wordBreak: "break-all" }}
                            textStyle={{ wordBreak: "break-all" }}
                          />
                        );
                      }
                      return (
                        <div>
                          {window.location.href.includes("modify") ? (
                            <Row
                              className="border-none"
                              key={`${value.title}`}
                              label={`${t(`${value.title}`)}`}
                              privacy={value?.privacy}
                              text={value?.oldValue ? value?.oldValue : value?.value ? value?.value : ""}
                              labelStyle={{ wordBreak: "break-all" }}
                              textStyle={{ wordBreak: "break-all" }}
                            />
                          ) : (
                            <Row
                              key={t(value.title)}
                              label={t(value.title)}
                              text={getTextValue(value)}
                              last={index === detail?.values?.length - 1}
                              caption={value.caption}
                              className="border-none"
                              /* privacy object set to the Row Component */
                              privacy={value?.privacy}
                              // TODO, Later will move to classes
                              rowContainerStyle={getRowStyles()}
                              labelStyle={{ wordBreak: "break-all" }}
                              textStyle={{ wordBreak: "break-all" }}
                            />
                          )}
                          {value.title === "PT_TOTAL_DUES" ? <ArrearSummary bill={fetchBillData.Bill?.[0]} /> : ""}
                        </div>
                      );
                    })}
                </StatusTable>
              </div>
              {detail?.belowComponent && <detail.belowComponent />}
              {detail?.additionalDetails?.inspectionReport && (
                <ScruntinyDetails
                  scrutinyDetails={detail?.additionalDetails}
                  // paymentsList={paymentsList}
                  additionalDetails={data?.applicationData?.additionalDetails}
                  applicationData={data?.applicationData}
                />
              )}
              {detail?.additionalDetails?.owners && <PropertyOwners owners={detail?.additionalDetails?.owners} />}

              {detail?.additionalDetails?.obpsDocuments && (
                <div>
                  {/* <BPADocuments
                t={t}
                applicationData={data?.applicationData}
                docs={detail.additionalDetails.obpsDocuments}
                bpaActionsDetails={workflowDetails}
              /> */}
                  <StatusTable>
                    <CardHeader>{t("BPA_DOCUMENT_DETAILS_LABEL")}</CardHeader>
                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                    {pdfLoading ? <Loader /> : <Table
                      className="customTable table-border-style"
                      t={t}
                      data={documentsData}
                      columns={documentsColumns}
                      getCellProps={() => ({ style: {} })}
                      disableSort={false}
                      autoSort={true}
                      manualPagination={false}
                      isPaginationRequired={false}
                    />}
                  </StatusTable>
                  <StatusTable>
                    <CardHeader>{t("BPA_ECBC_DETAILS_LABEL")}</CardHeader>
                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                    {(pdfLoading || isFileLoading) ? <Loader /> : <Table
                      className="customTable table-border-style"
                      t={t}
                      data={ecbcDocumentsData}
                      columns={documentsColumns}
                      getCellProps={() => ({ style: {} })}
                      disableSort={false}
                      autoSort={true}
                      manualPagination={false}
                      isPaginationRequired={false}
                    />}
                  </StatusTable>
                  <StatusTable>
                    <CardHeader>{t("BPA_OWNER_DETAILS_LABEL")}</CardHeader>
                    <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
                    {(pdfLoading || isOwnerFileLoading) ? <Loader /> : <Table
                      className="customTable table-border-style"
                      t={t}
                      data={ownerDocumentsData}
                      columns={documentsColumns}
                      getCellProps={() => ({ style: {} })}
                      disableSort={false}
                      autoSort={true}
                      manualPagination={false}
                      isPaginationRequired={false}
                    />}
                  </StatusTable>
                </div>
              )}

              {detail?.additionalDetails?.scruntinyDetails && <ScruntinyDetails scrutinyDetails={detail?.additionalDetails} />}
              {detail?.additionalDetails?.buildingExtractionDetails && <ScruntinyDetails scrutinyDetails={detail?.additionalDetails} />}
              {detail?.additionalDetails?.subOccupancyTableDetails && (
                <SubOccupancyTable edcrDetails={detail?.additionalDetails} applicationData={data?.applicationData} />
              )}
              {detail?.additionalDetails?.documentsWithUrl && <DocumentsPreview documents={detail?.additionalDetails?.documentsWithUrl} />}
              {detail?.additionalDetails?.redirectUrl && (
                <div style={{ fontSize: "16px", lineHeight: "24px", fontWeight: "400", padding: "10px 0px" }}>
                  <Link to={detail?.additionalDetails?.redirectUrl?.url}>
                    <span className="link" style={{ color: "#a82227" }}>
                      {detail?.additionalDetails?.redirectUrl?.title}
                    </span>
                  </Link>
                </div>
              )}

            </React.Fragment>
          ))}


        </Card>

        <Card>
          {workflowDetails?.data?.timeline?.length > 0 && (
            <React.Fragment>
              <BreakLine />
              {(workflowDetails?.isLoading || isLoading) && <Loader />}
              {!workflowDetails?.isLoading && !isLoading && (
                <Fragment>
                  <div id="timeline">
                    <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>
                      {t("ES_APPLICATION_DETAILS_APPLICATION_TIMELINE")}
                    </CardSectionHeader>
                    {workflowDetails?.data?.timeline && workflowDetails?.data?.timeline?.length === 1 ? (
                      <CheckPoint
                        isCompleted={true}
                        label={t(`${timelineStatusPrefix}${workflowDetails?.data?.timeline[0]?.state}`)}
                        customChild={getTimelineCaptions(workflowDetails?.data?.timeline[0], workflowDetails?.data?.timeline)}
                      />
                    ) : (
                      <ConnectingCheckPoints>
                        {workflowDetails?.data?.timeline &&
                          workflowDetails?.data?.timeline
                            .slice(0, showAllTimeline ? workflowDetails?.data.timeline.length : 2)
                            .map((checkpoint, index, arr) => {
                              let timelineStatusPostfix = "";
                              if (window.location.href.includes("/obps/")) {
                                if (
                                  workflowDetails?.data?.timeline[index - 1]?.state?.includes("BACK_FROM") ||
                                  workflowDetails?.data?.timeline[index - 1]?.state?.includes("SEND_TO_CITIZEN")
                                )
                                  timelineStatusPostfix = `_NOT_DONE`;
                                else if (checkpoint?.performedAction === "SEND_TO_ARCHITECT") timelineStatusPostfix = `_BY_ARCHITECT_DONE`;
                                else timelineStatusPostfix = index == 0 ? "" : `_DONE`;
                              }

                              return (
                                <React.Fragment key={index}>
                                  <CheckPoint
                                    keyValue={index}
                                    isCompleted={index === 0}
                                    info={checkpoint.comment}
                                    label={t(
                                      `${timelineStatusPrefix}${checkpoint?.performedAction === "REOPEN" ? checkpoint?.performedAction : checkpoint?.[statusAttribute]
                                      }${timelineStatusPostfix}`
                                    )}
                                    customChild={getTimelineCaptions(checkpoint, index, workflowDetails?.data?.timeline)}
                                  />
                                </React.Fragment>
                              );
                            })}
                      </ConnectingCheckPoints>
                    )}
                    {workflowDetails?.data?.timeline?.length > 2 && (
                      <LinkButton label={showAllTimeline ? t("COLLAPSE") : t("VIEW_TIMELINE")} onClick={toggleTimeline}></LinkButton>
                    )}
                  </div>
                </Fragment>
              )}
            </React.Fragment>
          )}
        </Card>

        <Card style={{ padding: "20px", marginBottom: "30px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0", background: "#fff" }} >
          {/* <CardSubHeader style={{fontSize:"20px", color:"#3f4351"}}>{t("BPA_P2_SUMMARY_FEE_EST_MANUAL")}</CardSubHeader>
           <hr style={{ border: "0.5px solid #eaeaea", margin: "0 0 16px 0" }} />
          <CardLabel>{t("BPA_COMMON_DEVELOPMENT_AMT")}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="development"
            defaultValue={data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_DEVELOPMENT_CHARGES}
            value={development}
            onChange={(e) => {
              setDevelopmentVal(e.target.value);
            }}
            {...{ required: true, pattern: "^[0-9]*$" }}
          />
          <CardLabel>{t("BPA_COMMON_OTHER_AMT")}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="otherCharges"
            defaultValue={data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_OTHER_CHARGES}
            value={otherCharges}
            onChange={(e) => {
              setOtherChargesVal(e.target.value);
            }}
            {...{ required: true, pattern: /^[0-9]*$/ }}
          />
          {parseInt(otherCharges) > 0 ? (
            <div>
              <CardLabel>{t("BPA_COMMON_OTHER_AMT_DISCRIPTION")}</CardLabel>
              <TextArea
                t={t}
                type={"text"}
                name="otherChargesDiscription"
                defaultValue={data?.applicationData?.additionalDetails?.otherFeesDiscription}
                value={otherChargesDisc}
                onChange={(e) => {
                  setOtherChargesDis(e.target.value);
                }}
                {...{ required: true }}
              />
            </div>
          ) : null}
          <CardLabel>{t("BPA_COMMON_LESS_AMT")}</CardLabel>
          <TextInput
            t={t}
            type={"text"}
            isMandatory={false}
            optionKey="i18nKey"
            name="lessAdjusment"
            defaultValue={data?.applicationData?.additionalDetails?.selfCertificationCharges?.BPA_LESS_ADJUSMENT_PLOT}
            value={lessAdjusment}
            onChange={(e) => {
              setLessAdjusmentVal(e.target.value);
            }}
            {...{ required: true, pattern: "^[0-9]*$" }}
          /> */}
          {isLoading ? <Loader /> : <FeeEstimation
            data={data}
            currentStepData={{
              createdResponse: {
                ...(data?.applicationData || {})
              }
            }}
            development={development}
            otherCharges={otherCharges}
            lessAdjusment={lessAdjusment}
            otherChargesDisc={otherChargesDisc}
            labourCess={labourCess}
            gaushalaFees={gaushalaFees}
            malbafees={malbafees}
            waterCharges={waterCharges}
            adjustedAmounts={adjustedAmounts}
            setAdjustedAmounts={setAdjustedAmounts}
          />}
        </Card>

        {(showModal && !isLoadingg) ? (
          <BPAActionModal
            t={t}
            action={selectedAction}
            tenantId={tenantId}
            state={stateId}
            id={applicationNumber}
            applicationDetails={data}
            applicationData={data?.applicationData}
            closeModal={closeModal}
            submitAction={submitAction}
            actionData={workflowDetails?.data?.timeline}
            businessService={workflowDetails?.data?.applicationBusinessService ? workflowDetails?.data?.applicationBusinessService : data?.applicationData?.businessService}
            workflowDetails={workflowDetails}
            moduleCode={"BPA"}
            blockReason={blockReason?.BPA?.BlockReason}
          />
        ) : null}


        {!workflowDetails?.isLoading && isMenuBotton && !isSingleButton && (
          <ActionBar >
            {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
              <Menu
                localeKeyPrefix={`WF_EMPLOYEE_${(workflowDetails?.data?.applicationBusinessService ? workflowDetails?.data?.applicationBusinessService : data?.applicationData?.businessService)?.toUpperCase()}`}
                options={actions}
                optionKey={"action"}
                t={t}
                onSelect={onActionSelect}
              // style={MenuStyle}
              />
            ) : null}
            <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          </ActionBar>
        )}

        {data?.applicationData?.status === "FIELDINSPECTION_INPROGRESS" && (userInfo?.info?.roles.filter(role => role.code === "BPA_FIELD_INSPECTOR")).length > 0 && <FormComposer
          heading={t("")}
          isDisabled={!canSubmit}
          config={configs.map((config) => {
            return {
              ...config,
              body: config.body.filter((a) => {
                return !a.hideInEmployee;
              }),
              head: checkHead(config.head),
            };
          })}
          fieldStyle={{ marginRight: 0 }}
          submitInForm={false}
          defaultValues={defaultValues}
          onFormValueChange={onFormValueChange}
          breaklineStyle={{ border: "0px" }}
          className={"employeeCard-override"}
          cardClassName={"employeeCard-override"}
        />}
      </div>

    </Fragment>
  )
};

export default BpaApplicationDetail;