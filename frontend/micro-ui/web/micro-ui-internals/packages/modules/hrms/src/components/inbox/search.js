import { ActionBar, CloseSvg, DatePicker, Label, LinkLabel, SubmitBar, TextInput } from "@mseva/digit-ui-react-components";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const SearchApplication = ({ onSearch, type, onClose, searchFields, searchParams, isInboxPage, defaultSearchParams }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, control } = useForm({
    defaultValues: searchParams,
  });
  const mobileView = innerWidth <= 640;
  const onSubmitInput = (data) => {
    if (!data.mobileNumber) {
      delete data.mobileNumber;
    }
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
            <div className="complaint-input-container w-full text-left">
              {searchFields
                ?.filter((e) => true)
                ?.map((input, index) => (
                  <div key={input.name} className="input-fields">
                    <span className={"complaint-input"}>
                      <h4 className="h4">{input.label}</h4>
                      <div className="text-input  undefined">
                        {input.type !== "date" ? (
                          <div className="field-container">
                            {input?.componentInFront ? (
                              <span className="employee-card-input employee-card-input--front">
                                {input?.componentInFront}
                              </span>
                            ) : null}
                            <TextInput {...input} inputRef={register} watch={watch} shouldUpdate={true} />
                          </div>
                        ) : (
                          <Controller
                            render={(props) => <DatePicker date={props.value} onChange={props.onChange} />}
                            name={input.name}
                            control={control}
                            defaultValue={null}
                          />
                        )}
                      </div>
                    </span>
                  </div>
                ))}
            </div>
            {isInboxPage && (
              <div className="search-action-wrapper hrms-w-full-form">
                {type === "desktop" && !mobileView && (
                  <SubmitBar
                    className="submit-bar-search mt-0"
                    // className="submit-bar-search"
                    label={t("ES_COMMON_SEARCH")}
                    submit
                  />
                )}
                {type === "desktop" && !mobileView && (
                  <span className="clear-search pt-2">
                    {clearAll()}
                  </span>
                )}
              </div>
            )}
            {type === "desktop" && !mobileView && !isInboxPage && (
              <div className="search-action-wrapper">
                <SubmitBar
                  className="submit-bar-search mt-0"
                  label={t("ES_COMMON_SEARCH")}
                  submit
                />
                <div className="w-60 text-right ml-24 mt-2">
                  {clearAll()}
                </div>
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
