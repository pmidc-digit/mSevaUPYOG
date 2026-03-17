import React, { useState } from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import { ActionBar, Menu, SubmitBar, BreadCrumb, BackButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
// import { ComplaintDetails } from "./ComplaintDetails";
// import { CreateComplaint } from "./CreateComplaint";
// import Inbox from "./Inbox";
import { Employee } from "../../constants/Routes";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
// import Response from "./Response";

const PGRBreadCrumbs = ({ location, t }) => {
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/pgr/inbox",
      content: t("CS_COMMON_INBOX"),
      show: location.includes("/pgr/inbox") && !location.includes("complaint") ? true : false,
    },
    {
      path: "/digit-ui/employee/pgr/complaint/create",
      content: t("CS_PGR_CREATE_APPLICATION"),
      show: location.includes("/pgr/complaint/create") ? true : false,
    },
    {
      path: "/digit-ui/employee/pgr/complaint/details",
      content: t("CS_PGR_APPLICATION_SUMMARY"),
      show: location.includes("/pgr/complaint/details") ? true : false,
    },
  ];

  return <BreadCrumb crumbs={crumbs} />;
};

const Complaint = () => {
  const [displayMenu, setDisplayMenu] = useState(false);
  const [popup, setPopup] = useState(false);
  const match = useRouteMatch();
  const { t } = useTranslation();
  const location = useLocation().pathname;
  const mobileView = innerWidth <= 640;

  const breadcrumConfig = {
    home: {
      content: t("CS_COMMON_HOME"),
      path: Employee.Home,
    },
    inbox: {
      content: t("CS_COMMON_INBOX"),
      path: match.url + Employee.Inbox,
    },
    createComplaint: {
      content: t("CS_PGR_CREATE_COMPLAINT"),
      path: match.url + Employee.CreateComplaint,
    },
    complaintDetails: {
      content: t("CS_PGR_COMPLAINT_DETAILS"),
      path: match.url + Employee.ComplaintDetails + ":id",
    },
    response: {
      content: t("CS_PGR_RESPONSE"),
      path: match.url + Employee.Response,
    },
    editApplication: {
      content: t("CS_PGR_EDIT_APPLICATION"),
      path: match.url + Employee.EditApplication,
    },    
  };
  function popupCall(option) {
    setDisplayMenu(false);
    setPopup(true);
  }

  const CreateComplaint = Digit?.ComponentRegistryService?.getComponent('PGRCreateComplaintEmp');
  const ComplaintDetails = Digit?.ComponentRegistryService?.getComponent('PGRComplaintDetails');
  const Inbox = Digit?.ComponentRegistryService?.getComponent('PGRInbox');
  const Response = Digit?.ComponentRegistryService?.getComponent('PGRResponseEmp');
  const EditApplication = Digit.ComponentRegistryService.getComponent("PGREditApplication");
  return (
    <React.Fragment>
      <div className="ground-container">
        <PGRBreadCrumbs location={location} t={t} />
        <Switch>
          <Route path={match.url + Employee.CreateComplaint} component={() => <CreateComplaint parentUrl={match.url} />} />
          <Route path={match.url + Employee.ComplaintDetails + ":fullIdAndUlb*"} component={()=><ComplaintDetails/>} />
          <Route path={match.url + Employee.Inbox} component={Inbox} />
          <Route path={match.url + Employee.Response} component={Response} />
          <Route path={match.url +Employee.EditApplication +":id*"} component={EditApplication} />
        </Switch>
      </div>
      {/* <ActionBar>
        {displayMenu ? <Menu options={["Assign Complaint", "Reject Complaint"]} onSelect={popupCall} /> : null}
        <SubmitBar label="Take Action" onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar> */}
    </React.Fragment>
  );
};

export default Complaint;
