import React, { useCallback, useEffect, useState, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useHistory, Redirect,useLocation } from "react-router-dom";

import { BackButton, Card, CardHeader, CardText, TextArea, SubmitBar,Toast } from "@mseva/digit-ui-react-components";

import { updateComplaints } from "../../../redux/actions/index";
import { LOCALIZATION_KEY } from "../../../constants/Localization";

const AddtionalDetails = (props) => {
  // const [details, setDetails] = useState(null);
  const history = useHistory();
  let { id } = useParams();
  const dispatch = useDispatch();
  const appState = useSelector((state) => state)["common"];
  let { t } = useTranslation();
  const [showToast, setShowToast] = useState(false)
  const [error, setError] = useState(null);
  // const {complaintDetails} = props
  const location = useLocation();
  // let { id } = useParams();
  const tenantId = Digit.SessionStorage.get("CITIZEN.COMMON.HOME.CITY")?.code || Digit.ULBService.getCurrentTenantId();
  const complaintDetails =
    location.state?.complaintDetails ||
    props.complaintDetails ||
    Digit.Hooks.swach.useComplaintDetails({ tenantId, id }).complaintDetails;
  // useEffect(() => {
  //   if (appState.complaints) {
  //     const { response } = appState.complaints;
  //     if (response && response.responseInfo.status === "successful") {
  //       history.push(`${props.match.path}/response`);
  //     }
  //   }
  // }, [appState.complaints, props.history]);

  const updateComplaint = useCallback(
 (complaintDetails) => {
      try{
 dispatch(updateComplaints(complaintDetails));
        // history.push(`${props.match.path}/response`);
         history.push({
        pathname: `${props.match.path}/response`,
        state: { complaintDetails }
      });
      }
      catch(e)
      {
          setShowToast( { isError: false, isWarning: true, key: "error", message: e?.response?.data?.Errors[0]?.message})
          setError(e?.response?.data?.Errors[0]?.message);
      }
     
    },
    [dispatch]
  );
  const closeToast = () => {
    setShowToast(false);
};
  const getUpdatedWorkflow = (reopenDetails, type) => {
    switch (type) {
      case "REOPEN":
        return {
          action: "REOPEN",
          comments: reopenDetails.addtionalDetail,
          assignes: [],
          verificationDocuments: reopenDetails.verificationDocuments,
        };
      default:
        return "";
    }
  };

  function reopenComplaint() {
    setShowToast(false)
    let reopenDetails = Digit.SessionStorage.get(`reopen.${id}`);
    console.log("reopenDetails", reopenDetails);
  console.log("complaintDetails", complaintDetails);
    if (complaintDetails && complaintDetails.service) {
      complaintDetails.workflow = getUpdatedWorkflow(
        reopenDetails,
        // complaintDetails,
        "REOPEN"
      );
      complaintDetails.service.additionalDetail = {
        REOPEN_REASON: reopenDetails.reason,
      };
      console.log("Dispatching updateComplaints with:", { service: complaintDetails.service, workflow: complaintDetails.workflow });
      updateComplaint({ service: complaintDetails.service, workflow: complaintDetails.workflow });
    }
    // return (
    //   <Redirect
    //     to={{
    //       pathname: `${props.parentRoute}/response`,
    //       state: { complaintDetails },
    //     }}
    //   />
    // );
  }

  function textInput(e) {
    // setDetails(e.target.value);
    let reopenDetails = Digit.SessionStorage.get(`reopen.${id}`);
    Digit.SessionStorage.set(`reopen.${id}`, {
      ...reopenDetails,
      addtionalDetail: e.target.value,
    });
  }

  return (
    <React.Fragment>
      <Card>
        <CardHeader>{t(`${LOCALIZATION_KEY.CS_ADDCOMPLAINT}_PROVIDE_ADDITIONAL_DETAILS`)}</CardHeader>
        <CardText>{t(`${LOCALIZATION_KEY.CS_ADDCOMPLAINT}_ADDITIONAL_DETAILS_TEXT`)}</CardText>
        <TextArea name={"AdditionalDetails"} onChange={textInput}></TextArea>
        <div onClick={reopenComplaint}>
          <SubmitBar label={t(`${LOCALIZATION_KEY.CS_HEADER}_REOPEN_COMPLAINT`)} />
        </div>
      </Card>
      <React.Fragment>{showToast && <Toast error={showToast.key === "error"} label={error} onClose={closeToast} />}</React.Fragment>
  
    </React.Fragment>
  );
};

export default AddtionalDetails;
