import React,{ useState }  from "react";
import { Card, Banner, CardText, SubmitBar } from "@mseva/digit-ui-react-components";
import { Link, useRouteMatch } from "react-router-dom";
import { useSelector } from "react-redux";
import { PgrRoutes, getRoute } from "../../constants/Routes";
import { useTranslation } from "react-i18next";
import getSWACHcknowledgementData from "../../utils/getSWACHcknowledgementData"
const GetActionMessage = ({ action }) => {
  const { t } = useTranslation();
  if (action === "REOPEN") {
    return t(`CS_COMMON_COMPLAINT_REOPENED`);
  } else {
    return t(`CS_COMMON_COMPLAINT_SUBMITTED`);
  }
};

const BannerPicker = ({ response }) => {
  const { swach } = response;

  if (swach && swach.response && swach.response.responseInfo) {
    sessionStorage.removeItem("type" );
    sessionStorage.removeItem("pincode");
    sessionStorage.removeItem("tenantId");
    sessionStorage.removeItem("localityCode");
    sessionStorage.removeItem("landmark"); 
    sessionStorage.removeItem("propertyid")
    return (
      <Banner
        message={GetActionMessage(swach.response.ServiceWrappers[0].workflow)}
        complaintNumber={swach.response.ServiceWrappers[0].service.serviceRequestId}
        successful={true}
      />
    );
  } else {
    return <Banner message={t("CS_COMMON_COMPLAINT_NOT_SUBMITTED")} successful={false} />;
  }
};

const Response = (props) => {
  const { t } = useTranslation();
  const { match } = useRouteMatch();
  const appState = useSelector((state) => {console.log("Response State", state); return state})["swach"];
  const { data: storeData } = Digit.Hooks.useStore.getInitData();
  const { tenants } = storeData || {};
  const [enable, setEnable] = useState(false)
  let id= appState?.swach?.response?.ServiceWrappers?.[0]?.service?.serviceRequestId
  const tenantId = window.Digit.SessionStorage.get("Employee.tenantId");
  const { isLoading, error, isError, complaintDetails, revalidate } = Digit.Hooks.swach.useComplaintDetails({ tenantId:tenantId, id },{ enabled: enable ? true : false}); // Respnse Page is changed
  
  const handleDownloadPdf = async (e) => {
    const tenantInfo = tenants.find((tenant) => tenant.code === tenantId);
    e.preventDefault()
    setEnable(true)
    const data = await getSWACHcknowledgementData({ ...complaintDetails }, tenantInfo, t);
    Digit.Utils.pdf.generate(data);
  };
  return (
    <Card>
      {appState.swach.response && <BannerPicker response={appState} />}
      <CardText>{t("ES_COMMON_TRACK_COMPLAINT_TEXT")}</CardText>
      <Link to="/digit-ui/employee">
        <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
      </Link>
      {appState.swach.response && <SubmitBar label={t("PT_DOWNLOAD_ACK_FORM")} onSubmit={(e) =>{handleDownloadPdf(e)}} />}
    </Card>
  );
};

export default Response;
