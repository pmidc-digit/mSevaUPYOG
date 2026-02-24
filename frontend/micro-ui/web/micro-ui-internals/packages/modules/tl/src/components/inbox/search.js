import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Label, SubmitBar, LinkLabel, ActionBar, CloseSvg, DatePicker, MobileNumber, Dropdown } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
// import MobileNumber from "@mseva/digit-ui-react-components/src/atoms/MobileNumber";
// import _ from "lodash";

const fieldComponents = {
  date: DatePicker,
  mobileNumber: MobileNumber,
};

const SearchApplication = ({ onSearch, type, onClose, searchFields, searchParams, isInboxPage, defaultSearchParams, clearSearch: _clearSearch, setSearchFieldsBackToOriginalState, setSetSearchFieldsBackToOriginalState }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, control, setError, clearErrors, formState, setValue } = useForm({
    defaultValues: searchParams,
  });

  const form = watch();

  const mobileView = innerWidth <= 640;
  const [justToResetSearchFieldsInCaseOfFilterTrigger, setSearchFieldsInCaseOfFilterTrigger] = useState([{applicationNumber: "", mobileNumber: ""}])

  useEffect(()=>{
    if(setSearchFieldsBackToOriginalState){
      setNotRemovedStateToSearchFields()
      setTimeout(setSetSearchFieldsBackToOriginalState(false), 1000)
    }
  },[setSearchFieldsBackToOriginalState])

  const setNotRemovedStateToSearchFields = () => {
    if(Array.isArray(justToResetSearchFieldsInCaseOfFilterTrigger))
    {
      let [{applicationNumber, mobileNumber}] = justToResetSearchFieldsInCaseOfFilterTrigger
      setValue("applicationNumber", applicationNumber)
      setValue("mobileNumber", mobileNumber)
    }
    else
    {
      let {applicationNumber, mobileNumber} = justToResetSearchFieldsInCaseOfFilterTrigger
      setValue("applicationNumber", applicationNumber)
      setValue("mobileNumber", mobileNumber)
    }
  }

  useEffect(() => {
    searchFields.forEach(({ pattern, name, maxLength, minLength, errorMessages, ...el }) => {
      const value = form[name];
      const error = formState.errors[name];
      if (pattern) {
        if (!new RegExp(pattern).test(value) && !error)
          setError(name, { type: "pattern", message: t(errorMessages?.pattern) || t(`PATTERN_${name.toUpperCase()}_FAILED`) });
        else if (new RegExp(pattern).test(value) && error?.type === "pattern") clearErrors([name]);
      }
      if (minLength) {
        if (value?.length < minLength && !error)
          setError(name, { type: "minLength", message: t(errorMessages?.minLength || `MINLENGTH_${name.toUpperCase()}_FAILED`) });
        else if (value?.length >= minLength && error?.type === "minLength") clearErrors([name]);
      }
      if (maxLength) {
        if (value?.length > maxLength && !error)
          setError(name, { type: "maxLength", message: t(errorMessages?.maxLength || `MAXLENGTH_${name.toUpperCase()}_FAILED`) });
        else if (value?.length <= maxLength && error?.type === "maxLength") clearErrors([name]);
      }
    });
  }, [form, formState, setError, clearErrors]);

  // Clear locality validation error when locality filter is selected
  useEffect(() => {
    const filterLocality = searchParams?.filters?.pgrQuery?.locality;
    if (filterLocality && formState.errors?.ownerName?.type === "locality") {
      clearErrors(["ownerName"]);
    }
  }, [searchParams?.filters?.pgrQuery?.locality]);

  const onSubmitInput = (data) => {
    if(data.mobileNumber?.length==0||data.mobileNumber?.length==10){
    if (!data.mobileNumber) {
      delete data.mobileNumber;
    }

    // Validate: owner name search requires locality filter to be selected
    if (data.ownerName && data.ownerName.trim()) {
      const filterLocality = searchParams?.filters?.pgrQuery?.locality;
      if (!filterLocality) {
        setError("ownerName", { type: "locality", message: t("TL_OWNER_NAME_REQUIRES_LOCALITY") });
        return;
      }
    }

    // Handle dropdown fields — extract code value
    searchFields.forEach((field) => {
      if (field.type === "dropdown" && data[field.name] && typeof data[field.name] === "object") {
        data[field.name] = data[field.name].code;
      }
    });

    // Handle date fields — convert to epoch
    if (data.fromDate) {
      data.fromDate = new Date(data.fromDate).getTime();
    }
    if (data.toDate) {
      const toDateObj = new Date(data.toDate);
      toDateObj.setHours(23, 59, 59, 999);
      data.toDate = toDateObj.getTime();
    }

    const mobileNumber = data?.mobileNumber
    const applicationNumber = data?.applicationNumber
    setSearchFieldsInCaseOfFilterTrigger({mobileNumber, applicationNumber})
    data.delete = [];

    searchFields.forEach((field) => {
      if (!data[field.name]) data.delete.push(field.name);
    });

    onSearch(data);
    if (type === "mobile") {
      onClose();
    }
  }
  };

  function clearSearch() {
    const resetValues = searchFields.reduce((acc, field) => ({ ...acc, [field?.name]: "" }), {});
    reset(resetValues);
    if (isInboxPage) {
      const _newParams = { ...searchParams };
      _newParams.delete = [];
      searchFields.forEach((e) => {
        _newParams.delete.push(e?.name);
      });
      setSearchFieldsInCaseOfFilterTrigger({applicationNumber: "", mobileNumber: ""});
      onSearch({ ..._newParams });
    } else {
      _clearSearch();
    }
  }

  const clearAll = (mobileView) => {
    const mobileViewStyles = mobileView ? { margin: 0 } : {};
    return (
      <LinkLabel style={{ display: "inline", ...mobileViewStyles }} onClick={clearSearch}>
        {t("ES_COMMON_NEW_CLEAR_SEARCH")}
      </LinkLabel>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInput)}>
      <React.Fragment>
        <div className={`search-container TL-search-wAuto${isInboxPage ? " TL-search-ml-24" : ""}`}>
          <div className="search-complaint-container">
            {(type === "mobile" || mobileView) && (
              <div className="complaint-header">
                <h2>{t("ES_COMMON_SEARCH_BY")}</h2>
                <span onClick={onClose}>
                  <CloseSvg />
                </span>
              </div>
            )}
            <div className="complaint-input-container TL-text-start">
              {searchFields
                ?.filter((e) => true)
                ?.map((input, index) => (
                  <div key={input.name} className="input-fields">
                    <span className={"complaint-input"}>
                      <Label>{t(input.label)}</Label>
                      {input.type === "dropdown" ? (
                        <Controller
                          render={(props) => (
                            <Dropdown
                              option={input.options}
                              selected={props.value}
                              select={(val) => props.onChange(val)}
                              optionKey={input.optionKey || "i18nKey"}
                              t={t}
                              placeholder={input.placeholder}
                            />
                          )}
                          name={input.name}
                          control={control}
                          defaultValue={null}
                        />
                      ) : input.type === "date" ? (
                        <Controller
                          render={(props) => (
                            <DatePicker
                              date={props.value}
                              onChange={props.onChange}
                            />
                          )}
                          name={input.name}
                          control={control}
                          defaultValue={""}
                        />
                      ) : !input.type ? (
                        <Controller
                          render={(props) => {
                            return <TextInput onChange={props.onChange} value={props.value} placeholder={input.placeholder}/>;
                          }}
                          name={input.name}
                          control={control}
                          defaultValue={""}
                        />
                      ) : (
                        <Controller
                          render={(props) => {
                            const Comp = fieldComponents?.[input.type];
                            return <Comp onChange={props.onChange} value={props.value} placeholder={input.placeholder}/>;
                          }}
                          name={input.name}
                          control={control}
                          defaultValue={""}
                        />
                      )}
                    </span>
                    {formState?.dirtyFields?.[input.name] ? (
                      <span
                        className="inbox-search-form-error TL-search-error"
                      >
                        {formState?.errors?.[input.name]?.message}
                      </span>
                    ) : null}
                  </div>
                ))}
              {type === "desktop" && !mobileView && !isInboxPage && (
                <div className="search-action-wrapper">
                  <SubmitBar
                    className="submit-bar-search"
                    label={t("ES_COMMON_SEARCH")}
                    disabled={!!Object.keys(formState.errors).length || Object.keys(form).every((key) => !form?.[key])}
                    submit
                  />
                  {/* style={{ paddingTop: "16px", textAlign: "center" }} className="clear-search" */}
                  <div className="TL-search-clear-wrapper">
                    {clearAll()}
                  </div>
                </div>
              )}
              {isInboxPage && (
                <div className="search-action-wrapper TL-w-full">
                  {type === "desktop" && !mobileView && (
                    <SubmitBar
                      className="submit-bar-search"
                      label={t("ES_COMMON_SEARCH")}
                      submit
                    />
                  )}
                  {type === "desktop" && !mobileView && (
                    <span className="clear-search TL-pt-9">
                      {clearAll()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {(type === "mobile" || mobileView) && (
          <ActionBar className="clear-search-container">
            <button className="clear-search TL-flex-1">
              {clearAll(mobileView)}
            </button>
            <SubmitBar disabled={!!Object.keys(formState.errors).length} label={t("ES_COMMON_SEARCH")} style={{ flex: 1 }} submit={true} />
          </ActionBar>
        )}
      </React.Fragment>
    </form>
  );
};

export default SearchApplication;