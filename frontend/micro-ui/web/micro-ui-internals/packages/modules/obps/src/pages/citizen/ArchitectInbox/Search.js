import React from "react";
import { useForm, Controller } from "react-hook-form";
import { TextInput, Label, SubmitBar, LinkLabel, ActionBar, CloseSvg, DatePicker, CardHeader } from "@mseva/digit-ui-react-components";

const Search = ({ onSearch, searchParams, searchFields, type, onClose, isInboxPage, t }) => {
  const { register, handleSubmit, formState, reset, watch, control } = useForm({
    defaultValues: searchParams,
  });
  const mobileView = innerWidth <= 640;
  const tenantId = Digit.ULBService.getCurrentTenantId();

  const getFields = (input) => {
    switch(input.type) {
      default:
        return (
          <Controller
            render={(props) => <TextInput onChange={props.onChange} value={props.value} />}
            name={input.name}
            control={control}
            defaultValue={null}
          />
        )
    }
  }

  const onSubmitInput = (data) => {
    onSearch(data);
    if (type === "mobile") {
      onClose();
    }
  }

  // const clearSearch = () => {
  //   reset({});
  //   onSearch({})
  // };

  function clearSearch() {
    const resetValues = searchFields.reduce((acc, field) => ({ ...acc, [field?.name]: "" }), {});
    reset(resetValues);
    const _newParams = { ...searchParams };
    _newParams.delete = [];
    searchFields.forEach((e) => {
      _newParams.delete.push(e?.name);
    });
    onSubmitInput({applicationNo:null});

  }

  const clearAll = (mobileView) => {
    const mobileViewStyles = mobileView ? { margin: 0 } : {};
    return (
      <LinkLabel style={{ ...mobileViewStyles }} onClick={clearSearch}>
        {t("ES_COMMON_CLEAR_SEARCH")}
      </LinkLabel>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmitInput)}>
      <div className="search-container" style={{  marginLeft: isInboxPage ? "24px" : "revert" }}>
        <div className="search-complaint-container">
          {(type === "mobile" || mobileView) && (
            <div className="complaint-header">
              <h2 className="obps-pages-citizen-architect-inbox-search--style-1">{t("BPA_SEARCH_BY_LABEL")}:</h2>
              <span onClick={onClose} className="obps-pages-citizen-architect-inbox-search--style-2">
                <CloseSvg />
              </span>

            </div>
          )}
          <div className={["complaint-input-container for-pt " + (!isInboxPage ? "for-search" : ""), "obps-pages-citizen-architect-inbox-search--style-3"].filter(Boolean).join(" ")} >
            {searchFields?.map((input, index) => (
              <div key={input.name} className="input-fields" style={mobileView?{marginTop:"30px"}:{}}>
                {/* <span className={index === 0 ? "complaint-input" : "mobile-input"}> */}
                <span className={"mobile-input"}>
                  <Label>{t(input.label) + ` ${input.isMendatory ? "*" : ""}`}</Label>
                  {getFields(input)}
                </span>
                {formState?.dirtyFields?.[input.name] ? (
                  <span

                    className="inbox-search-form-error obps-pages-citizen-architect-inbox-search--style-4"
                  >
                    {formState?.errors?.[input.name]?.message}
                  </span>
                ) : null}
              </div>
            ))}
            {type === "desktop" && <SubmitBar  className="submit-bar-search obps-pages-citizen-architect-inbox-search--style-5" label={t("ES_COMMON_SEARCH")} submit />}
            {type === "desktop" && !mobileView && (
                  <span  className="clear-search obps-pages-citizen-architect-inbox-search--style-6">
                    {clearAll()}
                  </span>
                )}
          </div>
        </div>
      </div>
      {(type === "mobile" || mobileView) && (
        <ActionBar className="clear-search-container">
          <button className="clear-search obps-pages-citizen-architect-inbox-search--style-7" >
            {clearAll(mobileView)}
          </button>
          <SubmitBar disabled={!!Object.keys(formState.errors).length} label={t("ES_COMMON_SEARCH")} className="obps-pages-citizen-architect-inbox-search--style-8" submit={true} />
        </ActionBar>
      )}
    </form>
  );
}

export default Search;
