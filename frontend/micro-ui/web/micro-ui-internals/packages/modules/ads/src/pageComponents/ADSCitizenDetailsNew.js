import React, { useEffect } from "react";
import { TextInput, CardLabel, Dropdown, MobileNumber, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const ADSCitizenDetailsNew = ({ t, goNext, currentStepData }) => {
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

          <CardLabel>{`${t("ADVT_CHALLAN_UNDER_SECTION_122_123_SGST")}`}</CardLabel>
          <Controller
            control={control}
            name="SGST"
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

          <div style={{ marginTop: "20px" }}>
            <Controller
              control={control}
              name="selfDeclaration"
              render={(field) => (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <input
                    value={field.value}
                    type="checkbox"
                    id="selfDeclaration"
                    checked={field.value || false} // checkbox uses `checked`
                    onChange={(e) => field.onChange(e.target.checked)} // get boolean
                    onBlur={field.onBlur}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label htmlFor="selfDeclaration" style={{ fontSize: "14px", lineHeight: "1.5", cursor: "pointer" }}>
                    {t("BILLAMENDMENT_SELFDECLARATION_LABEL")}
                  </label>
                </div>
              )}
            />
            {/* <label>
              <div style={{ display: "flex", columnGap: "10px", alignItems: "center" }}>
                <Controller
                  control={control}
                  name="selfDeclaration"
                  render={(props) => (
                    <input
                      onChange={(e) => {
                        props.onChange(e.target.value);
                      }}
                      onBlur={(e) => {
                        props.onBlur(e);
                      }}
                      style={{ height: "20px", width: "20px" }}
                      type="checkbox"
                    />
                  )}
                />

                {`${t("BILLAMENDMENT_SELFDECLARATION_LABEL")}`}
              </div>
            </label> */}
          </div>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
        {/* <button type="submit">submit</button> */}
      </form>
    </React.Fragment>
  );
};

export default ADSCitizenDetailsNew;
