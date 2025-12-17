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
import ApplicationTimeline from "../../../../templates/ApplicationDetails/components/ApplicationTimeline";
import RALModal from "../../pageComponents/RALModal";

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

  console.log("applicationData", applicationData);

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

  const userType = "citizen";

  // Assuming applicationData is your API response
  const propertyDetails = applicationData?.additionalDetails ? applicationData.additionalDetails : {};

  const showNextActions = (nextActions) => {
    let nextAction = nextActions?.length > 0 && nextActions[0];
    const next = nextActions?.map((action) => action?.action);
    if (next?.includes("PAY") || next?.includes("EDIT")) {
      let currentIndex = next.indexOf("EDIT") || next.indexOf("PAY");
      currentIndex = currentIndex != -1 ? currentIndex : next.indexOf("PAY");
      nextAction = nextActions[currentIndex];
    }
    switch (nextAction?.action) {
      case "PAY":
        return userType === "citizen" ? (
          <div style={{ marginTop: "1em", bottom: "0px", width: "100%", marginBottom: "1.2em" }}>
            <Link
              to={{
                // history.push(`/digit-ui/employee/payment/collect/PTR/${appNo}/${tenantId}?tenantId=${tenantId}`);
                // pathname: `/digit-ui/employee/payment/collect/pet-services/${props?.application?.applicationNumber}/${tenantId}`,
                // pathname: `/digit-ui/citizen/payment/my-bills/${businessService}/${props?.application?.applicationNumber}`,

                pathname: `/digit-ui/employee/payment/collect/rentandlease/${acknowledgementIds}/${tenantId}?tenantId=${tenantId}`,

                state: { tenantId: tenantId, applicationNumber: acknowledgementIds },
              }}
            >
              <SubmitBar label={t("CS_APPLICATION_DETAILS_MAKE_PAYMENT")} />
            </Link>
          </div>
        ) : null;

      case "SUBMIT_FEEDBACK":
        return (
          <div style={{ marginTop: "24px" }}>
            <Link to={`/digit-ui/citizen/fsm/rate/${acknowledgementIds}`}>
              <SubmitBar label={t("CS_APPLICATION_DETAILS_RATE")} />
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  let user = Digit.UserService.getUser();
  const menuRef = useRef();
  const userRoles = user?.info?.roles?.map((e) => e.code);
  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });
  const closeToast = () => {
    setShowToast(null);
  };

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
    setShowToast(false);
  };

  function onActionSelect(action) {
    const payload = {
      action: [action],
    };

    // history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);

    const filterNexState = (action?.actions ?? action?.state?.actions)?.filter((item) => item.action === action?.action);

    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState?.[0]?.nextState);
    setEmployees(filterRoles?.[0]?.actions || []);

    if (action?.action == "APPLY" || action?.action == "REJECT") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      const appNo = acknowledgementIds;
      history.push(`/digit-ui/employee/payment/collect/rentandlease/${appNo}/${tenantId}`);
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
    // if (!filtData?.assignee && filtData.action == "FORWARD") {
    //   // setShowToast(true);
    //   setShowToast({ key: "error", message: "Assignee is mandatory" });
    //   setError("Assignee is mandatory");
    //   return;
    // }
    const finalPayload = {
      AllotmentDetails: updatedApplicant,
    };
    try {
      const response = await Digit.RentAndLeaseService.update({
        // tenantId,
        ...finalPayload,
      });

      if (response?.responseInfo?.status == "successful") {
        // ✅ Show success first
        setShowToast({ key: false, label: "Successfully updated the status" });
        // ✅ Delay navigation so toast shows
        setTimeout(() => {
          history.push("/digit-ui/employee/rentandlease/inbox");
        }, 2000);

        setSelectedAction(null);
        setShowModal(false);
      } else {
        console.log(response);
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

  // const handleDisConnection = async (data) => {
  //   setLoader(true);
  //   const payload = {
  //     AllotmentDetails: {
  //       ...data,
  //       applicationType: "DISCONNECT_RENT_AND_LEASE_CONNECTION",
  //       processInstance: {
  //         ...data?.processInstance,
  //         action: "INITIATE",
  //       },
  //     },
  //     disconnectRequest: true,
  //   };

  //   try {
  //     const response = await Digit.RentAndLeaseService.create(payload);
  //     updateApplication(response?.AllotmentDetails[0]);
  //   } catch (error) {
  //     setLoader(false);
  //   }
  // };

  // const updateApplication = async (response) => {
  //   const payload = {
  //     AllotmentDetails: {
  //       ...response,
  //       processInstance: {
  //         ...response?.processInstance,
  //         action: "SUBMIT_APPLICATION",
  //       },
  //     },
  //   };
  //   try {
  //     await Digit.RentAndLeaseService.update(payload);
  //     await fetchApplications();
  //     setLoader(false);
  //   } catch (error) {
  //     setLoader(false);
  //   }
  // };

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginLeft: "14px", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("RENT_LEASE_APPLICATION_DETAILS")}</Header>
        </div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("RENT_LEASE_OWNER_DETAILS")}</CardSubHeader>
          <StatusTable>
            {applicationData?.OwnerInfo?.length ? (
              applicationData.OwnerInfo.map((owner, index) => {
                const multipleOwners = applicationData.OwnerInfo.length > 1;

                return (
                  <React.Fragment key={owner.ownerId || index}>
                    {multipleOwners && (
                      <CardSectionHeader style={{ padding: "5px 24px 0px 24px", fontWeight: "600" }}>
                        {t("RAL_OWNER")} {index + 1}
                      </CardSectionHeader>
                    )}
                    <Row label={t("PT_OWNERSHIP_INFO_NAME")} text={owner?.name || t("CS_NA")} />
                    <Row label={t("CORE_COMMON_PROFILE_EMAIL")} text={owner?.emailId || t("CS_NA")} />
                    <Row label={t("CORE_MOBILE_NUMBER")} text={owner?.mobileNo || t("CS_NA")} />
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

          <CardSubHeader style={{ fontSize: "24px" }}>{t("ES_TITILE_PROPERTY_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row label={t("APPLICATION_NUMBER")} text={applicationData?.applicationNumber || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_ID")} text={propertyDetails?.propertyId || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_NAME")} text={propertyDetails?.propertyName || t("CS_NA")} />
            <Row label={t("RAL_ALLOTMENT_TYPE")} text={propertyDetails?.allotmentType || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_TYPE")} text={propertyDetails?.propertyType || t("CS_NA")} />
            <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={propertyDetails?.address || t("CS_NA")} />
            <Row label={t("RAL_PROPERTY_AMOUNT")} text={propertyDetails?.baseRent || t("CS_NA")} />
            <Row label={t("SECURITY_DEPOSIT")} text={propertyDetails?.securityDeposit || t("CS_NA")} />
            <Row
              label={t("PENALTY_TYPE")}
              text={propertyDetails?.feesPeriodCycle?.[0]?.toUpperCase() + propertyDetails?.feesPeriodCycle?.slice(1)?.toLowerCase() || t("CS_NA")}
            />
            <Row label={t("PROPERTY_SIZE")} text={propertyDetails?.propertySizeOrArea || t("CS_NA")} />
            <Row label={t("RENT_LEASE_LOCATION_TYPE")} text={propertyDetails?.locationType || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
              {applicationData?.Document?.length > 0 ? (
                applicationData.Document.map((doc, index) => (
                  <div key={index}>
                    <RALDocuments value={applicationData.Document} Code={doc?.documentType} index={index} />
                    <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
                  </div>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>
        <ApplicationTimeline workflowDetails={workflowDetails} t={t} />
        {applicationData?.status != "INITIATED" && actions?.length > 0 && actions[0]?.action != "PAY" && (
          <ActionBar>
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
            <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
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

        {/* {applicationData?.status == "APPROVED" && (
          <ActionBar>
            <SubmitBar label={t("RAL_END_TENANCY")} onSubmit={() => handleDisConnection(applicationData)} />
          </ActionBar>
        )} */}

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
          />
        ) : null}
        {workflowDetails?.data && showNextActions(workflowDetails?.data?.actionState?.nextActions)}
      </div>

      {showToast && <Toast error={showToast.key} label={t(showToast.label)} isDleteBtn={true} onClose={closeToast} style={{ zIndex: 1000 }} />}
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default RALApplicationDetails;
