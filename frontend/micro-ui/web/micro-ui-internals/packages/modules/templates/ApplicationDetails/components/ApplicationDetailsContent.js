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
  Modal,
  CheckBox
} from "@mseva/digit-ui-react-components";
import { PTService } from "../../../../libraries/src/services/elements/PT";
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
import ApplicationHistory from "./ApplicationHistory";
import PaymentHistory from "./PaymentHistory";
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
  setIsCheck,
  isCheck
}) {
  const { t } = useTranslation();
  const history = useHistory();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [showToast, setShowToast] = useState(null);
  const [payments, setPayments] = useState([])
  const [showAccess, setShowAccess] = useState(false);
  const [selectedYear, setSelectedYear] = useState()
  let isEditApplication = window.location.href.includes("editApplication") && window.location.href.includes("bpa");
  const ownersSequences = applicationDetails?.applicationData?.owners;
  console.log("appl", applicationDetails);
  let { data: FinancialYearData } = Digit.Hooks.useCustomMDMS(Digit.ULBService.getStateId(), "egf-master", [{ name: "FinancialYear" }], {
    select: (data) => {
      const formattedData = data?.["egf-master"]?.["FinancialYear"];

      return formattedData;
    },
  });
  if (FinancialYearData?.length > 0) {
    FinancialYearData = FinancialYearData.filter(
      (record, index, self) =>
        index === self.findIndex((r) => r.code === record.code)
    );
    FinancialYearData = FinancialYearData.sort((a, b) => b.endingDate - a.endingDate)
  }
  console.log("financial year", FinancialYearData)
  const setModal = () => {
    console.log("in Apply")

    // onSelect()

  }
  const closeModalTwo = () => {
    setShowAccess(false)
  }

  const Heading = (props) => {
    return <h1 className="heading-m">{props.label}</h1>;
  };

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
  const closeModal = (e) => {
    console.log("in Print")
    setShowAccess(false)

  }
  function OpenImage(imageSource, index, thumbnailsToShow) {
    window.open(thumbnailsToShow?.fullImage?.[0], "_blank");
  }

  const [fetchBillData, updatefetchBillData] = useState({});
  const [assessmentDetails, setAssessmentDetails] = useState()
  const [filtered, setFiltered] = useState([])

  const setBillData = async (tenantId, propertyIds, updatefetchBillData, updateCanFetchBillData) => {
    const assessmentData = await Digit.PTService.assessmentSearch({ tenantId:applicationDetails?.tenantId, filters: { propertyIds } });
    let billData = {};
    console.log("assessment data", assessmentData)

    if (assessmentData?.Assessments?.length > 0) {

      const activeRecords = assessmentData.Assessments.filter(a => a.status === 'ACTIVE');

      // Helper to normalize timestamp to date only (midnight)
      function normalizeDate(timestamp) {
        const date = new Date(timestamp);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }



      const latestMap = new Map();

      activeRecords.forEach(record => {

        const normalizedDate = normalizeDate(record.assessmentDate);
        const key = `${normalizedDate}_${record.financialYear}`;
        const existing = latestMap.get(key);

        if (!existing || record.createdDate > existing.createdDate) {
          latestMap.set(key, record);
        }
      });


      console.log("grouped", latestMap)

      // Step 3: Convert grouped object to array
      const filteredAssessment = Array.from(latestMap.values());
      setFiltered(filteredAssessment)
      console.log(filteredAssessment);

      //       filtered = Object.values(
      //   assessmentData.Assessments
      //     .filter(a => a.status === 'ACTIVE')
      //     .reduce((acc, curr) => {
      //       const key = `${curr.assessmentDate}_${curr.financialYear}`;
      //       if (!acc[key] || curr.createdDate > acc[key].createdDate) {
      //         acc[key] = curr;
      //       }
      //       return acc;
      //     }, {})
      // );
      // console.log("filtered",filtered)
      setAssessmentDetails(assessmentData?.Assessments)
      billData = await Digit.PaymentService.fetchBill(applicationDetails?.tenantId, {
        businessService: "PT",
        consumerCode: propertyIds,
      });
    }
    console.log("bill Data", billData)
    updatefetchBillData(billData);
    updateCanFetchBillData({
      loading: false,
      loaded: true,
      canLoad: true,
    });
  };
  console.log("fetch bill data", fetchBillData)
  const [billData, updateCanFetchBillData] = useState({
    loading: false,
    loaded: false,
    canLoad: false,
  });




  console.log("filtered", filtered)
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
    if (checkpoint.state === "OPEN" || (checkpoint.status === "INITIATED" && !window.location.href.includes("/obps/"))) {
      const caption = {
        date: convertEpochToDateDMY(applicationData?.auditDetails?.createdTime),
        source: applicationData?.channel || "",
      };
      return <TLCaption data={caption} />;
    } else if (window.location.href.includes("/obps/") || window.location.href.includes("/noc/") || window.location.href.includes("/ws/")) {
      const privacy = {
        uuid: checkpoint?.assignes?.[0]?.uuid,
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
            resultstring = `+91 ${_.get(res, `ProcessInstances[${index}].assignes[0].mobileNumber`)}`;
            return resultstring;
          },
        },
      };
      const previousCheckpoint = timeline[index - 1];
      const caption = {
        date: checkpoint?.auditDetails?.lastModified,
        name: checkpoint?.assignes?.[0]?.name,
        mobileNumber:
          applicationData?.processInstance?.assignes?.[0]?.uuid === checkpoint?.assignes?.[0]?.uuid &&
            applicationData?.processInstance?.assignes?.[0]?.mobileNumber
            ? applicationData?.processInstance?.assignes?.[0]?.mobileNumber
            : checkpoint?.assignes?.[0]?.mobileNumber,
        comment: t(checkpoint?.comment),
        wfComment: previousCheckpoint ? previousCheckpoint.wfComment : [],
        thumbnailsToShow: checkpoint?.thumbnailsToShow,
      };

      return <TLCaption data={caption} OpenImage={OpenImage} privacy={privacy} />;
    } else {
      const caption = {
        date: convertEpochToDateDMY(applicationData?.auditDetails?.lastModifiedTime),
        name: checkpoint?.assignes?.[0]?.name,
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
      return "WS_DISCONNECTION_CLICK_ON_INFO_LABEL";
    } else {
      return "WS_CLICK_ON_INFO_LABEL";
    }
  };

  const [showAllTimeline, setShowAllTimeline] = useState(false);
  const getClickInfoDetails1 = () => {
    if (window.location.href.includes("disconnection") || window.location.href.includes("application")) {
      return "WS_DISCONNECTION_CLICK_ON_INFO1_LABEL";
    } else {
      return "";
    }
  };
  const toggleTimeline = () => {
    setShowAllTimeline((prev) => !prev);
  };
  console.log("demand Data arr", demandData);
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
    console.log("response from inactive/active", response);
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

  const applicationData_pt = applicationDetails.applicationData;
  const propertyIds = applicationDetails?.applicationData?.propertyId || "";
  const checkPropertyStatus = applicationDetails?.additionalDetails?.propertytobestatus;
  const PropertyInActive = () => {
    if (window.location.href.includes("/citizen")) {
      alert("Action to Inactivate property is not allowed for citizen");
    }
    else {
      if (checkPropertyStatus == "ACTIVE") {
        updatePropertyStatus(applicationData_pt, "INACTIVE", propertyIds);
      } else {
        alert("Property is already inactive.");
      }
    }
  };

  const PropertyActive = () => {
    if (window.location.href.includes("/citizen")) {
      alert("Action to activate property is not allowed for citizen");
    }
    else {
      if (checkPropertyStatus == "INACTIVE") {
        updatePropertyStatus(applicationData_pt, "ACTIVE", propertyIds);
      } else {
        alert("Property is already active.");
      }
    }
  };
  // const PropertyInActive = () => updatePropertyStatus(applicationData_pt, "INACTIVE", propertyIds);
  // const PropertyActive = () => updatePropertyStatus(applicationData_pt, "ACTIVE", propertyIds);

  const EditProperty = () => {
    const pID = applicationDetails?.applicationData?.propertyId;
    if (pID) {
      history.push({ pathname: `/digit-ui/employee/pt/edit-application/${pID}` });
    }
    // alert("edit property");
  };

  const AccessProperty = () => {
    //alert("access property");
    setShowAccess(true)
  };

  console.log("applicationDetails?.applicationDetails", applicationDetails?.applicationDetails)
  console.log("infolabel", isInfoLabel)
  console.log("assessment details", assessmentDetails)

  useEffect(() => {
    try {
      let filters = {
        consumerCodes: propertyId,
        // tenantId: tenantId
      }
      const auth = true
      Digit.PTService.paymentsearch({ tenantId: applicationDetails?.tenantId, filters: filters, auth: auth }).then((response) => {
        setPayments(response?.Payments)
        console.log(response)
      })
    }
    catch (error) {
      console.log(error)
    }
  }, [])
console.log("details",applicationDetails?.applicationDetails)
  return (
    <Card style={{ position: "relative" }} className={"employeeCard-override"}>
      {/* For UM-4418 changes */}
      {isInfoLabel ? (
        <InfoDetails
          t={t}
          userType={false}
          infoBannerLabel={"CS_FILE_APPLICATION_INFO_LABEL"}
          infoClickLable={"WS_CLICK_ON_LABEL"}
          infoClickInfoLabel={getClickInfoDetails()}
          infoClickInfoLabel1={getClickInfoDetails1()}
        />
      ) : null}
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
                        label={value?.labelComp?`<div>${t(value.title)} ${value?.labelComp}</div>`:`${t(value.title)}`}
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
                      {/* {value.title === "PT_TOTAL_DUES" ? <ArrearSummary bill={fetchBillData.Bill?.[0]} /> : ""} */}
                    </div>
                  );
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
          {detail?.additionalDetails?.documentsWithUrl && <DocumentsPreview documents={detail?.additionalDetails?.documentsWithUrl} />}
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
          {/* {detail?.additionalDetails?.owners && (
            <PropertyOwners owners={detail?.additionalDetails?.owners} />
          )} */}
          {detail.title === "Property Documents" && detail?.additionalDetails?.assessmentDocuments === null ? <p>0</p> : <PropertyDocuments documents={detail?.additionalDetails?.assessmentDocuments} />}
          {detail.title === "DECLARATION" && detail?.additionalDetails?.declaration &&
           <div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckBox onChange={(e)=>{setIsCheck(e.target.checked)}} /><p>{detail?.additionalDetails?.declaration}</p></div>

              {isCheck===false && <p style={{color:'red'}}>{t("PT_CHECK_DECLARATION_BOX")}</p>}
              </div>
              }
        </React.Fragment>
      ))}
   
      {(!window.location.href.includes("/assessment-details")) && <AssessmentHistory assessmentData={filtered} applicationData={applicationDetails?.applicationData}/>}
      {!window.location.href.includes("/assessment-details") && <PaymentHistory payments={payments} />}
      {!window.location.href.includes("/assessment-details") && <ApplicationHistory applicationData={applicationDetails?.applicationData} />}

      {showTimeLine && workflowDetails?.data?.timeline?.length > 0 && (
        <React.Fragment>
          <BreakLine />
          {(workflowDetails?.isLoading || isDataLoading) && <Loader />}
          {!workflowDetails?.isLoading && !isDataLoading && (
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
      {/* table for DCB Details */}
      {/* <CardSectionHeader style={{ marginBottom: "16px", marginTop: "16px", fontSize: "24px" }}>DCB Details</CardSectionHeader>
      <table border="1px" style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.th}>Installments</th>
            <th colSpan="3" style={tableStyles.th}>
              Demand
            </th>
            <th colSpan="3" style={tableStyles.th}>
              Collection
            </th>
            <th colSpan="3" style={tableStyles.th}>
              Balance
            </th>
            <th style={tableStyles.th}>Advance</th>
          </tr>
          <tr>
            <th style={tableStyles.th}></th>
            <th style={tableStyles.th}>Tax</th>
            <th style={tableStyles.th}>Interest</th>
            <th style={tableStyles.th}>Penalty</th>
            <th style={tableStyles.th}>Tax</th>
            <th style={tableStyles.th}>Interest</th>
            <th style={tableStyles.th}>Penalty</th>
            <th style={tableStyles.th}>Tax</th>
            <th style={tableStyles.th}>Interest</th>
            <th style={tableStyles.th}>Penalty</th>
            <th style={tableStyles.th}>Advance</th>
          </tr>
        </thead>
        <tbody>
          {demandData?.map((item) => {
            return (
              <tr>
                <td style={tableStyles.td}>
                  {item.taxPeriodFrom}-{item.taxPeriodTo}
                </td>
                <td style={tableStyles.td}>{item.demandTax}</td>
                <td style={tableStyles.td}>{item.demandInterest}</td>
                <td style={tableStyles.td}>{item.demandPenality}</td>
                <td style={tableStyles.td}>{item.collectionTax}</td>
                <td style={tableStyles.td}>{item.collectionInterest}</td>
                <td style={tableStyles.td}>{item.collectionPenality}</td>
                <td style={tableStyles.td}>{item.balanceTax}</td>
                <td style={tableStyles.td}>{item.balanceInterest}</td>
                <td style={tableStyles.td}>{item.balancePenality}</td>
                <td style={tableStyles.td}>{item.advance}</td>
              </tr>
            );
          })}
          {/* <tr>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
      <td style={tableStyles.td}>0.0</td>
    </tr> */}
      {/* <tr>
            <th style={tableStyles.th}>Total</th>
            <td style={tableStyles.td}>{totalDemandTax}</td>
            <td style={tableStyles.td}>{totalDemandInterest}</td>
            <td style={tableStyles.td}>{totalDemandPenality}</td>
            <td style={tableStyles.td}>{totalCollectionTax}</td>
            <td style={tableStyles.td}>{totalCollectionInterest}</td>
            <td style={tableStyles.td}>{totalCollectionPenality}</td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
          </tr>
          <tr>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <th style={tableStyles.th}>Total</th>
            <td style={tableStyles.td}>{totalBalanceTax}</td>
            <td style={tableStyles.td}>0</td>
            <td style={tableStyles.td}>0</td>
            <td style={tableStyles.td}>0</td>
          </tr>
          <tr>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <td style={tableStyles.td}></td>
            <th style={tableStyles.th}>Total Balance</th>
            <td style={tableStyles.td}>{totalBalanceTax}</td>
          </tr>
        </tbody> */}
      {/* </table> */}


      <ActionBar className="clear-search-container" style={{ display: "block" }}>
        <SubmitBar label={"Make Property Active"} style={{ flex: 1 }} onSubmit={PropertyActive} />
        <SubmitBar label={"Make Property Inactive"} style={{ marginLeft: "20px" }} onSubmit={PropertyInActive} />
        <SubmitBar label={"Edit Property"} style={{ marginLeft: "20px" }} onSubmit={EditProperty} />
        <SubmitBar label={"Access Property"} style={{ marginLeft: "20px" }} onSubmit={AccessProperty} />
      </ActionBar>
      {showToast && <Toast error={showToast.isError} label={t(showToast.label)} onClose={closeToast} isDleteBtn={"false"} />}
      {showAccess &&
        <Modal
          headerBarMain={<Heading label={t("PT_FINANCIAL_YEAR_PLACEHOLDER")} />}
          headerBarEnd={<CloseBtn onClick={closeModalTwo} />}
          actionCancelLabel={"Cancel"}
          actionCancelOnSubmit={closeModal}
          actionSaveLabel={"Access"}
          actionSaveOnSubmit={setModal}
          formId="modal-action"
          popupStyles={{ width: '60%', marginTop: '5px' }}
        >
          <React.Fragment>
            {/* <Card style={{marginLeft:'2px'}} > */}
            {FinancialYearData?.length > 0 &&

              <>

                {FinancialYearData.map((option, index) => (
                  <div key={index} style={{ marginBottom: '8px' }}>
                    <label>
                      <input
                        type="radio"
                        value={option.code}
                        checked={selectedYear === option.code}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        name="custom-radio"
                      />
                      {option.name}
                    </label>
                  </div>
                ))}
              </>

            }

            {/* </Card> */}
          </React.Fragment>
        </Modal>
      }
    </Card>
  );
}

export default ApplicationDetailsContent;
