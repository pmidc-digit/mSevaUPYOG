import {
  ActionBar,
  CloseSvg,
  DatePicker,
  Label,
  LinkLabel,
  MobileNumber,
  SubmitBar,
  TextInput,
  Toast,
  Header,
  Dropdown
} from "@mseva/digit-ui-react-components";
import React, { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import BillGenieDetails from "../../pages/employee/BillGenieDetails";
import { set } from "lodash";
const fieldComponents = {
  date: DatePicker,
  mobileNumber: MobileNumber,
  dropdown: Dropdown
};

const SearchApplication = ({ onSearch, type, onClose, searchFields, searchParams, isInboxPage, onSearchData, defaultSearchParams, clearSearch: _clearSearch }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, watch, control, setError, clearErrors, formState } = useForm({
    defaultValues: searchParams,
  });
  const [showToast, setShowToast] = useState(null);

  const form = watch();
  const mobileView = innerWidth <= 640;

  const closeToast = () => {
    setShowToast(null);
  };
  setTimeout(() => {
    closeToast();
  }, 10000);

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
const [ulbValue,setUlbValue]=useState("")
// const [servValue,setServValue]=useState("")
  const onSubmitInput = (data) => {
  
   let servValue="";
    console.log("ho",data)

    searchFields.map((input)=>{
  if(input.name==="ulb"){
   setUlbValue(input?.selected?.code)
  }
  if(input.name==="serviceCategory"){
   servValue=input?.selected?.businesService
  }
      console.log("input",input)
    }
    )
    generateBills(servValue)

    
    // if (!searchParams.businesService) {
    //   setShowToast({ key: true, label: "ABG_SEARCH_SELECT_AT_LEAST_SERVICE_TOAST_MESSAGE" });
    //   return;
    // }

    // if (true) {
    //   if (!data.mobileNumber) {
    //     delete data.mobileNumber;
    //   }
    //   data.delete = [];
    //   searchFields.forEach((field) => {
    //     if (!data[field.name]) data.delete.push(field.name);
    //   });
    //   onSearch(data);
    //   if (type === "mobile") {
    //     onClose();
    //   }
    // }
  };

  function clearSearch() {
    const resetValues = searchFields.reduce((acc, field) => ({ ...acc, [field?.name]: ""

     }), {});
     console.log("reset",resetValues)
    reset(resetValues);
    const _newParams = { ...searchParams };
    _newParams.delete = [];
    searchFields.forEach((e) => {
      _newParams.delete.push(e?.name);
    });
    onSearch({ ..._newParams }, true);
    if (type === "mobile") {
      onClose();
    }
  }

  const clearAll = (mobileView) => {
    const mobileViewStyles = mobileView ? { margin: 0 } : {border:'2px solid'};
    return (
      <LinkLabel style={{ display: "inline", ...mobileViewStyles }} onClick={clearSearch}>
        {t("ABG_RESET_BUTTON")}
      </LinkLabel>
    );
  };

  const formValueEmpty = () => {
    let isEmpty = true;
    Object.keys(form).forEach((key) => {
      if (!["locality", "city"].includes(key) && form[key]) isEmpty = false;
    });

    if (searchFields?.find((e) => e.name === "locality") && !form?.locality?.code) isEmpty = true;
    return isEmpty;
  };


  // if (isLoading) {
  //   return <Loader />;
  // }
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const filters = {
    businesService: "FN.Advance_Provident_Fund",
    // tenantId:tenantId,
    url: "egov-searcher/bill-genie/mcollectbills/_get"
  }
  // let payload2={}
  // let response = Digit.Hooks.mcollect.useMcollectSearchBill({
  //   tenantId,
  //   filters


  // })
  async function generateBills(service) {
    console.log("in generate bill")

    const payload = {
      businesService: service,
      url: "egov-searcher/bill-genie/mcollectbills/_get"
    }
    console.log("tenantId", tenantId)
    console.log("payload", payload)
    Digit.MCollectService.search_bill(tenantId, payload)

      .then((response) => {
        console.log("response", response)
        console.log("response", response?.Bills)
        if (response?.ResponseInfo?.status === "200 OK" || response?.ResponseInfo?.status === "201 OK" || response?.ResponseInfo?.status === "successful") {
          if ((response.Bills).length===0) {
            alert("No Records found")
            return;
          }

          onSearchData(response?.Bills)

          alert("Bill generated")
        }
        else {
          // alert(response?.Errors?.message)
          console.log(response?.Errors?.message)
          onSearch({ key: true, label: response?.Errors?.message });
        }

      })
      .catch((err) => {

        onSearch({ key: true, label: err });
        console.log("Error in Digit.HRMSService.ssoAuthenticateUser: ", err.response);

      });

  }
  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmitInput)}>
        <div className="search-container" style={{ width: "auto", marginLeft: isInboxPage ? "24px" : "revert" }}>
          <div className="search-complaint-container">
            <Header>Search Bill</Header>
            <h2>Provide at least one parameter to search for an application</h2>
            {(type === "mobile" || mobileView) && (
              <div className="complaint-header" style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>{t("ES_COMMON_SEARCH_BY")}</h2>
                <span onClick={onClose}>
                  <CloseSvg />
                </span>
              </div>
            )}
            <div className="complaint-input-container" style={{ width: "100%", textAlign: "start" }}>
              {searchFields
                ?.filter((e) => true)
                ?.map((input, index) => (
                  <div key={input.name} className="input-fields">
                    <span className={"complaint-input"}>
                      <h4 className="h4">{t(input.label)}</h4>
                      <div className="text-input  undefined">
                        {!input.type ? (
                          <Controller
                            render={(props) => {

                              return (
                                <div className="field-container">
                                  {input?.componentInFront ? (
                                    <span className="employee-card-input employee-card-input--front" style={{ flex: "none" }}>
                                      {input?.componentInFront}
                                    </span>
                                  ) : null}
                                  <TextInput {...input} inputRef={register} watch={watch} shouldUpdate={true} />
                                </div>
                              );
                            }}
                            name={input.name}
                            control={control}
                            defaultValue={""}
                          />
                        ) : (
                          <Controller
                            render={(props) => {

                              const Comp = fieldComponents?.[input.type];
                              if (input.type === 'dropdown') {
                                return <Comp option={input.option} optionKey={"name"} value={input?.defaultValue || props.value} selected={input.selected} select={input.select} t={t} defaultValue={input.defaultValue} onChange={props.onChange}/>
                              }
                              return <Comp onChange={props.onChange} value={props.value} />;
                            }}
                            name={input.name}
                            control={control}
                            defaultValue={input?.defaultValue}
                          />
                        )}
                      </div>
                    </span>
                    {formState?.dirtyFields?.[input.name] ? (
                      <span
                        style={{ fontWeight: "700", color: "rgba(212, 53, 28)", paddingLeft: "8px", marginTop: "-20px", fontSize: "12px" }}
                        className="inbox-search-form-error"
                      >
                        {formState?.errors?.[input.name]?.message}
                      </span>
                    ) : null}
                  </div>
                ))}
              {type === "desktop" && !mobileView && !isInboxPage && (
                // <div className="search-action-wrapper">
                <div style={{display:"flex",justifyContent:"left",alignItems:"left"}}>
                  <button
                    //className="submit-bar-search"
                   // onClick={() => { generateBills() }}
                    style={{
                      marginTop: "55px",
                      marginRight:"10px",
                      border: "2px solid",
                      height: "50px",
                       width: "50%",
                      background: "grey",
                      color: "white",

                    }}
                  // disabled={!!Object.keys(formState.errors).length || Object.keys(form).every((key) => !form?.[key])}
                   submit
                  >
                    {t("ABG_SEARCH_BUTTON")}
                  </button>
                  <LinkLabel style={{marginTop:'55px',height:'46px',width:'50%',border:'2px solid #ff2c2c',color:'#ff2c2c',textAlign:'center',paddingTop:'8px'}} onClick={clearSearch}>
                  {t("ABG_RESET_BUTTON")}
                  </LinkLabel>
                </div>
              )}

            </div>
            {isInboxPage && (
              <div className="search-action-wrapper" style={{width: "100%"}}>
                {type === "desktop" && !mobileView && (
                  <SubmitBar
                    style={{ marginTop: "unset" }}
                    // disabled={!!Object.keys(formState.errors).length || Object.keys(form).every((key) => !form?.[key])}
                    className="submit-bar-search"
                    label={t("ABG_SEARCH_BUTTON")}
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
          </div>
        </div>
        {(type === "mobile" || mobileView) && (
          <ActionBar className="clear-search-container">
            <button className="clear-search" style={{ flex: 1 }}>
              {clearAll(mobileView)}
            </button>
            <SubmitBar label={t("ABG_SEARCH_BUTTON")} style={{ flex: 1 }} submit={true} />
          </ActionBar>
        )}
      </form>
      {showToast && <Toast error={showToast.key} label={t(showToast.label)} onClose={closeToast} />}
    </React.Fragment>
  );
};

export default SearchApplication;
