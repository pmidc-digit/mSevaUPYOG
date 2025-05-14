import React, { useState } from "react";
import { Switch, Route, useRouteMatch, useLocation } from "react-router-dom";
import { ActionBar, Menu, SubmitBar, BreadCrumb, BackButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
// import { ComplaintDetails } from "./ComplaintDetails";
// import { CreateComplaint } from "./CreateComplaint";
// import Inbox from "./Inbox";
import { Employee } from "../../constants/Routes";
// import Response from "./Response";

const Complaint = () => {
  const [displayMenu, setDisplayMenu] = useState(false);
  const [popup, setPopup] = useState(false);
  const match = useRouteMatch();
  const { t } = useTranslation();

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
      content: t("CS_SWACH_CREATE_COMPLAINT"),
      path: match.url + Employee.CreateComplaint,
    },
    complaintDetails: {
      content: t("CS_SWACH_COMPLAINT_DETAILS"),
      path: match.url + Employee.ComplaintDetails + ":id",
    },
    response: {
      content: t("CS_SWACH_RESPONSE"),
      path: match.url + Employee.Response,
    },
    // editApplication: {
    //   content: t("CS_SWACH_EDIT_APPLICATION"),
    //   path: match.url + Employee.EditApplication,
    // },
  };
  function popupCall(option) {
    setDisplayMenu(false);
    setPopup(true);
  }

  let location = useLocation().pathname;

  const Inbox = Digit?.ComponentRegistryService?.getComponent("SWACHInbox");
  const CreateComplaint = Digit?.ComponentRegistryService?.getComponent("SWACHCreateComplaintEmp");
  const Response = Digit?.ComponentRegistryService?.getComponent("SWACHResponseEmp");
  const ComplaintDetails = Digit?.ComponentRegistryService?.getComponent("SWACHComplaintDetails");
  return (
    <React.Fragment>
      <div className="ground-container">
        <BackButton>{t("CS_COMMON_BACK")}</BackButton>
        {!location.includes(Employee.Response) && (
          <Switch>
            <Route
              path={match.url + Employee.CreateComplaint}
              component={() => <BreadCrumb crumbs={[breadcrumConfig.home, breadcrumConfig.createComplaint]}></BreadCrumb>}
            />
            <Route
              path={match.url + Employee.Inbox}
              component={() => <BreadCrumb crumbs={[breadcrumConfig.home, breadcrumConfig.inbox]}></BreadCrumb>}
            />
            <Route
              path={match.url + Employee.Response}
              component={<BreadCrumb crumbs={[breadcrumConfig.home, breadcrumConfig.response]}></BreadCrumb>}
            />
          </Switch>
        )}
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
