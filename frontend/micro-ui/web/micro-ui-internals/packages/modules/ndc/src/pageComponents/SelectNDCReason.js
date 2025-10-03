import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  CardLabel,
  LabelFieldPair,
  Dropdown,
  TextInput,
  LinkButton,
  CardLabelError,
  MobileNumber,
  DatePicker,
  Loader,
} from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import isUndefined from "lodash/isUndefined";

function SelectNDCReason({ config, onSelect, userType, formData, setError, formState, clearErrors }) {
  const [ndcReason, setNDCReason] = useState(formData?.NDCReason || {});
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
  const { t } = useTranslation();
  const apiDataCheck = useSelector((state) => state.ndc.NDCForm?.formData?.responseData);
  // const firstTimeRef = useRef(true);

  const { data: menuList, isLoading } = Digit.Hooks.useCustomMDMS("pb", "NDC", [{ name: "Reasons" }]);
  const ndcReasonOptions = useMemo(() => {
    const MenuListOfReasons = [];
    if (menuList?.NDC?.Reasons?.length > 0) {
      menuList?.NDC?.Reasons?.map((val) => {
        MenuListOfReasons.push({
          i18nKey: val?.code,
          code: val?.code,
        });
      });
    }
    return MenuListOfReasons;
  }, [menuList]);

  useEffect(() => {
    onSelect("NDCReason", ndcReason, config);
  }, [ndcReason]);

  useEffect(() => {
    if (apiDataCheck && ndcReasonOptions?.length > 0) {
      // find the matching option from MDMS
      const matchedOption = ndcReasonOptions.find((opt) => opt?.code === apiDataCheck?.[0]?.reason);
      if (matchedOption) {
        setNDCReason(matchedOption);
        setValue("NDCReason", matchedOption); // update react-hook-form value
      }
    }
  }, [apiDataCheck, ndcReasonOptions]);

  if (isLoading) {
    return <Loader />;
  }

  const errorStyle = { width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" };
  return (
    <div style={{ paddingBottom: "16px" }}>
      <LabelFieldPair>
        <CardLabel className="card-label-smaller ndc_card_labels">{`${t("NDC_NEW_NDC_APPLICATION_NDC_REASON")} * `}</CardLabel>
        <Controller
          name="NDCReason"
          rules={{ required: t("REQUIRED_FIELD") }}
          defaultValue={ndcReason}
          control={control}
          render={(props) => (
            <Dropdown
              className="form-field"
              selected={props.value}
              option={ndcReasonOptions}
              select={(e) => {
                setNDCReason(e);
                props.onChange(e);
              }}
              optionKey="i18nKey"
              onBlur={props.onBlur}
              t={t}
            />
          )}
        />
      </LabelFieldPair>
      <CardLabelError style={errorStyle}>{localFormState.touched.structureType ? errors?.structureType?.message : ""}</CardLabelError>
    </div>
  );
}

export default SelectNDCReason;
