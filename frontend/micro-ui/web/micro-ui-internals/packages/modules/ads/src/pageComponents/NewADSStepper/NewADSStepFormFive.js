import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FormComposer, Toast, ActionBar, SubmitBar, Menu } from "@mseva/digit-ui-react-components";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import _ from "lodash";
// import { PaymentService } from "../../../../../libraries/src/services/elements/Payment"; // adjust path to where payment.js lives
// import { useLocation } from "react-router-dom";

import { useHistory } from "react-router-dom";
function NewADSStepFormFive(props) {
  var config = props.config;
  var onGoNext = props.onGoNext;
  var onBackClick = props.onBackClick;
  var t = props.t;
  const history = useHistory();
  const [displayMenu, setDisplayMenu] = useState(false);
  const menuRef = useRef();
  const [wfActions, setWfActions] = useState([]);

  function normalizeAssignees(assignee) {
    if (!assignee) return null;

    const extract = (item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      // common object shapes: { uuid }, { id }, { employeeId }, { code }
      return item.uuid || item.id || item.employeeId || item.code || null;
    };

    if (Array.isArray(assignee)) {
      const mapped = assignee.map((it) => extract(it)).filter(Boolean);
      return mapped.length ? mapped : null;
    }

    // single object or string
    const single = extract(assignee);
    return single ? [single] : null;
  }

  var dispatch = useDispatch();
  var _useState = useState(false),
    showToast = _useState[0],
    setShowToast = _useState[1];

  const isCitizen = window.location.href.includes("citizen");

  const tenantId = isCitizen ? window.localStorage.getItem("CITIZEN.CITY") : window.localStorage.getItem("Employee.tenant-id");

  var _useState2 = useState(""),
    error = _useState2[0],
    setError = _useState2[1];
  var currentStepData = useSelector(function (state) {
    return (state && state.ads && state.ads.ADSNewApplicationFormReducer && state.ads.ADSNewApplicationFormReducer.formData) || {};
  }, _.isEqual);
  var currentStepDataRef = useRef(currentStepData);
  useEffect(
    function () {
      currentStepDataRef.current = currentStepData;
    },
    [currentStepData]
  );
  const globalBookingNo = currentStepData?.bookingNo || currentStepData?.CreatedResponse?.bookingNo || "";

  const businessServicMINE = "advandhoarding-services";

  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: globalBookingNo,
    moduleCode: businessServicMINE,
  });

  console.log("workflowDetails", workflowDetails);

  // useEffect(() => {
  //   // defensive: grab stable slice of the hook's data
  //   const wd = workflowDetails?.data;
  //   // if no data, clear wfActions only if something is present (avoid unnecessary setState)
  //   if (!wd) {
  //     setWfActions((prev) => (prev && prev.length ? [] : prev));
  //     return;
  //   }

  //   const proc = wd.processInstances && wd.processInstances.length ? wd.processInstances[0] : null;
  //   const nextActions = (proc && proc.nextActions) || wd.nextActions || [];

  //   // map raw actions -> our normalized actions
  //   const mapped = (nextActions || []).map((a) => ({
  //     action: a.action,
  //     roles: a.roles || [],
  //     assignee: a.assignee || a.assignees || a.assigner || null,
  //     nextStateUuid: a.nextState || a.nextStateUuid || null,
  //     nextState: a.nextState || a.nextStateUuid || null,
  //     buttonLabel: (a.action || "").replace(/_/g, " ").toUpperCase(),
  //     comment: a.comment || a.action || "",
  //     _rawAction: a,
  //   }));

  //   // role filter (current user)
  //   const logged = Digit.UserService.getUser();
  //   let userRolesNow = logged?.info?.roles?.map((r) => r.code) || [];
  //   if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
  //     const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
  //     const userInfo = userInfos ? JSON.parse(userInfos) : {};
  //     userRolesNow = userInfo?.value?.info?.roles?.map((r) => r.code) || userRolesNow;
  //   }

  //   const filteredByRole = mapped.filter((a) => {
  //     if (!a.roles || a.roles.length === 0) return true;
  //     return userRolesNow.some((ur) => a.roles.includes(ur));
  //   });

  //   // only update state if content actually changed (prevents infinite re-render loop)
  //   setWfActions((prev) => {
  //     if (_.isEqual(prev, filteredByRole)) return prev; // no-op, preserves same ref -> no rerender
  //     return filteredByRole;
  //   });
  // }, [workflowDetails?.data?.applicationBusinessService, workflowDetails?.data?.processInstances?.length]);

  useEffect(() => {
    // defensive: grab stable slice of the hook's data
    const wd = workflowDetails?.data;
    // if no data, clear wfActions only if something is present (avoid unnecessary setState)
    if (!wd) {
      setWfActions((prev) => (prev && prev.length ? [] : prev));
      return;
    }

    const proc = wd.processInstances && wd.processInstances.length ? wd.processInstances[0] : null;
    const nextActions = (proc && proc.nextActions) || wd.nextActions || [];

    // map raw actions -> our normalized actions
    const mapped = (nextActions || []).map((a) => ({
      action: a.action,
      roles: a.roles || [],
      assignee: a.assignee || a.assignees || a.assigner || null,
      nextStateUuid: a.nextState || a.nextStateUuid || null,
      nextState: a.nextState || a.nextStateUuid || null,
      buttonLabel: (a.action || "").replace(/_/g, " ").toUpperCase(),
      comment: a.comment || a.action || "",
      _rawAction: a,
    }));

    // role filter (current user)
    const logged = Digit.UserService.getUser();
    let userRolesNow = logged?.info?.roles?.map((r) => r.code) || [];
    if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
      const userInfos = sessionStorage.getItem("Digit.citizen.userRequestObject");
      const userInfo = userInfos ? JSON.parse(userInfos) : {};
      userRolesNow = userInfo?.value?.info?.roles?.map((r) => r.code) || userRolesNow;
    }

    const filteredByRole = mapped.filter((a) => {
      if (!a.roles || a.roles.length === 0) return true;
      return userRolesNow.some((ur) => a.roles.includes(ur));
    });

    // ✅ filter only SUBMIT actions
    const submitOnly = filteredByRole.filter((a) => a.action === "SUBMIT");

    // only update state if content actually changed (prevents infinite re-render loop)
    setWfActions((prev) => {
      if (_.isEqual(prev, submitOnly)) return prev; // no-op, preserves same ref -> no rerender
      return submitOnly;
    });
  }, [workflowDetails?.data?.applicationBusinessService, workflowDetails?.data?.processInstances?.length]);

  var ignoredInitialChangeRef = useRef(true);
  var lastDispatchedRef = useRef(null);
  var debounceTimerRef = useRef(null);
  // const getValue = (v) =>
  //   v && typeof v === "object" && "code" in v ? v.code : v;
  // function validateStepData() {
  //   return { missingFields: [], notFormattedFields: [] };
  // }

  const goNext = useCallback(
    async function onSubmit(data = undefined) {
      const wd = workflowDetails?.data;
      // data can be:
      //  - a workflow payload { action, nextState, status, comment, assignee, _rawAction }
      //  - or a form submit object from FormComposer (no .action)

      // merge form state (existing behavior)
      const payloadState = _.merge(_.cloneDeep(currentStepDataRef.current), data || {});

      // If caller passed a workflow payload, pick it. Otherwise try to find a workflow action inside data
      const filtData = data?.action ? data : data?.Licenses?.[0] || null;
      const matchingState = filtData.nextState || filtData.nextStateUuid || filtData.status || "";
      const normalizedAssignee = normalizeAssignees(filtData?.assignee || filtData?.assignees || filtData?.assigneeUuid);

      // If no workflow action is provided (pure form submit) fall back to previous finalSubmission behavior
      if (!filtData || !filtData.action) {
        // keep previous finalSubmission flow: dispatch then return (no ADSServices.update)
        dispatch(UPDATE_ADSNewApplication_FORM("finalSubmission", payloadState));
        return;
      }

      // dispatch finalSubmission into redux (preserve existing behavior)
      dispatch(UPDATE_ADSNewApplication_FORM("finalSubmission", payloadState));

      // Determine matching state for workflow.states (the backend might expect a state string)

      // status we will send: prefer incoming filtData.status (we resolved it on selection),
      // otherwise fallback to matchingState or the provided nextState
      const statusToSend = wd?.data?.processInstances?.state?.applicationStatus || "";
      const formData = {
        tenantId: tenantId,
        ...payloadState?.CreatedResponse,
        // right after payloadState is set

        bookingStatus:
          statusToSend === "INITIATED"
            ? "BOOKING_CREATED"
            : statusToSend === "REFUND"
            ? "CANCELLED"
            : statusToSend || payloadState?.CreatedResponse?.bookingStatus,
        documents: payloadState?.documents?.documents?.documents || payloadState?.documents || payloadState?.Documents || [],
        workflow: {
          businessService: workflowDetails?.data?.applicationBusinessService || "ADV",
          states: matchingState || statusToSend || "",
          action: filtData.action || "",
          comments: filtData.comment || filtData.action || "",
          status: statusToSend,
          ...(normalizedAssignee ? { assignee: normalizedAssignee } : {}),
        },
      };

      const requestBody = { bookingApplication: formData };

      // Validation: FORWARD requires assignee
      if (!filtData?.assignee && filtData.action === "FORWARD") {
        setError("Assignee is mandatory");
        setShowToast(true);
        return;
      }

      try {
        const response = await Digit.ADSServices.update(requestBody, tenantId);
        if (response?.ResponseInfo?.status === "SUCCESSFUL" || response?.status === "SUCCESSFUL") {
          // merge and update redux store (preserve earlier behavior)
          const prev = Digit?.Store?.getState?.()?.ads?.ADSNewApplicationFormReducer?.formData || currentStepDataRef.current || {};
          const merged = { ...prev, ...payloadState };
          const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined));
          dispatch(UPDATE_ADSNewApplication_FORM("formData", cleaned));

          // navigate to response (preserve existing flow)
          history.replace(
            isCitizen
              ? `/digit-ui/citizen/ads/adsservice/response/${currentStepDataRef.current?.CreatedResponse?.bookingNo}`
              : `/digit-ui/employee/ads/adsservice/response/${currentStepDataRef.current?.CreatedResponse?.bookingNo}`,
            { applicationData: currentStepDataRef.current?.CreatedResponse }
          );
        } else {
          setError((t && t("SOMETHING_WENT_WRONG")) || "Failed to update");
          setShowToast(true);
        }
      } catch (err) {
        console.error("ADS update error:", err);
        setError((t && t("SOMETHING_WENT_WRONG")) || "Failed to update");
        setShowToast(true);
      }
    },
    [tenantId, t, dispatch, workflowDetails?.data?.applicationBusinessService, history, isCitizen]
  );

  function onGoBack(data) {
    onBackClick(config.key, data);
  }
  var onFormValueChange = useCallback(
    function () {
      var setValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var data = arguments.length > 1 ? arguments[1] : undefined;
      if (ignoredInitialChangeRef.current) {
        ignoredInitialChangeRef.current = false;
        return;
      }
      if (!data) return;
      if (_.isEqual(data, currentStepDataRef.current)) return;
      if (lastDispatchedRef.current && _.isEqual(data, lastDispatchedRef.current)) return;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(function () {
        const cleanStep = _.omitBy(_.cloneDeep(data), (v) => v === undefined);

        if (config?.key === "summary" && Object.keys(cleanStep).length === 1 && cleanStep.summary === "") {
          return;
        }
        const merged = _.merge({}, currentStepDataRef.current, cleanStep);
        if (Object.keys(cleanStep).length > 0 && !_.isEqual(merged, currentStepDataRef.current)) {
          lastDispatchedRef.current = merged;
          dispatch(UPDATE_ADSNewApplication_FORM("formData", merged));
        }
      }, 100);
    },
    [dispatch, config && config.key]
  );
  useEffect(function () {
    return function () {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);
  var closeToast = function () {
    setShowToast(false);
    setError("");
  };
  const safeDefaults = React.useMemo(() => {
    const dv = currentStepData || {};

    return dv.summary === undefined ? { ...dv, summary: "" } : dv;
  }, [currentStepData]);

  let user = Digit.UserService.getUser();
  const userRoles = user?.info?.roles?.map((e) => e.code);

  // const applicationUuid =
  // currentStepData?.CreatedResponse
  //   ?.AdvertisementApplications?.[0]?.uuid;

  // const workflowDetails = Digit.Hooks.useWorkflowDetails({
  //   tenantId,
  //   id: currentStepData.CreatedResponse.applicantDetail.applicantDetailId,
  //   // id: "c0aa1f99-6d31-46c5-90e2-9be9bb662b12",
  //   moduleCode: "ADS",
  // });

  // const businessService = "ads";
  // const businessService = "ptr";

  // const businessService= 'ADV';
  //   const workflowDetails = Digit.Hooks.useWorkflowDetails({
  // tenantId,
  //    id: currentStepData?.CreatedResponse?.bookingNo,
  //    moduleCode: businessService,
  //  });

  // Call this directly to get raw business service data

  const filteredActions = React.useMemo(() => wfActions || [], [wfActions]);

  // const existingWorkflow = {
  //   businessService: businessServiceData?.BusinessServices?.[0]?.businessService || "ADV",
  //   states: businessServiceData?.BusinessServices?.[0]?.states || []
  // };
  function onActionSelect(wfAction) {
    if (!wfAction) return;

    // Quick route for payment

    // Decide whether to prefer toState (target) or fromState (origin)
    // Use toState for obvious forward transitions, otherwise prefer fromState for verifier actions
    const preferToStateFor = new Set(["SUBMIT", "INITIATE", "PAY"]);
    const from = wfAction.fromStateCode || wfAction._rawStateObj?.state || null;
    const to = wfAction.toStateCode || null;
    const resolvedStatus = preferToStateFor.has(wfAction.action) ? to || from || wfAction.nextStateUuid : from || to || wfAction.nextStateUuid;

    // Create a payload that goNext understands (goNext will treat it as a workflow action if it has .action)
    const wfPayload = {
      action: wfAction.action,
      nextState: wfAction.nextState || wfAction.nextStateUuid || null,
      status: resolvedStatus || "",
      comment: wfAction.comment || wfAction.action || "",
      assignee: wfAction.assignee || null,
      _rawAction: wfAction,
    };

    // For your simple flow: call goNext directly (goNext will update backend)
    goNext(wfPayload);
  }

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  return React.createElement(
    React.Fragment,
    null,

    React.createElement(FormComposer, {
      defaultValues: safeDefaults,
      config: config && config.currStepConfig,
      onSubmit: (formData) => goNext({ ...formData, _isFormSubmit: true }),
      onFormValueChange: onFormValueChange,
      label: t && config && config.texts ? t(config.texts.submitBarLabel) : "",
      currentStep: config && config.currStepNumber,
      onBackClick: onGoBack,
    }),

    showToast &&
      React.createElement(Toast, {
        isDleteBtn: true,
        error: true,
        label: error,
        onClose: closeToast,
      }),

    React.createElement(
      ActionBar,
      null,

      React.createElement(SubmitBar, {
        label: t("CS_COMMON_BACK"),
        onSubmit: onGoBack,
        variant: "secondary",
      }),

      displayMenu && (
        <Menu
          localeKeyPrefix=""
          options={filteredActions}
          optionKey="action"
          t={t}
          onSelect={(action) => {
            onActionSelect(action);
            setDisplayMenu(false);
          }}
        />
      ),

      React.createElement(SubmitBar, {
        ref: menuRef,
        label: t("WF_TAKE_ACTION"),
        onSubmit: () => setDisplayMenu(!displayMenu),
      })
    )
  );
}
export default NewADSStepFormFive;
