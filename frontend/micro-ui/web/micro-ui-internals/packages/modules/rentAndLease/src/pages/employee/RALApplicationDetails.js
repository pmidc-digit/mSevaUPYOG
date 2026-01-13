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
  const [getEmployees, setEmployees] = useState([]);
  const history = useHistory();
  const [getWorkflowService, setWorkflowService] = useState([]);
  const menuRef = useRef();
  Digit.Hooks.useClickOutside(menuRef, () => setDisplayMenu(false), displayMenu);

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

  console.log("workflowDetails", workflowDetails);

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
  const propertyDetails = Array.isArray(rawAdditionalDetails) ? rawAdditionalDetails[0] : rawAdditionalDetails;

  let user = Digit.UserService.getUser();

  const userRoles = user?.info?.roles?.map((e) => e.code);
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

  function onActionSelect(action) {
    const payload = {
      action: [action],
    };

    // history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);

    const filterNexState = (action?.actions ?? action?.state?.actions)?.filter((item) => item.action === action?.action);

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

    if (filtData.action === "FORWARD_FOT_SETLEMENT" && filtData?.amountToBeDeducted !== undefined) {
      updatedApplicant.amountToBeDeducted = filtData.amountToBeDeducted;
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
        </div>
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

                    <Row label={t("PT_OWNERSHIP_INFO_NAME")} text={owner?.name || t("CS_NA")} />
                    <Row label={t("CORE_COMMON_PROFILE_EMAIL")} text={owner?.emailId || t("CS_NA")} />
                    <Row label={t("CORE_MOBILE_NUMBER")} text={owner?.mobileNo || t("CS_NA")} />
                    <Row
                      label={t("PT_COMMON_COL_ADDRESS")}
                      text={owner?.correspondenceAddress?.addressId || owner?.permanentAddress?.addressId || t("CS_NA")}
                    />
                    <Row
                      label={t("CORE_COMMON_PINCODE")}
                      text={owner?.correspondenceAddress?.pincode || owner?.permanentAddress?.pincode || t("CS_NA")}
                    />
                  </React.Fragment>
                );
              })
            ) : (
              <Row label={t("OWNER")} text={t("CS_NA")} />
            )}
          </StatusTable>

          <CardSubHeader className="ral-card-subheader-24">{t("ES_TITILE_PROPERTY_DETAILS")}</CardSubHeader>
          <StatusTable>
            {applicationData?.registrationNumber && (
              <Row label={t("RAL_REGISTRATION_NUMBER")} text={applicationData?.registrationNumber || t("CS_NA")} />
            )}
            <Row label={t("APPLICATION_NUMBER")} text={applicationData?.applicationNumber || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_ID")} text={propertyDetails?.propertyId || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_NAME")} text={propertyDetails?.propertyName || t("CS_NA")} />
            <Row label={t("RAL_ALLOTMENT_TYPE")} text={propertyDetails?.allotmentType || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_TYPE")} text={propertyDetails?.propertyType || t("CS_NA")} />
            <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={propertyDetails?.address || t("CS_NA")} />
            <Row label={t("RAL_PROPERTY_AMOUNT")} text={propertyDetails?.baseRent || t("CS_NA")} />
            <Row label={t("PENALTY_TYPE")} text={propertyDetails?.penaltyType || t("CS_NA")} />
            <Row
              label={t("RAL_FEE_CYCLE")}
              text={propertyDetails?.feesPeriodCycle?.[0]?.toUpperCase() + propertyDetails?.feesPeriodCycle?.slice(1)?.toLowerCase() || t("CS_NA")}
            />
            <Row label={t("PROPERTY_SIZE")} text={propertyDetails?.propertySizeOrArea || t("CS_NA")} />
            <Row label={t("RENT_LEASE_LOCATION_TYPE")} text={propertyDetails?.locationType || t("CS_NA")} />
            <Row label={t("RAL_START_DATE")} text={getDate(applicationData?.startDate) || t("CS_NA")} />
            <Row label={t("RAL_END_DATE")} text={getDate(applicationData?.endDate) || t("CS_NA")} />
            {applicationData?.amountToBeDeducted > 0 && <Row label={t("RAL_PROPERTY_PENALTY")} text={applicationData?.amountToBeDeducted} />}
            <Row label={t("SECURITY_DEPOSIT")} text={propertyDetails?.securityDeposit || t("CS_NA")} />
            {applicationData?.amountToBeDeducted - propertyDetails?.securityDeposit > 0 && (
              <Row label={t("RAL_AMOUNT_TO_TAKE_FROM_CITIZEN")} text={applicationData?.amountToBeDeducted - propertyDetails?.securityDeposit} />
            )}
            {applicationData?.amountToBeRefund > 0 && <Row label={t("RAL_AMOUNT_TO_REFUND")} text={applicationData?.amountToBeRefund} />}
            {applicationData?.tradeLicenseNumber && (
              <Row label={t("RENT_LEASE_TRADE_LICENSE_NUMBER")} text={applicationData?.tradeLicenseNumber || t("CS_NA")} />
            )}
          </StatusTable>

          <CardSubHeader className="ral-card-subheader-24-margin">{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card className="ral-app-details-docs-card">
              {applicationData?.Document?.length > 0 ? (
                applicationData.Document.map((doc, index) => (
                  <div key={index}>
                    <RALDocuments value={applicationData.Document} Code={doc?.documentType} index={index} />
                    {t(doc?.documentType)}
                  </div>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>
        {/* <ApplicationTimeline workflowDetails={workflowDetails} t={t} /> */}
        <NewApplicationTimeline workflowDetails={workflowDetails} t={t} />
        {applicationData?.status != "INITIATED" && actions?.length > 0 && !applicationData?.expireFlag && (
          <ActionBar>
            <div ref={menuRef}>
              {displayMenu ? (
                <Menu
                  localeKeyPrefix={`WF_EMPLOYEE_${"PTR"}`}
                  options={actions}
                  optionKey={"action"}
                  t={t}
                  onSelect={onActionSelect}
                  // style={MenuStyle}
                />
              ) : null}
              <div style={{textAlign:"right"}}>
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

      {showToast && <Toast error={showToast.key} label={t(showToast.label)} isDleteBtn={true} onClose={closeToast} style={{ zIndex: 1000 }} />}
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default RALApplicationDetails;
