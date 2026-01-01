import {
  BreakLine,
  Card,
  CardSectionHeader,
  CardSubHeader,
  CheckPoint,
  ConnectingCheckPoints,
  Loader,
  Row,
  Toast,
  StatusTable,
  LinkButton,
  ActionBar,
  SubmitBar,
  Table,
} from "@mseva/digit-ui-react-components";
import { values } from "lodash";
import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
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
import ViewBreakup from "./ViewBreakup";
import ArrearSummary from "../../../common/src/payments/citizen/bills/routes/bill-details/arrear-summary";
import AssessmentHistory from "./AssessmentHistory";
import { getOrderDocuments } from "../../../obps/src/utils";
import DcbTable from "./DcbTable";
import ApplicationHistory from "./ApplicationHistory";
import PaymentHistory from "./PaymentHistory";
import ApplicationTimeline from "./ApplicationTimeline";
import NewApplicationTimeline from "./NewApplicationTimeline";
function ApplicationDetailsContent({
  applicationDetails,
  demandData,
  workflowDetails,
  isDataLoading,
  applicationData,
  totalDemandTax,

  businessService,
  timelineStatusPrefix,
  id,
  showTimeLine = true,
  statusAttribute = "status",
  paymentsList,
  oldValue,
  isInfoLabel = false,
  propertyId,
  moduleCode,
}) {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  const [payments, setPayments] = useState([]);
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
  const [assessmentDetails, setAssessmentDetails] = useState();
  const [filtered, setFiltered] = useState([]);
  const setBillData = async (tenantId, propertyIds, updatefetchBillData, updateCanFetchBillData) => {
    const assessmentData = await Digit.PTService.assessmentSearch({ tenantId, filters: { propertyIds } });
    let billData = {};
    if (assessmentData?.Assessments?.length > 0) {
      const activeRecords = assessmentData.Assessments.filter((a) => a.status === "ACTIVE");

      // Helper to normalize timestamp to date only (midnight)
      function normalizeDate(timestamp) {
        const date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }

      const latestMap = new Map();

      activeRecords.forEach((record) => {
        const normalizedDate = normalizeDate(record.assessmentDate);
        const key = `${normalizedDate}_${record.financialYear}`;
        const existing = latestMap.get(key);

        if (!existing || record.createdDate > existing.createdDate) {
          latestMap.set(key, record);
        }
      });

      // Step 3: Convert grouped object to array
      const filteredAssessment = Array.from(latestMap.values());
      setFiltered(filteredAssessment);

      setAssessmentDetails(assessmentData?.Assessments);
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
  const getTimelineCaptions = (checkpoint, index = 0, timeline) => {
    // Issue 18 Fix: Add null checks for timeline data to prevent undefined errors
    if (!checkpoint) return null;

    if (checkpoint.state === "OPEN" || (checkpoint.status === "INITIATED" && !window.location.href.includes("/obps/"))) {
      const caption = {
        date: convertEpochToDateDMY(applicationData?.auditDetails?.createdTime),
        source: applicationData?.channel || "",
      };
      return <TLCaption data={caption} />;
    } else if (window.location.href.includes("/obps/") || window.location.href.includes("/noc/") || window.location.href.includes("/ws/")) {
      // const privacy = {
      //   uuid: checkpoint?.assignes?.[0]?.uuid,
      //   fieldName: "mobileNumber",
      //   model: "User",
      //   showValue: false,
      //   loadData: {
      //     serviceName: "/egov-workflow-v2/egov-wf/process/_search",
      //     requestBody: {},
      //     requestParam: { tenantId: applicationDetails?.tenantId, businessIds: applicationDetails?.applicationNo, history: true },
      //     jsonPath: "ProcessInstances[0].assignes[0].mobileNumber",
      //     isArray: false,
      //     d: (res) => {
      //       let resultstring = "";
      //       resultstring = `+91 ${_.get(res, `ProcessInstances[${index}].assignes[0].mobileNumber`)}`;
      //       return resultstring;
      //     },
      //   },
      // };
      // Issue 18 Fix: Safe access to timeline array with proper bounds checking

      const privacy = {
        // <CHANGE> Use checkpoint.assigner.uuid instead of checkpoint.assignes[0].uuid
        uuid: checkpoint?.assigner?.uuid || checkpoint?.assignes?.[0]?.uuid,
        fieldName: "mobileNumber",
        model: "User",
        showValue: false,
        loadData: {
          serviceName: "/egov-workflow-v2/egov-wf/process/_search",
          requestBody: {},
          requestParam: { tenantId: applicationDetails?.tenantId, businessIds: applicationDetails?.applicationNo, history: true },
          jsonPath: "ProcessInstances[0].assignes[0].mobileNumber",
          isArray: false,
          d: (res) => {
            let resultstring = "";
            // <CHANGE> Try both assigner and assignes paths
            resultstring = `+91 ${
              _.get(res, `ProcessInstances[${index}].assigner.mobileNumber`) || _.get(res, `ProcessInstances[${index}].assignes[0].mobileNumber`)
            }`;
            return resultstring;
          },
        },
      };

      const previousCheckpoint = timeline && Array.isArray(timeline) && index > 0 && index - 1 < timeline.length ? timeline[index - 1] : null;

      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        // <CHANGE> Use checkpoint.assigner instead of checkpoint.assignes[0]
        name: checkpoint?.assigner?.name || checkpoint?.assignes?.[0]?.name || "N/A",
        mobileNumber:
          applicationData?.processInstance?.assignes?.[0]?.uuid === checkpoint?.assigner?.uuid &&
          applicationData?.processInstance?.assignes?.[0]?.mobileNumber
            ? applicationData?.processInstance?.assignes?.[0]?.mobileNumber
            : checkpoint?.assigner?.mobileNumber || checkpoint?.assignes?.[0]?.mobileNumber || "N/A",
        comment: checkpoint?.comment ? t(checkpoint.comment) : "",
        wfComment: previousCheckpoint ? previousCheckpoint.wfComment || [] : [],
        thumbnailsToShow: checkpoint?.thumbnailsToShow || [],
      };

      return <TLCaption data={caption} OpenImage={OpenImage} privacy={privacy} />;
    } else {
      const caption = {
        date: convertEpochToDateDMY(applicationData?.auditDetails?.lastModifiedTime),
        name: checkpoint?.assignes?.[0]?.name || "N/A",
        wfComment: checkpoint?.wfComment || [],
        mobileNumber: checkpoint?.assignes?.[0]?.mobileNumber || "N/A",
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
  const tableStyles = {
    table: {
      border: "2px solid black",
      width: "100%",
      fontFamily: "sans-serif",
    },
    td: {
      padding: "10px",
      border: "1px solid black",
      textAlign: "center",
    },
    th: {
      padding: "10px",
      border: "1px solid black",
      textAlign: "center",
    },
  };

  const getMainDivStyles = () => {
    if (
      window.location.href.includes("employee/obps") ||
      window.location.href.includes("employee/noc") ||
      window.location.href.includes("employee/ws")
    ) {
      return {};
    } else if (checkLocation) {
      return {};
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
      // return "WS_DISCONNECTION_CLICK_ON_INFO_LABEL";
    } else {
      // return "WS_CLICK_ON_INFO_LABEL";
    }
  };

  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const getClickInfoDetails1 = () => {
    if (window.location.href.includes("disconnection") || window.location.href.includes("application")) {
      // return "WS_DISCONNECTION_CLICK_ON_INFO1_LABEL";
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
        ...propertyData.additionalDetails,
        propertytobestatus: status,
      },
      workflow: {
        ...propertyData.workflow,
        businessService: "PT.CREATE",
        action: "OPEN",
        moduleName: "PT",
      },
    };
    // try {
    const response = await Digit.PTService.updatePT({ Property: { ...payload } }, tenantId, propertyIds);
    //   const result = await response.json();
    //   if (response.ok) {
    //     alert(`Property marked as ${status} successfully!`);
    //   } else {
    //     alert("Failed to update property status.");
    //     console.error(result);
    //   }
    // }
    //  catch (err) {
    //   console.error("Error inactivating property:", err);
    //   alert(`Something went wrong while making the property ${status}.`);
    // }
  };

  const applicationData_pt = applicationDetails?.applicationData;
  const propertyIds = applicationDetails?.applicationData?.propertyId || "";
  const checkPropertyStatus = applicationDetails?.additionalDetails?.propertytobestatus;
  const PropertyInActive = () => {
    if (window.location.href.includes("employee")) {
      if (checkPropertyStatus == "ACTIVE") {
        updatePropertyStatus(applicationData_pt, "INACTIVE", propertyIds);
      } else {
        alert("Property is already inactive.");
      }
    } else {
      alert("You are not authorized to change the property status.");
    }
  };

  const PropertyActive = () => {
    if (window.location.href.includes("employee")) {
      if (checkPropertyStatus == "INACTIVE") {
        updatePropertyStatus(applicationData_pt, "ACTIVE", propertyIds);
      } else {
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
    alert("access property");
  };

  useEffect(() => {
    const isWSModule =
      moduleCode === "WS" || moduleCode === "SW" || window.location.href.includes("employee/ws") || window.location.href.includes("/ws/");

    if (isWSModule) {
      return;
    }

    // Only proceed for PT and BPREG modules
    if (!propertyId) {
      return;
    }

    try {
      let filters = {
        consumerCodes: propertyId,
      };
      const auth = true;

      if (moduleCode === "BPAREG") {
        Digit.OBPSService.paymentsearch({ tenantId: tenantId, filters: filters, auth: auth }).then((response) => {
          setPayments(response?.Payments);
        });
      } else if (moduleCode === "PT") {
        Digit.PTService.paymentsearch({ tenantId: tenantId, filters: filters, auth: auth }).then((response) => {
          setPayments(response?.Payments);
        });
      }
    } catch (error) {
      console.error("❌ Payment search error for PT/BPREG:", error);
    }
  }, [moduleCode, propertyId, tenantId]);
  return (
    <Card style={{ position: "relative" }}>
      {/* For UM-4418 changes */}
      {/* {isInfoLabel ? (
        <InfoDetails
          t={t}
          userType={false}
          infoBannerLabel={"CS_FILE_APPLICATION_INFO_LABEL"}
          infoClickLable={"WS_CLICK_ON_LABEL"}
          infoClickInfoLabel={getClickInfoDetails()}
          infoClickInfoLabel1={getClickInfoDetails1()}
        />
      ) : null} */}
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
                  return window.location.href.includes("modify") ? (
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
                  );
                  // {value.title === "PT_TOTAL_DUES" ? <ArrearSummary bill={fetchBillData.Bill?.[0]} /> : ""}
                })}
            </StatusTable>
          </div>
          {detail?.belowComponent && <detail.belowComponent />}
          {detail?.additionalDetails?.inspectionReport && (
            <ScruntinyDetails
              scrutinyDetails={detail?.additionalDetails}
              paymentsList={paymentsList}
              additionalDetails={applicationDetails?.applicationData?.additionalDetails}
              applicationData={applicationDetails?.applicationData}
            />
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
          {!isEditApplication && detail?.additionalDetails?.permissions && workflowDetails?.data?.nextActions?.length > 0 && (
            <PermissionCheck applicationData={applicationDetails?.applicationData} t={t} permissions={detail?.additionalDetails?.permissions} />
          )}
          {detail?.additionalDetails?.obpsDocuments && (
            <div style={{ display: "flex" }}>
              <BPADocuments
                t={t}
                applicationData={applicationDetails?.applicationData}
                docs={detail.additionalDetails.obpsDocuments}
                bpaActionsDetails={workflowDetails}
              />
            </div>
          )}

          {/* to get Document values */}
          {/* {( detail?.additionalDetails?.obpsDocuments?.[0]?.values) && (
                  <div style={{marginTop: "-8px"}}>
                    {<DocumentsPreview documents={getOrderDocuments(detail?.additionalDetails?.obpsDocuments?.[0]?.values)} svgStyles = {{}} isSendBackFlow = {false} isHrLine = {true} titleStyles ={{fontSize: "20px", lineHeight: "24px", "fontWeight": 700, marginBottom: "10px"}}/>}
                  </div>
                )} */}
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
          {/* {detail?.additionalDetails?.documentsWithUrl && <DocumentsPreview documents={detail?.additionalDetails?.documentsWithUrl} />} */}
          {detail?.additionalDetails?.documentsWithUrl && (
            <Table
              className="customTable table-border-style"
              t={t}
              data={detail?.additionalDetails?.documentsWithUrl[0]?.values || []}
              columns={documentsColumns}
              getCellProps={() => ({ style: {} })}
              disableSort={false}
              autoSort={true}
              manualPagination={false}
              isPaginationRequired={false}
            />
          )}
          {/* {detail?.additionalDetails?.documents && <PropertyDocuments documents={detail?.additionalDetails?.documents} />} */}
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
          {detail?.additionalDetails?.estimationDetails && <WSFeeEstimation wsAdditionalDetails={detail} workflowDetails={workflowDetails} />}
          {detail?.additionalDetails?.estimationDetails && <ViewBreakup wsAdditionalDetails={detail} workflowDetails={workflowDetails} />}
        </React.Fragment>
      ))}
      {assessmentDetails?.length > 0 && <AssessmentHistory assessmentData={filtered} />}
      <PaymentHistory payments={payments} />
      {moduleCode !== "WS" && moduleCode !== "SW" && moduleCode !== "OBPS" && moduleCode !== "BPAStakeholder" && moduleCode !== "BPAREG" && (
        <ApplicationHistory applicationData={applicationDetails?.applicationData} />
      )}

      {showTimeLine && workflowDetails?.data?.timeline?.length > 0 && (
        <React.Fragment>
          <BreakLine />
          {(workflowDetails?.isLoading || isDataLoading) && <Loader />}
          {!workflowDetails?.isLoading && !isDataLoading && moduleCode !== "BPAREG" && (
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
                                  `${timelineStatusPrefix}${
                                    checkpoint?.performedAction === "REOPEN" ? checkpoint?.performedAction : checkpoint?.[statusAttribute]
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
          {!workflowDetails?.isLoading && !isDataLoading && moduleCode === "BPAREG" && (
            <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
          )}
        </React.Fragment>
      )}

      {window.location.href.includes("/pt/") ? (
        <ActionBar className="clear-search-container" style={{ display: "block" }}>
          <SubmitBar label={"Make Property Active"} style={{ flex: 1 }} onSubmit={PropertyActive} />
          <SubmitBar label={"Make Property Inactive"} style={{ marginLeft: "20px" }} onSubmit={PropertyInActive} />
          <SubmitBar label={"Edit Property"} style={{ marginLeft: "20px" }} onSubmit={EditProperty} />
          <SubmitBar label={"Access Property"} style={{ marginLeft: "20px" }} onSubmit={AccessProperty} />
        </ActionBar>
      ) : (
        <div></div>
      )}
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"false"} />}
    </Card>
  );
}

export default ApplicationDetailsContent;
