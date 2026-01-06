import {
  Card,
  CardHeader,
  Loader,
  MultiLink,
  Row,
  SubmitBar,
  Header,
  CardSubHeader,
  CardSectionHeader,
  LinkLabel,
  LinkButton,
  StatusTable,
  ActionBar,
  Menu,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory, useParams } from "react-router-dom";
import getPDFData from "../../../utils/getTLAcknowledgementData";
// import TLWFApplicationTimeline from "../../../pageComponents/TLWFApplicationTimeline";
import NewApplicationTimeline from "../../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import TLDocument from "../../../pageComponents/TLDocumets";
const getAddress = (address, t) => {
  return `${address?.doorNo ? `${address?.doorNo}, ` : ""} ${address?.street ? `${address?.street}, ` : ""}${
    address?.landmark ? `${address?.landmark}, ` : ""
  }${t(address?.locality?.code)}, ${t(address?.city?.code)},${t(address?.pincode) ? `${address?.pincode}` : " "}`;
};

const TLApplicationDetails = () => {
  const { t } = useTranslation();
  const { id, tenantId } = useParams();
  //const { tenantId } = useParams();
  const history = useHistory();
  const [bill, setBill] = useState(null);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("CITIZEN_TL_MUTATION_HAPPENED", false);
  const { tenants } = storeData || {};
  const isMobile = window.Digit.Utils.browser.isMobile();
  const [viewTimeline, setViewTimeline] = useState(false);
  let multiBoxStyle = {
    border: "groove",
    background: "#FAFAFA",
    borderRadius: "4px",
    paddingInline: "10px",
    marginTop: "10px",
    marginBottom: "10px",
  };
  let multiHeaderStyle = { marginBottom: "10px", marginTop: "10px", color: "#505A5F" };
  //todo: hook should return object to render the data
  const { isLoading, isError, error, data: application, error: errorApplication } = Digit.Hooks.tl.useTLApplicationDetails({
    tenantId: tenantId,
    applicationNumber: id,
  });
  const { isLoading: PTLoading, isError: isPTError, data: PTData } = Digit.Hooks.pt.usePropertySearch(
    {
      tenantId,
      filters: { propertyIds: application?.[0]?.tradeLicenseDetail?.additionalDetail?.propertyId },
    },
    { enabled: application?.[0]?.tradeLicenseDetail?.additionalDetail?.propertyId ? true : false }
  );

  let user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);
  const [showToast, setShowToast] = useState(null);
  const getActionsOnce = useRef(false);
  const stateId = Digit.ULBService.getStateId();

  const [displayMenu, setDisplayMenu] = useState(false);
  const menuRef = useRef();
  const closeMenu = () => {
    setDisplayMenu(false);
  };
  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  useEffect(() => {
    localStorage.setItem("TLAppSubmitEnabled", "true");
    setMutationHappened(false);
  }, []);

  const { data: menuList, isLoading: TLLoading } = Digit.Hooks.useCustomMDMS(tenantId, "TradeLicense", [{ name: "TradeType" }]);
  console.log("menuList", menuList?.TradeLicense?.TradeType);

  const { data: paymentsHistory } = Digit.Hooks.tl.useTLPaymentHistory(tenantId, id);
  useEffect(() => {
    if (application) {
      Digit.PaymentService.fetchBill(tenantId, {
        consumerCode: application[0]?.applicationNumber,
        businessService: application[0]?.businessService,
      }).then((res) => {
        setBill(res?.Bill?.[0]);
      });
    }
  }, [application]);
  const [showOptions, setShowOptions] = useState(false);
  useEffect(() => {}, [application, errorApplication]);

  const closeToast = () => {
    setShowToast(null);
  };

  const businessService = application?.[0]?.businessService;
  const { isLoading: iswfLoading, data: wfdata } = Digit.Hooks.useWorkflowDetails(
    {
      tenantId: tenantId,
      id: id,
      moduleCode: businessService,
    },
    {
      enabled: application,
    }
  );

  let EditRenewalApplastModifiedTime = Digit.SessionStorage.get("EditRenewalApplastModifiedTime");

  let workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    // moduleCode: businessService,
    moduleCode: "NewTL", // Need To make this dynamic
    role: "PT_CEMP",
    config: { EditRenewalApplastModifiedTime: EditRenewalApplastModifiedTime },
  });

  const {
    isLoading: updatingApplication,
    isError: updateApplicationError,
    data: updateResponse,
    error: updateError,
    mutate,
  } = Digit.Hooks.tl.useApplicationActions(tenantId);

  const rolearray = user?.info?.roles.filter((item) => {
    if ((item.code == "TL_CEMP" && item.tenantId === tenantId) || item.code == "CITIZEN") return true;
  });

  const rolecheck = rolearray.length > 0 ? true : false;

  let workflowDocs = [];
  if (wfdata) {
    wfdata?.timeline?.map((ob) => {
      if (ob?.wfDocuments?.length > 0) {
        ob?.wfDocuments?.map((doc) => {
          workflowDocs.push(doc);
        });
      }
    });
  }

  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (workflowDetails?.data && !getActionsOnce.current) {
      getActionsOnce.current = true;
      let actionData = workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
        return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
      });

      if (
        rolecheck &&
        (application?.[0]?.status === "APPROVED" ||
          application?.[0]?.status === "EXPIRED" ||
          application?.[0]?.status === "CANCELLED" ||
          application?.[0]?.status === "MANUALEXPIRED") /* && renewalPending==="true" */ /* && duration <= renewalPeriod */
      ) {
        if (workflowDetails?.data /* && allowedToNextYear */) {
          if (!workflowDetails?.data?.actionState) {
            workflowDetails.data.actionState = {};
            workflowDetails.data.actionState.nextActions = [];
          }
          const flagData = workflowDetails?.data?.actionState?.nextActions?.filter((data) => data.action == "RENEWAL_SUBMIT_BUTTON");
          if (flagData && flagData.length === 0) {
            const licenseNumber = application?.[0]?.licenseNumber ? application?.[0]?.licenseNumber : "";
            actionData?.push({
              action: "RENEWAL_SUBMIT_BUTTON",
              isToast:
                application?.[0]?.status === "CANCELLED" || application?.[0]?.status === "MANUALEXPIRED" /* && latestRenewalYearofAPP */
                  ? true
                  : false,
              // toastMessage: getToastMessages(),
              redirectionUrl: {
                pathname: `/digit-ui/citizen/tl/tradelicence/renew-trade/${licenseNumber}/${tenantId}`,
                state: application,
              },
              tenantId: stateId,
              role: [],
            });
          }
          // workflowDetails = {
          //   ...workflowDetails,
          //   data: {
          //     ...workflowDetails?.data,
          //     actionState: {
          //       nextActions: allowedToNextYear ?[
          //         {
          //           action: "RENEWAL_SUBMIT_BUTTON",
          //           redirectionUrl: {
          //             pathname: `/digit-ui/employee/tl/renew-application-details/${applicationNumber}`,
          //             state: applicationDetails
          //           },
          //           tenantId: stateId,
          //         }
          //       ] : [],
          //     },
          //   },
          // };
        }
      }

      setActions(actionData || []);
    }
  }, [workflowDetails]);

  // let actions = workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
  //   return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
  // }) || workflowDetails?.data?.nextActions?.filter((e) => {
  //   return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
  // });

  const handleViewTimeline = () => {
    const timelineSection = document.getElementById("timeline");
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: "smooth" });
    }
    setViewTimeline(true);
  };
  // if (isLoading || iswfLoading) {
  //   return <Loader />;
  // }

  if (application?.applicationDetails?.length === 0) {
    history.goBack();
  }

  const handleDownloadPdf = async () => {
    const tenantInfo = tenants.find((tenant) => tenant.code === application[0]?.tenantId);
    let res = application[0];
    const data = getPDFData({ ...res }, tenantInfo, t);
    data.then((ress) => Digit.Utils.pdf.generate(ress));
    setShowOptions(false);
  };

  const downloadPaymentReceipt = async () => {
    const receiptFile = { filestoreIds: [paymentsHistory.Payments[0]?.fileStoreId] };
    if (receiptFile?.filestoreIds[0] !== null) {
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: receiptFile.filestoreIds[0] });
      window.open(fileStore[receiptFile.filestoreIds[0]], "_blank");
      setShowOptions(false);
    } else {
      const newResponse = await Digit.PaymentService.generatePdf(tenantId, { Payments: [paymentsHistory.Payments[0]] }, "tradelicense-receipt");
      const fileStore = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: newResponse.filestoreIds[0] });
      window.open(fileStore[newResponse.filestoreIds[0]], "_blank");
      setShowOptions(false);
    }
  };

  const downloadTLcertificate = async () => {
    const TLcertificatefile = await Digit.PaymentService.generatePdf(tenantId, { Licenses: application }, "tlcertificate");
    const receiptFile = await Digit.PaymentService.printReciept(tenantId, { fileStoreIds: TLcertificatefile.filestoreIds[0] });
    window.open(receiptFile[TLcertificatefile.filestoreIds[0]], "_blank");
    setShowOptions(false);
  };

  let propertyAddress = "";
  if (PTData && PTData?.Properties?.length) {
    propertyAddress = getAddress(PTData?.Properties[0]?.address, t);
  }

  const checkDownload = menuList?.TradeLicense?.TradeType;

  const tradeType = application?.[0]?.tradeLicenseDetail?.tradeUnits?.[0]?.tradeType;

  const checkFinalData = checkDownload?.filter((item) => item?.code == tradeType);

  console.log("checkFinalData", checkFinalData);

  const isTestApplication = checkFinalData?.[0]?.ishazardous;

  const dowloadOptions =
    paymentsHistory?.Payments?.length > 0 &&
    application?.[0]?.status !== "EXPIRED" &&
    application?.[0]?.status !== "CANCELLED" &&
    application?.[0]?.status !== "PENDINGPAYMENT" &&
    application?.[0]?.status !== "MANUALEXPIRED"
      ? [
          ...(!isTestApplication
            ? [
                {
                  label: t("TL_CERTIFICATE"),
                  onClick: downloadTLcertificate,
                },
              ]
            : []),
          {
            label: t("CS_COMMON_PAYMENT_RECEIPT"),
            onClick: downloadPaymentReceipt,
          },
          {
            label: t("TL_APPLICATION"),
            onClick: handleDownloadPdf,
          },
        ]
      : [
          {
            label: t("TL_APPLICATION"),
            onClick: handleDownloadPdf,
          },
        ];

  // console.log("DisplayMenuValue",displayMenu, (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions))

  const ownersSequences =
    application?.[0]?.tradeLicenseDetail?.owners?.additionalDetails !== null
      ? application?.[0]?.tradeLicenseDetail?.owners.sort((a, b) => a?.additionalDetails?.ownerSequence - b?.additionalDetails?.ownerSequence)
      : [];
  return (
    <React.Fragment>
      <div className="cardHeaderWithOptions" style={isMobile ? {} : { maxWidth: "960px" }}>
        <Header>{t("CS_TITLE_APPLICATION_DETAILS")}</Header>
        <div>
          <MultiLink
            className="multilinkWrapper"
            onHeadClick={() => setShowOptions(!showOptions)}
            displayOptions={showOptions}
            options={dowloadOptions}
          />
          {/* <LinkButton label={t("VIEW_TIMELINE")} style={{ color:"#A52A2A"}} onClick={handleViewTimeline}></LinkButton> */}
        </div>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <Card style={{ position: "relative" }}>
          {application?.map((application, index) => {
            return (
              <div key={index} className="employee-data-table">
                <Row
                  // className="employee-data-table"
                  className="border-none"
                  label={t("TL_COMMON_TABLE_COL_APP_NO")}
                  text={application?.applicationNumber}
                  // textStyle={{ border: "none", wordBreak:"break-word" }}
                  textStyle={{ wordBreak: "break-word" }}
                />
                {application?.licenseNumber && (
                  <Row
                    className="border-none"
                    label={t("TL_LOCALIZATION_TRADE_LICENSE_NO")}
                    text={application?.licenseNumber}
                    textStyle={{ wordBreak: "break-word" }}
                  />
                )}
                {/* <Row className="border-none" label={t("TL_APPLICATION_CATEGORY")} text={t("ACTION_TEST_TRADE_LICENSE")} textStyle={{ wordBreak:"break-word" }} /> */}
                <Row
                  className="border-none"
                  // style={{ border: "none" }}
                  label={t("TL_COMMON_TABLE_COL_STATUS")}
                  text={t(`WF_NEWTL_${application?.status}`)}
                  // textStyle={{ whiteSpace: "pre-wrap", width: "70%", wordBreak:"break-word" }}
                  textStyle={{ wordBreak: "break-word" }}
                />
                {/* <Row
                className="border-none"
                // style={{ border: "none" }}
                label={t("TL_COMMON_TABLE_COL_SLA_NAME")}
                text={`${Math.round(application?.SLA / (1000 * 60 * 60 * 24))} ${t("TL_SLA_DAYS")}`}
                textStyle={{ wordBreak:"break-word" }}
              /> */}
                <Row
                  className="border-none"
                  // style={{ border: "none" }}
                  label={t("TL_COMMON_TABLE_COL_TRD_NAME")}
                  text={application?.tradeName}
                  // textStyle={{ whiteSpace: "pre-wrap", width: "70%", wordBreak:"break-word" }}
                  textStyle={{ wordBreak: "break-word" }}
                />
                <Row
                  className="border-none"
                  // style={{ border: "none" }}
                  label={t("TL_NEW_TRADE_DETAILS_TRADE_GST_NO_LABEL")}
                  text={
                    application?.tradeLicenseDetail?.additionalDetail?.tradeGstNo ||
                    application?.tradeLicenseDetail?.additionalDetail?.gstNo ||
                    t("CS_NA")
                  }
                  // textStyle={{ whiteSpace: "pre-wrap", width: "70%", wordBreak:"break-word" }}
                  textStyle={{ wordBreak: "break-word" }}
                />
                <Row
                  className="border-none"
                  // style={{ border: "none" }}
                  label={t("TL_NEW_TRADE_DETAILS_OPR_AREA_LABEL")}
                  text={application?.tradeLicenseDetail?.operationalArea || t("CS_NA")}
                  // textStyle={{ whiteSpace: "pre-wrap", width: "70%", wordBreak:"break-word" }}
                  textStyle={{ wordBreak: "break-word" }}
                />
                <Row
                  className="border-none"
                  // style={{ border: "none" }}
                  label={t("TL_NEW_TRADE_DETAILS_NO_EMPLOYEES_LABEL")}
                  text={application?.tradeLicenseDetail?.noOfEmployees || t("CS_NA")}
                  // textStyle={{ whiteSpace: "pre-wrap", width: "70%", wordBreak:"break-word" }}
                  textStyle={{ wordBreak: "break-word" }}
                />
                <CardSectionHeader>{t("TL_COMMON_OWN_DETAILS")}</CardSectionHeader>
                {ownersSequences.map((ele, index) => {
                  return application?.tradeLicenseDetail?.subOwnerShipCategory.includes("INSTITUTIONAL") ? (
                    <div key={index} style={multiBoxStyle}>
                      <CardSectionHeader style={multiHeaderStyle}>{`${t("TL_PAYMENT_PAID_BY_PLACEHOLDER")} - ` + (index + 1)}</CardSectionHeader>
                      {/* <Row
                      className="border-none"
                      label={`${t("TL_INSTITUTION_NAME_LABEL")}`}
                      text={t(application?.tradeLicenseDetail?.institution?.instituionName)}
                      textStyle={{ wordBreak:"break-word" }}
                    /> */}
                      <Row
                        className="border-none"
                        label={`${t("COMMON-MASTERS_SUBOWNERSHIP_LABEL")}`}
                        text={t(`TL_${application?.tradeLicenseDetail?.subOwnerShipCategory}`)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_NEW_OWNER_DETAILS_MOB_NO_LABEL")}`}
                        text={t(ele.mobileNumber)}
                        textStyle={{ whiteSpace: "pre" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_NEW_OWNER_PHONE_LABEL")}`}
                        text={t(application?.tradeLicenseDetail?.institution?.contactNo || t("CS_NA"))}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_LOCALIZATION_OWNER_NAME")}`}
                        text={t(ele.fatherOrHusbandName || application?.tradeLicenseDetail?.institution?.name)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_NEW_OWNER_DETAILS_EMAIL_LABEL")}`}
                        text={t(ele.emailId || t("CS_NA"))}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                    </div>
                  ) : (
                    <div key={index} style={multiBoxStyle}>
                      <CardSectionHeader style={multiHeaderStyle}>{`${t("TL_PAYMENT_PAID_BY_PLACEHOLDER")} - ` + (index + 1)}</CardSectionHeader>
                      <Row
                        className="border-none"
                        label={`${t("TL_COMMON_TABLE_COL_OWN_NAME")}`}
                        text={t(ele.name)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_NEW_OWNER_DETAILS_GENDER_LABEL")}`}
                        text={t(ele.gender)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_HOME_SEARCH_RESULTS_OWN_MOB_LABEL")}`}
                        text={t(ele.mobileNumber)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_NEW_OWNER_DETAILS_EMAIL_LABEL")}`}
                        text={t(ele.emailId || t("CS_NA"))}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_NEW_OWNER_DETAILS_FATHER_NAME_LABEL")}`}
                        text={t(ele.fatherOrHusbandName)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        label={`${t("TL_COMMON_RELATIONSHIP_LABEL")}`}
                        text={t(ele.relationship)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                    </div>
                  );
                })}
                <CardSectionHeader>{t("TL_NEW_TRADE_DETAILS_TRADE_UNIT_HEADER")}</CardSectionHeader>
                {application?.tradeLicenseDetail?.tradeUnits?.map((ele, index) => {
                  return (
                    <div key={index} style={multiBoxStyle}>
                      <CardSectionHeader style={multiHeaderStyle}>
                        {t("TL_NEW_TRADE_DETAILS_TRADE_UNIT_HEADER")} {index + 1}
                      </CardSectionHeader>
                      <Row
                        className="border-none"
                        label={t("TL_NEW_TRADE_DETAILS_TRADE_CAT_LABEL")}
                        text={t(`TRADELICENSE_TRADETYPE_${ele?.tradeType.split(".")[0]}`)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        // style={{ border: "none" }}
                        label={t("TL_NEW_TRADE_DETAILS_TRADE_TYPE_LABEL")}
                        text={t(`TRADELICENSE_TRADETYPE_${ele?.tradeType.split(".")[1]}`)}
                        textStyle={{ wordBreak: "break-word" }}
                      />
                      <Row
                        className="border-none"
                        // style={{ border: "none" }}
                        label={t("TL_NEW_TRADE_DETAILS_TRADE_SUBTYPE_LABEL")}
                        text={t(`TRADELICENSE_TRADETYPE_${ele?.tradeType?.replace(/[.-]/g, "_")}`)}
                        textStyle={{ wordBreak: "break-word" }}
                        // textStyle={{ whiteSpace: "pre-wrap", width: "70%", wordBreak:"break-word" }}
                      />
                    </div>
                  );
                })}
                {Array.isArray(application?.tradeLicenseDetail?.accessories) && application?.tradeLicenseDetail?.accessories.length > 0 && (
                  <CardSectionHeader style={{ paddingTop: "7px" }}>{t("TL_NEW_TRADE_DETAILS_HEADER_ACC")}</CardSectionHeader>
                )}
                {Array.isArray(application?.tradeLicenseDetail?.accessories) &&
                  application?.tradeLicenseDetail?.accessories.length > 0 &&
                  application?.tradeLicenseDetail?.accessories?.map((ele, index) => {
                    return (
                      <div key={index} style={multiBoxStyle}>
                        {/* <CardSectionHeader style={multiHeaderStyle}>
                        {t("TL_ACCESSORY_LABEL")} {index + 1}
                      </CardSectionHeader> */}
                        <Row
                          className="border-none"
                          // style={{ border: "none" }}
                          label={t("TL_REVIEWACCESSORY_TYPE_LABEL")}
                          text={t(`TL_${ele?.accessoryCategory.split("-").join("_")}`)}
                          textStyle={{ wordBreak: "break-word" }}
                        />
                        <Row
                          className="border-none"
                          label={t("TL_NEW_TRADE_ACCESSORY_COUNT")}
                          text={ele?.count}
                          textStyle={{ wordBreak: "break-word" }}
                        />
                        <Row
                          className="border-none"
                          label={t("TL_NEW_TRADE_DETAILS_UOM_LABEL")}
                          text={ele?.uom}
                          textStyle={{ wordBreak: "break-word" }}
                        />
                        <Row
                          className="border-none"
                          label={t("TL_NEW_TRADE_DETAILS_UOM_VALUE_LABEL")}
                          text={ele?.uomValue}
                          textStyle={{ wordBreak: "break-word" }}
                        />
                      </div>
                    );
                  })}
                {PTData?.Properties && PTData?.Properties.length > 0 && (
                  <div>
                    <CardSubHeader>{t("PT_DETAILS")}</CardSubHeader>
                    <Row
                      className="border-none"
                      label={t("TL_PROPERTY_ID")}
                      text={PTData?.Properties?.[0]?.propertyId}
                      textStyle={{ wordBreak: "break-word" }}
                    />
                    <Row
                      className="border-none"
                      label={t("PT_OWNER_NAME")}
                      text={PTData?.Properties?.[0]?.owners[0]?.name}
                      textStyle={{ wordBreak: "break-word" }}
                    />
                    <Row className="border-none" label={t("PROPERTY_ADDRESS")} text={propertyAddress} />
                    <LinkButton
                      style={{ textAlign: "left" }}
                      label={t("TL_VIEW_PROPERTY_DETAIL")}
                      onClick={() => {
                        history.push(
                          `/digit-ui/citizen/commonpt/view-property?propertyId=${PTData?.Properties?.[0]?.propertyId}&tenantId=${PTData?.Properties?.[0]?.tenantId}`
                        );
                      }}
                    ></LinkButton>
                  </div>
                )}
                <Row label="" />
                {!(PTData?.Properties && PTData?.Properties.length > 0) && (
                  <Row
                    className="border-none"
                    // style={{ border: "none" }}
                    label={t("TL_LOCALIZATION_TRADE_ADDRESS")}
                    text={`${
                      application?.tradeLicenseDetail?.address?.doorNo?.trim() ? `${application?.tradeLicenseDetail?.address?.doorNo?.trim()}, ` : ""
                    } ${
                      application?.tradeLicenseDetail?.address?.street?.trim() ? `${application?.tradeLicenseDetail?.address?.street?.trim()}, ` : ""
                    }${t(application?.tradeLicenseDetail?.address?.locality?.name)}, ${t(application?.tradeLicenseDetail?.address?.city)} ${
                      application?.tradeLicenseDetail?.address?.pincode?.trim() ? `,${application?.tradeLicenseDetail?.address?.pincode?.trim()}` : ""
                    }`}
                    textStyle={{ wordBreak: "break-word" }}
                    // textStyle={{ whiteSpace: "pre-wrap", width: "70%", wordBreak:"break-word" }}
                  />
                )}
                <CardSubHeader>{t("TL_COMMON_DOCS")}</CardSubHeader>
                <div>
                  {application?.tradeLicenseDetail?.applicationDocuments?.length > 0 ? (
                    <TLDocument value={{ ...application }}></TLDocument>
                  ) : (
                    <StatusTable>
                      <Row text={t("TL_NO_DOCUMENTS_MSG")} />
                    </StatusTable>
                  )}
                </div>
                {/* {workflowDocs?.length > 0 && (
                  <div>
                    <CardSubHeader>{t("TL_TIMELINE_DOCS")}</CardSubHeader>
                    <div>
                      {workflowDocs?.length > 0 ? (
                        <TLDocument value={{ workflowDocs: workflowDocs }}></TLDocument>
                      ) : (
                        <StatusTable>
                          <Row text={t("TL_NO_DOCUMENTS_MSG")} />
                        </StatusTable>
                      )}
                    </div>
                  </div>
                )} */}
                <div id="timeline">
                  {/* <TLWFApplicationTimeline application={application} id={id} /> */}
                  <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
                  {application?.status === "CITIZENACTIONREQUIRED" ? (
                    <Link
                      to={{
                        pathname: `/digit-ui/citizen/tl/tradelicence/edit-application/${application?.applicationNumber}/${application?.tenantId}`,
                        state: {},
                      }}
                    >
                      <SubmitBar label={t("COMMON_EDIT")} />
                    </Link>
                  ) : null}
                </div>
                {/* //TODO: change the actions to be fulfilled from workflow nextactions */}
                {/* {application?.status === "PENDINGPAYMENT" ? (
                  <Link
                    to={{
                      pathname: `/digit-ui/citizen/payment/collect/${application?.businessService}/${application?.applicationNumber}`,
                      state: { bill, tenantId: tenantId },
                    }}
                  >
                    <SubmitBar label={t("COMMON_MAKE_PAYMENT")} />
                  </Link>
                ) : null} */}
              </div>
            );
          })}
        </Card>
      )}
      {/* {!workflowDetails?.isLoading && actions?.length && isActionRenew() && (
        <ActionBar>
          {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
            <Menu
              localeKeyPrefix={`WF_EMPLOYEE_${businessService?.toUpperCase()}`}
              options={actions}
              optionKey={"action"}
              t={t}
              onSelect={onActionSelect}
            />
          ) : null}
          <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
        </ActionBar>
      )} */}
    </React.Fragment>
  );
};

export default TLApplicationDetails;
