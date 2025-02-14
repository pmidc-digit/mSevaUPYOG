import React, { useEffect, useState } from "react";
import { CardLabel, CheckBox } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";

const createApplyingFor = () => ({
  water: true,
  sewerage: false,
});

const WSApplyingFor = (props) => {
  const { t } = useTranslation();
  const { config, onSelect, userType, formData, setError, formState, clearErrors } = props;
  //
  const {
    control,
    formState: localFormState,
    watch,
    setError: setLocalError,
    clearErrors: clearLocalErrors,
    setValue,
    trigger,
    getValues,
  } = useForm();
  const formValue = watch();
  const { errors } = localFormState;
  //
  const [applyingFor, setApplyingFor] = useState(formData?.ApplyingFor ? formData?.ApplyingFor : createApplyingFor());
  const [focusIndex, setFocusIndex] = useState({ index: -1, type: "" });

  useEffect(() => {
    if (!formData?.ApplyingFor) {
      setApplyingFor(createApplyingFor());
    }
  }, [formData?.ApplyingFor]);

  useEffect(() => {
    onSelect(config.key, { ...formData[config.key], ...applyingFor });
  }, [applyingFor]);

  useEffect(() => {
    if (Object.entries(formValue).length > 0) {
      const keys = Object.keys(formValue);
      const part = {};
      keys.forEach((key) => (part[key] = applyingFor[key]));
      if (!_.isEqual(formValue, part)) {
        let isErrorsFound = true;
        Object.keys(formValue).map((data) => {
          if (!formValue[data] && isErrorsFound) {
            isErrorsFound = false;
            setIsErrors(false);
          }
        });
        if (isErrorsFound) setIsErrors(true);
        setApplyingFor({ ...formValue });
        trigger();
      }
    }
  }, [formValue, applyingFor]);

  const [isErrors, setIsErrors] = useState(false);

  useEffect(() => {
    trigger();
  }, []);

  useEffect(() => {
    if (Object.keys(errors).length && !_.isEqual(formState.errors[config.key]?.type || {}, errors)) {
      setError(config.key, { type: errors });
    } else if (!Object.keys(errors).length && formState.errors[config.key] && isErrors) {
      clearErrors(config.key);
    }
  }, [errors]);

  return (
    <div>
      <CardLabel style={{ fontWeight: "700" }}>{`${t("WS_APPLY_FOR")}*`}</CardLabel>
      <div style={{ display: "flex", gap: "0 3rem" }}>
        <Controller
          control={control}
          name="water"
          defaultValue={applyingFor?.water}
          isMandatory={true}
          render={(props) => (
            <CheckBox
              label={t("WATER_CONNECTION")}
              name={"water"}
              autoFocus={focusIndex.index === applyingFor?.key && focusIndex.type === "water"}
              errorStyle={localFormState.touched.water && errors?.water?.message ? true : false}
              onChange={(e) => {
                console.log("Clicked water: ", e.target.checked, applyingFor);
                if (e.target.checked || applyingFor?.sewerage) {
                  props.onChange(e.target.checked);
                  setFocusIndex({ index: applyingFor?.key, type: "water" });
                }
              }}
              checked={applyingFor?.water}
              style={{ paddingBottom: "10px", paddingTop: "3px" }}
              onBlur={props.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="sewerage"
          defaultValue={applyingFor?.sewerage}
          type="number"
          isMandatory={true}
          render={(props) => (
            <CheckBox
              label={t("SEWERAGE_CONNECTION")}
              name={"sewerage"}
              autoFocus={focusIndex.index === applyingFor?.key && focusIndex.type === "sewerage"}
              errorStyle={localFormState.touched.sewerage && errors?.sewerage?.message ? true : false}
              onChange={(e) => {
                console.log("Clicked sewerage: ", e.target.checked, applyingFor);
                if (e.target.checked || applyingFor?.water) {
                  props.onChange(e.target.checked);
                  setFocusIndex({ index: applyingFor?.key, type: "sewerage" });
                }
              }}
              checked={applyingFor?.sewerage}
              style={{ paddingBottom: "10px", paddingTop: "3px" }}
              onBlur={props.onBlur}
            />
          )}
        />
      </div>
    </div>
  );
};

export default WSApplyingFor;
