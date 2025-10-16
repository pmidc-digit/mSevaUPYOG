import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, MobileNumber, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";

const CHBCitizenDetailsNew = ({ t, goNext, currentStepData, onGoBack }) => {
  const tenantId = window.location.href.includes("employee") ? Digit.ULBService.getCurrentPermanentCity() : localStorage.getItem("CITIZEN.CITY");
  const stateId = Digit.ULBService.getStateId();
  const user = Digit.UserService.getUser();
  const [loader, setLoader] = useState(false);

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

  const slotsSearch = async (data) => {
    const refData = data?.hallsBookingApplication?.[0];

    console.log("refData", refData);

    const payload = {
      tenantId: tenantId,
      communityHallCode: refData.communityHallCode,
      hallCode: refData?.bookingSlotDetails?.[0]?.hallCode,
      bookingStartDate: refData?.bookingSlotDetails?.[0]?.bookingDate,
      bookingEndDate: refData?.bookingSlotDetails?.[0]?.bookingEndDate,
      isTimerRequired: true,
      bookingId: refData?.bookingId,
    };
    console.log("payload", payload);

    try {
      const response = await Digit.CHBServices.slot_search({ filters: payload });
      goNext(data?.hallsBookingApplication);
      setLoader(false);
      return response;
    } catch (error) {
      setLoader(false);
    }
  };

  const onSubmit = async (data) => {
    setLoader(true);
    console.log("data", data);
    console.log("user", user);
    console.log("currentStepData", currentStepData);
    if (currentStepData?.venueDetails?.[0]?.bookingNo) {
      goNext(currentStepData?.venueDetails);
    } else {
      const baseApplication = currentStepData?.ownerDetails?.hallsBookingApplication || {};

      // Construct owners array using "data"
      const applicantDetail = {
        tenantId: tenantId,
        applicantName: data?.name,
        applicantMobileNo: data?.mobileNumber,
        applicantEmailId: data?.emailId,
        // address: data?.address,
        type: user?.info?.type,
      };

      const owners = [
        {
          name: data?.name,
          mobileNumber: data?.mobileNumber,
          emailId: data?.emailId,
          type: "CITIZEN",
        },
      ];

      const address = {
        addressLine1: data?.address,
        // cityCode: "SPF",
        // doorNo: "12B",
      };

      const payload = {
        hallsBookingApplication: {
          ...baseApplication,
          applicantDetail,
          address,
          owners,
        },
      };

      console.log("final payload", payload);
      // return;
      // goNext(payload);
      // return;\
      try {
        const response = await Digit.CHBServices.create(payload);
        console.log("response", response);
        // ⏳ Add 5-second delay before calling slotsSearch
        setTimeout(() => {
          slotsSearch(response); // loader will be turned off inside slotsSearch
        }, 10000);
        // slotsSearch(response);
        // setLoader(false);
        // goNext(response?.hallsBookingApplication);
      } catch (error) {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.venueDetails?.[0];
    if (formattedData) {
      setValue("address", formattedData?.address?.addressLine1);
    }
    // if (formattedData) {
    //   Object.entries(formattedData).forEach(([key, value]) => {
    //     setValue(key, value);
    //   });
    // }
  }, [currentStepData, setValue]);

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ width: "50%" }}>
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
          </div>

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
          <SubmitBar style={{ background: " white", color: "black", border: "1px solid", marginRight: "10px" }} label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
        {/* <button type="submit">submit</button> */}
      </form>
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default CHBCitizenDetailsNew;
