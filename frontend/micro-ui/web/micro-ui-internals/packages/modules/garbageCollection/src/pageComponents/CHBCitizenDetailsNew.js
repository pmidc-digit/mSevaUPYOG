import React, { useEffect, useState } from "react";
import { TextInput, CardLabel, MobileNumber, TextArea, ActionBar, SubmitBar, LabelFieldPair } from "@mseva/digit-ui-react-components";
import { Controller, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { UPDATE_GarbageApplication_FORM } from "../../redux/action/GarbageApplicationActions";
import { Loader } from "../components/Loader";

const CHBCitizenDetailsNew = ({ t, goNext, currentStepData, onGoBack }) => {
  const dispatch = useDispatch();
  const isCitizen = window.location.href.includes("citizen");
  const user = Digit.UserService.getUser();
  const tenantId = window.location.href.includes("citizen")
    ? window.localStorage.getItem("CITIZEN.CITY")
    : window.localStorage.getItem("Employee.tenant-id");
  const userInfoData = JSON.parse(sessionStorage.getItem("userInfoData") || "{}");

  const history = useHistory();
  const [loader, setLoader] = useState(false);

  const pathname = history?.location?.pathname || "";
  const applicationNumber = pathname?.split("/").pop(); // ✅ Extracts the last segment

  console.log("applicationNumber", applicationNumber);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
    clearErrors,
  } = useForm({
    defaultValues: {
      name: (isCitizen && userInfoData?.name) || "",
      emailId: (isCitizen && userInfoData?.emailId) || "",
      mobileNumber: (isCitizen && userInfoData?.mobileNumber) || "",
      address: (isCitizen && userInfoData?.permanentAddress) || "",
    },
  });

  const fetchChallans = async (filters) => {
    setLoader(true);
    try {
      const responseData = await Digit.GCService.search({ tenantId, filters });
      console.log("search ", responseData);
      dispatch(UPDATE_GarbageApplication_FORM("apiResponseData", responseData?.GarbageConnection?.[0]));
      // setChallanData(responseData?.GarbageConnection?.[0]);
      setLoader(false);
    } catch (error) {
      console.log("error", error);
      setLoader(false);
    }
  };

  useEffect(() => {
    console.log("tes===", applicationNumber);
    if (applicationNumber) {
      console.log("here");
      const filters = {};
      filters.applicationNumber = applicationNumber;
      fetchChallans(filters);
    }
  }, [applicationNumber]);

  const onSubmit = async (data) => {
    console.log("data===", data);
    goNext(data);
  };

  useEffect(() => {
    console.log("currentStepData", currentStepData);
    const formattedData = currentStepData?.ownerDetails;
    const apiRes = currentStepData?.apiResponseData;
    if (formattedData) {
      setValue("address", formattedData?.address);
      setValue("emailId", formattedData?.emailId);
      setValue("mobileNumber", formattedData?.mobileNumber);
      setValue("name", formattedData?.name);
    }
    if (apiRes) {
      setValue("address", apiRes?.connectionHolders?.[0]?.permanentAddress);
      setValue("emailId", apiRes?.connectionHolders?.[0]?.emailId);
      setValue("mobileNumber", apiRes?.connectionHolders?.[0]?.mobileNumber);
      setValue("name", apiRes?.connectionHolders?.[0]?.name);
    }
  }, [currentStepData, setValue]);

  const handleMobileChange = async (value) => {
    setLoader(true);
    try {
      const userData = await Digit.UserService.userSearch(tenantId, { userName: value, mobileNumber: value, userType: "CITIZEN" }, {});
      console.log("userData", userData);
      if (userData?.user?.[0]) {
        setValue("name", userData.user[0].name);
        setValue("emailId", userData.user[0].emailId);
        setValue("address", userData.user[0].permanentAddress);
        clearErrors(["name", "emailId"]);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
    }
  };

  // const isCitizen = window.location.href.includes("citizen");

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ maxWidth: !isCitizen ? "100%" : "100%" }}>
          {/* Mobile Number */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_APPLICANT_MOBILE_NO_LABEL")}`} <span style={{ color: "red" }}>*</span>
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
                      setValue("name", "");
                      if (e.length === 10) {
                        handleMobileChange(e);
                      }
                    }}
                    onBlur={props.onBlur}
                    t={t}
                  />
                )}
              />
              {errors?.mobileNumber && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.mobileNumber.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Name */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("BPA_BASIC_DETAILS_APPLICATION_NAME_LABEL")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
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
                    t={t}
                  />
                )}
              />
              {errors?.name && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.name.message}</p>}
            </div>
          </LabelFieldPair>

          {/* Email */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("NOC_APPLICANT_EMAIL_LABEL")}`} <span style={{ color: "red" }}>*</span>
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

          {/* Address */}
          <LabelFieldPair>
            <CardLabel className="card-label-smaller">
              {`${t("PT_COMMON_COL_ADDRESS")}`} <span style={{ color: "red" }}>*</span>
            </CardLabel>
            <div className="form-field">
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
                    t={t}
                  />
                )}
              />
              {errors?.address && <p style={{ color: "red", marginTop: "4px", marginBottom: "0" }}>{errors.address.message}</p>}
            </div>
          </LabelFieldPair>
        </div>
        <ActionBar>
          <SubmitBar label="Next" submit="submit" />
        </ActionBar>
      </form>
      {loader && <Loader page={true} />}
    </React.Fragment>
  );
};

export default CHBCitizenDetailsNew;
