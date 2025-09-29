import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, MobileNumber, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const CHBCitizenDetailsNew = ({ t, goNext, currentStepData, onGoBack }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();

  const { control, handleSubmit, setValue } = useForm();

  const onSubmit = (data) => {
    goNext(data);
  };

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.ownerDetails;
    if (formattedData) {
      Object.entries(formattedData).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <CardLabel>{`${t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")}`}</CardLabel>
          <Controller
            control={control}
            name="name"
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
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
        {/* <button type="submit">submit</button> */}
      </form>
    </React.Fragment>
  );
};

export default CHBCitizenDetailsNew;
