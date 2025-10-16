import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { Redirect, Route, Switch, useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { newConfig as newConfigEDCR } from "../../../config/edcrConfig";
import { uuidv4 } from "../../../utils";
import { Toast, Loader } from "@mseva/digit-ui-react-components";
// import EDCRAcknowledgement from "./EDCRAcknowledgement";

const CreateEDCR = ({ parentRoute }) => {
  const queryClient = useQueryClient();
  const match = useRouteMatch();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const history = useHistory();
  let config = [];
  const [params, setParams, clearParams] = Digit.Hooks.useSessionStorage("EDCR_CREATE", {});
  const [isShowToast, setIsShowToast] = useState(null);
  const [isSubmitBtnDisable, setIsSubmitBtnDisable] = useState(false);
  Digit.SessionStorage.set("EDCR_BACK", "IS_EDCR_BACK");
  const userInfo = Digit.UserService.getUser();
    const userRoles = userInfo?.info?.roles?.map((roleData) => roleData.code);
    const stateCode = Digit.ULBService.getStateId();
    const [stakeHolderRoles, setStakeholderRoles] = useState(false);
  const { data: stakeHolderDetails, isLoading: stakeHolderDetailsLoading } = Digit.Hooks.obps.useMDMS(
    stateCode,
    "StakeholderRegistraition",
    "TradeTypetoRoleMapping"
  );
  const [showToast, setShowToast] = useState(null);

  const stateId = Digit.ULBService.getStateId();
  let { data: newConfig } = Digit.Hooks.obps.SearchMdmsTypes.getFormConfig(stateId, []);

  useEffect(() => {
      if (!stakeHolderDetailsLoading) {
        let roles = [];
        stakeHolderDetails?.StakeholderRegistraition?.TradeTypetoRoleMapping?.map((type) => {
          type?.role?.map((role) => {
            roles.push(role);
          });
        });
        const uniqueRoles = roles?.filter((item, i, ar) => ar.indexOf(item) === i);
        let isRoute = false;
        uniqueRoles?.map((unRole) => {
          if (userRoles?.includes(unRole) && !isRoute) {
            isRoute = true;
          }
        });
        if (!isRoute) {
          setStakeholderRoles(false);
          setShowToast({ key: "true", message: t("BPA_LOGIN_HOME_VALIDATION_MESSAGE_LABEL") });
        } else {
          setStakeholderRoles(true);
        }
      }
    }, [stakeHolderDetailsLoading]);

  function handleSelect(key, data, skipStep, index) {
    setIsSubmitBtnDisable(true);
    const loggedInuserInfo = Digit.UserService.getUser();
    const formTenantId = data?.tenantId || data?.ulb;
    console.log(formTenantId, "I(((((((((");
    // const userInfo = { id: loggedInuserInfo?.info?.uuid, tenantId: loggedInuserInfo?.info?.tenantId };
    const userInfo = JSON.parse(localStorage.getItem("user-info"));

    let edcrRequest = {
      transactionNumber: "",
      edcrNumber: "",
      planFile: null,
      tenantId: "",
      RequestInfo: {
        apiId: "",
        ver: "",
        ts: "",
        action: "",
        did: "",
        authToken: "",
        key: "",
        msgId: "",
        correlationId: "",
        userInfo: userInfo,
      },
    };

    console.log(userInfo, loggedInuserInfo, "USER INFO");
    const applicantName = data?.applicantName;
    // const coreArea = data?.coreArea?.code;
    const coreArea = data?.areaType?.code === "SCHEME_AREA" ? "NO" : data?.coreArea?.code;
    console.log("A=====", coreArea, data?.areaType?.code, data?.areaType?.code === "SCHEME_AREA");
    const file = data?.file;
    // const tenantId = userInfo?.tenantId;
    const tenantId = formTenantId;
    const ulb = data?.ulb;
    const areaType = data?.areaType?.code;
    const schName = data?.schName;
    const siteReserved = data?.siteReserved?.code === "YES" ? true : false;
    const approvedCS = data?.approvedCS?.code === "YES" ? true : false;
    const cluApprove = data?.cluApprove?.code === "YES" ? true : false;
    const purchasableFar = data?.purchasableFar?.code === "YES" ? true : false;
    const schemeArea = data?.schemeArea?.code;
    const transactionNumber = uuidv4();
    const appliactionType = "BUILDING_PLAN_SCRUTINY";
    const applicationSubType = "NEW_CONSTRUCTION";

    console.log("tenantIdInEDCR", tenantId);
    console.log("tenantIdInEDCR-DATA", data);

    edcrRequest = { ...edcrRequest, tenantId };
    edcrRequest = { ...edcrRequest, transactionNumber };
    edcrRequest = { ...edcrRequest, applicantName };
    edcrRequest = { ...edcrRequest, coreArea };
    edcrRequest = { ...edcrRequest, appliactionType };
    edcrRequest = { ...edcrRequest, applicationSubType };
    // sub type to clu aprove
    edcrRequest = { ...edcrRequest, applicationSubType };
    edcrRequest = { ...edcrRequest, ulb };
    edcrRequest = { ...edcrRequest, areaType };
    edcrRequest = { ...edcrRequest, schName };
    edcrRequest = { ...edcrRequest, siteReserved };
    edcrRequest = { ...edcrRequest, approvedCS };
    edcrRequest = { ...edcrRequest, schemeArea };
    edcrRequest = { ...edcrRequest, cluApprove };
    edcrRequest = {...edcrRequest, purchasableFar};

    console.log("tenantIdInEDCR-Request", edcrRequest);

    let bodyFormData = new FormData();
    bodyFormData.append("edcrRequest", JSON.stringify(edcrRequest));
    bodyFormData.append("planFile", file);

    Digit.EDCRService.create({ data: bodyFormData }, tenantId)
      .then((result, err) => {
        setIsSubmitBtnDisable(false);
        if (result?.data?.edcrDetail) {
          console.log("result?.data", result?.data);
          sessionStorage.setItem("plotArea", result?.data?.edcrDetail[0].planDetail?.plot?.area || 0);
          setParams(result?.data?.edcrDetail);
          history.replace(
            `/digit-ui/citizen/obps/edcrscrutiny/apply/acknowledgement`, ///${result?.data?.edcrDetail?.[0]?.edcrNumber}
            { data: result?.data?.edcrDetail }
          );
        }
      })
      .catch((e) => {
        setParams({ data: e?.response?.data?.errorCode ? e?.response?.data?.errorCode : "BPA_INTERNAL_SERVER_ERROR", type: "ERROR" });
        setIsSubmitBtnDisable(false);
        setIsShowToast({ key: true, label: e?.response?.data?.errorCode ? e?.response?.data?.errorCode : "BPA_INTERNAL_SERVER_ERROR" });
      });
  }

  const closeToast = () => {
    window.location.replace("/digit-ui/citizen/obps-home");
  };

  const handleSkip = () => {};
  const handleMultiple = () => {};

  const onSuccess = () => {
    sessionStorage.removeItem("CurrentFinancialYear");
    queryClient.invalidateQueries("TL_CREATE_TRADE");
  };
  newConfig = newConfig?.EdcrConfig ? newConfig?.EdcrConfig : newConfigEDCR;
  newConfig.forEach((obj) => {
    config = config.concat(obj.body.filter((a) => !a.hideInCitizen));
  });
  config.indexRoute = "home";

  const EDCRAcknowledgement = Digit?.ComponentRegistryService?.getComponent("EDCRAcknowledgement");

  if (stakeHolderDetailsLoading) {
      return <Loader />;
    }
  if (showToast) return <Toast error={true} label={t(showToast?.message)} isDleteBtn={true} onClose={closeToast} />;

  if(!showToast) {return (
    <Switch>
      {config.map((routeObj, index) => {
        const { component, texts, inputs, key } = routeObj;
        const Component = typeof component === "string" ? Digit.ComponentRegistryService.getComponent(component) : component;
        return (
          <Route path={`${match.path}/${routeObj.route}`} key={index}>
            <Component
              config={{ texts, inputs, key }}
              onSelect={handleSelect}
              onSkip={handleSkip}
              t={t}
              formData={params}
              onAdd={handleMultiple}
              isShowToast={isShowToast}
              isSubmitBtnDisable={isSubmitBtnDisable}
              setIsShowToast={setIsShowToast}
            />
          </Route>
        );
      })}
      <Route path={`${match.path}/acknowledgement`}>
        <EDCRAcknowledgement data={params} onSuccess={onSuccess} />
      </Route>
      <Route>
        <Redirect to={`${match.path}/${config.indexRoute}`} />
      </Route>
    </Switch>
  )};
};

export default CreateEDCR;
