import React, { useEffect } from "react";
import { TextInput, CardLabel, MobileNumber, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";

const OffenderDetails = ({ t, goNext, currentStepData }) => {
  const user = Digit.UserService.getUser();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.info?.name || "",
      emailId: user?.info?.emailId || "",
      mobileNumber: user?.info?.mobileNumber || "",
      address: "",
    },
  });

  const onSubmit = async (data) => {
    console.log("data", data);
    goNext(data);
  };

  useEffect(() => {
    if (currentStepData?.offenderDetails) {
      Object.entries(currentStepData?.offenderDetails)?.forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [currentStepData, setValue]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ width: "50%" }}>
          {/* <div style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("NOC_APPLICANT_EMAIL_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name="emailId"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^(?!\.)(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/,
                  message: "Invalid email format",
                },
              }}
              render={(props) => (
                <TextInput
                  style={{ marginBottom: 0 }}
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
            {errors?.emailId && <p style={{ color: "red" }}>{errors.emailId.message}</p>}
          </div> */}

          <div style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name="mobileNumber"
              rules={{
                required: "Mobile number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              }}
              render={(props) => (
                <MobileNumber
                  style={{ marginBottom: 0 }}
                  value={props.value}
                  onChange={props.onChange} // ✅ don't wrap it
                  onBlur={props.onBlur}
                  t={t}
                />
              )}
            />
            {errors?.mobileNumber && <p style={{ color: "red" }}>{errors.mobileNumber.message}</p>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Name is required",
                minLength: { value: 2, message: "Name must be at least 2 characters" },
              }}
              render={(props) => (
                <TextInput
                  style={{ marginBottom: 0 }}
                  value={props.value}
                  error={errors?.name?.message}
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
            {errors?.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("PT_COMMON_COL_ADDRESS")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <Controller
              control={control}
              name="address"
              rules={{
                required: "Address is required",
                minLength: { value: 5, message: "Address must be at least 5 characters" },
              }}
              render={(props) => (
                <TextArea
                  style={{ marginBottom: 0 }}
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
            {errors?.address && <p style={{ color: "red" }}>{errors.address.message}</p>}
          </div>
        </div>

        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default OffenderDetails;
