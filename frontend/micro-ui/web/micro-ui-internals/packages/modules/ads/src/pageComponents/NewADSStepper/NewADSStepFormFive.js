import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { FormComposer, Toast, ActionBar, SubmitBar, Menu } from "@mseva/digit-ui-react-components";
import _ from "lodash";
import { UPDATE_ADSNewApplication_FORM } from "../../redux/action/ADSNewApplicationActions";
import { Loader } from "../../../../challanGeneration/src/components/Loader";
import { allowedKeys, haveSlotsChanged } from "../../utils";

const NewADSStepFormFive = ({ config, onBackClick, t }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [displayMenu, setDisplayMenu] = useState(false);
  const [wfActions, setWfActions] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef();
  const currentStepData = useSelector((state) => state?.ads?.ADSNewApplicationFormReducer?.formData || {}, _.isEqual);
  const updatedCartSlots = currentStepData?.ads?.flatMap((item) => item.slots);
  const previousSlots = currentStepData?.CreatedResponse?.cartDetails || currentStepData?.CreatedResponse?.ownerDetails?.cartDetails;

  const isCitizen = window?.location?.href?.includes("citizen");
  const tenantId = isCitizen ? window?.localStorage?.getItem("CITIZEN.CITY") : window?.localStorage?.getItem("Employee.tenant-id");
  const globalBookingNo = currentStepData?.bookingNo || currentStepData?.CreatedResponse?.bookingNo || "";
  const bookingId = currentStepData?.bookingId || currentStepData?.CreatedResponse?.bookingId || "";
  const businessService = "advandhoarding-services";
  const workflowDetails = Digit.Hooks.useWorkflowDetails({
    tenantId,
    id: globalBookingNo,
    moduleCode: businessService,
  });

  const changed = haveSlotsChanged(previousSlots, updatedCartSlots);

  // --- Normalize Assignees ---
  const normalizeAssignees = (assignee) => {
    if (!assignee) return null;

    const extract = (item) => {
      if (!item) return null;
      if (typeof item === "string") return item;
      return item.uuid || item.id || item.employeeId || item.code || null;
    };

    if (Array.isArray(assignee)) {
      const mapped = assignee.map(extract).filter(Boolean);
      return mapped.length ? mapped : null;
    }

    const single = extract(assignee);
    return single ? [single] : null;
  };

  // --- Workflow Actions ---
  useEffect(() => {
    const wd = workflowDetails?.data;
    if (!wd) {
      setWfActions((prev) => (prev?.length ? [] : prev));
      return;
    }

    const proc = wd.processInstances?.length ? wd.processInstances[0] : null;
    const nextActions = proc?.nextActions || wd.nextActions || [];

    const mapped = nextActions.map((a) => ({
      action: a?.action,
      roles: a?.roles || [],
      assignee: a?.assignee || a?.assignees || a?.assigner || null,
      nextStateUuid: a?.nextState || a?.nextStateUuid || null,
      nextState: a?.nextState || a?.nextStateUuid || null,
      buttonLabel: (a?.action || "")?.replace(/_/g, " ")?.toUpperCase(),
      comment: a?.comment || a?.action || "",
      _rawAction: a,
    }));

    const logged = Digit.UserService.getUser();
    let userRolesNow = logged?.info?.roles?.map((r) => r.code) || [];

    if (window.location.href.includes("/obps") || window.location.href.includes("/noc")) {
      const userInfos = sessionStorage?.getItem("Digit.citizen.userRequestObject");
      const userInfo = userInfos ? JSON.parse(userInfos) : {};
      userRolesNow = userInfo?.value?.info?.roles?.map((r) => r.code) || userRolesNow;
    }

    const filteredByRole = mapped?.filter((a) => !a.roles?.length || userRolesNow?.some((ur) => a?.roles?.includes(ur)));

    const submitOnly = filteredByRole?.filter((a) => a?.action === "SUBMIT");

    setWfActions((prev) => (_.isEqual(prev, submitOnly) ? prev : submitOnly));
  }, [workflowDetails?.data?.applicationBusinessService, workflowDetails?.data?.processInstances?.length]);

  // --- Debounced Form Updates ---
  const ignoredInitialChangeRef = useRef(true);
  const lastDispatchedRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const onFormValueChange = useCallback(
    (_setValue = true, data) => {
      if (ignoredInitialChangeRef?.current) {
        ignoredInitialChangeRef.current = false;
        return;
      }
      if (!data) return;
      if (_.isEqual(data, currentStepData)) return;
      if (lastDispatchedRef?.current && _.isEqual(data, lastDispatchedRef?.current)) return;

      if (debounceTimerRef?.current) clearTimeout(debounceTimerRef?.current);

      debounceTimerRef.current = setTimeout(() => {
        const cleanStep = _.omitBy(_.cloneDeep(data), (v) => v === undefined);

        if (config?.key === "summary" && Object?.keys(cleanStep)?.length === 1 && cleanStep?.summary === "") {
          return;
        }

        const merged = _.merge({}, currentStepData, cleanStep);
        if (Object?.keys(cleanStep)?.length > 0 && !_.isEqual(merged, currentStepData)) {
          lastDispatchedRef.current = merged;
          dispatch(UPDATE_ADSNewApplication_FORM("formData", merged));
        }
      }, 100);
    },
    [dispatch, config?.key]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef?.current) clearTimeout(debounceTimerRef?.current);
    };
  }, []);

  // Build lookup maps for quick access
  const updatedMap = new Map(updatedCartSlots.map((slot) => [`${slot?.advertisementId}_${slot?.bookingDate}`, slot]));

  const previousMap = new Map(previousSlots?.map((slot) => [`${slot?.advertisementId}_${slot?.bookingDate}`, slot]));

  // Merge logic
  const modifiedSlots = [];

  for (const [key, updatedSlot] of updatedMap?.entries()) {
    if (previousMap?.has(key)) {
      // Exists in both → take previous version (preserve extra keys)
      modifiedSlots?.push(previousMap?.get(key));
    } else {
      // Exists only in updated → take only whitelisted keys
      const filteredSlot = Object?.fromEntries(Object.entries(updatedSlot)?.filter(([key]) => allowedKeys?.includes(key)));
      // 🔑 Override bookingId here
      filteredSlot.bookingId = bookingId;
      filteredSlot.status = "BOOKING_CREATED";

      // or set to a fixed value if you already have it
      // filteredSlot.bookingId = "NEW-BOOKING-ID";

      modifiedSlots?.push(filteredSlot);
    }
  }

  // helper for delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const goNext = useCallback(
    async (data = undefined) => {
      const wd = workflowDetails?.data;
      const payloadState = _.merge(_.cloneDeep(currentStepData), data || {});

      const filtData = data?.action ? data : data?.Licenses?.[0] || null;
      const matchingState = filtData?.nextState || filtData?.nextStateUuid || filtData?.status || "";
      const normalizedAssignee = normalizeAssignees(filtData?.assignee || filtData?.assignees || filtData?.assigneeUuid);

      if (!filtData || !filtData.action) {
        dispatch(UPDATE_ADSNewApplication_FORM("finalSubmission", payloadState));
        return;
      }

      dispatch(UPDATE_ADSNewApplication_FORM("finalSubmission", payloadState));

      const statusToSend = wd?.data?.processInstances?.state?.applicationStatus || "";

      // helper to build formData
      const buildFormData = (source) => ({
        tenantId,
        ...source,
        bookingStatus:
          statusToSend === "INITIATED" ? "BOOKING_CREATED" : statusToSend === "REFUND" ? "CANCELLED" : statusToSend || source?.bookingStatus,
        // ✅ Prefer whatever was passed in (source.documents),
        // otherwise fall back to payloadState
        documents: source?.documents ?? [],
        workflow: {
          businessService: workflowDetails?.data?.applicationBusinessService || "ADV",
          states: matchingState || statusToSend || "",
          action: filtData?.action || "",
          comments: filtData?.comment || filtData?.action || "",
          status: statusToSend,
          ...(normalizedAssignee ? { assignee: normalizedAssignee } : {}),
        },
      });

      // 0. Merge updated applicant and address details from ownerDetails
      const updatedApplicant = payloadState?.ownerDetails?.applicantDetail || payloadState?.CreatedResponse?.applicantDetail;
      const updatedAddress = payloadState?.ownerDetails?.address || payloadState?.CreatedResponse?.address;

      // default formData (before modify)
      let formData = buildFormData({
        ...payloadState?.CreatedResponse,
        applicantDetail: updatedApplicant,
        address: updatedAddress,
        documents: payloadState?.documents?.documents?.documents || payloadState?.documents || payloadState?.Documents || [],
      });

      if (!filtData?.assignee && filtData?.action === "FORWARD") {
        setError("Assignee is mandatory");
        setShowToast(true);
        return;
      }

      setIsLoading(true);
      try {
        if (changed) {
          //Update payload for modify
          formData = buildFormData({
            ...payloadState?.CreatedResponse,
            applicantDetail: updatedApplicant,
            address: updatedAddress,
            cartDetails: modifiedSlots,
            documents: [],
          });
          // 🔄 call modify API
          const modifyRes = await Digit.ADSServices.cart_slots_modify({ bookingApplication: formData }, tenantId);

          if (!(modifyRes?.ResponseInfo?.status === "SUCCESSFUL" || modifyRes?.status === "SUCCESSFUL")) {
            setError(t("SOMETHING_WENT_WRONG") || "Failed to modify slots");
            setShowToast(true);
            return;
          }

          await delay(4000);

          // ✅ override cartDetails, applicantDetail, and address inside CreatedResponse
          const overriddenSource = {
            ...payloadState?.CreatedResponse,
            applicantDetail: updatedApplicant,
            address: updatedAddress,
            cartDetails: modifyRes?.bookingApplication?.[0]?.cartDetails,
            documents: payloadState?.documents?.documents?.documents || payloadState?.documents || payloadState?.Documents || [],
          };

          formData = buildFormData(overriddenSource);
        }

        // 🔄 update API
        const updateRes = await Digit.ADSServices.update({ bookingApplication: formData }, tenantId);

        if (updateRes?.ResponseInfo?.status === "SUCCESSFUL" || updateRes?.status === "SUCCESSFUL") {
          const prev = Digit?.Store?.getState?.()?.ads?.ADSNewApplicationFormReducer?.formData || currentStepData || {};
          const merged = { ...prev, ...payloadState };
          const cleaned = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== undefined));

          dispatch(UPDATE_ADSNewApplication_FORM("formData", cleaned));

          history.replace(
            isCitizen
              ? `/digit-ui/citizen/ads/adsservice/response/${currentStepData?.CreatedResponse?.bookingNo}`
              : `/digit-ui/employee/ads/adsservice/response/${currentStepData?.CreatedResponse?.bookingNo}`,
            { applicationData: currentStepData?.CreatedResponse }
          );
        } else {
          setError(t("SOMETHING_WENT_WRONG") || "Failed to update");
          setShowToast(true);
        }
      } catch (err) {
        setError(t("SOMETHING_WENT_WRONG") || "Failed to update");
        setShowToast(true);
      } finally {
        setIsLoading(false);
      }
    },
    [tenantId, t, dispatch, workflowDetails?.data?.applicationBusinessService, history, isCitizen, changed]
  );

  const onGoBack = (data) => {
    onBackClick(config.key, data);
  };

  const closeToast = () => {
    setShowToast(false);
    setError("");
  };

  const safeDefaults = useMemo(() => {
    const dv = currentStepData || {};
    return dv?.summary === undefined ? { ...dv, summary: "" } : dv;
  }, [currentStepData]);

  const filteredActions = useMemo(() => wfActions || [], [wfActions]);

  const onActionSelect = (wfAction) => {
    if (!wfAction) return;

    const preferToStateFor = new Set(["SUBMIT", "INITIATE", "PAY"]);
    const from = wfAction?.fromStateCode || wfAction?._rawStateObj?.state || null;
    const to = wfAction?.toStateCode || null;
    const resolvedStatus = preferToStateFor?.has(wfAction?.action) ? to || from || wfAction?.nextStateUuid : from || to || wfAction?.nextStateUuid;

    const wfPayload = {
      action: wfAction?.action,
      nextState: wfAction?.nextState || wfAction?.nextStateUuid || null,
      status: resolvedStatus || "",
      comment: wfAction?.comment || wfAction?.action || "",
      assignee: wfAction?.assignee || null,
      _rawAction: wfAction,
    };

    goNext(wfPayload);
  };

  const closeMenu = () => {
    setDisplayMenu(false);
  };

  Digit.Hooks.useClickOutside(menuRef, closeMenu, displayMenu);

  return (
    <React.Fragment>
      <FormComposer
        defaultValues={safeDefaults}
        config={config && config.currStepConfig}
        onSubmit={(formData) => goNext({ ...formData, _isFormSubmit: true })}
        onFormValueChange={onFormValueChange}
        label={t && config && config?.texts ? t(config?.texts?.submitBarLabel) : ""}
        currentStep={config && config?.currStepNumber}
        onBackClick={onGoBack}
      />

      {showToast && <Toast isDleteBtn error label={error} onClose={closeToast} />}

      <ActionBar>
        <SubmitBar label={t("CS_COMMON_BACK")} onSubmit={onGoBack} className="ads-btn-back" />

        {displayMenu && (
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
        )}

        <SubmitBar ref={menuRef} label={t("WF_TAKE_ACTION")} onSubmit={() => setDisplayMenu(!displayMenu)} />
      </ActionBar>
      {isLoading && <Loader page={true} />}
    </React.Fragment>
  );
};

export default NewADSStepFormFive;
