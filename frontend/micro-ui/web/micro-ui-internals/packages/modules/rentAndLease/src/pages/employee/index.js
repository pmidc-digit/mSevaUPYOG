import React from "react";
import { RentAndLeaseModule } from "../../Module";
import Inbox from "./Inbox";
import { Switch, useLocation, Link } from "react-router-dom";
import { PrivateRoute, BackButton } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import RALApplicationDetails from "./RALApplicationDetails";
// import EmployeeChallan from "../../EmployeeChallan";
// import CreateChallen from "../employee/CreateChallan";
// import MCollectAcknowledgement from "../employee/EmployeeChallanAcknowledgement";
// import EditChallan from "../employee/EditChallan/index";
// import NewChallan from "./NewChallan";
const EmployeeApp = ({ path, url, userType }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const mobileView = innerWidth <= 640;

  console.log("her here here here");
  // const inboxInitialState = {
  //   searchParams: {
  //     // uuid: { code: "ASSIGNED_TO_ALL", name: "ES_INBOX_ASSIGNED_TO_ALL" },
  //     // services: ["PT.CREATE"],
  //     status: [],
  //     businessService: [],
  //     // locality: [],
  //   },
  // };

  const inboxInitialState = {
    searchParams: {
      uuid: { code: "ASSIGNED_TO_ALL", name: "ES_INBOX_ASSIGNED_TO_ALL" },
      services: ["RENT_N_LEASE_NEW"],
      applicationStatus: [],
      locality: [],
    },
  };

  const combineTaxDueInSearchData = async (searchData, _break, _next) => {
    let returnData;
    const tenantId = Digit.ULBService.getCurrentTenantId();
    let businessService = ["PT"].join();
    let consumerCode = searchData.map((e) => e.propertyId).join();
    try {
      const res = await Digit.PaymentService.fetchBill(tenantId, { consumerCode, businessService });
      let obj = {};
      res.Bill.forEach((e) => {
        obj[e.consumerCode] = e.totalAmount;
      });
      returnData = searchData.map((e) => ({ ...e, due_tax: "₹ " + (obj[e.propertyId] || 0) }));
    } catch (er) {
      const err = er?.response?.data;
      if (["EG_BS_BILL_NO_DEMANDS_FOUND", "EMPTY_DEMANDS"].includes(err?.Errors?.[0].code)) {
        returnData = searchData.map((e) => ({ ...e, due_tax: "₹ " + 0 }));
      }
    }
    return _next(returnData);
  };

  const searchMW = [{ combineTaxDueInSearchData }];

  const EmployeeChallan = Digit?.ComponentRegistryService?.getComponent("MCollectEmployeeChallan");
  const MCollectAcknowledgement = Digit?.ComponentRegistryService?.getComponent("MCollectAcknowledgement");
  const EditChallan = Digit?.ComponentRegistryService?.getComponent("MCollectEditChallan");
  const NewChallan = Digit?.ComponentRegistryService?.getComponent("MCollectNewChallan");
  const SearchReceiptPage = Digit?.ComponentRegistryService?.getComponent("SearchReceipt");
  const SearchChallanPage = Digit?.ComponentRegistryService?.getComponent("SearchChallan");
  const SearchBillPage = Digit?.ComponentRegistryService?.getComponent("SearchBill");
  const GroupBillPage = Digit?.ComponentRegistryService?.getComponent("GroupBill");
  const NewRentAndLeaseStepperForm = Digit?.ComponentRegistryService?.getComponent("NewRentAndLeaseStepperForm");
  const RALResponse = Digit?.ComponentRegistryService?.getComponent("RALResponse");

  return (
    <Switch>
      <React.Fragment>
        <div className="ground-container">
          {/* <p className="breadcrumb employee-main-application-details" style={{ marginLeft: mobileView ? "2vw" : "revert" }}>
            <Link to="/digit-ui/employee" style={{ cursor: "pointer", color: "#666" }}>
              {t("ES_COMMON_HOME")}
            </Link>{" "}
            / <span>{location.pathname === "/digit-ui/employee/mcollect/inbox" ? t("UC_SEARCH_HEADER") : t("UC_COMMON_HEADER_SEARCH")}</span>
          </p> */}
          <div style={{ marginLeft: "-4px", display: "flex", alignItems: "center" }}>
            <BackButton location={location} />
          </div>
          <PrivateRoute exact path={`${path}/`} component={() => <RentAndLeaseModule matchPath={path} userType={userType} />} />
          <PrivateRoute
            path={`${path}/inbox`}
            component={() => (
              <Inbox
                useNewInboxAPI={true}
                parentRoute={path}
                businessService="RENT_N_LEASE_NEW"
                moduleCode="RAL"
                filterComponent="RAL_INBOX_FILTER"
                initialStates={inboxInitialState}
                isInbox={true}
              />
            )}
          />{" "}
          <PrivateRoute path={`${path}/new-application`} component={() => <NewChallan parentUrl={url} />} />
          <PrivateRoute
            path={`${path}/search`}
            component={() => (
              <Inbox parentRoute={path} businessService="PT" middlewareSearch={searchMW} initialStates={inboxInitialState} isInbox={false} />
            )}
          />
          <PrivateRoute path={`${path}/allot-property/:id?`} component={NewRentAndLeaseStepperForm} />
          <PrivateRoute path={`${path}/property/:acknowledgementIds/:tenantId`} component={RALApplicationDetails} />
          <PrivateRoute path={`${path}/response/:applicationNumber`} component={RALResponse} />
          <PrivateRoute path={`${path}/acknowledgement`} component={() => <MCollectAcknowledgement />} />
          <PrivateRoute path={`${path}/challansearch/:challanno`} component={() => <EmployeeChallan />} />
          <PrivateRoute path={`${path}/modify-challan/:challanNo`} component={() => <EditChallan />} />{" "}
          <PrivateRoute path={`${path}/search-receipt`} component={() => <SearchReceiptPage />} />{" "}
          <PrivateRoute path={`${path}/search-challan`} component={() => <SearchChallanPage parentRoute={path} />} />{" "}
          <PrivateRoute path={`${path}/search-bill`} component={() => <SearchBillPage />} />{" "}
          <PrivateRoute path={`${path}/group-bill`} component={() => <GroupBillPage />} />{" "}
        </div>
      </React.Fragment>
    </Switch>
  );
};

export default EmployeeApp;
