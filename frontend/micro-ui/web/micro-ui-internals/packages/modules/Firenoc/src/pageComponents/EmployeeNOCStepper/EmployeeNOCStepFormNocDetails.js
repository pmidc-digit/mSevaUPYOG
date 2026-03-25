import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActionBar, SubmitBar, Dropdown, CardLabel, LabelFieldPair, CardSectionHeader, TextInput, Toast } from "@mseva/digit-ui-react-components";
import { UPDATE_NOCNewApplication_FORM } from "../../redux/action/NOCNewApplicationActions";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";

const EmployeeNOCStepFormNocDetails = ({ config, onGoNext }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState(null);
  const [provisionalSearchNo, setProvisionalSearchNo] = useState("");
  const [oldNocSearchNo, setOldNocSearchNo] = useState("");

  const currentStepData = useSelector(function (state) {
    return state.noc.NOCNewApplicationFormReducer.formData?.nocDetails || {};
  });

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      fireNOCType: currentStepData?.fireNOCType || null,
      firestationId: currentStepData?.firestationId || null,
      provisionalNocNumber: currentStepData?.provisionalNocNumber || "",
      oldFireNocNumber: currentStepData?.oldFireNocNumber || "",
    },
  });

  const selectedNocType = watch("fireNOCType");

  const tenantId = window.localStorage.getItem("Employee.tenant-id");

  /* ── Fire Station MDMS ── */
  const stateId = Digit.ULBService.getStateId();
  const { data: fireStationData } = Digit.Hooks.useCustomMDMS(stateId, "firenoc", [{ name: "FireStations" }], {
    select: (d) => d?.firenoc?.FireStations?.filter((s) => s.active) || [],
  });
  const { data: nocTypeOptions = [] } = Digit.Hooks.useCustomMDMS(stateId, "FireNoc", [{ name: "Documents" }], {
    select: (d) =>
      (d?.FireNoc?.Documents || []).map((e) => ({
        code: e.applicationType,
        name: t(`NOC_${e.applicationType}`),
      })),
  });

  const fireStationOptions = useMemo(() => {
    if (!fireStationData?.length) return [];
    return fireStationData
      .filter((s) => s.tenantId === tenantId)
      .map((s) => ({ code: s.id, name: s.name || s.id }));
  }, [fireStationData, tenantId]);

  useEffect(() => {
    if (currentStepData?.fireNOCType) {
      setValue("fireNOCType", currentStepData.fireNOCType);
    }
    if (currentStepData?.provisionalNocNumber) {
      setValue("provisionalNocNumber", currentStepData.provisionalNocNumber);
    }
    if (currentStepData?.oldFireNocNumber) {
      setValue("oldFireNocNumber", currentStepData.oldFireNocNumber);
    }
  }, [currentStepData, setValue]);

  // Hook for provisional NOC search
  const {
    data: provisionalData,
    refetch: refetchProvisional,
    isFetching: isFetchingProvisional,
  } = Digit.Hooks.firenoc.useNOCSearchByNumber({
    tenantId,
    filters: { fireNOCNumber: provisionalSearchNo },
    config: { enabled: false },
  });

  // Hook for old NOC search (renewal)
  const {
    data: oldNocData,
    refetch: refetchOldNoc,
    isFetching: isFetchingOldNoc,
  } = Digit.Hooks.firenoc.useNOCSearchByNumber({
    tenantId,
    filters: { fireNOCNumber: oldNocSearchNo },
    config: { enabled: false },
  });

  // Handle provisional search response
  useEffect(() => {
    if (provisionalData) {
      if (provisionalData?.FireNOCs?.length > 0) {
        setShowToast({ success: true, message: "NOC_PROVISIONAL_NUMBER_FOUND" });
        dispatch(UPDATE_NOCNewApplication_FORM(config.key, {
          ...watch(),
          provisionalNocData: provisionalData.FireNOCs[0],
        }));
      } else {
        setShowToast({ error: true, message: "NOC_PROVISIONAL_NUMBER_NOT_FOUND" });
      }
      setTimeout(() => setShowToast(null), 3000);
    }
  }, [provisionalData]);

  // Handle old NOC search response
  useEffect(() => {
    if (oldNocData) {
      if (oldNocData?.FireNOCs?.length > 0) {
        setShowToast({ success: true, message: "NOC_OLD_NOC_NUMBER_FOUND" });
        dispatch(UPDATE_NOCNewApplication_FORM(config.key, {
          ...watch(),
          oldNocData: oldNocData.FireNOCs[0],
        }));
      } else {
        setShowToast({ error: true, message: "NOC_OLD_NOC_NUMBER_NOT_FOUND" });
      }
      setTimeout(() => setShowToast(null), 3000);
    }
  }, [oldNocData]);

  const handleProvisionalSearch = () => {
    const nocNumber = watch("provisionalNocNumber");
    if (!nocNumber?.trim()) {
      setShowToast({ error: true, message: "NOC_PLEASE_ENTER_PROVISIONAL_NUMBER" });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    setProvisionalSearchNo(nocNumber.trim());
    let response = refetchProvisional();
  };

  const handleOldNocSearch = () => {
    const nocNumber = watch("oldFireNocNumber");
    if (!nocNumber?.trim()) {
      setShowToast({ error: true, message: "NOC_PLEASE_ENTER_OLD_NOC_NUMBER" });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    setOldNocSearchNo(nocNumber.trim());
    setTimeout(() => refetchOldNoc(), 0);
  };

  const onSubmit = (data) => {
    if (data.fireNOCType?.code === "RENEWAL" && !data.oldFireNocNumber?.trim()) {
      setShowToast({ error: true, message: "NOC_OLD_NOC_NUMBER_REQUIRED" });
      setTimeout(() => setShowToast(null), 3000);
      return;
    }
    dispatch(UPDATE_NOCNewApplication_FORM(config.key, data));
    onGoNext();
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="employeeCard">
          <CardSectionHeader>{t("NOC_NOC_DETAILS_HEADER")}</CardSectionHeader>
          <p style={{ color: "#717171", fontSize: "14px", marginBottom: "16px", marginTop: "-8px" }}>
            {t("After filling the old Firenoc number please click search icon that is next to the filled NoC number")}
          </p>

          <div>
            {/* NOC Type Dropdown */}
            <LabelFieldPair>
              <CardLabel className="card-label-smaller">
                {`${t("NOC Type")}`}<span className="requiredField">*</span>
              </CardLabel>
              <div className="field">
                <Controller
                  control={control}
                  name="fireNOCType"
                  rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <Dropdown
                      className="form-field"
                      select={(val) => {
                        props.onChange(val);
                        setValue("provisionalNocNumber", "");
                        setValue("oldFireNocNumber", "");
                      }}
                      selected={props.value}
                      option={nocTypeOptions}
                      optionKey="name"
                      t={t}
                      placeholder={t("NOC_SELECT_NOC_TYPE_PLACEHOLDER")}
                    />
                  )}
                />
                {errors?.fireNOCType && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.fireNOCType.message}</p>
                )}
              </div>
            </LabelFieldPair>

            {/* Provisional fire NoC number - shown when NEW is selected */}
            {selectedNocType?.code === "NEW" && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {t("Provisional fire NoC number")}
                </CardLabel>
                <div className="field" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Controller
                    control={control}
                    name="provisionalNocNumber"
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                        placeholder={t("Enter Provisional fire NoC number")}
                        style={{ flex: 1 }}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleProvisionalSearch}
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #1e40af)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 20px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("SEARCH")}
                  </button>
                </div>
              </LabelFieldPair>
            )}

            {/* Old fire NoC number - shown when RENEWAL is selected */}
            {selectedNocType?.code === "RENEWAL" && (
              <LabelFieldPair>
                <CardLabel className="card-label-smaller">
                  {t("old fire NoC number")}<span className="requiredField">*</span>
                </CardLabel>
                <div className="field" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Controller
                    control={control}
                    name="oldFireNocNumber"
                    rules={{ required: t("REQUIRED_FIELD") }}
                    render={(props) => (
                      <TextInput
                        className="form-field"
                        value={props.value}
                        onChange={(e) => props.onChange(e.target.value)}
                        placeholder={t("Enter old fire NoC number")}
                        style={{ flex: 1 }}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleOldNocSearch}
                    style={{
                      background: "linear-gradient(135deg, #2563eb, #1e40af)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px 20px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "14px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("SEARCH")}
                  </button>
                </div>
                {errors?.oldFireNocNumber && (
                  <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.oldFireNocNumber.message}</p>
                )}
              </LabelFieldPair>
            )}
          </div>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>

      {showToast && (
        <Toast
          error={showToast?.error}
          success={showToast?.success}
          label={t(showToast?.message)}
          isDleteBtn={true}
          onClose={() => setShowToast(null)}
        />
      )}
    </React.Fragment>
  );
};

export default EmployeeNOCStepFormNocDetails;
