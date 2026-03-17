import { Banner, Card, CardText, LinkButton, ActionBar, Row, StatusTable, SubmitBar } from "@mseva/digit-ui-react-components";
import React, { useState, useEffect, Fragment  } from "react";
import { useLocation, Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import getPTAcknowledgementData from "../utils/getTLAcknowledgementData";
import * as func from "../utils";
import { Loader } from "../components/Loader"; 

const Response = (props) => {
  const location = useLocation();
   const { id: applicationNumber } = useParams();
  const { state } = props.location|| {};
  const [params, setParams] = useState({});
  const { isEdit } = Digit.Hooks.useQueryParams();
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const tenantId = Digit.ULBService.getCurrentTenantId();
   const { data: applicationData, isLoading } = Digit.Hooks.tl.useTradeLicenseSearch(
    {
      tenantId,
      filters: { applicationNumber },
    },
    {
      enabled: !!applicationNumber, // Only fetch when we have application number
    }
  );
  useEffect(() => {
    setParams(func.getQueryStringParams(location.search));
  }, [location]);
  const { t } = useTranslation();

const application = applicationData?.Licenses?.[0] || state?.data?.[0] || {};

  const printReciept = async () => {
    const tenantInfo = tenants.find((tenant) => tenant.code === application.tenantId);
    const data = await getPTAcknowledgementData({ ...application }, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
  };

  const routeToPaymentScreen = async () => {
    window.location.assign(`${window.location.origin}/digit-ui/employee/payment/collect/TL/${application?.applicationNumber}/${application?.tenantId}`);
  }
  if (isLoading) {
    return <Loader page={true} />;
  }

   // ✅ Handle no data case
  if (!application?.applicationNumber) {
    return (
      <Card>
        <Banner
          message={t("TL_APPLICATION_NOT_FOUND")}
          applicationNumber={applicationNumber}
          info={t("TL_REF_NO_LABEL")}
          successful={false}
        />
        <ActionBar className="TL-response-dFlex-endBaseL">
          <Link to={`/digit-ui/employee`}>
            <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
          </Link>
        </ActionBar>
      </Card>
    );
  }

  return (
    <div>
        <Card>
          <Banner
            message={t("TL_APPLICATION_SUCCESS_MESSAGE_MAIN")}
            applicationNumber={application.applicationNumber}
            info={t("TL_REF_NO_LABEL")}
            successful={true}
          />
         
          {/* <CardText>{t("TL_NEW_SUCESS_RESPONSE_NOTIFICATION_LABEL")}</CardText> */}
          <div className="primary-label-btn d-grid"  onClick={printReciept}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
              </svg>
              {t("TL_PRINT_APPLICATION_LABEL")}
          </div>
          <ActionBar className="TL-response-dFlex-endBaseL">
          {application?.status !== "PENDINGPAYMENT" ? (

            <div className="TL-response-dFlex-endBaseL">
              <Link to={`/digit-ui/employee/tl/inbox`}>
                <SubmitBar label={t("TL HOME")} />
              </Link>
              <div className="TL-wAuto" >
                <Link to={`/digit-ui/employee`} className="TL-mr-1">
                  <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} onClick={() => sessionStorage.removeItem("isCreateEnabled")} />
                </Link>
              </div>
            </div>            
          ) : (
            <div  className="TL-response-dFlex-endGapW">
              <Link to={`/digit-ui/employee/tl/inbox`}>
                <SubmitBar label={t("TL HOME")} />
              </Link>
              <div className="TL-wAuto" onClick={routeToPaymentScreen}>
                <SubmitBar label={t("TL_COLLECT_PAYMENT")} />
              </div>
            </div>
          )}
          </ActionBar>
        </Card>
    </div>
  );
};
export default Response;
