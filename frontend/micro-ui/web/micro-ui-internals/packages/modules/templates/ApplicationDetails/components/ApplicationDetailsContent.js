import {
  BreakLine,
  Card,
  CardSectionHeader,
  CardSubHeader,
  CheckPoint,
  ConnectingCheckPoints,
  Loader,
  Row,
  StatusTable,
} from "@egovernments/digit-ui-react-components";
import { values } from "lodash";
import React, { Fragment, useEffect,useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import BPADocuments from "./BPADocuments";
import InspectionReport from "./InspectionReport";
import NOCDocuments from "./NOCDocuments";
import PermissionCheck from "./PermissionCheck";
import PropertyDocuments from "./PropertyDocuments";
import PropertyEstimates from "./PropertyEstimates";
import PropertyFloors from "./PropertyFloors";
import PropertyOwners from "./PropertyOwners";
import ScruntinyDetails from "./ScruntinyDetails";
import SubOccupancyTable from "./SubOccupancyTable";
import TLCaption from "./TLCaption";
import TLTradeAccessories from "./TLTradeAccessories";
import TLTradeUnits from "./TLTradeUnits";
import WSAdditonalDetails from "./WSAdditonalDetails";
import WSFeeEstimation from "./WSFeeEstimation";
// import WSInfoLabel from "../../../ws/src/pageComponents/WSInfoLabel";
import DocumentsPreview from "./DocumentsPreview";
import InfoDetails from "./InfoDetails";
import ViewBreakup from"./ViewBreakup";
import ArrearSummary from "../../../common/src/payments/citizen/bills/routes/bill-details/arrear-summary"
function ApplicationDetailsContent({
  applicationDetails,
  workflowDetails,
  isDataLoading,
  applicationData,
  businessService,
  timelineStatusPrefix,
  showTimeLine = true,
  statusAttribute = "status",
  paymentsList,
  oldValue,
  isInfoLabel = false
}) {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);
  const [financialYears, setFinancialYears] = useState([]);
  const isCitizen = window.location.href.includes("citizen");
  const { isLoading: financialYearsLoading, data: financialYearsData } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "egf-master", [
    { name: "FinancialYear", filter: "[?(@.module == 'PT')]" },
  ]);
  const currentPropertyId = applicationDetails?.applicationData?.propertyId || propertyId;
  const isPTLocation = window.location.href.includes("/pt/");
  const { data: propertySearchData, revalidate: revalidatePropertySearch } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { propertyIds: currentPropertyId },
    },
    {
      enabled: Boolean(isPTLocation && currentPropertyId),
    }
  );

  // refetch property search on page load (and whenever the property id becomes available)
  useEffect(() => {
    if (isPTLocation && currentPropertyId) revalidatePropertySearch();
  }, [currentPropertyId]);

  useEffect(() => {
    if (financialYearsData?.["egf-master"]?.["FinancialYear"]) {
      const sorted = [...financialYearsData["egf-master"]["FinancialYear"]].sort((a, b) => b.startingDate - a.startingDate);
      setFinancialYears(sorted);
    }
  }, [financialYearsData]);
  let isEditApplication = window.location.href.includes("editApplication") && window.location.href.includes("bpa");
  const ownersSequences = applicationDetails?.applicationData?.owners;

  function routeTo(jumpTo) {
    window.open(jumpTo, "_blank");
  }

  const documentsColumns = [
    {
      Header: t("BPA_DOCUMENT_DETAILS_LABEL"),
      accessor: "title",
      Cell: ({ value }) => t(value) || t("CS_NA"),
    },
    {
      Header: t(" "),
      accessor: "url",
      Cell: ({ value }) =>
        value ? <LinkButton style={{ float: "right", display: "inline" }} label={t("View")} onClick={() => routeTo(value)} /> : t("CS_NA"),
    },
  ];

  console.log("TIMELINE", applicationDetails, moduleCode);
  // ISSUE 9 FIX: Fetch payment history for WS applications
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (window.location.href.includes("employee/ws") && applicationData?.connectionNo) {
        try {
          // Determine businessService from serviceType (handle both SEWERAGE and SEWARAGE typo)
          const businessService = applicationData?.serviceType === "SEWERAGE" || applicationData?.serviceType === "SEWARAGE" ? "SW" : "WS";

          const requestParams = {
            tenantId: applicationData?.tenantId || tenantId,
            filters: {
              consumerCodes: applicationData?.connectionNo,
              consumerCode: applicationData?.connectionNo,
            },
            BusinessService: businessService,
          };

          const paymentData = await Digit.WSService.paymentsearch(requestParams);
          if (Array.isArray(paymentData) && paymentData.length > 0) {
            setPayments(paymentData);
          } else if (paymentData?.Payments && paymentData.Payments.length > 0) {
            setPayments(paymentData.Payments);
          }
        } catch (error) {
          console.error("❌ Payment fetch error:", error);
        }
      }
    };
    fetchPaymentHistory();
  }, [applicationData?.connectionNo, applicationData?.serviceType, tenantId]);

  function OpenImage(imageSource, index, thumbnailsToShow) {
    window.open(thumbnailsToShow?.fullImage?.[0], "_blank");
  }

  const [fetchBillData, updatefetchBillData] = useState({});
  const setBillData = async (tenantId, propertyIds, updatefetchBillData, updateCanFetchBillData) => {
    const assessmentData = await Digit.PTService.assessmentSearch({ tenantId, filters: { propertyIds } });
    let billData = {};
    if (assessmentData?.Assessments?.length > 0) {
      billData = await Digit.PaymentService.fetchBill(tenantId, {
        businessService: "PT",
        consumerCode: propertyIds,
      });
    }
    updatefetchBillData(billData);
    updateCanFetchBillData({
      loading: false,
      loaded: true,
      canLoad: true,
    });
  };
  const [billData, updateCanFetchBillData] = useState({
    loading: false,
    loaded: false,
    canLoad: false,
  });

  if (applicationData?.status == "ACTIVE" && !billData.loading && !billData.loaded && !billData.canLoad) {
    updateCanFetchBillData({
      loading: false,
      loaded: false,
      canLoad: true,
    });
  }
  if (billData?.canLoad && !billData.loading && !billData.loaded) {
    updateCanFetchBillData({
      loading: true,
      loaded: false,
      canLoad: true,
    });
    setBillData(applicationData?.tenantId || tenantId, applicationData?.propertyId, updatefetchBillData, updateCanFetchBillData);
  }
  const convertEpochToDateDMY = (dateEpoch) => {
    if (dateEpoch == null || dateEpoch == undefined || dateEpoch == "") {
      return "NA";
    }
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
  };
  const getTimelineCaptions = (checkpoint,index=0) => {
    if (checkpoint.state === "OPEN" || (checkpoint.status === "INITIATED" && !window.location.href.includes("/obps/"))) {
      const caption = {
        date: convertEpochToDateDMY(applicationData?.auditDetails?.createdTime),
        source: applicationData?.channel || "",
      };
      return <TLCaption data={caption} />;
    } else if (window.location.href.includes("/obps/") || window.location.href.includes("/noc/") || window.location.href.includes("/ws/")) {
      //From BE side assigneeMobileNumber is masked/unmasked with connectionHoldersMobileNumber and not assigneeMobileNumber
      const privacy = { uuid: checkpoint?.assignes?.[0]?.uuid, fieldName: "mobileNumber", model: "User",showValue: false,
      loadData: {
        serviceName: "/egov-workflow-v2/egov-wf/process/_search",
        requestBody: {},
        requestParam: { tenantId : applicationDetails?.tenantId, businessIds : applicationDetails?.applicationNo, history:true },
        jsonPath: "ProcessInstances[0].assignes[0].mobileNumber",
        isArray: false,
        d: (res) => {
          let resultstring = "";
          resultstring = `+91 ${_.get(res,`ProcessInstances[${index}].assignes[0].mobileNumber`)}`;
          return resultstring;
        }
      }, }
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        name: checkpoint?.assignes?.[0]?.name,
        mobileNumber:applicationData?.processInstance?.assignes?.[0]?.uuid===checkpoint?.assignes?.[0]?.uuid && applicationData?.processInstance?.assignes?.[0]?.mobileNumber ? applicationData?.processInstance?.assignes?.[0]?.mobileNumber: checkpoint?.assignes?.[0]?.mobileNumber,
        comment: t(checkpoint?.comment),
        wfComment: checkpoint.wfComment,
        thumbnailsToShow: checkpoint?.thumbnailsToShow,
      };
      return <TLCaption data={caption} OpenImage={OpenImage} privacy={privacy} />;
    } else {
      const caption = {
        date: convertEpochToDateDMY(applicationData?.auditDetails?.lastModifiedTime),
        // name: checkpoint?.assigner?.name,
        name: checkpoint?.assignes?.[0]?.name,
        // mobileNumber: checkpoint?.assigner?.mobileNumber,
        wfComment: checkpoint?.wfComment,
        mobileNumber: checkpoint?.assignes?.[0]?.mobileNumber,
      };
      return <TLCaption data={caption} />;
    }
  };

  const getTranslatedValues = (dataValue, isNotTranslated) => {
    if (dataValue) {
      return !isNotTranslated ? t(dataValue) : dataValue;
    } else {
      return t("NA");
    }
  };

  const checkLocation =
    window.location.href.includes("employee/tl") || window.location.href.includes("employee/obps") || window.location.href.includes("employee/noc");
  const isNocLocation = window.location.href.includes("employee/noc");
  const isBPALocation = window.location.href.includes("employee/obps");
  const isWS = window.location.href.includes("employee/ws");

  const getRowStyles = () => {
    if (window.location.href.includes("employee/obps") || window.location.href.includes("employee/noc")) {
      return { justifyContent: "space-between", fontSize: "16px", lineHeight: "19px", color: "#0B0C0C" };
    } else if (checkLocation) {
      return { justifyContent: "space-between", fontSize: "16px", lineHeight: "19px", color: "#0B0C0C" };
    } else {
      return {};
    }
  };

  const getTableStyles = () => {
    if (window.location.href.includes("employee/obps") || window.location.href.includes("employee/noc")) {
      return { position: "relative", marginTop: "19px" };
    } else if (checkLocation) {
      return { position: "relative", marginTop: "19px" };
    } else {
      return {};
    }
  };

  const getMainDivStyles = () => {
    if (
      window.location.href.includes("employee/obps") ||
      window.location.href.includes("employee/noc") ||
      window.location.href.includes("employee/ws")
    ) {
      return { lineHeight: "19px", maxWidth: "950px", minWidth: "280px" };
    } else if (checkLocation) {
      return { lineHeight: "19px", maxWidth: "600px", minWidth: "280px" };
    } else {
      return {};
    }
  };

  const getTextValue = (value) => {
    if (value?.skip) return value.value;
    else if (value?.isUnit) return value?.value ? `${getTranslatedValues(value?.value, value?.isNotTranslated)} ${t(value?.isUnit)}` : t("N/A");
    else return value?.value ? getTranslatedValues(value?.value, value?.isNotTranslated) : t("N/A");
  };

  const getClickInfoDetails = () => {
    if (window.location.href.includes("disconnection") || window.location.href.includes("application")) {
      return "WS_DISCONNECTION_CLICK_ON_INFO_LABEL"
    } else {
      return "WS_CLICK_ON_INFO_LABEL"
    }
  }

  const getClickInfoDetails1 = () => {
    if (window.location.href.includes("disconnection") || window.location.href.includes("application")) {
        return "WS_DISCONNECTION_CLICK_ON_INFO1_LABEL"
    } else {
      return "";
    }
  };
  const toggleTimeline = () => {
    setShowAllTimeline((prev) => !prev);
  };
  const totalDemandInterest = demandData?.reduce((sum, item) => sum + item.demandInterest, 0);
  const totalDemandPenality = demandData?.reduce((sum, item) => sum + item.demandPenality, 0);
  const totalCollectionTax = demandData?.reduce((sum, item) => sum + item.collectionTax, 0);
  const totalCollectionInterest = demandData?.reduce((sum, item) => sum + item.collectionInterest, 0);
  const totalCollectionPenality = demandData?.reduce((sum, item) => sum + item.collectionPenality, 0);
  const totalBalanceTax = demandData?.reduce((sum, item) => sum + item.balanceTax, 0);
  const totalBalanceInterest = demandData?.reduce((sum, item) => sum + item.balanceInterest, 0);
  const totalBalancePenality = demandData?.reduce((sum, item) => sum + item.balancePenality, 0);

  const closeToast = () => {
    setShowToast(null);
  };

  // (Redirect handled centrally in ApplicationDetails template on mutation success)

  // const PROPERTY_UPDATE_URL = "https://mseva-uat.lgpunjab.gov.in/property-services/property/_update?tenantId=pb.testing&propertyIds=PT-1012-2017548";
  const updatePropertyStatus = async (propertyData, status, propertyIds) => {
    const confirm = window.confirm(`Are you sure you want to make this property ${status}?`);
    if (!confirm) return;

    const payload = {
      ...propertyData,
      status: status,
      isactive: status === "ACTIVE",
      isinactive: status === "INACTIVE",
      creationReason: "STATUS",
      additionalDetails: {
        ...(propertyData.additionalDetails || {}),
        propertytobestatus: status, // "ACTIVE" or "INACTIVE" based on what's being triggered
      },
      workflow: {
        ...propertyData.workflow,
        businessService: "PT.CREATE",
        action: "OPEN",
        moduleName: "PT",
      },
    };
    try {
      //debugger
      const response = await Digit.PTService.update({ Property: { ...payload } }, tenantId, propertyIds);
      if (response && response.Properties && response.Properties.length > 0) {
        // refetch the property search so propertyStatus / propertyDocumentValues pick up the new status
        //await revalidatePropertySearch();
        //console.log("propertySearchDataafter1",propertySearchData)
        if (status === "INACTIVE") {
          alert("Application is in workflow first approve the application");
        } else {
          alert(`Property marked as ${status} successfully!`);
        }
        window.location.href =  window.location.pathname +  "?_t=" + new Date().getTime();
      } else {
        alert("Failed to update property status.");
      }
    } catch (err) {
      console.error("Error updating property status:", err);
      alert(`Something went wrong while making the property ${status}.`);
    }
  };
  //console.log("propertySearchDatabefore",propertySearchData)
  const applicationData_pt = applicationDetails?.applicationData;
  const propertyIds = currentPropertyId || "";
  const propertyStatus = propertySearchData?.Properties?.[0]?.status || applicationDetails?.applicationData?.status;
  const propertyDocumentValues = propertySearchData?.Properties?.[0]?.documents || applicationDetails?.applicationData?.documents || [];

  const propertyDocuments = propertyDocumentValues.length
    ? [
        {
          title: "PT_PROPERTY_DOCUMENTS",
          values: propertyDocumentValues.map((doc) => ({
            ...doc,
            title: doc.documentType,
          })),
        },
      ]
    : [];
  const PropertyInActive = () => {
    if (window.location.href.includes("employee")) {
      if (propertyStatus !== "ACTIVE") {
        alert("This operation is not allowed as Property is not active.");
        return;
      }

      updatePropertyStatus(applicationData_pt, "INACTIVE", propertyIds);
    } else {
      alert("You are not authorized to change the property status.");
    }
  };

  const PropertyActive = () => {
    //debugger
    //console.log("propertySearchDataafter2",propertySearchData)
    if (window.location.href.includes("employee")) {
      if (propertyStatus === "INWORKFLOW") {
        alert("This operation is not allowed as Property is in INWORKFLOW.");
        return;
      }

      if (propertyStatus === "INACTIVE") {
        updatePropertyStatus(applicationData_pt, "ACTIVE", propertyIds);
      } else if (propertyStatus === "ACTIVE") {
        alert("Property is already active.");
      }
    } else {
      alert("You are not authorized to change the property status.");
    }
  };
  // const PropertyInActive = () => updatePropertyStatus(applicationData_pt, "INACTIVE", propertyIds);
  // const PropertyActive = () => updatePropertyStatus(applicationData_pt, "ACTIVE", propertyIds);

  const EditProperty = () => {
    const pID = applicationDetails?.applicationData?.propertyId;
    if (pID) {
      if (window.location.href.includes("employee")) {
        if (applicationDetails?.applicationData?.status === "INACTIVE") {
          alert("Property is inactive, cannot edit.");
          return;
        } else if (applicationDetails?.applicationData?.status === "INWORKFLOW") {
          alert("Property is in workflow, cannot edit.");
          return;
        } else if (applicationDetails?.applicationData?.status === "ACTIVE") {
          history.push({ pathname: `/digit-ui/employee/pt/edit-application/${pID}` });
        }
      } else {
        if (applicationDetails?.applicationData?.status === "INACTIVE") {
          alert("Property is inactive, cannot edit.");
          return;
        } else if (applicationDetails?.applicationData?.status === "INWORKFLOW") {
          alert("Property is in workflow, cannot edit.");
          return;
        } else if (applicationDetails?.applicationData?.status === "ACTIVE") {
          history.push({ pathname: `/digit-ui/citizen/pt/property/edit-application/${pID}` });
        }
      }
    }
    // alert("edit property");
  };
  const AccessProperty = () => {
    if (["INACTIVE", "INWORKFLOW"].includes(propertyStatus?.toUpperCase())) {
      alert("This operation is not allowed as Property is in INWORKFLOW or Inactive.");
      return;
    }

    setSelectedFinancialYear(null);
    setShowAccessModal(true);
  };

  const handleAccessPropertySubmit = () => {
    if (!selectedFinancialYear) return;
    const pID = applicationDetails?.applicationData?.propertyId || propertyId;
    setShowAccessModal(false);
    const isEmployee = window.location.href.includes("employee");
    const pathname = isEmployee ? `/digit-ui/employee/pt/assessment-details/${pID}` : `/digit-ui/citizen/pt/property/assessment-details/${pID}`;
    history.replace({
      pathname,
      state: {
        submitLabel: "Complete Assessment",
        Assessment: {
          financialYear: selectedFinancialYear?.name || selectedFinancialYear?.code,
          propertyId: pID,
          tenantId: applicationData?.tenantId || tenantId,
          source: applicationData?.source,
          channel: applicationData?.channel,
          assessmentDate: Date.now(),
        },
      },
    });
  };

  useEffect(() => {
    const isWSModule =
      moduleCode === "WS" || moduleCode === "SW" || window.location.href.includes("employee/ws") || window.location.href.includes("/ws/");

    if (isWSModule) {
      return;
    }

    // Handle TL payment history separately using applicationNumber
    if (moduleCode === "TL") {
      const appNo = applicationData?.applicationNumber;
      if (!appNo) return;
      Digit.PaymentService.recieptSearch(applicationData?.tenantId || tenantId, "TL", { consumerCodes: appNo })
        .then((response) => {
          console.log("TL Payment History response:", response);
          if (response?.Payments?.length > 0) {
            setPayments(response.Payments);
          }
        })
        .catch((error) => {
          console.error("TL Payment search error:", error);
        });
      return;
    }

    // Only proceed for PT and BPREG modules
    if (!currentPropertyId && !propertyId) {
      return;
    }

    try {
      const consumerCodesList = [currentPropertyId, propertyId].filter((value, index, self) => value && self.indexOf(value) === index);
      let filters = {
        consumerCodes: consumerCodesList.join(","),
      };
      const auth = true;

      const actualQueryTenantId = applicationData?.tenantId || tenantId;

      if (moduleCode === "BPAREG") {
        Digit.OBPSService.paymentsearch({ tenantId: actualQueryTenantId, filters: filters, auth: auth }).then((response) => {
          setPayments(response?.Payments);
        });
      } else if (moduleCode === "PT") {
        Digit.PTService.paymentsearch({ tenantId: actualQueryTenantId, filters: filters, auth: auth, isCitizen : isCitizen }).then((response) => {
          setPayments(response?.Payments);
        });
      }
    } catch (error) {
      console.error("❌ Payment search error for PT/BPREG:", error);
    }
  }, [moduleCode, propertyId, tenantId, applicationData?.applicationNumber, applicationData?.tenantId]);
  return (
    <Card style={{ position: "relative" }} className={"employeeCard-override"}>
      {/* For UM-4418 changes */}
      { isInfoLabel ? <InfoDetails t={t} userType={false} infoBannerLabel={"CS_FILE_APPLICATION_INFO_LABEL"} infoClickLable={"WS_CLICK_ON_LABEL"} infoClickInfoLabel={getClickInfoDetails()} infoClickInfoLabel1={getClickInfoDetails1()} /> : null }
      {applicationDetails?.applicationDetails?.map((detail, index) => (
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
                  {isNocLocation ? `${t(detail.title)}` : t(detail.title)}
                  {detail?.Component ? <detail.Component /> : null}
                </CardSectionHeader>
              </React.Fragment>
            )}           
            {/* TODO, Later will move to classes */}
            {/* Here Render the table for adjustment amount details detail.isTable is true for that table*/}
            {detail?.isTable && (
              <table style={{ tableLayout: "fixed", width: "100%", borderCollapse: "collapse" }}>
                <tr style={{ textAlign: "left" }}>
                  {detail?.headers.map((header) => (
                    <th style={{ padding: "10px", paddingLeft:"0px" }}>{t(header)}</th>
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
                    return <Row labelStyle={{wordBreak: "break-all"}} textStyle={{wordBreak: "break-all"}} key={t(value.title)} label={t(value.title)} text={<img src={t(value.value)} alt="" privacy={value?.privacy} />} />;
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
                        labelStyle={{wordBreak: "break-all"}}
                        textStyle={{wordBreak: "break-all"}}
                      />
                    );
                  }                 
                  return (
                    <div>
                      {window.location.href.includes("modify") ?  (
                      <Row
                        className="border-none"
                        key={`${value.title}`}
                        label={`${t(`${value.title}`)}`}
                        privacy={value?.privacy}
                        text={value?.oldValue ? value?.oldValue : value?.value ? value?.value : ""}
                        labelStyle={{wordBreak: "break-all"}}
                        textStyle={{wordBreak: "break-all"}}
                      /> ) : (<Row
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
                        labelStyle={{wordBreak: "break-all"}}
                        textStyle={{wordBreak: "break-all"}}
                      />
                    )}
                    {value.title === "PT_TOTAL_DUES"? <ArrearSummary bill={fetchBillData.Bill?.[0]} />:""}
                    </div>
                  )
                })}
            </StatusTable>
          </div>
          {detail?.belowComponent && <detail.belowComponent />}
          {detail?.additionalDetails?.inspectionReport && (
            <ScruntinyDetails scrutinyDetails={detail?.additionalDetails} paymentsList={paymentsList} />
          )}
          {applicationDetails?.applicationData?.additionalDetails?.fieldinspection_pending?.length > 0 && detail?.additionalDetails?.fiReport && (
            <InspectionReport fiReport={applicationDetails?.applicationData?.additionalDetails?.fieldinspection_pending} />
          )}
          {/* {detail?.additionalDetails?.FIdocuments && detail?.additionalDetails?.values?.map((doc,index) => (
            <div key={index}>
            {doc.isNotDuplicate && <div> 
             <StatusTable>
             <Row label={t(doc?.documentType)}></Row>
             <OBPSDocument value={detail?.additionalDetails?.values} Code={doc?.documentType} index={index}/> 
             <hr style={{color:"#cccccc",backgroundColor:"#cccccc",height:"2px",marginTop:"20px",marginBottom:"20px"}}/>
             </StatusTable>
             </div>}
             </div>
          )) } */}
          {detail?.additionalDetails?.floors && <PropertyFloors floors={detail?.additionalDetails?.floors} />}
          {detail?.additionalDetails?.owners && <PropertyOwners owners={detail?.additionalDetails?.owners} />}
          {detail?.additionalDetails?.units && <TLTradeUnits units={detail?.additionalDetails?.units} />}
          {detail?.additionalDetails?.accessories && <TLTradeAccessories units={detail?.additionalDetails?.accessories} />}
          {detail?.additionalDetails?.permissions && workflowDetails?.data?.nextActions?.length > 0 && (
            <PermissionCheck applicationData={applicationDetails?.applicationData} t={t} permissions={detail?.additionalDetails?.permissions} />
          )}
          {detail?.additionalDetails?.obpsDocuments && (
            <BPADocuments
              t={t}
              applicationData={applicationDetails?.applicationData}
              docs={detail.additionalDetails.obpsDocuments}
              bpaActionsDetails={workflowDetails}
            />
          )}
          {detail?.additionalDetails?.noc && (
            <NOCDocuments
              t={t}
              isNoc={true}
              NOCdata={detail.values}
              applicationData={applicationDetails?.applicationData}
              docs={detail.additionalDetails.noc}
              noc={detail.additionalDetails?.data}
              bpaActionsDetails={workflowDetails}
            />
          )}
          {detail?.additionalDetails?.scruntinyDetails && <ScruntinyDetails scrutinyDetails={detail?.additionalDetails} />}
          {detail?.additionalDetails?.buildingExtractionDetails && <ScruntinyDetails scrutinyDetails={detail?.additionalDetails} />}
          {detail?.additionalDetails?.subOccupancyTableDetails && (
            <SubOccupancyTable edcrDetails={detail?.additionalDetails} applicationData={applicationDetails?.applicationData} />
          )}
          {detail?.additionalDetails?.documentsWithUrl && <DocumentsPreview documents={detail?.additionalDetails?.documentsWithUrl} />}
          {detail?.additionalDetails?.documents && <PropertyDocuments documents={detail?.additionalDetails?.documents} />}
          {detail?.additionalDetails?.taxHeadEstimatesCalculation && (
            <PropertyEstimates taxHeadEstimatesCalculation={detail?.additionalDetails?.taxHeadEstimatesCalculation} />
          )}
          {detail?.isWaterConnectionDetails && <WSAdditonalDetails wsAdditionalDetails={detail} oldValue={oldValue} />}
          {/* {detail?.isLabelShow ? <WSInfoLabel t={t} /> : null} */}
          {detail?.additionalDetails?.redirectUrl && (
            <div style={{ fontSize: "16px", lineHeight: "24px", fontWeight: "400", padding: "10px 0px" }}>
              <Link to={detail?.additionalDetails?.redirectUrl?.url}>
                <span className="link" style={{ color: "#a82227" }}>
                  {detail?.additionalDetails?.redirectUrl?.title}
                </span>
              </Link>
            </div>
          )}
          {detail?.additionalDetails?.estimationDetails && <WSFeeEstimation wsAdditionalDetails={detail} workflowDetails={workflowDetails}/>}
          {detail?.additionalDetails?.estimationDetails && <ViewBreakup wsAdditionalDetails={detail} workflowDetails={workflowDetails}/>}
          
        </React.Fragment>
      ))}
      {showTimeLine && workflowDetails?.data?.timeline?.length > 0 && (
        <React.Fragment>
          <BreakLine />
          {(workflowDetails?.isLoading || isDataLoading) && <Loader />}
          {!workflowDetails?.isLoading && !isDataLoading && (
            <Fragment>
              <CardSectionHeader style={{ marginBottom: "16px", marginTop: "32px" }}>
                {t("ES_APPLICATION_DETAILS_APPLICATION_TIMELINE")}
              </CardSectionHeader>
              {workflowDetails?.data?.timeline && workflowDetails?.data?.timeline?.length === 1 ? (
                <CheckPoint
                  isCompleted={true}
                   label={t(`${timelineStatusPrefix}${workflowDetails?.data?.timeline[0]?.state}`)}
                  customChild={getTimelineCaptions(workflowDetails?.data?.timeline[0])}
                />
              ) : (
                <ConnectingCheckPoints>
                  {workflowDetails?.data?.timeline &&
                    workflowDetails?.data?.timeline.map((checkpoint, index, arr) => {
                      let timelineStatusPostfix = "";
                      if (window.location.href.includes("/obps/")) {
                        if(workflowDetails?.data?.timeline[index-1]?.state?.includes("BACK_FROM") || workflowDetails?.data?.timeline[index-1]?.state?.includes("SEND_TO_CITIZEN"))
                        timelineStatusPostfix = `_NOT_DONE`
                        else if(checkpoint?.performedAction === "SEND_TO_ARCHITECT")
                        timelineStatusPostfix = `_BY_ARCHITECT_DONE`
                        else
                        timelineStatusPostfix = index == 0 ? "" : `_DONE`;
                      }
                      
                      return (
                        <React.Fragment key={index}>
                          <CheckPoint
                            keyValue={index}
                            isCompleted={index === 0}
                            info={checkpoint.comment}
                            label={t(
                              `${timelineStatusPrefix}${
                                checkpoint?.performedAction === "REOPEN" ? checkpoint?.performedAction : checkpoint?.[statusAttribute]
                              }${timelineStatusPostfix}`
                            )}
                            customChild={getTimelineCaptions(checkpoint,index)}
                          />
                        </React.Fragment>
                      );
                    })}
                </ConnectingCheckPoints>
              )}
            </Fragment>
          )}
        </React.Fragment>
      )}
    </Card>
  );
}

export default ApplicationDetailsContent;