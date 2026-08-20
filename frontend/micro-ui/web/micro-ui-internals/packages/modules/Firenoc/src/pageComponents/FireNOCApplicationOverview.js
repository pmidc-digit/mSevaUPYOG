import React, { useState, useEffect } from "react";
import { useParams, useLocation, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header, Loader, Card, CardSectionHeader, StatusTable, Row, SubmitBar, ActionBar, MultiLink, Menu, Toast } from "@mseva/digit-ui-react-components";
import { getNOCAcknowledgementData } from "../utils/getNOCAcknowledgementData";
import getNOCSanctionLetter from "../utils/getNOCSanctionLetter"
import NOCModal from "./NOCModal";
import NOCDocumentTableView from "./NOCDocumentTableView";

const formatDate = (epoch) => {
  if (!epoch) return "-";
  const d = new Date(epoch);
  if (isNaN(d.getTime())) return "-";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const StatusBadge = ({ status }) => {
  const colorMap = {
    INITIATED: "#f0a500",
    APPLIED: "#1858b8",
    APPROVED: "#00703c",
    REJECTED: "#d4351c",
    CANCELLED: "#888",
  };
  const color = colorMap[status] || "#505A5F";
  return (
    <span
      style={{
        background: `${color}1a`,
        color,
        border: `1px solid ${color}`,
        borderRadius: "12px",
        padding: "2px 10px",
        fontSize: "13px",
        fontWeight: "600",
      }}
    >
      {status || "-"}
    </span>
  );
};

const FireNOCApplicationOverview = () => {
  const { appNo, id } = useParams();
  const applicationNo = appNo || id;
  const location = useLocation();
  const history = useHistory();
  const { t } = useTranslation();

  const customT = (key) => {
    const translations = {
      WF_EMPLOYEE_NOC_REFER: t("WF_EMPLOYEE_NOC_REFER") !== "WF_EMPLOYEE_NOC_REFER" ? t("WF_EMPLOYEE_NOC_REFER") : "Refer",
      WF_EMPLOYEE_NOC_SENDBACKTOCITIZEN: t("WF_EMPLOYEE_NOC_SENDBACKTOCITIZEN") !== "WF_EMPLOYEE_NOC_SENDBACKTOCITIZEN" ? t("WF_EMPLOYEE_NOC_SENDBACKTOCITIZEN") : "Send Back to Citizen",
      WF_EMPLOYEE_NOC_REJECT: t("WF_EMPLOYEE_NOC_REJECT") !== "WF_EMPLOYEE_NOC_REJECT" ? t("WF_EMPLOYEE_NOC_REJECT") : "Reject",
      WF_EMPLOYEE_NOC_FORWARD: t("WF_EMPLOYEE_NOC_FORWARD") !== "WF_EMPLOYEE_NOC_FORWARD" ? t("WF_EMPLOYEE_NOC_FORWARD") : "Forward",
      WF_EMPLOYEE_NOC_APPROVE: t("WF_EMPLOYEE_NOC_APPROVE") !== "WF_EMPLOYEE_NOC_APPROVE" ? t("WF_EMPLOYEE_NOC_APPROVE") : "Approve",
    };
    if (translations[key]) return translations[key];
    return t(key);
  };

  const queryParams = new URLSearchParams(location.search);
  const tenantId = queryParams.get("tenantId") || Digit.ULBService.getCurrentTenantId() || Digit.ULBService.getStateId();

  const { isLoading, data: fireNOC } = Digit.Hooks.firenoc.useFIRENOCApplicationDetails({
    tenantId,
    applicationNumber: applicationNo,
  });

  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const [payment, setPayment] = useState(null);
  const [workflow, setWorkflow] = useState([]);
  const [showOptions, setShowOptions] = useState(false);

  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [getEmployees, setEmployees] = useState([]);
  const [getWorkflowService, setWorkflowService] = useState([]);
  const [loading, setLoading] = useState(false);
  const cities = Digit.Hooks.useTenants();
  
  
  const menuRef = React.useRef();

  const isEmployee = window.location.href.includes("/employee/");
  const user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);

  const { isLoading: iswfLoading, data: wfdata } = Digit.Hooks.useWorkflowDetails(
    {
      tenantId: tenantId,
      id: applicationNo,
      moduleCode: fireNOC?.fireNOCDetails?.additionalDetails?.businessService || "FIRENOC",
    },
    {
      enabled: !!fireNOC,
    }
  );

  const actions =
    wfdata?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    wfdata?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });
    
    console.log("actions",actions)

  useEffect(() => {
    if (!tenantId) return;
    (async () => {
      try {
        const wf = await Digit.WorkflowService.init(tenantId, "FIRENOC");
        setWorkflowService(wf?.BusinessServices?.[0]?.states);
      } catch (e) { }
    })();
  }, [tenantId]);

  const onActionSelect = (action) => {
    console.log("Action selected:", action?.action);

    if (action?.action === "EDIT") {
      const basePath = isEmployee ? "/digit-ui/employee/firenoc" : "/digit-ui/citizen/firenoc";
      history.push(`${basePath}/edit-application/${applicationNo}?tenantId=${tenantId}`);
      return;
    }
    if (action?.action === "PAY") {
      const redirectPath = isEmployee
        ? `/digit-ui/employee/payment/collect/FIRENOC/${applicationNo}/${tenantId}?tenantId=${tenantId}`
        : `/digit-ui/citizen/payment/collect/FIRENOC/${applicationNo}?tenantId=${tenantId}`;
      history.push(redirectPath);
      return;
    }
    if (action?.action === "APPLY" || action?.action === "APPROVE") {
      console.log(`${action.action} action selected - submitting directly without modal`);
      const payload = {
        FireNOCs: [{
          ...fireNOC,
          fireNOCDetails: {
            ...fireNOC?.fireNOCDetails,
            action: action.action
          }
        }]
      };
      submitAction(payload);
      setDisplayMenu(false);
      return;
    }

    const filterNexState = action?.state?.actions?.filter((item) => item.action === action?.action) || [];
    const nextStateUuid = filterNexState?.[0]?.nextState;
    const filterRoles = nextStateUuid ? getWorkflowService?.filter((item) => item?.uuid === nextStateUuid) : [];
    setEmployees(filterRoles?.[0]?.actions || []);

    setSelectedAction(action);
    setShowModal(true);
  };

  const submitAction = async (data) => {
    try {
      await Digit.FIRENOCService.update({ tenantId, details: data });
      setShowToast({ key: "true", message: "WF_ACTION_SUCCESS" });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setShowToast({ key: "true", error: true, message: error?.Errors?.[0]?.message || error?.message || "Workflow update failed" });
    }
  };

  useEffect(() => {
    if (!applicationNo || !tenantId) return;
    const authToken = Digit.UserService.getUser()?.access_token || "";
    fetch(
      `/collection-services/payments/FIRENOC/_search?tenantId=${encodeURIComponent(tenantId)}&consumerCodes=${encodeURIComponent(applicationNo)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          RequestInfo: {
            apiId: "Rainmaker",
            ver: ".01",
            action: "",
            did: "1",
            key: "",
            msgId: `${Date.now()}|en_IN`,
            requesterId: "",
            authToken,
          },
        }),
      }
    )
      .then((r) => r.json())
      .then((data) => setPayment(data?.Payments?.[0] || null))
      .catch(() => { });
  }, [applicationNo, tenantId]);

  useEffect(() => {
    if (!applicationNo || !tenantId) return;
    const authToken = Digit.UserService.getUser()?.access_token || "";
    fetch(
      `/egov-workflow-v2/egov-wf/process/_search?businessIds=${encodeURIComponent(applicationNo)}&history=true&tenantId=${encodeURIComponent(tenantId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        body: JSON.stringify({
          RequestInfo: { apiId: "Mihy", ver: ".01", action: "", did: "1", key: "", msgId: `${Date.now()}|en_IN`, requesterId: "", authToken },
        }),
      }
    )
      .then((r) => r.json())
      .then((data) => setWorkflow([...(data?.ProcessInstances || [])].reverse()))
      .catch(() => { });
  }, [applicationNo, tenantId]);

  if (isLoading || loading) return <Loader />;
  if (!fireNOC)
    return (
      <Card style={{ textAlign: "center", marginTop: "40px" }}>
        {t("COMMON_NO_DATA_FOUND")}
      </Card>
    );

  const details = fireNOC.fireNOCDetails;
  const owners = details?.applicantDetails?.owners || [];
  const buildings = details?.buildings || [];
  const address = details?.propertyDetails?.address;

  const remainingDocs = (fireNOC?.documents || details?.applicantDetails?.additionalDetail?.ownerAuditionalDetail?.documents || [])
    ?.filter(
      (doc) =>
        doc?.documentType !== "OWNER.SITEPHOTOGRAPHONE" &&
        doc?.documentType !== "OWNER.SITEPHOTOGRAPHTWO"
    )
    ?.map((doc) => ({
      ...doc,
      documentUid: doc?.documentUid || doc?.fileStoreId || doc?.filestoreId || doc?.uuid || "",
      documentAttachment: doc?.documentAttachment || doc?.fileStoreId || doc?.filestoreId || doc?.uuid || "",
    }));

  const paymentDetail = payment?.paymentDetails?.[0];
  const appStatus = details?.status || fireNOC?.status || fireNOC?.applicationStatus || "";
  const isPendingPayment = appStatus === "PENDINGPAYMENT";
  const isEditable =
    appStatus === "CITIZENACTIONREQUIRED" ||
    appStatus === "SENDBACKTOCITIZEN" ||
    appStatus === "CITIZEN_ACTION_REQUIRED" ||
    appStatus === "INITIATED"  ||
    wfdata?.nextActions?.some(action => action.action === "EDIT" || action.action === "RESUBMIT") ||
    wfdata?.actionState?.nextActions?.some(action => action.action === "EDIT" || action.action === "RESUBMIT");
  
    const isResumable = appStatus === "INITIATED";


  const getRecieptSearch = async ({ tenantId, payments, pdfkey, EmpData = null, ...params }) => {
    try {
      setLoading(true);
      const nocSanctionData = await getNOCSanctionLetter({application: fireNOC, t, EmpData});
      let filestoreID = null;
        try {
          const response = await Digit.PaymentService.generatePdf(
            tenantId,
            { Payments: [{ ...payments, Noc: nocSanctionData.Noc , tenantId }] },
            pdfkey
          );
          filestoreID = response?.filestoreIds[0];
        } finally {
          setLoading(false);
        }

      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: filestoreID,
      });
      window.open(fileStore[filestoreID], "_blank")
    } finally {
      setLoading(false);
    }
  };

  const getSanctionLetter = async ({ tenantId, payments, pdfkey, EmpData, ...params }) => {
    try {
      setLoading(true);
      

      const tenantCode = address?.city; 
      
      const matchedCity = cities?.status === "success" && cities?.data?.find((city) => city?.code === tenantCode);
      console.log(matchedCity, "matchedCity");
      
      const nocSanctionData = await getNOCSanctionLetter({application: fireNOC, t, EmpData , matchedCity : matchedCity});

      const prevGetLang = Digit.StoreData.getCurrentLanguage;
      console.log("prevGetLang", prevGetLang);
      Digit.StoreData.getCurrentLanguage = () => "pn_IN";

      let response = null;
      try {
        response = await Digit.PaymentService.generatePdf(tenantId, { Payments: [{ ...payments, Noc: nocSanctionData.Noc }] }, pdfkey);
      } finally {
        Digit.StoreData.getCurrentLanguage = prevGetLang;
        setLoading(false);
      }

      const fileStore = await Digit.PaymentService.printReciept(tenantId, {
        fileStoreIds: response?.filestoreIds[0],
      });
      window.open(fileStore[response?.filestoreIds[0]], "_blank")
    } finally {
      setLoading(false);
    }
  };

  const dowloadOptions =
  payment &&
  details?.status !== "CANCELLED" &&
  details?.status !== "PENDINGPAYMENT"
    ? [
        // Show receipt for APPROVED and all other active statuses
        {
          label: t("CS_COMMON_PAYMENT_RECEIPT"),
          onClick: () =>
            getRecieptSearch({
              tenantId: paymentDetail?.tenantId,
              payments: payment,
              pdfkey: "firenocreceipt",
            }),
        },

        // Show NOC Certificate only when APPROVED
        ...(details?.status === "APPROVED"
          ? [
              {
                label: t("NOC_CERTIFICATE"),
                onClick: () =>
                  getSanctionLetter({
                    tenantId: paymentDetail?.tenantId,
                    payments: payment,
                    pdfkey: "firenoc-sanctionletter",
                  }),
              },
            ]
          : []),

        {
          label: t("NOC_APPLICATION_FORM"),
          onClick: () => getRecieptSearch({ tenantId: paymentDetail?.tenantId || tenantId, payments: payment, pdfkey: "firenoc-application" }),
        },
      ]
    : [
        {
          label: t("NOC_APPLICATION_FORM"),
          onClick: () => getRecieptSearch({ tenantId: paymentDetail?.tenantId || tenantId, payments: payment, pdfkey: "firenoc-application" }),
        },
      ];

  return (
    <div className="employee-main-application-details" style={{ paddingBottom: "80px" }}>
      <div className="cardHeaderWithOptions">
        <Header>{t("NOC_APPLICATION_DETAILS")}</Header>
        <MultiLink
          className="multilinkWrapper"
          onHeadClick={() => setShowOptions(!showOptions)}
          displayOptions={showOptions}
          options={dowloadOptions}
        />
      </div>
      <div style={{ padding: "24px" }}>

        {/* Application Summary */}
        <Card>
          <CardSectionHeader>{t("NOC_APPLICATION_SUMMARY")}</CardSectionHeader>
          <StatusTable>
            <Row label={t("NOC_APPLICATION_NUMBER")} text={details?.applicationNumber || "-"} />
            <Row label={t("NOC_FIRENOC_NUMBER")} text={fireNOC.fireNOCNumber || "-"} />
            <Row
              label={t("NOC_APPLICATION_STATUS")}
              text={<StatusBadge status={details?.status} />}
            />
            <Row label={t("NOC_FIRENOC_TYPE")} text={details?.fireNOCType || "-"} />
            <Row label={t("NOC_FIRESTATION_ID")} text={details?.firestationId || "-"} />
            <Row label={t("NOC_APPLICATION_DATE")} text={formatDate(details?.applicationDate)} />
            {details?.additionalDetail?.validityYears && (
              <Row label={t("NOC_VALID_TILL")} text={`${details?.additionalDetail?.validityYears} Year(s)`} />
            )}
          </StatusTable>
        </Card>

        {/* Applicant Details */}
        <Card style={{ marginTop: "16px" }}>
          <CardSectionHeader>{t("NOC_APPLICANT_DETAILS")}</CardSectionHeader>
          <StatusTable>
            <Row
              label={t("PT_OWNERSHIP_TYPE")}
              text={details?.applicantDetails?.ownerShipType?.replace("INDIVIDUAL.", "") || "-"}
            />
          </StatusTable>
          {owners.map((owner, index) => (
            <div key={index} style={index > 0 ? { marginTop: "20px", borderTop: "1px solid #efefef", paddingTop: "16px" } : { marginTop: "12px" }}>
              <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "12px", color: "#505A5F" }}>
                {owners.length > 1 ? `${t("NOC_OWNER")} ${index + 1}` : ""}
              </div>
              <StatusTable>
                <Row label={t("NOC_OWNER_NAME")} text={owner?.name || "-"} />
                <Row label={t("NOC_MOBILE_NUMBER")} text={owner?.mobileNumber || "-"} />
                <Row label={t("NOC_GENDER")} text={owner?.gender || "-"} />
                <Row label={t("NOC_FATHER_HUSBAND_NAME")} text={owner?.fatherOrHusbandName || "-"} />
                <Row label={t("NOC_RELATIONSHIP")} text={owner?.relationship || "-"} />
                <Row label={t("NOC_EMAIL_ID")} text={owner?.emailId || "-"} />
                <Row label={t("NOC_CORRESPONDENCE_ADDRESS")} text={owner?.correspondenceAddress || "-"} />
              </StatusTable>
            </div>
          ))}
        </Card>

        {/* Site / Property Details */}
        <Card style={{ marginTop: "16px" }}>
          <CardSectionHeader>{t("NOC_SITE_DETAILS")}</CardSectionHeader>
          <StatusTable>
            <Row label={t("NOC_CITY")} text={address?.city || address?.tenantId || "-"} />
            <Row label={t("NOC_AREA_TYPE")} text={address?.areaType || "-"} />
            <Row label={t("NOC_LOCALITY")} text={address?.locality?.code || "-"} />
          </StatusTable>
        </Card>

        {/* Building Details */}
        {/* Building Details */}
        {buildings.length > 0 && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_BUILDING_DETAILS")}</CardSectionHeader>
            {buildings.map((b, index) => {
              const uomMap = {};
              b?.uoms?.filter((u) => u.active).forEach((u) => {
                uomMap[u.code] = u.value;
              });

              return (
                <div key={b.id || index} style={index > 0 ? { marginTop: "20px", borderTop: "1px solid #efefef", paddingTop: "16px" } : {}}>
                  {buildings.length > 1 && (
                    <div style={{ fontWeight: "700", fontSize: "16px", marginBottom: "12px", color: "#505A5F" }}>
                      {`${t("NOC_BUILDING")} ${index + 1}`}
                    </div>
                  )}
                  <StatusTable>
                    <Row label={t("NOC_BUILDING_NAME")} text={b.name || "-"} />
                    <Row label={t("NOC_USAGE_TYPE")} text={b.usageType || "-"} />
                    <Row label={t("NOC_USAGE_SUB_TYPE")} text={b.usageSubType || "-"} />
                    {uomMap["NO_OF_FLOORS"] !== undefined && (
                      <Row label={t("NOC_NO_OF_FLOORS")} text={String(uomMap["NO_OF_FLOORS"])} />
                    )}
                    {uomMap["NO_OF_BASEMENTS"] !== undefined && (
                      <Row label={t("NOC_NO_OF_BASEMENTS")} text={String(uomMap["NO_OF_BASEMENTS"])} />
                    )}
                    {uomMap["BUILTUP_AREA"] !== undefined && (
                      <Row label={t("NOC_GROUND_FLOOR_BUILTUP_AREA")} text={`${uomMap["BUILTUP_AREA"]} sq.m`} />
                    )}
                    {uomMap["HEIGHT_OF_BUILDING"] !== undefined && (
                      <Row label={t("NOC_HEIGHT_OF_BUILDING")} text={`${uomMap["HEIGHT_OF_BUILDING"]} m`} />
                    )}
                    {b.landArea && (
                      <Row label={t("NOC_PLOT_AREA")} text={`${b.landArea} sq.m`} />
                    )}
                    {b.totalCoveredArea && (
                      <Row label={t("NOC_COVERED_AREA")} text={`${b.totalCoveredArea} sq.m`} />
                    )}
                    {b.parkingArea && (
                      <Row label={t("NOC_PARKING_AREA")} text={`${b.parkingArea} sq.m`} />
                    )}
                    {b.leftSurrounding && (
                      <Row label={t("NOC_LEFT_SURROUNDING")} text={b.leftSurrounding} />
                    )}
                    {b.rightSurrounding && (
                      <Row label={t("NOC_RIGHT_SURROUNDING")} text={b.rightSurrounding} />
                    )}
                    {b.frontSurrounding && (
                      <Row label={t("NOC_FRONT_SURROUNDING")} text={b.frontSurrounding} />
                    )}
                    {b.backSurrounding && (
                      <Row label={t("NOC_BACK_SURROUNDING")} text={b.backSurrounding} />
                    )}
                  </StatusTable>
                </div>
              );
            })}
          </Card>
        )}

        {/* Payment Details */}
        {payment && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_PAYMENT_DETAILS")}</CardSectionHeader>
            <StatusTable>
              <Row
                label={t("PAYMENT_AMOUNT_PAID")}
                text={`₹ ${payment.totalAmountPaid?.toLocaleString("en-IN") || "-"}`}
              />
              <Row label={t("PAYMENT_MODE")} text={payment.paymentMode || "-"} />
              <Row
                label={t("PAYMENT_RECEIPT_NUMBER")}
                text={paymentDetail?.receiptNumber || "-"}
              />
              <Row
                label={t("PAYMENT_TRANSACTION_DATE")}
                text={formatDate(payment.transactionDate)}
              />
            </StatusTable>
          </Card>
        )}

        {/* Documents */}
        {remainingDocs?.length > 0 && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_DOCUMENTS")}</CardSectionHeader>
            <StatusTable>
              <NOCDocumentTableView documents={remainingDocs} />
            </StatusTable>
          </Card>
        )}
        {/* Application Timeline */}
        {workflow.length > 0 && (
          <Card style={{ marginTop: "16px" }}>
            <CardSectionHeader>{t("NOC_APPLICATION_TIMELINE")}</CardSectionHeader>
            <div style={{ paddingTop: "8px" }}>
              {workflow.map((step, idx) => {
                const stStatus = step.state?.applicationStatus;
                const dotColor =
                  stStatus === "APPROVED" ? "#00703c" :
                    stStatus === "REJECTED" || stStatus === "CANCELLED" ? "#d4351c" : "#1858b8";
                return (
                  <div key={step.id || idx} style={{ display: "flex", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "16px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                      {idx < workflow.length - 1 && (
                        <div style={{ width: "2px", background: "#b0bec5", flexGrow: 1, minHeight: "24px", marginTop: "2px" }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: idx === workflow.length - 1 ? 0 : "20px" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#0b0c0c" }}>
                        {t(`WF_${stStatus || step.action}`) !== `WF_${stStatus || step.action}` ? t(`WF_${stStatus || step.action}`) : (stStatus || step.action || "-")}
                      </div>
                      {step.action && (
                        <div style={{ fontSize: "12px", color: "#505A5F", marginTop: "2px" }}>
                          {t("NOC_WF_ACTION")}: <strong>{step.action}</strong>
                        </div>
                      )}
                      {step.assigner?.name && (
                        <div style={{ fontSize: "12px", color: "#505A5F" }}>
                          {t("NOC_WF_BY")}: {step.assigner.name}
                        </div>
                      )}
                      {step.auditDetails?.createdTime && (
                        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                          {formatDate(step.auditDetails.createdTime)}
                        </div>
                      )}
                      {step.comment && (
                        <div style={{ fontSize: "12px", color: "#505A5F", fontStyle: "italic", marginTop: "2px" }}>
                          "{step.comment}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>
      {isPendingPayment && (
        <ActionBar>
          <SubmitBar
            label={t("NOC_PAY_NOW")}
            onSubmit={() => {
              const redirectPath = isEmployee
                ? `/digit-ui/employee/payment/collect/FIRENOC/${applicationNo}/${tenantId}?tenantId=${tenantId}`
                : `/digit-ui/citizen/payment/collect/FIRENOC/${applicationNo}?tenantId=${tenantId}`;
              history.push(redirectPath);
            }}
          />
        </ActionBar>
      )}
      {isResumable && (
        <ActionBar>
          <SubmitBar
            label={t("TL_RESUME_APPLICATION")}
            onSubmit={() => {
              const basePath = "/digit-ui/citizen/firenoc";
              history.push(`${basePath}/edit-application/${applicationNo}?tenantId=${tenantId}`);
            }}
          />
        </ActionBar>
      )}

      {(() => {
        // Only inject EDIT manually as a nav shortcut.
        const hasEditInWorkflow = (actions || []).some((a) => a.action === "EDIT");
        const editItem = isEditable && !hasEditInWorkflow ? [{ action: "EDIT", _isNavAction: true }] : [];
        // Filter EDIT from workflow actions only if we injected it manually (avoid duplicate)
        let filteredActions = (actions || []).filter((a) => a.action !== "EDIT");
        // If the application is in INITIATED stage, only show the APPLY action
        if (appStatus === "INITIATED") {
          filteredActions = filteredActions.filter((a) => a.action === "APPLY");
        }
        const menuActions = [...editItem, ...filteredActions]?.filter((action) => action?.action != "ADHOC");
        if (menuActions.length === 0) return null;
        return (
          <ActionBar>
            {displayMenu ? (
              <Menu
                localeKeyPrefix={`WF_EMPLOYEE_NOC`}
                options={menuActions}
                optionKey={"action"}
                t={(key) => {
                  if (key === "WF_EMPLOYEE_NOC_EDIT") return t("COMMON_EDIT") !== "COMMON_EDIT" ? t("COMMON_EDIT") : "Edit";
                  if (key === "WF_EMPLOYEE_NOC_RESUBMIT") return t("NOC_RESUBMIT") !== "NOC_RESUBMIT" ? t("NOC_RESUBMIT") : "Resubmit";
                  return customT(key);
                }}
                onSelect={onActionSelect}
              />
            ) : null}
            <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          </ActionBar>
        );
      })()}

      {showModal ? (
        <NOCModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          state={tenantId?.split(".")[0]}
          getEmployees={getEmployees}
          id={applicationNo}
          applicationDetails={{ Noc: [fireNOC] }}
          applicationData={[fireNOC]}
          closeModal={() => setShowModal(false)}
          submitAction={submitAction}
          actionData={wfdata?.timeline}
          workflowDetails={wfdata}
          showToast={showToast}
          setShowToast={setShowToast}
          closeToast={() => setShowToast(null)}
          businessService={details?.additionalDetails?.businessService || "FIRENOC"}
          moduleCode="FIRENOC"
          isEmployee={isEmployee}
        />
      ) : null}

      {showToast && (
        <Toast error={showToast?.error} warning={showToast?.warning} label={t(showToast?.message)} isDleteBtn={true} onClose={() => setShowToast(null)} />
      )}
    </div>
  );
};

export default FireNOCApplicationOverview;
