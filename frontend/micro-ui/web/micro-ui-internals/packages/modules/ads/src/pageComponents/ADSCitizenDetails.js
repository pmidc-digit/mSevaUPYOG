import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, MobileNumber, Card, CardSubHeader, LabelFieldPair, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import Timeline from "../components/ADSTimeline";
import ADSCartAndCancellationPolicyDetails from "../components/ADSCartAndCancellationPolicyDetails";
import { TimerValues } from "../components/TimerValues";

/*
 * The ADSCitizenDetails component is responsible for gathering and validating
 * applicant information, including name, mobile number, alternate number,
 * and email address. It provides a structured form step for user input.
 */

const ADSCitizenDetails = ({ t, config, onSelect, userType, formData, value = formData.adslist }) => {
  const { pathname: url } = useLocation();

  let index = window.location.href.charAt(window.location.href.length - 1);

  const user = Digit.UserService.getUser().info;
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const mutation = Digit.Hooks.ads.useADSCreateAPI();
  const [loader, setLoader] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      applicantName: (formData.applicant && formData.applicant[index] && formData.applicant[index].applicantName) ||
        formData?.applicant?.applicantName ||
        value?.existingDataSet?.applicant?.applicantName ||
        "",
      emailId: (formData.applicant && formData.applicant[index] && formData.applicant[index].emailId) ||
        formData?.applicant?.emailId ||
        value?.existingDataSet?.applicant?.emailId ||
        "",
      mobileNumber: (formData.applicant && formData.applicant[index] && formData.applicant[index].mobileNumber) ||
        value?.existingDataSet?.applicant?.mobileNumber ||
        formData?.applicant?.mobileNumber ||
        user?.mobileNumber ||
        "",
      alternateNumber: (formData.applicant && formData.applicant[index] && formData.applicant[index].alternateNumber) ||
        formData?.applicant?.alternateNumber ||
        value?.existingDataSet?.applicant?.alternateNumber ||
        "",
    },
  });

  const onSubmit = async (data) => {
    let applicantData = formData.applicant && formData.applicant[index];
    // Create the formdata object
    let cartDetails = value?.cartDetails.map((slot) => {
      return {
        addType: slot.addTypeCode,
        faceArea: slot.faceAreaCode,
        location: slot.locationCode,
        nightLight: slot.light,
        bookingDate: slot.bookingDate,
        bookingFromTime: "06:00",
        bookingToTime: "05:59",
        status: "BOOKING_CREATED",
      };
    });
    const formdata = {
      bookingApplication: {
        tenantId: tenantId,
        applicantDetail: {
          applicantName: data.applicantName,
          applicantMobileNo: data.mobileNumber,
          applicantAlternateMobileNo: data.alternateNumber,
          applicantEmailId: data.emailId,
        },
        cartDetails: cartDetails,
        bookingStatus: "BOOKING_CREATED",
      },
      isDraftApplication: true,
    };

    // Trigger the mutation
    setLoader(true);
    mutation.mutate(formdata, {
      onSuccess: (data) => {
        setLoader(false);
        const newDraftId = data?.bookingApplication[0]?.draftId;
        // Now, only execute the logic you want after the mutation is successful
        let applicantStep;
        if (userType === "citizen") {
          applicantStep = { ...applicantData, applicantName: data.applicantName, mobileNumber: data.mobileNumber, alternateNumber: data.alternateNumber, emailId: data.emailId, draftId: newDraftId };
          onSelect(config.key, { ...formData[config.key], ...applicantStep }, false, index);
        } else {
          applicantStep = { ...applicantData, applicantName: data.applicantName, mobileNumber: data.mobileNumber, alternateNumber: data.alternateNumber, emailId: data.emailId, draftId: newDraftId };
          onSelect(config.key, applicantStep, false, index);
        }
      },
      onError: () => {
        setLoader(false);
      },
    });
  };

  return (
    <React.Fragment>
      {window.location.href.includes("/citizen") ? <Timeline currentStep={1} /> : null}
      <Card>
        <div style={{ position: "relative" }}>
          <CardSubHeader style={{ position: "absolute", right: 0 }}>
            <TimerValues
              timerValues={value?.existingDataSet?.timervalue?.timervalue}
              SlotSearchData={value?.cartDetails}
              draftId={value?.existingDataSet?.draftId}
            />
          </CardSubHeader>
          <ADSCartAndCancellationPolicyDetails />
        </div>
      </Card>
      <form className="employeeCard" onSubmit={handleSubmit(onSubmit)}>
        <div className="card" style={{width: "100%"}}>
          {/* Applicant Name */}

          
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("ADS_APPLICANT_NAME")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="applicantName"
                rules={{
                  required: "Applicant name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                  pattern: { value: /^[a-zA-Z\s]+$/, message: "Name must contain only alphabetic characters" },
                }}
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
              {errors?.applicantName && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.applicantName.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Mobile Number */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("ADS_MOBILE_NUMBER")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
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
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                  />
                )}
              />
              {errors?.mobileNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.mobileNumber.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Alternate Mobile Number */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("ADS_ALT_MOBILE_NUMBER")}`}
            </CardLabel>
            <div className="form-field">
              <Controller
                control={control}
                name="alternateNumber"
                rules={{
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit mobile number",
                  },
                }}
                render={(props) => (
                  <MobileNumber
                    value={props.value}
                    onChange={(e) => {
                      props.onChange(e);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    t={t}
                  />
                )}
              />
              {errors?.alternateNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.alternateNumber.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Email ID */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("ADS_EMAIL_ID")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
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
              {errors?.emailId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.emailId.message}</p>}
            </div>
          </LabelFieldPair>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
    </React.Fragment>
  );
};

export default ADSCitizenDetails;
