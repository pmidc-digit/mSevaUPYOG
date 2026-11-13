import {
  Card,
  CardSubHeader,
  Header,
  Row,
  StatusTable,
  CardSectionHeader,
  Toast,
  ActionBar,
  Menu,
  SubmitBar,
  MultiLink,
  PaymentHistory,
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import RALDocuments from "../../components/RALDocument";
import { useParams, useHistory, Link } from "react-router-dom";
// import { Loader } from "../../components/Loader";
import { Loader } from "../../../../challanGeneration/src/components/Loader";
// import ApplicationTimeline from "../../../../templates/ApplicationDetails/components/ApplicationTimeline";
import RALModal from "../../pageComponents/RALModal";
import NewApplicationTimeline from "../../../../templates/ApplicationDetails/components/NewApplicationTimeline";
import { convertEpochToDate, getAcknowledgementData } from "../../utils/index";

const RALApplicationDetails = () => {
  const { t } = useTranslation();
  const { acknowledgementIds, tenantId } = useParams();
  const [loader, setLoader] = useState(false);
  const state = tenantId?.split(".")[0];
  const [applicationData, setApplicationData] = useState();
  const [showToast, setShowToast] = useState(null);
  const [displayMenu, setDisplayMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};

  const [getEmployees, setEmployees] = useState([]);
  const history = useHistory();
  const [getWorkflowService, setWorkflowService] = useState([]);
  const menuRef = useRef();
  Digit.Hooks.useClickOutside(menuRef, () => setDisplayMenu(false), displayMenu);
  const { printReceipt: printBillReceipt } = Digit.Hooks.usePrintBillReceipt({ tenantId, setLoader, t, pdfkey: "rl-receipt-employee" });

  const { data: reciept_data, isLoading: recieptDataLoading } = Digit.Hooks.useRecieptSearch(
    {
      tenantId: tenantId,
      businessService: "rl-services",
      consumerCodes: acknowledgementIds,
      isEmployee: false,
    },
    { enabled: acknowledgementIds ? true : false }
  );
  const consumerCode = applicationData?.consumerCode || applicationData?.applicationNumber || acknowledgementIds;
  const isApprovedApplication = applicationData?.status === "APPROVED";

  const { data: dueBillData } = Digit.Hooks.useFetchPayment(
    {
      tenantId,
      consumerCode,
      businessService: "rl-services",
    },
    {
      enabled: Boolean(isApprovedApplication && consumerCode && tenantId),
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const activeBills = (dueBillData?.Bill || []).filter((bill) => !bill?.status || bill.status === "ACTIVE");
  const primaryBill = activeBills[0];
  const dueBillDetails = activeBills.flatMap((bill) => bill?.billDetails || []);
  const hasMultipleBillDetails = dueBillDetails.length > 1;
  const hasExplicitBillTotal = activeBills.some((bill) => bill?.totalAmount != null);
  const billsTotal = activeBills.reduce((sum, bill) => sum + (Number.isFinite(Number(bill?.totalAmount)) ? Number(bill.totalAmount) : 0), 0);
  const detailsTotal = dueBillDetails.reduce((sum, detail) => sum + (Number.isFinite(Number(detail?.amount)) ? Number(detail.amount) : 0), 0);
  const totalDueAmount = hasMultipleBillDetails ? detailsTotal : hasExplicitBillTotal ? billsTotal : detailsTotal;

  const formatINR = (amount) => {
    const num = Number(amount);
    const safeAmount = Number.isFinite(num) ? num : 0;
    return `₹ ${safeAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAddAdhoc = () => {
    const adhocAction = actions?.find((act) => act?.action === "APPLY_ADHOC" || act?.action === "ADHOC_PENALTY" || act?.action === "ADHOC_REBATE") || {
      action: "APPLY_ADHOC",
      forcedName: "Apply Adhoc(Penalty/Rebate)",
    };
    setSelectedAction(adhocAction);
    setShowModal(true);
  };

  const handleCollectPayment = () => {
    history.push(`/digit-ui/employee/payment/collect/rl-services/${consumerCode}/${tenantId}`);
  };

  const fetchApplications = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.RentAndLeaseService.search({ tenantId, filters });
      setApplicationData(responseData?.AllotmentDetails?.[0]);
    } catch (error) {
      setShowToast({ key: true, label: "Error While Fetching Application Details" });
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (acknowledgementIds) {
      const filters = { applicationNumbers: acknowledgementIds };
      fetchApplications(filters);
    }
  }, []);

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: acknowledgementIds,
    moduleCode: "RENT_N_LEASE_NEW",
    role: "EMPLOYEE",
  });

  if (workflowDetails?.data?.actionState && !workflowDetails.isLoading) {
    workflowDetails.data.actionState.nextActions = workflowDetails.data.nextActions;
  }

  const handleNavigation = () => {
    const timer = setTimeout(() => {
      history.push("/digit-ui/employee/rentandlease/inbox");
    }, 2000);

    return () => clearTimeout(timer);
  };

  const rawAdditionalDetails = applicationData?.additionalDetails || {};
  const propertyDetails = Array.isArray(rawAdditionalDetails?.propertyDetails)
    ? rawAdditionalDetails?.propertyDetails[0]
    : rawAdditionalDetails?.propertyDetails;

  const arrearDoc = rawAdditionalDetails?.arrearDoc ? [{ documentType: "Arrear Doc", fileStoreId: rawAdditionalDetails.arrearDoc }] : [];
  const allDocuments = [...(applicationData?.Document || []), ...arrearDoc];

  let user = Digit.UserService.getUser();

  const userRoles = user?.info?.roles?.map((e) => e.code);
  const isCemp = user?.info?.roles.find((role) => role.code === "RL_CEMP")?.code;
  const getAcknowledgement = async () => {
    setLoader(true);
    try {
      const applications = applicationData;
      const tenantInfo = tenants.find((tenant) => tenant.code === tenantId);
      const acknowldgementDataAPI = await getAcknowledgementData({ ...applications }, tenantInfo, t);
      setTimeout(() => {
        Digit.Utils.pdf.generate(acknowldgementDataAPI);
        setLoader(false);
      }, 0);
    } catch (error) {
      setLoader(false);
    }
  };
  const dowloadOptions = [];

  if (applicationData?.status === "APPROVED" || applicationData?.status === "CLOSED") {
    dowloadOptions.push({
      label: t("CHB_DOWNLOAD_ACK_FORM"),
      onClick: () => getAcknowledgement(),
    });
  }
  if (reciept_data && reciept_data?.Payments.length > 0 && recieptDataLoading == false) {
    dowloadOptions.push({
      label: t("PTR_FEE_RECIEPT"),
      onClick: () =>
        printBillReceipt({
          businessService: "rl-services",
          receiptNumber: acknowledgementIds,
          rootKey: "PAYMENTS",
        }),
    });
  }
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return (userRoles?.some((role) => e.roles?.includes(role)) || !e.roles) && e.action !== "EDIT";
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return (userRoles?.some((role) => e.roles?.includes(role)) || !e.roles) && e.action !== "EDIT";
    });

  if (
    actions?.some((action) => action?.action === "REQUEST_FOR_DISCONNECTION") &&
    !applicationData?.expireFlag &&
    Date.now() >= applicationData?.endDate - 15 * 24 * 60 * 60 * 1000
  ) {
    actions = [...(actions || []), { action: "RENEWAL" }];
  }

  actions = actions?.filter((action) => {
    if (action.action === "CYCLE_Bill_GENERATED") {
      return false;
    }
    if (action.action === "PAY_SETTLEMENT_AMOUNT") {
      return (
        applicationData?.amountToBeDeducted > 0 &&
        applicationData?.amountToBeDeducted - propertyDetails?.securityDeposit > 0 &&
        applicationData?.amountToBeRefund == 0
      );
    }
    if (action.action === "CLOSE") {
      return applicationData?.amountToBeRefund > 0;
    }
    return true;
  });

  if (
    (applicationData?.status === "PENDING_FOR_PAYMENT" || applicationData?.status === "APPROVED") &&
    !actions?.some((action) => action?.action === "APPLY_ADHOC" || action?.action === "ADHOC_PENALTY" || action?.action === "ADHOC_REBATE")
  ) {
    actions = [...(actions || []), { action: "APPLY_ADHOC", forcedName: "Apply Adhoc(Penalty/Rebate)" }];
  }

  const closeToast = () => {
    setShowToast(null);
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
    setShowToast(false);
  };

  const getDate = (epoch) => {
    return Digit.DateUtils.ConvertEpochToDate(epoch);
  };

  const tValue = (value) => {
    if (value === 0 || value === "0") return "0";
    if (!value) return t("CS_NA");
    if (typeof value === "object" && value !== null) {
      return t(value?.name || value?.code || "CS_NA");
    }
    return t(value);
  };

  function onActionSelect(action) {
    const payload = {
      action: [action],
    };
    console.log("action", action);

    // history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);

    const filterNexState = (action?.actions || action?.state?.actions)?.filter((item) => item.action === action?.action);

    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState?.[0]?.nextState);
    setEmployees(filterRoles?.[0]?.actions || []);

    if (action?.action == "APPLY" || action?.action == "REJECT" || action?.action == "CLOSED" || action?.action == "CLOSE") {
      submitAction(payload);
    } else if (action?.action == "PAY" || action?.action == "PAY_SETTLEMENT_AMOUNT") {
      const appNo = acknowledgementIds;
      history.push(`/digit-ui/employee/payment/collect/rl-services/${appNo}/${tenantId}`);
      // history.push(`/digit-ui/citizen/payment/my-bills/rl-services/${appNo}`);
    } else if (action?.action === "RAL_RENEWAL" || action?.action === "RENEWAL") {
      if (propertyDetails?.propertyType?.toLowerCase() === "residential") {
        handleRenewal(applicationData);
      } else {
        setShowModal(true);
        setSelectedAction(action);
      }
    } else if (action?.action == "DRAFT") {
      history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
    // else if (action?.action === "SAVEASDRAFT") {
    //   history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);
    // }
  }

  const submitAction = async (data) => {
    // setShowModal(false);
    // setSelectedAction(null);
    const payloadData = applicationData;

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    let filtData = {};
    if (data?.action) {
      filtData = {
        action: data.action[0].action,
        assignee: [],
        comment: "",
        wfDocuments: null,
      };
    } else {
      filtData = data?.Licenses?.[0];
    }

    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData.action === "SENDBACKTOCITIZEN" ? [applicationData?.auditDetails?.createdBy] : filtData?.assignee,
      comments: filtData?.comment,
      documents: filtData?.wfDocuments ? filtData?.wfDocuments : null,
    };

    if (filtData.action === "ADHOC_PENALTY") {
      updatedApplicant.additionalDetails = {
        ...updatedApplicant?.additionalDetails,
        adhocPenalty: filtData.adhocPenalty,
        adhocPenaltyReason: filtData.adhocPenaltyReason,
      };
    }
    if (filtData.action === "ADHOC_REBATE") {
      updatedApplicant.additionalDetails = {
        ...updatedApplicant?.additionalDetails,
        adhocRebate: filtData.adhocRebate,
        adhocRebateReason: filtData.adhocRebateReason,
      };
    }
    if (filtData.action === "FORWARD_FOT_SETLEMENT" && filtData?.amountToBeDeducted !== undefined) {
      updatedApplicant.amountToBeDeducted = filtData.amountToBeDeducted;
    }
    if (filtData.action === "APPROVE") {
      updatedApplicant.additionalDetails = {
        ...updatedApplicant?.additionalDetails,
        approverComment: filtData?.comment,
      };
    }

    // if (!filtData?.assignee && filtData.action == "FORWARD") {
    //   // setShowToast(true);
    //   setShowToast({ key: "error", message: "Assignee is mandatory" });
    //   setError("Assignee is mandatory");
    //   return;
    // }
    const finalPayload = {
      AllotmentDetails: [updatedApplicant],
    };
    console.log("finalPayload", finalPayload);
    // return;

    try {
      const response = await Digit.RentAndLeaseService.update({
        // tenantId,
        ...finalPayload,
      });

      if (response?.ResponseInfo?.status == "successful") {
        // ✅ Show success first
        setShowToast({ key: false, label: "Successfully updated the status" });
        // ✅ Delay navigation so toast shows
        handleNavigation();
        // setTimeout(() => {
        //   history.push("/digit-ui/employee/rentandlease/inbox");
        // }, 2000);

        setSelectedAction(null);
        setShowModal(false);
      }
    } catch (err) {
      setShowToast({ key: true, label: "Something went wrong" });
    }
  };

  useEffect(() => {
    const fetchWorkflowService = async () => {
      try {
        setLoader(true);
        const WorkflowService = await Digit.WorkflowService.init(tenantId, "RENT_N_LEASE_NEW");
        setWorkflowService(WorkflowService?.BusinessServices?.[0]?.states || []);
      } catch (error) {
        console.error("Error fetching workflow service:", error);
      } finally {
        setLoader(false);
      }
    };

    if (tenantId) {
      fetchWorkflowService();
    }
  }, [tenantId]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleRenewal = async (data) => {
    setLoader(true);
    // Calculate new dates
    const oldStart = new Date(data?.startDate);
    const oldEnd = new Date(data?.endDate);
    const duration = oldEnd - oldStart;

    // New start date is the old end date
    const newStart = new Date(oldEnd);
    // New end date is new start + duration
    const newEnd = new Date(newStart.getTime() + duration);

    // Sanitize OwnerInfo
    const sanitizedOwners = data?.OwnerInfo?.map(({ ownerId, ...rest }) => rest);

    const payload = {
      AllotmentDetails: [
        {
          tenantId: data?.tenantId,
          propertyId: data?.propertyId,
          previousApplicationNumber: data?.applicationNumber,
          OwnerInfo: sanitizedOwners,
          tradeLicenseNumber: data?.tradeLicenseNumber ? data?.tradeLicenseNumber : "",
          registrationNumber: data?.registrationNumber,
          additionalDetails: data?.additionalDetails,
          startDate: newStart.getTime(),
          endDate: newEnd.getTime(),
          workflow: {
            action: "INITIATE",
          },
          Document: null,
        },
      ],
    };

    try {
      const response = await Digit.RentAndLeaseService.create(payload);
      updateApplication(response?.AllotmentDetails?.[0]);
    } catch (error) {
      setLoader(false);
      setShowToast({ key: true, label: "Error creating renewal application" });
    }
  };

  const updateApplication = async (response) => {
    // Sanitize Documents from original applicationData: remove docId and id to treat them as new documents
    const sanitizedDocuments = applicationData?.Document?.map(({ docId, id, ...rest }) => rest);

    const payload = {
      AllotmentDetails: [
        {
          ...response,
          Document: sanitizedDocuments,
          workflow: {
            action: "APPLY",
          },
        },
      ],
    };
    try {
      await Digit.RentAndLeaseService.update(payload);
      // Refresh the current application details
      if (acknowledgementIds) {
        const filters = { applicationNumbers: acknowledgementIds };
        fetchApplications(filters);
      }
      setLoader(false);
      setShowToast({ key: false, label: "Renewal application submitted successfully" });
      // setTimeout(() => {
      //   history.push("/digit-ui/employee/rentandlease/inbox");
      // }, 2000);
      handleNavigation();
    } catch (error) {
      setLoader(false);
      setShowToast({ key: true, label: "Error updating renewal application" });
    }
  };

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions ral-app-details-header">
          <Header className="ral-header-32">{t("RENT_LEASE_APPLICATION_DETAILS")}</Header>
          {isCemp && dowloadOptions && dowloadOptions.length > 0 && (
            <MultiLink
              className="multilinkWrapper"
              onHeadClick={() => setShowOptions(!showOptions)}
              displayOptions={showOptions}
              options={dowloadOptions}
            />
          )}
        </div>
        {isApprovedApplication && totalDueAmount > 0 && (
          <Card style={{ background: "#f0f7fe", border: "1px solid #cfe2f8", boxShadow: "0 2px 8px rgba(13, 110, 168, 0.08)" }}>
            <CardSubHeader className="ral-card-subheader-24">{t("Due Payment Details")}</CardSubHeader>
            <StatusTable>
              {primaryBill?.billNumber && <Row label={t("UC_BILL_NO_LABEL")} text={tValue(primaryBill.billNumber)} />}
              {primaryBill?.billDate && <Row label={t("UC_BILL_DATE_LABEL")} text={tValue(convertEpochToDate(primaryBill.billDate))} />}
              {dueBillDetails.map((detail, index) => {
                const multipleDetails = dueBillDetails.length > 1;
                const duration = `${convertEpochToDate(detail?.fromPeriod)} to ${convertEpochToDate(detail?.toPeriod)}`;

                return (
                  <React.Fragment key={detail?.id || detail?.demandId || index}>
                    {multipleDetails && (
                      <CardSectionHeader className="ral-app-details-owner-header">
                        {t("Due Period")} {index + 1}
                      </CardSectionHeader>
                    )}
                    <Row label={t("Due Amount")} text={formatINR(detail?.amount)} />
                    {(detail?.fromPeriod || detail?.toPeriod) && <Row label={t("Duration")} text={duration} />}
                  </React.Fragment>
                );
              })}
              <Row last={true} label={t("Total Due Amount")} text={formatINR(totalDueAmount)} />
            </StatusTable>
            <div className="ral-bill-generate__actions">
              <SubmitBar label={t("Add Adhoc(Penalty/Rebate)")} onSubmit={handleAddAdhoc} className="submit-bar ral-back-btn" />
              <SubmitBar label={t("Pay")} onSubmit={handleCollectPayment} />
            </div>
          </Card>
        )}
        <Card>
          <CardSubHeader className="ral-card-subheader-24">{t("RAL_CITIZEN_DETAILS")}</CardSubHeader>
          <StatusTable>
            {applicationData?.OwnerInfo?.length ? (
              applicationData.OwnerInfo.map((owner, index) => {
                const multipleOwners = applicationData.OwnerInfo.length > 1;

                return (
                  <React.Fragment key={owner?.ownerId || index}>
                    {multipleOwners && (
                      <CardSectionHeader className="ral-app-details-owner-header">
                        {t("RAL_APPLICANT")} {index + 1}
                      </CardSectionHeader>
                    )}

                    <Row label={t("PT_OWNERSHIP_INFO_NAME")} text={tValue(owner?.name)} />
                    <Row label={t("CORE_COMMON_PROFILE_EMAIL")} text={tValue(owner?.emailId)} />
                    <Row label={t("CORE_MOBILE_NUMBER")} text={tValue(owner?.mobileNo)} />
                    {rawAdditionalDetails?.alternateMobileNumber && (
                      <Row label={t("Billing Mobile Number")} text={tValue(rawAdditionalDetails?.alternateMobileNumber)} />
                    )}
                    <Row
                      label={t("PT_COMMON_COL_ADDRESS")}
                      text={tValue(owner?.correspondenceAddress?.addressId || owner?.permanentAddress?.addressId)}
                    />

                    <Row label={t("CORE_COMMON_PINCODE")} text={tValue(owner?.correspondenceAddress?.pincode || owner?.permanentAddress?.pincode)} />
                  </React.Fragment>
                );
              })
            ) : (
              <Row label={t("OWNER")} text={t("CS_NA")} />
            )}
          </StatusTable>

          <CardSubHeader className="ral-card-subheader-24">{t("Building/Plot/Shop Details")}</CardSubHeader>
          <StatusTable>
            {applicationData?.registrationNumber && <Row label={t("RAL_REGISTRATION_NUMBER")} text={tValue(applicationData?.registrationNumber)} />}
            <Row label={t("APPLICATION_NUMBER")} text={tValue(applicationData?.applicationNumber)} />
            <Row label={t("Unit Id")} text={tValue(propertyDetails?.propertyId)} />
            <Row label={t("Building/Plot/Shop Name")} text={tValue(propertyDetails?.propertyName)} />
            <Row label={t("RAL_ALLOTMENT_TYPE")} text={tValue(propertyDetails?.allotmentType)} />
            <Row label={t("Building/Plot/Shop Type")} text={tValue(propertyDetails?.propertyType)} />
            <Row label={t("Building/Plot/Shop Locality")} text={tValue(propertyDetails?.address)} />
            <Row label={t("RAL_PROPERTY_AMOUNT")} text={tValue(propertyDetails?.baseRent)} />
            <Row label={t("PENALTY_TYPE")} text={tValue(propertyDetails?.penaltyType)} />
            <Row
              label={t("RAL_FEE_CYCLE")}
              text={
                propertyDetails?.feesPeriodCycle
                  ? tValue(propertyDetails?.feesPeriodCycle?.[0]?.toUpperCase() + propertyDetails?.feesPeriodCycle?.slice(1)?.toLowerCase())
                  : t("CS_NA")
              }
            />

            <Row label={t("Building/Plot/Shop Size")} text={tValue(propertyDetails?.propertySizeOrArea)} />
            <Row label={t("RENT_LEASE_LOCATION_TYPE")} text={tValue(propertyDetails?.locationType)} />
            <Row label={t("RAL_START_DATE")} text={tValue(getDate(applicationData?.startDate))} />
            <Row label={t("RAL_END_DATE")} text={tValue(getDate(applicationData?.endDate))} />
            {applicationData?.amountToBeDeducted > 0 && <Row label={t("RAL_PROPERTY_PENALTY")} text={tValue(applicationData?.amountToBeDeducted)} />}
            {rawAdditionalDetails?.applicationType !== "Legacy" && (
              <Row label={t("SECURITY_DEPOSIT")} text={tValue(propertyDetails?.securityDeposit)} />
            )}
            {applicationData?.amountToBeDeducted - propertyDetails?.securityDeposit > 0 && (
              <Row
                label={t("RAL_AMOUNT_TO_TAKE_FROM_CITIZEN")}
                text={tValue(applicationData?.amountToBeDeducted - propertyDetails?.securityDeposit)}
              />
            )}
            {applicationData?.amountToBeRefund > 0 && <Row label={t("RAL_AMOUNT_TO_REFUND")} text={tValue(applicationData?.amountToBeRefund)} />}
            {applicationData?.tradeLicenseNumber && (
              <Row label={t("RENT_LEASE_TRADE_LICENSE_NUMBER")} text={tValue(applicationData?.tradeLicenseNumber)} />
            )}
            {rawAdditionalDetails?.gstAmount && <Row label={t("GST")} text={tValue(rawAdditionalDetails?.gstAmount)} />}
            {rawAdditionalDetails?.rebateAmount && <Row label={t("Rebate")} text={tValue(rawAdditionalDetails?.rebateAmount)} />}
          </StatusTable>

          {rawAdditionalDetails?.applicationType === "Legacy" && (
            <React.Fragment>
              <CardSubHeader className="ral-card-subheader-24">{t("RAL_ARREAR_DETAILS")}</CardSubHeader>
              <StatusTable>
                <Row label={t("Base Arrear")} text={tValue(rawAdditionalDetails?.arrear)} />
                <Row label={t("Arrear GST")} text={rawAdditionalDetails?.arrearGST ?? "-"} />
                <Row label={t("Arrear Penalty")} text={rawAdditionalDetails?.arrearPenalty ?? "-"} />
                <Row label={t("Future Penalty")} text={rawAdditionalDetails?.futurePenalty ?? "-"} />

                <Row
                  label={t("Last Billing Period")}
                  text={rawAdditionalDetails?.lastBillingPeriod ? new Date(rawAdditionalDetails.lastBillingPeriod).toLocaleDateString("en-IN") : "-"}
                />
                <Row
                  label={t("Last Paid Upto")}
                  text={rawAdditionalDetails?.lastPaidUpto ? new Date(rawAdditionalDetails.lastPaidUpto).toLocaleDateString("en-IN") : "-"}
                />

                {rawAdditionalDetails?.lastRentRevisedDate != null && (
                  <Row
                    label={t("Last Rent Revised Date")}
                    text={
                      rawAdditionalDetails?.lastRentRevisedDate ? new Date(rawAdditionalDetails.lastRentRevisedDate).toLocaleDateString("en-IN") : "-"
                    }
                  />
                )}
                {rawAdditionalDetails?.incrementPeriodMonths != null && (
                  <Row label={t("Increment Period Months")} text={Number(rawAdditionalDetails.incrementPeriodMonths) || "-"} />
                )}
                {/* {rawAdditionalDetails?.incrementPercentage && ( */}
                <Row label={t("Increment Percentage")} text={rawAdditionalDetails?.incrementPercentage} />
                {/* )} */}
                <Row label={t("Reason")} text={tValue(rawAdditionalDetails?.arrearReason)} />
                <Row label={t("Remarks")} text={tValue(rawAdditionalDetails?.remarks)} />
                {rawAdditionalDetails?.adhocPenalty && <Row label={t("Adhoc Penalty")} text={tValue(rawAdditionalDetails?.adhocPenalty)} />}
                {rawAdditionalDetails?.adhocPenaltyReason && (
                  <Row label={t("Adhoc Penalty Reason")} text={tValue(rawAdditionalDetails?.adhocPenaltyReason)} />
                )}
              </StatusTable>
            </React.Fragment>
          )}

          <CardSubHeader className="ral-card-subheader-24-margin">{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card className="ral-app-details-docs-card">
              {allDocuments?.length > 0 ? (
                allDocuments.map((doc, index) => (
                  <div key={index}>
                    <RALDocuments value={allDocuments} Code={doc?.documentType} index={index} />
                    {t(doc?.documentType)}
                  </div>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>
        <PaymentHistory
          consumerCode={applicationData?.consumerCode || applicationData?.applicationNumber || acknowledgementIds}
          service="rl-services"
          tenantId={tenantId}
          title="RL Payment History"
        />
        {/* <ApplicationTimeline workflowDetails={workflowDetails} t={t} /> */}
        <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
        {applicationData?.status != "INITIATED" && actions?.length > 0 && !applicationData?.expireFlag && (
          <ActionBar>
            <div ref={menuRef}>
              {displayMenu ? (
                <Menu
                  localeKeyPrefix={`WF_EMPLOYEE_${"PTR"}`}
                  options={actions?.map((action) => (action.action === "DRAFT" ? { ...action, forcedName: "COMMON_EDIT" } : action))}
                  optionKey={"action"}
                  t={t}
                  onSelect={onActionSelect}
                />
              ) : null}
              <div className="ral-style-a527bac1ee">
                <SubmitBar label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
              </div>
            </div>
          </ActionBar>
        )}

        {applicationData?.status == "INITIATED" && (
          <ActionBar>
            <SubmitBar
              label={t("COMMON_EDIT")}
              onSubmit={() => {
                history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);
              }}
            />
          </ActionBar>
        )}

        {showModal ? (
          <RALModal
            t={t}
            action={selectedAction}
            tenantId={tenantId}
            state={state}
            id={acknowledgementIds}
            applicationDetails={propertyDetails}
            closeModal={closeModal}
            submitAction={submitAction}
            actionData={workflowDetails?.data?.timeline}
            workflowDetails={workflowDetails?.data}
            showToast={showToast}
            closeToast={closeToast}
            getEmployees={getEmployees}
            setShowToast={setShowToast}
            applicationData={applicationData}
            handleRenewal={handleRenewal}
          />
        ) : null}
      </div>

      {showToast && (
        <Toast error={showToast.key} label={t(showToast.label)} isDleteBtn={true} onClose={closeToast} className="ral-style-bd1c956dbd" />
      )}
      {(loader || recieptDataLoading || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default RALApplicationDetails;
