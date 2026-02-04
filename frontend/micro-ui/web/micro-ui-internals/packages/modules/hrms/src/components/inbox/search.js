import { ActionBar, CloseSvg, DatePicker, Dropdown, Label, LinkLabel, SubmitBar, TextInput } from "@mseva/digit-ui-react-components";
import React, { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const SearchApplication = ({ onSearch, type, onClose, searchFields, searchParams, isInboxPage, defaultSearchParams }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, control } = useForm({
    defaultValues: searchParams,
  });
  const mobileView = innerWidth <= 640;
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  // Fetch MDMS data for designations
  const { isLoading: mdmsLoading, data: mdmsData } = Digit.Hooks.hrms.useHrmsMDMS(
    tenantId,
    "egov-hrms",
    "HRMSRolesandDesignation"
  );

  // Transform designations to dropdown options
  const designationOptions = useMemo(() => {
    if (!mdmsData?.MdmsRes?.["common-masters"]?.Designation) {
      console.log("⚠️ Designations not found in MDMS at common-masters.Designation");
      return [];
    }
    
    const options = mdmsData.MdmsRes["common-masters"].Designation
      .filter(desig => desig.active)
      .map(desig => ({
        code: desig.code,
        name: desig.name,
        i18text: t(`COMMON_MASTERS_DESIGNATION_${desig.code}`) !== `COMMON_MASTERS_DESIGNATION_${desig.code}` 
          ? t(`COMMON_MASTERS_DESIGNATION_${desig.code}`) 
          : desig.name,
      }))
      .sort((a, b) => a.i18text.localeCompare(b.i18text));
    
    console.log("📊 Designation options loaded:", options.length);
    return options;
  }, [mdmsData, t]);

  const onSubmitInput = (data) => {
    console.log("🔍 Form data BEFORE processing:", data);
    
    if (!data.mobileNumber) {
      delete data.mobileNumber;
    }
    
    // Handle dropdown fields - extract code value
    searchFields.forEach((field) => {
      if (field.type === "dropdown" && data[field.name] && typeof data[field.name] === 'object') {
        data[field.name] = data[field.name].code; // Extract only the code
      }
    });
    
    console.log("✅ Form data AFTER processing:", data);
    
    data.delete = [];
    searchFields.forEach((field) => {
      if (!data[field.name]) data.delete.push(field.name);
    });
    onSearch(data);
    if (type === "mobile") {
      onClose();
    }
  };

  function clearSearch() {
    const resetValues = searchFields.reduce((acc, field) => ({ ...acc, [field?.name]: "" }), {});
    reset(resetValues);
    const _newParams = { ...searchParams };
    _newParams.delete = [];
    searchFields.forEach((e) => {
      _newParams.delete.push(e?.name);
    });
    onSearch({ ..._newParams });
  }

  const clearAll = (mobileView) => {
    return (
      <LinkLabel className="inline" onClick={clearSearch}>
        {t("HR_COMMON_CLEAR_SEARCH")}
      </LinkLabel>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInput)}>
      <React.Fragment>
        <div className={isInboxPage ? "search-container w-auto ml-6" : "search-container w-auto"}>
          <div className="search-complaint-container">
            {(type === "mobile" || mobileView) && (
              <div className="complaint-header flex justify-between">
                <h2>{t("ES_COMMON_SEARCH_BY")}</h2>
                <span onClick={onClose}>
                  <CloseSvg />
                </span>
              </div>
            )}
            
            {/* Desktop Grid Layout */}
            {type === "desktop" && !mobileView ? (
              <div className="hrms-search-grid-container">
                {/* Row 1: Name, Mobile, Employee ID */}
                {searchFields
                  ?.filter((field) => field.type !== "dropdown")
                  ?.map((input) => (
                    <div key={input.name}>
                      <h4 className="h4 hrms-search-field-label">{input.label}</h4>
                      <div className="text-input undefined">
                        {input.type === "date" ? (
                          <Controller
                            render={(props) => <DatePicker date={props.value} onChange={props.onChange} />}
                            name={input.name}
                            control={control}
                            defaultValue={null}
                          />
                        ) : (
                          <div className="field-container">
                            {input?.componentInFront ? (
                              <span className="employee-card-input employee-card-input--front">
                                {input?.componentInFront}
                              </span>
                            ) : null}
                            <TextInput {...input} inputRef={register} watch={watch} shouldUpdate={true} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                {/* Row 2: Designation */}
                {searchFields
                  ?.filter((field) => field.type === "dropdown")
                  ?.map((input) => (
                    <div key={input.name}>
                      <h4 className="h4 hrms-search-field-label">{input.label}</h4>
                      <div className="text-input undefined">
                        <Controller
                          name={input.name}
                          control={control}
                          defaultValue={null}
                          render={(props) => (
                            <Dropdown
                              option={designationOptions}
                              selected={props.value}
                              select={props.onChange}
                              optionKey="i18text"
                              t={t}
                              placeholder={t("HR_SELECT_DESIGNATION") || "Select Designation"}
                            />
                          )}
                        />
                      </div>
                    </div>
                  ))}

                {/* Row 2: Search Button */}
                <div className="hrms-search-button-wrapper">
                  <button type="submit" className="hrms-search-submit-btn">
                    {t("ES_COMMON_SEARCH")}
                  </button>
                </div>

                {/* Row 2: Clear Search Button */}
                <div className="hrms-search-button-wrapper">
                  <button type="button" onClick={clearSearch} className="hrms-search-clear-btn">
                    {t("HR_COMMON_CLEAR_SEARCH")}
                  </button>
                </div>
              </div>
            ) : (
              /* Mobile Layout - Keep Original */
              <div className="complaint-input-container w-full text-left">
                {searchFields
                  ?.filter((e) => true)
                  ?.map((input, index) => (
                    <div key={input.name} className="input-fields">
                      <span className={"complaint-input"}>
                        <h4 className="h4">{input.label}</h4>
                        <div className="text-input undefined">
                          {input.type === "dropdown" ? (
                            <Controller
                              name={input.name}
                              control={control}
                              defaultValue={null}
                              render={(props) => (
                                <Dropdown
                                  option={designationOptions}
                                  selected={props.value}
                                  select={props.onChange}
                                  optionKey="i18text"
                                  t={t}
                                  placeholder={t("HR_SELECT_DESIGNATION") || "Select Designation"}
                                />
                              )}
                            />
                          ) : input.type === "date" ? (
                            <Controller
                              render={(props) => <DatePicker date={props.value} onChange={props.onChange} />}
                              name={input.name}
                              control={control}
                              defaultValue={null}
                            />
                          ) : (
                            <div className="field-container">
                              {input?.componentInFront ? (
                                <span className="employee-card-input employee-card-input--front">
                                  {input?.componentInFront}
                                </span>
                              ) : null}
                              <TextInput {...input} inputRef={register} watch={watch} shouldUpdate={true} />
                            </div>
                          )}
                        </div>
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        {(type === "mobile" || mobileView) && (
          <ActionBar className="clear-search-container">
            <button className="clear-search hrms-flex-item--1">
              {clearAll(mobileView)}
            </button>
            <SubmitBar label={t("HR_COMMON_SEARCH")} className="hrms-flex-item--1" submit={true} />
          </ActionBar>
        )}
      </React.Fragment>
    </form>
  );
};

export default SearchApplication;
