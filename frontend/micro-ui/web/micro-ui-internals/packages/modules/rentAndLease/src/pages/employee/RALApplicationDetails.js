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
import { Loader } from "../../components/Loader";
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
  const [error, setError] = useState(null);
  const history = useHistory();
  const [getWorkflowService, setWorkflowService] = useState([]);
  console.log("applicationData", applicationData);

  const isCitizen = window.location.href.includes("citizen");

  const fetchApplications = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.RentAndLeaseService.search({ tenantId, filters });
      console.log("search ", responseData);
      setApplicationData(responseData?.AllotmentDetails?.[0]);
    } catch (error) {
      console.log("error", error);
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

    console.log("action", action);
    history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);

    const filterNexState = (action?.actions ?? action?.state?.actions)?.filter((item) => item.action === action?.action);

    console.log("filterNexState", filterNexState);
    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);
    console.log("filterRoles", filterRoles);
    setEmployees(filterRoles?.[0]?.actions);

    if (action?.action == "APPLY") {
      submitAction(payload);
    } else if (action?.action == "PAY") {
      const appNo = acknowledgementIds;
      history.push(`/digit-ui/employee/payment/collect/PTR/${appNo}/${tenantId}`);
    } else if (action?.action === "EDIT") {
      history.push(`/digit-ui/employee/rentandlease/allot-property/${acknowledgementIds}`);
    } else {
      setShowModal(true);
      setSelectedAction(action);
    }
  }

  const submitAction = async (data) => {
    // setShowModal(false);
    // setSelectedAction(null);
    const payloadData = applicationData;

    const updatedApplicant = {
      ...payloadData,
      workflow: {},
    };

    const filtData = data?.Licenses?.[0];
    console.log("filtData", filtData);
    updatedApplicant.workflow = {
      action: filtData.action,
      assignes: filtData.action === "SENDBACKTOCITIZEN" ? [props.application?.auditDetails?.createdBy] : filtData?.assignee,
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
        setShowToast({ key: "success", message: "Successfully updated the status" });
        setError("Successfully updated the status");
        // data.revalidate();

        // ✅ Delay navigation so toast shows
        setTimeout(() => {
          history.push("/digit-ui/employee/rentandlease/inbox");
        }, 2000);

        setSelectedAction(null);
        setShowModal(false);
      }
    } catch (err) {
      setShowToast({ key: "error", message: "Something went wrong" });
      setError("Something went wrong");
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

  return (
    <React.Fragment>
      <div>
        <div className="cardHeaderWithOptions" style={{ marginRight: "auto", maxWidth: "960px" }}>
          <Header styles={{ fontSize: "32px" }}>{t("RENT_LEASE_APPLICATION_DETAILS")}</Header>
        </div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("RENT_LEASE_OWNER_DETAILS")}</CardSubHeader>
          <StatusTable>
            {applicationData?.OwnerInfo?.length ? (
              applicationData.OwnerInfo.map((owner, index) => {
                const multipleOwners = applicationData.OwnerInfo.length > 1;
                const ownerLabelPrefix = multipleOwners ? `${t("OWNER")} ${index + 1}` : t("OWNER");

                return (
                  <React.Fragment key={owner.ownerId || index}>
                    <Row label={`${ownerLabelPrefix} ${t("ADS_APPLICANT_NAME")}`} text={owner?.name || t("CS_NA")} />
                    <Row label={`${ownerLabelPrefix} ${t("CORE_COMMON_PROFILE_EMAIL")}`} text={owner?.emailId || t("CS_NA")} />
                    <Row label={`${ownerLabelPrefix} ${t("CORE_MOBILE_NUMBER")}`} text={owner?.mobileNo || t("CS_NA")} />
                    <Row
                      label={`${ownerLabelPrefix} ${t("CORE_COMMON_PINCODE")}`}
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
            <Row label={t("RENT_LEASE_PROPERTY_NAME")} text={propertyDetails?.propertyName || t("CS_NA")} />
            <Row label={t("RENT_LEASE_PROPERTY_TYPE")} text={propertyDetails?.propertyType || t("CS_NA")} />
            <Row label={t("WS_PROPERTY_ADDRESS_LABEL")} text={propertyDetails?.address || t("CS_NA")} />
            <Row label={t("BASE_RENT")} text={propertyDetails?.baseRent || t("CS_NA")} />
            <Row label={t("SECURITY_DEPOSIT")} text={propertyDetails?.securityDeposit || t("CS_NA")} />
            <Row label={t("PROPERTY_SIZE")} text={propertyDetails?.propertySizeOrArea || t("CS_NA")} />
            <Row label={t("LOCATION_TYPE")} text={propertyDetails?.locationType || t("CS_NA")} />
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

        <CardSubHeader style={{ fontSize: "24px" }}>{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSubHeader>
        <ApplicationTimeline workflowDetails={workflowDetails} t={t} />
        {actions?.length > 0 && actions[0]?.action != "PAY" && !isCitizen && (
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
            errors={error}
            setShowToast={setShowToast}
          />
        ) : null}
        {workflowDetails?.data && showNextActions(workflowDetails?.data?.actionState?.nextActions)}
      </div>

      {showToast && <Toast error={showToast.key == "error" ? true : false} label={error} isDleteBtn={true} onClose={closeToast} />}
      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default RALApplicationDetails;
