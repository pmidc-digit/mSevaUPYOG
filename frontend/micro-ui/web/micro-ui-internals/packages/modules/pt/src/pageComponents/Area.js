import { CardLabel, FormStep, LabelFieldPair, TextInput, CardLabelError } from "@mseva/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Timeline from "../components/TLTimeline";
import { useForm, Controller } from "react-hook-form";

const Area = ({ t, config, onSelect, value, userType, formData, setError: setFormError, clearErrors: clearFormErrors, formState, onBlur }) => {
  //let index = window.location.href.charAt(window.location.href.length - 1);
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
  let index = window.location.href.split("/").pop();
  let validation = {};
  const onSkip = () => onSelect();
  let floorarea;
  let setfloorarea;
  if (!isNaN(index)) {
    [floorarea, setfloorarea] = useState(formData.units && formData.units[index] && formData.units[index].floorarea);
  } else {
    [floorarea, setfloorarea] = useState(formData.landarea);
  }
  const [error, setError] = useState(null);
  const [unitareaerror, setunitareaerror] = useState(null);
  const [areanotzeroerror, setareanotzeroerror] = useState(null);

  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("modify") || pathname.includes("edit");

  function setPropertyfloorarea(e) {
    setfloorarea(e.target.value);
    setunitareaerror(null);
    setareanotzeroerror(null);
    if (formData?.PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY" && parseInt(formData?.units[index]?.builtUpArea) < e.target.value) {
      setunitareaerror("PT_TOTUNITAREA_LESS_THAN_BUILTUP_ERR_MSG");
    }
    if (formData?.PropertyType?.code === "BUILTUP.SHAREDPROPERTY" && parseInt(formData?.floordetails?.builtUpArea) < e.target.value) {
      setunitareaerror("PT_SELFOCCUPIED_AREA_LESS_THAN_BUILTUP");
    }
    if (parseInt(e.target.value) == 0) {
      setareanotzeroerror("PT_AREA_NOT_0_MSG");
    }
  }

  const goNext = () => {
    if (!isNaN(index)) {
      let unit = formData.units && formData.units[index];
      //units["RentalArea"] = RentArea;
      //units["AnnualRent"] = AnnualRent;
      if (
        (formData?.isResdential?.i18nKey === "PT_COMMON_YES" || formData?.usageCategoryMajor?.i18nKey == "PROPERTYTAX_BILLING_SLAB_NONRESIDENTIAL") &&
        formData?.PropertyType?.i18nKey !== "COMMON_PROPTYPE_VACANT"
      ) {
        sessionStorage.setItem("area", "yes");
      } else {
        sessionStorage.setItem("area", "no");
      }

      let floordet = { ...unit, floorarea };
      onSelect(config.key, floordet, false, index);
    } else {
      if (
        (formData?.isResdential?.i18nKey === "PT_COMMON_YES" || formData?.usageCategoryMajor?.i18nKey == "PROPERTYTAX_BILLING_SLAB_NONRESIDENTIAL") &&
        formData?.PropertyType?.i18nKey !== "COMMON_PROPTYPE_VACANT"
      ) {
        sessionStorage.setItem("area", "yes");
      } else if (formData?.PropertyType?.code === "VACANT") {
        sessionStorage.setItem("area", "vacant");
      } else {
        sessionStorage.setItem("area", "no");
      }

      onSelect("landarea", { floorarea });
    }
  };
  //const onSkip = () => onSelect();

  function onChange(e) {
    if (e.target.value.length > 1024) {
      setError("CS_COMMON_LANDMARK_MAX_LENGTH");
    } else {
      setError(null);
      setfloorarea(e.target.value);
    }
  }
  useEffect(() => {
    onSelect(config.key, floorarea);
  }, [floorarea]);

  //   const onChange = (e) => {
  //     setSelectedValue(e);
  //   }

  useEffect(() => {
    if (userType === "employee") {
      if (!Number(floorarea)) setFormError(config.key, { type: "required", message: t("CORE_COMMON_REQUIRED_ERRMSG") });
      else if (isNaN(floorarea)) setFormError(config.key, { type: "invalid", message: t("ERR_DEFAULT_INPUT_FIELD_MSG") });
      else clearFormErrors(config.key);
      onSelect(config.key, floorarea);
    }
  }, [floorarea]);

  useEffect(() => {
    // setfloorarea(formData?.landarea);
    if (formData?.landarea) setValue("LandArea", floorarea);
  }, [formData]);

  const inputs = [
    {
      label: "PT_PLOT_SIZE_SQUARE_FEET_LABEL",
      type: "text",
      name: "area",
      isMandatory: "true",
      validation: {
        pattern: "^[0-9]+(\\.[0-9]+)?$",
        // isRequired: config.isMandatory,
        title: t("T_PLOT_SIZE_SQUARE_FEET_LABEL"),
      },
    },
    // {
    //   label: "PT_PLOT_VASIKA_NO",
    //   type: "text",
    //   name: "vasikaNo",
    //   validation: {},
    // },
    // {
    //   label: "PT_PLOT_VASIKA_DATE",
    //   type: "text",
    //   name: "vasikaDate",
    //   validation: {},
    // },
    // {
    //   label: "PT_PLOT_ALLOTMENT_NO",
    //   type: "text",
    //   name: "allotmentNo",
    //   validation: {},
    // },
    // {
    //   label: "PT_PLOT_ALLOTMENT_DATE",
    //   type: "text",
    //   name: "allotmentDate",
    //   validation: {},
    // },
    // {
    //   label: "PT_PLOT_BUSINESS_NAME",
    //   type: "text",
    //   name: "businessName",
    //   isMandatory:"true",
    //   validation: {},
    // },
    // {
    //   label: "PT_PLOT_REMARKS",
    //   type: "text",
    //   name: "remarks",
    //   validation: {},
    // },
  ];

  if (userType === "employee") {
    //const [displayPlotSize, setDisplayPlotSize] = useState(false);
    // useEffect(() => {
    //   if (formData?.usageCategoryMajor && formData?.PropertyType?.code === "VACANT") {
    //     setDisplayPlotSize(true);
    //   }else{
    //     onSelect(config.key, undefined);
    //   }
    // }, [formData]);
    // console.log("formData: ", formData);
    // console.log("config",config);
    return inputs?.map((input, index) => {
      if(formData?.usageCategoryMajor && formData?.PropertyType?.code === "VACANT"){
      return (
        formData?.usageCategoryMajor && formData?.PropertyType?.code === "VACANT" && (
          <React.Fragment>
            <LabelFieldPair key={index}>
              <CardLabel className="card-label-smaller">
                {t(input.label)} {config.isMandatory && <span style={{ color: "red" }}>*</span>}
              </CardLabel>
              <div className="field">
                {/* <TextInput
                key={input.name}
                id={input.name}
                value={floorarea}
                onChange={onChange}
                {...input.validation}
                onBlur={onBlur}
                // autoFocus={presentInModifyApplication}
              /> */}
                <Controller
                  name={"LandArea"}
                  control={control}
                  defaultValue={floorarea}
                  // rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <TextInput
                      // key={input.name}
                      // id={input.name}
                      value={floorarea}
                      onChange={onChange}
                      {...input.validation}
                      onBlur={onBlur}
                    // autoFocus={presentInModifyApplication}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            {formState.touched[config.key] ? (
              <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
                {formState.errors?.[config.key]?.message}
              </CardLabelError>
            ) : null}
          </React.Fragment>
        )
      );
    }
     else if(formData?.usageCategoryMajor && formData?.PropertyType?.code === "BUILTUP.INDEPENDENTPROPERTY") {
      return (
          <React.Fragment>
            <LabelFieldPair key={index}>
              <CardLabel className="card-label-smaller">
                {t(input.label)} {config.isMandatory && <span style={{ color: "red" }}>*</span>}
              </CardLabel>
              <div className="field">
                {/* <TextInput
                key={input.name}
                id={input.name}
                value={floorarea}
                onChange={onChange}
                {...input.validation}
                onBlur={onBlur}
                // autoFocus={presentInModifyApplication}
              /> */}
                <Controller
                  name={"LandArea"}
                  control={control}
                  defaultValue={floorarea}
                  // rules={{ required: t("REQUIRED_FIELD") }}
                  render={(props) => (
                    <TextInput
                      // key={input.name}
                      // id={input.name}
                      value={floorarea}
                      onChange={onChange}
                      {...input.validation}
                      onBlur={onBlur}
                    // autoFocus={presentInModifyApplication}
                    />
                  )}
                />
              </div>
            </LabelFieldPair>
            {formState.touched[config.key] ? (
              <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
                {formState.errors?.[config.key]?.message}
              </CardLabelError>
            ) : null}
          </React.Fragment>
      );
    }
    });
  }

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      <FormStep
        config={config}
        onChange={onChange}
        forcedError={t(unitareaerror) || t(areanotzeroerror)}
        onSelect={goNext}
        onSkip={onSkip}
        t={t}
        isDisabled={unitareaerror || areanotzeroerror || !floorarea}
        showErrorBelowChildren={true}
      >
        <CardLabel>{`${t("PT_PLOT_SIZE_SQUARE_FEET_LABEL")}`}</CardLabel>
        <TextInput
          t={t}
          type={"number"}
          isMandatory={false}
          optionKey="i18nKey"
          name="floorarea"
          value={floorarea}
          onChange={setPropertyfloorarea}
          {...(validation = { pattern: "^([0-9]){0,8}$", type: "number", title: t("PT_PLOT_SIZE_ERROR_MESSAGE") })}
        />
      </FormStep>
    </React.Fragment>
  );
};

export default Area;
