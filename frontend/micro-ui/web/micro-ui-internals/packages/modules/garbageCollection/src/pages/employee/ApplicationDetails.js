import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardSubHeader,
  CardSectionHeader,
  Header,
  Row,
  StatusTable,
  MultiLink,
  CheckPoint,
  Toast,
  ConnectingCheckPoints,
  ActionBar,
  Menu,
  SubmitBar,
} from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import NDCDocumentTimline from "../../components/ChallanDocument";
import { useParams } from "react-router-dom";
import get from "lodash/get";
import { Loader } from "../../components/Loader";
import { ChallanData } from "../../utils/index";
import CHBDocument from "../../components/ChallanDocument";
import NDCModal from "../../pageComponents/NDCModal";

const getTimelineCaptions = (checkpoint, index, arr, t) => {
  const { wfComment: comment, thumbnailsToShow, wfDocuments } = checkpoint;
  const caption = {
    date: checkpoint?.auditDetails?.lastModified,
    name: checkpoint?.assigner?.name,
    // mobileNumber: checkpoint?.assigner?.mobileNumber,
    source: checkpoint?.assigner?.source,
  };

  return (
    <div>
      {comment?.length > 0 && (
        <div className="TLComments">
          <h3>{t("WF_COMMON_COMMENTS")}</h3>
          <p style={{ overflowX: "scroll" }}>{comment}</p>
        </div>
      )}

      {thumbnailsToShow?.thumbs?.length > 0 && (
        <DisplayPhotos
          srcs={thumbnailsToShow.thumbs}
          onClick={(src, idx) => {
            let fullImage = thumbnailsToShow.fullImage?.[idx] || src;
            Digit.Utils.zoomImage(fullImage);
          }}
        />
      )}

      {wfDocuments?.length > 0 && (
        <div>
          {wfDocuments?.map((doc, index) => (
            <div key={index}>
              <NDCDocumentTimline value={wfDocuments} Code={doc?.documentType} index={index} />
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "8px" }}>
        {caption.date && <p>{caption.date}</p>}
        {caption.name && <p>{caption.name}</p>}
        {/* {caption.mobileNumber && <p>{caption.mobileNumber}</p>} */}
        {caption.source && <p>{t("ES_COMMON_FILED_VIA_" + caption.source.toUpperCase())}</p>}
      </div>
    </div>
  );
};

const ChallanApplicationDetails = () => {
  const { t } = useTranslation();
  const { acknowledgementIds, id } = useParams();
  const [showToast, setShowToast] = useState(false);
  const [getLable, setLable] = useState(false);
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const [showOptions, setShowOptions] = useState(false);
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [loader, setLoader] = useState(false);
  const [getChallanData, setChallanData] = useState();
  const [chbPermissionLoading, setChbPermissionLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState("");
  const [getWorkflowService, setWorkflowService] = useState([]);
  const [displayMenu, setDisplayMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showErrorToast, setShowErrorToastt] = useState(null);
  const [getEmployees, setEmployees] = useState([]);
  const [errorOne, setErrorOne] = useState(null);
  const menuRef = useRef();

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.GCService.search({ tenantId, filters });
      setChallanData(responseData?.GarbageConnection?.[0]);
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };
  let challanEmpData = ChallanData(tenantId, id);

  useEffect(() => {
    if (id) {
      const filters = {};
      filters.applicationNumber = id;
      fetchChallans(filters);
    }
  }, [id]);

  const closeModal = () => {
    setSelectedAction(null);
    setShowModal(false);
  };

  const closeToastOne = () => {
    setShowErrorToastt(null);
  };

  // Getting HallsBookingDetails
  // const hallsBookingApplication = get(data, "hallsBookingApplication", []);

  // let chb_details = (hallsBookingApplication && hallsBookingApplication.length > 0 && hallsBookingApplication[0]) || {};
  // const application = chb_details;

  // sessionStorage.setItem("chb", JSON.stringify(application));

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId: tenantId,
    id: id,
    moduleCode: "NewGC",
    role: "EMPLOYEE",
  });

  const closeToast = () => {
    setShowToast(null);
  };

  if (workflowDetails?.data?.actionState?.nextActions && !workflowDetails.isLoading)
    workflowDetails.data.actionState.nextActions = [...workflowDetails?.data?.nextActions];

  if (workflowDetails && workflowDetails.data && !workflowDetails.isLoading) {
    workflowDetails.data.initialActionState = workflowDetails?.data?.initialActionState || { ...workflowDetails?.data?.actionState } || {};
    workflowDetails.data.actionState = { ...workflowDetails.data };
  }

  let user = Digit.UserService.getUser();

  const userRoles = user?.info?.roles?.map((e) => e.code);

  let actions =
    workflowDetails?.data?.actionState?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    }) ||
    workflowDetails?.data?.nextActions?.filter((e) => {
      return userRoles?.some((role) => e.roles?.includes(role)) || !e.roles;
    });

  useEffect(() => {
    let WorkflowService = null;
    (async () => {
      setLoader(true);
      WorkflowService = await Digit.WorkflowService.init(tenantId, "NewGC");
      setLoader(false);
      setWorkflowService(WorkflowService?.BusinessServices?.[0]?.states);
      // setComplaintStatus(applicationStatus);
    })();
  }, [tenantId]);

  function onActionSelect(action) {
    const payload = {
      Licenses: [action],
    };

    const filterNexState = action?.state?.actions?.filter((item) => item.action == action?.action);
    const filterRoles = getWorkflowService?.filter((item) => item?.uuid == filterNexState[0]?.nextState);

    setEmployees(filterRoles?.[0]?.actions);

    setShowModal(true);
    setSelectedAction(action);
  }

  const submitAction = async (modalData) => {
    console.log("modalData", modalData?.Licenses);

    const payload = {
      GarbageConnection: {
        ...getChallanData,
        processInstance: {
          ...getChallanData?.processInstance,
          ...modalData?.Licenses[0],
        },
      },
    };

    console.log("payload", payload);

    try {
      const response = await Digit.GCService.update(payload);
      console.log("response", response);
      setLoader(false);
      setShowModal(false);
      // ✅ Show success first
      setLable("Challan is Settled");
      setError(false);
      setShowToast(true);

      // ✅ Delay navigation so toast shows
      setTimeout(() => {
        history.push("/digit-ui/employee/garbagecollection/inbox");
        window.location.reload();
      }, 2000);
    } catch (error) {
      setLoader(false);
    }
    return;
    if (!modalData?.amount) {
      setErrorOne(`Please Enter Amount`);
      setShowErrorToastt(true);
    } else {
      const finalAmount = Math.max(getChallanData?.amount?.[0]?.amount || 0, getChallanData?.challanAmount || 0);
      if (modalData?.amount > finalAmount) {
        setErrorOne(`Amount must be less than or equal to ${finalAmount}`);
        setShowErrorToastt(true);
        setError(`Amount must be less than or equal to ${finalAmount}`);
      } else {
        console.log("nothing");

        setLoader(true);

        const payload = {
          Challan: {
            ...getChallanData,
            workflow: {
              action: "SETTLED",
            },
            feeWaiver: modalData?.amount,
          },
        };

        console.log("payload", payload);
        try {
          const response = await Digit.ChallanGenerationService.update(payload);
          setLoader(false);
          setShowModal(false);
          // ✅ Show success first
          // setShowToast({ key: "success", message: "Successfully updated the status" });
          setLable("Challan is Settled");
          setError(false);
          setShowToast(true);

          // ✅ Delay navigation so toast shows
          setTimeout(() => {
            history.push("/digit-ui/employee/challangeneration/inbox");
            window.location.reload();
          }, 2000);

          // history.push(`/digit-ui/employee/challangeneration/inbox`);
        } catch (error) {
          setLoader(false);
        }
      }
    }
  };

  return (
    <React.Fragment>
      <div>
        <Card>
          <CardSubHeader style={{ fontSize: "24px" }}>{t("GC_OWNER_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("CORE_COMMON_NAME")} text={getChallanData?.connectionHolders?.[0]?.name || t("CS_NA")} />
            <Row
              className="border-none"
              label={t("CORE_COMMON_PROFILE_MOBILE_NUMBER")}
              text={getChallanData?.connectionHolders?.[0]?.mobileNumber || t("CS_NA")}
            />
            <Row className="border-none" label={t("CORE_EMAIL_ID")} text={getChallanData?.connectionHolders?.[0]?.emailId || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px" }}>{t("GC_CONNECTION_DETAILS")}</CardSubHeader>
          <StatusTable>
            <Row className="border-none" label={t("APPLICATION_NUMBER")} text={t(getChallanData?.applicationNo) || t("CS_NA")} />
            <Row className="border-none" label={t("reports.mcollect.status")} text={t(getChallanData?.applicationStatus) || t("CS_NA")} />
            <Row className="border-none" label={t("GC_CONNECTION_TYPE")} text={getChallanData?.connectionCategory || t("CS_NA")} />
            <Row className="border-none" label={t("GC_FREQUENCY")} text={getChallanData?.frequency || t("CS_NA")} />
            <Row className="border-none" label={t("GC_WASTE_TYPE")} text={getChallanData?.typeOfWaste || t("CS_NA")} />
            <Row className="border-none" label={t("GC_LOCATION")} text={getChallanData?.location || t("CS_NA")} />
          </StatusTable>

          <CardSubHeader style={{ fontSize: "24px", marginTop: "30px" }}>{t("CS_COMMON_DOCUMENTS")}</CardSubHeader>
          <StatusTable>
            <Card style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
              {getChallanData?.documents?.length > 0 ? (
                getChallanData?.documents?.map((doc, index) => (
                  <React.Fragment key={index}>
                    <div>
                      <CHBDocument value={getChallanData?.documents} Code={doc?.documentType} index={index} />
                      <CardSectionHeader style={{ marginTop: "10px", fontSize: "15px" }}>{t(doc?.documentType)}</CardSectionHeader>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <h5>{t("CS_NO_DOCUMENTS_UPLOADED")}</h5>
              )}
            </Card>
          </StatusTable>
        </Card>
        {workflowDetails?.data?.timeline && (
          <Card style={{ marginTop: "20px" }}>
            <CardSubHeader style={{ fontSize: "24px" }}>{t("CS_APPLICATION_DETAILS_APPLICATION_TIMELINE")}</CardSubHeader>
            {workflowDetails?.data?.timeline.length === 1 ? (
              <CheckPoint isCompleted={true} label={t(workflowDetails?.data?.timeline[0]?.status)} />
            ) : (
              <ConnectingCheckPoints>
                {workflowDetails?.data?.timeline.map((checkpoint, index, arr) => (
                  <CheckPoint
                    keyValue={index}
                    isCompleted={index === 0}
                    label={t(checkpoint.status)}
                    customChild={getTimelineCaptions(checkpoint, index, arr, t)}
                  />
                ))}
              </ConnectingCheckPoints>
            )}
          </Card>
        )}

        {actions && actions.length > 0 && !actions.some((a) => a.action === "SUBMIT") && (
          <ActionBar>
            {displayMenu && (workflowDetails?.data?.actionState?.nextActions || workflowDetails?.data?.nextActions) ? (
              <Menu localeKeyPrefix={`WF_GC`} options={actions} optionKey={"action"} t={t} onSelect={onActionSelect} />
            ) : null}
            <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
          </ActionBar>
        )}
      </div>

      {showModal ? (
        <NDCModal
          t={t}
          action={selectedAction}
          tenantId={tenantId}
          id={acknowledgementIds}
          closeModal={closeModal}
          submitAction={submitAction}
          actionData={workflowDetails?.data?.timeline}
          workflowDetails={workflowDetails}
          showToast={showToast}
          getEmployees={getEmployees}
          closeToast={closeToast}
          errors={error}
          showErrorToast={showErrorToast}
          errorOne={errorOne}
          closeToastOne={closeToastOne}
          getLable={getLable}
          getChallanData={getChallanData}
        />
      ) : null}

      {showToast && <Toast isDleteBtn={true} error={error} label={getLable} onClose={closeToast} />}

      {(loader || workflowDetails?.isLoading) && <Loader page={true} />}
    </React.Fragment>
  );
};

export default ChallanApplicationDetails;
