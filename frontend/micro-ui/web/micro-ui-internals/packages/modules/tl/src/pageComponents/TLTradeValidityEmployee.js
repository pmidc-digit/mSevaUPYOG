import React, { useState, useEffect, useMemo, useCallback } from "react";
import { CardLabel, LabelFieldPair, Dropdown, TextInput, LinkButton, CardLabelError, MobileNumber, Loader } from "@mseva/digit-ui-react-components";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { useLocation } from "react-router-dom";
import { getUniqueItemsFromArray, stringReplaceAll } from "../utils";
import cloneDeep from "lodash/cloneDeep";
import { sortDropdownNames } from "../utils/index";

const TLTradeValidityEmployee = ({ config, formData, onSelect }) => {
  const { t } = useTranslation();
  const [selectedValue, setSelectedValue] = useState(formData?.validityYears);

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

  const tradeUnits = formData?.tradeUnits || [];

  const options = useMemo(() => {
    // if (!Array.isArray(tradeUnits) || tradeUnits.length === 0) {
    //   return []
    // };
    console.log("tradeUnits_for_validity", tradeUnits,"\n Array.isArray", !Array.isArray(tradeUnits), "\n tradeUnits.length", tradeUnits.length === 0,"\n tradeSubType", tradeUnits[0]?.tradeSubType === "");
    if (!Array.isArray(tradeUnits) || tradeUnits.length === 0 || tradeUnits[0]?.tradeSubType === "") {
      return []
    };
    const hasHazardous = tradeUnits.some(unit => unit?.tradeSubType?.ishazardous);
    if(hasHazardous && selectedValue?.code > 1) {
      setSelectedValue({});
    }
    const years = hasHazardous ? [1] : [1, 2, 3];
    console.log("tradeUnits", tradeUnits)
    // const years = [1, 2, 3];
    return years.map((val) => ({
      code: val,
      i18nKey: val,
    }));
  }, [tradeUnits]);

  useEffect(() => {
    onSelect(config.key, selectedValue);
    console.log("selectedValue", selectedValue);
  }, [selectedValue]);

  const onChange = (e) => {
    setSelectedValue(e);
  }


  // useEffect(() => {
  //   console.log("selectedValue", selectedValue);
  // }, [selectedValue])

  // useEffect(() => {
  //   if (selectedValue !== undefined && selectedValue !== "") {
  //     onSelect(config.key, selectedValue);
  //   }
  // }, [selectedValue]);


  const errorStyle = {
    width: "70%",
    marginLeft: "30%",
    fontSize: "12px",
    marginTop: "-21px",
  };

  return (
    <React.Fragment>
      <div className="clu-doc-required-card no-width">
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("TL_TRADE_VALIDITY_NO_OF_YEAR")}`}<span className="requiredField">*</span></CardLabel>
          <Controller
            name={"validityYears"}
            control={control}
            defaultValue={selectedValue}
            rules={{ required: t("REQUIRED_FIELD") }}
            render={(props) => (
              <Dropdown
                className="form-field"
                selected={selectedValue}
                disable={false}
                option={options}
                errorStyle={localFormState.touched.tradeSubType && errors?.tradeSubType?.message ? true : false}
                select={(e) => {
                  props.onChange(e);
                  onChange(e);
                }}
                optionKey="i18nKey"
                onBlur={props.onBlur}  
                t={t}
                placeholder={t("TL_TRADE_VALIDITY_NO_OF_YEAR_PLACEHOLDER")}
              />
            )}
          />
        </LabelFieldPair>
      </div>
    </React.Fragment>
  );
};

export default TLTradeValidityEmployee;
