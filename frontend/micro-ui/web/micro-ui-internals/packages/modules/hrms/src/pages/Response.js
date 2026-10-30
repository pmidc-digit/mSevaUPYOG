import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Card, Banner, CardText, SubmitBar, Loader, ActionBar } from "@mseva/digit-ui-react-components";
import { Link, Redirect } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetEmployeeForm } from "../redux/actions/employeeFormActions";

const GetMessage = (type, action, isSuccess, isEmployee, t) => {
  return t(`EMPLOYEE_RESPONSE_${action ? action : "CREATE"}_${type}${isSuccess ? "" : "_ERROR"}`);
};

const GetActionMessage = (action, isSuccess, isEmployee, t) => {
  return GetMessage("ACTION", action, isSuccess, isEmployee, t);
};

const GetLabel = (action, isSuccess, isEmployee, t) => {
  if (isSuccess) {
    return t("HR_EMPLOYEE_ID_LABEL");
  }
};

const BannerPicker = (props) => {
  return (
    <Banner
      message={GetActionMessage(props.action, props.isSuccess, props.isEmployee, props.t)}
      applicationNumber={props.isSuccess ? props?.data?.Employees?.[0]?.code : ""}
      info={GetLabel(props.action, props.isSuccess, props.isEmployee, props.t)}
      successful={props.isSuccess}
    />
  );
};

const Response = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  // Router state is lost on refresh or a direct link, so it can be undefined
  const state = props.location?.state;
  const submittedRef = useRef(false);
  const [mutationHappened, setMutationHappened] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_HAPPENED", false);
  const [errorInfo, setErrorInfo] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_ERROR_DATA", false);
  const [successData, setsuccessData] = Digit.Hooks.useSessionStorage("EMPLOYEE_HRMS_MUTATION_SUCCESS_DATA", false);
  const createMutation = Digit.Hooks.hrms.useHRMSCreate(tenantId);
  const updateMutation = Digit.Hooks.hrms.useHRMSUpdate(tenantId);
  const mutation = state?.key === "UPDATE" ? updateMutation : createMutation;

  // Clear form Redux when Response page mounts (after successful submission)
  useEffect(() => {
    dispatch(resetEmployeeForm());
  }, [dispatch]);

  const onError = (error) => {
    setErrorInfo(error?.response?.data?.Errors?.[0]?.code || "ERROR");
    setMutationHappened(true);
  };

  useEffect(() => {
    if (mutation.data) setsuccessData(mutation.data);
  }, [mutation.data]);

  // Let the employee details page refetch once a create or update has succeeded
  useEffect(() => {
    if (mutation.isSuccess || successData) {
      Digit.SessionStorage.set("isupdate", Math.floor(100000 + Math.random() * 900000));
    }
  }, [mutation.isSuccess, successData]);

  // The ref guards against a second submit when StrictMode re-runs effects on mount
  useEffect(() => {
    if (!state?.Employees || mutationHappened || submittedRef.current) return;
    submittedRef.current = true;
    mutation.mutate(
      { Employees: state.Employees },
      {
        onError,
        onSuccess: () => setMutationHappened(true),
      }
    );
  }, []);

  if (!state?.key) {
    return <Redirect to={`${props.parentRoute}/inbox`} />;
  }

  if (mutation.isLoading || (mutation.isIdle && !mutationHappened)) {
    return <Loader />;
  }

  const isSuccess = mutation.isSuccess || !!successData;
  const errorCode = mutation?.error?.response?.data?.Errors?.[0]?.code || errorInfo;
  const message = isSuccess ? (state.key === "CREATE" ? "HRMS_CREATE_EMPLOYEE_INFO" : "") : errorCode || "";

  return (
    <Card>
      <BannerPicker
        t={t}
        data={mutation?.data || successData}
        action={state.action}
        isSuccess={isSuccess}
        isEmployee={props.parentRoute.includes("employee")}
      />
      <CardText>{t(message)}</CardText>

      <ActionBar>
        <Link to={`${props.parentRoute.includes("employee") ? "/digit-ui/employee" : "/digit-ui/citizen"}`}>
          <SubmitBar label={t("CORE_COMMON_GO_TO_HOME")} />
        </Link>
      </ActionBar>
    </Card>
  );
};

export default Response;
