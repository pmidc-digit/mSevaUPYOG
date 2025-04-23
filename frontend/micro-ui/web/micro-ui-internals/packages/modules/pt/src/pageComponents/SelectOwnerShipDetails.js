import React, { useState, useEffect } from "react";
import { FormStep, RadioOrSelect, RadioButtons, LabelFieldPair, Dropdown, CardLabel, CardLabelError, Loader } from "@mseva/digit-ui-react-components";
import { cardBodyStyle } from "../utils";
import { useLocation } from "react-router-dom";
import Timeline from "../components/TLTimeline";
import { Controller, useForm } from "react-hook-form";

const SelectOwnerShipDetails = ({ t, config, onSelect, userType, formData, onBlur, formState, setError, clearErrors }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  const isUpdateProperty = formData?.isUpdateProperty || false;
  let isEditProperty = formData?.isEditProperty || false;
  const [ownershipCategory, setOwnershipCategory] = useState(formData?.ownerShipDetails?.ownershipCategory);
  const [loader, setLoader] = useState(true);
  const { data: SubOwnerShipCategoryOb, isLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "SubOwnerShipCategory");
  const { data: OwnerShipCategoryOb, isLoading: ownerShipCatLoading } = Digit.Hooks.pt.usePropertyMDMS(stateId, "PropertyTax", "OwnerShipCategory");
  const ownerShipdropDown = [];
  let subCategoriesInOwnersType = ["INDIVIDUAL"];
  let OwnerShipCategory = {};
  let SubOwnerShipCategory = {};
  const { pathname: url } = useLocation();
  const editScreen = url.includes("/modify-application/");
  const mutateScreen = url.includes("/property-mutate/");

  const { control, formState: localFormState, watch, setError: setLocalError, clearErrors: clearLocalErrors, setValue } = useForm();

  console.log("formData in SelectOwnerShipDetails 1", formData);

  useEffect(() => {
    if (!isLoading && SubOwnerShipCategoryOb && OwnerShipCategoryOb) {
      const preFilledPropertyType = SubOwnerShipCategoryOb.filter(
        (ownershipCategory) => ownershipCategory.code === (formData?.ownershipCategory?.value || formData?.ownershipCategory)
      )[0];
      setOwnershipCategory(preFilledPropertyType);
    }
  }, [formData?.ownershipCategory, SubOwnerShipCategoryOb]);

  useEffect(() => {
    if (userType === "employee" && editScreen && mutateScreen && !isLoading && !ownerShipCatLoading && OwnerShipCategoryOb) {
      const arr = getDropdwonForProperty(ownerShipdropDown);
      const defaultValue = arr.filter((e) => e.code === formData?.originalData?.ownershipCategory)[0];
      selectedValue(defaultValue);
      setLoader(false);
    }
  }, [isLoading, ownerShipCatLoading, OwnerShipCategoryOb]);

  OwnerShipCategoryOb &&
    OwnerShipCategoryOb.length > 0 &&
    OwnerShipCategoryOb.map((category) => {
      OwnerShipCategory[category.code] = category;
    });
  SubOwnerShipCategoryOb &&
    SubOwnerShipCategoryOb.length > 0 &&
    SubOwnerShipCategoryOb.map((category) => {
      SubOwnerShipCategory[category.code] = category;
    });

  getOwnerDetails();

  function formDropdown(category) {
    const { name, code } = category;
    return {
      label: name,
      value: code,
      code: code,
    };
  }

  function getDropdwonForProperty(ownerShipdropDown) {
    if (userType === "employee") {
      const arr = ownerShipdropDown
        ?.filter((e) => e.code.split(".").length <= 2)
        ?.splice(0, 4)
        ?.map((ownerShipDetails) => ({
          ...ownerShipDetails,
          i18nKey: `PT_OWNERSHIP_${
            ownerShipDetails.value.split(".")[1] ? ownerShipDetails.value.split(".")[1] : ownerShipDetails.value.split(".")[0]
          }`,
        }));
      return arr;
    }

    return (
      ownerShipdropDown &&
      ownerShipdropDown.length &&
      ownerShipdropDown.splice(0, 4).map((ownerShipDetails) => ({
        ...ownerShipDetails,
        i18nKey: `PT_OWNERSHIP_${ownerShipDetails.value.split(".")[1] ? ownerShipDetails.value.split(".")[1] : ownerShipDetails.value.split(".")[0]}`,
      }))
    );
  }

  function getOwnerDetails() {
    if (OwnerShipCategory && SubOwnerShipCategory) {
      Object.keys(OwnerShipCategory).forEach((category) => {
        const categoryCode = OwnerShipCategory[category].code;
        if (subCategoriesInOwnersType.indexOf(categoryCode) !== -1) {
          Object.keys(SubOwnerShipCategory)
            .filter((subCategory) => categoryCode === SubOwnerShipCategory[subCategory].ownerShipCategory)
            .forEach((linkedCategory) => {
              ownerShipdropDown.push(formDropdown(SubOwnerShipCategory[linkedCategory]));
            });
        } else {
          ownerShipdropDown.push(formDropdown(OwnerShipCategory[category]));
        }
      });
    }
  }

  function selectedValue(value) {
    setOwnershipCategory(value);
  }

  const onSkip = () => onSelect();
  function goNext() {
    let index = window.location.href.charAt(window.location.href.length - 1);
    sessionStorage.setItem("ownershipCategory", ownershipCategory?.value);
    onSelect(config.key, ownershipCategory, "", index, null, { routeKey: ownershipCategory?.value });
  }

  useEffect(() => {
    if (formData?.ownershipCategory?.code && getDropdwonForProperty(ownerShipdropDown)?.length) {
      const code = formData?.ownershipCategory?.code;

      const Ownertype = getDropdwonForProperty(ownerShipdropDown)?.find((e) => e.code === code);
      console.log("SetValues Ownertype", Ownertype);
      setValue("SelectOwnerShipDetails", Ownertype);
      // setPropertyPurpose(Majorbuiltdingtype)
    }
  }, [formData, ownerShipdropDown]);

  useEffect(() => {
    if (userType === "employee") {
      if (!ownershipCategory) setError(config.key, { type: "required", message: t(`CORE_COMMON_REQUIRED_ERRMSG`) });
      else clearErrors(config.key);
      goNext();
    }
  }, [ownershipCategory]);

  console.log("formData in SelectOwnerShipDetails 2", formData);

  if (userType === "employee" && editScreen && mutateScreen && loader) {
    return <Loader />;
  }

  if (userType === "employee") {
    return (
      <React.Fragment>
        {/* {mutateScreen && (
          <div className="employee-data-table">
            <div className="row">
              <h2>NAME</h2>
              <div className="value">
                <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}></span>
              </div>
            </div>
            <div className="row">
              <h2>Guardian Name</h2>
              <div className="value">
                <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}></span>
              </div>
            </div>
            <div className="row">
              <h2>MOBILE NO</h2>
              <div className="value">
                <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}></span>
              </div>
            </div>
            <div className="row">
              <h2>EMAIL ID</h2>
              <div className="value">
                <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}></span>
              </div>
            </div>
            <div className="row">
              <h2>CATEGORY</h2>
              <div className="value">
                <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}></span>
              </div>
            </div>
            <div className="row">
              <h2>Correspondence Address</h2>
              <div className="value">
                <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}></span>
              </div>
            </div>
          </div>
        )} */}
        {mutateScreen && (
          <div className="employee-data-table">
            {(() => {
              // Retrieve data from sessionStorage
              const ownerTransferData = JSON.parse(sessionStorage.getItem("ownerTransferData")) || {};
              const owners = ownerTransferData?.ownershipCategory?.owners || [];

              // Dynamically render rows for each owner
              return owners.map((owner, index) => (
                <React.Fragment key={index}>
                  <div className="row">
                    <h2>NAME</h2>
                    <div className="value">
                      <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}>{owner.name || "N/A"}</span>
                    </div>
                  </div>
                  <div className="row">
                    <h2>Guardian Name</h2>
                    <div className="value">
                      <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}>{owner.fatherOrHusbandName || "N/A"}</span>
                    </div>
                  </div>
                  <div className="row">
                    <h2>MOBILE NO</h2>
                    <div className="value">
                      <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}>{owner.mobileNumber || "N/A"}</span>
                    </div>
                  </div>
                  <div className="row">
                    <h2>EMAIL ID</h2>
                    <div className="value">
                      <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}>{owner.emailId || "N/A"}</span>
                    </div>
                  </div>
                  <div className="row">
                    <h2>CATEGORY</h2>
                    <div className="value">
                      <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}>{owner.category || "N/A"}</span>
                    </div>
                  </div>
                  <div className="row">
                    <h2>Correspondence Address</h2>
                    <div className="value">
                      <span style={{ display: "inline-flex", width: "fit-content", marginLeft: "10px" }}>{owner.correspondenceAddress || "N/A"}</span>
                    </div>
                  </div>
                </React.Fragment>
              ));
            })()}
          </div>
        )}
        <LabelFieldPair>
          <CardLabel className="card-label-smaller" style={editScreen ? { color: "#B1B4B6" } : {}}>
            {t("PT_PROVIDE_OWNERSHIP_DETAILS")} <span style={{ color: 'red' }}>*</span>
          </CardLabel>
          {/* <Dropdown
            className="form-field"
            selected={getDropdwonForProperty(ownerShipdropDown)?.length === 1 ? getDropdwonForProperty(ownerShipdropDown)[0] : ownershipCategory}
            disable={getDropdwonForProperty(ownerShipdropDown)?.length === 1 || editScreen}
            option={getDropdwonForProperty(ownerShipdropDown)}
            select={selectedValue}
            optionKey="i18nKey"
            onBlur={onBlur}
            t={t}
          /> */}
          <Controller
            name="SelectOwnerShipDetails"
            defaultValue={ownershipCategory}
            control={control}
            render={(props) => (
              <Dropdown
                className="form-field"
                // selected={getDropdwonForProperty(ownerShipdropDown)?.length === 1 ? getDropdwonForProperty(ownerShipdropDown)[0] : ownershipCategory}
                disable={getDropdwonForProperty(ownerShipdropDown)?.length === 1 || editScreen}
                selected={props.value}
                option={getDropdwonForProperty(ownerShipdropDown)}
                select={(e) => {
                  props.onChange(e);
                  selectedValue(e); // to keep your external state also in sync
                }}
                onBlur={props.onBlur}
                optionKey="i18nKey"
                t={t}
              />
            )}
          />
        </LabelFieldPair>
        {formState.touched?.[config.key] ? (
          <CardLabelError style={{ width: "70%", marginLeft: "30%", fontSize: "12px", marginTop: "-21px" }}>
            {formState.errors[config.key]?.message}
          </CardLabelError>
        ) : null}
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen/pt/property/property-mutation") ? (
        <Timeline currentStep={1} flow="PT_MUTATE" />
      ) : (
        <Timeline currentStep={2} />
      )}
      <FormStep t={t} config={config} onSelect={goNext} onSkip={onSkip} isDisabled={!ownershipCategory}>
        <div>
          <RadioButtons
            isMandatory={config.isMandatory}
            options={getDropdwonForProperty(ownerShipdropDown) || []}
            selectedOption={ownershipCategory}
            optionsKey="i18nKey"
            onSelect={selectedValue}
            value={ownershipCategory}
            labelKey="PT_OWNERSHIP"
            isDependent={true}
            disabled={isUpdateProperty || isEditProperty}
          />
        </div>
      </FormStep>
    </React.Fragment>
  );
};

export default SelectOwnerShipDetails;
