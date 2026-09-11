import { Banner, Card, Loader, ActionBar, SubmitBar, Header } from "@mseva/digit-ui-react-components";
import { useQueryClient } from "react-query";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// const getMessage = (mutation) => {
//   if (mutation.isSuccess && mutation?.data?.Surveys?.[0]?.uuid){
//     return mutation?.data?.Surveys?.[0]?.uuid
//   }
//   if (mutation.isSuccess) return mutation.data?.Documents?.[0]?.uuid;
//   return "";
// };

const BannerPicker = (props) => {
  const { t } = useTranslation();
  console.log("props", props);
  return (
    <Banner
      message={props.props.message}
      applicationNumber={props.props.response}
      info={props.props.isSuccess ? t(props.props.labelName) : ""}
      successful={props.props.isSuccess}
    />
  );
};

const SubmitResponse = (props) => {
  // const queryClient = useQueryClient();

  const isCitizen = window.location.href.includes("citizen");

  console.log("isCitizen", isCitizen);

  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  //const mutation = Digit.Hooks.survey.useUpdate();
  // const { state } = props.location;

  //   useEffect(() => {
  //     const onSuccess = () => {
  //       queryClient.clear();
  //       window.history.replaceState(null, 'UPDATE_SURVEY_STATE')
  //     };
  //     if(!!state){
  //       mutation.mutate(state, {
  //         onSuccess,
  //       });
  //     }
  //   }, []);

  //   if (mutation.isLoading || mutation.isIdle) {
  //     return <Loader />;
  //   }

  const targetAud = isCitizen ? "citizen" : "employee";
  //console.log("props",props)
  const urlTennatId = props?.location?.state?.responseData?.tenantId;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Header>{props?.location?.state?.headerName}</Header>
        <h1 style={{ fontSize: "18px", border: "1px solid grey", padding: "8px", backgroundColor: "grey", color: "white" }}>
          Property ID: {props?.location?.state?.responseData?.propertyId}
        </h1>
      </div>
      <Card>
        <BannerPicker props={props.location.state} />
        {/* <BannerPicker t={t} data={mutation.data} mutation={mutation} isSuccess={mutation.isSuccess} isLoading={mutation.isIdle || mutation.isLoading} /> */}
      </Card>
      <ActionBar>
        <Link to={`/digit-ui/citizen/pt/property/my-property/${props?.location?.state?.responseData?.propertyId}`}>
          <SubmitBar label={t("Go Back")} />
        </Link>
        <Link to={"/digit-ui/citizen/pt-home"}>
          <SubmitBar label={t("Go Home")} />
        </Link>
        <Link to={{
          pathname: `/digit-ui/${targetAud}/payment/collect/PT/${props?.location?.state?.responseData?.propertyId}`,
          state: {
            tenantId: urlTennatId
          }
        }}>
          <SubmitBar label={t("PT_PROCEED_PAYMENT")} />
        </Link>
      </ActionBar>
    </div>
  );
};

export default SubmitResponse;
