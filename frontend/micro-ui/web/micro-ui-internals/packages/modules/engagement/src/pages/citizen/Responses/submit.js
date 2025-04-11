import { Banner, Card, Loader, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
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
  console.log("props",props)
  return (
    <Banner
      message={props.props.message}
      applicationNumber={props.props.response?.SubmitResponse?.surveyUuid}
      info={props.props.isSuccess ? t("SURVEY_FORM_ID") : ""}
      successful={props.props.isSuccess}
    />
  );
};

const SubmitResponse = (props) => {
 // const queryClient = useQueryClient();
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  //const mutation = Digit.Hooks.survey.useUpdate();
  const { state } = props.location;

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

  return (
    <div>

      <Card>
      <BannerPicker props={props.location.state} />
        {/* <BannerPicker t={t} data={mutation.data} mutation={mutation} isSuccess={mutation.isSuccess} isLoading={mutation.isIdle || mutation.isLoading} /> */}
      </Card>
      <ActionBar>
        <Link to={"/digit-ui/citizen"}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      </ActionBar>
    </div>
  );
};

export default SubmitResponse;
