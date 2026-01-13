import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, Dropdown, MobileNumber, TextArea, ActionBar, SubmitBar } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { Loader } from "../components/Loader";
import CitizenConsent from "../components/CitizenConsent";

const CHBCitizenDetailsNew = ({ t, goNext, currentStepData, onGoBack }) => {
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const isCitizen = window.location.href.includes("citizen");
  const stateId = Digit.ULBService.getStateId();
  const user = Digit.UserService.getUser();
  const userInfoData = JSON.parse(sessionStorage.getItem("userInfoData") || "{}");
  const [loader, setLoader] = useState(false);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [getModalData, setModalData] = useState();
  const [getUser, setUser] = useState(null);
  const [getDisable, setDisable] = useState({ name: false, email: false, address: false });
  const [getShowOtp, setShowOtp] = useState(false);
  const { mobileNumber, emailId, name } = user?.info;
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    watch,
  } = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: (isCitizen && (userInfoData?.name || name)) || "",
      emailId: (isCitizen && (userInfoData?.emailId || emailId)) || "",
      mobileNumber: (isCitizen && (userInfoData?.mobileNumber || mobileNumber)) || "",
      address: (isCitizen && userInfoData?.permanentAddress) || "",
    },
  });

  const onSubmit = async (data) => {
    const isCitizenDeclared = sessionStorage.getItem("CitizenConsentdocFilestoreidCHB");

    if (currentStepData?.venueDetails?.[0]?.bookingNo) {
      goNext(currentStepData?.venueDetails);
      // onSubmitUpdate(currentStepData?.venueDetails?.[0], "INITIATE", data);
    } else {
      const baseApplication = currentStepData?.ownerDetails?.hallsBookingApplication || {};

      if (!isCitizenDeclared) {
        alert("Please upload Self Certificate");
        return;
      }

      // Construct owners array using "data"
      const applicantDetail = {
        tenantId: tenantId,
        applicantName: data?.name,
        applicantMobileNo: data?.mobileNumber,
        applicantEmailId: data?.emailId,
        // address: data?.address,
        type: user?.info?.type,
      };

      const additionalDetails = {
        ...baseApplication?.additionalDetails,
        disImage: isCitizenDeclared,
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
          purpose: {
            purpose: baseApplication?.purpose?.purpose?.name,
          },
          additionalDetails,
        },
      };
      // return;
      setLoader(true);
      try {
        const response = await Digit.CHBServices.create(payload);
        setLoader(false);
        goNext(response?.hallsBookingApplication);
      } catch (error) {
        setLoader(false);
      }
    }
  };

  useEffect(() => {
    const formattedData = currentStepData?.venueDetails?.[0];
    if (formattedData) {
      setValue("address", formattedData?.address?.addressLine1);
      setValue("emailId", formattedData?.applicantDetail?.applicantEmailId);
      setValue("mobileNumber", formattedData?.applicantDetail?.applicantMobileNo);
      setValue("name", formattedData?.applicantDetail?.applicantName);
    }
  }, [currentStepData, setValue]);

  const updateUser = async () => {
    const checkData = getValues();
    setLoader(true);
    const tenantId = "pb";
    const payload = {
      otp: {
        tenantId,
        mobileNumber: checkData?.mobileNumber || null,
        name: checkData?.name || null,
        emailId: checkData?.emailId || null,
        type: "register",
      },
    };

    try {
      const response = await Digit.UserService.sendOtp(payload, tenantId);
      setLoader(false);
      setShowOtp(true);
    } catch (err) {
      setLoader(false);
    }
  };

  const handleModalData = (e) => {
    if (!getUser && !isCitizen) {
      updateUser();
      // alert("first update user");
    }
    const mapData = currentStepData?.ownerDetails?.hallsBookingApplication;

    const payload = {
      address: getValues()?.address,
      emailId: getValues()?.emailId,
      mobileNumber: getValues()?.mobileNumber,
      name: getValues()?.name,
      communityHallName: mapData?.communityHallName,
      purpose: mapData?.purpose?.purpose,
      days: mapData?.bookingSlotDetails?.length,
      bookingDate: mapData?.bookingSlotDetails?.[0]?.bookingDate,
      bookingEndDate: mapData?.bookingSlotDetails?.at(-1)?.bookingEndDate,
      ulbName: mapData?.tenantId,
      security: 5000,
      rent: mapData?.amount,
    };

    setModalData(payload);
    if (e.target.checked) setShowTermsPopup(true);
  };

  const handleMobileChange = async (value) => {
    setLoader(true);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      // sessionStorage.setItem("CitizenConsentdocFilestoreidCHB", result?.filestoreIds[0]);
      sessionStorage.removeItem("CitizenConsentdocFilestoreidCHB");
      setUser(userData?.user?.[0]);
      if (userData?.user?.[0]) {
        setValue("name", userData.user[0].name);
        setValue("emailId", userData.user[0].emailId);
        setValue("address", userData.user[0].permanentAddress);
        clearErrors(["name", "emailId", "address"]);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  return (
    <React.Fragment>
      <form className="employeeCard" onSubmit={handleSubmit(onSubmit)}>
        <div className="card" style={{ width: "100%" }}>
          {/* mobile number */}
          <div className="label-field-pair" style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
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
                      setValue("name", "");
                      setValue("emailId", "");
                      setValue("address", "");
                      setUser("");
                      setShowOtp(false);
                      // ✅ updates react-hook-form
                      if (e.length === 10) {
                        handleMobileChange(e); // 🔥 only then fire API
                      }
                      // debouncedHandleMobileChange(e);
                    }}
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
              {errors?.mobileNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.mobileNumber.message}</p>}
            </div>
          </div>

          {/* name */}
          <div className="label-field-pair" style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
              <Controller
                control={control}
                name="name"
                rules={{
                  required: "Name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                }}
                render={(props) => (
                  <TextInput
                    value={props.value}
                    error={errors?.name?.message}
                    onChange={(e) => {
                      props.onChange(e.target.value);
                    }}
                    onBlur={(e) => {
                      props.onBlur(e);
                    }}
                    disabled={getUser?.name}
                    t={t}
                  />
                )}
              />
              {errors?.name && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.name.message}</p>}
            </div>
          </div>


          {/* email */}
          <div className="label-field-pair" style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("NOC_APPLICANT_EMAIL_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
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
                    disabled={getUser?.emailId}
                    t={t}
                  />
                )}
              />
              {errors?.emailId && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.emailId.message}</p>}
            </div>
          </div>

          <div className="label-field-pair" style={{ marginBottom: "20px" }}>
            <CardLabel>
              {`${t("PT_COMMON_COL_ADDRESS")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field" style={{ width: "100%" }}>
              <Controller
                control={control}
                name="address"
                rules={{
                  required: "Address is required",
                  minLength: { value: 5, message: "Address must be at least 5 characters" },
                }}
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
                    disabled={getUser?.permanentAddress}
                    t={t}
                  />
                )}
              />
              {errors?.address && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.address.message}</p>}
            </div>
          </div>

          {/* checkbox self declaration */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <Controller
              control={control}
              name="termsAccepted"
              rules={{ required: t("PLEASE_ACCEPT_TERMS_CONDITIONS") }}
              render={(props) => (
                <input
                  id="termsAccepted"
                  type="checkbox"
                  checked={props.value || false}
                  onChange={(e) => {
                    props.onChange(e.target.checked);
                    handleModalData(e);
                  }}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
              )}
            />
            <label htmlFor="termsAccepted" style={{ cursor: "pointer", color: "#007bff", textDecoration: "underline", margin: 0 }}>
              {t("CHB_SELF_LABEL")}
            </label>
          </div>
          {errors.termsAccepted && <p style={{ color: "red" }}>{errors.termsAccepted.message}</p>}
        </div>

        <ActionBar>
          <SubmitBar className="submit-bar-back" label="Back" onSubmit={onGoBack} />
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
        {/* <button type="submit">submit</button> */}
      </form>
      {showTermsPopup && (
        <CitizenConsent
          showTermsPopupOwner={showTermsPopup}
          setShowTermsPopupOwner={setShowTermsPopup}
          getModalData={getModalData}
          getUser={getUser}
          getShowOtp={getShowOtp}
          // otpVerifiedTimestamp={null} // Pass timestamp as a prop
          // bpaData={data?.applicationData} // Pass the complete BPA application data
          tenantId={tenantId} // Pass tenant ID for API calls
        />
      )}
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default CHBCitizenDetailsNew;
