import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Label, SubmitBar, LinkLabel, ActionBar, CloseSvg, DatePicker, MobileNumber } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";

const SearchApplication = ({ onSearch, type, onClose, searchFields, searchParams, isInboxPage, defaultSearchParams }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, control } = useForm({
    defaultValues: searchParams,
  });
  const mobileView = window.Digit.Utils.browser.isMobile();

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

  const clearAll = (isMobileView) => {
    const mobileViewStyles = isMobileView ? { margin: 0 } : {};
    return (
      <LinkLabel style={{ display: "inline", ...mobileViewStyles }} onClick={clearSearch}>
        {t("CS_COMMON_CLEAR_SEARCH")}
      </LinkLabel>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInput)}>
      <React.Fragment>
        <div className="search-container" style={{ width: "auto", marginLeft: isInboxPage ? "24px" : "revert" }}>
          <div className="search-complaint-container mCollect-filter">
            {(type === "mobile" || mobileView) && (
              <div className="complaint-header" style={{ display: "flex", alignItems: "flex-start" }}>
                <h2>{t("ES_COMMON_SEARCH_BY")}</h2>
                <span onClick={onClose} style={{ cursor: "pointer" }}>
                  <CloseSvg />
                </span>
              </div>
            )} 
            <div className="complaint-input-container" style={{ width: "100%", textAlign: "start" }}>
              {searchFields?.map((input, index) => (
                <div key={input.name} className="input-fields">
                  <span key={index} className={"complaint-input"}>
                    <h4 className="h4">{input.label}</h4>
                    <div className="text-input  undefined">
                      {input.name === "mobileNumber" ? (
                        <div className="field-container">
                          <Controller
                            control={control}
                            name="mobileNumber"
                            rules={{ pattern: input.pattern, maxLength: input.maxlength }}
                            defaultValue={searchParams?.mobileNumber || ""}
                            render={(props) => (
                              <MobileNumber
                                onChange={props.onChange}
                                value={props.value}
                                componentInFront={<div className="employee-card-input employee-card-input--front">+91</div>}
                              />
                            )}
                          />
                        </div>
                      ) : input.type !== "date" ? (
                        <div className="field-container">
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
              {isInboxPage && (
                <div className="search-action-wrapper" style={{width: "100%"}}>
                  {type === "desktop" && !mobileView && (
                    <SubmitBar
                      className="submit-bar-search"
                      label={t("CS_INBOX_SEARCH")}
                      submit
                    />
                  )}
                  {type === "desktop" && !mobileView && (
                    <span style={{ paddingTop: "9px" }} className="clear-search">
                      {clearAll()}
                    </span>
                  )}
                </div>
              )}

              {type === "desktop" && !mobileView && !isInboxPage && (
                <div className="search-action-wrapper">
                  <SubmitBar className="submit-bar-search" label={t("CS_INBOX_SEARCH")} submit />
                  <div style={{ width: "100%", textAlign: "right", width: "240px", textAlign: "right", marginLeft: "96px", marginTop: "8px" }}>
                    {clearAll()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {(type === "mobile" || mobileView) && (
          <ActionBar className="clear-search-container">
            <button className="clear-search" style={{ flex: 1 }}>
              {clearAll(mobileView)}
            </button>
            <SubmitBar label={t("CS_INBOX_SEARCH")} style={{ flex: 1 }} submit={true} />
          </ActionBar>
        )}
      </React.Fragment>
    </form>
  );
};

export default SearchApplication;
