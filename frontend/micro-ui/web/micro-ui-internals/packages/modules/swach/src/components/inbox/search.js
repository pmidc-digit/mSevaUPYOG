import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TextInput, Label, SubmitBar, LinkLabel, ActionBar, CloseSvg } from "@mseva/digit-ui-react-components";

const SearchComplaint = ({ onSearch, type, onClose, searchParams }) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      serviceRequestId: searchParams?.search?.serviceRequestId || "",
      mobileNumber: searchParams?.search?.mobileNumber || "",
    },
  });

  const onSubmit = (data) => {
    const searchPayload = {};

    if (data.serviceRequestId) searchPayload.serviceRequestId = data.serviceRequestId;
    if (data.mobileNumber) searchPayload.mobileNumber = data.mobileNumber;

    onSearch(searchPayload);
    // if (data.serviceRequestId) {
    //   onSearch({ serviceRequestId: data.serviceRequestId });
    // } else if (data.mobileNumber) {
    //   onSearch({ mobileNumber: data.mobileNumber });
    // } else {
    //   onSearch({});
    // }

    if (type === "mobile") {
      onClose();
    }
  };

  function clearSearch() {
    reset();
    onSearch({});
  }

  const clearAll = () => {
    <LinkLabel className="clear-search-label" onClick={clearSearch}>
      {t("ES_COMMON_CLEAR_SEARCH")}
    </LinkLabel>;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ marginLeft: "24px" }}>
      <React.Fragment>
        <div className="search-container" style={{ width: "auto" }}>
          <div className="search-complaint-container">
            {type === "mobile" && (
              <div className="complaint-header">
                <span onClick={onClose}>
                  <CloseSvg />
                </span>
              </div>
            )}
            <div className="complaint-input-container" style={{ textAlign: "start" }}>
              <div className="input-fields">
                <span className="complaint-input">
                  <h4 className="h4">{t("CS_COMMON_COMPLAINT_NO")}.</h4>
                  <div className="text-input  undefined">
                    <TextInput
                      // {...register("serviceRequestId", {
                      //   pattern: {
                      //     value: /(?!^$)([^\s])/,
                      //     message: t("INVALID_COMPLAINT_NO"),
                      //   },
                      // })}
                      // style={{ marginBottom: "8px" }}
                      name="serviceRequestId"
                      placeholder="Complaint No."
                      // value={complaintNo}
                      // onChange={setComplaint}
                      inputRef={register({
                        pattern: /(?!^$)([^\s])/,
                      })}
                      style={{ marginBottom: "8px" }}
                    />
                  </div>
                  {errors.serviceRequestId && <p style={{ color: "red", fontSize: "12px" }}>{errors.serviceRequestId.message}</p>}
                </span>
              </div>
              <div className="input-fields">
                <span className="complaint-input">
                  <h4 className="h4">{t("CS_COMMON_MOBILE_NO")}.</h4>
                  <div className="text-input  undefined">
                    <TextInput
                      // {...register("mobileNumber", {
                      //   pattern: {
                      //     value: /^[6-9]\d{9}$/,
                      //     message: t("INVALID_MOBILE_NO"),
                      //   },
                      // })}
                      name="mobileNumber"
                      placeholder="Mobile No."
                      // value={mobileNo}
                      // onChange={setMobile}
                      inputRef={register({
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: "Invalid mobile number",
                        },
                      })}
                    />
                  </div>
                  {errors.mobileNumber && <p style={{ color: "red", fontSize: "12px" }}>{errors.mobileNumber.message}</p>}
                </span>
              </div>
              {type === "desktop" && (
                <div className="search-action-wrapper" style={{ width: "100%" }}>
                  <SubmitBar
                    className="submit-bar-search"
                    label={t("ES_COMMON_SEARCH")}
                    submit={true}
                    // disabled={Object.keys(errors).filter((i) => errors[i]).length}
                  />
                  <span className="clear-search" style={{ paddingTop: "9px" }}>
                    {clearAll()}
                  </span>
                </div>
              )}
          </div>
        </div>
        {type === "mobile" && (
          <ActionBar>
            <SubmitBar label="Search" submit={true} />
          </ActionBar>
        )}
          </div>
      </React.Fragment>
    
    </form>
  );
};

export default SearchComplaint;
