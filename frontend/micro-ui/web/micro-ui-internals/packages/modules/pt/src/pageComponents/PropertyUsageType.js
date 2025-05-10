import React, { useState, useEffect } from "react";
import {
  FormStep,
  RadioButtons,
  CitizenInfoLabel,
  LabelFieldPair,
  CardLabel,
  Dropdown,
  CardLabelError,
} from "@mseva/digit-ui-react-components";
import { cardBodyStyle } from "../utils";
import { useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";

const PropertyUsageType = ({ t, config, onSelect, userType, formData, formState, setError, clearErrors, onBlur }) => {
  const [usageCategoryMajor, setPropertyPurpose] = useState(
    formData?.usageCategoryMajor && formData?.usageCategoryMajor?.code === "NONRESIDENTIAL.OTHERS"
      ? { code: `${formData?.usageCategoryMajor?.code}`, i18nKey: `PROPERTYTAX_BILLING_SLAB_OTHERS` }
      : formData?.usageCategoryMajor
  );
  // console.log("usageCategoryMajor",usageCategoryMajor)
  //   const { data: Menu, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "OccupancyType");
  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue } = useForm();
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const { data: Menu = {}, isLoading: menuLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "UsageCategory") || {};
  let usagecat = [];
  usagecat = Menu?.PropertyTax?.UsageCategory || [];
  let i;
  let menu = [];

  const { pathname } = useLocation();
  const presentInModifyApplication = pathname.includes("edit");

  function usageCategoryMajorMenu(usagecat) {
    if (userType === "employee") {
      const catMenu = usagecat
        ?.filter((e) => e?.code.split(".").length <= 2 && e.code !== "NONRESIDENTIAL")
        ?.map((item) => {
          const arr = item?.code.split(".");
          if (arr.length == 2) return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + arr[1], code: item?.code };
          else return { i18nKey: "PROPERTYTAX_BILLING_SLAB_" + item?.code, code: item?.code };
        });
      return catMenu;
    } else {
      for (i = 0; i < 10; i++) {
        if (
          Array.isArray(usagecat) &&
          usagecat.length > 0 &&
          usagecat[i].code.split(".")[0] == "NONRESIDENTIAL" &&
          usagecat[i].code.split(".").length == 2
        ) {
          menu.push({ i18nKey: "PROPERTYTAX_BILLING_SLAB_" + usagecat[i].code.split(".")[1], code: usagecat[i].code });
        }
      }
      return menu;
    }
  }

  useEffect(() => {
    if (!menuLoading && presentInModifyApplication && userType === "employee") {
      const original = formData?.usageCategoryMajor;
      const selectedOption = usageCategoryMajorMenu(usagecat).filter((e) => e.code === original)[0];
      setPropertyPurpose(selectedOption);
    }
  }, [menuLoading]);
  // pt.PTNewApplicationForm.formData.PropertyDetails.usageCategoryMajor
    // useEffect(() => {
    //   if (formData?.PropertyDetails?.usageCategoryMajor?.code && usageCategoryMajorMenu(usagecat)?.length) {
    //     const code = formData?.PropertyDetails?.usageCategoryMajor?.code;
    //     const Majorbuiltdingtype = usageCategoryMajorMenu(usagecat)?.find((e) => e.code === code);
    //     setValue("MajorPropertyType", Majorbuiltdingtype);
    //   }
    // }, [formData, usageCategoryMajor]);
    // useEffect(() => {

    //   console.log("code is coming innn ")
    //   if (formData?.PropertyDetails?.usageCategoryMajor?.code || usageCategoryMajorMenu(usagecat)?.length) {
    //     const code = formData?.PropertyDetails?.usageCategoryMajor?.code;
    //     console.log("here is code -in if's",code)
    //     const Majorbuiltdingtype = usageCategoryMajorMenu(usagecat)?.find((e) => e.code === code);
    //     console.log("code in Majorbuiltdingtype",Majorbuiltdingtype)
    //     setValue("MajorPropertyType", Majorbuiltdingtype);
    //     // setPropertyPurpose(Majorbuiltdingtype)
    //   }
    //   console.log("code is out ")
    // }, [formData, usageCategoryMajor  ]);
    
    useEffect(() => {

      if (formData?.usageCategoryMajor?.code || usageCategoryMajorMenu(usagecat)?.length) {
        const code = formData?.usageCategoryMajor?.code;
        const Majorbuiltdingtype = usageCategoryMajorMenu(usagecat)?.find((e) => e.code === code);
        setValue("PropertyUsageType", Majorbuiltdingtype);
        // setPropertyPurpose(Majorbuiltdingtype)
      }
    }, [formData, usageCategoryMajor  ]);



  const onSkip = () => onSelect();

  /* useEffect(() => {
    if (userType !== "employee" && formData?.isResdential?.i18nKey === "PT_COMMON_YES" && formData?.usageCategoryMajor?.i18nKey !== "RESIDENTIAL") {
      //selectPropertyPurpose({i18nKey : "RESIDENTAL"})
      onSelect(config.key, { i18nKey: "PROPERTYTAX_BILLING_SLAB_RESIDENTIAL" }, true);
    }
  }, [formData?.usageCategoryMajor?.i18nKey]); */

  function selectPropertyPurpose(value) {
    setPropertyPurpose(value);
  }

  function goNext() {
    if (usageCategoryMajor?.i18nKey === "PROPERTYTAX_BILLING_SLAB_OTHERS") {
      usageCategoryMajor.i18nKey = "PROPERTYTAX_BILLING_SLAB_NONRESIDENTIAL";
      onSelect(config.key, usageCategoryMajor);
    } else {
      onSelect(config.key, usageCategoryMajor);
    }
    // onSelect(config.key,ResidentialType, false, index);
  }

  useEffect(() => {
    if (userType === "employee") {
      if (!usageCategoryMajor) {
        setError(config.key, { type: "required", message: t(`CORE_COMMON_REQUIRED_ERRMSG`) });
      } else {
        clearErrors(config.key);
      }
      goNext();
    }
  }, [usageCategoryMajor]);

  if (userType === "employee") {
    return (
      <React.Fragment>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t("PT_ASSESMENT_INFO_USAGE_TYPE") + " *"}</CardLabel>
          <Controller
              name="PropertyUsageType"
              // defaultValue={usageCategoryMajor}
              control={control}
              render={(props) => (
                <Dropdown
                  className="form-field"
                  // selected={getPropertyTypeMenu(proptype)?.length === 1 ? getPropertyTypeMenu(proptype)[0] : BuildingType}
                  selected={props.value}
                  // selected={usageCategoryMajor}
                  option={usageCategoryMajorMenu(usagecat)}
                  select={(e) => {
                    props.onChange(e);
                    selectPropertyPurpose(e); // to keep your external state also in sync
                  }}
                  // select={props.onChange}
                  onBlur={props.onBlur}
                  optionKey="i18nKey"
                  t={t}
                  // disable={isEditProperty ? isEditProperty : false}
                />
              )}
            />
        </LabelFieldPair>
        {formState.touched[config.key] ? (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {formState.errors?.[config.key]?.message}
          </CardLabelError>
        ) : null}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
          {window.location.href.includes("/citizen") ? <Timeline currentStep={1}/> : null}
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!usageCategoryMajor}>
        <div>
          <RadioButtons
            t={t}
            optionsKey="i18nKey"
            isMandatory={config.isMandatory}
            //options={menu}
            options={usageCategoryMajorMenu(usagecat) || {}}
            selectedOption={usageCategoryMajor}
            onSelect={selectPropertyPurpose}
          />
        </div>
      </FormStep>
      {<CitizenInfoLabel info={t("CS_FILE_APPLICATION_INFO_LABEL")} text={t("PT_USAGE_TYPE_INFO_MSG", usageCategoryMajor)} />}
    </React.Fragment>
  );
};

export default PropertyUsageType;

