import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Label, SubmitBar, LinkLabel, ActionBar, CloseSvg, DatePicker, MobileNumber } from "@mseva/digit-ui-react-components";
import { useTranslation } from "react-i18next";
// import _ from "lodash";

const SearchApplication = ({ onSearch, type, onClose, searchParams, isInboxPage, defaultSearchParams }) => {
  const { t } = useTranslation();

  const searchFields = [
  {
    label: t("APPLICATION_NUMBER"),
    name: "applicationNumber"
  },
  {
    label: t("UC_MOBILE_NO_LABEL"),
    name: "mobileNumber",
    maxlength: 10,
    pattern: "[6-9][0-9]{9}",
    title: t("ES_SEARCH_APPLICATION_MOBILE_INVALID"),
    componentInFront: "+91"
  }];


  const { register, handleSubmit, reset, watch, control } = useForm({
    defaultValues: searchParams
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
      <LinkLabel className={`ral-inbox-search__clear-link${mobileView ? " ral-inbox-search__clear-link--mobile" : ""}`} onClick={clearSearch}>
        {t("CS_COMMON_CLEAR_SEARCH")}
      </LinkLabel>);

  };

  return (
    <form onSubmit={handleSubmit(onSubmitInput)}>
      <React.Fragment>
        <div className={`search-container ral-inbox-search${isInboxPage ? " ral-inbox-search--inbox" : ""}`}>
          <div className="search-complaint-container">
            {(type === "mobile" || mobileView) &&
            <div className="complaint-header">
                <h2>{t("ES_COMMON_SEARCH_BY")}</h2>
                <span onClick={onClose}>
                  <CloseSvg />
                </span>
              </div>
            }
            <div
              className={"complaint-input-container for-pt ral-inbox-search__fields " + (!(type === "desktop" && !mobileView) ? "for-search" : "")}>

              {searchFields?.map((input, index) =>
              <div key={input.name} className="input-fields">
                  <span key={index} className={"complaint-input"}>
                    <Label>{input.label}</Label>
                    {input.name === "mobileNumber" ?
                  <div className="field-container">
                        <MobileNumber
                      name="mobileNumber"
                      inputRef={register({
                        minLength: {
                          value: 10,
                          message: t("CORE_COMMON_MOBILE_ERROR")
                        },
                        maxLength: {
                          value: 10,
                          message: t("CORE_COMMON_MOBILE_ERROR")
                        },
                        pattern: {
                          value: /[6789][0-9]{9}/,
                          message: t("CORE_COMMON_MOBILE_ERROR")
                        }
                      })}
                      type="number"
                      componentInFront={<div className="employee-card-input employee-card-input--front">+91</div>} />

                      </div> :
                  input.type !== "date" ?
                  <div className="field-container">
                        {input?.componentInFront ?
                    <span className="citizen-card-input citizen-card-input--front ral-style-16b4c2d840">
                            {input?.componentInFront}
                          </span> :
                    null}
                        <TextInput {...input} inputRef={register} watch={watch} shouldUpdate={true} />
                      </div> :

                  <Controller
                    render={(props) => <DatePicker date={props.value} onChange={props.onChange} />}
                    name={input.name}
                    control={control}
                    defaultValue={null} />

                  }
                  </span>
                </div>
              )}
              {type === "desktop" && !mobileView && isInboxPage &&
              <div className="search-action-wrapper ral-style-cad980f4b7">
                  <SubmitBar className="submit-bar-search" label={t("CS_INBOX_SEARCH")} submit />
                  <span className="clear-search ral-style-ba53c25006">
                    {clearAll()}
                  </span>
                </div>
              }

              {type === "desktop" && !mobileView && !isInboxPage &&
              <div className="search-action-wrapper">
                  <SubmitBar className="submit-bar-search" label={t("CS_INBOX_SEARCH")} submit />
                  <div className="ral-style-705874e93f">
                    {clearAll()}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
        {(type === "mobile" || mobileView) &&
        <ActionBar className="clear-search-container">
            <button className="clear-search ral-style-7623f05545">
              {clearAll(mobileView)}
            </button>
            <SubmitBar label={t("CS_INBOX_SEARCH")} submit={true} className="ral-style-7623f05545" />
          </ActionBar>
        }
      </React.Fragment>
    </form>);

};

export default SearchApplication;
