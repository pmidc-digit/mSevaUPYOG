import React, { useEffect } from "react";
import { TextInput, CardLabel, MobileNumber, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const PTRCitizenDetails = ({ t, goNext, currentStepData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { control, handleSubmit, setValue } = useForm();

  const onSubmit = (data) => {
    console.log("data in first step", data);
    goNext(data);
  };

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.ownerDetails;
    if (formattedData) {
      console.log("coming here", formattedData);
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <CardLabel>{`${t("NDC_FIRST_NAME")}`}</CardLabel>
          <Controller
            control={control}
            name="firstName"
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
              />
            )}
          />

          <CardLabel>{`${t("NDC_LAST_NAME")}`}</CardLabel>
          <Controller
            control={control}
            name="lastName"
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
              />
            )}
          />

          <CardLabel>{`${t("NOC_APPLICANT_EMAIL_LABEL")}`}</CardLabel>
          <Controller
            control={control}
            name="emailId"
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
              />
            )}
          />

          <CardLabel>{`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`}</CardLabel>
          <Controller
            control={control}
            name="mobileNumber"
            render={(props) => (
              <MobileNumber
                value={props.value}
                onChange={props.onChange} // ✅ don't wrap it
                onBlur={props.onBlur}
                t={t}
              />
            )}
          />

          <CardLabel>{`${t("PDF_STATIC_LABEL_CONSOLIDATED_TLAPP_FATHER_HUSBAND")}`}</CardLabel>
          <Controller
            control={control}
            name="fatherName"
            render={(props) => (
              <TextInput
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
              />
            )}
          />

          <CardLabel>{`${t("PT_COMMON_COL_ADDRESS")}`}</CardLabel>
          <Controller
            control={control}
            name="address"
            render={(props) => (
              <TextArea
                name="address"
                value={props.value}
                onChange={(e) => {
                  props.onChange(e.target.value);
                }}
                onBlur={(e) => {
                  props.onBlur(e);
                }}
                t={t}
              />
            )}
          />
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default PTRCitizenDetails;
