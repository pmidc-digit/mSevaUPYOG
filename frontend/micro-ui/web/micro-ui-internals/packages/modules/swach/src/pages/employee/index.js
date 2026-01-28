import React, { useState } from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import { ActionBar, Menu, SubmitBar, BreadCrumb, BackButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
// import { ComplaintDetails } from "./ComplaintDetails";
// import { CreateComplaint } from "./CreateComplaint";
// import Inbox from "./Inbox";
import { Employee } from "../../constants/Routes";
// import Response from "./Response";

const SWACHBreadCrumbs = ({ location, t }) => {
  const crumbs = [
    {
      path: "/digit-ui/employee",
      content: t("ES_COMMON_HOME"),
      show: true,
    },
    {
      path: "/digit-ui/employee/swach/inbox",
      content: t("CS_COMMON_INBOX"),
      show: location.includes("/swach/inbox") && !location.includes("complaint") ? true : false,
    },
    {
      path: "/digit-ui/employee/swach/complaint/create",
      content: t("CS_SWACH_CREATE_COMPLAINT"),
      show: location.includes("/swach/complaint/create") ? true : false,
    },
    {
      path: "/digit-ui/employee/swach/complaint/details",
      content: t("CS_SWACH_COMPLAINT_DETAILS"),
      show: location.includes("/swach/complaint/details") ? true : false,
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

  const Inbox = Digit?.ComponentRegistryService?.getComponent("SWACHInbox");
  const CreateComplaint = Digit?.ComponentRegistryService?.getComponent("SWACHCreateComplaintEmp");
  const Response = Digit?.ComponentRegistryService?.getComponent("SWACHResponseEmp");
  const ComplaintDetails = Digit?.ComponentRegistryService?.getComponent("SWACHComplaintDetails");
  return (
    <React.Fragment>
      <div className="ground-container">
        <SWACHBreadCrumbs location={location} t={t} />
        <Switch>
          <Route path={match.url + Employee.CreateComplaint} component={() => <CreateComplaint parentUrl={match.url} />} />
          <Route path={match.url + Employee.ComplaintDetails + ":fullIdAndUlb*"} component={() => <ComplaintDetails />} />
          <Route path={match.url + Employee.Inbox} component={Inbox} />
          <Route path={match.url + Employee.Response} component={Response} />
        </Switch>
      </div>
    </React.Fragment>
  );
};

export default Complaint;
